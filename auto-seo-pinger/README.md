# AutoSEO Pinger 2.0

## What's new in 2.0

Event-driven pipeline: publishing, **editing** or unpublishing a post queues it (30s later) to every enabled engine. The hourly cron is now only a safety net.

| Layer | Feature |
|---|---|
| SEO | **IndexNow** (Bing, Yandex, Naver, Seznam, Yep), Search Console sitemap submit, optional Google Indexing API |
| News | **`/news-sitemap.xml`** (Google News format, last 48h, auto-added to robots.txt), **WebSub** hubs (+ hub links in feeds), XML-RPC pings (Ping-O-Matic etc.) |
| AEO | NewsArticle/Article, Organization, WebSite, speakable and auto-detected **FAQPage** JSON-LD (skipped if Yoast/Rank Math/AIOSEO/SEOPress is active) |
| GEO | **`/llms.txt`**, explicit allow/block rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. |

Removed: the old `google.com/ping` call (shut down by Google in 2023, always failed).

### Getting into Google News
No plugin can force inclusion. Register the site in **Google Publisher Center**, add `/news-sitemap.xml` in Search Console, and make sure the *Publication name* setting matches Publisher Center. Google News also expects clear bylines, dates and original reporting.

### Notes
- Settings → AutoSEO Pinger → **Engines & AI** tab holds all new options.
- Needs working WP-Cron (or a real system cron hitting `wp-cron.php`) for the 30s queue.
- If the server has a physical `robots.txt`, the robots/AI-bot additions won't apply; add the lines by hand.

# AutoSEO Pinger (original docs)

Automatically pushes new WordPress posts to Google, pings Search Console, and sends GA4 events — all hands-free.

---

## Installation

1. Upload the `auto-seo-pinger` folder to `/wp-content/plugins/`.
2. Activate the plugin in **Plugins → Installed Plugins**.
3. Go to **Settings → AutoSEO Pinger** to configure.

---

## Setup Guide

### Step 1 — Google Cloud Project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Enable these APIs:
   - **Google Search Console API**
   - **Web Search Indexing API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
5. Application type: **Web application**.
6. Add the Authorised Redirect URI shown on the plugin's Settings page.
7. Copy the **Client ID** and **Client Secret** into the plugin settings.

### Step 2 — GA4 Measurement Protocol

1. In Google Analytics, open your GA4 property.
2. Go to **Admin → Data Streams → (your stream)**.
3. Scroll to **Measurement Protocol API secrets** and create a new secret.
4. Copy the **Measurement ID** (e.g. `G-XXXXXXXXXX`) and **API Secret** into the plugin settings.

### Step 3 — Connect Google Account

1. Save your credentials.
2. Click **Connect Google Account** — you'll be redirected to Google's OAuth consent screen.
3. Approve access. You'll be redirected back with a "Connected" confirmation.

### Step 4 — Configure Scheduling

| Setting             | Recommended       |
|---------------------|-------------------|
| Check Interval      | Hourly            |
| Post Types          | Post, Page        |
| Retry Attempts      | 3                 |
| Log Retention       | 30 days           |

---

## How It Works

Every time the scheduled cron fires (default: hourly) the plugin:

1. Queries WordPress for posts published since the last run.
2. Submits each URL to **Google's Indexing API** (fastest path to indexing).
3. Sends a classic **ping** to `google.com/ping` as a fallback.
4. Fires a `new_post_published` event to **GA4** via Measurement Protocol.
5. Re-submits your **XML sitemap** to Search Console.
6. Logs every action to the Status & Logs tab.

Failed actions are automatically retried up to the configured retry limit, and errors trigger an email notification.

---

## FAQ

**Does this replace Yoast / RankMath?**  
No. Those plugins handle on-page SEO. This plugin handles *indexing speed* — getting Google to notice new content faster.

**Will the cron fire if no one visits the site?**  
WordPress cron is triggered by site visits. For low-traffic sites, use a server-level cron to hit `wp-cron.php` directly (see [WP documentation](https://developer.wordpress.org/plugins/cron/hooking-wp-cron-into-the-system-task-scheduler/)).

**Is my token stored securely?**  
OAuth tokens are stored in the WordPress `options` table, encrypted at rest if you use a security plugin (e.g. Wordfence). The client secret is never exposed publicly.
