# PremiumStore — Digital Application Marketplace & Download Portal

PremiumStore is a secure, high-performance digital application marketplace, showcase platform, and checkout portal featuring picture-dominated UI/UX, multi-currency conversion, item ratings, M-Pesa Paybill and Card payments, anti-inspection frontend security, Mandatory Universal Payment Review with live queue tracking, and Customer Email Authentication with persistent digital vaults.

---

## 🚀 Key Features

### 🛒 Public Marketplace (`index.html`)
- **Price Capping (Ksh. ≤ 600)**: All applications are strictly capped at or below **Ksh. 600** ($2.50 – $4.50 USD at standard KES conversion rates), ensuring affordable premium micro-apps.
- **Frontend Code Protection & Anti-Inspection**:
  - Disabled right-click context menu with custom toast alert.
  - Intercepted DevTools shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Cmd+Opt+I`).
  - Blocked Source View (`Ctrl+U`) and Page Save (`Ctrl+S`).
  - Disabled image dragging and text selection restrictions for non-input elements.
- **Picture-Dominated Showcase**: High-resolution image sliders with background blur overlays, category badges, and direct action CTAs.
- **Customer Email Authentication & Digital Vault ("My Library")**:
  - Unique identification of each customer via valid RFC 5322 email addresses.
  - Header avatar chip showing signed-in status and quick access to digital library.
  - **"My Library & Downloads"** modal displaying all cleared applications, permanent license keys, signed token URLs, and real-time review status of pending orders.
  - Persistent identification across browser sessions and automatic checkout pre-fill.
- **Multi-Country & Multi-Currency Engine**: Live country/currency switcher (USD, KES, GBP, EUR, NGN, ZAR, AED, INR, CAD, TZS, UGX, RWF) with dynamic real-time exchange rates across all products, modals, cart, and checkout.
- **Dynamic Filtering & Search**: Category tags (*Productivity*, *AI Solutions*, *Social Apps*, *Tools & Utilities*, *Developer Tools*, *Design & Media*) and instant search across titles and descriptions.
- **Interactive App Details Modal**: Multi-screenshot image gallery carousel, release notes changelog, specs, and an interactive 5-star rating submission engine with device ID duplicate protection.
- **Slide-Over Cart Drawer**: Persistent `localStorage` cart with live badge counters, item removal, and subtotal calculation.
- **Multi-Gateway Checkout Portal**:
  - **M-Pesa Paybill**:
    - **Paybill Business Number**: `522533`
    - **Account Number**: `8106675`
    - **Account Name**: `JASPER MARKETS`
    - Automated STK Push prompt simulation and manual M-Pesa transaction code verification.
  - **Credit/Debit Card Gateway**: Formatted card inputs (Stripe/Visa/Mastercard UI).
  - **Promo Voucher Engine**: Dynamic discount codes (e.g. `SAVE20`, `DEV100`).
- **Mandatory Universal Payment Review & Live Queue Tracker**:
  - All payment methods (both Card and M-Pesa) strictly enter `pending` status for administrator review before fulfillment.
  - **Live Elapsed Review Timer**: Counts elapsed time (`MM:SS`) in real-time from payment submission.
  - **Expedited Support Agent Chat**: If review takes longer than expected, users are prompted with a 1-click WhatsApp support button pre-filling customer email, order ID, payment method, reference, amount paid, and queue time.
  - **Live Real-Time Unlock**: The moment an admin clears the order in `admin.html`, the customer's open screen and customer library instantly unlock:
    - Unique permanent digital license key (`PSTR-XXXX-491A-882C-PRO`).
    - Active signed download URL with live **24-hour countdown clock** and copy button.
    - Direct APK/ZIP release package downloader.

---

### 🛡️ Admin Operations Console (`admin/admin.html`)
- **Dashboard Overview**: Real-time KPI stat cards (*Total Revenue*, *Cleared Orders*, *Pending Overrides*, *Active Apps*) and live transaction stream.
- **Application Catalog (CRUD)**:
  - **Frontend Picture Uploading**: Drag-and-drop / file picker for local images or direct URL sharing with live preview.
  - **Gallery & Screenshot Manager**: Multi-file upload or URL array with thumbnail deletion.
  - Visibility switch (*Published* / *Hidden*) and Delete with confirmation.
- **Payment Transactions & Verification**:
  - Real-time review queue with live elapsed timers for pending transactions.
  - 1-click **"Approve & Unlock"** button that clears pending orders and triggers immediate, real-time license and download delivery on the customer's screen.
  - 1-click WhatsApp customer support chat button for direct communication.
- **Customer Identities & Accounts (Tab 5)**:
  - Searchable directory of unique customer emails and phone numbers.
  - Customer KPI metrics: Total Customers, Active Licensees, Customer LTV, Pending Approvals.
  - Detailed Customer Vault Modal showing full order histories, active permanent licenses, and pending review clearances.
- **Gateways & System Settings**:
  - Global Maintenance Mode master switch with custom public broadcast message.
  - Independent toggles for M-Pesa Paybill and Card gateways.
  - Configurable Paybill (`522533`), Account Number (`8106675`), Account Name (`JASPER MARKETS`), and WhatsApp support number.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS CDN, Lucide Icons, Google Fonts (Plus Jakarta Sans & Outfit).
- **State Management & Persistence**: `store.js` unified reactive data store with `localStorage` and cross-tab `StorageEvent` and custom event synchronization.
- **Styling**: Modern Glassmorphism, Dark Mode Aesthetics, responsive layouts.

---

## 📂 Project Structure

```text
premium/
├── index.html        # Public Marketplace, Security Guards, Checkout & Customer Library Vault
├── store.js          # Shared Reactive Data Store, Multi-Currency Engine, Price Guards & Auth
├── admin/
│   └── admin.html    # Admin Operations Console, Customer Accounts & Order Approval Portal
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
2. Open `index.html` in your browser to explore the marketplace, sign in with email, and test checkout.
3. Open `admin/admin.html` (authorized admin email: `newitorgxxx@gmail.com`) to manage the catalog, inspect customer vaults, approve transactions, and update system settings.
