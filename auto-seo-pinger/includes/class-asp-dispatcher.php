<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Event-driven pipeline: publish/update/unpublish → queued single cron event
 * (30s later, so the editor finishes saving meta) → every enabled engine.
 */
class ASP_Dispatcher {

    const EVENT = 'asp_process_post';

    public static function init() {
        add_action( 'transition_post_status', [ __CLASS__, 'on_transition' ], 10, 3 );
        add_action( self::EVENT,              [ __CLASS__, 'process' ], 10, 2 );
    }

    public static function on_transition( $new, $old, $post ) {
        if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) return;
        if ( ! in_array( $post->post_type, ASP_Options::post_types(), true ) ) return;

        if ( $new === 'publish' ) {
            if ( $old === 'publish' ) {
                if ( ! ASP_Options::get( 'asp_ping_on_update' ) ) return;
                $reason = 'update';
            } else {
                $reason = 'publish';
            }
        } elseif ( $old === 'publish' ) {
            $reason = 'removed';
        } else {
            return;
        }
        self::enqueue( $post->ID, $reason );
    }

    public static function enqueue( $post_id, $reason = 'publish', $delay = 30 ) {
        ASP_News_Sitemap::flush();
        $args = [ (int) $post_id, $reason ];
        if ( ! wp_next_scheduled( self::EVENT, $args ) ) {
            wp_schedule_single_event( time() + $delay, self::EVENT, $args );
        }
    }

    /** Cron entry point; debounces rapid re-saves. */
    public static function process( $post_id, $reason = 'publish' ) {
        $post = get_post( $post_id );
        if ( ! $post ) return;
        $last = (int) get_post_meta( $post->ID, '_asp_last_sent', true );
        if ( $reason === 'update' && $last && ( time() - $last ) < (int) ASP_Options::get( 'asp_debounce_seconds' ) ) {
            return;
        }
        self::run( $post, $reason );
    }

    /** Send one post to every enabled engine. */
    public static function run( WP_Post $post, $reason = 'publish' ) {
        $removed = $reason === 'removed';
        if ( ! $removed && $post->post_status !== 'publish' ) return;

        $url     = get_permalink( $post->ID );
        $retries = max( 1, absint( get_option( 'asp_retry_attempts', 3 ) ) );
        $google  = ASP_Google_Auth::is_connected();

        $jobs = [];
        if ( ASP_Options::get( 'asp_indexnow_enabled' ) ) {
            $jobs['indexnow'] = static function () use ( $url ) { return ASP_IndexNow::submit( [ $url ] ); };
        }
        if ( ! $removed ) {
            if ( ASP_Options::get( 'asp_websub_enabled' ) ) {
                $jobs['websub'] = static function () { return self::throttled( 'websub', [ 'ASP_Pings', 'websub' ] ); };
            }
            if ( ASP_Options::get( 'asp_xmlrpc_enabled' ) ) {
                $jobs['xmlrpc_ping'] = static function () { return self::throttled( 'xmlrpc', [ 'ASP_Pings', 'xmlrpc' ] ); };
            }
        }
        if ( $google && ASP_Options::get( 'asp_google_indexing' ) ) {
            $jobs['google_indexing'] = static function () use ( $post, $removed ) {
                return ASP_Search_Console::submit_url( $post, $removed ? 'URL_DELETED' : 'URL_UPDATED' );
            };
        }
        if ( $google && ! $removed ) {
            $jobs['sitemap_submit'] = static function () { return self::throttled( 'sitemaps', [ 'ASP_Search_Console', 'submit_sitemaps' ], HOUR_IN_SECONDS ); };
        }
        if ( ! $removed && $reason === 'publish' && get_option( 'asp_ga4_measurement_id' ) && get_option( 'asp_ga4_api_secret' ) ) {
            $jobs['ga4_event'] = static function () use ( $post ) { return ASP_Analytics::track_new_post( $post ); };
        }

        foreach ( $jobs as $action => $fn ) {
            self::with_retry( $fn, $action, $post->ID, $retries, $reason );
        }
        update_post_meta( $post->ID, '_asp_last_sent', time() );
    }

    /** Site-wide pings (feeds/sitemaps) shouldn't fire once per post in a bulk publish. */
    private static function throttled( $key, callable $fn, $ttl = 60 ) {
        $t = 'asp_thr_' . $key;
        if ( get_transient( $t ) ) return 'skip';
        $r = call_user_func( $fn );
        if ( $r === true ) set_transient( $t, 1, $ttl );
        return $r;
    }

    private static function with_retry( callable $fn, $action, $post_id, $max, $reason ) {
        $attempt = 0;
        do {
            $result = $fn();
            $attempt++;
            if ( $result === 'skip' ) return;
            if ( $result === true ) {
                ASP_Logger::log( $action, ASP_Logger::STATUS_SUCCESS, "OK ($reason, attempt $attempt).", $post_id );
                return;
            }
            if ( $attempt < $max ) sleep( 2 );
        } while ( $attempt < $max );

        ASP_Logger::log( $action, ASP_Logger::STATUS_ERROR,
            "Failed after $attempt attempts ($reason): " . $result->get_error_message(), $post_id );
    }
}
