<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * JSON-LD for SEO + AEO/GEO: NewsArticle/Article, WebSite, Organization,
 * FAQPage (auto-detected question headings) and speakable. Stays out of the
 * way when Yoast, Rank Math, AIOSEO or SEOPress already print schema.
 */
class ASP_Schema {

    public static function init() {
        add_action( 'wp_head', [ __CLASS__, 'output' ], 30 );
    }

    private static function seo_plugin_active() {
        return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' )
            || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
    }

    public static function output() {
        $mode = ASP_Options::get( 'asp_schema_mode' );
        if ( $mode === 'off' || ( $mode === 'auto' && self::seo_plugin_active() ) ) return;
        if ( ! is_singular( ASP_Options::post_types() ) ) return;

        $post = get_queried_object();
        if ( ! $post instanceof WP_Post ) return;

        $url    = get_permalink( $post );
        $org_id = home_url( '/#organization' );
        $graph  = [];

        $logo_id = get_theme_mod( 'custom_logo' ) ?: get_option( 'site_icon' );
        $org = [ '@type' => 'Organization', '@id' => $org_id, 'name' => get_bloginfo( 'name' ), 'url' => home_url( '/' ) ];
        if ( $logo_id && ( $logo = wp_get_attachment_image_url( $logo_id, 'full' ) ) ) {
            $org['logo'] = [ '@type' => 'ImageObject', 'url' => $logo ];
        }
        $graph[] = $org;
        $graph[] = [ '@type' => 'WebSite', '@id' => home_url( '/#website' ), 'url' => home_url( '/' ),
                     'name' => get_bloginfo( 'name' ), 'inLanguage' => get_bloginfo( 'language' ),
                     'publisher' => [ '@id' => $org_id ] ];

        $article = [
            '@type'            => ASP_Options::get( 'asp_schema_type' ) === 'Article' ? 'Article' : 'NewsArticle',
            '@id'              => $url . '#article',
            'mainEntityOfPage' => [ '@type' => 'WebPage', '@id' => $url ],
            'headline'         => mb_substr( get_the_title( $post ), 0, 110 ),
            'datePublished'    => get_post_time( 'c', true, $post ),
            'dateModified'     => get_post_modified_time( 'c', true, $post ),
            'inLanguage'       => get_bloginfo( 'language' ),
            'author'           => [ '@type' => 'Person', 'name' => get_the_author_meta( 'display_name', $post->post_author ),
                                    'url' => get_author_posts_url( $post->post_author ) ],
            'publisher'        => [ '@id' => $org_id ],
            'description'      => wp_strip_all_tags( get_the_excerpt( $post ) ),
            'speakable'        => [ '@type' => 'SpeakableSpecification', 'cssSelector' => [ 'h1', '.entry-content > p:first-of-type' ] ],
        ];
        if ( has_post_thumbnail( $post ) ) {
            $article['image'] = [ get_the_post_thumbnail_url( $post, 'full' ) ];
        }
        $cats = get_the_category( $post->ID );
        if ( $cats ) $article['articleSection'] = $cats[0]->name;
        $tags = wp_get_post_tags( $post->ID, [ 'fields' => 'names' ] );
        if ( $tags ) $article['keywords'] = implode( ', ', $tags );
        $graph[] = $article;

        if ( ASP_Options::get( 'asp_schema_faq' ) && ( $faq = self::detect_faq( $post->post_content ) ) ) {
            $graph[] = [ '@type' => 'FAQPage', '@id' => $url . '#faq', 'mainEntity' => $faq ];
        }

        echo "\n<script type=\"application/ld+json\">"
           . wp_json_encode( [ '@context' => 'https://schema.org', '@graph' => $graph ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
           . "</script>\n";
    }

    /** A heading ending in ? or ؟ followed by a paragraph becomes a Q&A pair. */
    private static function detect_faq( $content ) {
        $html = do_shortcode( $content );
        if ( ! preg_match_all( '#<h[2-4][^>]*>(.*?[?؟])\s*</h[2-4]>\s*<p[^>]*>(.*?)</p>#is', $html, $m, PREG_SET_ORDER ) ) return [];
        $items = [];
        foreach ( $m as $row ) {
            $q = trim( wp_strip_all_tags( $row[1] ) );
            $a = trim( wp_strip_all_tags( $row[2] ) );
            if ( $q && $a ) {
                $items[] = [ '@type' => 'Question', 'name' => $q,
                             'acceptedAnswer' => [ '@type' => 'Answer', 'text' => $a ] ];
            }
        }
        return count( $items ) >= 2 ? array_slice( $items, 0, 10 ) : [];
    }
}
