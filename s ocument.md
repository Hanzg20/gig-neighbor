# 📄 JUSTWEDO (恒帮) - Comprehensive System Design Document

📐 **Canadian Community Services & Gig Economy Platform**
**Version:** 2.1 (Enhanced Market & Tech Architecture)
**Last Updated:** 2026-01-04
**Target Market:** Canada (Ottawa Pilot -> Ontario Expansion)

---

## 1. Product Overview & Design Philosophy

### 1.1 Vision
**JUSTWEDO (恒帮/邻里邻居)** is a trusted "Neighborhood Help + Gig Economy" ecosystem. It bridges the gap between professional service platforms (Fiverr), local food delivery (Meituan), and high-trust community boards (Nextdoor/Yelp).

### 1.2 Core Philosophy: Modernity & Warmth
To differentiate from dated classifieds (Kijiji) or cold marketplaces, JUSTWEDO follows:

*   **Neighborly Narrative**: Listings are "community stories." We use terms like **Neighbor**, **Helper**, and **Giver** instead of "Vendor" or "Seller."
*   **Tactile & Premium UI**: A "Glassmorphism" aesthetic with large corner radii (`2xl`+), soft glow shadows (`shadow-glow`), and smooth micro-animations to convey a premium, safe feeling.
*   **Human-Centric Copy**: UI messaging mimics a friendly neighborly conversation.
*   **Trust Visualization**:
    *   **Neighbor Vouchers**: Testimonials emphasizing human connection over raw metrics.
    *   **Mutual Neighbors**: Highlighting common community connections.
    *   **Verified Badges**: Physical-style badges for KYC and skill verification.

---

## 2. Target Markets (Ottawa Pilot)

### 2.1 Strategic Geographic Focus
*   **Kanata Lakes**: Focus on mature families, settled homeowners, and high-trust peer-to-peer equipment sharing/home services.
*   **Lees Ave (Sandy Hill/UOttawa)**: Focus on high-density apartment living, student-led errands, meal sharing, and sub-leasing services.

### 2.2 Cultural Adoption Strategy: "Concentrated Density"
1.  **Phase 1 (Chinese First)**: Build liquidity within cultural hubs (Kanata, Lees) where trust is naturally higher.
2.  **Phase 2 (Local Expansion)**: Leverage the established service density to onboard the broader local Canadian community.
3.  **UI Strategy**: English-primary UI with full bilingual data support (Zh/En) to ensure accessibility for all residents.

---

## 3. Business Domains & Transactional Models

### 3.1 Five Pillars of Service
1.  **Life Services (Life)**: Cleaning, moving, pet care.
2.  **Rental & Sharing (Rental)**: Cameras, tools, camping gear. *Requires Deposit Logic.*
3.  **Expert Consultation (Expert)**: Legal, tech, education. *Supports Milestones.*
4.  **Neighborhood Goods (Goods)**: Second-hand, homemade food, crafts.
5.  **Community Tasks (Tasks)**: Urgent errands, delivery, help.

### 3.2 Advanced Transactional Models (JinBean Patterns)
*   **Instant Pay**: Standard purchase for goods or fixed-price services.
*   **Quote & Call**: For complex services; provider issues a quote after 1:1 chat.
*   **Deposit & Hold**: Secure high-value rentals or bookings with a refundable deposit.
*   **Subscription & Milestone**: For ongoing help (e.g., weekly landscaping) with progress-based payouts.
*   **Face-to-Face Payment**: For low-friction neighborly trades (e.g., swapping a tool for a "coffee" tip).
*   **Deposit-Only**: Pay only the platform/holding fee now, balance paid locally.

---

## 4. Technical Architecture

### 4.1 Development Strategy
*   **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS.
*   **Backend**: Supabase (Auth, PostgreSQL/PostGIS, Storage, Real-time).
*   **State Management**: Zustand (Domain-focused stores with persistence).

### 4.2 Architectural Patterns
*   **Repository Pattern**:
    *   An abstraction layer (`/services/repositories`) decouples business logic from data sources.
    *   Supports seamless switching between `Mock` (Development/Testing) and `Supabase` (Production) implementations via `RepositoryFactory`.
*   **Listing Master-Detail Pattern**:
    *   **Master**: The "Catalog Entry" (Storefront) containing location, provider info, and general description.
    *   **Item (SKU)**: Specific variants/offerings with distinct pricing models (e.g., "1 Bedroom Clean" vs "3 Bedroom Clean").
*   **Order State Machine**:
    *   `PENDING_PAYMENT` -> `PENDING_CONFIRMATION` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`.
    *   Includes `CANCELLED` and `DISPUTED` branches for safety and dispute resolution.

### 4.3 Multi-language Implementation (i18n)
*   **Data Layer**: Dual-field storage (e.g., `titleZh`, `titleEn`) for all dynamic content.
*   **UI Layer**: React-i18next for static strings.
*   **Intelligence**: Automatic fallback logic (Show English if Chinese is missing, and vice versa).

---

## 5. Trust & Geofencing

*   **PostGIS Integration**: Real-time discovery based on neighborhood "bounds" rather than just a simplistic radius.
*   **Identity KYC**: Integration planned for Stripe/Sumsub to verify "Verified Neighbor" status.
*   **Community Badges**: Earnable tokens for "Early Adopter," "Top Helper," and "Trusted Neighbor."

---

## 6. Roadmap

1.  **Phase 1**: UI Foundation & "Mock-Full" Flow (Current Status: ~90% Done).
2.  **Phase 2**: Full Supabase Migration & Live Messaging.
3.  **Phase 3**: Pilot Launch in Kanata/Lees & Real-world Transaction Testing.
4.  **Phase 4**: Ontario-wide Expansion & Cross-Platform (App/Mini-Program) Deployment.
