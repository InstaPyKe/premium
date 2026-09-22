-- ====================================================================
-- PremiumStore PostgreSQL Database Schema & Initial Data
-- Database Name: whatsapp
-- ====================================================================

-- 1. Enable UUID Extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABLE 1: apps (Application Catalog)
-- ====================================================================
CREATE TABLE IF NOT EXISTS apps (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Utilities',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.15,
    original_price NUMERIC(10, 2) NOT NULL DEFAULT 1.54,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
    rating_count INT NOT NULL DEFAULT 1,
    downloads INT NOT NULL DEFAULT 0,
    version VARCHAR(50) DEFAULT '1.0.0',
    size VARCHAR(50) DEFAULT '25.0 MB',
    platform VARCHAR(255) DEFAULT 'Android / Windows / macOS / iOS',
    cover_image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    release_notes TEXT,
    download_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured);

-- ====================================================================
-- TABLE 2: users (Customer Accounts & Authentication)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    device_id VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ====================================================================
-- TABLE 3: orders (Purchases, Checkout, Digital Vault & License Keys)
-- ====================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    customer_email VARCHAR(255) NOT NULL,
    customer_username VARCHAR(100),
    customer_phone VARCHAR(50) DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
    formatted_total VARCHAR(50),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    mpesa_ref VARCHAR(100),
    kcb_ref VARCHAR(100),
    paybill_number VARCHAR(50) DEFAULT '522533',
    account_number VARCHAR(50) DEFAULT '8106675',
    account_name VARCHAR(100) DEFAULT 'JASPER MARKETS',
    referrer_username VARCHAR(100),
    referral_commission_usd NUMERIC(10, 2) DEFAULT 0.00,
    download_token VARCHAR(255),
    download_url TEXT,
    license_key VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    cleared_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);
