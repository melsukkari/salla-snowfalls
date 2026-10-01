<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Analytics {

    // GA4 Measurement Protocol endpoint
    const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

    /**
     * Send a "new_post_published" event to GA4 via Measurement Protocol.
     *
     * @param  WP_Post $post
     * @return true|WP_Error
     */
    public static function track_new_post( $post ) {
        $measurement_id = get_option( 'asp_ga4_measurement_id', '' );
        $api_secret     = get_option( 'asp_ga4_api_secret', '' );

        if ( empty( $measurement_id ) || empty( $api_secret ) ) {
            return new WP_Error( 'ga4_not_configured', 'GA4 Measurement ID or API Secret not set.' );
        }

        $url      = self::MP_ENDPOINT . '?' . http_build_query( [
            'measurement_id' => $measurement_id,
            'api_secret'     => $api_secret,
        ] );
        $payload  = [
            'client_id' => self::get_client_id(),
            'events'    => [
                [
                    'name'   => 'new_post_published',
                    'params' => [
                        'post_id'    => $post->ID,
                        'post_title' => $post->post_title,
                        'post_url'   => get_permalink( $post->ID ),
                        'post_type'  => $post->post_type,
                        'author_id'  => $post->post_author,
                    ],
                ],
            ],
        ];

        $response = wp_remote_post( $url, [
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( $payload ),
            'timeout' => 10,
        ] );

        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        if ( $code !== 204 && $code !== 200 ) {
            return new WP_Error( 'ga4_error', "GA4 Measurement Protocol returned HTTP $code." );
        }

        return true;
    }

    /**
     * Generate or retrieve a stable client_id for server-side events.
     */
    private static function get_client_id() {
        $cid = get_option( 'asp_ga4_client_id' );
        if ( ! $cid ) {
            $cid = wp_generate_uuid4();
            update_option( 'asp_ga4_client_id', $cid );
        }
        return $cid;
    }
}
