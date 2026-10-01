<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Activator {

    public static function activate() {
        self::create_tables();
        self::set_defaults();
        ASP_Cron::schedule();
    }

    public static function deactivate() {
        ASP_Cron::unschedule();
    }

    private static function create_tables() {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();

        $log_table = $wpdb->prefix . 'asp_logs';
        $sql = "CREATE TABLE IF NOT EXISTS $log_table (
            id          BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            post_id     BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
            action      VARCHAR(50)  NOT NULL DEFAULT '',
            status      VARCHAR(20)  NOT NULL DEFAULT '',
            message     TEXT         NOT NULL,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY status  (status),
            KEY created_at (created_at)
        ) $charset;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        update_option( 'asp_db_version', ASP_VERSION );
    }

    private static function set_defaults() {
        $defaults = [
            'asp_ping_interval'       => 'hourly',
            'asp_post_types'          => [ 'post' ],
            'asp_retry_attempts'      => 3,
            'asp_email_notifications' => get_option( 'admin_email' ),
            'asp_log_retention_days'  => 30,
            'asp_last_checked'        => 0,
        ];
        foreach ( $defaults as $key => $value ) {
            if ( false === get_option( $key ) ) {
                add_option( $key, $value );
            }
        }
    }
}
