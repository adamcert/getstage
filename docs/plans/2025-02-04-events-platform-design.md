# Events Platform - Design Document

## Vision

Plateforme de billetterie événementielle moderne, colorée et émotionnelle. Concurrencer DICE, Shotgun, Weezevent avec une UX supérieure et des fonctionnalités différenciantes (revente intégrée, cartes cadeaux, intégration musicale).

## Décisions clés

| Aspect | Décision |
|--------|----------|
| Stack | Next.js 14 + Supabase + TypeScript |
| Priorité | Events d'abord, Bien-être en phase 2 |
| Modèle | Freemium sans commission, paliers features+volume |
| Style | Coloré, énergique, photos humaines émotionnelles |
| SNAPSS | Exclu du MVP, phase 2 |

---

## Architecture technique

### Stack

- **Frontend** : Next.js 14 (App Router) + TypeScript
- **Backend** : Supabase (Auth, Database, Realtime, Storage)
- **Styling** : Tailwind CSS + Framer Motion
- **Paiements** : Stripe Connect
- **Maps** : Mapbox GL
- **Music** : Spotify Web API + Apple MusicKit

### Structure du projet

```
/app
  /(public)/           → Pages publiques
    page.tsx           → Home
    /search            → Recherche/Agenda
    /event/[slug]      → Page événement
    /venue/[slug]      → Page établissement
    /resale            → Marketplace revente
    /gift-cards        → Cartes cadeaux
  /(auth)/
    /login
    /register
  /(dashboard)/        → Back-office organisateurs
    /overview          → Dashboard principal
    /events            → Gestion événements
    /analytics         → Stats & courbes
    /settings          → Paramètres compte
    /team              → Co-organisateurs
  /api/
    /webhooks/stripe   → Webhooks paiement
/components/
  /ui/                 → Composants de base (Button, Input, Card...)
  /features/           → Composants métier (EventCard, TicketSelector...)
  /layout/             → Header, Footer, Sidebar
/lib/
  supabase.ts          → Client Supabase
  stripe.ts            → Config Stripe
  spotify.ts           → API Spotify
/hooks/
  useAuth.ts
  useEvents.ts
  useSearch.ts
/types/
  database.ts          → Types Supabase générés
```

### Schéma base de données

```sql
-- Utilisateurs
users (
  id uuid PK,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  role enum('user', 'organizer', 'admin'),
  plan enum('free', 'pro', 'business'),
  created_at timestamp
)

-- Établissements
venues (
  id uuid PK,
  owner_id uuid FK -> users,
  name text,
  slug text UNIQUE,
  description text,
  category enum('bar', 'club', 'restaurant', 'theatre', 'gallery', 'other'),
  address text,
  city text,
  postal_code text,
  country text,
  latitude decimal,
  longitude decimal,
  phone text,
  cover_image text,
  logo text,
  social_links jsonb,
  opening_hours jsonb,
  is_published boolean,
  created_at timestamp
)

-- Événements
events (
  id uuid PK,
  venue_id uuid FK -> venues,
  organizer_id uuid FK -> users,
  title text,
  slug text UNIQUE,
  description text,
  category enum('concert', 'dj', 'theatre', 'comedy', 'expo', 'film', 'party', 'other'),
  music_genre text[],
  cover_image text,
  gallery text[],
  start_date timestamp,
  end_date timestamp,
  doors_open timestamp,
  status enum('draft', 'preview', 'published', 'cancelled', 'past'),
  preview_token text,
  is_featured boolean,
  is_new boolean,
  created_at timestamp
)

-- Types de billets
ticket_types (
  id uuid PK,
  event_id uuid FK -> events,
  name text,
  description text,
  price decimal,
  quantity_total int,
  quantity_sold int,
  max_per_order int,
  sale_start timestamp,
  sale_end timestamp
)

-- Artistes / Line-up
artists (
  id uuid PK,
  name text,
  bio text,
  image_url text,
  spotify_id text,
  apple_music_id text
)

event_artists (
  event_id uuid FK -> events,
  artist_id uuid FK -> artists,
  set_time timestamp,
  is_headliner boolean
)

-- Commandes
orders (
  id uuid PK,
  user_id uuid FK -> users,
  status enum('pending', 'paid', 'refunded', 'cancelled'),
  total_amount decimal,
  stripe_payment_intent text,
  created_at timestamp
)

-- Billets achetés
tickets (
  id uuid PK,
  order_id uuid FK -> orders,
  ticket_type_id uuid FK -> ticket_types,
  user_id uuid FK -> users,
  qr_code text UNIQUE,
  status enum('valid', 'used', 'resale', 'transferred', 'refunded'),
  resale_price decimal,
  created_at timestamp
)

-- Cartes cadeaux
gift_cards (
  id uuid PK,
  code text UNIQUE,
  amount decimal,
  balance decimal,
  purchaser_id uuid FK -> users,
  recipient_email text,
  recipient_name text,
  message text,
  design_template text,
  status enum('active', 'used', 'expired'),
  expires_at timestamp,
  created_at timestamp
)

-- Liste d'attente
waitlist (
  id uuid PK,
  event_id uuid FK -> events,
  user_id uuid FK -> users,
  ticket_type_id uuid FK -> ticket_types,
  notified boolean,
  created_at timestamp
)

-- Co-organisateurs
event_collaborators (
  event_id uuid FK -> events,
  user_id uuid FK -> users,
  role enum('admin', 'editor', 'staff'),
  invited_at timestamp,
  accepted_at timestamp
)

-- Templates email
email_templates (
  id uuid PK,
  venue_id uuid FK -> venues,
  type enum('confirmation', 'reminder', 'day_of', 'cancellation'),
  subject text,
  body_html text,
  is_active boolean
)
```

