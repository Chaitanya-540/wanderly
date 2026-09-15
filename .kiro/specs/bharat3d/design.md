# Design Document — BHĀRAT3D

## Overview

BHĀRAT3D is a cinematic, interactive India destination explorer and trip-planning platform. It is a Next.js 14 App Router (TypeScript) application that combines a React Three Fiber WebGL 3D map of India with discovery tools, a server-side image resolution pipeline, a dynamic budget estimator, and fully offline-capable trip planning via localStorage. There is no server-side auth or database; all user state lives in the browser.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (Client Components)                                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  3D Map      │  │  Discovery   │  │  Planning              │   │
│  │  IndiaMap    │  │  QuickList   │  │  TripPlanner           │   │
│  │  StateLayer  │  │  MoodFilter  │  │  BudgetEstimator       │   │
│  │  MarkerLayer │  │  Search      │  │  Itinerary             │   │
│  │  LabelLayer  │  │  SurpriseMe  │  │  Favorites             │   │
│  └──────────────┘  └──────────────┘  └────────────────────────┘   │
│                                                                     │
│  React Hooks: useFavorites · useTripPlanner · useLocalProfile       │
│  Zustand store: mapStore · filterStore · uiStore                    │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ fetch
┌─────────────────────────────────▼───────────────────────────────────┐
│  Next.js App Router — Route Handlers (Server)                       │
│                                                                     │
│  GET /api/images/[id]     — Image Resolver Pipeline                 │
│  GET /api/exchange-rates  — Currency Rate Proxy                     │
└────────────────┬────────────────────────────────────────────────────┘
                 │ parallel
      ┌──────────┼──────────────┐
      ▼          ▼              ▼
  Wikimedia   Unsplash      Pexels
  Commons     API           API
```

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, nav bar, fonts
│   ├── page.tsx                    # Homepage
│   ├── attraction/
│   │   └── [id]/
│   │       ├── page.tsx            # Attraction detail page
│   │       └── not-found.tsx       # 404 for unknown IDs
│   ├── quick-list/page.tsx
│   ├── trip-planner/page.tsx
│   ├── favorites/page.tsx
│   ├── account/page.tsx
│   └── api/
│       ├── images/[id]/route.ts    # Image Resolver Route Handler
│       └── exchange-rates/route.ts # Currency rate proxy
│
├── components/
│   ├── map/
│   │   ├── IndiaMap.tsx            # R3F Canvas root
│   │   ├── StateLayer.tsx          # GeoJSON → 3D extruded meshes
│   │   ├── StateLabelLayer.tsx     # Billboard text labels + collision
│   │   ├── AttractionLayer.tsx     # All AttractionMarkers
│   │   ├── AttractionMarker.tsx    # Single pulsing glyph
│   │   └── MapControls.tsx         # OrbitControls config
│   │
│   ├── discovery/
│   │   ├── Search.tsx
│   │   ├── QuickList.tsx
│   │   ├── MoodFilter.tsx
│   │   └── SurpriseMe.tsx
│   │
│   ├── cards/
│   │   ├── DestinationCard.tsx
│   │   └── PopularAttractions.tsx
│   │
│   ├── detail/
│   │   ├── Gallery.tsx
│   │   ├── Highlights.tsx
│   │   ├── InsiderTips.tsx
│   │   └── NearbyDestinations.tsx
│   │
│   ├── planning/
│   │   ├── Planner.tsx
│   │   ├── BudgetEstimator.tsx
│   │   └── Itinerary.tsx
│   │
│   └── ui/
│       ├── NavBar.tsx
│       ├── AttributionBlock.tsx
│       ├── ImageWithFallback.tsx
│       ├── SkeletonCard.tsx
│       └── WebGLFallback.tsx
│
├── data/
│   ├── attractions.ts              # Full attraction dataset
│   ├── costOfLiving.ts             # State-level cost data
│   ├── cities.ts                   # Major cities with coordinates
│   ├── categoryColors.ts           # Category → accent color map
│   └── moodTags.ts                 # Exactly 10 mood tags
│
├── hooks/
│   ├── useFavorites.ts
│   ├── useTripPlanner.ts
│   └── useLocalProfile.ts
│
├── services/
│   ├── imageResolver/
│   │   ├── index.ts                # Pipeline orchestrator
│   │   ├── wikimedia.ts            # Wikimedia Commons adapter
│   │   ├── unsplash.ts             # Unsplash API adapter
│   │   ├── pexels.ts               # Pexels API adapter
│   │   ├── relevanceFilter.ts      # Relevance scoring
│   │   └── licenseValidator.ts     # License validation
│   ├── budgetCalculator.ts
│   ├── itineraryGenerator.ts
│   └── popularityRanker.ts
│
├── store/
│   ├── mapStore.ts                 # Zustand: camera, active attraction
│   ├── filterStore.ts              # Zustand: active moods, filters
│   └── uiStore.ts                  # Zustand: panels, modals
│
├── utils/
│   ├── geo.ts                      # Haversine distance, GeoJSON helpers
│   ├── collision.ts                # Label collision detection
│   └── currency.ts                 # INR ↔ USD/EUR conversion
│
└── types/
    ├── attraction.ts
    ├── image.ts
    ├── budget.ts
    ├── trip.ts
    └── profile.ts
```

