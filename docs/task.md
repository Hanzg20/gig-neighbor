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
