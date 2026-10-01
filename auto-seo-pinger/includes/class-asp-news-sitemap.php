<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Google News sitemap (/news-sitemap.xml): only posts from the last 48h,
 * as required by Google News. Add the URL in Search Console and Google
 * Publisher Center.
 */
class ASP_News_Sitemap {

    const PATH      = 'news-sitemap.xml';
    const TRANSIENT = 'asp_news_sitemap_xml';

    public static function init() {
        if ( ! ASP_Options::get( 'asp_news_sitemap' ) ) return;
        ASP_Router::register( self::PATH, [ __CLASS__, 'serve' ] );
        add_filter( 'robots_txt', [ __CLASS__, 'robots' ], 20 );
    }

    public static function url() {
        return home_url( '/' . self::PATH );
    }

    public static function flush() {
        delete_transient( self::TRANSIENT );
    }

    public static function robots( $output ) {
        return rtrim( $output ) . "\nSitemap: " . self::url() . "\n";
    }

    public static function serve() {
        status_header( 200 );
        header( 'Content-Type: application/xml; charset=utf-8' );
        header( 'X-Robots-Tag: noindex, follow' );
        $xml = get_transient( self::TRANSIENT );
        if ( ! $xml ) {
            $xml = self::build();
            set_transient( self::TRANSIENT, $xml, 5 * MINUTE_IN_SECONDS );
        }
        echo $xml;
    }

    private static function language() {
        $locale = strtolower( str_replace( '_', '-', get_locale() ) );
        if ( in_array( $locale, [ 'zh-cn', 'zh-tw' ], true ) ) return $locale;
        return substr( $locale, 0, 2 ) ?: 'en';
    }

    private static function build() {
        $pub   = ASP_Options::get( 'asp_news_publication' ) ?: get_bloginfo( 'name' );
        $lang  = self::language();
        $types = array_filter( (array) ASP_Options::get( 'asp_news_post_types' ) ) ?: [ 'post' ];

        $q = new WP_Query( [
            'post_type'      => $types,
            'post_status'    => 'publish',
            'posts_per_page' => 1000,
            'orderby'        => 'date',
            'order'          => 'DESC',
            'no_found_rows'  => true,
            'date_query'     => [ [ 'after' => gmdate( 'Y-m-d H:i:s', time() - 2 * DAY_IN_SECONDS ), 'column' => 'post_date_gmt' ] ],
        ] );

        $e   = static function ( $s ) { return htmlspecialchars( (string) $s, ENT_XML1 | ENT_QUOTES, 'UTF-8' ); };
        $out = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
             . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . "\n";

        foreach ( $q->posts as $p ) {
            $out .= "<url><loc>" . $e( get_permalink( $p ) ) . "</loc><news:news><news:publication>"
                 . "<news:name>" . $e( $pub ) . "</news:name><news:language>" . $e( $lang ) . "</news:language>"
                 . "</news:publication><news:publication_date>" . $e( get_post_time( 'c', true, $p ) ) . "</news:publication_date>"
                 . "<news:title>" . $e( get_the_title( $p ) ) . "</news:title></news:news></url>\n";
        }
        return $out . '</urlset>';
    }
}