---

## Core Data Models

### Attraction

```typescript
// src/types/attraction.ts

export type MoodTag =
  | 'Relaxing'
  | 'Adventure'
  | 'Cultural'
  | 'Nature'
  | 'Family'
  | 'Romantic'
  | 'Spiritual'
  | 'Food'
  | 'Wildlife'
  | 'Beach';

export type AttractionCategory =
  | 'Temple'
  | 'Fort'
  | 'Beach'
  | 'Wildlife'
  | 'Mountain'
  | 'Lake'
  | 'Museum'
  | 'City'
  | 'Waterfall'
  | 'Heritage';

export interface Attraction {
  id: string;                      // kebab-case unique ID
  name: string;
  city: string;
  state: string;
  district: string;
  category: AttractionCategory;
  moodTags: MoodTag[];             // ≥1, ≤4
  coordinates: {
    lat: number;                   // WGS-84
    lng: number;
  };
  description: string;             // one sentence
  highlights: string[];            // ≥3 bullet points
  insiderTips: string[];           // ≥2 insider tips
  itineraries: Itinerary[];        // ≥1 itinerary per duration
  popularityScore: number;         // 0–100 editorial/visit-weight
  nearbyRadius: number;            // km, default 200
}

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  tips?: string;
}

export interface Itinerary {
  days: 2 | 3 | 4;
  profile: 'Solo' | 'Family';
  schedule: ItineraryDay[];        // length === days
}
```

### Image Manifest

```typescript
// src/types/image.ts

export interface ImageRecord {
  sourceUrl: string;               // full-resolution URL
  thumbnailUrl: string;            // ≤400 px wide
  authorName: string;
  licenseName: string;             // e.g. "CC BY-SA 4.0"
  attributionUrl: string;          // link to source page
  source: 'wikimedia' | 'unsplash' | 'pexels';
  relevanceScore: number;          // 0–1, internal use
}

export interface ImageManifest {
  attractionId: string;
  images: ImageRecord[];
  insufficientImages: boolean;     // true when images.length < 4
  cachedAt: number;                // Unix ms timestamp
}
```

### Budget

```typescript
// src/types/budget.ts

export type AccommodationTier = 'Budget' | 'Mid-range' | 'Luxury';
export type TravelStyle = 'Backpacker' | 'Standard' | 'Premium';
export type Currency = 'INR' | 'USD' | 'EUR';

export interface BudgetInput {
  attractionId: string;
  startingCity: string;
  days: number;                    // 1–30
  travellers: number;              // 1–20
  accommodation: AccommodationTier;
  travelStyle: TravelStyle;
  currency: Currency;
}

export interface BudgetBreakdown {
  transport: number;               // INR
  accommodation: number;           // INR per night × nights
  food: number;                    // INR per day × days × travellers
  activities: number;              // INR
  miscellaneous: number;           // INR
  totalINR: number;
  totalConverted?: number;         // if currency !== 'INR'
  currency: Currency;
  exchangeRate?: number;
}
```

### Trip

```typescript
// src/types/trip.ts

export interface Trip {
  id: string;                      // uuid
  attractionId: string;
  attractionName: string;
  itinerary: Itinerary;
  budget?: BudgetBreakdown;
  createdAt: number;
  updatedAt: number;
}
```

### Local Profile

```typescript
// src/types/profile.ts

export interface LocalProfile {
  displayName: string;
  defaultMoods: MoodTag[];         // default filter state on load
}
```

---

## Component Architecture

### IndiaMap

The root 3D Map component. Renders a `<Canvas>` from `@react-three/fiber` configured with:

- `camera`: `{ position: [0, 8, 14], fov: 45 }` — top-angled view over India
- `gl`: `{ antialias: true, alpha: false }` — opaque canvas, no transparency
- Background colour `#0a0a1a`
- `EffectComposer` (from `@react-three/postprocessing`) with `Bloom` effect
- Pointer-event passthrough: `style={{ pointerEvents: 'none' }}` on canvas wrapper; an inner `<div>` with `pointerEvents: 'auto'` captures only canvas interactions, allowing page scroll to propagate

