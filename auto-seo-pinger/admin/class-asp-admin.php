<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class ASP_Admin {

    public static function init() {
        add_action( 'admin_menu',       [ __CLASS__, 'add_menu'        ] );
        add_action( 'admin_init',       [ __CLASS__, 'register_settings'] );
        add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue_assets' ] );
        add_action( 'admin_post_asp_disconnect_google', [ __CLASS__, 'handle_disconnect' ] );
        add_action( 'admin_post_asp_run_now',           [ __CLASS__, 'handle_run_now'    ] );
        add_action( 'admin_post_asp_clear_logs',        [ __CLASS__, 'handle_clear_logs' ] );
        add_action( 'admin_post_asp_ping_post',         [ __CLASS__, 'handle_ping_post'  ] );
        add_filter( 'post_row_actions',                 [ __CLASS__, 'row_actions' ], 10, 2 );
        add_filter( 'page_row_actions',                 [ __CLASS__, 'row_actions' ], 10, 2 );
    }

    public static function add_menu() {
        add_options_page(
            __( 'AutoSEO Pinger', 'auto-seo-pinger' ),
            __( 'AutoSEO Pinger', 'auto-seo-pinger' ),
            'manage_options',
            'auto-seo-pinger',
            [ __CLASS__, 'render_page' ]
        );
    }

    public static function register_settings() {
        $fields = [
            'asp_google_client_id'     => 'sanitize_text_field',
            'asp_google_client_secret' => 'sanitize_text_field',
            'asp_ga4_measurement_id'   => 'sanitize_text_field',
            'asp_ga4_api_secret'       => 'sanitize_text_field',
            'asp_ping_interval'        => 'sanitize_text_field',
            'asp_post_types'           => null,   // handled manually
            'asp_retry_attempts'       => 'absint',
            'asp_email_notifications'  => 'sanitize_email',
            'asp_log_retention_days'   => 'absint',
        ];

        $engine_fields = [
            'asp_ping_on_update' => 'absint', 'asp_debounce_seconds' => 'absint',
            'asp_indexnow_enabled' => 'absint', 'asp_websub_enabled' => 'absint',
            'asp_websub_hubs' => 'sanitize_textarea_field', 'asp_xmlrpc_enabled' => 'absint',
            'asp_xmlrpc_services' => 'sanitize_textarea_field', 'asp_google_indexing' => 'absint',
            'asp_gsc_property' => 'sanitize_text_field', 'asp_news_sitemap' => 'absint',
            'asp_news_publication' => 'sanitize_text_field',
            'asp_news_post_types' => [ __CLASS__, 'sanitize_types' ],
            'asp_schema_mode' => 'sanitize_key', 'asp_schema_type' => 'sanitize_text_field',
            'asp_schema_faq' => 'absint', 'asp_llms_txt' => 'absint', 'asp_ai_bots' => 'sanitize_key',
            'asp_verify_files' => 'sanitize_textarea_field', 'asp_verify_google' => 'sanitize_text_field',
            'asp_verify_bing' => 'sanitize_text_field', 'asp_verify_yandex' => 'sanitize_text_field',
        ];
        foreach ( $engine_fields as $key => $cb ) {
            register_setting( 'asp_engines_group', $key, [ 'sanitize_callback' => $cb ] );
        }

        foreach ( $fields as $key => $sanitizer ) {
            register_setting( 'asp_settings_group', $key,
                $sanitizer ? [ 'sanitize_callback' => $sanitizer ] : []
            );
        }
    }

    public static function sanitize_types( $v ) {
        return array_values( array_map( 'sanitize_key', (array) $v ) );
    }

    public static function enqueue_assets( $hook ) {
        if ( $hook !== 'settings_page_auto-seo-pinger' ) return;
        wp_enqueue_style(
            'asp-admin',
            ASP_PLUGIN_URL . 'assets/css/admin.css',
            [], ASP_VERSION
        );
        wp_enqueue_script(
            'asp-admin',
            ASP_PLUGIN_URL . 'assets/js/admin.js',
            [ 'jquery' ], ASP_VERSION, true
        );
    }

    // ── page render ──────────────────────────────────────────────────────────

    public static function render_page() {
        if ( ! current_user_can( 'manage_options' ) ) return;
        $tab = sanitize_key( $_GET['tab'] ?? 'settings' );
        ?>
        <div class="wrap asp-wrap">
            <h1>🔍 AutoSEO Pinger</h1>

            <?php self::render_notices(); ?>

            <nav class="nav-tab-wrapper">
                <?php foreach ( [ 'settings' => 'Settings', 'engines' => 'Engines & AI', 'status' => 'Status & Logs' ] as $slug => $label ) : ?>
                    <a href="<?php echo esc_url( admin_url( "options-general.php?page=auto-seo-pinger&tab=$slug" ) ); ?>"
                       class="nav-tab <?php echo $tab === $slug ? 'nav-tab-active' : ''; ?>">
                        <?php echo esc_html( $label ); ?>
                    </a>
                <?php endforeach; ?>
            </nav>

            <div class="asp-tab-content">
                <?php
                if ( $tab === 'settings' )     self::render_settings_tab();
                elseif ( $tab === 'engines' )  self::render_engines_tab();
                else                           self::render_status_tab();
                ?>
            </div>
        </div>
        <?php
    }

    private static function render_notices() {
        if ( isset( $_GET['oauth_success'] ) ) : ?>
            <div class="notice notice-success"><p>✅ Google account connected successfully!</p></div>
        <?php elseif ( isset( $_GET['oauth_error'] ) ) : ?>
            <div class="notice notice-error"><p>❌ Google OAuth failed. Please try again.</p></div>
        <?php elseif ( isset( $_GET['settings-updated'] ) ) : ?>
            <div class="notice notice-success"><p>✅ Settings saved.</p></div>
        <?php elseif ( isset( $_GET['pinged'] ) ) : ?>
            <div class="notice notice-success"><p>✅ Post queued for all engines. See Status &amp; Logs in about a minute.</p></div>
        <?php elseif ( isset( $_GET['run_done'] ) ) : ?>
            <div class="notice notice-success"><p>✅ Safety sweep completed. Check logs for details.</p></div>
        <?php endif;
    }

    private static function render_settings_tab() {
        $connected = ASP_Google_Auth::is_connected();
        $post_types = get_post_types( [ 'public' => true ], 'objects' );
        $saved_types = (array) get_option( 'asp_post_types', [ 'post' ] );
        $intervals   = [
            'every_30_minutes' => 'Every 30 Minutes',
            'hourly'           => 'Every Hour',
            'every_6_hours'    => 'Every 6 Hours',
            'twicedaily'       => 'Twice Daily',
            'daily'            => 'Daily',
        ];
        ?>
        <form method="post" action="options.php">
            <?php settings_fields( 'asp_settings_group' ); ?>

            <h2>Google API Credentials</h2>
            <p>Create credentials at <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a>. Set the redirect URI to: <code><?php echo esc_html( ASP_Google_Auth::get_redirect_uri() ); ?></code></p>
            <table class="form-table">
                <tr>
                    <th><label for="asp_google_client_id">OAuth Client ID</label></th>
                    <td><input type="text" id="asp_google_client_id" name="asp_google_client_id"
                               value="<?php echo esc_attr( get_option( 'asp_google_client_id' ) ); ?>"
                               class="regular-text" /></td>
                </tr>
                <tr>
                    <th><label for="asp_google_client_secret">OAuth Client Secret</label></th>
                    <td><input type="password" id="asp_google_client_secret" name="asp_google_client_secret"
                               value="<?php echo esc_attr( get_option( 'asp_google_client_secret' ) ); ?>"
                               class="regular-text" /></td>
                </tr>
            </table>

            <h2>Google Analytics 4</h2>
            <p>Find these values in your GA4 property → Admin → Data Streams → Measurement Protocol.</p>
            <table class="form-table">
                <tr>
                    <th><label for="asp_ga4_measurement_id">Measurement ID</label></th>
                    <td><input type="text" id="asp_ga4_measurement_id" name="asp_ga4_measurement_id"
                               value="<?php echo esc_attr( get_option( 'asp_ga4_measurement_id' ) ); ?>"
                               placeholder="G-XXXXXXXXXX" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><label for="asp_ga4_api_secret">API Secret</label></th>
                    <td><input type="password" id="asp_ga4_api_secret" name="asp_ga4_api_secret"
                               value="<?php echo esc_attr( get_option( 'asp_ga4_api_secret' ) ); ?>"
                               class="regular-text" /></td>
                </tr>
            </table>

            <h2>Scheduling &amp; safety net</h2>
            <p>New and edited posts are sent instantly. This interval only controls the catch-up sweep for anything missed.</p>
            <table class="form-table">
                <tr>
                    <th><label for="asp_ping_interval">Check Interval</label></th>
                    <td>
                        <select id="asp_ping_interval" name="asp_ping_interval">
                            <?php foreach ( $intervals as $val => $label ) : ?>
                                <option value="<?php echo esc_attr( $val ); ?>"
                                    <?php selected( get_option( 'asp_ping_interval', 'hourly' ), $val ); ?>>
                                    <?php echo esc_html( $label ); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>Post Types to Monitor</th>
                    <td>
                        <?php foreach ( $post_types as $pt ) : ?>
                            <label style="display:block;">
                                <input type="checkbox" name="asp_post_types[]"
                                       value="<?php echo esc_attr( $pt->name ); ?>"
                                       <?php checked( in_array( $pt->name, $saved_types, true ) ); ?> />
                                <?php echo esc_html( $pt->label ); ?>
                            </label>
                        <?php endforeach; ?>
                    </td>
                </tr>
                <tr>
                    <th><label for="asp_retry_attempts">Retry Attempts</label></th>
                    <td>
                        <input type="number" id="asp_retry_attempts" name="asp_retry_attempts"
                               value="<?php echo esc_attr( get_option( 'asp_retry_attempts', 3 ) ); ?>"
                               min="1" max="10" class="small-text" />
                    </td>
                </tr>
            </table>

            <h2>Notifications & Logs</h2>
            <table class="form-table">
                <tr>
                    <th><label for="asp_email_notifications">Error Email</label></th>
                    <td><input type="email" id="asp_email_notifications" name="asp_email_notifications"
                               value="<?php echo esc_attr( get_option( 'asp_email_notifications' ) ); ?>"
                               class="regular-text" /></td>
                </tr>
                <tr>
                    <th><label for="asp_log_retention_days">Log Retention (days)</label></th>
                    <td><input type="number" id="asp_log_retention_days" name="asp_log_retention_days"
                               value="<?php echo esc_attr( get_option( 'asp_log_retention_days', 30 ) ); ?>"
                               min="1" max="365" class="small-text" /></td>
                </tr>
            </table>

            <?php submit_button( 'Save Settings' ); ?>
        </form>

        <hr>
        <h2>Google Account</h2>
        <?php if ( $connected ) : ?>
            <p>✅ <strong>Connected.</strong></p>
            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                <input type="hidden" name="action" value="asp_disconnect_google" />
                <?php wp_nonce_field( 'asp_disconnect_google' ); ?>
                <?php submit_button( 'Disconnect Google Account', 'secondary', 'submit', false ); ?>
            </form>
        <?php else : ?>
            <p>❌ Not connected. Save your credentials above first, then connect.</p>
            <a href="<?php echo esc_url( ASP_Google_Auth::get_auth_url() ); ?>"
               class="button button-primary">Connect Google Account</a>
        <?php endif; ?>
        <?php
    }

    private static function render_status_tab() {
        $next_run = wp_next_scheduled( ASP_Cron::HOOK );
        $logs     = ASP_Logger::get_logs( 200 );
        ?>
        <div class="asp-status-bar">
            <div class="asp-status-item">
                <strong>Google:</strong>
                <?php echo ASP_Google_Auth::is_connected() ? '✅ Connected' : '❌ Not Connected'; ?>
            </div>
            <div class="asp-status-item">
                <strong>Next sweep:</strong>
                <?php echo $next_run ? esc_html( human_time_diff( $next_run ) . ' from now (' . date( 'Y-m-d H:i:s', $next_run ) . ')' ) : '—'; ?>
            </div>
            <div class="asp-status-item">
                <strong>Last safety sweep:</strong>
                <?php
                $lc = get_option( 'asp_last_checked', 0 );
                echo $lc ? esc_html( date( 'Y-m-d H:i:s', $lc ) ) : 'Never';
                ?>
            </div>
        </div>

        <div class="asp-status-bar">
            <div class="asp-status-item"><strong>IndexNow key:</strong> <a href="<?php echo esc_url( ASP_IndexNow::key_location() ); ?>" target="_blank">verify</a></div>
            <div class="asp-status-item"><strong>News sitemap:</strong> <a href="<?php echo esc_url( ASP_News_Sitemap::url() ); ?>" target="_blank">open</a></div>
            <div class="asp-status-item"><strong>llms.txt:</strong> <a href="<?php echo esc_url( home_url( '/llms.txt' ) ); ?>" target="_blank">open</a></div>
        </div>

        <div class="asp-actions">
            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
                <input type="hidden" name="action" value="asp_run_now" />
                <?php wp_nonce_field( 'asp_run_now' ); ?>
                <button type="submit" class="button button-primary">▶ Run Now</button>
            </form>
            &nbsp;
            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;"
                  onsubmit="return confirm('Clear all logs?');">
                <input type="hidden" name="action" value="asp_clear_logs" />
                <?php wp_nonce_field( 'asp_clear_logs' ); ?>
                <button type="submit" class="button button-secondary">🗑 Clear Logs</button>
            </form>
        </div>

        <h2>Activity Log</h2>
        <?php if ( empty( $logs ) ) : ?>
            <p>No log entries yet.</p>
        <?php else : ?>
            <table class="widefat striped asp-log-table">
                <thead>
                    <tr>
                        <th>Time</th><th>Action</th><th>Status</th><th>Post ID</th><th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $logs as $log ) :
                        $badge = $log->status === 'success' ? 'asp-badge-success'
                               : ( $log->status === 'error' ? 'asp-badge-error' : 'asp-badge-info' );
                    ?>
                    <tr>
                        <td><?php echo esc_html( $log->created_at ); ?></td>
                        <td><code><?php echo esc_html( $log->action ); ?></code></td>
                        <td><span class="asp-badge <?php echo esc_attr( $badge ); ?>"><?php echo esc_html( $log->status ); ?></span></td>
                        <td><?php echo $log->post_id ? '<a href="' . esc_url( get_permalink( $log->post_id ) ) . '">' . esc_html( $log->post_id ) . '</a>' : '—'; ?></td>
                        <td><?php echo esc_html( $log->message ); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        <?php
    }


    private static function checkbox( $name, $label, $desc = '' ) {
        printf( '<input type="hidden" name="%1$s" value="0" /><label><input type="checkbox" name="%1$s" value="1" %2$s /> %3$s</label>%4$s',
            esc_attr( $name ), checked( (bool) ASP_Options::get( $name ), true, false ), esc_html( $label ),
            $desc ? '<p class="description">' . wp_kses_post( $desc ) . '</p>' : '' );
    }

    private static function render_engines_tab() {
        $types = get_post_types( [ 'public' => true ], 'objects' );
        $news  = (array) ASP_Options::get( 'asp_news_post_types' );
        ?>
        <form method="post" action="options.php">
            <?php settings_fields( 'asp_engines_group' ); ?>

            <h2>Instant notification (event-driven)</h2>
            <table class="form-table">
                <tr><th>On update</th><td><?php self::checkbox( 'asp_ping_on_update', 'Re-notify engines when a published post is edited', 'Keeps search/AI engines synced with refreshed content. Unpublish/trash sends a removal notice.' ); ?></td></tr>
                <tr><th><label>Debounce (seconds)</label></th><td><input type="number" name="asp_debounce_seconds" min="0" value="<?php echo esc_attr( ASP_Options::get( 'asp_debounce_seconds' ) ); ?>" class="small-text" /> <span class="description">Ignore repeat edits to the same post within this window.</span></td></tr>
            </table>

            <h2>Search engines</h2>
            <table class="form-table">
                <tr><th>IndexNow</th><td><?php self::checkbox( 'asp_indexnow_enabled', 'Enable IndexNow', 'One call notifies Bing, Yandex, Naver, Seznam, Yep and other participants. Key file: <code>' . esc_html( ASP_IndexNow::key_location() ) . '</code>' ); ?></td></tr>
                <tr><th>Google Indexing API</th><td><?php self::checkbox( 'asp_google_indexing', 'Send URLs to Google Indexing API', 'Google officially supports this only for job-posting and livestream pages; for normal posts it may be ignored. Google normally discovers posts via the sitemap + WebSub + Search Console below.' ); ?></td></tr>
                <tr><th><label>Search Console property</label></th><td><input type="text" name="asp_gsc_property" value="<?php echo esc_attr( ASP_Options::get( 'asp_gsc_property' ) ); ?>" class="regular-text" placeholder="<?php echo esc_attr( trailingslashit( home_url() ) ); ?>" /><p class="description">Exactly as in Search Console (URL-prefix with trailing slash, or <code>sc-domain:example.com</code>). Blank = site URL.</p></td></tr>
            </table>

            <h2>News &amp; feed aggregators</h2>
            <table class="form-table">
                <tr><th>WebSub</th><td><?php self::checkbox( 'asp_websub_enabled', 'Push feed updates via WebSub hubs', 'Google\'s hub delivers new items to subscribers instantly. Hub links are also added to your feeds.' ); ?><textarea name="asp_websub_hubs" rows="3" class="large-text code"><?php echo esc_textarea( ASP_Options::get( 'asp_websub_hubs' ) ); ?></textarea></td></tr>
                <tr><th>XML-RPC ping</th><td><?php self::checkbox( 'asp_xmlrpc_enabled', 'Ping blog/news services', 'Ping-O-Matic fans out to many blog search and news aggregators. One URL per line.' ); ?><textarea name="asp_xmlrpc_services" rows="3" class="large-text code"><?php echo esc_textarea( ASP_Options::get( 'asp_xmlrpc_services' ) ); ?></textarea></td></tr>
                <tr><th>Google News sitemap</th><td><?php self::checkbox( 'asp_news_sitemap', 'Serve /news-sitemap.xml (last 48h)', 'URL: <code>' . esc_html( ASP_News_Sitemap::url() ) . '</code>. Also added to robots.txt and submitted to Search Console.' ); ?></td></tr>
                <tr><th><label>Publication name</label></th><td><input type="text" name="asp_news_publication" value="<?php echo esc_attr( ASP_Options::get( 'asp_news_publication' ) ); ?>" class="regular-text" placeholder="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" /> <span class="description">Must match the name in Google Publisher Center.</span></td></tr>
                <tr><th>News post types</th><td><?php foreach ( $types as $pt ) : ?><label style="display:block"><input type="checkbox" name="asp_news_post_types[]" value="<?php echo esc_attr( $pt->name ); ?>" <?php checked( in_array( $pt->name, $news, true ) ); ?> /> <?php echo esc_html( $pt->label ); ?></label><?php endforeach; ?></td></tr>
            </table>

            <h2>AEO / GEO (answer &amp; AI engines)</h2>
            <table class="form-table">
                <tr><th>JSON-LD schema</th><td>
                    <select name="asp_schema_mode">
                        <?php foreach ( [ 'auto' => 'Auto (skip if Yoast / Rank Math / AIOSEO / SEOPress active)', 'on' => 'Always on', 'off' => 'Off' ] as $v => $l ) : ?>
                            <option value="<?php echo esc_attr( $v ); ?>" <?php selected( ASP_Options::get( 'asp_schema_mode' ), $v ); ?>><?php echo esc_html( $l ); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <select name="asp_schema_type">
                        <?php foreach ( [ 'NewsArticle', 'Article' ] as $v ) : ?>
                            <option <?php selected( ASP_Options::get( 'asp_schema_type' ), $v ); ?>><?php echo esc_html( $v ); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description">Outputs Article, Organization, WebSite and speakable data.</p>
                    <?php self::checkbox( 'asp_schema_faq', 'Auto-generate FAQPage from question headings (H2–H4 ending with ? or ؟ followed by a paragraph)' ); ?>
                </td></tr>
                <tr><th>llms.txt</th><td><?php self::checkbox( 'asp_llms_txt', 'Serve /llms.txt', 'A markdown map of your sections and latest articles for LLM crawlers: <code>' . esc_html( home_url( '/llms.txt' ) ) . '</code>' ); ?></td></tr>
                <tr><th>AI crawlers in robots.txt</th><td>
                    <select name="asp_ai_bots">
                        <?php foreach ( [ 'allow' => 'Explicitly allow (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)', 'block' => 'Block them', 'off' => 'Do not touch robots.txt' ] as $v => $l ) : ?>
                            <option value="<?php echo esc_attr( $v ); ?>" <?php selected( ASP_Options::get( 'asp_ai_bots' ), $v ); ?>><?php echo esc_html( $l ); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description">Only applies to WordPress' virtual robots.txt (no physical robots.txt file in the web root).</p>
                </td></tr>
            </table>
            <h2>Site verification</h2>
            <table class="form-table">
                <tr><th>Google HTML files</th><td><textarea name="asp_verify_files" rows="2" class="large-text code"><?php echo esc_textarea( ASP_Options::get( 'asp_verify_files' ) ); ?></textarea><p class="description">One filename per line (e.g. <code>googlef68854144a6863be.html</code>). Served at the site root with the correct content. Not needed if a real file with that name already exists on the server.</p></td></tr>
                <tr><th>Meta tags</th><td>
                    <p><label>Google <input type="text" name="asp_verify_google" value="<?php echo esc_attr( get_option( 'asp_verify_google', '' ) ); ?>" class="regular-text" /></label></p>
                    <p><label>Bing <input type="text" name="asp_verify_bing" value="<?php echo esc_attr( get_option( 'asp_verify_bing', '' ) ); ?>" class="regular-text" /></label></p>
                    <p><label>Yandex <input type="text" name="asp_verify_yandex" value="<?php echo esc_attr( get_option( 'asp_verify_yandex', '' ) ); ?>" class="regular-text" /></label></p>
                    <p class="description">Content value only, from each engine's "HTML tag" verification option.</p>
                </td></tr>
            </table>

            <?php submit_button( 'Save Engines & AI' ); ?>
        </form>
        <?php
    }

    public static function row_actions( $actions, $post ) {
        if ( $post->post_status === 'publish' && current_user_can( 'manage_options' ) && in_array( $post->post_type, ASP_Options::post_types(), true ) ) {
            $url = wp_nonce_url( admin_url( 'admin-post.php?action=asp_ping_post&post=' . $post->ID ), 'asp_ping_post_' . $post->ID );
            $actions['asp_ping'] = '<a href="' . esc_url( $url ) . '">Ping now</a>';
        }
        return $actions;
    }

    public static function handle_ping_post() {
        $id = absint( $_GET['post'] ?? 0 );
        check_admin_referer( 'asp_ping_post_' . $id );
        if ( current_user_can( 'manage_options' ) && $id ) ASP_Dispatcher::enqueue( $id, 'update', 5 );
        wp_safe_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&tab=status&pinged=1' ) );
        exit;
    }

    // ── form handlers ────────────────────────────────────────────────────────

    public static function handle_disconnect() {
        check_admin_referer( 'asp_disconnect_google' );
        if ( current_user_can( 'manage_options' ) ) ASP_Google_Auth::disconnect();
        wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger' ) );
        exit;
    }

    public static function handle_run_now() {
        check_admin_referer( 'asp_run_now' );
        if ( current_user_can( 'manage_options' ) ) ASP_Cron::run_task();
        wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&tab=status&run_done=1' ) );
        exit;
    }

    public static function handle_clear_logs() {
        check_admin_referer( 'asp_clear_logs' );
        if ( current_user_can( 'manage_options' ) ) {
            global $wpdb;
            $wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}asp_logs" );
        }
        wp_redirect( admin_url( 'options-general.php?page=auto-seo-pinger&tab=status' ) );
        exit;
    }
}
