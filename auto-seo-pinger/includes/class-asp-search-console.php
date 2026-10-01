<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Search_Console {

    const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    const SITEMAP_API  = 'https://www.googleapis.com/webmasters/v3/sites/%s/sitemaps/%s';

    /**
     * Submit a URL to Google's Indexing API (fastest indexing path).
     *
     * @param  WP_Post $post
     * @return true|WP_Error
     */
    public static function submit_url( $post, $type = 'URL_UPDATED' ) {
        $access_token = ASP_Google_Auth::get_access_token();
        if ( is_wp_error( $access_token ) ) return $access_token;

        $url      = get_permalink( $post->ID );
        $response = wp_remote_post( self::INDEXING_API, [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type'  => 'application/json',
            ],
            'body' => wp_json_encode( [
                'url'  => $url,
                'type' => $type,
            ] ),
            'timeout' => 15,
        ] );

        return self::parse_response( $response, 'indexing_api', $post->ID );
    }

    /**
     * Submit core + news sitemaps to Search Console.
     *
     * @return true|WP_Error
     */
    public static function submit_sitemaps() {
        $access_token = ASP_Google_Auth::get_access_token();
        if ( is_wp_error( $access_token ) ) return $access_token;

        $property = ASP_Options::get( 'asp_gsc_property' ) ?: trailingslashit( home_url() );
        $maps     = [ get_sitemap_url( 'index' ) ?: home_url( '/sitemap_index.xml' ) ];
        if ( ASP_Options::get( 'asp_news_sitemap' ) ) $maps[] = ASP_News_Sitemap::url();

        $errors = [];
        foreach ( $maps as $map ) {
            $r = wp_remote_request( sprintf( self::SITEMAP_API, rawurlencode( $property ), rawurlencode( $map ) ), [
                'method' => 'PUT', 'headers' => [ 'Authorization' => 'Bearer ' . $access_token ], 'timeout' => 15,
            ] );
            $res = self::parse_response( $r, 'sitemap_submit' );
            if ( is_wp_error( $res ) ) $errors[] = $map . ' → ' . $res->get_error_message();
        }
        return $errors ? new WP_Error( 'sitemap_error', implode( '; ', $errors ) ) : true;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static function parse_response( $response, $action, $post_id = 0 ) {
        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code < 200 || $code >= 300 ) {
            $msg = $body['error']['message'] ?? "HTTP $code";
            return new WP_Error( $action . '_error', $msg );
        }

        return true;
    }
}