```typescript
// src/components/map/IndiaMap.tsx (outline)

'use client';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense } from 'react';
import { StateLayer } from './StateLayer';
import { StateLabelLayer } from './StateLabelLayer';
import { AttractionLayer } from './AttractionLayer';
import { MapControls } from './MapControls';
import { WebGLFallback } from '../ui/WebGLFallback';

export function IndiaMap() {
  return (
    <div className="india-map-container" style={{ position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 8, 14], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: '#0a0a1a' }}
        onCreated={({ gl }) => {
          // Stop scroll propagation only within canvas bounds
          gl.domElement.addEventListener('wheel', e => e.stopPropagation(), { passive: false });
        }}
        fallback={<WebGLFallback />}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <ambientLight intensity={0.1} />
          <StateLayer />
          <StateLabelLayer />
          <AttractionLayer />
          <MapControls />
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} intensity={1.2} radius={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### StateLayer

Converts GeoJSON `FeatureCollection` into Three.js `ShapeGeometry` / `ExtrudeGeometry` meshes:

1. Fetch `india-states.geojson` at build-time via `getStaticProps` or at runtime via `useEffect`
2. Project GeoJSON longitude/latitude to Three.js X/Z using a Mercator-like linear mapping centred on India's bounding box (`[68, 37]` to `[97, 8]`)
3. Render each state as a thin extruded polygon (`depth: 0.05`) with an emissive `LineSegments` outline for the border glow
4. The GeoJSON source URL is validated against an allowlist (`datameet.org` or `naturalearthdata.com`) to enforce Requirement 1.1

```typescript
// Coordinate projection (simplified)
function projectToXZ(lng: number, lat: number): [number, number] {
  const INDIA_LNG_MIN = 68, INDIA_LNG_MAX = 97;
  const INDIA_LAT_MIN = 8,  INDIA_LAT_MAX = 37;
  const SCALE = 10; // world units
  const x = ((lng - INDIA_LNG_MIN) / (INDIA_LNG_MAX - INDIA_LNG_MIN) - 0.5) * SCALE;
  const z = -((lat - INDIA_LAT_MIN) / (INDIA_LAT_MAX - INDIA_LAT_MIN) - 0.5) * SCALE;
  return [x, z];
}
```

### StateLabelLayer

- Reads camera distance from `useThree()` to decide visible labels
- Uses `@react-three/drei` `<Text>` components rendered as billboards (always face camera)
- **Collision prevention**: each label projects its 3D position to NDC (Normalised Device Coordinates), computes a screen-space bounding rect, and uses a sweep-line algorithm to detect overlaps; lower-priority labels (shorter state names, smaller area) are hidden by setting `visible={false}`

### AttractionMarker

Single pulsing glyph at an Attraction's 3D coordinates:

- Geometry: `SphereGeometry(0.08, 8, 8)` + surrounding `RingGeometry` for pulse
- Material: `MeshStandardMaterial` with `emissive` colour from `categoryColors` map
- Pulse animation: `useFrame` scales the ring between `0.9` and `1.3` with `Math.sin(clock.elapsedTime * 2)`
- `onPointerEnter` / `onPointerLeave` — tooltip via `<Html>` (drei)
- `onClick` — dispatches to `mapStore.setActiveAttraction(id)`

### MapControls

Wraps `@react-three/drei` `<OrbitControls>`:

```typescript
<OrbitControls
  enableRotate={true}
  enablePan={true}
  enableZoom={true}
  autoRotate={false}        // Requirement 1.7
  minDistance={3}
  maxDistance={25}
  makeDefault
/>
```

Camera animation (for Search, Surprise Me, Popular Panel clicks) uses `drei`'s `useCamera` or a custom `useCameraAnimation` hook that linearly interpolates `camera.position` and `controls.target` via `useFrame` with an easing function (`easeInOutCubic`), completing within 2 000 ms.

---

## Image Resolver Pipeline

### Route Handler

```
GET /api/images/[id]
```

Implemented in `src/app/api/images/[id]/route.ts` (Next.js App Router Route Handler). API keys (`WIKIMEDIA_USER_AGENT`, `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`) are read from `process.env` — never sent to the client.

### Pipeline Flow

```
Request (attractionId)
       │
       ▼
┌─────────────────────────────┐
│  Cache Check (in-memory     │
│  Map + TTL 24 h)            │
│  HIT → return cached        │
│  MISS → continue            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Parallel Fetch             │
│  Promise.allSettled([       │
│    queryWikimedia(term),    │
│    queryUnsplash(term),     │
│    queryPexels(term)        │
│  ])                         │
└─────────────┬───────────────┘
              │ raw candidates
              ▼
┌─────────────────────────────┐
│  Relevance Filter           │
│  score = tokenOverlap(      │
│    image.metadata,          │
│    [name, city, state]      │
│  )                          │
│  discard if score < 0.1     │
└─────────────┬───────────────┘
              │ relevant candidates
              ▼
┌─────────────────────────────┐
│  License Validator          │
│  accept: CC-BY, CC-BY-SA,   │
│  CC0, Unsplash License,     │
│  Pexels License             │
│  discard others             │
└─────────────┬───────────────┘
              │ valid candidates
              ▼