---

## Front Public

### Page d'accueil

- Hero immersif avec recherche (localisation auto, date, type)
- Sections dynamiques :
  - "Ce soir" → événements du jour
  - "Coup de cœur" → sélection éditoriale
  - "Nouveautés" → ajoutés récemment
  - "Tendances" → les plus vendus
- Carrousels par catégorie

### Page Recherche / Agenda

**Filtres disponibles :**
- Localisation (ville + rayon km)
- Date / période
- Type d'événement (menu déroulant complet)
- Genre musical
- Fourchette de prix
- Artiste (recherche texte)

**Affichage :**
- Vue split : liste à gauche, carte Mapbox à droite
- Mobile : carte en haut fixe, liste scrollable en bas
- Macarons visuels : Nouveau, Coup de cœur, Ce soir, Dernières places
- Tri : Popularité, Date, Prix, Distance

### Page Événement

**Header :**
- Image/vidéo cover plein écran
- Infos instantanées : titre, date, heure, lieu, prix

**Corps :**
- Description complète
- Line-up artistes avec :
  - Photo
  - Liens Spotify/Apple Music
  - Horaire de passage
- Section lieu : mini-map, adresse, téléphone, catégorie

**Billetterie :**
- Sélecteur de billets par type
- Ajout au panier (multi-événements supporté)
- Si complet : bouton "Liste d'attente"
- Warning si conflit de date avec autre événement dans le panier

**Actions secondaires :**
- "Revendre mon billet" (si déjà acheté)
- Partage réseaux sociaux

### Marketplace Revente

- Liste des billets en revente (prix ≤ prix original)
- Filtres par événement, date, prix
- Achat sécurisé via Stripe
- Transfert automatique du billet

### Cartes Cadeaux

- Choix du montant (libre ou prédéfini)
- Personnalisation : message, design
- Envoi par email ou SMS
- Solde consultable, utilisable sur tout événement

---

## Back-Office Organisateurs

### Dashboard

- KPIs : billets vendus, CA, taux de conversion
- Graphique temporel (jour/semaine/mois/année)
- Liste événements avec statut
- Alertes : stock bas, nouveaux messages

### Gestion Événements

- CRUD complet
- États : Brouillon → Avant-première → Publié → Passé / Annulé
- Avant-première : lien sécurisé non indexé
- Duplication pour événements récurrents
- Upload images/vidéos
- Gestion line-up artistes
- QR codes promo auto-générés

### Équipe & Accès

- Invitation co-organisateurs par email
- Rôles : Admin (tout), Editor (contenu), Staff (scan entrées)
- Log des actions

