<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Logger {

    const STATUS_SUCCESS = 'success';
    const STATUS_ERROR   = 'error';
    const STATUS_INFO    = 'info';

    /**
     * Write a log entry to the database.
     */
    public static function log( $action, $status, $message, $post_id = 0 ) {
        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'asp_logs',
            [
                'post_id'    => absint( $post_id ),
                'action'     => sanitize_text_field( $action ),
                'status'     => sanitize_text_field( $status ),
                'message'    => sanitize_textarea_field( $message ),
                'created_at' => current_time( 'mysql' ),
            ],
            [ '%d', '%s', '%s', '%s', '%s' ]
        );

        // Send email on error if configured
        if ( $status === self::STATUS_ERROR ) {
            self::maybe_email_admin( $action, $message, $post_id );
        }
    }

    /**
     * Get recent log entries.
     */
    public static function get_logs( $limit = 100, $status = '' ) {
        global $wpdb;
        $table = $wpdb->prefix . 'asp_logs';

        if ( $status ) {
            return $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE status = %s ORDER BY created_at DESC LIMIT %d",
                    $status, $limit
                )
            );
        }

        return $wpdb->get_results(
            $wpdb->prepare( "SELECT * FROM $table ORDER BY created_at DESC LIMIT %d", $limit )
        );
    }

    /**
     * Purge old log entries beyond the retention window.
     */
    public static function purge_old_logs() {
        global $wpdb;
        $days  = absint( get_option( 'asp_log_retention_days', 30 ) );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->prefix}asp_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
                $days
            )
        );
    }

    private static function maybe_email_admin( $action, $message, $post_id ) {
        $email = get_option( 'asp_email_notifications' );
        if ( ! is_email( $email ) ) return;
        $key = 'asp_mail_' . md5( $action );
        if ( get_transient( $key ) ) return;   // max one email per action per hour
        set_transient( $key, 1, HOUR_IN_SECONDS );

        $subject = sprintf( '[AutoSEO Pinger] Error during %s', $action );
        $body    = sprintf(
            "An error occurred in AutoSEO Pinger.\n\nAction: %s\nPost ID: %d\nMessage: %s\n\nTime: %s",
            $action, $post_id, $message, current_time( 'mysql' )
        );
        wp_mail( $email, $subject, $body );
    }
}
