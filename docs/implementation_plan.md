# 🎯 HangHand MVP Phase 1 Execution Plan (Ottawa Pilot)

This plan strictly follows the **System Design v3.0** and **Optimized DB Schema** to launch the first two pilot nodes in Ottawa.

## 📍 Pilot Node Objectives

| Node | Target Audience | Primary Industries | Key Success Metric |
| :--- | :--- | :--- | :--- |
| **Node A: Lees** | Students & Urban Renters | Neighborly Help, Marketplace, Task | 50 Users / 30 Tx |
| **Node B: Kanata** | Suburban Families | Seasonal (Snow), Expert Neighbors | 10 Verified Pros / 30 Tx |

---

## 🏗️ Detailed Technical Foundation Roadmap

To ensure the "Anti-Lock-in" and "Pilot-Node" strategies are successful, we will follow these exact technical steps:

### Step 1: Supabase Environment Orchestration
- [ ] **Extension Injection**: Manually verify `pgvector` and `postgis` are enabled in the Supabase Dashboard.
- [ ] **Baseline Schema**: Execute `supabase_schema.sql` to establish the RBAC and relational structure.
- [ ] **Seed Injection**: Execute `seed_data.sql` to populate the `ref_codes` (Categories + Pilot Nodes).
- [ ] **RLS Policy Verification**: Audit Row Level Security to ensure Users can ONLY view their own orders but PUBLIC can view published listings.

### Step 2: The Repository Abstraction Layer (Clean Architecture)
- [x] **Define Contracts**: Created `src/services/repositories/interfaces.ts` with TypeScript interfaces.
- [x] **Supabase Implementation**: Created implementations in `src/services/repositories/supabase/`.
- [x] **Dependency Injection**: Implemented `RepositoryFactory` for seamless switching.

### Step 3: Global Context & Pilot Node State
- [x] **Zustand Migration**: Refactored monolithic store into `authStore`, `listingStore`, `orderStore`, and `configStore`.
- [x] **Pilot Node Injector**: Created `CommunityContext.tsx` for Node-awareness.

### Step 4: Authentication & Secure Session Flow
- [x] **Auth Bridge**: Connected `AuthRepository` to Supabase Auth (GoTrue).
- [ ] **Auto-Profile Logic**: (Pending SQL execution in Supabase Dashboard)
- [x] **Safe Logout**: Purge state logic included in `authStore`.

### Step 5: AI & Vector Discovery (MVP Foundation)
- [ ] **Edge Function Stubbing**: Create the first Supabase Edge Function to handle title-to-vector conversion using a transformer model.
- [ ] **Semantic Hook**: Add a `useSemanticSearch` hook that queries the `embedding` column in `listing_masters`.

---

## 🛠️ Phase 1.1: Core Infrastructure & Pilot Foundation
**Goal**: Establish the repository pattern and database connectivity with pilot-node awareness.

### 1. Database & Repository Layer
- [ ] **DB Initialization**: Apply `supabase_schema.sql` and `seed_data.sql` to the production Supabase instance.
- [ ] **Repository Setup**:
    - [NEW] `src/services/api/repositories/ListingRepository.ts`: Support node-based filtering (`node_id`).
    - [NEW] `src/services/api/repositories/UserRepository.ts`: Profile management with JinBean balance.
    - [NEW] `src/services/api/repositories/OrderRepository.ts`: State machine based on Design Section 4.3.
- [ ] **AI Search Stub**: Implement a basic semantic search interface using `pgvector` (even if using mock embeddings initially).

### 2. Identity & Onboarding (Pilot Specific)
- [ ] **Login Flow**: Implement Section 16 (Magic Link/SMS) with pilot-node selection during registration.
- [ ] **Profile Verification**:
    - [NEW] `src/components/profile/VerificationBadge.tsx`: Display Level 1-5 UI per Section 8.4.
    - [NEW] `src/pages/provider/BecomeProvider.tsx`: Two-track onboarding (Neighbor vs. Professional).

---

## 🎨 Phase 1.2: "Neighborly Warmth" (Concise English-First Overhaul)
**Goal**: Implement a premium UI that avoids "Western Chill" by blending North American standards with **Meituan-inspired warmth** (vibrant, high-density, and icon-rich).
 
### 3. "Concise English" & Meituan UI logic 
- [ ] **Intuitive English Labels**:
    - [NEW] Refactor `seed_data.sql` and components to use ultra-concise names (e.g., "Home Help", "Pro Help").
    - [NEW] System-wide English default with "Meituan" high-density information architecture.
 
### 4. "Neighborly Warmth" UI Overhaul
- [ ] **Aesthetic Standards (Design Doc §18)**:
    - [NEW] **Glassmorphism & Gradients**: Apply `--gradient-card` and `backdrop-blur` to headers and detail cards.
    - [NEW] **Soft Shadows**: Use `--shadow-card` and `--shadow-elevated` for depth.
    - [NEW] **Micro-Animations**: Add Framer Motion (or simple CSS transitions) for hover states and page entries.
- [ ] **Component: ServiceDetail (Premium)**:
    - [NEW] **Hero Gallery**: Embla Carousel with soft rounded corners (`--radius`).
    - [NEW] **Neighbor Trust Section**: A "Verified Neighbor" badge with the specific community node (e.g., "🛡️ Verified Hero of Kanata Lakes").
    - [NEW] **Pricing Engine**: Clear breakdown of Base Rate + Deposit + Fees.
    - [NEW] **Action Bar**: Sticky bottom bar with a blurred background.

---

## 💰 Phase 1.3: Transactional Loops & JinBean
**Goal**: Complete the "Booking to Review" cycle with point incentives.

### 5. Order Flow (JinBean Patterns)
- [ ] **Pattern 1 & 2**: Implement "Instant Pay" (Lees focus) and "Quote & Call" (Kanata focus).
- [ ] **Escrow Logic**: Frontend support for "Authorized Hold" (Section 5.3 Step 2).
- [ ] **JinBean Ledger**:
    - [NEW] `src/components/beans/BeanTransactionList.tsx`: User-facing ledger of points earned.

### 6. The Review & Story Loop
- [ ] **Double-Blind Reviews**: Logic to hide content until mutual submission.
- [ ] **Story Promotion**: A checkbox for reviewers: *"Share as a Neighbor Story?"* to earn extra 50 JinBeans.

---

## 🚀 Verification & Quality Standards

### Automated Verification
- [ ] `npm run build`: Zero build errors.
- [ ] `auth.uid()`: Ensure RLS policies in `supabase_schema.sql` are enforced.

### Manual Node Testing
1. **Lees Scenario**: User A (Student) rents a Drill from User B (Neighbor). Check: Deposit hold -> Return -> JinBean reward.
2. **Kanata Scenario**: User C (Family) books User D (Electrician). Check: License badge display -> Quote process -> Tax calculation.

---

## 📅 Timeline & Priority
1. **Week 1**: Infrastructure, DB, and Auth (The Boring Stuff).
2. **Week 2**: UI Components & Story Engine (The "Warm" Stuff).
3. **Week 3**: Order State Machine & JinBean Logic (The "Super App" Stuff).
4. **Week 4**: Pilot Node Simulation & Launch Prep.
