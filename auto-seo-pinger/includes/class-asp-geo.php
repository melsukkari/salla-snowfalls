<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Generative-engine optimisation: /llms.txt (a markdown map of the site for
 * LLMs) and explicit robots.txt rules for AI search/answer crawlers.
 */
class ASP_Geo {

    const BOTS = [
        'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
        'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot',
    ];

    public static function init() {
        if ( ASP_Options::get( 'asp_llms_txt' ) ) {
            ASP_Router::register( 'llms.txt', [ __CLASS__, 'serve_llms' ] );
        }
        if ( ASP_Options::get( 'asp_ai_bots' ) !== 'off' ) {
            add_filter( 'robots_txt', [ __CLASS__, 'robots' ], 15 );
        }
    }

    public static function robots( $output ) {
        $rule = ASP_Options::get( 'asp_ai_bots' ) === 'block' ? 'Disallow: /' : 'Allow: /';
        $add  = "\n# AI search & answer engines (AutoSEO Pinger)\n";
        foreach ( self::BOTS as $bot ) {
            $add .= "User-agent: $bot\n$rule\n\n";
        }
        return rtrim( $output ) . "\n" . $add;
    }

    public static function serve_llms() {
        status_header( 200 );
        header( 'Content-Type: text/plain; charset=utf-8' );

        $out = '# ' . get_bloginfo( 'name' ) . "\n\n";
        if ( $desc = get_bloginfo( 'description' ) ) $out .= '> ' . $desc . "\n\n";

        $out .= "## Sections\n";
        foreach ( get_categories( [ 'orderby' => 'count', 'order' => 'DESC', 'number' => 15, 'hide_empty' => true ] ) as $c ) {
            $out .= '- [' . $c->name . '](' . get_category_link( $c ) . ')' . ( $c->description ? ': ' . wp_strip_all_tags( $c->description ) : '' ) . "\n";
        }

        $out .= "\n## Latest articles\n";
        $q = new WP_Query( [ 'post_type' => ASP_Options::post_types(), 'post_status' => 'publish',
                             'posts_per_page' => 50, 'no_found_rows' => true ] );
        foreach ( $q->posts as $p ) {
            $ex = wp_strip_all_tags( get_the_excerpt( $p ) );
            $out .= '- [' . wp_strip_all_tags( get_the_title( $p ) ) . '](' . get_permalink( $p ) . ')'
                  . ( $ex ? ': ' . mb_substr( $ex, 0, 160 ) : '' ) . "\n";
        }

        $out .= "\n## Feeds & sitemaps\n- [RSS](" . get_bloginfo( 'rss2_url' ) . ")\n- [Sitemap](" . ( function_exists( 'get_sitemap_url' ) ? get_sitemap_url( 'index' ) : home_url( '/sitemap.xml' ) ) . ")\n";
        echo $out;
    }
}
