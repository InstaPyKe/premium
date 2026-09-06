/**
 * PremiumStore - Shared Data & State Management Core
 * Handles localStorage persistence, cross-tab synchronization,
 * catalog management, multi-currency engine, order processing, rating engines, image storage, and system controls.
 */

(function (window) {
    'use strict';

    const STORAGE_KEYS = {
        APPS: 'premiumstore_apps_v2',
        ORDERS: 'premiumstore_orders_v2',
        SETTINGS: 'premiumstore_settings_v2',
        CART: 'premiumstore_cart_v2',
        USER_RATINGS: 'premiumstore_user_ratings_v2',
        DEVICE_ID: 'premiumstore_device_id_v2',
        CURRENCY: 'premiumstore_selected_currency_v2'
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
    const DEFAULT_APPS = [
        {
            id: 'app_101',
            title: 'TaskFlow Pro Workspace',
            tagline: 'Enterprise-grade automation & offline project synchronization',
            category: 'Productivity',
            price: 19.99,
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
            featured: true,
            status: 'published',
            createdAt: '2026-08-15T10:00:00Z'
        },
        {
            id: 'app_102',
            title: 'NeuroStudio AI Studio',
            tagline: 'On-device neural image rendering and generative design engine',
            category: 'AI Solutions',
            price: 34.99,
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
            featured: true,
            status: 'published',
            createdAt: '2026-08-20T14:30:00Z'
        },
        {
            id: 'app_103',
            title: 'PulseConnect Social Hub',
            tagline: 'Decentralized P2P encrypted messaging & community channels',
            category: 'Social Apps',
            price: 12.50,
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
            price: 15.00,
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
            featured: true,
            status: 'published',
            createdAt: '2026-08-25T16:00:00Z'
        },
        {
            id: 'app_105',
            title: 'CodeForge IDE Master',
            tagline: 'Lightweight reactive code editor with embedded compiler & Git suite',
            category: 'Developer Tools',
            price: 24.99,
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
            price: 29.50,
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

    // Initial Orders
    const DEFAULT_ORDERS = [
        {
            id: 'ORD-9021',
            customerEmail: 'alex.k@techcorp.io',
            customerPhone: '254712345678',
            items: [
                { id: 'app_101', title: 'TaskFlow Pro Workspace', price: 19.99 }
            ],
            totalAmount: 19.99,
            currencyCode: 'USD',
            paymentMethod: 'kcb', // 'kcb' | 'card'
            paymentStatus: 'pending', // 'pending' | 'cleared' | 'failed'
            kcbRef: 'KCB-883920192',
            downloadToken: 'tok_38f9a2b8e9104c2',
            downloadUrl: 'https://vault-storage.app/packages/taskflow-pro-v2.4.0.zip',
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            id: 'ORD-8940',
            customerEmail: 'sarah.m@designlab.com',
            customerPhone: '254798765432',
            items: [
                { id: 'app_102', title: 'NeuroStudio AI Studio', price: 34.99 },
                { id: 'app_104', title: 'HexaShield Security Vault', price: 15.00 }
            ],
            totalAmount: 49.99,
            currencyCode: 'USD',
            paymentMethod: 'card',
            paymentStatus: 'cleared',
            kcbRef: 'CARD-TXN-7749102',
            downloadToken: 'tok_9104c2a7e189f3b',
            downloadUrl: 'https://vault-storage.app/packages/neurostudio-ai-v1.8.2.apk',
            expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
        }
    ];

    // Initial System Settings
    const DEFAULT_SETTINGS = {
        storeName: 'PremiumStore',
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing scheduled system upgrades to improve our payment gateways and download engines. Public purchases will resume shortly.',
        kcbActive: true,
        cardActive: true,
        paybillNumber: '522533',
        supportWhatsapp: '254700000000',
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
                return data ? JSON.parse(data) : DEFAULT_APPS;
            } catch (e) {
                return DEFAULT_APPS;
            }
        },

        saveApps(apps) {
            localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
            this.dispatchUpdate('apps', apps);
        },

        getAppById(id) {
            const apps = this.getApps();
            return apps.find(a => a.id === id) || null;
        },

        addApp(appData) {
            const apps = this.getApps();
            const newApp = {
                id: 'app_' + Math.random().toString(36).substring(2, 7),
                title: appData.title || 'Untitled App',
                tagline: appData.tagline || '',
                category: appData.category || 'Productivity',
                price: parseFloat(appData.price) || 0,
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
            const refNumber = orderData.paymentMethod === 'kcb' 
                ? 'KCB-' + Math.floor(100000000 + Math.random() * 900000000)
                : 'CARD-' + Math.floor(100000000 + Math.random() * 900000000);

            const curr = this.getSelectedCurrency();

            const newOrder = {
                id: orderId,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone || '',
                items: orderData.items || [],
                totalAmount: orderData.totalAmount || 0, // USD base or converted
                currencyCode: orderData.currencyCode || curr.code,
                formattedTotal: orderData.formattedTotal || this.formatPrice(orderData.totalAmount || 0),
                paymentMethod: orderData.paymentMethod || 'kcb',
                paymentStatus: orderData.paymentStatus || 'pending',
                kcbRef: orderData.kcbRef || refNumber,
                downloadToken: token,
                downloadUrl: orderData.downloadUrl || (orderData.items && orderData.items[0] ? orderData.items[0].downloadUrl : 'https://vault-storage.app/packages/bundle.zip'),
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
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

        // Settings Management
        getSettings() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
            } catch (e) {
                return DEFAULT_SETTINGS;
            }
        },

        saveSettings(settings) {
            const merged = { ...DEFAULT_SETTINGS, ...settings };
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
                const oldApps = localStorage.getItem('appvault_apps_v2');
                localStorage.setItem(STORAGE_KEYS.APPS, oldApps || JSON.stringify(DEFAULT_APPS));
            }
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                const oldOrders = localStorage.getItem('appvault_orders_v2');
                localStorage.setItem(STORAGE_KEYS.ORDERS, oldOrders || JSON.stringify(DEFAULT_ORDERS));
            }
            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                const oldSettings = localStorage.getItem('appvault_settings_v2');
                localStorage.setItem(STORAGE_KEYS.SETTINGS, oldSettings || JSON.stringify(DEFAULT_SETTINGS));
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