┌─────────────────────────────┐
│  Deduplication              │
│  Remove cross-attraction    │
│  duplicates via global      │
│  in-process Set<sourceUrl>  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Assemble Manifest          │
│  images.length < 4 →        │
│  insufficientImages: true   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Cache Store (24 h)         │
│  Return JSON manifest       │
└─────────────────────────────┘
```

### Cache Implementation

```typescript
// src/services/imageResolver/index.ts

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-process cache (survives request lifecycles in same Node.js process)
const manifestCache = new Map<string, { manifest: ImageManifest; expiry: number }>();

// Cross-contamination guard: tracks all source URLs ever assigned
const assignedUrls = new Set<string>();

export async function resolveImages(attractionId: string): Promise<ImageManifest> {
  const cached = manifestCache.get(attractionId);
  if (cached && Date.now() < cached.expiry) return cached.manifest;

  const attraction = getAttractionById(attractionId);
  if (!attraction) throw new Error(`Unknown attraction: ${attractionId}`);

  const searchTerm = `${attraction.name} ${attraction.city} India`;

  const [wikiResult, unsplashResult, pexelsResult] = await Promise.allSettled([
    queryWikimedia(searchTerm),
    queryUnsplash(searchTerm),
    queryPexels(searchTerm),
  ]);

  const candidates = [
    ...(wikiResult.status === 'fulfilled' ? wikiResult.value : []),
    ...(unsplashResult.status === 'fulfilled' ? unsplashResult.value : []),
    ...(pexelsResult.status === 'fulfilled' ? pexelsResult.value : []),
  ];

  const relevant = applyRelevanceFilter(candidates, attraction);
  const licensed = applyLicenseValidator(relevant);
  const deduplicated = licensed.filter(img => !assignedUrls.has(img.sourceUrl));

  deduplicated.forEach(img => assignedUrls.add(img.sourceUrl));

  const manifest: ImageManifest = {
    attractionId,
    images: deduplicated.slice(0, 10),   // cap at 10
    insufficientImages: deduplicated.length < 4,
    cachedAt: Date.now(),
  };

  manifestCache.set(attractionId, { manifest, expiry: Date.now() + CACHE_TTL_MS });
  return manifest;
}
```

### Relevance Filter

```typescript
// src/services/imageResolver/relevanceFilter.ts

export function applyRelevanceFilter(
  candidates: RawImageCandidate[],
  attraction: Attraction,
): RawImageCandidate[] {
  const tokens = tokenise(`${attraction.name} ${attraction.city} ${attraction.state}`);
  return candidates
    .map(img => {
      const metaTokens = tokenise(
        `${img.title ?? ''} ${img.description ?? ''} ${(img.tags ?? []).join(' ')}`,
      );
      const overlap = tokens.filter(t => metaTokens.includes(t)).length;
      const score = tokens.length > 0 ? overlap / tokens.length : 0;
      return { ...img, relevanceScore: score };
    })
    .filter(img => img.relevanceScore >= 0.1);
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);
}
```

---

## Budget Estimator

### State-Level Cost Data

```typescript
// src/data/costOfLiving.ts

export interface StateCostData {
  state: string;
  budgetHotel: number;       // INR per room per night
  midrangeHotel: number;     // INR per room per night
  luxuryHotel: number;       // INR per room per night
  budgetMealPerPerson: number;   // INR per day
  midrangeMealPerPerson: number;
  premiumMealPerPerson: number;
  activitiesPerDayPerPerson: number; // INR, varies by state
  miscPerDayPerPerson: number;
}

// Example entries (values represent realistic 2024 INR data)
export const STATE_COST_DATA: Record<string, StateCostData> = {
  'Rajasthan': {
    state: 'Rajasthan',
    budgetHotel: 800,
    midrangeHotel: 2500,
    luxuryHotel: 8000,
    budgetMealPerPerson: 300,
    midrangeMealPerPerson: 700,
    premiumMealPerPerson: 1800,
    activitiesPerDayPerPerson: 600,
    miscPerDayPerPerson: 400,
  },
  'Kerala': {
    state: 'Kerala',
    budgetHotel: 700,
    midrangeHotel: 2200,
    luxuryHotel: 7000,
    budgetMealPerPerson: 250,
    midrangeMealPerPerson: 600,
    premiumMealPerPerson: 1500,
    activitiesPerDayPerPerson: 550,
    miscPerDayPerPerson: 350,
  },
  // ... all 28 states + 8 UTs
};
```

### Calculation Algorithm

```typescript
// src/services/budgetCalculator.ts

