<?php
/**
 * Plugin Name: AutoSEO Pinger
 * Plugin URI:  https://yourwebsite.com/auto-seo-pinger
 * Description: Event-driven publishing pipeline for SEO, GEO and AEO: IndexNow (Bing/Yandex/Naver), WebSub, ping services, Google News sitemap, Search Console, JSON-LD schema, llms.txt and AI-crawler rules.
 * Version:     2.0.0
 * Author:      Your Name
 * Author URI:  https://yourwebsite.com
 * License:     GPL-2.0+
 * Text Domain: auto-seo-pinger
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Constants
define( 'ASP_VERSION',     '2.0.0' );
define( 'ASP_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'ASP_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'ASP_PLUGIN_FILE', __FILE__ );

// Load includes
require_once ASP_PLUGIN_DIR . 'includes/class-asp-options.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-router.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-activator.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-google-auth.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-search-console.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-analytics.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-cron.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-logger.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-indexnow.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-pings.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-news-sitemap.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-schema.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-geo.php';
require_once ASP_PLUGIN_DIR . 'includes/class-asp-dispatcher.php';
require_once ASP_PLUGIN_DIR . 'admin/class-asp-admin.php';

// Activation / Deactivation
register_activation_hook(   __FILE__, [ 'ASP_Activator', 'activate'   ] );
register_deactivation_hook( __FILE__, [ 'ASP_Activator', 'deactivate' ] );

// Boot the plugin
function asp_init() {
    ASP_Router::init();
    ASP_IndexNow::init();
    ASP_Pings::init();
    ASP_News_Sitemap::init();
    ASP_Schema::init();
    ASP_Geo::init();
    ASP_Dispatcher::init();
    ASP_Cron::init();
    ASP_Admin::init();
    ASP_Google_Auth::init();
}
add_action( 'plugins_loaded', 'asp_init' );

// Upgrade from 1.x: make sure the safety-net sweep is scheduled.
add_action( 'init', function () {
    if ( get_option( 'asp_version' ) !== ASP_VERSION ) {
        ASP_Cron::reschedule();
        update_option( 'asp_version', ASP_VERSION );
    }
} );
