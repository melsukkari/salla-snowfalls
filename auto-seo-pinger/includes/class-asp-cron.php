<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Cron {

    const HOOK = 'asp_hourly_event';

    public static function init() {
        add_action( self::HOOK, [ __CLASS__, 'run_task' ] );
        add_filter( 'cron_schedules',  [ __CLASS__, 'add_schedules' ] );
    }

    // ── scheduling ───────────────────────────────────────────────────────────

    public static function schedule() {
        if ( ! wp_next_scheduled( self::HOOK ) ) {
            $interval = get_option( 'asp_ping_interval', 'hourly' );
            wp_schedule_event( time(), $interval, self::HOOK );
        }
    }

    public static function unschedule() {
        $timestamp = wp_next_scheduled( self::HOOK );
        if ( $timestamp ) {
            wp_unschedule_event( $timestamp, self::HOOK );
        }
    }

    public static function reschedule() {
        self::unschedule();
        self::schedule();
    }

    /**
     * Add extra recurrence options beyond WP's defaults.
     */
    public static function add_schedules( $schedules ) {
        $schedules['every_30_minutes'] = [
            'interval' => 30 * MINUTE_IN_SECONDS,
            'display'  => __( 'Every 30 Minutes', 'auto-seo-pinger' ),
        ];
        $schedules['every_6_hours'] = [
            'interval' => 6 * HOUR_IN_SECONDS,
            'display'  => __( 'Every 6 Hours', 'auto-seo-pinger' ),
        ];
        return $schedules;
    }

    // ── safety net ───────────────────────────────────────────────────────────
    // Primary delivery is event-driven (ASP_Dispatcher). This sweep re-sends
    // anything published/modified since the last sweep that was never sent
    // (e.g. imports, WP-CLI, direct DB edits, a failed cron event).

    public static function run_task() {
        $last_checked = (int) get_option( 'asp_last_checked', 0 );
        update_option( 'asp_last_checked', time() );

        $args = [
            'post_type'      => ASP_Options::post_types(),
            'post_status'    => 'publish',
            'posts_per_page' => 50,
            'orderby'        => 'modified',
            'order'          => 'DESC',
            'no_found_rows'  => true,
        ];
        if ( $last_checked ) {
            $args['date_query'] = [ [ 'column' => 'post_modified_gmt', 'after' => gmdate( 'Y-m-d H:i:s', $last_checked ) ] ];
        } else {
            $args['posts_per_page'] = 10;
        }

        $sent = 0;
        foreach ( ( new WP_Query( $args ) )->posts as $post ) {
            $last_sent = (int) get_post_meta( $post->ID, '_asp_last_sent', true );
            if ( $last_sent >= strtotime( $post->post_modified_gmt . ' UTC' ) ) continue;
            ASP_Dispatcher::run( $post, $last_sent ? 'update' : 'publish' );
            $sent++;
        }

        ASP_Logger::log( 'cron', ASP_Logger::STATUS_INFO, $sent ? "Safety sweep sent $sent post(s)." : 'Safety sweep: nothing missed.' );
        ASP_Logger::purge_old_logs();
    }
}