export function calculateBudget(input: BudgetInput): BudgetBreakdown | ValidationError {
  const errors = validateBudgetInput(input);
  if (errors.length > 0) return { errors };

  const attraction = getAttractionById(input.attractionId);
  const costData = STATE_COST_DATA[attraction.state];
  const { days, travellers, accommodation, travelStyle } = input;

  // --- Transport ---
  const origin = MAJOR_CITIES[input.startingCity];
  const dest = attraction.coordinates;
  const distanceKm = haversineDistance(origin, dest);
  const transportMode = selectTransportMode(distanceKm);
  const transportCostINR = calculateTransportCost(distanceKm, transportMode, travellers);

  // --- Accommodation ---
  const hotelKey: keyof StateCostData =
    accommodation === 'Budget' ? 'budgetHotel' :
    accommodation === 'Mid-range' ? 'midrangeHotel' : 'luxuryHotel';
  const roomsNeeded = travelStyle === 'Backpacker' ? Math.ceil(travellers / 4) :
    travelStyle === 'Standard' ? Math.ceil(travellers / 2) : travellers;
  const accommodationCostINR = costData[hotelKey] * roomsNeeded * days;

  // --- Food ---
  const mealKey: keyof StateCostData =
    travelStyle === 'Backpacker' ? 'budgetMealPerPerson' :
    travelStyle === 'Standard' ? 'midrangeMealPerPerson' : 'premiumMealPerPerson';
  const foodCostINR = costData[mealKey] * travellers * days;

  // --- Activities ---
  const activitiesCostINR = costData.activitiesPerDayPerPerson * travellers * days;

  // --- Miscellaneous ---
  const miscCostINR = costData.miscPerDayPerPerson * travellers * days;

  const totalINR = transportCostINR + accommodationCostINR + foodCostINR +
    activitiesCostINR + miscCostINR;

  return {
    transport: transportCostINR,
    accommodation: accommodationCostINR,
    food: foodCostINR,
    activities: activitiesCostINR,
    miscellaneous: miscCostINR,
    totalINR,
    currency: input.currency,
  };
}

function selectTransportMode(distanceKm: number): 'bus' | 'train' | 'flight' {
  if (distanceKm < 150) return 'bus';
  if (distanceKm < 800) return 'train';
  return 'flight';
}

function calculateTransportCost(
  distanceKm: number,
  mode: 'bus' | 'train' | 'flight',
  travellers: number,
): number {
  // INR per km per person rates (representative 2024 values)
  const RATES = { bus: 1.2, train: 1.8, flight: 6.5 };
  return RATES[mode] * distanceKm * travellers * 2; // × 2 for round trip
}
```

---

## Hooks

### useFavorites

```typescript
// src/hooks/useFavorites.ts

const STORAGE_KEY = 'bharat3d_favorites_v1';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set(); // localStorage unavailable
    }
  });
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      setStorageAvailable(false);
    }
  }, [favorites]);

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return { favorites, toggle, isFavorite: (id: string) => favorites.has(id), storageAvailable };
}
```

### useTripPlanner

```typescript
// src/hooks/useTripPlanner.ts

const STORAGE_KEY = 'bharat3d_trips_v1';

export function useTripPlanner() {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trips)); }
    catch { /* silent, storageAvailable surfaced separately */ }
  }, [trips]);

  const saveTrip = useCallback((trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const full: Trip = { ...trip, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() };
    setTrips(prev => [...prev, full]);
    return full;
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trips, saveTrip, deleteTrip };
}
```

---

## Global State (Zustand)

```typescript
// src/store/mapStore.ts

interface MapState {
  activeAttractionId: string | null;
  setActiveAttraction: (id: string | null) => void;
  cameraTarget: [number, number, number];
  setCameraTarget: (pos: [number, number, number]) => void;
  isAnimating: boolean;
  setIsAnimating: (v: boolean) => void;
}

// src/store/filterStore.ts

interface FilterState {
  activeMoods: Set<MoodTag>;
  toggleMood: (mood: MoodTag) => void;
  clearMoods: () => void;
  activeCategory: AttractionCategory | null;
  setActiveCategory: (c: AttractionCategory | null) => void;
  activeState: string | null;
  setActiveState: (s: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}
```

---

## Search Implementation

Search runs entirely client-side using a filtered view of the attraction dataset, debounced with a 300 ms timer:

```typescript
// src/components/discovery/Search.tsx (outline)

const DEBOUNCE_MS = 300;

export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchAttractions(q, ATTRACTIONS));
    }, DEBOUNCE_MS);
  };
  // ...
}

function searchAttractions(query: string, data: Attraction[]): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return data
    .filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q),
    )
    .slice(0, 10)
    .map(a => ({ type: 'attraction', attraction: a }));
}
```

---

## Popularity Ranking

```typescript
// src/services/popularityRanker.ts

export function rankByPopularity(attractions: Attraction[]): Attraction[] {
  return [...attractions].sort((a, b) => b.popularityScore - a.popularityScore);
}
```

`popularityScore` is an editorial weight (0–100) embedded in each `Attraction` record. It is never hardcoded in the UI component; the panel always calls `rankByPopularity` at render time.

---

## Nearby Destinations

```typescript
// src/utils/geo.ts

