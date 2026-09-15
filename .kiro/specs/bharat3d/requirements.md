# Requirements Document

## Introduction

BHĀRAT3D is a cinematic, interactive India destination explorer and trip-planning platform built with Next.js App Router (TypeScript). It renders an immersive 3D map of India using React Three Fiber, three.js, and @react-three/drei, showing authoritative GeoJSON-based India and state boundaries. Users can discover attractions by mood, search, or random selection; view destination cards and detail pages with real, license-validated imagery; build multi-day itineraries; and estimate dynamic trip budgets — all persisted to localStorage without server-side auth.

---

## Glossary

- **Platform**: The BHĀRAT3D Next.js application as a whole.
- **3D Map**: The React Three Fiber WebGL canvas rendering India's geography.
- **GeoJSON Layer**: The authoritative India + state boundary data (Natural Earth / Datameet India) loaded into the 3D Map.
- **Attraction**: A named point of interest in India with associated metadata (id, name, city, state, category, mood tags, coordinates, description, highlights, insider tips, cost estimates, itineraries).
- **Attraction Marker**: An animated 3D glyph placed at an Attraction's geographic coordinates on the 3D Map.
- **State Label**: A 3D text overlay anchored to a state's centroid on the 3D Map.
- **Destination Card**: A UI card component that summarises an Attraction (photo, name, city, state, mood, actions).
- **Attraction Page**: The `/attraction/{id}` route that shows full Attraction detail.
- **Image Resolver**: The server-side pipeline (Next.js Route Handler) that fetches, filters, validates, and caches images for a given Attraction.
- **Image Manifest**: The structured list of resolved, license-validated image records for a single Attraction produced by the Image Resolver.
- **Image Source**: One of three external providers — Wikimedia Commons, Unsplash API, or Pexels API.
- **Mood Filter**: A set of ten predefined tags (Relaxing, Adventure, Cultural, Nature, Family, Romantic, Spiritual, Food, Wildlife, Beach) used to filter Attractions.
- **Quick List**: A searchable, filterable list of Attractions grouped by state, category, or mood.
- **Trip Planner**: The feature that generates 2-, 3-, or 4-day itineraries for an Attraction and traveller profile.
- **Budget Estimator**: The feature that calculates dynamic trip cost breakdowns using state-level cost-of-living data, starting city, number of days and travellers, accommodation preference, and travel style.
- **Favorites**: The set of Attraction IDs persisted in the browser's localStorage via the `useFavorites` hook.
- **Trip**: A planned itinerary object persisted in localStorage via the `useTripPlanner` hook.
- **useFavorites**: A React hook providing CRUD operations on Favorites.
- **useTripPlanner**: A React hook providing CRUD operations on Trips.
- **Local Profile**: A lightweight user display-name and preference record stored in localStorage.
- **Relevance Filter**: The step in the Image Resolver that scores and discards images whose metadata do not match the target Attraction.
- **License Validator**: The step in the Image Resolver that confirms each image carries a permitted licence (Creative Commons, Unsplash licence, or Pexels licence).
- **Attribution Block**: A visible UI element displaying the image author, licence, and source URL.
- **Surprise Me**: A Platform feature that selects a random Attraction and animates the 3D Map camera to its location.
- **Popular Attractions Panel**: A floating right-side panel on the homepage listing dynamically ranked Attractions.
- **Collision Prevention**: The 3D Map behaviour that repositions or hides State Labels to avoid visual overlap.
- **Cinematic Aesthetic**: The nighttime satellite visual style: dark background, glowing state borders, warm point-of-interest lights, bloom post-processing.

---

## Requirements

### Requirement 1 — 3D India Map Rendering

**User Story:** As a visitor, I want to see an immersive 3D map that shows only India with its state borders, so that I can visually explore destinations in geographic context.

#### Acceptance Criteria