CREATE INDEX IF NOT EXISTS idx_orders_referrer ON orders(referrer_username);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ====================================================================
-- TABLE 4: ratings (App Ratings & Reviews with Device Duplication Lock)
-- ====================================================================
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    app_id VARCHAR(100) NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    score NUMERIC(2, 1) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_app_device UNIQUE (app_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_app_id ON ratings(app_id);

-- ====================================================================
-- TABLE 5: referrals (30% Commission Affiliates & Profiles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS referrals (
    username VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    total_clicks INT NOT NULL DEFAULT 0,
    successful_orders INT NOT NULL DEFAULT 0,
    total_revenue_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_commission_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    balance_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_payouts_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(email);

-- ====================================================================
-- TABLE 6: payout_requests (Affiliate Payout Requests & Approvals)
-- ====================================================================
CREATE TABLE IF NOT EXISTS payout_requests (
    id VARCHAR(100) PRIMARY KEY,
    referrer_username VARCHAR(100) NOT NULL REFERENCES referrals(username) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    amount_usd NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    mpesa_number VARCHAR(50),
    account_details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payouts_referrer ON payout_requests(referrer_username);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payout_requests(status);

-- ====================================================================
-- TABLE 7: claimed_rewards (Free App Milestone Reward Claims)
-- ====================================================================
CREATE TABLE IF NOT EXISTS claimed_rewards (
    id SERIAL PRIMARY KEY,
    referrer_username VARCHAR(100) NOT NULL REFERENCES referrals(username) ON DELETE CASCADE,
    milestone_id VARCHAR(50) NOT NULL,
    app_id VARCHAR(100) NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    app_title VARCHAR(255),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_referrer_milestone UNIQUE (referrer_username, milestone_id)
);

-- ====================================================================
-- TABLE 8: settings (Store Configuration, Gateways & Support)
-- ====================================================================
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    site_title VARCHAR(255) DEFAULT 'PremiumStore',
    support_whatsapp VARCHAR(50) DEFAULT '447455909204',
    support_phone VARCHAR(50) DEFAULT '+447455909204',
    support_email VARCHAR(255) DEFAULT 'support@premiumstore.app',
    paybill_number VARCHAR(50) DEFAULT '522533',
    account_number VARCHAR(50) DEFAULT '8106675',
    account_name VARCHAR(100) DEFAULT 'JASPER MARKETS',
    mpesa_active BOOLEAN DEFAULT TRUE,
    card_active BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'System undergoing scheduled upgrades.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- TABLE 9: visitors (Live Visitor Telemetry, Activity & Cart Tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS visitors (
    id VARCHAR(100) PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    username VARCHAR(100) DEFAULT 'Anonymous Guest',
    phone VARCHAR(50) DEFAULT '',
    current_page VARCHAR(255) DEFAULT 'Marketplace Storefront',
    page_views INT NOT NULL DEFAULT 1,
    country VARCHAR(100) DEFAULT 'Global',
    flag VARCHAR(20) DEFAULT '🌐',
    currency VARCHAR(10) DEFAULT 'USD',
    device_type VARCHAR(50) DEFAULT 'Desktop',
    browser VARCHAR(50) DEFAULT 'Chrome',
    os VARCHAR(50) DEFAULT 'Windows',
    referrer TEXT DEFAULT 'Direct Search / Bookmark',
    cart_count INT NOT NULL DEFAULT 0,
    cart_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visitors_device_id ON visitors(device_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

-- Insert Default Settings (if not existing)
INSERT INTO settings (id, site_title, support_whatsapp, support_phone, support_email, paybill_number, account_number, account_name, mpesa_active, card_active, maintenance_mode, maintenance_message)
VALUES ('default', 'PremiumStore', '447455909204', '+447455909204', 'support@premiumstore.app', '522533', '8106675', 'JASPER MARKETS', TRUE, TRUE, FALSE, 'System undergoing scheduled upgrades.')
ON CONFLICT (id) DO NOTHING;

-- Insert Default Application Catalog
INSERT INTO apps (id, title, tagline, category, price, original_price, rating, rating_count, downloads, version, size, platform, cover_image, gallery, description, features, release_notes, download_url, featured, status)
VALUES 
(
    'app_adblocker_pro',
    'AdBlocker Pro Shield Ultimate',
    'System-wide ad, popup, video ads & malware tracker blocker with encrypted DNS filter',
    'Utilities',
    0.77,
    1.54,
    5.0,
    740,
    29800,
    '7.18.4',
    '24.8 MB',
    'Android / Windows / macOS / iOS / Chrome / Firefox / Safari',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'AdBlocker Pro Shield Ultimate delivers military-grade system-wide ad and tracker blocking across all apps, browsers, and streaming platforms. Eliminates unskippable video ads, annoying popups, cookie consent overlays, telemetry tracking spyware, and phishing domains.',
    '["System-wide ad blocking across all apps, web browsers, games, and streaming", "Blocks unskippable video ads (YouTube, Twitch), popups, and banner overlays", "Integrated Privacy Shield preventing tracking telemetry and profiling spyware", "Encrypted DNS filtering (DoH / DoT) with 40% faster web page load speeds"]'::jsonb,
    'v7.18.4: Upgraded 2026 YouTube video ad-block filters, integrated encrypted DoH protocol, and optimized battery consumption.',
    'https://vault-storage.app/packages/adblocker-pro-shield-v7.18.4.apk',
    TRUE,
    'published'
),
(
    'app_moviebox_pro',
    'MovieBox Pro VIP Cinema',
    'VIP 4K HDR movie streaming, trending TV series & unlimited offline caching',
    'Entertainment',
    3.85,
    5.75,
    4.9,
    840,
    34200,
    '15.4.2',
    '56.0 MB',
    'Android / iOS / Windows / macOS / Android TV',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'MovieBox Pro VIP delivers unrestricted access to thousands of blockbuster movies, trending television series, and anime in pristine 4K UHD and 1080p 60FPS. Experience zero advertisements, multi-language synchronized subtitles, and seamless offline downloads.',
    '["Multi-server VIP 4K UHD & 1080p high-bitrate streaming", "1-Click batch download and offline playback without internet", "Zero advertisements, sponsored popups, or buffering delays", "Dolby Atmos sound support & auto-synchronized subtitles"]'::jsonb,
    'v15.4.2: Added Dolby Atmos sound decoding, Apple TV / AirPlay 2 screen mirroring, and renewed VIP movie cloud servers.',
    'https://vault-storage.app/packages/moviebox-pro-v15.4.2.apk',
    TRUE,
    'published'
),
(
    'app_vpn_china_pro',
    'VPN China Premium (GFW Bypass)',
    'Stealth Shadowsocks, V2Ray & Trojan protocol tunnels for mainland China entry & exit',
    'VPN & Security',
    3.85,
    5.75,
    5.0,
    520,
    19500,
    '8.3.0',
    '36.5 MB',
    'Android / Windows / macOS / iOS / Linux / Router',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'VPN China Premium is engineered with specialized obfuscated stealth protocols designed specifically to bypass the Great Firewall of China (GFW). Provides high-speed IPLC dedicated low-ping routes.',
    '["Obfuscated Stealth tunnels bypassing the Great Firewall of China (GFW)", "Dedicated IPLC / BGP direct transit lines with <35ms ultra-low ping", "Shadowrocket, V2Ray (VMess/VLESS), Trojan-GFW, and Hysteria 2 protocols", "Unlocks Google, YouTube, ChatGPT, TikTok, WhatsApp & Netflix anywhere"]'::jsonb,
    'v8.3.0: Deployed Hysteria 2 protocol support, dynamic node rotation, and automated DPI packet camouflage.',
    'https://vault-storage.app/packages/vpn-china-pro-v8.3.0.zip',
    TRUE,
    'published'
),
(
    'app_spotify_pro',
    'Spotify Ultra HiFi Premium',
    'Lossless FLAC 24-bit audio streaming, unlimited skips, zero ads & offline music downloads',
    'Entertainment',
    0.38,
    1.54,
    4.9,
    1240,
    48900,
    '8.9.18',
    '38.2 MB',
    'Android / Windows / macOS / iOS',
    'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'Spotify Ultra HiFi Premium unlocks master-quality 24-bit 96kHz FLAC audio, unlimited track skips, on-demand playback, background playback, and batch MP3/FLAC offline caching.',
    '["Master-quality 24-bit 96kHz Lossless FLAC & 320kbps extreme audio", "Zero audio, banner or interstitial advertisements", "Unlimited skips and full on-demand playlist curation", "Offline song & podcast downloader with metadata preservation"]'::jsonb,
    'v8.9.18: Enabled HiFi master audio toggle, animated Canvas lyrics support, and improved Bluetooth LDAC codec streaming.',
    'https://vault-storage.app/packages/spotify-ultra-hifi-v8.9.18.apk',
    TRUE,
    'published'
),
(
    'app_101',
    'TaskFlow Pro Workspace',
    'Enterprise-grade automation & offline project synchronization',
    'Productivity',
    0.38,
    1.54,
    4.9,
    128,
    2450,
    '2.4.0',
    '48.5 MB',
    'Android / Windows / macOS',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'TaskFlow Pro is a high-performance productivity workstation engineered for modern teams and individual power users. Features real-time local SQLite database sync, Kanban workflows, Gantt visualizer, and custom automation scripts.',
    '["Instant local-first offline storage with end-to-end encryption", "Visual Gantt and Kanban board drag-and-drop managers", "Automated webhook triggers and calendar synchronization", "Built-in Markdown documentation and formula calculator"]'::jsonb,
    'v2.4.0: Added sub-task dependency tracking and optimized memory footprint by 35%.',
    'https://vault-storage.app/packages/taskflow-pro-v2.4.0.zip',
    FALSE,
    'published'
),
(
    'app_102',
    'NeuroStudio AI Studio',
    'On-device neural image rendering and generative design engine',
    'AI Solutions',
    3.85,
    5.75,
    4.8,
    94,
    1890,
    '1.8.2',
    '124.0 MB',
    'Android APK / Windows x64',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'Leverage quantized on-device neural models to generate, upscale, and enhance high-resolution artwork and vector graphics without cloud latency or monthly subscriptions.',
    '["Local Stable Diffusion & Latent Upscaler acceleration", "Smart background removal & generative in-painting", "4K batch rendering with multi-core GPU support", "Zero cloud telemetry — 100% private processing"]'::jsonb,
    'v1.8.2: GPU acceleration upgrade for Vulkan & Metal backends, prompt history persistence.',
    'https://vault-storage.app/packages/neurostudio-ai-v1.8.2.apk',
    FALSE,
    'published'
),
(
    'app_103',
    'PulseConnect Social Hub',
    'Decentralized P2P encrypted messaging & community channels',
    'Social Apps',
    0.23,
    1.54,
    4.7,
    210,
    5120,
    '3.1.0',
    '32.1 MB',
    'Android / iOS / Desktop',
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'Next-generation private messaging application utilizing peer-to-peer mesh networks, zero-knowledge proofs, and voice/video crystal-clear spatial audio.',
    '["Peer-to-peer encrypted voice and video calls", "Self-destructing group channels and ephemeral media", "Low-bandwidth mesh mode over Bluetooth and Wi-Fi Direct", "Custom sticker studio and dynamic voice changers"]'::jsonb,
    'v3.1.0: End-to-end group voice rooms with up to 100 participants, encrypted file transfer up to 4GB.',
    'https://vault-storage.app/packages/pulseconnect-v3.1.0.apk',
    FALSE,
    'published'
)
ON CONFLICT (id) DO NOTHING;