export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371; // Earth radius km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function findNearby(
  origin: Attraction,
  all: Attraction[],
  radiusKm = 200,
  limit = 5,
): Attraction[] {
  return all
    .filter(a => a.id !== origin.id)
    .map(a => ({ attraction: a, dist: haversineDistance(origin.coordinates, a.coordinates) }))
    .filter(x => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(x => x.attraction);
}
```

---

## Collision Prevention for State Labels

```typescript
// src/utils/collision.ts

export interface LabelRect {
  id: string;
  priority: number;   // higher = more important
  x: number; y: number; w: number; h: number; // screen-space pixels
}

export function resolveCollisions(labels: LabelRect[]): Set<string> {
  // Sort descending by priority; higher priority labels are kept
  const sorted = [...labels].sort((a, b) => b.priority - a.priority);
  const visible = new Set<string>();
  const placed: LabelRect[] = [];

  for (const label of sorted) {
    const overlaps = placed.some(p => rectsOverlap(label, p));
    if (!overlaps) {
      visible.add(label.id);
      placed.push(label);
    }
  }
  return visible;
}

function rectsOverlap(a: LabelRect, b: LabelRect): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}
```

---

## Mood Filter

```typescript
// src/data/moodTags.ts

export const MOOD_TAGS = [
  'Relaxing', 'Adventure', 'Cultural', 'Nature',
  'Family', 'Romantic', 'Spiritual', 'Food', 'Wildlife', 'Beach',
] as const satisfies MoodTag[];
// Exactly 10 tags — compile-time enforced
```

`AttractionMarker` reads `filterStore.activeMoods` and computes:

```typescript
const dimmed = activeMoods.size > 0 && !attraction.moodTags.some(m => activeMoods.has(m));
// Sets material.opacity = dimmed ? 0.2 : 1.0
```

---

## Itinerary Generator

```typescript
// src/services/itineraryGenerator.ts

export function generateItinerary(
  attraction: Attraction,
  days: 2 | 3 | 4,
  profile: 'Solo' | 'Family',
): Itinerary {
  // Find the matching pre-authored itinerary in the attraction dataset
  const match = attraction.itineraries.find(
    it => it.days === days && it.profile === profile,
  );
  if (match) return match;

  // Fallback: construct from nearby attractions (never generic)
  const nearby = findNearby(attraction, ATTRACTIONS, 100, days * 2);
  return constructItinerary(attraction, nearby, days, profile);
}
```

Each `Attraction` record includes authored itineraries for all `days × profile` combinations (8 combinations). The `constructItinerary` fallback uses nearby named places to guarantee specificity (Requirement 11.6).

---

## WebGL Fallback

```typescript
// src/components/ui/WebGLFallback.tsx

