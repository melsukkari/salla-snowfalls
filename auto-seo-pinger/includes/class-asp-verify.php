<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Site-ownership verification for search engines: serves Google-style
 * HTML verification files (e.g. /google1234.html) virtually and prints
 * optional verification meta tags in <head>.
 */
class ASP_Verify {

    public static function init() {
        foreach ( ASP_Options::lines( 'asp_verify_files' ) as $file ) {
            $file = basename( $file );
            if ( ! preg_match( '/^[A-Za-z0-9_.-]+\.html$/', $file ) ) continue;
            ASP_Router::register( $file, static function () use ( $file ) {
                status_header( 200 );
                header( 'Content-Type: text/html; charset=utf-8' );
                echo 'google-site-verification: ' . $file;
            } );
        }
        add_action( 'wp_head', [ __CLASS__, 'meta_tags' ], 1 );
    }

    public static function meta_tags() {
        $map = [
            'asp_verify_google' => 'google-site-verification',
            'asp_verify_bing'   => 'msvalidate.01',
            'asp_verify_yandex' => 'yandex-verification',
        ];
        foreach ( $map as $opt => $name ) {
            if ( $v = trim( (string) get_option( $opt, '' ) ) ) {
                printf( "<meta name=\"%s\" content=\"%s\" />\n", esc_attr( $name ), esc_attr( $v ) );
            }
        }
    }
}
