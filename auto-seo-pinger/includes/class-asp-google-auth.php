<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Google_Auth {

    const OPTION_TOKENS      = 'asp_google_tokens';
    const OAUTH_AUTH_URL     = 'https://accounts.google.com/o/oauth2/v2/auth';
    const OAUTH_TOKEN_URL    = 'https://oauth2.googleapis.com/token';
    const OAUTH_REVOKE_URL   = 'https://oauth2.googleapis.com/revoke';

    private static $scopes = [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/analytics',
    ];

    public static function init() {
        add_action( 'admin_init', [ __CLASS__, 'handle_oauth_callback' ] );
    }

    /**
     * Build the Google OAuth authorisation URL.
     */
    public static function get_auth_url() {
        $client_id    = get_option( 'asp_google_client_id', '' );
        $redirect_uri = self::get_redirect_uri();

        $params = [
            'client_id'             => $client_id,
            'redirect_uri'          => $redirect_uri,
            'response_type'         => 'code',
            'scope'                 => implode( ' ', self::$scopes ),
            'access_type'           => 'offline',
            'prompt'                => 'consent',
            'state'                 => wp_create_nonce( 'asp_oauth_state' ),
        ];

        return self::OAUTH_AUTH_URL . '?' . http_build_query( $params );
    }

    /**
     * Handle the OAuth callback from Google.
     */
    public static function handle_oauth_callback() {
        if ( ! isset( $_GET['asp_oauth_callback'] ) ) return;
        if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Forbidden' );

        $state = sanitize_text_field( wp_unslash( $_GET['state'] ?? '' ) );
        if ( ! wp_verify_nonce( $state, 'asp_oauth_state' ) ) {
            wp_die( 'Invalid state parameter.' );
        }

        if ( isset( $_GET['error'] ) ) {
            ASP_Logger::log( 'oauth', ASP_Logger::STATUS_ERROR, sanitize_text_field( $_GET['error'] ) );
            wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&oauth_error=1' ) );
            exit;
        }

        $code   = sanitize_text_field( wp_unslash( $_GET['code'] ?? '' ) );
        $tokens = self::exchange_code_for_tokens( $code );

        if ( is_wp_error( $tokens ) ) {
            ASP_Logger::log( 'oauth', ASP_Logger::STATUS_ERROR, $tokens->get_error_message() );
            wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&oauth_error=1' ) );
            exit;
        }

        self::save_tokens( $tokens );
        ASP_Logger::log( 'oauth', ASP_Logger::STATUS_SUCCESS, 'Google account connected successfully.' );
        wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&oauth_success=1' ) );
        exit;
    }

    /**
     * Exchange an auth code for access + refresh tokens.
     */
    private static function exchange_code_for_tokens( $code ) {
        $response = wp_remote_post( self::OAUTH_TOKEN_URL, [
            'body' => [
                'code'          => $code,
                'client_id'     => get_option( 'asp_google_client_id' ),
                'client_secret' => get_option( 'asp_google_client_secret' ),
                'redirect_uri'  => self::get_redirect_uri(),
                'grant_type'    => 'authorization_code',
            ],
        ] );

        if ( is_wp_error( $response ) ) return $response;

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( isset( $body['error'] ) ) {
            return new WP_Error( 'oauth_error', $body['error_description'] ?? $body['error'] );
        }

        return $body;
    }

    /**
     * Return a valid access token, refreshing if necessary.
     */
    public static function get_access_token() {
        $tokens = get_option( self::OPTION_TOKENS, [] );
        if ( empty( $tokens['access_token'] ) ) return new WP_Error( 'no_token', 'No Google access token found.' );

        // Check expiry (with 60-second buffer)
        if ( isset( $tokens['expires_at'] ) && time() >= ( $tokens['expires_at'] - 60 ) ) {
            $tokens = self::refresh_access_token( $tokens );
            if ( is_wp_error( $tokens ) ) return $tokens;
        }

        return $tokens['access_token'];
    }

    /**
     * Refresh the access token using the stored refresh token.
     */
    private static function refresh_access_token( $tokens ) {
        if ( empty( $tokens['refresh_token'] ) ) {
            return new WP_Error( 'no_refresh_token', 'No refresh token available. Please re-authenticate.' );
        }

        $response = wp_remote_post( self::OAUTH_TOKEN_URL, [
            'body' => [
                'client_id'     => get_option( 'asp_google_client_id' ),
                'client_secret' => get_option( 'asp_google_client_secret' ),
                'refresh_token' => $tokens['refresh_token'],
                'grant_type'    => 'refresh_token',
            ],
        ] );

        if ( is_wp_error( $response ) ) return $response;

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( isset( $body['error'] ) ) {
            return new WP_Error( 'refresh_error', $body['error_description'] ?? $body['error'] );
        }

        $tokens['access_token'] = $body['access_token'];
        $tokens['expires_at']   = time() + ( $body['expires_in'] ?? 3600 );
        self::save_tokens( $tokens );

        return $tokens;
    }

    /**
     * Revoke tokens and disconnect the account.
     */
    public static function disconnect() {
        $tokens = get_option( self::OPTION_TOKENS, [] );
        if ( ! empty( $tokens['access_token'] ) ) {
            wp_remote_post( self::OAUTH_REVOKE_URL, [
                'body' => [ 'token' => $tokens['access_token'] ],
            ] );
        }
        delete_option( self::OPTION_TOKENS );
        ASP_Logger::log( 'oauth', ASP_Logger::STATUS_INFO, 'Google account disconnected.' );
    }

    public static function is_connected() {
        $tokens = get_option( self::OPTION_TOKENS, [] );
        return ! empty( $tokens['access_token'] );
    }

    private static function save_tokens( $tokens ) {
        if ( isset( $tokens['expires_in'] ) && ! isset( $tokens['expires_at'] ) ) {
            $tokens['expires_at'] = time() + $tokens['expires_in'];
        }
        update_option( self::OPTION_TOKENS, $tokens );
    }

    public static function get_redirect_uri() {
        return admin_url( 'options-general.php?asp_oauth_callback=1' );
    }
}