export function WebGLFallback() {
  return (
    <div role="img" aria-label="Static map of India showing major states">
      <Image
        src="/fallback-india-map.png"
        alt="Static map of India"
        fill
        priority
      />
      <p>Your browser does not support WebGL. Showing a static map.</p>
    </div>
  );
}
```

Detection uses `drei`'s `<Canvas fallback={<WebGLFallback />}>` prop which renders the fallback when WebGL context creation fails.

---

## Homepage Layout

```
┌──────────────────────────────────────────────────────────┐
│  NavBar (sticky top, z-50)                               │
│  Links: Quick List | Trip Planner | Favorites | Account  │
└──────────────────────────────────────────────────────────┘
│  Hero Section (100vh)                                    │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │   IndiaMap (3D Canvas)   │  │ PopularAttractions   │ │
│  │   MoodFilter overlay     │  │ Panel (floating right│ │
│  │   SurpriseMe button      │  │ side)                │ │
│  │   Search overlay         │  └──────────────────────┘ │
│  └──────────────────────────┘                            │
├──────────────────────────────────────────────────────────┤
│  Normal page scroll continues below hero section         │
│  (canvas does NOT trap scroll outside its bounds)        │
├──────────────────────────────────────────────────────────┤
│  Featured Destinations section                           │
│  How It Works section                                    │
│  Footer                                                  │
└──────────────────────────────────────────────────────────┘
```

The 3D Map canvas is contained within the hero section. Scroll events on the canvas are stopped from propagating to the browser's default zoom/scroll **only within the canvas element**, via the `wheel` event listener attached in `onCreated`. All other page sections scroll normally.

---

## Attraction Page Layout (`/attraction/[id]`)

```
┌──────────────────────────────────────────────────┐
│  Full-width hero image (next/image, priority)     │
│  Attraction name overlay + mood badge             │
├──────────────────────────────────────────────────┤
│  Gallery (4+ images, masonry or carousel)         │
│  AttributionBlock under each image                │
├──────────────────────────────────────────────────┤
│  Highlights   │  Insider Tips                     │
├──────────────────────────────────────────────────┤
│  Itinerary (day-by-day, tabs for 2/3/4 days)     │
├──────────────────────────────────────────────────┤
│  Budget Estimator (default profile prefilled)     │
├──────────────────────────────────────────────────┤
│  Nearby Destinations (≤5 cards within 200 km)    │
└──────────────────────────────────────────────────┘
```

The route file uses `generateStaticParams()` for all known attraction IDs and `notFound()` for unknown IDs (HTTP 404, Requirement 9.8).

---

## Accessibility

- All interactive controls outside the canvas have `aria-label` or visible text labels (Requirement 16.4)
- `<nav>`, `<main>`, `<section>`, `<article>`, `<button>` used throughout (Requirement 16.5)
- Navigation bar is keyboard-navigable with visible focus rings (Requirement 15.4)
- Color contrast ratios meet WCAG 2.1 AA for all text on dark backgrounds
- `next/image` provides automatic lazy loading, AVIF/WebP format selection, and prevents layout shift (Requirement 16.2)
- Loading spinner with `aria-live="polite"` region while 3D map initialises (Requirement 16.3)

---

## Performance Strategy

- 3D Map Canvas: lazy-loaded behind a `dynamic(() => import('./IndiaMap'), { ssr: false })` to exclude WebGL from SSR
- GeoJSON: fetched once, memoised in module scope; topology pre-simplified to reduce vertex count
- `next/image` for all raster images with `sizes` prop tuned per breakpoint
- Image Resolver responses cached for 24 h server-side; client uses `stale-while-revalidate` via `fetch` cache options
- Route-level code splitting via App Router's automatic per-route bundles
- Budget calculation is synchronous in-memory (no network call), preventing LCP regression

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Image Resolver API key missing | Route Handler returns 500; client shows "Image currently unavailable" |
| Image Resolver returns 0 images | `insufficientImages: true`; card shows placeholder |
| localStorage unavailable | Hooks fall back to in-memory state; banner warns user |
| Unknown attraction ID | `notFound()` → HTTP 404 page |
| WebGL not supported | Static fallback map image rendered |
| Budget input out of range | Field-level validation message; no calculation performed |
| Search returns no results | "No results found" message displayed |
| Exchange rate API unavailable | Currency toggle hidden; costs displayed in INR only |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: GeoJSON features are bounded within India

*For any* GeoJSON feature passed through the StateLayer renderer, its coordinates SHALL fall within India's bounding box (longitude 68°–97°E, latitude 8°–37°N), and no feature outside this bounding box SHALL be rendered.

**Validates: Requirements 1.4**

---

### Property 2: Camera does not move without user input

*For any* time interval during which no user pointer or scroll events have been dispatched to the canvas, the 3D Map camera position and target SHALL remain unchanged.

**Validates: Requirements 1.7**

---

### Property 3: State label collision invariant

*For any* camera configuration projecting state centroids to screen space, no two simultaneously visible State Labels SHALL have overlapping screen-space bounding boxes.

**Validates: Requirements 1.9, 1.10**

---

### Property 4: One marker per attraction

*For any* Attraction dataset of size N, the AttractionLayer SHALL render exactly N AttractionMarkers.

**Validates: Requirements 2.1**

---

### Property 5: Category colour mapping invariant

*For any* Attraction with a known primary category, the colour assigned to its AttractionMarker SHALL equal the value in the `categoryColors` lookup table for that category.

**Validates: Requirements 2.2**

---

### Property 6: Search results always match the query token

*For any* non-empty search query string Q and any result R returned by the search function, at least one of R's name, city, state, or district fields SHALL contain Q as a case-insensitive substring.

**Validates: Requirements 3.2**

---

### Property 7: Quick List filter correctness

*For any* combination of active state filter S, category filter C, and mood filter M, every Attraction displayed in the Quick List SHALL satisfy: its state equals S (if S is set), its category equals C (if C is set), and it includes at least one tag in M (if M is non-empty).

**Validates: Requirements 4.3, 4.4**

---

### Property 8: Mood tag set is exactly 10 elements

*For any* invocation of the Platform, the `MOOD_TAGS` constant SHALL contain exactly 10 distinct string values matching the specified set: {Relaxing, Adventure, Cultural, Nature, Family, Romantic, Spiritual, Food, Wildlife, Beach}.

**Validates: Requirements 5.1**

---

### Property 9: Mood filter dims non-matching markers

*For any* non-empty set of active mood tags M, every AttractionMarker whose Attraction has no tag in M SHALL have an opacity value less than 1.0; every AttractionMarker whose Attraction has at least one tag in M SHALL have opacity equal to 1.0.

**Validates: Requirements 5.2, 5.3**

---

### Property 10: Mood filter clear restores full brightness

*For any* mood filter state, clearing all active mood tags SHALL result in every AttractionMarker having opacity equal to 1.0.

**Validates: Requirements 5.4**

---

### Property 11: Surprise Me selects from the full dataset

*For any* activation of "Surprise Me", the selected Attraction SHALL be a member of the full Attraction dataset, and every Attraction in the dataset SHALL have a non-zero probability of being selected.

**Validates: Requirements 6.2**

---

### Property 12: Popular Attractions Panel ordering

*For any* Attraction dataset, the Popular Attractions Panel SHALL list Attractions in non-increasing order of `popularityScore`; no Attraction with a higher `popularityScore` SHALL appear after one with a lower `popularityScore`.

**Validates: Requirements 7.2**

---

### Property 13: Destination Card contains all required fields

*For any* Attraction A, rendering a Destination Card for A SHALL produce a component that contains A's name, city, state, description, at least one mood tag, and a hero image slot (either a resolved image or a placeholder).

**Validates: Requirements 8.1**

---

### Property 14: Favorite toggle is its own inverse

*For any* Attraction ID and any initial favorites set F, toggling the favorite action twice SHALL leave the favorites set unchanged: toggle(toggle(F, id), id) = F.

**Validates: Requirements 8.4, 13.2**

---

### Property 15: No cross-contamination of images

*For any* two distinct Attraction IDs A and B, the intersection of their Image Manifest source URL sets SHALL be empty.

**Validates: Requirements 8.6, 10.8**

---

### Property 16: Attraction page gallery contains ≥4 images

*For any* Attraction whose Image Manifest contains ≥4 valid image records, the rendered gallery on its Attraction Page SHALL display at least 4 images.

**Validates: Requirements 9.3**

---

### Property 17: Nearby destinations satisfies radius and count constraints

*For any* origin Attraction O and full Attraction dataset, `findNearby(O, dataset, 200, 5)` SHALL return at most 5 Attractions, each of which has a Haversine distance ≤200 km from O, and none of which is O itself.

**Validates: Requirements 9.6**

---

### Property 18: Attribution block present for every displayed image

*For any* Attraction Page rendering N images, the page SHALL contain exactly N AttributionBlock components, each with a non-empty author name, licence name, and source attribution URL.

**Validates: Requirements 9.7**

---

### Property 19: Relevance filter rejects non-matching images

*For any* image candidate whose combined title, description, and tags contain no token (length > 2, lowercased) matching any token from the Attraction's name, city, or state, the Relevance Filter SHALL discard that candidate.

**Validates: Requirements 10.3**

---

### Property 20: License validator rejects unlicensed images

*For any* image candidate whose licence identifier is not in the permitted set {CC-BY, CC-BY-SA, CC0, Unsplash License, Pexels License}, the License Validator SHALL reject that candidate, and the rejected candidate SHALL NOT appear in any Image Manifest.

**Validates: Requirements 10.4**

---

### Property 21: Image Manifest records contain all required fields

*For any* image record R in any Image Manifest, R SHALL contain non-empty values for: `sourceUrl`, `thumbnailUrl`, `authorName`, `licenseName`, and `attributionUrl`.

**Validates: Requirements 10.5**

---

### Property 22: insufficientImages flag is consistent with image count

*For any* Image Manifest M, `M.insufficientImages === (M.images.length < 4)`.

**Validates: Requirements 10.6**

---

### Property 23: Image Manifest cache idempotence

*For any* Attraction ID requested twice within a 24-hour window, the second response SHALL be identical to the first (same images array, same `cachedAt` timestamp).

**Validates: Requirements 10.7**

---

### Property 24: Trip Planner itinerary day count matches requested duration

*For any* Attraction A and duration D ∈ {2, 3, 4}, the itinerary generated by the Trip Planner SHALL contain exactly D `ItineraryDay` records.

**Validates: Requirements 11.1, 11.2**

---

### Property 25: Trip persistence round-trip

*For any* Trip T saved via `useTripPlanner`, calling `saveTrip` then reading `trips` from the hook SHALL return an array containing an object whose `attractionId`, `itinerary.days`, and `itinerary.profile` are equal to T's corresponding values.

**Validates: Requirements 11.4**

---

### Property 26: Budget Estimator input validation

*For any* BudgetInput where `days` is outside [1, 30] or `travellers` is outside [1, 20], the Budget Estimator SHALL return a validation error object and SHALL NOT compute a cost breakdown.

**Validates: Requirements 12.1, 12.7**

---

### Property 27: Transport cost varies with distance

*For any* two starting cities C1 and C2 with different Haversine distances to the same destination Attraction, the transport cost calculated for C1 SHALL differ from the transport cost for C2 (assuming equal traveller count).

**Validates: Requirements 12.3**

---

### Property 28: Currency conversion round-trip

*For any* INR amount X and exchange rate R > 0, converting X to a foreign currency then back to INR using the same rate R SHALL return a value within ±1 INR of X (rounding tolerance).

**Validates: Requirements 12.6**

---

### Property 29: Favorites localStorage round-trip

*For any* set of Attraction IDs F added to favorites, serialising F to localStorage and deserialising it in a fresh hook invocation SHALL produce a set equal to F.

**Validates: Requirements 13.1, 13.4**

---

### Property 30: Local Profile persistence round-trip

*For any* LocalProfile P (display name + mood defaults) saved via `useLocalProfile`, reading the profile back from localStorage SHALL return an object deep-equal to P.

**Validates: Requirements 14.2, 14.3**
