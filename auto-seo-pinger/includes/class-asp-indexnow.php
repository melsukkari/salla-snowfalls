<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * IndexNow: one submission notifies Bing, Yandex, Naver, Seznam, Yep and
 * every other participating engine (https://www.indexnow.org).
 */
class ASP_IndexNow {

    const ENDPOINT = 'https://api.indexnow.org/indexnow';

    public static function init() {
        ASP_Router::register( ASP_Options::indexnow_key() . '.txt', [ __CLASS__, 'serve_key' ] );
    }

    public static function serve_key() {
        status_header( 200 );
        header( 'Content-Type: text/plain; charset=utf-8' );
        echo ASP_Options::indexnow_key();
    }

    public static function key_location() {
        return home_url( '/' . ASP_Options::indexnow_key() . '.txt' );
    }

    /**
     * @param string[] $urls
     * @return true|WP_Error
     */
    public static function submit( array $urls ) {
        $urls = array_values( array_unique( array_filter( $urls ) ) );
        if ( ! $urls ) return true;

        $response = wp_remote_post( self::ENDPOINT, [
            'headers' => [ 'Content-Type' => 'application/json; charset=utf-8' ],
            'body'    => wp_json_encode( [
                'host'        => wp_parse_url( home_url(), PHP_URL_HOST ),
                'key'         => ASP_Options::indexnow_key(),
                'keyLocation' => self::key_location(),
                'urlList'     => array_slice( $urls, 0, 10000 ),
            ] ),
            'timeout' => 15,
        ] );
        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        // 200 OK, 202 accepted (key validation pending)
        if ( in_array( $code, [ 200, 202 ], true ) ) return true;
        return new WP_Error( 'indexnow_error', "IndexNow returned HTTP $code." );
    }
}
