# Implementation Plan: BHĀRAT3D

> **STATUS: COMPLETE** — All tasks implemented and verified.
> Tests: 100 passing · TypeScript: 0 errors · `next build`: ✅ 84 static pages

## Completed Tasks

- [x] 1. Project scaffold (Next.js 14, TypeScript strict, Tailwind, ESLint, Prettier, Vitest)
- [x] 2. Core type definitions (`src/types/` — attraction, image, budget, trip, profile)
- [x] 3. Static data layer (moodTags, categoryColors, costOfLiving, cities, attractions ×84)
- [x] 4. Utility functions (geo, collision, currency) + property tests (Properties 1, 3, 17, 28)
- [x] 5. Checkpoint — all types, data, utilities compile and tests pass
- [x] 6. Zustand global stores (mapStore, filterStore, uiStore)
- [x] 7. localStorage hooks (useFavorites, useTripPlanner, useLocalProfile) + tests (14, 25, 29, 30)
- [x] 8. Services (popularityRanker, itineraryGenerator, searchAttractions, budgetCalculator) + tests
- [x] 9. Budget calculator + property tests (Properties 26, 27)
- [x] 10. Checkpoint — all services and hooks compile and tests pass
- [x] 11. Image Resolver pipeline (relevanceFilter, licenseValidator, wikimedia, unsplash, pexels, index) + API routes + tests (Properties 19, 20, 21, 22)
- [x] 12. Reusable UI (NavBar, AttributionBlock, ImageWithFallback, SkeletonCard, WebGLFallback, DestinationCardOverlay, AnimatedSection, PageTransition, MapHero)
- [x] 13. 3D India Map — GeoJSON layer (india-states.geojson, StateLayer, StateLabelLayer) + test (Property 1)
- [x] 14. 3D India Map — markers, controls, canvas (AttractionMarker, AttractionLayer, MapControls, IndiaMap) + tests (Properties 2, 4, 5, 9, 10)
- [x] 15. Checkpoint — 3D map renders with GeoJSON, markers, labels, bloom
- [x] 16. Discovery components (MoodFilter, Search, SurpriseMe, QuickList) + tests (Properties 6, 7, 11)
- [x] 17. Destination Cards and Popular Attractions Panel (DestinationCard with framer-motion, PopularAttractions with slide animation) + tests (Property 12, 13)
- [x] 18. Checkpoint — discovery UI works end-to-end with 3D map
- [x] 19. Attraction detail pages (Gallery, Highlights, NearbyDestinations, ItineraryTabs, page, not-found)
- [x] 20. Planning components (Planner, Itinerary, BudgetEstimator, trip-planner page)
- [x] 21. Favorites and Account pages
- [x] 22. Homepage layout and routing (MapHero client component, AnimatedSection, full page.tsx)
- [x] 23. Responsive design (mobile navbar with hamburger, responsive grids, touch-friendly controls)
- [x] 24. Accessibility (skip-to-content link, aria-labels, focus rings, semantic HTML throughout)
- [x] 25. Data validation scripts (validateAttractions.ts, validateBudgetData.ts)
- [x] 26. Performance (dynamic import with ssr:false, GeoJSON simplified to ~1.5 MB, CSS animations)
- [x] 27. Final checkpoint — 100 tests pass, 0 TS errors, next build succeeds