### Communications

- Templates email personnalisables
- Types : Confirmation, Rappel J-1, Jour J, Annulation
- Variables : {nom}, {event}, {date}, {lieu}, {qrcode}
- Preview et test avant activation

### Analytics

- Ventes par jour/semaine/mois
- Sources de trafic
- Taux de conversion par type de billet
- Comparaison entre événements

### Export & Virements

- Export CSV/Excel (participants, ventes, emails)
- Historique des virements Stripe
- Factures téléchargeables

### Page Établissement (Pack Business)

- Header : logo, cover, nom
- Description, infos pratiques
- Événements à venir / passés
- Artistes ayant performé
- Liens réseaux sociaux
- Horaires d'ouverture

---

## Modèle économique

### Grille tarifaire

| | GRATUIT | PRO (29€/mois) | BUSINESS (99€/mois) |
|---|---------|----------------|---------------------|
| Événements/mois | 3 | 15 | Illimité |
| Billets/événement | 100 | 500 | Illimité |
| Page événement | ✅ | ✅ | ✅ |
| Page établissement | ❌ | ✅ | ✅ |
| Export data | Basique | Complet | Complet |
| API access | ❌ | ✅ | ✅ |
| Line-up artistes | ❌ | ✅ | ✅ |
| Liste d'attente | ❌ | ✅ | ✅ |
| Avant-premières | ❌ | ❌ | ✅ |
| Co-organisateurs | ❌ | ❌ | ✅ |
| Emails custom | ❌ | ❌ | ✅ |
| Analytics avancés | ❌ | ❌ | ✅ |
| Support | Community | Email | Prioritaire |

### Pas de commission

L'organisateur garde 100% de ses ventes. Seuls les frais Stripe s'appliquent (1.4% + 0.25€).

---

## Identité visuelle

### Palette de couleurs

```
Primary:    #FF6B6B (Corail vibrant)
Secondary:  #8B5CF6 (Violet électrique)
Accent:     #FBBF24 (Jaune soleil)
Success:    #10B981 (Vert menthe)
Background: #FAFAFA (Gris très clair)
Surface:    #FFFFFF (Blanc)
Text:       #1F2937 (Gris anthracite)
Muted:      #6B7280 (Gris moyen)
```

### Typographie

- **Titres** : Inter Bold / Black
- **Corps** : Inter Regular
- **Accents** : Inter Semi-Bold

### Principes visuels

1. **Photos humaines émotionnelles** : foules en concert, sourires, moments de partage, connexion
2. **Couleurs vives** : accents corail, violet, jaune sur fond clair
3. **Animations joyeuses** : transitions fluides, micro-interactions ludiques
4. **Illustrations vectorielles** : pour états vides et onboarding
5. **Macarons distinctifs** : badges visuels pour statuts spéciaux

### UX Signature

- "Infos en 1 seconde" : titre, date, lieu, prix toujours visibles
- Panier persistant multi-événements
- Warnings intelligents (conflits de dates)
- Onboarding organisateur en 3 étapes max

---

## Intégrations

### Stripe Connect

- Onboarding organisateurs
- Paiements sécurisés
- Split payments automatiques
- Gestion des remboursements
- Dashboard virements

### Spotify Web API

- Recherche artistes
- Profil artiste (photo, bio, genres)
- Preview 30 secondes
- Lien vers profil Spotify

### Apple MusicKit

- Équivalent Spotify pour écosystème Apple
- Lien vers Apple Music

### Mapbox GL

- Carte interactive recherche
- Mini-map page événement/lieu
- Calcul d'itinéraire
- Geocoding adresses

---

## Hors scope MVP (Phase 2)

- SNAPSS/SNAPPS (fidélité, membres, points)
- Module Bien-être complet
- App mobile native
- Notifications push géolocalisées
- Intégration calendrier externe (Google, Apple)

---

## Prochaines étapes

1. Setup projet Next.js + Supabase
2. Implémentation base de données
3. Authentification
4. CRUD événements
5. Système de billetterie
6. Paiements Stripe
7. Recherche et filtres
8. Revente et cartes cadeaux
9. Back-office complet
10. Polish UI/UX
