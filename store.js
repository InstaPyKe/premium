/**
 * PremiumStore - Shared Data & State Management Core
 * Handles localStorage persistence, cross-tab synchronization,
 * catalog management, multi-currency engine, order processing, rating engines, image storage, and system controls.
 */

(function (window) {
    'use strict';

    const STORAGE_KEYS = {
        APPS: 'premiumstore_apps_v4',
        ORDERS: 'premiumstore_orders_v2',
        SETTINGS: 'premiumstore_settings_v2',
        CART: 'premiumstore_cart_v2',
        USER_RATINGS: 'premiumstore_user_ratings_v2',
        DEVICE_ID: 'premiumstore_device_id_v2',
        CURRENCY: 'premiumstore_selected_currency_v2',
        AUTH_USER: 'premiumstore_auth_user_v2'
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
    // Note: All product prices are strictly bounded between 100 Ksh and 300 Ksh ($0.77 – $2.30 USD at 130 KES/USD)
    const DEFAULT_APPS = [
        {
            id: 'app_capcut_pro',
            title: 'CapCut Pro Video & AI Studio',
            tagline: 'VIP 4K 60FPS video editor, AI body effects & dynamic chroma key suite',
            category: 'Design & Media',
            price: 2.30,
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
            price: 2.15,
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
            price: 2.30,
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
            price: 2.20,
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
            price: 1.90,
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
            price: 1.75,
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
            price: 1.99,
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
            price: 2.30,
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
            price: 1.15,
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
            price: 1.50,
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
            price: 1.99,
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
            price: 2.30,
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

                // Enforce strict price boundary: Not more than 300 Ksh ($2.30 USD) and not less than 100 Ksh ($0.77 USD)
                apps = apps.map(app => {
                    const price = parseFloat(app.price) || 1.99;
                    if (price > 2.30) {
                        return { ...app, price: 2.30 };
                    } else if (price < 0.77) {
                        return { ...app, price: 0.77 };
                    }
                    return app;
                });
                return apps;
            } catch (e) {
                return DEFAULT_APPS;
            }
        },

        saveApps(apps) {
            // Guarantee price boundary on save (100 Ksh to 300 Ksh / $0.77 to $2.30 USD)
            const capped = apps.map(a => {
                const price = parseFloat(a.price) || 1.99;
                const boundedPrice = price > 2.30 ? 2.30 : (price < 0.77 ? 0.77 : Math.round(price * 100) / 100);
                return { ...a, price: boundedPrice };
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
            const rawPrice = parseFloat(appData.price) || 1.99;
            const boundedPrice = rawPrice > 2.30 ? 2.30 : (rawPrice < 0.77 ? 0.77 : Math.round(rawPrice * 100) / 100);

            const newApp = {
                id: 'app_' + Math.random().toString(36).substring(2, 7),
                title: appData.title || 'Untitled App',
                tagline: appData.tagline || '',
                category: appData.category || 'Productivity',
                price: boundedPrice,
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
                    const rawPrice = parseFloat(updates.price) || 1.99;
                    updates.price = rawPrice > 2.30 ? 2.30 : (rawPrice < 0.77 ? 0.77 : Math.round(rawPrice * 100) / 100);
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

            // Auto-associate and authenticate customer session
            if (cleanEmail && this.isValidEmail(cleanEmail) && !authUser) {
                this.setAuthenticatedUser(cleanEmail, { customerPhone: orderData.customerPhone || '' });
            }

            // Universal review requirement: All payments must undergo admin review (paymentStatus: 'pending')
            const newOrder = {
                id: orderId,
                customerEmail: cleanEmail,
                customerPhone: orderData.customerPhone || '',
                items: orderData.items || [],
                totalAmount: orderData.totalAmount || 0,
                currencyCode: orderData.currencyCode || curr.code,
                formattedTotal: orderData.formattedTotal || this.formatPrice(orderData.totalAmount || 0),
                paymentMethod: method,
                paymentStatus: 'pending', // Strictly pending for all payments
                mpesaRef: refNumber,
                kcbRef: refNumber, // backward compatibility
                paybillNumber: settings.paybillNumber || '522533',
                accountNumber: settings.accountNumber || '8106675',
                accountName: settings.accountName || 'JASPER MARKETS',
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
                order.paymentStatus = status;
                this.saveOrders(orders);
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
            const userProfile = {
                email: cleanEmail,
                authenticatedAt: new Date().toISOString(),
                deviceId: getDeviceId(),
                ...extraData
            };
            try {
                localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
                sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userProfile));
            } catch(e) {}
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
            const map = {};
            orders.forEach(o => {
                const email = (o.customerEmail || 'anonymous@store.app').trim().toLowerCase();
                if (!map[email]) {
                    map[email] = {
                        email: email,
                        phone: o.customerPhone || '',
                        totalOrders: 0,
                        clearedOrders: 0,
                        pendingOrders: 0,
                        totalSpend: 0,
                        firstSeen: o.createdAt,
                        lastActive: o.createdAt,
                        orders: []
                    };
                }
                const c = map[email];
                c.totalOrders += 1;
                if (o.paymentStatus === 'cleared') {
                    c.clearedOrders += 1;
                    c.totalSpend += (o.totalAmount || 0);
                } else if (o.paymentStatus === 'pending') {
                    c.pendingOrders += 1;
                }
                if (new Date(o.createdAt) > new Date(c.lastActive)) {
                    c.lastActive = o.createdAt;
                }
                if (o.customerPhone && !c.phone) c.phone = o.customerPhone;
                c.orders.push(o);
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
            localStorage.removeItem(STORAGE_KEYS.CART);
            localStorage.removeItem(STORAGE_KEYS.USER_RATINGS);
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
                // Ensure existing cached catalog adheres to max price <= Ksh 600
                const apps = this.getApps();
                this.saveApps(apps);
            }
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
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
