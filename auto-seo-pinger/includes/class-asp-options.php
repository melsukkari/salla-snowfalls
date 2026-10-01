<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Central option defaults for the v2 engine/AI features.
 */
class ASP_Options {

    public static function defaults() {
        return [
            'asp_ping_on_update'     => 1,
            'asp_debounce_seconds'   => 300,
            'asp_indexnow_enabled'   => 1,
            'asp_websub_enabled'     => 1,
            'asp_websub_hubs'        => "https://pubsubhubbub.appspot.com/\nhttps://pubsubhubbub.superfeedr.com/",
            'asp_xmlrpc_enabled'     => 1,
            'asp_xmlrpc_services'    => "http://rpc.pingomatic.com/\nhttp://ping.feedburner.com/\nhttp://rpc.twingly.com/",
            'asp_google_indexing'    => 0,
            'asp_gsc_property'       => '',
            'asp_news_sitemap'       => 1,
            'asp_news_publication'   => '',
            'asp_news_post_types'    => [ 'post' ],
            'asp_schema_mode'        => 'auto',
            'asp_schema_type'        => 'NewsArticle',
            'asp_schema_faq'         => 1,
            'asp_llms_txt'           => 1,
            'asp_ai_bots'            => 'allow',
        ];
    }

    public static function get( $key ) {
        $d = self::defaults();
        return get_option( $key, $d[ $key ] ?? '' );
    }

    public static function lines( $key ) {
        $out = [];
        foreach ( preg_split( '/\R/', (string) self::get( $key ) ) as $line ) {
            $line = trim( $line );
            if ( $line !== '' ) $out[] = $line;
        }
        return $out;
    }

    public static function post_types() {
        return array_filter( (array) get_option( 'asp_post_types', [ 'post' ] ) );
    }

    /** Stable IndexNow key (8-128 hex chars), generated on first use. */
    public static function indexnow_key() {
        $key = get_option( 'asp_indexnow_key' );
        if ( ! $key ) {
            $key = bin2hex( random_bytes( 16 ) );
            update_option( 'asp_indexnow_key', $key );
        }
        return $key;
    }
}
