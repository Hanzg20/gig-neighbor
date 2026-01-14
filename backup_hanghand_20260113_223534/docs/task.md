## 1. Foundation & Cross-Platform Readiness
- [x] Define Global Types (Service, Rental, Consultation, Task) <!-- id: 1 -->
- [x] Setup Mock Data Store (Zustand) <!-- id: 2 -->
- [x] Design Comprehensive PRD (Stakeholder Document) <!-- id: 103 -->
    - [x] Refine Roles: Buyer-posted Goods vs Provider-posted Services
    - [x] Terminology: "邻里好物" & "需求发布"
    - [x] Canadian Market Localization & Business Domain Revision
    - [x] Consolidated all docs into unified system_design_document.md
- [x] Abstract API Layer (Implement Repository Pattern to decouple from Supabase) <!-- id: 101 -->
- [x] Refactor Stores (Zustand Domain Partitioning) <!-- id: 104 -->
- [x] Pilot Node State (CommunityContext) <!-- id: 105 -->

## 2. UI Prototypes - Transactional Core
- [x] **Home Page** (Responsive Dashboard, Task Board) <!-- id: 3 -->
- [x] **Detail Pages** (Refactored to Master-Detail pattern with variant support) <!-- id: 5 -->
- [x] **Internationalization (i18n)**: Multi-language fields (Zh/En) implemented in DB and Domain <!-- id: 102 -->
- [ ] **Order System (JinBean Pattern)**: Standardized State Machine & Pricing Breakdown <!-- id: 11 -->
- [ ] **Order Tracking**: Visual status indicators for Buyers/Sellers <!-- id: 14 -->
- [ ] **Seller Productivity**: Dashboard, Schedules & Income Reports <!-- id: 12 -->

## 3. UI Prototypes - Social & Discovery
- [ ] **Community Square**: Real feed for demands/sharing <!-- id: 15 -->
- [x] **Post a Gig/Task**: Multi-step wizard <!-- id: 13 -->
- [x] **Chat/Inbox**: Messaging interface <!-- id: 10 -->

## 4. Mobile-First Optimization
- [ ] Comprehensive Mobile Audit (Ensure 100% usability on small screens as preparation for App/Mini-Program) <!-- id: 20 -->
- [ ] Implement Mobile-specific Navigation (Bottom Tab Bar) <!-- id: 21 -->

## 5. Final Web Polish
- [ ] Search Refinement (Recent searches, suggestions) <!-- id: 30 -->
- [ ] Dark Mode Support <!-- id: 31 -->

## 6. Backend & Supabase Migration
- [x] Design Complete SQL Schema (PostgreSQL with RBAC & System Tables) <!-- id: 40 -->
- [x] Extend SQL Schema (Trust, Provider KYC, Messaging, Multi-lang Reviews) <!-- id: 45 -->
- [x] Setup Supabase Project & Auth <!-- id: 41 -->
- [x] Implement Supabase Client Layer (Repositories Partitioned) <!-- id: 42 -->
- [ ] Migrate Mock Data to Production DB <!-- id: 43 -->
- [ ] Enable Real-time Messaging (Supabase Realtime) <!-- id: 44 -->

