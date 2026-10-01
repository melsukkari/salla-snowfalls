<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Serves virtual files (news sitemap, llms.txt, IndexNow key) without
 * needing rewrite-rule flushes.
 */
class ASP_Router {

    private static $routes = [];

    public static function init() {
        add_action( 'init', [ __CLASS__, 'dispatch' ], 1 );
    }

    public static function register( $path, callable $cb ) {
        self::$routes[ ltrim( $path, '/' ) ] = $cb;
    }

    public static function dispatch() {
        if ( is_admin() || empty( $_SERVER['REQUEST_URI'] ) ) return;
        $req  = (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ), PHP_URL_PATH );
        $base = (string) wp_parse_url( home_url(), PHP_URL_PATH );
        if ( $base && strpos( $req, $base ) === 0 ) $req = substr( $req, strlen( $base ) );
        $req = trim( $req, '/' );

        if ( isset( self::$routes[ $req ] ) ) {
            call_user_func( self::$routes[ $req ] );
            exit;
        }
    }
}