1. THE 3D Map SHALL render India's national boundary and all state/union-territory boundaries using GeoJSON data sourced exclusively from Natural Earth or Datameet India.
2. THE 3D Map SHALL display a cinematic nighttime satellite aesthetic: dark (#0a0a1a or darker) background, glowing animated state border lines, and warm-coloured Attraction Marker lights.
3. THE 3D Map SHALL apply bloom post-processing to Attraction Markers and state border glow effects.
4. THE 3D Map SHALL restrict the rendered geography to India; no world globe, rotating Earth, or non-India landmass SHALL be rendered.
5. WHEN the user drags the pointer on the 3D Map canvas, THE 3D Map SHALL rotate or pan the camera in response to the pointer delta.
6. WHEN the user pinches or scrolls on the 3D Map canvas, THE 3D Map SHALL zoom the camera.
7. THE 3D Map SHALL NOT rotate automatically without user input.
8. THE 3D Map canvas SHALL NOT trap the page scroll; WHEN the user scrolls outside the canvas bounds, THE Platform SHALL propagate the scroll event to the page.
9. THE 3D Map SHALL render State Labels at each state's geographic centroid with Collision Prevention applied.
10. WHEN two or more State Labels would overlap at the current camera distance, THE 3D Map SHALL hide the lower-priority labels until overlap is resolved.

### Requirement 2 — Attraction Markers

**User Story:** As a visitor, I want to see glowing markers on the map for attractions, so that I can identify destinations by category at a glance.

#### Acceptance Criteria

1. THE 3D Map SHALL render one Attraction Marker per Attraction at the Attraction's geographic coordinates.
2. THE Attraction Marker SHALL use an accent colour that corresponds to the Attraction's primary category (one distinct colour per category).
3. THE Attraction Marker SHALL animate with a continuous pulse or glow cycle independent of user interaction.
4. WHEN the user clicks or taps an Attraction Marker, THE Platform SHALL open the Destination Card for that Attraction.
5. WHEN the user hovers an Attraction Marker (on pointer devices), THE 3D Map SHALL display the Attraction's name in a tooltip anchored to the Marker.

### Requirement 3 — Search

**User Story:** As a visitor, I want to search for attractions, cities, states, and districts, so that I can quickly navigate to a specific destination.

#### Acceptance Criteria

1. THE Platform SHALL provide a search input that accepts free-text queries.
2. WHEN the user types in the search input, THE Platform SHALL return matching results across Attraction names, city names, state names, and district names within 300 ms of the last keystroke.
3. WHEN the user selects a search result, THE Platform SHALL animate the 3D Map camera to the selected Attraction's or region's coordinates and open the corresponding Destination Card or region view.
4. IF the search query matches no Attractions or regions, THEN THE Platform SHALL display a "No results found" message and SHALL NOT display unrelated suggestions.

### Requirement 4 — Quick List

**User Story:** As a visitor, I want a browsable destination list filtered by state, category, and mood, so that I can discover attractions without using the map.

#### Acceptance Criteria

1. THE Quick List SHALL display all Attractions in a scrollable list.
2. THE Quick List SHALL provide filter controls for state, category, and Mood Filter tags.
3. WHEN the user applies one or more filters, THE Quick List SHALL show only Attractions matching all selected filter values simultaneously.
4. THE Quick List SHALL provide a text search input that narrows the displayed Attractions to those whose name, city, or state contains the query string.
5. WHEN no Attractions match the active filters and search query, THE Quick List SHALL display an empty-state message.

### Requirement 5 — Mood Filter

**User Story:** As a visitor, I want to filter destinations by mood, so that I can find attractions that match my travel intent.

#### Acceptance Criteria

1. THE Platform SHALL expose exactly ten Mood Filter tags: Relaxing, Adventure, Cultural, Nature, Family, Romantic, Spiritual, Food, Wildlife, and Beach.
2. WHEN the user selects one or more Mood Filter tags, THE Platform SHALL apply the filter to the Quick List and to the Attraction Markers visible on the 3D Map.
3. WHEN a Mood Filter is active, THE 3D Map SHALL dim Attraction Markers whose Attractions do not match the active mood tags.
4. WHEN the user clears all Mood Filter tags, THE 3D Map SHALL restore all Attraction Markers to full brightness.

### Requirement 6 — Surprise Me

**User Story:** As a visitor, I want a "Surprise Me" action that takes me to a random attraction, so that I can discover places I wouldn't have searched for.

#### Acceptance Criteria

1. THE Platform SHALL provide a "Surprise Me" control visible on the homepage.
2. WHEN the user activates "Surprise Me", THE Platform SHALL select one Attraction uniformly at random from the full Attraction dataset.
3. WHEN "Surprise Me" selects an Attraction, THE 3D Map SHALL animate the camera from its current position to the selected Attraction's coordinates using a smooth easing curve over no longer than 2 seconds.
4. WHEN the camera animation completes, THE Platform SHALL open the Destination Card for the selected Attraction.

### Requirement 7 — Popular Attractions Panel

**User Story:** As a visitor, I want to see a panel of popular attractions on the homepage, so that I can quickly start exploring well-known destinations.

#### Acceptance Criteria

1. THE Platform SHALL render the Popular Attractions Panel as a floating panel anchored to the right side of the homepage viewport.
2. THE Popular Attractions Panel SHALL list Attractions ranked by a dynamic popularity signal (derived from Attraction metadata such as visit frequency weight or editorial score) — not a hardcoded static list.
3. THE Popular Attractions Panel SHALL display each listed Attraction's name, primary photo, state, and primary mood tag.
4. WHEN the user clicks a listed Attraction in the Popular Attractions Panel, THE Platform SHALL animate the 3D Map camera to that Attraction and open its Destination Card.

### Requirement 8 — Destination Cards

**User Story:** As a visitor, I want destination cards with real photos and key info, so that I can quickly evaluate whether an attraction interests me.

#### Acceptance Criteria

1. THE Destination Card SHALL display the Attraction's name, city, state, one-sentence description, primary mood tag, and one hero image resolved by the Image Resolver.
2. THE Destination Card SHALL provide an "Explore" action that navigates to the Attraction Page.
3. THE Destination Card SHALL provide a "Plan Trip" action that opens the Trip Planner pre-populated with the Attraction.
4. THE Destination Card SHALL provide a "Favorite" toggle that adds or removes the Attraction from Favorites via the `useFavorites` hook.
5. WHEN the Image Resolver has not yet returned an image, THE Destination Card SHALL display a loading skeleton in place of the hero image.
6. IF the Image Resolver returns no valid image for the Attraction, THEN THE Destination Card SHALL display an "Image currently unavailable" placeholder and SHALL NOT display an image from a different Attraction.

### Requirement 9 — Attraction Pages

**User Story:** As a visitor, I want a dedicated page for each attraction with rich media and planning tools, so that I can get everything I need to decide and plan a visit.

#### Acceptance Criteria

1. THE Platform SHALL serve each Attraction at the route `/attraction/{id}`, where `{id}` is the Attraction's unique identifier.
2. THE Attraction Page SHALL display a full-width hero media section using the Attraction's primary resolved image.
3. THE Attraction Page SHALL display an image gallery of at least four images resolved by the Image Resolver for that Attraction.
4. THE Attraction Page SHALL display the Attraction's highlights, insider tips, and at least one suggested itinerary.
5. THE Attraction Page SHALL display a cost estimate section populated by the Budget Estimator for a default profile (2 adults, 2 days, mid-range accommodation, standard travel style, nearest major city as origin).
6. THE Attraction Page SHALL display a nearby destinations section listing up to five Attractions within a configurable radius (default 200 km).
7. THE Attraction Page SHALL display an Attribution Block for every image shown.
8. WHEN the Attraction Page is visited for an `{id}` that does not exist in the Attraction dataset, THE Platform SHALL return an HTTP 404 response and render a "Not Found" page.

### Requirement 10 — Image Resolver Pipeline

**User Story:** As a developer, I want a server-side image resolution pipeline, so that the frontend always displays geographically accurate, properly licensed images without hardcoded URLs.

#### Acceptance Criteria

1. THE Image Resolver SHALL be implemented as a Next.js Route Handler (server-side only) and SHALL NOT expose API keys to the client.
2. WHEN an image request is received for an Attraction ID, THE Image Resolver SHALL query Wikimedia Commons, Unsplash API, and Pexels API in parallel using the Attraction's name and location as search terms.
3. THE Relevance Filter SHALL discard candidate images whose title, description, or tags do not contain at least one token matching the Attraction's name, city, or state.
4. THE License Validator SHALL discard candidate images that do not carry a Creative Commons licence (Wikimedia Commons), an Unsplash licence, or a Pexels licence.
5. THE Image Resolver SHALL return an Image Manifest containing at minimum four distinct image records for each Attraction, each record including: source URL, thumbnail URL, author name, licence name, and source attribution URL.
6. IF the Image Resolver cannot assemble four valid images after querying all three Image Sources, THEN THE Image Resolver SHALL return an Image Manifest with however many valid images were found (including zero) and SHALL include an `insufficientImages: true` flag.
7. THE Image Resolver SHALL cache each Image Manifest server-side for a minimum of 24 hours and SHALL serve the cached manifest on subsequent requests for the same Attraction ID.
8. THE Image Resolver SHALL ensure that no image record in one Attraction's Image Manifest is duplicated in another Attraction's Image Manifest (no cross-contamination).

### Requirement 11 — Trip Planner

**User Story:** As a visitor, I want to build a trip itinerary for an attraction, so that I can plan my visit day by day.

#### Acceptance Criteria

1. THE Trip Planner SHALL support itinerary durations of 2, 3, or 4 days.
2. THE Trip Planner SHALL support traveller profiles of Solo or Family.
3. WHEN the user selects an Attraction, a duration, and a traveller profile, THE Trip Planner SHALL generate a day-by-day itinerary specific to that Attraction and its nearby Attractions.
4. THE Trip Planner SHALL persist each saved itinerary to localStorage via the `useTripPlanner` hook.
5. THE Platform SHALL provide a Trip Planner management view where the user can view, edit, and delete saved Trips.
6. THE Trip Planner SHALL NOT generate generic or destination-agnostic itineraries; each itinerary SHALL reference specific named places, activities, or experiences associated with the selected Attraction.

### Requirement 12 — Dynamic Budget Estimator

**User Story:** As a visitor, I want a dynamic budget estimate for my trip, so that I can understand the likely actual costs before booking.

#### Acceptance Criteria

1. THE Budget Estimator SHALL accept the following inputs: starting city, number of days (1–30), number of travellers (1–20), accommodation preference (Budget / Mid-range / Luxury), and travel style (Backpacker / Standard / Premium).
2. THE Budget Estimator SHALL calculate cost components — transport, accommodation, food, activities, and miscellaneous — using state-level cost-of-living data specific to the destination's state.
3. THE Budget Estimator SHALL compute transport cost based on the distance and mode between the starting city and the destination, not a static percentage of total spend.
4. THE Budget Estimator SHALL NOT use static universal percentage allocations for any cost component.
5. THE Budget Estimator SHALL NOT display fabricated or hardcoded price values; all displayed values SHALL be derived from the cost-of-living dataset or a defined calculation formula applied to that dataset.
6. THE Budget Estimator SHALL present costs in Indian Rupees (INR) and MAY offer a currency toggle to USD or EUR using a live or periodically refreshed exchange rate.
7. WHEN any required input is missing or out of range, THE Budget Estimator SHALL display a validation message specific to the invalid field and SHALL NOT compute a result.

### Requirement 13 — Favorites

**User Story:** As a visitor, I want to save and revisit my favorite attractions, so that I can keep track of places I'm interested in.

#### Acceptance Criteria

1. THE `useFavorites` hook SHALL store Attraction IDs in the browser's localStorage under a stable key.
2. WHEN the user toggles the Favorite action on a Destination Card or Attraction Page, THE `useFavorites` hook SHALL add the Attraction ID to Favorites if it is not already present, or remove it if it is.
3. THE Platform SHALL provide a Favorites view listing all favorited Attractions as Destination Cards.
4. WHEN the Platform is loaded in a new session, THE `useFavorites` hook SHALL restore the Favorites list from localStorage.
5. IF localStorage is unavailable, THEN THE `useFavorites` hook SHALL operate in-memory for the session and SHALL display a notice that Favorites will not be persisted.

### Requirement 14 — Local Profile (Account)

**User Story:** As a visitor, I want a lightweight local profile, so that I can personalise my experience without creating a server-side account.

#### Acceptance Criteria

1. THE Platform SHALL provide an Account page where the user can enter and save a display name and select preferred Mood Filter defaults.
2. THE Platform SHALL persist the Local Profile to localStorage.
3. WHEN the Platform loads, THE Platform SHALL read the Local Profile from localStorage and apply the saved Mood Filter defaults to the initial filter state.
4. IF localStorage is unavailable, THEN THE Platform SHALL operate with an anonymous profile and SHALL display a notice that profile data will not be persisted.

### Requirement 15 — Homepage Layout and Navigation

**User Story:** As a visitor, I want a homepage that combines the 3D map with discovery tools and scrolls normally, so that I can navigate the page without being trapped in the map.

#### Acceptance Criteria

1. THE Platform homepage SHALL contain the 3D Map, the Popular Attractions Panel, the Mood Filter, the Surprise Me control, and a navigation bar in a single page layout.
2. THE Platform homepage SHALL scroll normally using the browser's native scroll behaviour; the 3D Map SHALL NOT intercept scroll events originating outside the canvas element.
3. THE Platform SHALL provide a top navigation bar containing links to Quick List, Trip Planner, Favorites, and Account.
4. THE Platform navigation bar SHALL remain accessible (WCAG 2.1 AA keyboard-navigable and screen-reader labelled) on all routes.

### Requirement 16 — Performance and Accessibility Baseline

**User Story:** As a visitor, I want the platform to load quickly and work with assistive technologies, so that the experience is inclusive and responsive.

#### Acceptance Criteria

1. THE Platform SHALL achieve a Largest Contentful Paint (LCP) of 4 seconds or less on a simulated 4G connection for the homepage route.
2. THE Platform SHALL implement Next.js Image Optimization (`next/image`) for all raster images served outside the WebGL canvas.
3. THE 3D Map SHALL display a loading indicator while the GeoJSON Layer and WebGL context are initialising.
4. THE Platform SHALL provide text alternatives (aria-label or visible label) for all interactive controls outside the 3D Map canvas.
5. THE Platform SHALL use semantic HTML elements (nav, main, section, article, button) for all non-canvas UI.
6. WHEN the user's device does not support WebGL, THE Platform SHALL display a static fallback map image of India and SHALL NOT render a broken or empty canvas.
