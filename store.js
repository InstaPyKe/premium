/**
 * PremiumStore - Shared Data & State Management Core
 * Handles localStorage persistence, cross-tab synchronization,
 * catalog management, multi-currency engine, order processing, rating engines, image storage, and system controls.
 */

(function (window) {
    'use strict';

    const STORAGE_KEYS = {
        APPS: 'premiumstore_apps_v5',
        ORDERS: 'premiumstore_orders_v2',
        SETTINGS: 'premiumstore_settings_v2',
        CART: 'premiumstore_cart_v2',
        USER_RATINGS: 'premiumstore_user_ratings_v2',
        DEVICE_ID: 'premiumstore_device_id_v2',
        CURRENCY: 'premiumstore_selected_currency_v2',
        AUTH_USER: 'premiumstore_auth_user_v2',
        REFERRALS: 'premiumstore_referrals_v1',
        ACTIVE_REFERRER: 'premiumstore_active_referrer_v1'
    };

    // Supported Countries & Currencies with Live Conversion Matrix
    const CURRENCIES = {
        USD: { code: 'USD', name: 'US Dollar', country: 'United States', flag: '🇺🇸', symbol: '$', rate: 1.0, decimals: 2 },
        KES: { code: 'KES', name: 'Kenya Shilling', country: 'Kenya', flag: '🇰🇪', symbol: 'Ksh ', rate: 130.0, decimals: 0 },
        GBP: { code: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', symbol: '£', rate: 0.78, decimals: 2 },
        EUR: { code: 'EUR', name: 'Euro', country: 'European Union', flag: '🇪🇺', symbol: '€', rate: 0.92, decimals: 2 },
        NGN: { code: 'NGN', name: 'Nigerian Naira', country: 'Nigeria', flag: '🇳🇬', symbol: '₦', rate: 1500.0, decimals: 0 },
        ZAR: { code: 'ZAR', name: 'South African Rand', country: 'South Africa', flag: '🇿🇦', symbol: 'R ', rate: 18.2, decimals: 2 },
        AED: { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', flag: '🇦🇪', symbol: 'AED ', rate: 3.67, decimals: 2 },
        INR: { code: 'INR', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', symbol: '₹', rate: 84.0, decimals: 0 },
        CAD: { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', symbol: 'CA$', rate: 1.36, decimals: 2 },
        TZS: { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania', flag: '🇹🇿', symbol: 'TSh ', rate: 2600.0, decimals: 0 },
        UGX: { code: 'UGX', name: 'Ugandan Shilling', country: 'Uganda', flag: '🇺🇬', symbol: 'USh ', rate: 3700.0, decimals: 0 },
        RWF: { code: 'RWF', name: 'Rwandan Franc', country: 'Rwanda', flag: '🇷🇼', symbol: 'RF ', rate: 1350.0, decimals: 0 }
    };

    // Generate or fetch a unique device ID to prevent duplicate ratings
    function getDeviceId() {
        let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
        }
        return deviceId;
    }

    // Initial Premium Applications Catalog with high-resolution imagery
    // Note: All product prices are strictly bounded between 20 Ksh and 200 Ksh ($0.15 – $1.54 USD at 130 KES/USD)
    const DEFAULT_APPS = [
        {
            id: 'app_moviebox_pro',
            title: 'MovieBox Pro VIP Cinema',
            tagline: 'VIP 4K HDR movie streaming, trending TV series & unlimited offline caching',
            category: 'Entertainment',
            price: 1.54,
            originalPrice: 2.30,
            rating: 4.9,
            ratingCount: 840,
            downloads: 34200,
            version: '15.4.2',
            size: '56.0 MB',
            platform: 'Android / iOS / Windows / macOS / Android TV',
            coverImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'MovieBox Pro VIP delivers unrestricted access to thousands of blockbuster movies, trending television series, and anime in pristine 4K UHD and 1080p 60FPS. Experience zero advertisements, multi-language synchronized subtitles, high-speed VIP servers, and seamless offline downloads.',
            features: [
                'Multi-server VIP 4K UHD & 1080p high-bitrate streaming',
                '1-Click batch download and offline playback without internet',
                'Zero advertisements, sponsored popups, or buffering delays',
                'Dolby Atmos sound support & auto-synchronized subtitles'
            ],
            releaseNotes: 'v15.4.2: Added Dolby Atmos sound decoding, Apple TV / AirPlay 2 screen mirroring, and renewed VIP movie cloud servers.',
            downloadUrl: 'https://vault-storage.app/packages/moviebox-pro-v15.4.2.apk',
            featured: true,
            status: 'published',
            createdAt: '2026-09-08T10:00:00Z'
        },
        {
            id: 'app_vpn_china_pro',
            title: 'VPN China Premium (GFW Bypass)',
            tagline: 'Stealth Shadowsocks, V2Ray & Trojan protocol tunnels for mainland China entry & exit',
            category: 'VPN & Security',
            price: 1.54,
            originalPrice: 2.30,
            rating: 5.0,
            ratingCount: 520,
            downloads: 19500,
            version: '8.3.0',
            size: '36.5 MB',
            platform: 'Android / Windows / macOS / iOS / Linux / Router',
            coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'VPN China Premium is engineered with specialized obfuscated stealth protocols designed specifically to bypass the Great Firewall of China (GFW). Provides high-speed IPLC dedicated low-ping gaming routes, unlocking international platforms (Google, YouTube, ChatGPT, Netflix, WhatsApp) inside China and providing secure reverse access into China.',
            features: [
                'Obfuscated Stealth tunnels bypassing the Great Firewall of China (GFW)',
                'Dedicated IPLC / BGP direct transit lines with <35ms ultra-low ping',
                'Shadowrocket, V2Ray (VMess/VLESS), Trojan-GFW, and Hysteria 2 protocols',
                'Unlocks Google, YouTube, ChatGPT, TikTok, WhatsApp & Netflix anywhere'
            ],
            releaseNotes: 'v8.3.0: Deployed Hysteria 2 protocol support, dynamic node rotation, and automated DPI packet camouflage.',
            downloadUrl: 'https://vault-storage.app/packages/vpn-china-pro-v8.3.0.zip',
            featured: true,
            status: 'published',
            createdAt: '2026-09-08T10:10:00Z'
        },
        {
            id: 'app_spotify_pro',
            title: 'Spotify Premium Music & Hi-Fi',
            tagline: 'Lossless 320kbps audio, unlimited song skips, offline downloads & AI DJ',
            category: 'Music & Audio',
            price: 1.35,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 960,
            downloads: 41800,
            version: '8.9.74',
            size: '68.0 MB',
            platform: 'Android / Windows / macOS / iOS / WearOS',
            coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Spotify Premium unlocks the ultimate music and podcast experience. Listen to over 100 million tracks in 320kbps Extreme Master audio quality, download full albums and playlists for offline playback, skip unlimited tracks with zero advertisements, and discover new sounds with smart AI DJ.',
            features: [
                'Extreme 320kbps & FLAC master quality audio streaming',
                'Offline music and podcast downloading for playback anywhere',
                '100% ad-free listening with unlimited track skips and repeats',
                'Real-time synced lyrics, personalized AI DJ, and Spotify Connect'
            ],
            releaseNotes: 'v8.9.74: Enabled lossless audio cache engine, enhanced playlist smart shuffle, and upgraded offline equalizer.',
            downloadUrl: 'https://vault-storage.app/packages/spotify-premium-v8.9.74.apk',
            featured: true,
            status: 'published',
            createdAt: '2026-09-08T10:20:00Z'
        },
        {
            id: 'app_telegram_pro',
            title: 'Telegram Premium Ultimate',
            tagline: '4GB mega-uploads, fastest download speeds, voice-to-text & VIP star badges',
            category: 'Social Apps',
            price: 1.38,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 710,
            downloads: 28900,
            version: '10.14.5',
            size: '72.4 MB',
            platform: 'Android / iOS / Windows / macOS / Linux',
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Telegram Premium elevates your cloud messaging to unmatched productivity and speed. Upload media files up to 4GB each, enjoy ultra-fast uncapped download speeds, transcribe voice messages to text with 1 tap, translate foreign chats in real time, and customize your profile with exclusive animated badges.',
            features: [
                '4GB maximum file upload limit with uncapped download speeds',
                'Instant automated Voice-to-Text audio message transcription',
                'Real-time entire chat translation for 100+ international languages',
                'Premium animated emoji reactions, profile star badge & custom folder icons'
            ],
            releaseNotes: 'v10.14.5: Upgraded voice transcription engine, added custom channel boosts, and enhanced cloud media caching.',
            downloadUrl: 'https://vault-storage.app/packages/telegram-premium-v10.14.5.apk',
            featured: true,
            status: 'published',
            createdAt: '2026-09-08T10:30:00Z'
        },
        {
            id: 'app_x_premium',
            title: 'X Premium Pro (Twitter Blue)',
            tagline: 'Verified checkmark, Grok AI integration, 25k char posts & 50% fewer ads',
            category: 'Social Apps',
            price: 1.35,
            originalPrice: 1.54,
            rating: 4.8,
            ratingCount: 630,
            downloads: 26400,
            version: '10.58.0',
            size: '85.0 MB',
            platform: 'Android / iOS / Windows / Web App',
            coverImage: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'X Premium Pro provides creators, professionals, and thought leaders with enhanced visibility and cutting-edge features. Gain an official verified checkmark, access the Grok 2 AI assistant, publish long-form posts up to 25,000 characters, upload 3-hour 1080p videos, and edit published posts.',
            features: [
                'Official Verified Blue checkmark and prioritized reply rankings',
                'Built-in Grok 2 AI assistant with real-time web intelligence',
                'Edit published posts within 1 hour and compose up to 25,000 characters',
                '1080p 3-hour video uploads and ad revenue sharing analytics hub'
            ],
            releaseNotes: 'v10.58.0: Integrated Grok 2 mini, enabled long-form article publishing, and reduced video playback buffering.',
            downloadUrl: 'https://vault-storage.app/packages/x-premium-pro-v10.58.0.apk',
            featured: true,
            status: 'published',
            createdAt: '2026-09-08T10:40:00Z'
        },
        {
            id: 'app_discord_nitro',
            title: 'Discord Nitro & Premium Suite',
            tagline: 'Custom emojis everywhere, 500MB uploads, 4K 60FPS stream & 2 Free Server Boosts',
            category: 'Gaming & Community',
            price: 1.15,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 890,
            downloads: 38700,
            version: '242.16',
            size: '104.0 MB',
            platform: 'Android / Windows / macOS / iOS / Linux',
            coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Discord Nitro unlocks the pinnacle of gaming communication and community interaction. Stream your games in glorious 4K 60FPS, share large files up to 500MB, use custom animated emojis and soundboard sounds in any server, power your favorite servers with 2 free boosts, and express yourself with dynamic profile themes.',
            features: [
                'Use custom animated emojis and soundboard clips in any server',
                '500MB high-capacity file sharing and HD 4K 60FPS screen streaming',
                '2 Free Server Boosts included + 30% discount on extra boost packs',
                'Custom animated profile banner, avatar decorations, and special Nitro badge'
            ],
            releaseNotes: 'v242.16: Added new seasonal profile themes, soundboard clip sequencer, and low-latency 4K screen sharing.',
            downloadUrl: 'https://vault-storage.app/packages/discord-nitro-suite-v242.16.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-09-08T10:50:00Z'
        },
        {
            id: 'app_proxy_master_pro',
            title: 'Proxy Master Pro Security Shield',
            tagline: 'High-speed global proxy network, zero-log privacy & firewall unblocker',
            category: 'VPN & Security',
            price: 0.31,
            originalPrice: 1.54,
            rating: 4.7,
            ratingCount: 380,
            downloads: 15400,
            version: '5.4.1',
            size: '28.2 MB',
            platform: 'Android / Windows / iOS / Chrome Extension',
            coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Proxy Master Pro provides seamless one-click internet freedom and personal data encryption. Connect through 6,000+ proxy servers across 85+ countries, bypass geo-restrictions and institutional firewalls, protect your WiFi traffic on public networks, and maintain absolute browsing anonymity.',
            features: [
                '6,000+ high-speed proxy servers across 85+ global regions',
                '1-Tap connection with intelligent automatic server selection',
                'Military-grade 256-bit SSL encryption and strict zero-log policy',
                'Unblock restricted apps, school/work firewalls, and streaming sites'
            ],
            releaseNotes: 'v5.4.1: Upgraded proxy routing speed by 30%, fixed DNS leak on IPv6 networks, and improved power consumption.',
            downloadUrl: 'https://vault-storage.app/packages/proxy-master-pro-v5.4.1.apk',
            featured: false,
            status: 'published',
            createdAt: '2026-09-08T11:00:00Z'
        },
        {
            id: 'app_capcut_pro',
            title: 'CapCut Pro Video & AI Studio',
            tagline: 'VIP 4K 60FPS video editor, AI body effects & dynamic chroma key suite',
            category: 'Design & Media',
            price: 1.46,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 412,
            downloads: 14850,
            version: '12.6.0',
            size: '185.0 MB',
            platform: 'Android / Windows / macOS / iOS',
            coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'CapCut Pro unlocks the full creative potential for video creators, TikTokers, and filmmakers. Enjoy unlimited access to VIP transition animations, AI background auto-removal, 4K 60FPS crystal-clear export, velocity curve speed ramps, multi-track audio mastering, and zero-watermark rendering.',
            features: [
                'Unlimited VIP effects, dynamic filters, and velocity curves',
                'AI smart auto-captioning and speech-to-text generator',
                '4K 60FPS Ultra HD zero-watermark lossless export',
                'Advanced optical flow slow-motion and chroma key compositing'
            ],
            releaseNotes: 'v12.6.0: Enhanced AI smart cutouts, added 120+ 3D transition presets, and optimized multi-layer render pipeline.',
            downloadUrl: 'https://vault-storage.app/packages/capcut-pro-v12.6.0.zip',
            featured: true,
            status: 'published',
            createdAt: '2026-09-07T08:00:00Z'
        },
        {
            id: 'app_tiktok_pro',
            title: 'TikTok Pro Creator Suite',
            tagline: 'Ad-free video engine, watermark-free downloader & live analytics',
            category: 'Social Apps',
            price: 1.15,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 580,
            downloads: 22400,
            version: '35.8.4',
            size: '110.0 MB',
            platform: 'Android / Windows / macOS',
            coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'TikTok Pro delivers the ultimate social media creator toolkit. Bypass regional content restrictions, download HD videos without watermarks in a single tap, access live stream analytics studio, schedule automated posting, and experience completely ad-free browsing.',
            features: [
                '1-Tap lossless HD watermark-free video & audio downloader',
                'Zero sponsored ad feeds & distraction-free creator interface',
                'Region unlock bypass for global trending content exploration',
                'Built-in Live Studio multi-stream broadcaster & follower analytics'
            ],
            releaseNotes: 'v35.8.4: Upgraded region selector, added direct lossless video downloader, and integrated batch sound extraction.',
            downloadUrl: 'https://vault-storage.app/packages/tiktok-pro-v35.8.4.apk',
            featured: true,
            status: 'published',
            createdAt: '2026-09-07T08:10:00Z'
        },
        {
            id: 'app_nordvpn_pro',
            title: 'NordVPN Pro CyberShield',
            tagline: 'Ultra-fast WireGuard NordLynx VPN with Threat Protection & Double VPN',
            category: 'VPN & Security',
            price: 1.54,
            originalPrice: 2.30,
            rating: 5.0,
            ratingCount: 620,
            downloads: 19800,
            version: '7.12.1',
            size: '42.5 MB',
            platform: 'Android / Windows / macOS / iOS / Linux',
            coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'NordVPN Pro provides uncompromised digital anonymity and top-tier cyber defense. Featuring high-speed 10Gbps RAM-only servers across 111 countries, proprietary NordLynx protocol, built-in Threat Protection malware blocker, and automated kill switch.',
            features: [
                '6,400+ ultra-fast 10Gbps RAM-only servers in 111 countries',
                'NordLynx (WireGuard) protocol with zero logging policy',
                'Threat Protection Pro against malware, web trackers & phishing',
                'Dedicated IP, Onion Over VPN, and Double Encryption routing'
            ],
            releaseNotes: 'v7.12.1: Integrated Quantum-resistant encryption layer, reduced handshake latency by 40%, and upgraded meshnet speeds.',
            downloadUrl: 'https://vault-storage.app/packages/nordvpn-pro-v7.12.1.zip',
            featured: true,
            status: 'published',
            createdAt: '2026-09-07T08:20:00Z'
        },
        {
            id: 'app_expressvpn_pro',
            title: 'ExpressVPN Pro Ultra Stealth',
            tagline: 'Lightning-fast Lightway protocol with global streaming unblocker',
            category: 'VPN & Security',
            price: 1.54,
            originalPrice: 2.30,
            rating: 4.9,
            ratingCount: 490,
            downloads: 16700,
            version: '12.5.0',
            size: '38.0 MB',
            platform: 'Android / Windows / macOS / iOS / Routers',
            coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'ExpressVPN Pro delivers unmatched connection speeds and global media accessibility. Engineered with custom Lightway protocol, TrustedServer RAM infrastructure, split tunneling, and DNS leak prevention for smooth 4K buffer-free streaming anywhere.',
            features: [
                'High-performance proprietary Lightway protocol',
                'TrustedServer technology — servers run purely on RAM',
                'Automatic Network Lock kill switch & zero activity logs',
                'Optimized servers in 105 countries for gaming and 4K streaming'
            ],
            releaseNotes: 'v12.5.0: Added auto-reconnect failover, enhanced streaming geo-bypass algorithms, and upgraded battery efficiency.',
            downloadUrl: 'https://vault-storage.app/packages/expressvpn-pro-v12.5.0.zip',
            featured: true,
            status: 'published',
            createdAt: '2026-09-07T08:30:00Z'
        },
        {
            id: 'app_surfshark_pro',
            title: 'Surfshark VPN Pro Unlimited',
            tagline: 'Unlimited multi-device protection, CleanWeb ad-blocker & MultiHop',
            category: 'VPN & Security',
            price: 0.77,
            originalPrice: 1.54,
            rating: 4.8,
            ratingCount: 310,
            downloads: 11200,
            version: '6.8.2',
            size: '31.5 MB',
            platform: 'Android / Windows / macOS / iOS / FireTV',
            coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Surfshark VPN Pro offers unlimited device connections under one license. Block annoying ads and malicious websites with CleanWeb, disguise your VPN traffic with Camouflage mode, and route your connection through multiple countries simultaneously.',
            features: [
                'Unlimited simultaneous device connections per license',
                'CleanWeb 2.0 ad, tracker, and malware blocker',
                'Dynamic MultiHop double VPN chain routing',
                'Camouflage Mode & NoBorders mode for restrictive networks'
            ],
            releaseNotes: 'v6.8.2: Added WireGuard IPv6 support, improved speed tests, and renewed CleanWeb filter rules.',
            downloadUrl: 'https://vault-storage.app/packages/surfshark-vpn-v6.8.2.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-09-07T08:40:00Z'
        },
        {
            id: 'app_turbovpn_pro',
            title: 'TurboVPN Pro Gaming Accelerator',
            tagline: 'Low-ping gaming tunnels, unlimited bandwidth & instant proxy connect',
            category: 'VPN & Security',
            price: 0.15,
            originalPrice: 1.54,
            rating: 4.7,
            ratingCount: 440,
            downloads: 18300,
            version: '4.1.0',
            size: '24.0 MB',
            platform: 'Android / Windows / iOS',
            coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'TurboVPN Pro is tailored for gamers and streaming enthusiasts needing lowest latency and maximum throughput. Features dedicated game ping accelerator routes (PUBG, COD, Roblox), unlimited high-speed bandwidth, and 1-tap instant connection.',
            features: [
                'Dedicated low-ping gaming server routes',
                '1-Tap smart turbo connection with zero configuration',
                'Unlimited bandwidth and continuous high-speed streaming',
                'AES-128 encryption with DNS leak shield'
            ],
            releaseNotes: 'v4.1.0: Added dedicated low-latency gaming server clusters and updated UI theme.',
            downloadUrl: 'https://vault-storage.app/packages/turbovpn-pro-v4.1.0.apk',
            featured: false,
            status: 'published',
            createdAt: '2026-09-07T08:50:00Z'
        },
        {
            id: 'app_101',
            title: 'TaskFlow Pro Workspace',
            tagline: 'Enterprise-grade automation & offline project synchronization',
            category: 'Productivity',
            price: 0.38,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 128,
            downloads: 2450,
            version: '2.4.0',
            size: '48.5 MB',
            platform: 'Android / Windows / macOS',
            coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'TaskFlow Pro is a high-performance productivity workstation engineered for modern teams and individual power users. Features real-time local SQLite database sync, Kanban workflows, Gantt visualizer, and custom automation scripts.',
            features: [
                'Instant local-first offline storage with end-to-end encryption',
                'Visual Gantt and Kanban board drag-and-drop managers',
                'Automated webhook triggers and calendar synchronization',
                'Built-in Markdown documentation and formula calculator'
            ],
            releaseNotes: 'v2.4.0: Added sub-task dependency tracking, optimized memory footprint by 35%, and introduced dark neo-glass interface themes.',
            downloadUrl: 'https://vault-storage.app/packages/taskflow-pro-v2.4.0.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-08-15T10:00:00Z'
        },
        {
            id: 'app_102',
            title: 'NeuroStudio AI Studio',
            tagline: 'On-device neural image rendering and generative design engine',
            category: 'AI Solutions',
            price: 1.54,
            originalPrice: 2.30,
            rating: 4.8,
            ratingCount: 94,
            downloads: 1890,
            version: '1.8.2',
            size: '124.0 MB',
            platform: 'Android APK / Windows x64',
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Leverage quantized on-device neural models to generate, upscale, and enhance high-resolution artwork and vector graphics without cloud latency or monthly subscriptions.',
            features: [
                'Local Stable Diffusion & Latent Upscaler acceleration',
                'Smart background removal & generative in-painting',
                '4K batch rendering with multi-core GPU support',
                'Zero cloud telemetry — 100% private processing'
            ],
            releaseNotes: 'v1.8.2: GPU acceleration upgrade for Vulkan & Metal backends, prompt history persistence, and lossless WebP export.',
            downloadUrl: 'https://vault-storage.app/packages/neurostudio-ai-v1.8.2.apk',
            featured: false,
            status: 'published',
            createdAt: '2026-08-20T14:30:00Z'
        },
        {
            id: 'app_103',
            title: 'PulseConnect Social Hub',
            tagline: 'Decentralized P2P encrypted messaging & community channels',
            category: 'Social Apps',
            price: 0.23,
            originalPrice: 1.54,
            rating: 4.7,
            ratingCount: 210,
            downloads: 5120,
            version: '3.1.0',
            size: '32.1 MB',
            platform: 'Android / iOS / Desktop',
            coverImage: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Next-generation private messaging application utilizing peer-to-peer mesh networks, zero-knowledge proofs, and voice/video crystal-clear spatial audio.',
            features: [
                'Peer-to-peer encrypted voice and video calls',
                'Self-destructing group channels and ephemeral media',
                'Low-bandwidth mesh mode over Bluetooth and Wi-Fi Direct',
                'Custom sticker studio and dynamic voice changers'
            ],
            releaseNotes: 'v3.1.0: End-to-end group voice rooms with up to 100 participants, encrypted file transfer up to 4GB.',
            downloadUrl: 'https://vault-storage.app/packages/pulseconnect-v3.1.0.apk',
            featured: false,
            status: 'published',
            createdAt: '2026-08-22T08:15:00Z'
        },
        {
            id: 'app_104',
            title: 'HexaShield Security Vault',
            tagline: 'Military-grade password manager, 2FA authenticator & file encryptor',
            category: 'Tools & Utilities',
            price: 0.15,
            originalPrice: 1.54,
            rating: 5.0,
            ratingCount: 340,
            downloads: 7300,
            version: '4.0.5',
            size: '22.8 MB',
            platform: 'Android / Windows / Linux',
            coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'The ultimate offline privacy suite. Store secrets, biometric credentials, hardware keys, and encrypted archives secured by AES-256-GCM and Argon2id key derivation.',
            features: [
                'Zero-knowledge AES-256-GCM hardware enclave encryption',
                'Built-in TOTP / HOTP 2-Factor Authentication generator',
                'Decoy vault partition with duress PIN access',
                'Automated breach surveillance and weak password auditor'
            ],
            releaseNotes: 'v4.0.5: Added support for YubiKey NFC hardware tokens, instant autofill API, and encrypted cloud backup to private WebDAV.',
            downloadUrl: 'https://vault-storage.app/packages/hexashield-vault-v4.0.5.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-08-25T16:00:00Z'
        },
        {
            id: 'app_105',
            title: 'CodeForge IDE Master',
            tagline: 'Lightweight reactive code editor with embedded compiler & Git suite',
            category: 'Developer Tools',
            price: 0.58,
            originalPrice: 1.54,
            rating: 4.9,
            ratingCount: 88,
            downloads: 3200,
            version: '2.1.2',
            size: '68.4 MB',
            platform: 'Windows / macOS / Linux / Android',
            coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Ultra-fast native IDE featuring tree-sitter syntax parsing, language server protocol (LSP) for 40+ languages, visual interactive regex tester, and integrated terminal.',
            features: [
                'Instant boot time (<200ms) with zero UI lag',
                'Multi-cursor editing, minimap, and customizable snippet engine',
                'Full Git integration with graphical merge-conflict resolver',
                'Offline documentation browser for standard libraries'
            ],
            releaseNotes: 'v2.1.2: Integrated Rust & Go language servers, added split-pane live markdown previewer, and custom theme builder.',
            downloadUrl: 'https://vault-storage.app/packages/codeforge-ide-v2.1.2.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-08-28T11:20:00Z'
        },
        {
            id: 'app_106',
            title: 'VividMotion FX Studio',
            tagline: 'Professional 60FPS video compositor & motion graphic creator',
            category: 'Design & Media',
            price: 0.92,
            originalPrice: 1.54,
            rating: 4.8,
            ratingCount: 165,
            downloads: 4100,
            version: '5.2.0',
            size: '95.0 MB',
            platform: 'Android / Windows / macOS',
            coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
            gallery: [
                'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
            ],
            description: 'Professional grade timeline-based video editing and motion graphics tool with multi-track bezier curves, 3D particles, and HDR color grading LUTs.',
            features: [
                'Multi-layer timeline with keyframe animation curves',
                '200+ built-in cinematic transitions and chromatic aberration FX',
                'GPU-accelerated hardware rendering for 4K 60FPS exports',
                'AI auto-captioning and sound ducking equalizer'
            ],
            releaseNotes: 'v5.2.0: Introduced 3D particle emitter, Apple ProRes / AV1 hardware encoder support, and chroma key refinement.',
            downloadUrl: 'https://vault-storage.app/packages/vividmotion-fx-v5.2.0.zip',
            featured: false,
            status: 'published',
            createdAt: '2026-08-30T09:45:00Z'
        }
    ];

    // Orders State (Stores real customer purchases and transactions)
    const DEFAULT_ORDERS = [];

    // System Settings with Verified M-Pesa Paybill Credentials
    const DEFAULT_SETTINGS = {
        storeName: 'PremiumStore',
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing scheduled system upgrades to improve our payment gateways and download engines. Public purchases will resume shortly.',
        mpesaActive: true,
        kcbActive: true,
        cardActive: true,
        paybillNumber: '522533',
        accountNumber: '8106675',
        accountName: 'JASPER MARKETS',
        supportWhatsapp: '447455909204',
        supportPhone: '+447455909204',
        currencySymbol: '$'
    };

    // Default Referrals State (Clean dynamic state for real affiliate users)
    const DEFAULT_REFERRALS = {};

    // Store State Object
    const Store = {
        // Multi-Currency Engine
        getCurrencies() {
            return CURRENCIES;
        },

        getSelectedCurrency() {
            try {
                const code = localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
                return CURRENCIES[code] || CURRENCIES.USD;
            } catch (e) {
                return CURRENCIES.USD;
            }
        },

        setSelectedCurrency(currencyCode) {
            const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
            localStorage.setItem(STORAGE_KEYS.CURRENCY, curr.code);
            this.dispatchUpdate('currency_change', curr);
            return curr;
        },

        formatPrice(usdAmount, overrideCurrency = null) {
            const curr = overrideCurrency || this.getSelectedCurrency();
            const amount = (parseFloat(usdAmount) || 0) * curr.rate;
            
            if (curr.decimals === 0) {
                const rounded = Math.round(amount);
                return `${curr.symbol}${rounded.toLocaleString()}`;
            } else {
                return `${curr.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: curr.decimals, maximumFractionDigits: curr.decimals })}`;
            }
        },

        convertPrice(usdAmount, overrideCurrency = null) {
            const curr = overrideCurrency || this.getSelectedCurrency();
            return (parseFloat(usdAmount) || 0) * curr.rate;
        },

        // App Methods
        getApps() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.APPS);
                let apps = data ? JSON.parse(data) : [];
                
                if (!apps || apps.length === 0) {
                    apps = DEFAULT_APPS;
                    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
                } else {
                    // Check for missing default apps and merge them at the start
                    const existingIds = new Set(apps.map(a => a.id));
                    const missingDefaults = DEFAULT_APPS.filter(d => !existingIds.has(d.id));
                    if (missingDefaults.length > 0) {
                        apps = [...missingDefaults, ...apps];
                        localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
                    }
                }

                // Enforce strict price boundary: Not more than 200 Ksh ($1.54 USD) and not less than 20 Ksh ($0.15 USD)
                apps = apps.map(app => {
                    const price = parseFloat(app.price) || 0.15;
                    let bounded = price;
                    if (price > 1.54) {
                        bounded = 1.54;
                    } else if (price < 0.15) {
                        bounded = 0.15;
                    }
                    const origPrice = parseFloat(app.originalPrice) || (bounded < 1.54 ? 1.54 : 2.30);
                    return { ...app, price: bounded, originalPrice: origPrice };
                });
                return apps;
            } catch (e) {
                return DEFAULT_APPS;
            }
        },

        saveApps(apps) {
            // Guarantee price boundary on save (20 Ksh to 200 Ksh / $0.15 to $1.54 USD)
            const capped = apps.map(a => {
                const price = parseFloat(a.price) || 0.15;
                const boundedPrice = price > 1.54 ? 1.54 : (price < 0.15 ? 0.15 : Math.round(price * 100) / 100);
                const origPrice = parseFloat(a.originalPrice) || (boundedPrice < 1.54 ? 1.54 : 2.30);
                return { ...a, price: boundedPrice, originalPrice: origPrice };
            });
            localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(capped));
            this.dispatchUpdate('apps', capped);
        },

        getAppById(id) {
            const apps = this.getApps();
            return apps.find(a => a.id === id) || null;
        },

        addApp(appData) {
            const apps = this.getApps();
            const rawPrice = parseFloat(appData.price) || 0.15;
            const boundedPrice = rawPrice > 1.54 ? 1.54 : (rawPrice < 0.15 ? 0.15 : Math.round(rawPrice * 100) / 100);
            const origPrice = parseFloat(appData.originalPrice) || (boundedPrice < 1.54 ? 1.54 : 2.30);

            const newApp = {
                id: 'app_' + Math.random().toString(36).substring(2, 7),
                title: appData.title || 'Untitled App',
                tagline: appData.tagline || '',
                category: appData.category || 'Productivity',
                price: boundedPrice,
                originalPrice: origPrice,
                rating: 5.0,
                ratingCount: 1,
                downloads: 0,
                version: appData.version || '1.0.0',
                size: appData.size || '25.0 MB',
                platform: appData.platform || 'Cross-Platform',
                coverImage: appData.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                gallery: appData.gallery && appData.gallery.length ? appData.gallery : [appData.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'],
                description: appData.description || '',
                features: appData.features || ['High-speed direct package delivery', 'Cross-platform native binary'],
                releaseNotes: appData.releaseNotes || 'Initial stable release.',
                downloadUrl: appData.downloadUrl || 'https://vault-storage.app/packages/app-bundle.zip',
                featured: !!appData.featured,
                status: appData.status || 'published',
                createdAt: new Date().toISOString()
            };
            apps.unshift(newApp);
            this.saveApps(apps);
            return newApp;
        },

        updateApp(id, updates) {
            const apps = this.getApps();
            const idx = apps.findIndex(a => a.id === id);
            if (idx !== -1) {
                if (updates.price !== undefined) {
                    const rawPrice = parseFloat(updates.price) || 0.15;
                    updates.price = rawPrice > 1.54 ? 1.54 : (rawPrice < 0.15 ? 0.15 : Math.round(rawPrice * 100) / 100);
                }
                if (updates.originalPrice !== undefined) {
                    updates.originalPrice = parseFloat(updates.originalPrice) || 1.54;
                }
                apps[idx] = { ...apps[idx], ...updates };
                this.saveApps(apps);
                return apps[idx];
            }
            return null;
        },

        deleteApp(id) {
            let apps = this.getApps();
            apps = apps.filter(a => a.id !== id);
            this.saveApps(apps);
        },

        toggleAppVisibility(id) {
            const apps = this.getApps();
            const app = apps.find(a => a.id === id);
            if (app) {
                app.status = app.status === 'published' ? 'hidden' : 'published';
                this.saveApps(apps);
                return app.status;
            }
            return null;
        },

        // Rating Engine
        getUserRatings() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.USER_RATINGS);
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        },

        hasUserRated(appId) {
            const ratings = this.getUserRatings();
            return !!ratings[appId];
        },

        getUserAppRating(appId) {
            const ratings = this.getUserRatings();
            return ratings[appId] ? ratings[appId].score : null;
        },

        rateApp(appId, score) {
            const deviceId = getDeviceId();
            const userRatings = this.getUserRatings();
            if (userRatings[appId]) {
                return { success: false, message: 'You have already rated this application from this device.' };
            }

            const apps = this.getApps();
            const app = apps.find(a => a.id === appId);
            if (!app) {
                return { success: false, message: 'App not found' };
            }

            const currentTotal = app.rating * app.ratingCount;
            app.ratingCount += 1;
            app.rating = parseFloat(((currentTotal + score) / app.ratingCount).toFixed(1));

            this.saveApps(apps);

            userRatings[appId] = {
                score: score,
                deviceId: deviceId,
                ratedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.USER_RATINGS, JSON.stringify(userRatings));
            this.dispatchUpdate('ratings', { appId, score, newRating: app.rating, count: app.ratingCount });

            return { success: true, newRating: app.rating, ratingCount: app.ratingCount };
        },

        // Orders & Transactions Management
        getOrders() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
                return data ? JSON.parse(data) : DEFAULT_ORDERS;
            } catch (e) {
                return DEFAULT_ORDERS;
            }
        },

        saveOrders(orders) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            this.dispatchUpdate('orders', orders);
        },

        createOrder(orderData) {
            const orders = this.getOrders();
            const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
            const token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
            
            // Format reference code: user-provided M-Pesa receipt code or clean generated transaction ID
            let refNumber = orderData.mpesaRef || orderData.kcbRef;
            const method = orderData.paymentMethod || 'mpesa';
            if (!refNumber || refNumber.trim() === '') {
                if (method === 'mpesa' || method === 'kcb') {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    let code = '';
                    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                    refNumber = 'MP-' + code;
                } else {
                    refNumber = 'CARD-' + Math.floor(100000000 + Math.random() * 900000000);
                }
            }

            const curr = this.getSelectedCurrency();
            const settings = this.getSettings();
            const authUser = this.getAuthenticatedUser();
            const cleanEmail = (orderData.customerEmail || (authUser ? authUser.email : '')).trim().toLowerCase();
            const customUsername = (orderData.username || (authUser ? authUser.username : '')).trim().toLowerCase();

            // Auto-associate and authenticate customer session with username
            if (cleanEmail && this.isValidEmail(cleanEmail) && !authUser) {
                this.setAuthenticatedUser(cleanEmail, { 
                    username: customUsername,
                    customerPhone: orderData.customerPhone || '' 
                });
            }

            // Referral attribution: Check order data or active referrer session
            const activeRef = (orderData.referrerUsername || this.getActiveReferrer() || '').trim().toLowerCase();
            const validRef = this.isValidUsername(activeRef) ? activeRef : null;
            const totalAmountUsd = orderData.totalAmount || 0;
            const commissionUsd = validRef ? Math.round(totalAmountUsd * 0.30 * 100) / 100 : 0;

            // Universal review requirement: All payments must undergo admin review (paymentStatus: 'pending')
            const newOrder = {
                id: orderId,
                customerEmail: cleanEmail,
                customerUsername: customUsername || (cleanEmail ? cleanEmail.split('@')[0].slice(0, 20) : 'customer'),
                customerPhone: orderData.customerPhone || '',
                items: orderData.items || [],
                totalAmount: totalAmountUsd,
                currencyCode: orderData.currencyCode || curr.code,
                formattedTotal: orderData.formattedTotal || this.formatPrice(totalAmountUsd),
                paymentMethod: method,
                paymentStatus: 'pending', // Strictly pending for all payments
                mpesaRef: refNumber,
                kcbRef: refNumber, // backward compatibility
                paybillNumber: settings.paybillNumber || '522533',
                accountNumber: settings.accountNumber || '8106675',
                accountName: settings.accountName || 'JASPER MARKETS',
                referrerUsername: validRef,
                referralCommissionUsd: commissionUsd,
                downloadToken: token,
                downloadUrl: orderData.downloadUrl || (orderData.items && orderData.items[0] ? orderData.items[0].downloadUrl : 'https://vault-storage.app/packages/bundle.zip'),
                expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
                createdAt: new Date().toISOString()
            };

            orders.unshift(newOrder);
            this.saveOrders(orders);
            return newOrder;
        },

        updateOrderStatus(orderId, status) {
            const orders = this.getOrders();
            const order = orders.find(o => o.id === orderId);
            if (order) {
                const prevStatus = order.paymentStatus;
                order.paymentStatus = status;
                this.saveOrders(orders);
                // Credit 30% commission and trigger referral reward calculations when payment is cleared
                if (prevStatus !== 'cleared' && status === 'cleared') {
                    this.processReferralCommission(order);
                }
                return order;
            }
            return null;
        },

        // Customer Email Identification & Authentication Engine
        isValidEmail(email) {
            if (!email || typeof email !== 'string') return false;
            const trimmed = email.trim();
            // RFC 5322 standard format email validator
            const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
            return re.test(trimmed) && trimmed.length <= 254;
        },

        // Unique Username Validator (3-20 chars: alphanumeric, underscores, hyphens)
        isValidUsername(username) {
            if (!username || typeof username !== 'string') return false;
            const trimmed = username.trim().toLowerCase();
            const re = /^[a-z0-9_-]{3,20}$/;
            return re.test(trimmed);
        },

        getAuthenticatedUser() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER) || sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },

        setAuthenticatedUser(email, extraData = {}) {
            const cleanEmail = (email || '').trim().toLowerCase();
            if (!this.isValidEmail(cleanEmail)) {
                return { success: false, message: 'Please provide a valid email address (e.g. name@domain.com).' };
            }

            let username = (extraData.username || '').trim().toLowerCase();
            if (!username) {
                // Auto-derive clean unique handle from email prefix
                const prefix = cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase();
                username = prefix.length >= 3 ? prefix.slice(0, 20) : `user_${Math.random().toString(36).substring(2, 6)}`;
            }

            if (!this.isValidUsername(username)) {
                return { success: false, message: 'Username must be 3-20 characters (letters, numbers, underscores, dashes).' };
            }

            const userProfile = {
                email: cleanEmail,
                username: username,
                authenticatedAt: new Date().toISOString(),
                deviceId: getDeviceId(),
                ...extraData,
                username: username
            };
            try {
                localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
                sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
            } catch(e) {}

            // Automatically initialize or sync referral profile
            this.registerReferralProfile(username, cleanEmail);

            this.dispatchUpdate('auth_user', userProfile);
            return { success: true, user: userProfile };
        },

        logoutUser() {
            try {
                localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
                sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            } catch(e) {}
            this.dispatchUpdate('auth_user', null);
        },

        // ==========================================
        // 30% Referral Engine & Free App Rewards
        // ==========================================
        getReferrals() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.REFERRALS);
                return data ? JSON.parse(data) : {};
            } catch (e) {
                return {};
            }
        },

        saveReferrals(referrals) {
            localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
            this.dispatchUpdate('referrals', referrals);
        },

        getActiveReferrer() {
            try {
                return localStorage.getItem(STORAGE_KEYS.ACTIVE_REFERRER) || null;
            } catch (e) {
                return null;
            }
        },

        setActiveReferrer(username) {
            if (!username || typeof username !== 'string') return;
            const clean = username.trim().toLowerCase();
            if (this.isValidUsername(clean)) {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_REFERRER, clean);
                this.recordReferralClick(clean);
            }
        },

        recordReferralClick(referrerUsername) {
            if (!referrerUsername) return;
            const clean = referrerUsername.trim().toLowerCase();
            if (!this.isValidUsername(clean)) return;

            try {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_REFERRER, clean);
            } catch (e) {}

            const referrals = this.getReferrals();
            if (!referrals[clean]) {
                referrals[clean] = {
                    username: clean,
                    email: `${clean}@customer.store`,
                    totalClicks: 0,
                    successfulOrders: 0,
                    totalRevenueUsd: 0,
                    totalCommissionUsd: 0,
                    balanceUsd: 0,
                    paidPayoutsUsd: 0,
                    freeAppsClaimed: [],
                    referralOrders: [],
                    payoutRequests: [],
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };
            }
            referrals[clean].totalClicks = (referrals[clean].totalClicks || 0) + 1;
            referrals[clean].lastActive = new Date().toISOString();
            this.saveReferrals(referrals);
        },

        registerReferralProfile(username, email) {
            if (!username || !email) return null;
            const cleanUser = username.trim().toLowerCase();
            const cleanEmail = email.trim().toLowerCase();
            if (!this.isValidUsername(cleanUser)) return null;

            const referrals = this.getReferrals();
            if (!referrals[cleanUser]) {
                referrals[cleanUser] = {
                    username: cleanUser,
                    email: cleanEmail,
                    totalClicks: 0,
                    successfulOrders: 0,
                    totalRevenueUsd: 0,
                    totalCommissionUsd: 0,
                    balanceUsd: 0,
                    paidPayoutsUsd: 0,
                    freeAppsClaimed: [],
                    referralOrders: [],
                    payoutRequests: [],
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };
            } else {
                referrals[cleanUser].email = cleanEmail;
                referrals[cleanUser].lastActive = new Date().toISOString();
            }
            this.saveReferrals(referrals);
            return referrals[cleanUser];
        },

        processReferralCommission(order) {
            if (!order || !order.referrerUsername) return;
            const refUser = order.referrerUsername.trim().toLowerCase();
            if (!this.isValidUsername(refUser)) return;

            const referrals = this.getReferrals();
            if (!referrals[refUser]) {
                this.registerReferralProfile(refUser, `${refUser}@customer.store`);
            }
            const profile = referrals[refUser];
            
            // Prevent duplicate commission attribution for the exact same order
            profile.referralOrders = profile.referralOrders || [];
            if (profile.referralOrders.some(ro => ro.orderId === order.id)) {
                return;
            }

            const orderTotalUsd = order.totalAmount || 0;
            // Strictly 30% referral commission calculation
            const commissionAmountUsd = Math.round(orderTotalUsd * 0.30 * 100) / 100;

            profile.successfulOrders = (profile.successfulOrders || 0) + 1;
            profile.totalRevenueUsd = Math.round(((profile.totalRevenueUsd || 0) + orderTotalUsd) * 100) / 100;
            profile.totalCommissionUsd = Math.round(((profile.totalCommissionUsd || 0) + commissionAmountUsd) * 100) / 100;
            profile.balanceUsd = Math.round(((profile.balanceUsd || 0) + commissionAmountUsd) * 100) / 100;
            profile.lastActive = new Date().toISOString();

            profile.referralOrders.unshift({
                orderId: order.id,
                customerEmail: order.customerEmail || 'Invited Customer',
                orderTotalUsd: orderTotalUsd,
                commissionEarnedUsd: commissionAmountUsd,
                currencyCode: order.currencyCode || 'USD',
                clearedAt: new Date().toISOString()
            });

            this.saveReferrals(referrals);
        },

        getReferralStats(username) {
            if (!username) return null;
            const clean = username.trim().toLowerCase();
            const referrals = this.getReferrals();
            const profile = referrals[clean] || {
                username: clean,
                email: `${clean}@customer.store`,
                totalClicks: 0,
                successfulOrders: 0,
                totalRevenueUsd: 0,
                totalCommissionUsd: 0,
                balanceUsd: 0,
                paidPayoutsUsd: 0,
                freeAppsClaimed: [],
                referralOrders: [],
                payoutRequests: [],
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };

            // Reward milestones definition
            const milestones = [
                { id: 'm1_3apps', requiredInvites: 3, rewardTitle: '1 Free Premium App of Choice', unlocked: profile.successfulOrders >= 3, claimed: (profile.freeAppsClaimed || []).some(c => c.milestoneId === 'm1_3apps') },
                { id: 'm2_5apps', requiredInvites: 5, rewardTitle: '2 Free Premium Apps + VIP Badge', unlocked: profile.successfulOrders >= 5, claimed: (profile.freeAppsClaimed || []).some(c => c.milestoneId === 'm2_5apps') },
                { id: 'm3_10apps', requiredInvites: 10, rewardTitle: '5 Free Apps + Unlimited VIP Pass', unlocked: profile.successfulOrders >= 10, claimed: (profile.freeAppsClaimed || []).some(c => c.milestoneId === 'm3_10apps') }
            ];

            return {
                ...profile,
                clicks: profile.totalClicks || 0,
                totalOrders: profile.successfulOrders || 0,
                totalEarnedUsd: profile.totalCommissionUsd || 0,
                payouts: profile.payoutRequests || [],
                milestones: milestones
            };
        },

        requestReferralPayout(username, payoutDetails = {}) {
            const clean = (username || '').trim().toLowerCase();
            if (!this.isValidUsername(clean)) {
                return { success: false, message: 'Invalid referral account username.' };
            }

            const referrals = this.getReferrals();
            const profile = referrals[clean];
            if (!profile || (profile.balanceUsd || 0) <= 0) {
                return { success: false, message: 'No available commission balance to withdraw.' };
            }

            const requestedAmountUsd = profile.balanceUsd;
            const payoutId = 'PAY-' + Math.floor(1000 + Math.random() * 9000);
            const payoutRecord = {
                id: payoutId,
                username: clean,
                email: profile.email,
                amountUsd: requestedAmountUsd,
                paymentMethod: payoutDetails.paymentMethod || 'mpesa',
                mpesaNumber: payoutDetails.mpesaNumber || payoutDetails.phone || '',
                accountDetails: payoutDetails.accountDetails || '',
                status: 'pending',
                requestedAt: new Date().toISOString(),
                paidAt: null
            };

            profile.payoutRequests = profile.payoutRequests || [];
            profile.payoutRequests.unshift(payoutRecord);
            profile.balanceUsd = 0; // Move from balance into pending payout
            this.saveReferrals(referrals);

            return { success: true, payout: payoutRecord, message: `Payout request #${payoutId} submitted successfully!` };
        },

        claimFreeAppReward(username, milestoneId, appId) {
            const clean = (username || '').trim().toLowerCase();
            const referrals = this.getReferrals();
            const profile = referrals[clean];
            if (!profile) return { success: false, message: 'Referral profile not found.' };

            const app = this.getAppById(appId);
            if (!app) return { success: false, message: 'Selected application not found in catalog.' };

            profile.freeAppsClaimed = profile.freeAppsClaimed || [];
            if (profile.freeAppsClaimed.some(c => c.milestoneId === milestoneId)) {
                return { success: false, message: 'This milestone reward has already been claimed.' };
            }

            profile.freeAppsClaimed.push({
                milestoneId: milestoneId,
                appId: app.id,
                appTitle: app.title,
                claimedAt: new Date().toISOString()
            });
            this.saveReferrals(referrals);

            // Automatically grant cleared license in customer orders library
            const freeOrder = this.createOrder({
                customerEmail: profile.email,
                username: clean,
                customerPhone: '',
                items: [{
                    id: app.id,
                    title: app.title,
                    price: 0,
                    coverImage: app.coverImage,
                    category: app.category,
                    downloadUrl: app.downloadUrl
                }],
                totalAmount: 0,
                paymentMethod: 'reward_claim',
                mpesaRef: 'FREE-REWARD-' + milestoneId.toUpperCase(),
                downloadUrl: app.downloadUrl
            });
            this.updateOrderStatus(freeOrder.id, 'cleared');

            return { success: true, message: `🎉 "${app.title}" unlocked for free and added to your Digital Vault!` };
        },

        getAllAffiliates() {
            const referrals = this.getReferrals();
            return Object.values(referrals).map(a => ({
                ...a,
                clicks: a.totalClicks || 0,
                totalOrders: a.successfulOrders || 0,
                totalEarnedUsd: a.totalCommissionUsd || 0,
                payouts: a.payoutRequests || [],
            })).sort((a, b) => (b.totalEarnedUsd || 0) - (a.totalEarnedUsd || 0));
        },

        updatePayoutStatus(arg1, arg2, arg3) {
            let username = null;
            let payoutId = null;
            let newStatus = null;

            if (arg3 !== undefined) {
                username = arg1;
                payoutId = arg2;
                newStatus = arg3;
            } else {
                payoutId = arg1;
                newStatus = arg2;
            }

            const referrals = this.getReferrals();
            let targetProfile = null;
            let targetPayout = null;

            if (username) {
                const clean = username.trim().toLowerCase();
                targetProfile = referrals[clean];
                if (targetProfile && targetProfile.payoutRequests) {
                    targetPayout = targetProfile.payoutRequests.find(p => p.id === payoutId);
                }
            } else {
                for (const u of Object.keys(referrals)) {
                    const prof = referrals[u];
                    if (prof && prof.payoutRequests) {
                        const found = prof.payoutRequests.find(p => p.id === payoutId);
                        if (found) {
                            targetProfile = prof;
                            targetPayout = found;
                            break;
                        }
                    }
                }
            }

            if (targetProfile && targetPayout) {
                const prevStatus = targetPayout.status;
                targetPayout.status = newStatus;
                if (newStatus === 'paid' || newStatus === 'approved') {
                    targetPayout.status = 'approved';
                    targetPayout.paidAt = new Date().toISOString();
                    if (prevStatus !== 'approved' && prevStatus !== 'paid') {
                        targetProfile.paidPayoutsUsd = (targetProfile.paidPayoutsUsd || 0) + (targetPayout.amountUsd || 0);
                    }
                } else if (newStatus === 'rejected') {
                    if (prevStatus === 'pending') {
                        // Refund back to available balance
                        targetProfile.balanceUsd = Math.round(((targetProfile.balanceUsd || 0) + (targetPayout.amountUsd || 0)) * 100) / 100;
                    }
                }
                this.saveReferrals(referrals);
                return { success: true, message: `Payout request #${payoutId} marked as ${newStatus}`, payout: targetPayout };
            }
            return { success: false, message: 'Payout request not found.' };
        },

        getCustomerOrders(email) {
            const clean = (email || '').trim().toLowerCase();
            if (!clean) return [];
            const orders = this.getOrders();
            return orders.filter(o => o.customerEmail && o.customerEmail.trim().toLowerCase() === clean);
        },

        getCustomerLibrary(email) {
            const clean = (email || '').trim().toLowerCase();
            if (!clean) return [];
            const orders = this.getCustomerOrders(clean);
            const cleared = orders.filter(o => o.paymentStatus === 'cleared');
            const apps = this.getApps();
            
            const library = [];
            const seenAppIds = new Set();

            cleared.forEach(order => {
                (order.items || []).forEach(item => {
                    if (!seenAppIds.has(item.id)) {
                        seenAppIds.add(item.id);
                        const catalogApp = apps.find(a => a.id === item.id) || item;
                        const randHex = (order.id || '').slice(-4).toUpperCase() || 'PRO1';
                        library.push({
                            appId: item.id,
                            title: catalogApp.title,
                            tagline: catalogApp.tagline,
                            category: catalogApp.category,
                            coverImage: catalogApp.coverImage,
                            version: catalogApp.version,
                            size: catalogApp.size,
                            platform: catalogApp.platform,
                            downloadUrl: catalogApp.downloadUrl || item.downloadUrl,
                            downloadToken: order.downloadToken,
                            signedDownloadUrl: `https://vault-storage.app/dl/signed-${order.downloadToken}?expires=86400`,
                            licenseKey: `PSTR-${randHex}-491A-882C-PRO`,
                            purchasedAt: order.createdAt,
                            orderId: order.id,
                            orderRef: order.mpesaRef || order.kcbRef || order.id
                        });
                    }
                });
            });
            return library;
        },

        getAllCustomers() {
            const orders = this.getOrders();
            const referrals = this.getReferrals();
            const authUser = this.getAuthenticatedUser();
            const map = {};

            // 1. Ingest real customer purchase transactions
            orders.forEach(o => {
                const email = (o.customerEmail || 'customer@store.app').trim().toLowerCase();
                const username = (o.customerUsername || (email.includes('@') ? email.split('@')[0].slice(0, 20) : 'customer')).trim().toLowerCase();
                if (!map[email]) {
                    map[email] = {
                        email: email,
                        username: username,
                        phone: o.customerPhone || '',
                        totalOrders: 0,
                        clearedOrders: 0,
                        clearedOrdersCount: 0,
                        pendingOrders: 0,
                        pendingOrdersCount: 0,
                        totalSpend: 0,
                        firstSeen: o.createdAt || new Date().toISOString(),
                        lastActive: o.createdAt || new Date().toISOString(),
                        orders: []
                    };
                }
                const c = map[email];
                c.totalOrders += 1;
                if (o.paymentStatus === 'cleared') {
                    c.clearedOrders += 1;
                    c.clearedOrdersCount += 1;
                    c.totalSpend += (o.totalAmount || 0);
                } else if (o.paymentStatus === 'pending') {
                    c.pendingOrders += 1;
                    c.pendingOrdersCount += 1;
                }
                if (new Date(o.createdAt) > new Date(c.lastActive)) {
                    c.lastActive = o.createdAt;
                }
                if (o.customerPhone && !c.phone) c.phone = o.customerPhone;
                if (o.customerUsername && (!c.username || c.username === 'customer')) c.username = o.customerUsername;
                c.orders.push(o);
            });

            // 2. Ingest active authenticated customer session
            if (authUser && authUser.email) {
                const authEmail = authUser.email.trim().toLowerCase();
                const authUsername = (authUser.username || (authEmail.includes('@') ? authEmail.split('@')[0].slice(0, 20) : 'customer')).trim().toLowerCase();
                if (!map[authEmail]) {
                    map[authEmail] = {
                        email: authEmail,
                        username: authUsername,
                        phone: authUser.customerPhone || authUser.phone || '',
                        totalOrders: 0,
                        clearedOrders: 0,
                        clearedOrdersCount: 0,
                        pendingOrders: 0,
                        pendingOrdersCount: 0,
                        totalSpend: 0,
                        firstSeen: authUser.authenticatedAt || new Date().toISOString(),
                        lastActive: authUser.authenticatedAt || new Date().toISOString(),
                        orders: []
                    };
                } else {
                    if (authUser.username) map[authEmail].username = authUser.username;
                    if (authUser.customerPhone && !map[authEmail].phone) map[authEmail].phone = authUser.customerPhone;
                }
            }

            // 3. Ingest registered affiliate / referral partners
            Object.entries(referrals).forEach(([handle, ref]) => {
                const refEmail = (ref.email || `${handle}@customer.store`).trim().toLowerCase();
                if (!map[refEmail]) {
                    map[refEmail] = {
                        email: refEmail,
                        username: handle,
                        phone: ref.phone || '',
                        totalOrders: 0,
                        clearedOrders: 0,
                        clearedOrdersCount: 0,
                        pendingOrders: 0,
                        pendingOrdersCount: 0,
                        totalSpend: 0,
                        firstSeen: ref.createdAt || new Date().toISOString(),
                        lastActive: ref.lastActive || new Date().toISOString(),
                        orders: []
                    };
                } else {
                    if (!map[refEmail].username || map[refEmail].username === 'customer') {
                        map[refEmail].username = handle;
                    }
                }
            });

            return Object.values(map).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
        },

        // Settings Management
        getSettings() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                if (data) {
                    const parsed = JSON.parse(data);
                    // Enforce verified M-Pesa credentials
                    parsed.paybillNumber = '522533';
                    parsed.accountNumber = '8106675';
                    parsed.accountName = 'JASPER MARKETS';
                    parsed.mpesaActive = parsed.mpesaActive !== undefined ? parsed.mpesaActive : true;
                    parsed.kcbActive = parsed.mpesaActive; // backward sync

                    if (!parsed.supportWhatsapp || parsed.supportWhatsapp === '254700000000' || parsed.supportWhatsapp.startsWith('254')) {
                        parsed.supportWhatsapp = '447455909204';
                    }
                    if (!parsed.supportPhone || parsed.supportPhone.startsWith('+254')) {
                        parsed.supportPhone = '+447455909204';
                    }
                    return { ...DEFAULT_SETTINGS, ...parsed };
                }
                return DEFAULT_SETTINGS;
            } catch (e) {
                return DEFAULT_SETTINGS;
            }
        },

        saveSettings(settings) {
            const merged = { ...DEFAULT_SETTINGS, ...settings };
            // Ensure paybill details adhere to requirements
            merged.paybillNumber = settings.paybillNumber || '522533';
            merged.accountNumber = settings.accountNumber || '8106675';
            merged.accountName = settings.accountName || 'JASPER MARKETS';
            if (merged.mpesaActive !== undefined) merged.kcbActive = merged.mpesaActive;
            if (merged.kcbActive !== undefined) merged.mpesaActive = merged.kcbActive;

            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            this.dispatchUpdate('settings', merged);
        },

        // Cart Management
        getCart() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.CART);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        },

        saveCart(cart) {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            this.dispatchUpdate('cart', cart);
        },

        addToCart(appId) {
            const app = this.getAppById(appId);
            if (!app) return false;

            const cart = this.getCart();
            const existing = cart.find(item => item.id === appId);
            if (!existing) {
                cart.push({
                    id: app.id,
                    title: app.title,
                    price: app.price,
                    coverImage: app.coverImage,
                    category: app.category,
                    downloadUrl: app.downloadUrl,
                    quantity: 1
                });
                this.saveCart(cart);
            }
            return true;
        },

        removeFromCart(appId) {
            let cart = this.getCart();
            cart = cart.filter(item => item.id !== appId);
            this.saveCart(cart);
            return cart;
        },

        clearCart() {
            this.saveCart([]);
        },

        // Reset Demo Data
        resetDemoData() {
            localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(DEFAULT_APPS));
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(DEFAULT_REFERRALS));
            localStorage.removeItem(STORAGE_KEYS.CART);
            localStorage.removeItem(STORAGE_KEYS.USER_RATINGS);
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_REFERRER);
            localStorage.setItem(STORAGE_KEYS.CURRENCY, 'USD');
            this.dispatchUpdate('all_reset', {});
        },

        // Custom Event Dispatcher
        dispatchUpdate(type, payload) {
            const evt = new CustomEvent('premiumstore:statechange', {
                detail: { type, payload }
            });
            window.dispatchEvent(evt);
            window.dispatchEvent(new CustomEvent('appvault:statechange', { detail: { type, payload } }));
        },

        init() {
            if (!localStorage.getItem(STORAGE_KEYS.APPS)) {
                localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(DEFAULT_APPS));
            } else {
                // Ensure existing cached catalog adheres to price range 20 - 200 Ksh ($0.15 - $1.54 USD)
                const apps = this.getApps();
                this.saveApps(apps);
            }
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
            }
            if (!localStorage.getItem(STORAGE_KEYS.REFERRALS)) {
                localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(DEFAULT_REFERRALS));
            } else {
                // Purge legacy mock data if present from previous builds
                try {
                    const storedRefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERRALS) || '{}');
                    if (storedRefs && storedRefs['alex_pro'] && storedRefs['alex_pro'].email === 'alex.creator@gmail.com') {
                        delete storedRefs['alex_pro'];
                        localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(storedRefs));
                    }
                } catch (e) {}
            }
            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
            } else {
                const s = this.getSettings();
                this.saveSettings(s);
            }
            if (!localStorage.getItem(STORAGE_KEYS.CURRENCY)) {
                localStorage.setItem(STORAGE_KEYS.CURRENCY, 'USD');
            }

            window.addEventListener('storage', (e) => {
                if (Object.values(STORAGE_KEYS).includes(e.key) || e.key.startsWith('appvault_')) {
                    Store.dispatchUpdate('sync', { key: e.key, newValue: e.newValue });
                }
            });
        }
    };

    Store.init();
    window.PremiumStore = Store;
    window.AppVaultStore = Store;

})(window);
