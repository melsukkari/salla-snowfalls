<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Feed/blog discovery pings: WebSub (instant feed push to Google's hub and
 * others) and classic XML-RPC weblogUpdates (Ping-O-Matic & friends, which
 * feed news aggregators and blog search engines).
 */
class ASP_Pings {

    public static function init() {
        if ( ASP_Options::get( 'asp_websub_enabled' ) ) {
            add_action( 'rss2_head', [ __CLASS__, 'rss_hub_link' ] );
            add_action( 'atom_head', [ __CLASS__, 'atom_hub_link' ] );
        }
    }

    public static function hub_links() {
        return ASP_Options::lines( 'asp_websub_hubs' );
    }

    public static function rss_hub_link() {
        foreach ( self::hub_links() as $hub ) {
            echo '<atom:link rel="hub" href="' . esc_url( $hub ) . '" />' . "\n";
        }
    }

    public static function atom_hub_link() {
        foreach ( self::hub_links() as $hub ) {
            echo '<link rel="hub" href="' . esc_url( $hub ) . '" />' . "\n";
        }
    }

    public static function feed_urls() {
        $feeds = [ get_bloginfo( 'rss2_url' ), get_bloginfo( 'atom_url' ) ];
        return array_values( array_unique( array_filter( $feeds ) ) );
    }

    /** @return true|WP_Error */
    public static function websub() {
        $hubs = self::hub_links();
        if ( ! $hubs ) return 'skip';

        $body = 'hub.mode=publish';
        foreach ( self::feed_urls() as $feed ) {
            $body .= '&hub.url=' . rawurlencode( $feed );
        }

        $ok = 0; $errors = [];
        foreach ( $hubs as $hub ) {
            $r = wp_remote_post( $hub, [
                'headers' => [ 'Content-Type' => 'application/x-www-form-urlencoded' ],
                'body'    => $body,
                'timeout' => 10,
            ] );
            $code = is_wp_error( $r ) ? 0 : wp_remote_retrieve_response_code( $r );
            if ( $code >= 200 && $code < 300 ) { $ok++; }
            else { $errors[] = $hub . ' → ' . ( is_wp_error( $r ) ? $r->get_error_message() : "HTTP $code" ); }
        }
        return $ok ? true : new WP_Error( 'websub_error', implode( '; ', $errors ) );
    }

    /** @return true|WP_Error */
    public static function xmlrpc() {
        $services = ASP_Options::lines( 'asp_xmlrpc_services' );
        if ( ! $services ) return 'skip';

        $name = get_bloginfo( 'name' );
        $home = home_url( '/' );
        $rss  = get_bloginfo( 'rss2_url' );
        $xml  = '<?xml version="1.0"?><methodCall><methodName>weblogUpdates.extendedPing</methodName><params>'
              . '<param><value><string>' . esc_html( $name ) . '</string></value></param>'
              . '<param><value><string>' . esc_html( $home ) . '</string></value></param>'
              . '<param><value><string>' . esc_html( $home ) . '</string></value></param>'
              . '<param><value><string>' . esc_html( $rss ) . '</string></value></param>'
              . '</params></methodCall>';

        $ok = 0; $errors = [];
        foreach ( $services as $svc ) {
            $r = wp_remote_post( $svc, [
                'headers' => [ 'Content-Type' => 'text/xml; charset=utf-8' ],
                'body'    => $xml,
                'timeout' => 10,
            ] );
            if ( is_wp_error( $r ) ) { $errors[] = $svc . ' → ' . $r->get_error_message(); continue; }
            $code = wp_remote_retrieve_response_code( $r );
            $body = preg_replace( '/\s+/', '', wp_remote_retrieve_body( $r ) );
            $flerror = strpos( $body, '<name>flerror</name><value><boolean>1' ) !== false;
            if ( $code === 200 && ! $flerror ) { $ok++; }
            else { $errors[] = $svc . ' → ' . ( $flerror ? 'service reported error' : "HTTP $code" ); }
        }
        return $ok ? true : new WP_Error( 'xmlrpc_error', implode( '; ', $errors ) );
    }
}
