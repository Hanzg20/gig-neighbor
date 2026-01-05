# v0.0.1 Release Notes

**Initial Release of Gig Neighbor (Pilot Phase)**

## Major Features
- **Transactional Core**: Complete "Quote & Call" system for service bookings and rental requests.
- **Order System**: "Pay with Beans" (Instant Pay) and Negotiation flows (Request Quote).
- **Listing System**: High-density "Meituan-style" category grids and premium service listings.
- **Trust Layer**: Verification badges for Insurance and Professional Licenses.
- **Localization**: English-First UI optimization for Ottawa Pilot (Kanata/Lees).

## Infrastructure
- **Supabase Integration**: Full production schema v3.2 with RLS polices and Triggers.
- **Repository Pattern**: Abstracted data access layer for Orders, Listings, and Profiles.
- **State Management**: Zustand stores for Auth, Config, and Orders.

## Known Issues
- Mobile responsiveness on very small screens (iPhone SE) requires further tuning.
- Search functionality is basic (exact match only).
