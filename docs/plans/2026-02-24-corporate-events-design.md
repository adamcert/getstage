# Corporate Events Section + Remove Resale

## Summary
Replace the resale section with a corporate events section targeting agencies that organize salons, conferences, and professional events for their clients.

## Changes

### 1. Remove Resale
- Remove nav link from header and footer
- Delete `app/resale/page.tsx`
- Clean up `lib/data/mock-resale.ts` references
- Remove `resale` translation section

### 2. New Corporate Categories
Add to existing category system: Conférence, Salon, Séminaire, Team Building, Gala

### 3. Landing Page `/corporate`
- Hero: "Événementiel sur mesure" with CTA
- Services grid: Salons, Conférences, Team Building, Galas, Lancement produit, Convention
- Advantages: Plateforme clé en main, Gestion inscriptions, Analytics, Marque blanche
- CTA: Contact form / button

### 4. Navigation
Replace "Revente" with "Événementiel" → `/corporate` in header and footer
