# PremiumStore — Digital Application Marketplace & Download Portal

PremiumStore is a full-stack digital application marketplace, showcase platform, and checkout portal featuring picture-dominated UI/UX, multi-currency conversion, item ratings, multi-gateway payments (KCB BUNI Paybill and Card), automated digital fulfillment, and an integrated Admin Operations Console.

---

## 🚀 Key Features

### 🛒 Public Marketplace (`index.html`)
- **Picture-Dominated Showcase**: High-resolution image sliders with background blur overlays, category badges, and direct action CTAs.
- **Multi-Country & Multi-Currency Engine**: Live country/currency switcher (USD, KES, GBP, EUR, NGN, ZAR, AED, INR, CAD, TZS, UGX, RWF) with dynamic real-time exchange rates across all products, modals, cart, and checkout.
- **Dynamic Filtering & Search**: Category tags (*Productivity*, *AI Solutions*, *Social Apps*, *Tools & Utilities*, *Developer Tools*, *Design & Media*) and instant search across titles and descriptions.
- **Interactive App Details Modal**: Multi-screenshot image gallery carousel, release notes changelog, hardware/system specs, and an interactive 5-star rating submission engine with device ID duplicate protection.
- **Slide-Over Cart Drawer**: Persistent `localStorage` cart with live badge counters, item removal, and subtotal calculation.
- **Multi-Gateway Checkout Portal**:
  - **KCB BUNI Paybill (M-Pesa)**: Paybill 522533 STK Push simulation and manual reference verification.
  - **Credit/Debit Card Gateway**: Formatted card inputs (Stripe/Flutterwave UI).
  - **Promo Voucher Engine**: Dynamic discount codes (e.g. `SAVE20`, `DEV100`).
- **Digital Fulfillment & Success View**:
  - Unique digital license key (`PSTR-XXXX-491A-882C-PRO`).
  - Active signed download URL with live **24-hour countdown clock** and copy button.
  - Direct APK/ZIP release package downloader.
- **Support & Maintenance Controls**:
  - Floating WhatsApp support chat widget with dynamic product inquiry context.
  - Global system maintenance screen synchronized across tabs.

---

### 🛡️ Admin Operations Console (`admin/admin.html`)
- **Dashboard Overview**: Real-time KPI stat cards (*Total Revenue*, *Cleared Orders*, *Pending Overrides*, *Active Apps*) and live transaction stream.
- **Application Catalog (CRUD)**:
  - **Frontend Picture Uploading**: Drag-and-drop / file picker for local images or direct URL sharing with live preview.
  - **Gallery & Screenshot Manager**: Multi-file upload or URL array with thumbnail deletion.
  - Visibility switch (*Published* / *Hidden*) and Delete with confirmation.
- **Transactions & Overrides**:
  - Filterable transaction logs (*All*, *Pending*, *Cleared*, *Failed*).
  - **"Force Clear & Deliver"** manual override button that generates valid download tokens and delivers licenses instantly.
- **Gateways & System Settings**:
  - Global Maintenance Mode master switch with custom public broadcast message.
  - Independent toggles for KCB BUNI Paybill and Card gateways.
  - Paybill number and WhatsApp support number configuration.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS CDN, Lucide Icons, Google Fonts (Plus Jakarta Sans & Outfit).
- **State Management & Persistence**: `store.js` unified reactive data store with `localStorage` and cross-tab `StorageEvent` synchronization.
- **Styling**: Modern Glassmorphism, Dark Mode Aesthetics, responsive layouts.

---

## 📂 Project Structure

```text
premium/
├── index.html        # Public Marketplace & Checkout Portal
├── store.js          # Shared Reactive Data Store & Multi-Currency Engine
├── admin/
│   └── admin.html    # Admin Operations Console & Catalog CRUD
├── backend/          # Backend service modules
├── README.md         # Documentation
└── .gitignore        # Git ignore rules
```

---

## 🏁 Quick Start

1. Clone or open the repository locally:
   ```bash
   git clone https://github.com/InstaPyKe/premium.git
   ```
2. Open `index.html` in your browser to explore the marketplace.
3. Open `admin/admin.html` to manage the catalog, transactions, and system settings.