## 7. End-to-End Flow Integration (按规范执行)
**Reference**: [system_design_document.md - Chapter 1](#1-engineering-guidelines--development-standards)

### 7.1 Flow 1: User Authentication & Profile Creation <!-- id: 200 -->
- [x] **ENV Configuration**: Verify .env.local has correct Supabase credentials <!-- id: 201 -->
- [x] **Schema Deployment**: Execute supabase_schema.sql on Supabase instance <!-- id: 202 -->
- [x] **Seed Data**: Import seed_data.sql (ref_codes, community nodes) <!-- id: 203 -->
  - [x] Create Eagleson Coin Wash Seed Script (1 Master + 3 Items)
  - [x] Fix Demo Login to use seeded UUIDs
- [ ] **Auth Flow Implementation**: <!-- id: 204 -->
  - [x] Email/Password registration
  - [ ] Magic Link login
  - [ ] User profile auto-creation (trigger verification)
  - [ ] Initial beans balance (100 beans)
- [x] **Walkthrough Documentation**: Scan-to-Buy flow verified with SMS <!-- id: 205 -->
- [x] **Update system_design_document.md**: v0.0.3 implemented with technical architecture details <!-- id: 206 -->
- [x] **Project Cleanup**: Deleted temporary scripts and unified seed data <!-- id: 207 -->

### 7.2 Flow 2: Browse & Search Listings <!-- id: 210 -->
- [ ] **Repository Integration**: Connect ListingRepository to Supabase <!-- id: 211 -->
- [ ] **Homepage Data Loading**: Fetch real listings from database <!-- id: 212 -->
- [ ] **Category Filtering**: Implement ref_codes-based filtering <!-- id: 213 -->
- [ ] **Location-based Search**: Enable PostGIS distance queries <!-- id: 214 -->
- [ ] **Walkthrough Documentation**: Record browse flow with screenshots <!-- id: 215 -->

### 7.3 Flow 3: Service Detail to Cart <!-- id: 220 -->
- [ ] **Master-Detail Display**: Show ListingMaster + ListingItems <!-- id: 221 -->
- [ ] **SKU Selection**: Enable multi-tier selection <!-- id: 222 -->
- [ ] **Add to Cart**: Implement cart state persistence <!-- id: 223 -->
- [ ] **Cart Validation**: Provider splitting, price stability checks <!-- id: 224 -->
- [ ] **Walkthrough Documentation**: Record detail-to-cart flow <!-- id: 225 -->

### 7.4 Flow 4: Checkout & Order Creation <!-- id: 230 -->
- [x] **Order Snapshot**: Capture ListingMaster/Item state at creation <!-- id: 231 -->
- [x] **Transaction Model Selection**: Implement 6 transactional models <!-- id: 232 -->
- [x] **Payment Integration**: Stripe checkout (CAD) <!-- id: 233 -->
  - [x] Webhook handler implementation
  - [x] SMS notifications and Idempotency verified
- [ ] **Order State Machine**: Implement status transitions <!-- id: 234 -->
- [ ] **Walkthrough Documentation**: Record checkout flow <!-- id: 235 -->

### 7.5 Flow 5: Provider Order Management <!-- id: 240 -->
- [ ] **Order Dashboard**: Provider view with filters <!-- id: 241 -->
- [ ] **Accept/Reject Orders**: Implement provider actions <!-- id: 242 -->
- [ ] **Status Updates**: IN_PROGRESS, COMPLETED flows <!-- id: 243 -->
- [ ] **Walkthrough Documentation**: Record provider flow <!-- id: 244 -->

### 7.6 Flow 6: Messaging System <!-- id: 250 -->
- [ ] **Conversation Creation**: Auto-create on first contact <!-- id: 251 -->
- [ ] **Real-time Messaging**: Enable Supabase Realtime <!-- id: 252 -->
- [ ] **Order-Linked Chats**: Associate conversations with orders <!-- id: 253 -->
- [ ] **Quote Submission**: Implement quote-via-chat flow <!-- id: 254 -->
- [ ] **Walkthrough Documentation**: Record messaging flow <!-- id: 255 -->

### 7.7 Flow 7: Review & JinBean System <!-- id: 260 -->
- [ ] **Review Submission**: Post-order review form <!-- id: 261 -->
- [ ] **Double-Blind System**: Implement review reveal logic <!-- id: 262 -->
- [ ] **Bean Transactions**: Earn/spend bean mechanics <!-- id: 263 -->
- [ ] **Neighbor Endorsements**: Implement vouching system <!-- id: 264 -->
- [ ] **Walkthrough Documentation**: Record review flow <!-- id: 265 -->

### 7.8 Flow 8: Service Posting (Provider) <!-- id: 270 -->
- [ ] **Category Selection**: ref_codes-driven hierarchy <!-- id: 271 -->
- [ ] **Master-Detail Creation**: Multi-step wizard <!-- id: 272 -->
- [ ] **Image Upload**: Supabase Storage integration <!-- id: 273 -->
- [ ] **Pricing Configuration**: Support 6 transaction models <!-- id: 274 -->
- [ ] **Walkthrough Documentation**: Record posting flow <!-- id: 275 -->

### 7.9 Flow 9: Provider Experience Upgrade (Pro Command Center) <!-- id: 700 -->
- [x] **Dashboard Layout Refactor**: Grid system and Heads-Up Header (Scan/Status) <!-- id: 701 -->
- [ ] **Action Stream Widgets**: Pending Orders and Urgent Messages <!-- id: 702 -->
- [ ] **Quick Inventory Widget**: Top 5 Items with Toggle <!-- id: 703 -->
- [ ] **Business Metrics Widget**: Live daily revenue & views <!-- id: 704 -->
- [ ] **Walkthrough Documentation**: Record new Pro Workbench flow <!-- id: 705 -->
