# 📐 HangHand - Comprehensive System Design Document
## 🍁 Canadian Community Services Platform

**Version**: 2.0 (Canadian Market)  
**Last Updated**: 2026-01-04  
**Target Market**: Canada (GTA/Ontario primary)

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Market Analysis](#2-market-analysis)
3. [Business Domains](#3-business-domains)
4. [Technical Architecture](#4-technical-architecture)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Rental Business Logic](#6-rental-business-logic)
7. [Professional Services: Legal & Real Estate](#7-professional-services-legal--real-estate)
8. [Trust & Safety](#8-trust--safety)
9. [Shopping Cart & Checkout Logic](#9-shopping-cart--checkout-logic)
10. [Order Management Standards](#10-order-management-standards)
11. [Community Review & Trust Design](#11-community-review--trust-design)
12. [Buyer Journey & Neighborhood P2P Logic](#12-buyer-journey--neighborhood-p2p-logic)
13. [Marketplace Quick-Post Flow (Sell/Rent)](#13-marketplace-quick-post-flow-sellrent)
14. [Seller Workbench (Helper Dashboard)](#14-seller-workbench-helper-dashboard)
15. [JinBean Points System (Engagement)](#15-jinbean-points-system-engagement)
16. [Platform Login & Auth Flow](#16-platform-login--auth-flow)
17. [Legal Disclaimer & Intermediary Policy](#17-legal-disclaimer--intermediary-policy)
18. [UI/UX Design Philosophy: "Neighborly Warmth"](#18-uiux-design-philosophy-neighborly-warmth)
19. [Hybrid Development Strategy](#19-hybrid-development-strategy)
20. [Portability & Anti-Lock-in Strategy](#20-portability--anti-lock-in-strategy)
21. [Cross-Platform Expansion Strategy (App & Mini-Program)](#21-cross-platform-expansion-strategy-app--mini-program)
22. [AI Assistance Layer](#22-ai-assistance-layer)

---

## 1. Product Overview

### 1.1 Product Definition
**HangHand** is a community-based gig economy platform for the Canadian market, combining trusted neighbor-to-neighbor connections with professional service marketplace features. It competes with TaskRabbit and Thumbtack while addressing uniquely Canadian needs.

### 1.2 Core Values
- **Trust & Safety**: Background checks, license verification, insurance validation
- **Seasonal Adaptability**: Built-in support for weather-dependent services
- **Regulatory Compliance**: Automated provincial license verification (ECRA, TSSA, RMT)
- **Community-First**: Hyperlocal focus aligned with Canadian neighborhood culture

### 1.3 Target Users

| Role | Requirements | Access |
|------|-------------|--------|
| **Consumer** | Email verification | Browse, book, review, post free items/tasks |
| **Service Provider** | Background check + insurance | Manage listings, accept orders, non-licensed services |
| **Verified Professional** | Provincial license + $2M insurance + criminal record | All Provider features + licensed trades |
| **Admin** | Platform employee | Full moderation, KYC, license verification |

---

## 2. Market Analysis

### 2.1 Why Canadian Localization?

**Critical Differences from Chinese Market:**

| Aspect | China | Canada |
|--------|-------|--------|
| **Licensing** | Loose regulation | Strict provincial requirements (ECRA, TSSA) |
| **Food Sharing** | Common | Regulated by Health Canada |
| **Seasonal Needs** | Limited | High (snow removal, winterization) |
| **Insurance** | Optional | Mandatory for many services |
| **Cultural Model** | "跑腿" / "好物" | Errand services / Marketplace |

### 2.2 Competitive Landscape

| Feature | HangHand | TaskRabbit | Thumbtack | Rover |
|---------|----------|------------|-----------|-------|
| Seasonal Services | ✅ | ❌ | Limited | ❌ |
| License Auto-Verify | ✅ | Manual | Self-report | N/A |
| Community Marketplace | ✅ | ❌ | ❌ | ❌ |
| Hyperlocal (<5km) | ✅ | City-wide | City-wide | City-wide |
| Bilingual (EN/FR) | ✅ | ❌ | ❌ | ❌ |

### 2.3 Key Market Insights

**High-Demand Services in Canada:**
1. **Snow Removal** (Nov-Mar): $30-60/visit, recurring monthly contracts
2. **Lawn Care** (Apr-Oct): $30-80/service
3. **Licensed Trades**: Critical gap in marketplace platforms
4. **Tool Sharing**: Sustainability-focused millennials

### 2.4 Pilot Market Analysis (Ottawa Nodes)

The platform will pilot in two distinct "Micro-Hubs" in Ottawa to test different service-market fits.

#### Node A: Kanata Lakes (High-End Suburb)
- **Demographics**: Tech professionals (Kanata North), mature families, homeowners.
- **Priority Services**: Lawn Care, Snow Removal, Professional Cleaning, Tutoring, Skilled Trades.
- **Value Prop**: Convenience for busy dual-income families; quality over price.
- **Strategy**: Focus on "Verified Pros" and reliability.

#### Node B: Lees Ave (170/190) (High-Density Urban)
- **Demographics**: Students (uOttawa), young professionals, high mobility.
- **Priority Services**: Home-cooked Food sharing, Item Rental (tools/moving gear), Used Marketplace, Errands/Moving help.
- **Value Prop**: Cost-saving, social connection, convenience in a high-density vertical community.
- **Strategy**: Peer-to-peer (Neighborhood Goods) focus; high-frequency low-ticket transactions.

### 2.5 Strategic Positioning: Chinese First → Local General

**Is this reasonable?**  
Yes, for several reasons:
1. **High Trust Density**: The initial trust hurdle is lower within a linguistic/cultural group (WeChat-driven initial growth).
2. **Specific Pain Points**: Finding authentic food or "trusted" services that speak the language is a strong motivator.
3. **Operational Focus**: Easier to manage support and verification in one community during the "Cold Start" phase.

**Risk**: If the platform feels purely "Chinese," local general residents may perceive it as "not for them" later.  
**Solution**: Use a **Global Design Aesthetic** (North American standard UI) but support Chinese content.

---

## 3. Business Domains

### 3.1 Domain Hierarchy

```
HangHand Platform
├── Home Services (Non-Licensed)
│   ├── House Cleaning
│   ├── Lawn Mowing
│   ├── Junk Removal
│   ├── Furniture Assembly
│   └── Handyman
│
├── Skilled Trades ⚠️ LICENSE REQUIRED
│   ├── Licensed Electrician (ECRA)
│   ├── Licensed Plumber (OPMCA)
│   ├── HVAC Technician (TSSA)
│   └── Appliance Repair
│
├── Personal Services
│   ├── Pet Sitting / Dog Walking
│   ├── Tutoring
│   ├── Personal Training
│   └── Massage Therapy (RMT)
│
├── Community Marketplace
│   ├── Free & Share
│   ├── Furniture & Decor
│   ├── Tool Rental ← Rental Business
│   └── Sports Equipment
│
└── Seasonal Services 🍁
    ├── Winter: Snow Removal, Ice Clearing
    ├── Spring: Yard Cleanup, Power Washing
    ├── Summer: Lawn Care, Garden
    └── Fall: Leaf Raking, Christmas Lights
```

### 3.2 Domain Details

#### 3.2.1 Home Services
- **No License Required** (but insurance recommended)
- **Pricing**: Hourly ($25-80) or Flat Rate
- **Background Check**: Required for in-home services
- **Target**: Homeowners, busy professionals

#### 3.2.2 Skilled Trades ⚠️
- **Mandatory License Verification**
- **Pricing**: $80-150/hr + service call
- **Insurance**: $2M+ liability required
- **Platform Validation**: Auto-check ECRA/TSSA databases before listing approval

**License Requirements by Province (Ontario)**:
- Electrician: ECRA (Electrical Safety Authority)
- Plumber: OPMCA (Ontario Plumbing Code)
- Gas Fitter: TSSA (Technical Standards & Safety Authority)
- Massage Therapist: RMT (College of Massage Therapists)

#### 3.2.3 Seasonal Services 🍁
**Canada-Specific High-Demand Categories:**

| Season | Services | Pricing |
|--------|----------|---------|
| Winter | Snow Removal, Ice Clearing | $30-60/visit or seasonal contract |
| Spring | Power Washing, Yard Cleanup | $100-300/job |
| Summer | Lawn Care, Garden Maintenance | $40-80/hr |
| Fall | Leaf Raking, Gutter Cleaning | $50-150/job |

---

## 4. Technical Architecture

### 4.1 Master-Detail Listing Model

**Purpose**: Support complex service offerings with multiple tiers

```typescript
// Example: House Cleaning Service
ListingMaster {
  id: "master_001",
  titleEn: "Professional House Cleaning",
  type: "SERVICE",
  categoryId: "1010100",
  providerId: "provider_123"
}

ListingItems [
  {
    id: "item_001",
    masterId: "master_001",
    nameEn: "Basic Clean (2 Hours)",
    pricing: {
      model: "FIXED",
      price: { amount: 9000, currency: "CAD" }, // $90
      unit: "per service"
    }
  },
  {
    id: "item_002",
    masterId: "master_001",
    nameEn: "Deep Clean (4 Hours)",
    pricing: {
      model: "FIXED",
      price: { amount: 18000, currency: "CAD" }, // $180
      unit: "per service"
    }
  }
]
```

### 4.2 Repository Pattern

**Data Access Abstraction:**
```typescript
interface IListingRepository {
  getAll(): Promise<ListingMaster[]>;
  getById(id: string): Promise<ListingMaster | null>;
  getByCategory(categoryId: string): Promise<ListingMaster[]>;
  create(listing: ListingMaster): Promise<ListingMaster>;
}

// Implementations:
- MockListingRepository (for development)
- SupabaseListingRepository (for production)
```

**Benefits**:
- Easy A/B testing
- Seamless mock → production transition
- Clear separation of concerns

### 4.3 Database Schema (Supabase/PostgreSQL)

For a detailed column-by-column reference, see the self-documenting [SQL Schema](file:///d:/My%20Project/ts/hangs/gig-neighbor/docs/supabase_schema.sql).

**Core Table Overview:**
- `public.user_profiles`: Extended user data (Email, Beans, Node).
- `public.ref_codes`: Global categories and community nodes.
- `public.listing_masters`: Service and product catalog entries.
- `public.bean_transactions`: Ledger for the JinBean ecosystem.
- `public.orders`: Transactional state machine records.

### 4.4 Order State Machine

```
PENDING_PAYMENT 
    ↓
PENDING_CONFIRMATION (Provider accepts)
    ↓
IN_PROGRESS (Service ongoing)
    ↓
COMPLETED (Released to provider after 48h)

    ↓ (Any stage)
CANCELLED (Refund logic)
```

### 4.5 Transactional Models (JinBean Patterns)

Different service categories require distinct booking and payment flows. The platform supports four primary transactional models:

#### 1. Instant Pay (The "Standard" Model)
- **Applicable Domains**: Home Services (Cleaning, Gutter), Personal Services (Tutoring, Pet care), Neighborhood Goods (Used items).
- **Flow**:
  1. User selects item/service.
  2. User pays full amount (Service + Platform Fee).
  3. Platform holds funds in Escrow.
  4. Provider completes service.
  5. User confirms or 48h auto-release.
  6. Funds released to Provider.

#### 2. Quote & Call (The "Skilled Trades" Model)
- **Applicable Domains**: Skilled Trades (Electrician, Plumber), Professional Services (Consultations).
- **Flow**:
  1. User pays a **Service Call Fee** (e.g., $50) to book.
  2. Provider arrives, inspects, and provides a Quote.
  3. User accepts the Quote on-platform.
  4. User pays the additional labor/parts fee.
  5. Work commences.
  6. Final release upon completion.
- **Why**: Protects professional's time (visit fee) while handling unpredictable scope.

#### 3. Deposit & Hold (The "Rental" Model)
- **Applicable Domains**: Tool Rental, Sports Equipment, High-value Goods.
- **Flow**:
  1. User pays **Rental Fee + Platform Fee**.
  2. Platform performs a **Pre-authorized Hold** on User's card for the **Security Deposit** (not charged).
  3. Return process:
     - **Success**: Hold released.
     - **Damage**: Hold partial/full charge after dispute check.
- **Why**: Essential for asset protection in peer-to-peer sharing.

#### 4. Subscription & Milestone (The "Seasonal" Model)
- **Applicable Domains**: Seasonal Services (Snow Removal, Weekly Lawn Care).
- **Flow**:
  1. User signs up for a **Seasonal Period** (e.g., Nov-Mar).
  2. User pays monthly installments or total upfront.
  3. Payouts released to Provider per snowfall (per visit) or per month based on availability.
- **Why**: Guarantees availability for users and steady income for providers during peak seasons.

#### 5. Face-to-Face Payment (The "Marketplace" Model) 🤝
- **Applicable Domains**: Neighborhood Goods (Marketplace), Cash-on-delivery services.
- **Flow**:
  1. User clicks "I'm interested" or "Reserve".
  2. Transaction is marked "RESERVED" on platform (no money charged).
  3. Parties meet in person (e.g., uOttawa campus or Kanata Lakes park).
  4. User inspects item/service.
  5. User pays via Cash, E-transfer, or Platform QR.
  6. Both parties mark "COMPLETED" on platform for rating/reviews.
- **Why**: Critical for peer-to-peer used goods where physical inspection is required before commitment.

#### 6. Deposit-Only (The "Commitment" Model) 💳
- **Applicable Domains**: Large-scale projects (Moving help, Custom Furniture), High-demand tutors.
- **Flow**:
  1. User pays a **Fixed Deposit** (e.g., 20% or flat $50) to "Secure the Slot".
  2. Service is delivered.
  3. User pays **Balance** (Residual 80%) on-site or via platform.
- **Why**: Locks the provider's schedule and ensures user commitment without requiring full upfront payment for large projects.

---

### 4.6 Transactional Model Selection Logic

To support various business scenarios, the platform uses a **tiered configuration** to determine the transaction model for an order.

#### 1. Configuration Level
- **Listing Master Level**: Default transaction model for the entire service (e.g., "All my Snow Removal is Subscription").
- **Listing Item Level**: Override or specific models for certain SKUs (e.g., "Full Session" is Deposit-Only, while "Initial Consultation" is Instant Pay).
- **Service Category Default**: If not specified, the system uses the default model for that category (e.g., Skilled Trades default to "Quote & Call").

#### 2. Decision Matrix
| Factor | Priority | Usage |
| :--- | :--- | :--- |
| **Listing Item Setting** | 1 (Highest) | Explicitly set by the provider for a specific SKU. |
| **Listing Master Setting** | 2 | Default for the service if not overridden by the item. |
| **Category Setting** | 3 (Lowest) | Fail-safe default based on business domain. |

#### 3. Data Structure Update
```sql
-- listing_masters table
ALTER TABLE public.listing_masters ADD COLUMN preferred_transaction_model TEXT DEFAULT 'INSTANT_PAY';

-- listing_items table
ALTER TABLE public.listing_items ADD COLUMN transaction_model_override TEXT;

-- orders table (Actual model used for the instance)
ALTER TABLE public.orders ADD COLUMN actual_transaction_model TEXT NOT NULL;
```

---

### 4.7 State Machine by Transactional Model

The `order.status` evolves differently based on the chosen model.

#### Model 1: Instant Pay
`DRAFT` → `PENDING_PAYMENT` → `PENDING_CONFIRMATION` → `IN_PROGRESS` → `COMPLETED`/`CANCELLED`

#### Model 2: Quote & Call
1. **Visit/Call**: `DRAFT` → `PENDING_DEPOSIT` (Visit Fee) → `CONFIRMED_VISIT` → `VISIT_COMPLETED`.
2. **Quoting**: Provider submits Quote via Chat → Order status becomes `PENDING_QUOTE_PAYMENT`.
3. **Execution**: `ACCEPTED_QUOTE` → `IN_PROGRESS` → `COMPLETED`.

#### Model 3: Deposit & Hold
`DRAFT` → `PENDING_BASE_PAYMENT` (Rent) → `DEPOSIT_AUTHORIZED` (Hold) → `PICKED_UP` → `RETURNED` → `SETTLED` (Release Hold).

#### Model 4: Seasonal / Milestone
`DRAFT` → `CONTRACT_SIGNED` → `PENDING_MILESTONE_1` → `MILESTONE_1_COMPLETE` ... → `SEASON_CLOSED`.

#### Model 5: Face-to-Face
`DRAFT` → `RESERVED` (No payment) → `MEETUP_CONFIRMED` → `PAID_OFFLINE` → `COMPLETED`.

#### Model 6: Deposit-Only
1. **Booking**: `DRAFT` → `PENDING_DEPOSIT` (e.g., 20%) → `BOOKED`.
2. **Service**: `IN_PROGRESS`.
3. **Closing**: `PENDING_FINAL_PAYMENT` (80%) → `COMPLETED`.

---

## 5. Implementation Roadmap

### Phase 1: MVP ✅ (In Execution)
Focused on reaching actionable milestones in the first two pilot nodes (Ottawa).

#### 📍 Node A: Ottawa-Lees (Student & Urban)
- **Primary Goal**: Complete cycle for **Neighborly Goods**, **Tasks**, and **Home Services** (Moving/Cleaning).
- **Core Loop**: Posting → Booking → Escrow Pay → Verified Review.
- **KPI**: 50 registered users in Lees 170/190 buildings; 30 successful transactions.

#### 📍 Node B: Ottawa-Kanata (Suburban & Family)
- **Primary Goal**: High-trust rollout for **Seasonal Services** (Snow/Lawn) and **Verified Pros**.
- **Integration**: Onboarding ECRA/TSSA certified helpers.
- **KPI**: 10 Verified Professionals onboarded; 30 transactions within Kanata Lakes area.

### Phase 2: Backend Integration 🚧 (In Progress)
- [x] Supabase client setup
- [x] Auth + RefCode repositories
- [ ] Execute schema + seed data
- [ ] Complete remaining repositories
- [ ] Test authentication flow

### Phase 3: Compliance & Payments
- [ ] Stripe integration (CAD) - authorized holds
- [ ] License verification APIs (ECRA, TSSA, LSO)
- [ ] Background check integration (CPIC)

---

## 6. Rental Business Logic

### 6.1 Overview
Rentals are integrated into **Community Marketplace** > **Tool Rental** / **Sports Equipment**.

### 6.2 Data Model

```typescript
// Listing Type
type: 'RENTAL'

// Pricing
pricing: {
  model: 'DAILY',                              // or 'WEEKLY'
  price: { amount: 3000, currency: 'CAD' },    // $30/day
  unit: 'per day',
  deposit: { amount: 20000, currency: 'CAD' }  // $200 security deposit
}

// Order Extension
rentalPeriod: {
  startDate: '2026-01-10',
  endDate: '2026-01-13',  // 3 days
  totalDays: 3
}
```

### 6.3 Payment Flow

**Step 1: Checkout**
```
User Pays: Rental Fee + Platform Fee + Deposit
Example:
- Rental: $90 (3 days × $30)
- Platform Fee: $4.50 (5%)
- Deposit: $200 (held, not charged)
Total Charge: $294.50
```

**Step 2: During Rental**
- Rental fee: Escrowed (held in platform account)
- Deposit: **Authorized Hold** (Stripe) - frozen on card, not charged

**Step 3: Return & Settlement**

| Condition | Deposit | Rental Fee |
|-----------|---------|------------|
| On-time + No damage | Full refund $200 | Released to Provider |
| Minor damage | Partial refund $180 (deduct $20) | Released to Provider |
| Severe damage | Forfeit $200 | Released + insurance claim |
| Late return | Deduct late fees | Additional rental charges |

### 5.4 Database Schema (Rental Extensions)

```sql
-- Add to orders table
ALTER TABLE orders 
ADD COLUMN rental_start_date DATE,
ADD COLUMN rental_end_date DATE,
ADD COLUMN deposit_amount INTEGER,
ADD COLUMN deposit_status TEXT DEFAULT 'HELD';

-- New: Condition tracking
CREATE TABLE rental_condition_logs (
  log_id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  pre_rental_photos TEXT[],   -- Before pickup
  post_rental_photos TEXT[],  -- After return
  damage_detected BOOLEAN,
  damage_cost_estimate INTEGER
);

-- New: Deposit transactions
CREATE TABLE deposit_transactions (
  transaction_id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  deposit_amount INTEGER,
  deposit_status TEXT,  -- HELD, RETURNED, FORFEITED
  returned_amount INTEGER,
  forfeited_reason TEXT
);
```

### 5.5 UI Components

**Rental-Specific UX:**
1. **Date Range Picker**: Select rental period
2. **Deposit Alert**: Clear notice of security deposit
3. **Condition Photos**: Show current item state
4. **Return Countdown**: Display days until return due
5. **Damage Reporting**: Post-rental condition form

---

## 7. Professional Services: Legal & Real Estate

### 7.1 Overview

**Business Model**: Directory Listing (Information Display + Messaging)

Unlike transactional services, professional services (lawyers, real estate agents) use the platform as a **verified directory** where:
1. Professionals display their credentials and contact info
2. Users browse and compare professionals
3. Users initiate contact via platform messaging
4. **Transactions happen off-platform** (professionals handle billing directly)

### 7.2 Lawyer Directory

#### Information Display
**Lawyer Profile Shows**:
- Name, Photo, LSO Number
- Law Society jurisdiction (Ontario/BC/Quebec)
- Practice Areas (Family, Real Estate, Immigration, etc.)
- Years of Experience
- Office Location & Contact Info
- Consultation Fees (informational only)
- Reviews & Ratings

#### Verification
- Platform verifies Law Society membership
- Displays "LSO Verified" badge
- Auto-checks Professional Liability Insurance

#### User Flow
```
User → Browse lawyers by practice area
     → View lawyer profile
     → See credentials & reviews
     → Click "Send Message"
     → Chat with lawyer via platform messaging
     → Arrange consultation off-platform
```

### 7.3 Real Estate Agent Directory

#### Information Display
**Agent Profile Shows**:
- Name, Photo, RECO Number
- Brokerage affiliation
- License type (Salesperson/Broker)
- Service areas (Toronto, Mississauga, etc.)
- Past transactions (optional: number of homes sold)
- Office contact & availability
- Reviews & Ratings

#### Verification
- Platform verifies RECO registration
- Displays "RECO Registered" badge
- Confirms E&O insurance

#### User Flow
```
User → Browse agents by region
     → View agent profile
     → See credentials & past performance
     → Click "Contact Agent"
     → Message agent via platform
     → Arrange viewing/meeting off-platform
```

### 7.4 Database Schema (Simplified)

```sql
-- Professional Credentials (already exists in schema)
-- Used only for verification display, not booking

CREATE TABLE professional_credentials (
  credential_id UUID PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id),
  
  credential_type TEXT, -- 'LAWYER', 'REAL_ESTATE_AGENT'
  
  -- Lawyer fields
  law_society_number TEXT,
  law_society_jurisdiction TEXT,
  practice_areas TEXT[],
  
  -- Real Estate fields
  reco_number TEXT,
  license_type TEXT,
  brokerage_name TEXT,
  
  -- Verification status
  status TEXT DEFAULT 'VERIFIED',
  verified_at TIMESTAMPTZ,
  
  -- Insurance (display only)
  insurance_provider TEXT,
  insurance_expiry DATE
);

-- NO consultation_bookings table needed
-- All communication through existing messages table
```

### 7.5 Platform Value Proposition

**For Professionals**:
- Free verified directory listing
- Lead generation from local community
- Trust through platform verification
- Direct communication with potential clients

**For Users**:
- Verified credentials (no need to check Law Society manually)
- Community reviews & ratings
- Easy comparison of multiple professionals
- Safe messaging channel

**Revenue Model** (Future):
- Premium listing placement
- Featured professional badges
- Lead forwarding fees

## 8. Trust & Safety

### 8.1 Verification Tiers

```
Level 1: Email Verified
    ↓
Level 2: Phone Verified (SMS)
    ↓
Level 3: Background Checked (CPIC)
    ↓
Level 4: Insured (Liability proof)
    ↓
Level 5: Licensed (ECRA/TSSA/RMT verified)
```

### 8.2 Canadian Regulatory Compliance

**Key Requirements:**

| Service | Regulation | Verification |
|---------|-----------|--------------|
| Electrical Work | ECRA license (ON) | Auto-check ESA database |
| Gas Fitting | TSSA certification | API integration |
| Massage Therapy | RMT registration | CMTO lookup |
| Food Handling | Health permit | Manual review |

**Platform Responsibilities:**
- Validate licenses before listing approval
- Display license # and expiry on profile
- Alert providers 30 days before license expiry
- Suspend listings with expired licenses

### 8.3 Insurance Requirements

| Service Type | Min Coverage | Required? |
|--------------|-------------|-----------|
| Licensed Trades | $2M liability | ✅ Mandatory |
| Home Services | $1M liability | ⚠️ Recommended |
| Tool Rental | Item insurance | ⚠️ High-value items |
| Snow Removal (commercial) | $2M + vehicle | ✅ Mandatory |

### 8.4 User-Facing Trust UX (Buyer Experience)

To build immediate trust, the following UI/UX elements are mandatory:

#### Provider Card & Profile Highlighting
- **Verification Level**: A prominent icon (e.g., 🛡️) with a tooltip explaining the level (e.g., "Level 3: ID & Background Checked").
- **Insurance Badge**: Specific text label: *"Insured up to $2M Liability"* for licensed trades.
- **License Badge**: Verified trade badges (e.g., "ECRA #123456" for electricians) with a link to the regulatory registry.

#### Mandatory Disclaimer Placements
- **Home-Cooked Food**: A non-dismissible disclaimer on the product page: *"This item is prepared in a private home kitchen. Consume at your own risk."*
- **High-Risk Services**: A "Platform Intermediary" footer on all Professional and Skilled Trade profiles: *"HangHand is a matching platform. All liability for professional advice resides with the provider."*

---

## 9. Shopping Cart & Checkout Logic

### 9.1 Cart Bypass (Direct Booking)
To reduce conversion friction, certain flows bypass the shopping cart:
- **Instant Booking**: For services with standard pricing that users want to book immediately (e.g., "Basic Clean - 2h").
- **Quote & Call (Visit Fee)**: The initial "Booking Fee" for tradespeople is a direct transaction.
- **Tasks & Demands**: Peer-to-peer neighbor requests are responded to directly, not via cart.
- **Professional Services**: Messaging-based contact only; no platform checkout.

### 9.2 Cart Validation Logic
Before order submission, the following checks are mandatory:
1. **Provider Splitting**: If a cart contains items from different providers, the system **splits the transaction** into multiple orders (one per provider) but may offer a single unified payment intent if supported by the gateway.
2. **Price Stability**: Validate that current provider prices match the "Added to Cart" prices. Notify user of any changes.
3. **Inventory/Availability**: Verify that rental tools are still available for the selected dates or that the provider's slot is still open.
4. **Service Radius Check**: Confirm the buyer's delivery/service address is within the service area of all providers in the cart.

### 9.3 Persistence & Clearing Rules
- **Database Persistence**: Cart state is synced to Supabase `carts` and `cart_items` tables to ensure session continuity across mobile and web.
- **Clear on Success**: Only remove the specific items that were successfully converted into an order. Keep remaining items in the cart.
- **Auto-Clearing (Cleanup)**: Remove items from listings that have been marked "Deleted" or "Inactive" by the provider.
- **Manual Clearing**: Users can "Clear All" or "Remove and Save for Later".

### 9.4 Payment & Deposits
- **Aggregated Checkout**: Calculate the subtotal, platform fees (5%), and taxes per split order.
- **Tax Calculation (Canadian Rules)**:
    - **HST/GST Applied**: Only if the Service Provider is a **Registered Taxpayer** in Canada.
    - **Small Supplier Rule**: Providers with < $30,000 annual revenue are exempt from charging HST/GST (must be a setting in `provider_profiles`).
    - **P2P Used Goods**: Transactions involving used personal items via the "Neighborhood Goods" category are generally **Tax-Exempt**.
    - **Platform Fees**: Tax (e.g., 13% HST in Ontario) is always applied to the **Platform Service Fee** regardless of the provider's status, as the platform is the service provider for this fee.
- **Deposit Management**: For multi-item rentals, the system must authorize a **total held amount** equal to the sum of individual deposits, or handle them as separate hold intents.

### 9.5 Edge Cases & Conflict Resolution
- **Inventory Race Conditions**: Items in the cart do NOT lock inventory. The lock occurs only at the start of the payment process. If an item is sold/booked during checkout, the user is notified to remove it.
- **Location Mismatch**: If a user updates their delivery address at checkout, all cart items must be re-validated against the providers' service areas.
- **Pricing Expiry**: If a provider updates their pricing while an item is in a user's cart, the user must be prompted to "Accept New Price" before proceeding.

---

## 10. Order Management Standards

### 10.1 Order Creation Standard
- **Snapshot Requirement**: Every order must contain a `snapshot` JSON field capturing the exact state of the `ListingMaster` and `ListingItem` at the moment of creation (Price, Title, Description).
- **Primary vs. Add-on**: An order can have one "Primary Service" and multiple "Add-ons" (e.g., Cleaning + Window Polish).
- **Unique Order ID**: Human-readable short ID for customer support (e.g., `HH-260104-XXXX`).

### 10.2 Display Standards (Role-Based View)

| Component | Buyer (Neighbor) Sees | Provider (Helper) Sees |
| :--- | :--- | :--- |
| **Pricing** | **Total Out-of-Pocket** (Tax + Fee included) | **Net Earnings** (Total - Platform Fee) |
| **Status Label** | "Waiting for Helper" / "On the Way" | "New Work Request" / "Action Required" |
| **Primary CTA** | "Track Service" or "Cancel" | "Accept Order" or "Complete Job" |
| **Logistics** | Provider profile & rating | Buyer's address & service time |

### 10.3 Cancellation & Refund Policy
- **Buyer Cancellation**:
    - `PENDING_CONFIRMATION`: Full refund (Instant).
    - `IN_PROGRESS`: Generally non-refundable; requires dispute resolution.
- **Provider Cancellation**:
    - If a provider cancels a `CONFIRMED` order without valid reason, trust points are deducted.
    - Automatic full refund to Buyer.

### 10.4 Post-Order Price Modification (改价格)
Specific to **Quote & Call** and **Large-Scale Projects**:
1. **On-site Quote**: Provider clicks "Adjust Quote" in the Order UI.
2. **Amendment Flow**: Provider enters new labor/parts cost.
3. **Buyer Approval**: Order status changes to `WAITING_FOR_PRICE_APPROVAL`. User must click "Accept New Price" via notification/App.
4. **Escrow Update**: Buyer pays the difference if amount increases.

---

## 11. Community Review & Trust Design

To build a high-trust community without creating friction, the platform uses a tiered review system inspired by Airbnb and LinkedIn.

### 11.1 Transaction-Based Reviews (Verified)
*Verified reviews are linked to completed orders and carry the highest trust weight.*

1. **Micro-Review (The "Fast" Way)**:
   - **One-Tap Rating**: 1-5 Stars (default 5).
   - **Pro-Tags**: Tap 1-3 tags (e.g., "Punctual", "Clean", "Fair Price", "Quiet").
   - **Completion Reward**: Users receive small "Beans" (internal credits) for completing a review within 48h.
2. **Double-Blind System**:
   - Reviews are only revealed after both Buyer and Provider have submitted, or after 14 days. This prevents "retaliatory reviews."
3. **Private Provider Feedback**:
   - A separate, private comment field for the platform/provider that doesn't appear on the public profile.

### 11.2 Neighbor Endorsements (Non-Transactional)
*Endorsements allow neighbors to vouch for each other even without a formal order.*

1. **"Vouched by Neighbor"**:
   - Residents within the same "Community Hub" (e.g., Kanata Lakes) can vouch for a provider.
   - **Requirement**: The vouching user must be at "Verification Level 3" (Identity Verified).
2. **Skill Endorsements**:
   - Neighbors can tap specific skills (e.g., "Good with Dogs", "Expert Gardener") to boost the provider's listing visibility.
3. **Trust Badge**: Providers with 5+ endorsements from verified neighbors receive a "Community Trusted" badge.

### 11.3 Warmth & Storytelling (The "Neighbor Story")
To differentiate from transactional apps like TaskRabbit, HangHand emphasizes the human connection through:

1. **Neighbor-to-Neighbor Stories**:
   - Beyond a star rating, users are encouraged to share a short **"Story of Help"** (e.g., "Wang helped me fix my leak during a snowstorm and even brought some extra salt for my driveway").
   - These stories are highlighted with a "Warmth" badge 🧡 and pinned to the provider's profile.
2. **Community Highlight Reel**:
   - The platform periodically (weekly) aggregates the most "Neighborly" stories into a Community Feed to promote a culture of help.
3. **Gift & Gratitude (Future Feature)**:
   - Users can choose to send a "Virtual Coffee" or a neighborly "Thank You Gift" (Beans) alongside their written review to express extra gratitude.

---

## 12. Buyer Journey & Neighborhood P2P Logic

To foster neighborly help, the platform treats Buyer-posted "demands" with the same priority as Provider-posted "services."

### 12.1 Buying Neighborhood Goods (Items & Food)
*Focus: Second-hand items, home-cooked food sharing (Lees Ave pilot).*

- **"Fast-Trade" Flow**:
    - Buyer views a nearby item (e.g., "Air Fryer - $20").
    - **One-Click Reservation**: Marked as "HELD" for 2 hours to allow pickup arrangement.
    - **Affordability Gauge**: System highlights items priced 30%+ below market value as "Neighbor's Deal."
- **Home-Cooked Food**:
    - Simple "Order & Pickup" flow.
    - Health Canada disclaimer automatically attached to all home-food listings.

### 12.2 Publishing Demands (Neighborly Help)
*Focus: "I need help with X" (Moving a sofa, picking up groceries, IKEA assembly).*

- **Multi-Step Demand Wizard**:
    1. **What**: Describe the task.
    2. **Who**: Target "Any Neighbor" or "Verified Professional."
    3. **Price**: "Fixed Budget" or "Ask for Quotes."
    4. **Urgency**: "ASAP", "Today", or "Flexible."
- **"Help-Is-Near" Broadcasting**:
    - When a demand is posted, verified helpers within **2km** receive an instant push notification for speed.
- **Micro-Tasks**: Support for ultra-low ticket items (e.g., "$5 for a cup of sugar" or "$10 for a quick jump-start").

### 12.3 Speed & Affordability Features
- **Hyperlocal Index**: Items/Tasks within **500m** are showcased in a "Right Next Door" section on the Home Page.
- **Community Pricing**: System suggests pricing based on historical community data to ensure services remain affordable for neighbors.
- **Quick-Response Badges**: "Fast Responder" badges awarded to buyers and helpers who close deals within 4 hours.

---
---

## 13. Marketplace & Tasks: Goods and Demands Flow

### 13.1 Neighborhood Goods (The "Xianyu" Model) 🧸
*Focused on peer-to-peer sharing of idle items (二手) and home-made goods.*

#### 13.1.1 Core Logic
- **Photo-First Wizard**: Unlike services, goods are visual. The flow starts with image upload.
- **Attributes**:
    - **Condition**: New, Like New, Good, Fair.
    - **Delivery**: Pickup (Self-collection) vs. Drop-off.
    - **Original Price**: Optional reference for perceived value.
- **Negotiation ("Tan Yi Tan")**:
    - Users can simply "Chat" or click "Make Offer" (出价).
    - Sellers can "Accept Offer" which updates the price for that specific buyer in a generated Order.

#### 13.1.2 Data Model (Goods)
```json
{
  "type": "GOODS",
  "attributes": {
    "condition": "LIKE_NEW",
    "brand": "IKEA",
    "delivery_options": ["PICKUP"],
    "original_price": 100.00
  }
}
```

### 13.2 Demand Tasks (The "TaskRabbit" Model) 🔨
*Focused on "I need help" requests (Reverse Marketplace).*

#### 13.2.1 Core Logic
- **Demand-Side Posting**: User posts a request, not a supply offering.
- **Budgeting**: User sets an "Estimated Budget" or "Hourly Rate".
- **Application Flow**:
    1.  **User** posts Task: "Help me move a couch on Saturday" ($50).
    2.  **Task** appears in the "Task Board" (Community Square).
    3.  **Provider** clicks "I'm Interested" or "Apply".
    4.  **Provider** initiates Chat and sends a formal "Quote".
    5.  **User** accepts Quote → Creates standard Order.

#### 13.2.2 Data Model (Tasks)
```json
{
  "type": "TASK",
  "pricing": {
    "model": "BUDGET",
    "price": { "amount": 5000, "currency": "CAD" }
  },
  "status": "OPEN", // vs ASSIGNED, COMPLETED
  "attributes": {
    "urgency": "HIGH", // "Need it today"
    "location_type": "REMOTE" // or "ON_SITE"
  }
}
```

### 13.3 Interaction Design
- **Goods Grid**: Masonry layout, emphasizing photos and price. "Verified Neighbor" badge is critical for trust.
- **Task Board**: List layout, emphasizing Title, Budget, and Urgency. "Expires in X hours".

### 13.4 Technical Implementation & Schema Strategy

#### 13.4.1 UI Refactoring Strategy
To support distinct flows without cluttering the core app, the "Post" experience is split:
- **Routing Wrapper**: `PostGig` will act as a router.
- **Sub-Wizards**:
    - `PostGoodWizard`: Photo-First, Condition tags, Pickup/Drop-off toggle.
    - `PostTaskWizard`: Text-First, Urgency, Budget Slider.

#### 13.4.2 Schema Mapping
We utilize the existing Master-Detail tables to keep the platform unified:
| Concept | Table | Mapping / Logic |
| :--- | :--- | :--- |
| **Goods Item** | `listing_masters` | `type = 'GOODS'`, `metadata` stores `{ brand, delivery }`. |
| **Goods Price** | `listing_items` | ONE item per master. `pricing.model = 'FIXED'`. `attributes` stores `{ condition }`. |
| **Task Request** | `listing_masters` | `type = 'TASK'`. `provider_id` is the **Requester** (Buyer). |
| **Task Budget** | `listing_items` | ONE item. `pricing.model = 'BUDGET'`. `price` = Estimated budget. |

#### 13.4.3 Order & Transaction Logic
- **Necessity of Orders**: An `Order` record is **mandatory** even for simple trades to enable Reviews, History, and Dispute resolution.
- **Creation Triggers**:
    - **Goods**: Created when User clicks "Buy Now" or "Accept Offer".
    - **Tasks**: Created when User "Accepts Quote" from a Provider.
- **Settlement Modes**:
    - **Face-to-Face**: `PENDING_PAYMENT` -> `RESERVED` -> Meetup -> `COMPLETED` (Cash/Offline).
    - **Escrow**: `PENDING_PAYMENT` -> Stripe Hold -> `IN_PROGRESS` -> Work Done -> Release.

---

## 14. Seller Workbench (Helper Dashboard)

The **Seller Workbench** is a dedicated productivity suite for service providers (helpers) to manage their business, track earnings, and maintain compliance.

### 14.1 Productivity Dashboard
- **Performance Overview**:
    - **Total Earnings**: Weekly/Monthly/Total income (Net after platform fees).
    - **Trust Score**: Based on reviews, cancellation rate, and verification level.
    - **Active Orders**: Quick access to "Action Required" items.
- **Service Statistics**: View counts, conversion rates, and repeat customer percentage.

### 14.2 Order & Booking Management
- **Order Pipeline**:
    - **Tab 1: New Requests**: Accept or decline new orders (with 24h timeout).
    - **Tab 2: In Progress**: Track ongoing work, chat with buyer, adjust quotes.
    - **Tab 3: Completed**: Review history and dispute resolution.
- **Calendar & Schedules**:
    - Manage "Working Hours" and "Days Off."
    - Block off slots for personal time to prevent booking conflicts.
    - Support for **Recurring Bookings** (Seasonal/Subscription models).

### 14.3 Listing & Shop Management
- **Storefront Editor**:
    - Edit `ListingMaster` and `ListingItems` (SKUs).
    - **Seasonal Switch**: Quickly toggle winter (snow removal) vs summer (lawn care) services.
    - **Pricing Tools**: Bulk update prices across all SKUs.

### 14.4 Wallet & Financials (Stripe Integration)
- **Earnings Tracking**: Detailed breakdown per order (Subtotal, Fee, Tax).
- **Payout Center**: Connect Stripe account, view payout schedule, and update bank info.
- **Tax Settings**: Toggle `is_tax_registered` and manage HST/GST registration number (CRA compliance).

### 14.5 Verification & Compliance Center
- **KYC Status**: Track identity verification (CPIC background checks).
- **Professional Credentials**:
    - Upload and renew licenses (ECRA, TSSA, etc.).
    - **Insurance Tracker**: Upload Proof of Insurance ($2M liability). System sends alerts 30 days before expiry.
- **Neighbor Badge**: Progress towards the "Community Trusted" badge (Neighbor vouching).

### 14.6 Management Role Differentiation (Buyer vs Provider)

To support the diverse listing types (Goods, Tasks, Services), the management interface differentiates based on the user's role in the transaction:

#### 14.6.1 Provider Management: Seller Workbench
*   **Focus**: Supply-side persistence and business metrics.
*   **Target Types**: `SERVICE`, `RENTAL`, `GOODS`.
*   **Key Operations**: Adjustment of SKUs, inventory toggle, and revenue/reputation tracking.
*   **Lifecycle**: Listings are persistent and lifecycle-managed (Draft -> Published -> Busy -> Archived).

#### 14.6.2 Buyer Management: Demand Tracking (My Demands)
*   **Focus**: Demand-side fulfillment and decision making.
*   **Target Types**: `TASK`.
*   **Key Operations**: Reviewing incoming Quotes from different providers, selecting/confirming a helper, and closing tasks upon completion.
*   **Lifecycle**: Listings are ephemeral; they typically expire or are manually closed once a helper is found.

---

## 15. JinBean Points System (Engagement)

The **JinBean (金豆)** system is the platform's loyalty and engagement engine, designed to reward positive community behavior.

### 15.1 Earning Beans (获取)
- **Community Contributions**:
    - **Daily Login**: 5 Beans (10 if 7-day streak).
    - **Neighbor Vouching**: 20 Beans for verifying a neighbor.
    - **Storytelling**: 50 Beans for writing a "Neighbor Story" review.
- **Platform Activity**:
    - **First Post**: 100 Beans for the first listing or demand.
    - **Transaction Reward**: 1 Bean per $1 spent (capped at 500).
    - **Identity Level-Up**: 200 Beans for reaching Verification Level 3.

### 15.2 Spending Beans (消耗)
- **Visibility Boost**: 200 Beans to "Boost" a listing to the top of the feed for 24h.
- **Gratitude Gifts**: 50 Beans to send a "Virtual Coffee" to a helpful neighbor.
- **Fee Redemption**: 1000 Beans = $5 off the Platform Service Fee.
- **Premium Items**: Access to exclusive profile badges or community avatars.

---

## 16. Platform Login & Auth Flow

To ensure a seamless experience, the platform uses a **low-friction** authentication strategy tailored for the Canadian demographic.

### 16.1 Auth Channels
- **Social SSO**:
    - **WeChat**: Primary for the pilot phase (Kanata/Lees Ave community).
    - **Google**: Standard for local GTA expansion.
- **Baseline**: Email + Password with Magic Link option for passwordless entry.
- **Security**: Mandatory MFA (SMS/OTP) for users attempting to withdraw funds or access verified professional features.

### 16.2 Level-Based Access Control
| Auth Event | Resulting Status | Permitted Actions |
| :--- | :--- | :--- |
| **First SSO Login** | Level 1 (Email) | Browse, Chat, Basic Posting |
| **Phone Link** | Level 2 (SMS) | Book Services, Post Marketplace Items |
| **ID/CPIC Check** | Level 3 (Verified) | Accept Paid Orders, Hire Pros |
| **License Upload** | Level 5 (Pro) | List Licensed Trade Services |

---

## 17. Legal Disclaimer & Intermediary Policy

As a community marketplace, HangHand operates under an **Intermediary Pure-Play** model to manage risk and liability.

### 17.1 Intermediary Status
- **Non-Employment**: Helpers and professionals are independent contractors. HangHand is not an employer (strictly matching service).
- **Pure-Matching for Professionals**: For Legal and Real Estate services, the platform acts only as a **Verified Directory**. All advice and transactions happen off-platform at the user's risk.

### 17.2 Disclaimers (CRA & Legal)
- **Tax Disclaimer**: Users are responsible for reporting their own income. The platform provides yearly "Income Summaries" but does not issue T4/T4A slips.
- **Safety Disclaimer**: While background checks are provided, users must exercise due diligence during in-person meetings.
- **Intermediary Disclaimer**: HangHand does not guarantee the quality or outcome of work performed by third-party helpers.

### 17.3 Dispute Resolution
- **On-Platform**: Escrowed funds are held until a 48h dispute window passes. Platform acts as a neutral mediator based on Chat logs and Order Snapshots.
- **Off-Platform**: Platform bears no responsibility for payments or disputes arising from off-platform agreements.

---

## 18. UI/UX Design Philosophy: "Neighborly Warmth"

To avoid the sterile, "digital spreadsheet" feel of Kijiji or Facebook Marketplace, HangHand adopts a design language that feels modern, premium, and human-centric.

### 18.1 Aesthetic Principles: Beyond the Table
- **Soft Geometry**: Use rounded corners (12px - 24px) for all cards and buttons to create a "friendly" tactile feel.
- **Human-Centric Imagery**:
    - Avoid sterile stock photos or simplistic icons for major categories.
    - Use "Neighborly Photography" (high-quality shots of real people in community settings).
- **Depth & Dimension**: Employ soft shadows and subtle blurs (glassmorphism) instead of high-contrast borders.

### 18.2 "English-First" but "Meituan-Warm"
To balance North American professional standards with community vibrancy, the platform follows an **English-First, Lifestyle-Bucket** approach:
- **Concise Naming**: Titles must be intuitive and ultra-short (e.g., "Home Help" instead of "Home Maintenance Services"). 
- **High Information Density**: Borrowing from **Meituan (美团)** and **Xianyu (闲鱼)**, the UI favors a compact, information-rich layout over "Western sterile" minimalism. This includes:
    - **Vibrant Iconography**: High-quality, friendly icons for every category to provide immediate visual recognition.
    - **Community Trust Layers**: Visible badges for "Neighbor Vouched", "Community Node", and "Verification Level" on every listing card.
    - **Interaction Density**: Higher frequency of micro-interactions and "Warm" feedback (soft glows, bounce transitions).

### 18.3 Lifestyle-Oriented Industry Architecture
The 5 top-level "Industries" are mapped to intuitive life-buckets:
1.  **Home & Life** (居家生活): Everyday help, errands, and maintenance.
2.  **Pro & Beauty** (专业美业): Licensed trades and personal styling.
3.  **Kids & Wellness** (育儿教育): Childcare, tutoring, and personal care.
4.  **Food & Market** (美食市集): Community eats, local food, and marketplace.
5.  **Travel & Outdoor** (出行时令): Transport, carpool, and seasonal tasks.

### 18.5 Neighbor Story Component Standards

To humanize the platform, stories are treated as first-class citizens:
- **Provider Profile Slot**: A pinned "Top Story" card at the top of the review section, showing the most impactful feedback or a personal introduction.
- **Homepage Carousel**: "Today's Neighbor Stories" – a rotating list of the 1-3 highest-rated stories within the user's community node.
- **Data Structure**:
    - **Content**: Max 280 characters.
    - **Visuals**: Primary story image (optional).
    - **Context**: Location tag (e.g., "@KanataLakes") and verified transaction badge.

---

## 19. Hybrid Development Strategy

To balance rapid deployment with a uniquely "warm" user experience, the platform adopts a **Hybrid Build-Buy-Borrow** strategy.

### 19.1自定义开发 (Custom Build: UI/UX & Warmth)
*Purpose: Differentiation and emotional connection.*
- **The "Skin"**: Handmade React components using Tailwind CSS and Radix UI primitives. We reject generic "SaaS templates" to maintain the Neighborly Warmth design.
- **Categorization & Branding**: Custom story-led service classifications and Canadian localization logic.
- **Neighbor Stories**: Custom implementation of the community storytelling and vouching system.

### 19.2 二次开发与借用 (Borrowed Logic: Business Engine)
*Purpose: Stability, compliance, and speed.*
- **Transaction Engine**: Adopting the state machine logic and order lifecycle from **Sharetribe** (Industry Standard).
- **Security & Infrastructure**: Leveraging the battle-tested authentication, multi-tenancy (community hubs), and file storage architecture from **Makerkit/Supabase Boilerplates**.
- **Real-time Comms**: Utilizing Supabase Realtime for chat and notification logic instead of building a custom WebSocket server.

### 19.3 核心原则 (Core Principles)
- **UI Independence**: The frontend must remain decoupled from the backend logic (via Repository Pattern) so we can swap or upgrade the "engine" without breaking the "warm" experience.
- **Data Sovereignty**: All user and transaction data resides in our dedicated Supabase instance to ensure CRA and Canadian privacy compliance.
- **Modular Integration**: New features (like AI-driven price guiding) will be integrated as standalone micro-services or edge functions to keep the core lean.

---

## 20. Portability & Anti-Lock-in Strategy

To mitigate vendor lock-in with Supabase and ensure long-term flexibility, HangHand employs a **Multi-Layer Abstraction** architecture.

### 20.1 Repository Pattern (API Layer Abstraction)
- **Interface-First Development**: UI components interact ONLY with TypeScript `interfaces` (e.g., `IOrderRepository`).
- **Provider Injection**: The specific implementation (Supabase, Firebase, or a custom REST API) is injected at the application root.
- **Benefit**: Migrating to a new backend involves writing a new implementation of the interface without touching a single line of UI code.

### 20.2 Standard PostgreSQL Usage
- **Vanilla SQL**: We prioritize standard PostgreSQL features over proprietary Supabase extensions where possible.
- **SQL Portability**: `docs/supabase_schema.sql` is written in standard DDL, making it compatible with any PostgreSQL provider (AWS RDS, DigitalOcean, self-hosted).
- **Triggers vs Edge Functions**: While we use Supabase Edge Functions for speed, critical business logic is kept in standard PL/pgSQL triggers or the frontend service layer to ensure portability.

### 20.3 Authentication & Storage Decoupling
- **Auth Abstraction**: The `AuthService` interface abstracts away Supabase Auth (GoTrue). Switching to Auth0, Clerk, or custom JWT only requires updating the service bridge.
- **S3 Compatibility**: All file storage logic (images, documents) follows S3-style patterns. Even though we use Supabase Storage, the interface remains compatible with AWS S3 or MinIO.

### 20.4 Data Portability & Backup
- **Automated SQL Dumps**: Daily exports of the entire database schema and data in standard `.sql` format.
- **ETL Readiness**: Data is structured in a relational master-detail model, making it easy to map to other databases if needed.

---

## 21. Cross-Platform Expansion Strategy (App & Mini-Program)

To reach neighbors wherever they are, HangHand follows a **Logic-First, Platform-Second** approach for cross-platform expansion.

### 21.1 Core Architecture: Logic Sharing (共享逻辑层)
- **Monorepo Structure**: Consolidate business logic into a shared package (e.g., `packages/core` or `src/services`).
- **Shared Assets**: 
    - **Repository Layer**: All Supabase interaction logic (Repository Pattern) remains identical across Web, App, and Mini-Program.
    - **Validation Logic**: Zod/Yup schemas for form validation (e.g., Order creation, KYC upload).
    - **i18n**: Translation files (En/Zh) mapped to all platforms.

### 21.2 Phase 1: PWA (Quick App Experience)
- Transform the current Vite/React site into a **Progressive Web App (PWA)**.
- **Goal**: Enable "Add to Home Screen" and basic offline caching. This provides an app-like experience on iOS/Android without App Store approval fees.

### 21.3 Phase 2: WeChat Mini-Program (社区小程序)
*Crucial for the Kanata/Lees Ave pilot phase.*
- **Technology**: Use **Taro** or **uni-app**.
- **Reasoning**: To leverage WeChat’s social graph for "Neighbor Stories" and easy sharing within residential building groups.
- **Backend Bridge**: Connect to the same Supabase instance using the `supabase-js` client (compatible with Wechat environment via polyfills).

### 21.4 Phase 3: Native App (React Native)
- **Framework**: **React Native (Expo)**.
- **Reuse Rate**: Aim for **80% logic reuse**. UI will be re-implemented using native primitives (`View`, `Text`) to ensure "Butter-smooth" interaction while following the "Neighborly Warmth" design system.
- **Native Features**: Enable Push Notifications (FCM/APNS), Biometric Login (FaceID), and background Location tracking for emergency help.

### 21.5 Comparison Table
| Platform | Target User | Tech Stack | Reuse Level |
| :--- | :--- | :--- | :--- |
| **Web (Current)** | Discovery, Desktop management | React + Vite | 100% (Base) |
| **PWA** | Budget-conscious, Fast entry | Web + Service Workers | 98% |
| **Mini-Program** | Chinese Pilot Community | Taro (React) | 70% Logic |
| **Native App** | Power Users, Service Helpers | React Native | 80% Logic |

---

## 22. AI Assistance Layer

The platform integrates AI agents to streamline communication, ensure safety, and guide user decisions. 

> [!IMPORTANT]
> **Safety Principle**: AI acts as an assistant and advisor. All final decisions (pricing acceptance, hiring, verification approval) must be made or confirmed by a human neighbor or administrator.

### 22.1 MVP Features (Phase 1-2)
- **Smart Price Guidance**: Analyzes historical local data to suggest a "Fair Neighborhood Price" range for tasks (e.g., "Most neighbors pay $40-60 for this job").
- **Intelligent Search & Ranking**: Uses vector embeddings to match user searches with the most relevant neighbor stories and service profiles, beyond simple keyword matching.
- **Automated Content Moderation**: Real-time screening of listings and neighbor stories for toxic content, illegal items, or off-platform payment attempts.

### 22.2 Future Roadmap (Phase 2+)
- **Conversational Posting**: Users can describe a need in natural language ("I need someone to help me move my IKEA sofa tomorrow at 2pm"), and the AI converts it into a structured Gig/Demand draft.
- **Bilingual Translation (Real-time)**: Seamlessly translates neighbor stories and chat messages between Chinese and English to foster a truly inclusive multicultural community.
- **Image Intelligence**: Auto-categorization and quality assessment of uploaded listing photos.

---

## 23. Messaging & Real-time Communication

The platform provides secure, real-time messaging to facilitate communication between buyers and providers throughout the transaction lifecycle.

### 23.1 Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| **1-to-1 Conversations** | ✅ MVP | Private chat between buyer and provider |
| **Order-Linked Chats** | ✅ MVP | Conversations tied to specific orders |
| **Real-time Sync** | ✅ MVP | Instant message delivery via Supabase Realtime |
| **Read Receipts** | ✅ MVP | `is_read` flag per message |
| **Unread Counts** | ✅ MVP | Badge showing unread messages |
| **Message Types** | 🔜 Phase 2 | TEXT, IMAGE, SYSTEM, QUOTE |
| **Push Notifications** | 🔜 Phase 2 | Mobile/desktop alerts when offline |

### 23.2 Database Schema

```sql
-- Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    participant_a UUID REFERENCES auth.users(id),
    participant_b UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id),  -- Optional link
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'TEXT',  -- TEXT, IMAGE, SYSTEM, QUOTE
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ
);
```

### 23.3 Quote-via-Chat Flow (Model 2 Integration)

For "Quote & Call" services, providers can submit quotes directly in the conversation:

```
1. Buyer initiates chat from ServiceDetail
2. Discussion about scope and requirements
3. Provider clicks "Submit Quote" → Sends QUOTE message
4. System creates order with status WAITING_FOR_PRICE_APPROVAL
5. Buyer sees "Accept Quote ($X)" button in chat
6. Approval triggers payment flow → Order moves to PENDING_PAYMENT
```

### 23.4 Security & Privacy

- **RLS Policies**: Users can only access their own conversations
- **Message Ownership**: Only sender can be set as `sender_id`
- **No Cross-Conversation Access**: Strict isolation via RLS
- **Safe Messaging Channel**: As referenced in Section 7.5

### 23.5 UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Chat.tsx** | `/chat` | Full messaging interface |
| **MessageBubble** | In Chat | Individual message display |
| **ConversationList** | Sidebar | List of active conversations |
| **UnreadBadge** | Header/Nav | Total unread count indicator |

### 23.6 Future Roadmap

1. **Image Attachments**: Upload photos via Supabase Storage
2. **Typing Indicators**: Realtime presence for "User is typing..."
3. **Push Notifications**: Edge Function + FCM/APNS integration
4. **Bilingual Translation**: Real-time EN/ZH translation (Section 22.2)

---

## Appendix A: Technology Stack

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Zustand (state)
- React Router

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- PostGIS (geospatial queries)

**Payments:**
- Stripe (CAD support)
- Authorized Holds for deposits

**Mobile:**
- Responsive web (Phase 1)
- React Native (Phase 5)

---

## Appendix B: Key Metrics to Track

**User Acquisition:**
- CAC (Customer Acquisition Cost)
- Provider activation rate
- Geographic density (services per km²)

**Transaction:**
- GMV (Gross Merchandise Value)
- Take rate (5%)
- Order completion rate
- Deposit forfeit rate (for rentals)

**Trust:**
- Background check pass rate
- License verification turnaround time
- Dispute resolution time

**Seasonal:**
- Snow removal bookings (Nov-Mar)
- Lawn care bookings (Apr-Oct)

---

**End of Document**

For implementation details, see:
- `docs/supabase_schema.sql` - Database DDL
- `docs/seed_data.sql` - Initial data (Canadian categories)
- `src/services/repositories/` - Repository implementations
