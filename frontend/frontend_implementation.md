# PMIP Frontend Design and Implementation Decisions

## 1. Overview

The frontend of the Public Music Intelligence Platform (PMIP) was developed as a React application using Vite.

The purpose of the frontend is to provide a public-facing dashboard where users can explore artist, track, release, geographic, market and intelligence data produced by the PMIP backend.

The frontend communicates with the Node.js and Express backend through REST API endpoints and presents the returned data using reusable React components, summary cards and analytical visualisations.

The frontend was developed using a functionality-first approach. The main focus during this stage was to make sure the application could retrieve, display and explain PMIP intelligence correctly before carrying out the final UI/UX design and visual-polish phase.


## 2. Frontend Technology Stack

The main frontend technologies used are:

- React
- Vite
- React Router
- Recharts
- Native JavaScript Fetch API
- CSS

### React

React was used to build the frontend because it supports reusable components and makes it easier to manage interface data that changes when users search, select releases or load intelligence results.

React state is used throughout the dashboard to manage data such as search results, selected releases, loading states, error messages and returned intelligence results.

### Vite

Vite was used as the frontend development environment because it provides a lightweight and fast setup for React development.

It supports fast local development, automatic browser refresh during code changes and environment variables used to configure the PMIP backend API address.

The frontend currently reads the backend URL using:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### React Router

React Router was used to manage navigation between the different dashboard pages.

It allows the application to move between pages without performing a full browser reload.

React Router is also used for dynamic routes such as individual artist profile pages.

For example:

```text
/artists/2
```

loads the artist profile associated with PMIP artist ID `2`.

### Recharts

Recharts was selected for analytical visualisations because it integrates directly with React and provides components for:

- line charts
- bar charts
- Cartesian grids
- axes
- legends
- tooltips
- responsive containers

Recharts also allowed the frontend to create visualisations without introducing another separate charting framework.

### Fetch API

The native JavaScript Fetch API was used to communicate with the PMIP backend.

An additional HTTP library such as Axios was not required for the current frontend requirements.

The Fetch API is wrapped inside dedicated frontend service functions so that API communication is kept separate from page-rendering logic.

### CSS

CSS is currently used for the shared dashboard layout and functional responsive behaviour.

The current stylesheet provides:

- page-width control
- navigation layout
- responsive page spacing
- responsive typography
- mobile form behaviour
- basic input and button layout
- content wrapping
- tablet and mobile breakpoints

The final visual design, branding and wider UI/UX styling will be completed during a later dedicated UI/UX phase.


## 3. Frontend Architecture

The frontend is organised into several main areas.

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── intelligence/
│   │   ├── layout/
│   │   ├── releases/
│   │   └── tracks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

Each part of the structure has a specific responsibility.

### `src/components/`

The `components` directory contains reusable React components.

The components are divided into smaller groups according to their purpose.

#### `common/`

Contains shared components used across multiple pages.

Examples include:

```text
ContentSection.jsx
PageHeader.jsx
SummaryCard.jsx
```

These components help keep repeated page structures consistent.

#### `layout/`

Contains application-level layout components.

Examples include:

```text
AppLayout.jsx
Navbar.jsx
PageContainer.jsx
```

These components control the overall structure of the dashboard and shared navigation.

#### `intelligence/`

Contains components related to PMIP intelligence features and intelligence visualisations.

Examples include:

```text
MomentumScoreChart.jsx
ForecastComparisonChart.jsx
TrackAnomalyChart.jsx
ArtistAnomalyChart.jsx
CountryGeographicSection.jsx
CountryGeographicChart.jsx
CountryMarketGrowthSection.jsx
CountryMarketGrowthChart.jsx
ArtistGeographicSection.jsx
ArtistMarketGrowthSection.jsx
MarketMovementsSection.jsx
```

Separating these components prevents the main Intelligence page from containing all intelligence logic directly.

#### `tracks/`

Contains visualisation components related to historical track performance.

Examples include:

```text
StreamingTrendChart.jsx
ChartPositionTrendChart.jsx
```

#### `releases/`

Contains release-specific components.

For example:

```text
ReleasePerformanceChart.jsx
```

This chart compares performance scores across tracks belonging to the selected release.

### `src/pages/`

The `pages` directory contains the main user-facing dashboard pages.

Examples include:

```text
HomePage.jsx
ArtistPage.jsx
ArtistDetailsPage.jsx
TracksPage.jsx
ReleasePage.jsx
CountriesPage.jsx
IntelligencePage.jsx
NotFoundPage.jsx
```

Each page represents a major area of the public dashboard.

### `src/routes/`

The `routes` directory contains route configuration for the React application.

The main routing file is responsible for connecting URLs to page components.

### `src/services/`

The `services` directory contains functions that communicate with the PMIP backend API.

Examples include:

```text
artistService.js
streamingService.js
releaseService.js
intelligenceService.js
```

Keeping API requests inside service files prevents backend communication logic from being mixed directly into React page components.

For example:

```text
ArtistPage
    ↓
artistService
    ↓
PMIP REST API
    ↓
Node/Express backend
```

### `src/styles/`

The `styles` directory contains shared frontend CSS.

The current `global.css` file is responsible for the general dashboard layout and functional responsive behaviour.

### `App.jsx`

`App.jsx` acts as one of the top-level React components for the frontend application.

### `main.jsx`

`main.jsx` is the frontend entry point.

It starts the React application and attaches it to the root HTML element provided by Vite.


## 4. Pages

The main PMIP frontend pages currently include:

- Home
- Artists
- Artist Details
- Tracks
- Releases
- Countries
- Intelligence
- Not Found

### Home

The Home page acts as the main entry point to the public dashboard.

It provides the starting location for users accessing PMIP.

### Artists

The Artists page allows users to search for artists stored in PMIP.

The page includes:

- artist-name search input
- search loading state
- empty-input validation
- no-result handling
- backend error handling
- returned artist links

Search results link directly to individual artist profile pages.

For example:

```text
/artists/2
```

opens the profile associated with artist ID `2`.

### Artist Details

The Artist Details page displays information for one selected artist.

It currently includes:

- artist name
- artist ID
- associated track count
- associated tracks
- momentum intelligence
- growth intelligence

Momentum and growth information are treated as optional intelligence because not every artist necessarily has a result available.

The page separates essential artist data from optional intelligence.

This means that if momentum or growth intelligence is unavailable, the main artist profile can still be displayed.

### Tracks

The Tracks page allows users to explore historical track performance using:

- track ID
- country ID

The page currently displays:

- historical streaming observations
- historical chart positions
- streaming trend visualisation
- chart-position trend visualisation

The frontend sorts historical records from oldest to newest before displaying them.

The page also handles:

- invalid IDs
- loading states
- empty streaming results
- empty chart-performance results
- backend/API connection errors

### Releases

The Releases page allows users to browse releases and select one for further analysis.

It currently displays:

- release title
- release ID
- release date
- release type
- associated track count
- related tracks
- track ISRC values
- release-performance intelligence
- release-performance visualisation
- human-review information

Release-performance intelligence is loaded separately from the essential release information.

This means that the release and its tracks can still be shown if release-performance intelligence is unavailable.

### Countries

The Countries page currently provides the route and page structure for geographic and market-focused exploration.

The main country geographic and market-growth intelligence components are currently displayed through the Intelligence page.

The Countries page can be expanded later if PMIP introduces a dedicated country exploration workflow.

### Intelligence

The Intelligence page provides access to several PMIP analytical areas.

These currently include:

- artist momentum intelligence
- track forecasting intelligence
- track anomaly intelligence
- artist anomaly summaries
- country geographic intelligence
- country market growth
- artist geographic intelligence
- artist market growth
- market movements

Each area has its own data-loading behaviour and displays either:

- successful intelligence results
- loading feedback
- empty results
- unavailable intelligence
- API errors

Several intelligence areas also include visualisations.

### Not Found

The Not Found page is displayed when a user navigates to a route that does not exist.

This prevents unsupported URLs from resulting in a blank or broken application page.

For example:

```text
/this-page-does-not-exist
```

is handled by the fallback route and displays the Not Found page.


## 5. Routing

React Router is used to control navigation across the PMIP frontend.

The main routes include:

```text
/
/artists
/artists/:artistId
/tracks
/releases
/countries
/intelligence
```

### Static Routes

Several dashboard pages use fixed routes.

These include:

```text
/
/artists
/tracks
/releases
/countries
/intelligence
```

Each route loads the corresponding React page component.

For example:

```text
/artists
```

loads the Artists page.

```text
/tracks
```

loads the Tracks page.

```text
/releases
```

loads the Releases page.

```text
/intelligence
```

loads the Intelligence page.

### Dynamic Artist Route

Individual artist profiles use the dynamic route:

```text
/artists/:artistId
```

The `artistId` part of the URL changes depending on the selected artist.

The value is read inside the Artist Details page using React Router's `useParams()` hook.

For example:

```text
/artists/2
```

loads the artist with PMIP artist ID `2`.

A different URL such as:

```text
/artists/37
```

loads artist ID `37`.

This makes artist pages directly accessible through unique URLs.

### Navigation

The main navigation bar uses React Router's `NavLink` component.

The navigation currently provides links to:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

`NavLink` also allows the active route to be identified so the currently selected navigation item can be visually distinguished.

### Not Found Route

A fallback route is included for URLs that do not match any supported PMIP page.

The route pattern is:

```text
*
```

This loads the `NotFoundPage`.

The fallback route ensures that invalid URLs do not crash the application or leave the user with an empty page.

### Routing Design Decision

The routing structure was kept simple because the current PMIP dashboard contains a relatively small number of major public pages.

The current structure supports both:

```text
General dashboard areas
→ /artists
→ /tracks
→ /releases
→ /intelligence

Individual resources
→ /artists/:artistId
```

This provides a straightforward foundation that can later be extended with additional routes such as individual track, release or country detail pages if required.

## 6. Reusable Components

Reusable React components were created to reduce duplicated frontend code and keep the dashboard structure consistent.

The frontend currently separates reusable components into several categories.

### Common Components

Shared interface components are stored inside:

```text
src/components/common/
```

Examples include:

```text
ContentSection.jsx
PageHeader.jsx
SummaryCard.jsx
```

#### `ContentSection`

`ContentSection` is used to group related content under a section heading.

It accepts:

```text
title
children
```

This allows different pages to use the same structural pattern without repeating the same section markup.

#### `PageHeader`

`PageHeader` is used for the main heading and description at the top of dashboard pages.

This keeps page headings consistent across areas such as:

```text
Artists
Tracks
Releases
Countries
Intelligence
```

#### `SummaryCard`

`SummaryCard` is used to present important analytical values.

Examples include:

```text
Momentum Score
Momentum Category
Growth Score
Anomaly Rate
Release Rank
Streaming Performance Score
```

The component helps keep repeated metric displays structurally consistent.


### Layout Components

Layout components are stored inside:

```text
src/components/layout/
```

Examples include:

```text
AppLayout.jsx
Navbar.jsx
PageContainer.jsx
```

#### `AppLayout`

`AppLayout` provides the shared application structure around the main dashboard content.

#### `Navbar`

`Navbar` contains the primary PMIP navigation links.

The current links include:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

React Router's `NavLink` component is used so the active page can be identified.

#### `PageContainer`

`PageContainer` provides the shared width and spacing structure used around page content.


### Intelligence Components

Intelligence-specific components are stored inside:

```text
src/components/intelligence/
```

Examples include:

```text
CountryGeographicSection.jsx
CountryMarketGrowthSection.jsx
ArtistGeographicSection.jsx
ArtistMarketGrowthSection.jsx
MarketMovementsSection.jsx
MomentumScoreChart.jsx
ForecastComparisonChart.jsx
TrackAnomalyChart.jsx
ArtistAnomalyChart.jsx
CountryGeographicChart.jsx
CountryMarketGrowthChart.jsx
```

The larger Intelligence page was separated into smaller components where practical so that one page file does not contain every intelligence feature directly.

This makes the frontend easier to maintain and allows individual intelligence areas to manage their own:

```text
loading states
error states
empty states
data display
visualisations
```


### Track Components

Track visualisation components are stored inside:

```text
src/components/tracks/
```

Examples include:

```text
StreamingTrendChart.jsx
ChartPositionTrendChart.jsx
```

These components receive already-loaded data through React props and focus only on presenting the visualisation.


### Release Components

Release-specific components are stored inside:

```text
src/components/releases/
```

The main current example is:

```text
ReleasePerformanceChart.jsx
```

This component receives the selected release's performance array and visually compares the tracks connected to the release.


### Component Design Decision

The frontend uses smaller reusable components where functionality is likely to be shared or where separating logic makes larger pages easier to understand.

The general pattern is:

```text
Page
→ loads or coordinates data

Section component
→ manages one analytical area

Chart component
→ visualises prepared data

Common component
→ provides repeated interface structure
```

This creates a clearer separation of responsibilities across the frontend.


## 7. API Integration

The frontend communicates with the PMIP backend through REST API endpoints.

API communication is separated into service files located inside:

```text
src/services/
```

The main service files currently include:

```text
artistService.js
streamingService.js
releaseService.js
intelligenceService.js
```

This keeps network requests separate from React page-rendering code.


### API Base URL

The backend address is configured using a Vite environment variable:

```env
VITE_API_BASE_URL=http://localhost:3000
```

The service files read the value using:

```js
import.meta.env.VITE_API_BASE_URL
```

During local development, a fallback is also available:

```text
http://localhost:3000
```

This provides a predictable backend location when the environment variable is not available.


### Artist API Integration

`artistService.js` handles artist-related requests.

Examples include:

```text
GET /api/artists/search
GET /api/artists/:artistId
GET /api/artists/:artistId/tracks
```

Frontend functions include:

```text
searchArtists()
getArtistById()
getArtistTracks()
```

These functions are used by the Artists and Artist Details pages.


### Streaming API Integration

`streamingService.js` handles historical track-performance requests.

The main endpoints include:

```text
GET /api/streaming
GET /api/streaming/chart-performance
```

The frontend sends values such as:

```text
trackId
countryId
page
limit
```

The returned data is used by the Tracks page and historical chart components.


### Release API Integration

`releaseService.js` handles release-related API requests.

The current frontend uses endpoints including:

```text
GET /api/releases
GET /api/releases/:releaseId
GET /api/releases/:releaseId/tracks
GET /api/releases/:releaseId/performance
```

Frontend service functions include:

```text
getReleases()
getReleaseById()
getReleaseTracks()
getReleasePerformance()
```


### Intelligence API Integration

`intelligenceService.js` handles the main PMIP analytical endpoints.

These include:

```text
GET /api/intelligence/momentum/artists/:artistId

GET /api/intelligence/growth/artists/:artistId

GET /api/intelligence/forecasting/tracks/:trackId

GET /api/intelligence/anomalies/tracks
GET /api/intelligence/anomalies/artists

GET /api/intelligence/geographic/countries
GET /api/intelligence/geographic/artists

GET /api/intelligence/markets/countries
GET /api/intelligence/markets/artists
GET /api/intelligence/markets/movements
```

Keeping these requests in one intelligence service provides a central place for frontend analytical API communication.


### API Integration Design Decision

The service-layer pattern was chosen so that React components do not need to know the full details of HTTP requests.

For example:

```text
IntelligencePage
      ↓
getArtistMomentum()
      ↓
intelligenceService.js
      ↓
PMIP backend API
```

This improves maintainability because backend endpoint changes can normally be handled inside the service layer instead of being repeated across multiple pages.


## 8. Shared API Error Handling

A shared `requestJson` pattern was introduced into the main frontend service files.

The purpose of this helper is to handle API responses consistently.

The general request flow is:

```text
fetch request
      ↓
attempt JSON parsing
      ↓
check HTTP response status
      ↓
return successful result
or
throw readable error
```


### Successful Requests

If the backend returns a successful response, the parsed JSON result is returned to the requesting page or component.


### Backend Validation and Resource Errors

If the backend returns an error response such as:

```text
400
404
500
```

the frontend attempts to display the message returned by the backend.

For example:

```text
The requested artist could not be found.
```

This allows the frontend to preserve useful backend validation and resource messages.


### Fallback Error Messages

If the backend does not provide a useful message, each service request has a fallback message.

Examples include:

```text
Unable to search for artists.
Unable to load artist momentum.
Unable to load streaming history.
Unable to load release performance.
```


### Non-JSON Responses

The request helper does not assume that every response will always contain valid JSON.

JSON parsing is therefore handled separately.

If parsing fails, the frontend can still use the fallback error message instead of crashing while attempting to read the response body.


### Backend Connection Failure

If the frontend cannot connect to the backend at all, the service layer provides the user-facing message:

```text
Unable to connect to the PMIP backend. Please try again.
```

This is more useful than exposing a low-level browser message such as:

```text
Failed to fetch
```


### Error Handling Design Decision

The main reason for centralising API error handling was consistency.

Without a shared pattern, different pages could display different technical errors for the same underlying problem.

The current approach means that:

```text
artist requests
streaming requests
release requests
intelligence requests
```

all follow the same general failure behaviour.

The current error text is functional rather than visually polished.

A later UI/UX phase can improve the presentation using designed error states, icons, retry controls or additional guidance.


## 9. Loading and Empty States

The frontend explicitly handles both loading states and successful requests that return no data.

These states are treated differently because an empty result is not the same as an API error.


### Loading States

Loading states are shown while asynchronous requests are running.

Examples currently include:

```text
Loading artist profile...
Searching for artists...
Loading streaming and chart-performance data...
Loading artist momentum intelligence...
Loading track forecasting intelligence...
Loading track anomaly intelligence...
Loading artist anomaly intelligence...
Loading releases...
Loading release information...
Loading release-performance intelligence...
```

Buttons are disabled while their related request is running where appropriate.

For example:

```text
Load Momentum
```

temporarily becomes:

```text
Loading...
```

while the request is processing.


### Artist Search Empty State

Before an artist search is performed, the page displays:

```text
Search results will appear here.
```

If a valid search returns no results, the frontend displays a message explaining that no artists were found for the searched name.


### Track Performance Empty States

The Tracks page separately handles empty streaming and chart-performance results.

Examples include:

```text
No streaming history was found for this track and country.
```

and:

```text
No chart-performance history was found for this track and country.
```

This allows one dataset to be unavailable without implying that the page itself failed.


### Release Empty States

The Releases page handles situations such as:

```text
No releases are currently available.
No tracks are associated with this release.
No release-performance intelligence is currently available for this release.
```


### Intelligence Empty States

Intelligence components also support empty data.

Examples include:

```text
No track anomalies were found.
No artist anomaly summaries were found.
No country geographic intelligence was found.
No country market-growth intelligence was found.
No market movement intelligence is available for the latest intelligence run.
```


### Market Movements

The Market Movements endpoint currently returns no rows for the latest intelligence run.

The frontend therefore displays a valid empty state instead of treating the result as an error.

This distinction is important because:

```text
successful API request + zero results
```

does not mean:

```text
backend failure
```


### Loading and Empty-State Design Decision

Loading and empty states were added during development so users are not left looking at blank sections while the application is working or when data does not exist.

The current states are functional.

Their final appearance and wording can be improved during the later UI/UX and content-polish phase.


## 10. Optional Intelligence Handling

Not every PMIP entity has intelligence available from every analytical model.

The frontend therefore distinguishes between:

```text
essential entity data
```

and:

```text
optional intelligence data
```


### Artist Profile Example

An artist can exist in the PMIP database even if momentum or growth intelligence is unavailable.

The Artist Details page therefore loads:

```text
artist profile
associated tracks
```

as essential information.

Momentum and growth intelligence are loaded separately.

If momentum intelligence is unavailable, the page can still display the artist and tracks.

The same applies to growth intelligence.


### Release Example

A release may exist and contain valid tracks even if release-performance intelligence is missing or temporarily unavailable.

For this reason, release information and tracks are loaded separately from release-performance intelligence.

The page structure follows the idea:

```text
Release details
      ↓
Related tracks
      ↓
Optional performance intelligence
```

If the optional intelligence request fails, the release itself does not disappear.


### Forecasting Example

A track can exist without having a forecasting result.

For example, the forecasting API may return an intelligence-not-found response for a valid track.

The frontend treats this as unavailable intelligence rather than assuming the whole track is invalid.


### Momentum Example

Similarly, an artist may have a valid PMIP profile but no current momentum result.

The dashboard displays the unavailable state for that intelligence area while preserving the rest of the artist information.


### Why This Separation Matters

Without this separation, one missing analytical result could cause an otherwise valid page to appear broken.

The chosen approach allows the dashboard to communicate:

```text
The resource exists.
This particular intelligence result is unavailable.
```

instead of incorrectly communicating:

```text
The whole resource failed.
```


### Optional Intelligence Design Decision

This pattern is important for PMIP because different intelligence models may have:

- different data coverage
- different latest run dates
- different matching success
- different evidence requirements

The frontend therefore does not assume that every artist, track or release must have every intelligence result available.

This creates a more reliable foundation for the public dashboard and allows additional intelligence models to be added later without requiring every entity to contain every possible analytical output.

## 11. Intelligence Features

The PMIP frontend includes several intelligence areas that present analytical outputs generated by the platform.

These features are primarily accessed through the Intelligence page.

The current intelligence areas include:

```text
artist momentum
track forecasting
track anomalies
artist anomaly summaries
country geographic intelligence
country market growth
artist geographic intelligence
artist market growth
market movements
```


### Artist Momentum Intelligence

Artist momentum is used to describe how strongly an artist is currently performing based on the signals analysed by PMIP.

The frontend currently displays:

```text
Momentum Score
Momentum Category
Momentum Rank
Main Contributing Signal
```

A momentum chart is also included to visualise the artist's score on a 0–100 scale.

The momentum result is loaded using the artist ID.

If momentum intelligence is unavailable for the selected artist, the frontend displays a clear unavailable state rather than treating the whole artist profile as invalid.


### Track Forecasting Intelligence

Track forecasting compares PMIP's predicted Spotify stream performance with the observed stream total for a track.

The frontend currently displays:

```text
Predicted Spotify Streams
Actual Spotify Streams
Prediction Difference
Forecast Review Status
```

A comparison chart is included so the predicted and actual values can be compared visually.

The frontend also provides a plain-language explanation of the forecast result.


### Track Anomaly Intelligence

Track anomaly intelligence identifies unusual streaming observations detected by the PMIP anomaly-detection model.

The frontend currently displays information such as:

```text
Anomaly Severity
Anomaly Direction
Streams
Chart Position
Anomaly Score Ratio
Observation Date
Country ID
```

A track anomaly chart compares anomaly score ratios across the loaded observations.

This provides a quicker way to identify which observations represent the strongest deviations from expected behaviour.


### Artist Anomaly Summary

Artist anomaly summaries combine multiple unusual observations into a higher-level view for each artist.

The frontend currently displays:

```text
Total Observations
Detected Anomalies
High-Priority Anomalies
Extreme Anomalies
Positive Anomalies
Negative Anomalies
Anomaly Rate
Artist Review Score
Latest Observation Date
```

An artist anomaly chart compares detected anomaly counts between the loaded artists.


### Country Geographic Intelligence

Country geographic intelligence provides market-level performance information.

Current outputs include:

```text
Total Streams
Median Streams
Mean Streams
Median Chart Position
Top 10 Rate
Top 50 Rate
Country Findings Index
Country Classification
```

A geographic-strength chart compares the country findings index across loaded markets.


### Country Market Growth

Country market-growth intelligence identifies markets that PMIP considers to have emerging or developing growth potential.

The frontend currently displays:

```text
Emerging Market Score
Emerging Market Class
```

A horizontal comparison chart is also included so loaded markets can be visually compared.


### Artist Geographic Intelligence

Artist geographic intelligence describes how an artist performs across different markets.

The frontend supports metrics such as:

```text
Markets Reached
International Reach Index
Market Penetration Index
Market Dependency
Geographic Profile
Diversification Index
Geographic Findings Index
Geographic Classification
```

Some records may represent source-only artist labels rather than fully matched canonical PMIP artists.

The frontend therefore supports fallback artist labels where necessary.


### Artist Market Growth

Artist market-growth intelligence describes growth activity for an artist within individual markets.

The frontend displays information such as:

```text
Artist
Market
Market Growth Score
Market Growth Class
```

The current implementation uses the artist name when available and falls back to the source artist label where a canonical artist match is not available.


### Market Movements

Market Movements is intended to display intelligence about:

```text
market entry
market expansion
market contraction
cross-market momentum
```

The latest current intelligence run contains no market-movement rows.

The frontend therefore displays a valid empty state rather than showing an error.


## 12. Data Visualisation

Recharts is used to visualise PMIP analytical data.

The current frontend contains several chart types selected according to the structure of the data being displayed.


### Historical Streaming Trend

The historical streaming chart is a line chart showing how a track's streaming activity changes across time.

The chart includes:

```text
Observation Date
Streams
Tooltip
Legend
```

The historical observations are sorted from oldest to newest before being visualised.


### Historical Chart Position

The historical chart-position chart displays how a track's ranking changes over time.

The Y-axis is reversed because:

```text
Chart Position 1
```

represents a stronger position than:

```text
Chart Position 100
```

This makes movement toward the top of the chart visually meaningful.


### Artist Momentum Chart

Artist momentum is displayed using a horizontal bar chart.

The chart uses a 0–100 scale and displays:

```text
Artist Name
Momentum Score
Legend
Tooltip
```

A bar chart was chosen because momentum is a single comparable score rather than a historical time series.


### Forecast Comparison Chart

Forecasting is visualised using a bar chart comparing:

```text
Predicted Spotify Streams
Actual Spotify Streams
```

Large stream totals are displayed using compact axis formatting.

For example:

```text
3,000,000,000
```

may appear approximately as:

```text
3B
```

on the axis.

The tooltip still displays the full value.


### Country Geographic Strength Chart

Country geographic performance is visualised using a horizontal bar chart.

The chart compares:

```text
Country
Country Findings Index
```

The findings index uses a 0–1 scale.

Horizontal bars provide enough space for country labels while making comparisons easy to read.


### Emerging Market Growth Chart

Country market growth is displayed using a horizontal bar chart.

The chart compares:

```text
Country
Emerging Market Score
```

The score is displayed on a 0–100 scale.


### Release Performance Chart

Release-performance intelligence is visualised by comparing the tracks belonging to the selected release.

The chart uses:

```text
Track Name
Composite Release Performance Score
```

This is particularly useful when a release contains multiple tracks with different performance outcomes.


### Track Anomaly Chart

Track anomaly strength is visualised using a horizontal bar chart.

The chart compares:

```text
Track
Anomaly Score Ratio
```

A higher anomaly score ratio represents a stronger deviation from the behaviour expected by the anomaly-detection model.


### Artist Anomaly Chart

Artist anomaly activity is visualised using a horizontal bar chart.

The chart compares:

```text
Artist
Detected Anomaly Count
```

This makes it easier to compare unusual activity across the loaded artist summaries.


## 13. Chart Design Decisions

The visualisation type is selected according to the type of information being presented.

### Line Charts

Line charts are used for historical time-series information.

Examples include:

```text
Streaming Performance Over Time
Chart Position Over Time
```

Line charts were chosen because the order of observations is important and the user needs to see how performance changes across time.


### Bar Charts

Bar charts are used when comparing separate values.

Examples include:

```text
Momentum Score
Predicted vs Actual Streams
Country Geographic Strength
Market Growth
Release Performance
Anomaly Activity
```

These values do not require a continuous time axis and are easier to compare using bars.


### Horizontal Bar Charts

Horizontal bar charts are used for many PMIP intelligence comparisons because category labels may contain:

```text
artist names
track names
country names
```

These labels can be long.

A horizontal layout gives more space for readable category names.


### Titles

Each major chart includes a descriptive title.

Examples include:

```text
Streaming Performance Over Time
Chart Position Over Time
Artist Momentum Score
Predicted vs Actual Spotify Streams
Country Geographic Strength
Emerging Market Growth Potential
Track Release Performance Comparison
Track Anomaly Strength
Artist Anomaly Activity
```


### Axis Labels

Charts include axis labels where relevant.

Examples include:

```text
Observation Date
Streams
Chart Position
Momentum Score
Spotify Streams
Country Findings Index
Emerging Market Score
Composite Release Performance Score
Anomaly Score Ratio
Detected Anomalies
```


### Legends

Legends are included to identify the values represented by chart bars or lines.

The legend placement was adjusted in some charts during development to avoid overlapping with axis labels.


### Tooltips

Tooltips provide exact values when the user interacts with chart elements.

This is particularly useful where axis values have been shortened for readability.


### Responsive Containers

Recharts `ResponsiveContainer` is used around visualisations.

This allows charts to adjust their width according to the space available inside the dashboard page.

This was an important part of the functional responsive implementation.


### Empty Chart Handling

Chart components check whether usable data exists before attempting to render.

If no data is available, the component displays a message rather than rendering an empty or broken chart.


## 14. Release Performance Intelligence

Release-performance intelligence required additional backend integration because the intelligence data existed in the database but was not initially exposed through a public backend route.


### Existing Database Table

The PMIP database contains:

```text
release_performance_intelligence
```

The table contains performance results including:

```text
release_performance_id
source_release_id
track_id
release_id
run_id
streaming_performance_score
chart_performance_score
geographic_reach_score
temporal_comparability_score
artist_release_relationship_score
unusual_performance_score
composite_release_performance_score
composite_release_performance_percentile
release_rank_position
release_performance_class
release_percentile_group
composite_weight_coverage_pct
composite_evidence_strength
release_priority_class
priority_signal_score
priority_signal_rank
high_priority_release_flag
priority_review_flag
unusual_performance_flag
human_review_required
human_review_trigger_count
human_review_priority
human_review_reason
calculated_at
```


### Multiple Performance Rows per Release

Testing showed that one release can contain multiple release-performance rows.

For example:

```text
Release 1
├── Track 1
└── Track 446
```

Each track has its own release-performance result.

Therefore, the frontend and backend do not assume:

```text
one release
=
one performance result
```

Instead, the design supports:

```text
one release
=
multiple track-level performance results
```


### Backend Endpoint

A new backend endpoint was added:

```text
GET /api/releases/:releaseId/performance
```

The implementation follows the existing PMIP backend architecture:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MySQL
```


### Repository Logic

The repository retrieves all release-performance rows belonging to the requested release from the latest intelligence run.

It also joins related:

```text
track information
release information
```

so the frontend receives useful names alongside IDs.


### API Response Structure

The endpoint returns:

```text
release
+
performance array
```

A simplified example is:

```json
{
  "status": "success",
  "data": {
    "release": {
      "release_id": 1,
      "release_title": "Million Dollar Baby - Single"
    },
    "performance": [
      {
        "track_id": 1,
        "track_name": "MILLION DOLLAR BABY",
        "composite_release_performance_score": "37.8461"
      },
      {
        "track_id": 446,
        "track_name": "Million Dollar Baby (Vhs)",
        "composite_release_performance_score": "13.0732"
      }
    ]
  }
}
```


### Frontend Release Page

The Releases page displays:

```text
Release Summary
Related Tracks
Release Performance Intelligence
Release Performance Chart
Human Review Information
```

The user can select a different release from the release dropdown.

When the selected release changes, the frontend reloads:

```text
release details
related tracks
performance intelligence
```


### Optional Release Intelligence

Release-performance intelligence is loaded separately from essential release information.

This means that if the intelligence request fails, the frontend can still display:

```text
release details
related tracks
```

without treating the whole page as broken.


## 15. Responsive Behaviour

The current responsive implementation focuses on functional usability rather than final visual design.

The main goal was to make sure the dashboard remains usable on:

```text
desktop
tablet
mobile
```


### Page Width

The main page container uses a maximum width while still allowing the content to shrink on smaller displays.

Desktop layouts can use a wider content area, while tablet and mobile layouts reduce the available width and page padding.


### Responsive Typography

Heading and paragraph sizes are reduced at smaller breakpoints.

This prevents large desktop typography from taking up excessive space on mobile screens.


### Navbar Behaviour

The navigation uses a flexible layout.

On larger screens, the PMIP brand and navigation links are displayed horizontally.

On smaller screens:

```text
navigation can wrap
```

and on narrow mobile widths:

```text
navigation can stack
```

The current solution is intentionally simple.

A more advanced mobile navigation experience may be considered during the final UI/UX phase.


### Forms

Inputs and selects are restricted to sensible widths on larger screens.

On mobile screens, form controls can use the full available width.

This applies to areas such as:

```text
artist search
track ID input
country ID input
momentum artist ID input
forecast track ID input
release selection
```


### Content Wrapping

Text wrapping rules were added to reduce horizontal overflow from:

```text
long headings
long artist names
long track names
technical intelligence values
```


### Responsive Charts

Charts use Recharts `ResponsiveContainer`.

This allows each chart to scale according to its parent container.

Charts were also given internal margins to reduce collisions between:

```text
axis labels
legends
category names
```


### Responsive Testing

The dashboard was manually checked at representative screen widths including approximately:

```text
Desktop: 1280px
Tablet: 768px
Mobile: 390px
```

The testing focused on functional issues such as:

```text
horizontal overflow
unusable navigation
form controls leaving the screen
chart overflow
text clipping
long labels
```


### Responsive Design Decision

The current responsive work is intentionally limited to making the application function correctly at different screen sizes.

Final decisions about areas such as:

```text
mobile menu design
card layouts
touch-target sizes
mobile chart presentation
spacing system
visual hierarchy
```

are deferred to the later dedicated UI/UX phase.


## 16. UI/UX Scope and Deferred Visual Design

The PMIP frontend was developed using a functionality-first approach.

The current interface is intended to prove that:

```text
navigation works
API requests work
intelligence can be displayed
charts render correctly
error states work
responsive behaviour works
```

The current interface is not intended to represent the final visual identity of PMIP.


### Why UI/UX Was Deferred

Completing the main functionality first reduces the risk of spending significant time designing interface elements that later need to change because the underlying feature set changes.

Once the functional frontend is stable, the final UI/UX phase can be designed around the real structure of the finished application.


### Areas Deferred to UI/UX

The later UI/UX phase is expected to review:

```text
visual identity
colour palette
typography
spacing
card design
button design
input design
navigation design
mobile navigation
dashboard hierarchy
icons
loading states
empty states
error states
validation messages
chart presentation
tooltips
accessibility
interaction feedback
```


### Human-Friendly Intelligence Explanations

Several intelligence sections currently include headings such as:

```text
What does this mean?
```

or:

```text
How to Read This Intelligence
```

These explanations are functional but some wording remains technical.

For example, phrases such as:

```text
composite evidence strength
temporal comparability score
anomaly score ratio
latest intelligence run
```

may require more natural explanations for public users.

The later content and UI/UX phase should rewrite these explanations using clearer and more human-friendly language while preserving analytical accuracy.


### Error Presentation

Current API errors are displayed primarily as readable text.

For example:

```text
Unable to connect to the PMIP backend. Please try again.
```

This is functionally correct.

The UI/UX phase may later replace plain-text errors with designed components containing:

```text
clear visual hierarchy
icons
retry controls
helpful recovery instructions
```


### Validation Presentation

HTML input validation currently handles some invalid values.

For example:

```text
Track ID must be greater than or equal to 1.
```

The browser may display its own built-in validation message.

A later UI/UX implementation could replace browser-default validation with consistent PMIP-designed inline validation states.


### Empty-State Presentation

Current empty states use plain text.

Examples include:

```text
No artists were found.
No streaming history was found.
No track anomalies were found.
No market movement intelligence is available.
```

These can later be redesigned with more polished messaging and visual presentation.


### Country and Market Names

Some current intelligence outputs expose short market codes such as:

```text
us
it
fr
kz
by
```

These are useful internally but are not ideal for a public-facing interface.

The final interface should consider displaying human-readable names such as:

```text
United States
Italy
France
Kazakhstan
Belarus
```

while preserving the underlying market codes internally.


### Mobile and Tablet UX

Functional responsiveness has already been implemented.

However, the later UI/UX phase should perform deeper usability testing on:

```text
desktop
tablet
iPad-sized screens
mobile phones
```

This phase should assess not only whether the application fits on the screen, but whether it is comfortable and intuitive to use.


### UI/UX as a Separate Project Phase

UI/UX is treated as a separate major phase rather than a small styling task.

This is because the phase will affect:

```text
visual design
interaction design
content design
accessibility
responsive usability
information hierarchy
product identity
```

The current functional frontend provides the foundation on which that later design work can be built.

## 16. UI/UX Scope and Deferred Visual Design

The PMIP frontend was developed using a functionality-first approach.

The current interface is intended to prove that:

```text
navigation works
API requests work
intelligence can be displayed
charts render correctly
loading states work
empty states work
error states work
responsive behaviour works
```

The current interface is not intended to represent the final visual identity of PMIP.


### Why UI/UX Was Deferred

The frontend functionality was developed before the final visual design so that the structure and behaviour of the application could become stable first.

Completing the main functionality before carrying out detailed UI/UX work reduces the risk of spending significant time designing interface elements that may later need to change because the underlying features have changed.

The current development phase therefore focused primarily on:

```text
functionality
data presentation
API integration
visualisation
validation
error handling
responsive behaviour
```

The final UI/UX phase can then be designed around the actual completed structure of the application.


### Areas Deferred to UI/UX

The later UI/UX phase is expected to review areas such as:

```text
visual identity
colour palette
typography
spacing system
card design
button design
input design
navigation design
mobile navigation
dashboard layout
icons
loading-state presentation
empty-state presentation
error-state presentation
validation messages
chart presentation
tooltips
accessibility
interaction feedback
information hierarchy
```

These areas are intentionally not treated as part of the current functional frontend implementation.


### Human-Friendly Intelligence Presentation

Several intelligence sections currently contain explanatory headings such as:

```text
What does this mean?
```

and:

```text
How to Read This Intelligence
```

The current explanations are technically useful but some wording remains formal or system-focused.

For example, users may currently encounter terms such as:

```text
Composite Evidence Strength
Temporal Comparability Score
Anomaly Score Ratio
Country Findings Index
Latest Intelligence Run
```

These terms accurately represent the underlying intelligence but may require clearer explanations for public users.

The later UI/UX and content-design phase should therefore improve how technical PMIP concepts are explained without changing their analytical meaning.


### Error-State Presentation

Current API errors are displayed mainly as readable text.

For example:

```text
Unable to connect to the PMIP backend. Please try again.
```

This is functionally correct and allows users to understand that the application could not contact the backend.

The later UI/UX phase may improve this presentation using:

```text
dedicated error cards
icons
retry buttons
clearer recovery guidance
consistent error colours
better spacing
```


### Validation Presentation

Some form validation currently uses HTML input validation.

For example, track and country ID inputs use:

```html
min="1"
```

This means the browser may display its own validation message when an invalid value such as `0` is entered.

This validation works correctly at the functional level.

However, the final interface may replace browser-default validation messages with consistent PMIP-designed inline validation.


### Empty-State Presentation

Current empty states use simple text messages.

Examples include:

```text
No artists were found.
No streaming history was found for this track and country.
No track anomalies were found.
No release-performance intelligence is currently available for this release.
No market movement intelligence is available for the latest intelligence run.
```

These messages correctly communicate that a request succeeded but no matching information exists.

The later UI/UX phase can improve these states through more natural wording and stronger visual presentation.


### Mobile and Tablet UX

Functional responsiveness has already been implemented.

The frontend can adapt across:

```text
desktop
tablet
mobile
```

However, final UI/UX testing should go further than checking whether content technically fits on the screen.

It should examine whether the dashboard is comfortable and intuitive to use on:

```text
desktop monitors
laptops
tablets
iPads
mobile phones
```

This may result in different interaction or layout decisions for smaller screens.


### UI/UX as a Separate Development Phase

UI/UX is treated as a separate major project phase rather than a small styling task.

This is because the final phase will affect:

```text
visual design
interaction design
content design
accessibility
responsive usability
information hierarchy
product identity
```

The current functional frontend provides the technical foundation on which that later design work can be built.


## 17. Current Development Limitations

The current frontend contains several temporary implementation decisions that were useful during development but are not intended to represent the final production experience.


### Five-Record Intelligence Limit

Several intelligence collection requests currently load only the first five records.

Examples include:

```text
country geographic intelligence
country market growth
artist geographic intelligence
artist market growth
track anomalies
artist anomalies
market movements
```

The current request pattern is similar to:

```js
getCountryGeographicIntelligence(1, 5);
```

In this example:

```text
1
```

represents the first page, while:

```text
5
```

means that only five records are requested.


### Reason for the Temporary Limit

Some PMIP intelligence datasets contain thousands of records.

Loading very large collections into the browser during early frontend development would make testing slower and would make it more difficult to inspect individual results.

A small development limit made it easier to confirm that:

```text
API requests worked
returned fields were correct
components rendered correctly
charts displayed correctly
empty states behaved correctly
```

The five-record limit is therefore a development/testing decision rather than a limitation of the PMIP datasets.


### Future Pagination and Browsing

The final frontend should not simply increase the limit to a very large number.

Instead, collection-based intelligence should support proper browsing mechanisms such as:

```text
pagination
search
filters
sorting
next/previous controls
page-size controls
```

This will allow users to explore large intelligence datasets without attempting to render thousands of results at the same time.


### Market Movements Data

The Market Movements frontend component is implemented and connected to its API endpoint.

However, the current latest intelligence run contains no Market Movement records.

Therefore, the frontend currently displays:

```text
No market movement intelligence is available for the latest intelligence run.
```

This represents a valid empty-data state rather than a frontend implementation failure.


### Countries Page

A dedicated `/countries` route currently exists.

However, most country-level geographic and market intelligence is presently displayed through the Intelligence page.

The Countries page can later be expanded into a dedicated market-exploration experience if required.


### Current Styling

The frontend currently uses basic functional CSS.

It should therefore not be treated as the final PMIP interface design.

The current styling exists mainly to provide:

```text
readable layouts
basic navigation
functional forms
responsive behaviour
usable charts
```

Final product styling remains intentionally deferred.


## 18. Human-Friendly Intelligence Explanations

PMIP produces several analytical outputs that use technical terminology.

The frontend currently includes explanatory sections to help users understand these results.

Common headings include:

```text
What does this mean?
```

and:

```text
How to Read This Intelligence
```


### Current Purpose

The current explanations are intended to translate model outputs into basic descriptions.

For example, the release-performance page explains that PMIP evaluates each track connected to a release rather than assuming that every track on the release performed in the same way.

Similarly, momentum, forecasting, anomaly and growth sections include short descriptions of what the displayed values represent.


### Current Limitation

Some of the wording is still closer to technical or development language than natural public-facing language.

Examples of concepts that may need further explanation include:

```text
Momentum Score
Composite Release Performance Score
Composite Evidence Strength
Temporal Comparability Score
Artist-Release Relationship Score
Country Findings Index
Geographic Profile Index
Market Growth Score
Anomaly Score Ratio
Artist Review Score
```


### Future Content Design

The later UI/UX and content-design phase should rewrite these explanations so that a user does not need machine-learning or data-science knowledge to understand the dashboard.

The aim should be to explain:

```text
what happened
why the number matters
what a higher or lower value means
whether the user should pay attention to it
```

without removing the underlying analytical accuracy.


### Example Direction

Instead of only showing:

```text
Composite Release Performance Score: 88.07
```

the final interface may provide a more natural explanation such as:

```text
This release is performing strongly compared with most of the releases analysed by PMIP.
```

The numerical score can still remain available for users who want the detailed metric.


### Technical Detail Should Remain Available

Human-friendly explanations should not replace the analytical data.

The final interface should ideally provide both:

```text
simple explanation
+
detailed metric
```

This would allow non-technical users to understand the result while still giving advanced users access to the underlying values.


## 19. Country and Market Naming

Some PMIP datasets currently represent markets using short country or market codes.

Examples include:

```text
us
it
fr
au
de
kz
by
ad
ve
pk
```

These values are currently displayed directly in some development-stage frontend components.


### Current Behaviour

During frontend development, the original values returned by the backend were intentionally preserved.

This made it easier to verify that the frontend was displaying the exact data returned by the API.


### Public-Facing Limitation

Short codes are less suitable for a public-facing dashboard.

For example:

```text
us
```

is less immediately readable than:

```text
United States
```

Similarly:

```text
it
```

would be clearer as:

```text
Italy
```


### Future Presentation

The final UI should consider converting market codes into readable names.

Examples include:

```text
us → United States
it → Italy
fr → France
de → Germany
au → Australia
kz → Kazakhstan
by → Belarus
```


### Internal Values

The original country or market code should still be retained internally.

This is useful for:

```text
API requests
database matching
filtering
analytics
technical debugging
```

The conversion should therefore affect presentation rather than replacing the underlying identifier.


### Naming Consistency

The final frontend should establish a consistent rule for country and market presentation.

For example:

```text
Display name: United States
Internal code: us
```

This will make geographic and market intelligence easier to understand while preserving the underlying PMIP data structure.


## 20. Frontend Testing Completed

The PMIP frontend has been manually tested across the main dashboard workflows.

Testing focused on whether functionality works correctly and whether the application handles unsuccessful or empty scenarios without breaking.


### Navigation Testing

The main navigation links were tested:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

Each route loaded successfully.

The fallback Not Found route was also tested using an invalid URL.

The application correctly displayed the Not Found page rather than producing a blank or broken screen.


### Artist Search Testing

Artist search was tested for:

```text
successful search
no-result search
empty search
backend connection failure
```

Successful results link to individual artist profiles.


### Invalid Artist Testing

Invalid artist IDs were tested using URLs containing IDs that do not exist.

The frontend correctly displayed:

```text
Unable to Load Artist
```

with the backend message:

```text
The requested artist could not be found.
```


### Artist Details Testing

Artist profiles were tested for:

```text
artist information
associated tracks
momentum intelligence
growth intelligence
missing optional intelligence
```

Optional intelligence can fail or be unavailable without preventing the main artist profile from being displayed.


### Track Performance Testing

The Tracks page was tested using known track and country combinations.

Testing included:

```text
historical streaming data
historical chart-position data
streaming visualisation
chart-position visualisation
```


### Track Empty-State Testing

A valid track was tested against a country ID with no matching performance data.

The frontend correctly displayed:

```text
No streaming history was found for this track and country.
```

and:

```text
No chart-performance history was found for this track and country.
```


### Track Validation Testing

Invalid values such as:

```text
0
```

were tested in track and country ID inputs.

The frontend/browser validation correctly prevented invalid requests.


### Release Testing

The Releases page was tested by switching between multiple releases.

The following values updated correctly:

```text
release title
release date
related tracks
release-performance intelligence
release-performance chart
```


### Release Intelligence Testing

Release-performance results were confirmed to support multiple track-level records belonging to the same release.

The frontend successfully displays each track's intelligence separately.


### Momentum Testing

Artist momentum was tested using valid artist IDs.

The frontend successfully displayed:

```text
Momentum Score
Momentum Category
Momentum Rank
Momentum Chart
Main Contributing Signal
```


### Forecasting Testing

Track forecasting was tested using tracks with available forecast intelligence.

The frontend successfully displayed:

```text
Predicted Streams
Actual Streams
Prediction Difference
Review Status
Forecast Comparison Chart
```


### Anomaly Testing

Both track and artist anomaly endpoints were tested.

The frontend successfully displayed:

```text
track anomaly records
track anomaly chart
artist anomaly summaries
artist anomaly chart
```


### Geographic Intelligence Testing

Country and artist geographic intelligence were tested.

The frontend correctly displayed geographic metrics and the country geographic-strength chart.


### Market Growth Testing

Country and artist market-growth intelligence were tested.

The frontend correctly displayed:

```text
growth scores
growth classes
market information
market-growth visualisation
```


### Market Movements Testing

The Market Movements request currently returns no records.

The frontend correctly displays the empty state instead of reporting an API failure.


### Backend Connection Testing

The backend was deliberately stopped during testing.

Frontend actions correctly displayed:

```text
Unable to connect to the PMIP backend. Please try again.
```

This confirmed that network-level API failures are handled clearly.


### Responsive Testing

The frontend was tested at different screen sizes.

Representative widths included:

```text
Desktop: approximately 1280px
Tablet: approximately 768px
Mobile: approximately 390px
```

The testing checked:

```text
navigation
forms
page width
text wrapping
chart resizing
horizontal overflow
```


### Testing Outcome

The main frontend workflows function correctly.

Remaining presentation issues identified during testing have been recorded for the later UI/UX phase rather than being treated as functional defects.


## 21. Implementation Summary

The PMIP frontend now provides a functional public dashboard foundation for exploring the platform's music intelligence.


### Main Capabilities

The frontend currently supports:

```text
artist search
artist profiles
associated track exploration
historical streaming analysis
historical chart-performance analysis
artist momentum intelligence
track forecasting
track anomaly intelligence
artist anomaly summaries
geographic intelligence
market-growth intelligence
market-movement empty-state handling
release exploration
release-performance intelligence
analytical visualisations
loading states
empty states
error handling
responsive behaviour
```


### Architecture Summary

The frontend architecture separates responsibilities into:

```text
Pages
→ major user workflows

Components
→ reusable interface sections and charts

Services
→ REST API communication

Routes
→ navigation and URL handling

Styles
→ shared layout and responsive behaviour
```

This separation makes the frontend easier to understand and maintain.


### Backend Integration

The frontend communicates with the Node.js and Express backend through REST endpoints.

The backend provides access to:

```text
artists
tracks
releases
streaming observations
chart performance
momentum intelligence
growth intelligence
forecasting intelligence
anomaly intelligence
geographic intelligence
market intelligence
release-performance intelligence
```


### Visualisation Summary

Recharts is used to visualise PMIP data through:

```text
line charts
vertical bar charts
horizontal bar charts
tooltips
legends
responsive chart containers
```

Charts are selected according to whether the data represents:

```text
historical change
or
category comparison
```


### Reliability

The frontend handles several unsuccessful situations without breaking the application.

These include:

```text
invalid IDs
missing resources
empty datasets
missing optional intelligence
backend errors
backend connection failures
invalid routes
```

This creates a more reliable foundation for public use.


### Responsive Foundation

Functional responsive behaviour has been added for:

```text
desktop
tablet
mobile
```

The current goal is to make sure the application remains usable across screen sizes.

Final responsive UX decisions will be made during the later UI/UX phase.


### Remaining Functional Work

One important frontend limitation remains:

```text
temporary five-record collection limits
```

Large intelligence collections currently use small development limits.

These should later be replaced with proper:

```text
pagination
search
filtering
sorting
browsing controls
```


### Deferred UI/UX Work

Final visual and interaction design remains a separate major project phase.

This future work will include:

```text
visual identity
typography
colour palette
dashboard layout
navigation experience
card design
form design
error presentation
empty states
loading presentation
validation presentation
chart polish
human-friendly wording
accessibility
mobile usability
tablet usability
```


### Final Frontend Position

The current frontend should therefore be considered:

```text
Functionally implemented
+
API integrated
+
Analytically visualised
+
Responsively usable
+
Ready for further browsing features and final UI/UX design
```

The architecture provides a stable foundation for the next stages of the PMIP project without requiring the core frontend to be rebuilt.

## 22. Pagination, Search and Large Dataset Browsing

Several PMIP intelligence datasets contain large numbers of records.

During frontend development, many collection endpoints were intentionally limited to the first five records so that functionality could be tested without attempting to display thousands of results at the same time.

Examples include:

```text
track anomalies
artist anomalies
country geographic intelligence
artist geographic intelligence
country market growth
artist market growth
market movements
```

The current development request pattern is similar to:

```js
getArtistAnomalies(1, 5);
```

In this example:

```text
1
```

represents the requested page, while:

```text
5
```

represents the number of records returned.


### Why Loading Everything Is Not Suitable

Some PMIP datasets contain thousands of intelligence records.

Loading all available rows into one browser page would create several problems:

```text
slow API responses
large browser memory usage
long pages
poor usability
difficult navigation
unnecessary network traffic
```

For this reason, the final dashboard should not simply replace the current limit of five with a very large number.


### Pagination

A proper pagination system should allow users to move through intelligence results in smaller groups.

A possible interaction could include:

```text
Previous
Page 1 of 100
Next
```

The backend already supports page and limit parameters for several collection endpoints.

This provides a foundation for adding frontend pagination controls.


### Search

Search should be introduced where users are likely to know the artist, track or market they want to investigate.

For example:

```text
Search artists
Search tracks
Search markets
Search releases
```

This would prevent users from needing to manually browse through large collections.


### Filtering

Filtering may also be useful for analytical intelligence.

Possible filters could include:

```text
momentum category
anomaly severity
anomaly direction
market-growth class
country
release-performance class
priority class
review status
```

Filters should be based on the actual fields available in each PMIP intelligence dataset.


### Sorting

Some intelligence collections may benefit from user-controlled sorting.

Examples could include:

```text
highest score first
lowest score first
highest anomaly activity
highest momentum
highest market growth
best release rank
latest observation
```

Sorting would allow users to explore intelligence according to the question they are trying to answer.


### Browsing Design Decision

Pagination, search, filtering and sorting should be treated as a functional frontend improvement rather than purely a UI/UX styling task.

The current five-record limit was appropriate for development and testing.

The final dashboard should replace this temporary behaviour with proper browsing controls before public deployment.


## 23. Frontend Configuration and Environment Management

The PMIP frontend uses environment configuration to separate frontend code from environment-specific backend addresses.


### Environment Variable

The backend API address is configured using:

```env
VITE_API_BASE_URL=http://localhost:3000
```

The variable is accessed in frontend service files using:

```js
import.meta.env.VITE_API_BASE_URL
```


### Development Fallback

The service files currently include a development fallback:

```js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

This means that if the environment variable is not available during local development, the frontend attempts to connect to:

```text
http://localhost:3000
```


### Environment Files

The frontend currently uses:

```text
.env
.env.example
```

The `.env` file contains local environment configuration.

The `.env.example` file provides an example of the variables required to run the frontend.


### Git Handling

Sensitive or machine-specific environment files should not be committed to GitHub.

The project `.gitignore` therefore protects environment files while allowing example configuration files to remain in the repository.


### Production Configuration

When PMIP is eventually deployed, the API address should no longer point to:

```text
localhost
```

Instead, the deployed frontend should receive the address of the deployed PMIP backend.

For example, the environment could later use a value conceptually similar to:

```env
VITE_API_BASE_URL=https://api.example.com
```

The exact production address will depend on the final hosting architecture.


### Configuration Design Decision

Using environment variables means that the frontend does not need to be rewritten when moving between:

```text
local development
testing
staging
production
```

Only the environment configuration needs to change.


## 24. Maintainability and Future Extensibility

The frontend architecture was designed so that additional PMIP features can be introduced without rebuilding the entire application.


### Separation of Responsibilities

The current architecture separates:

```text
pages
components
services
routes
styles
```

Each layer has a different responsibility.


### Pages

Pages coordinate complete user workflows.

Examples include:

```text
ArtistPage
ArtistDetailsPage
TracksPage
ReleasePage
IntelligencePage
```

Pages are responsible for deciding which components and data should appear together.


### Components

Components contain reusable interface or visualisation logic.

Examples include:

```text
SummaryCard
ContentSection
MomentumScoreChart
ReleasePerformanceChart
TrackAnomalyChart
```

A component can be updated independently without necessarily changing the whole page.


### Services

Services contain API communication.

For example:

```text
artistService.js
streamingService.js
releaseService.js
intelligenceService.js
```

If an endpoint changes in the future, the related service function can normally be updated without changing every component that uses the data.


### Routes

Routes determine how users access different parts of PMIP.

The current routing structure can later be extended with additional resource pages.


### Possible Future Routes

Future frontend development may introduce routes such as:

```text
/tracks/:trackId
/releases/:releaseId
/countries/:countryId
/markets/:countryId
```

These could provide more detailed exploration without changing the existing main dashboard routes.


### Additional Intelligence Models

The component and service structure also supports future PMIP intelligence models.

A new model could follow a pattern such as:

```text
New backend endpoint
        ↓
New frontend service function
        ↓
New intelligence component
        ↓
Existing Intelligence page or dedicated page
```


### Chart Extensibility

New analytical visualisations can also be added as separate components.

This prevents the page components from becoming responsible for every chart implementation.


### Maintainability Decision

The main goal was to avoid building one very large frontend file containing:

```text
all API requests
all charts
all page content
all error handling
all navigation
```

The current separation provides a cleaner foundation for future development and debugging.


## 25. Frontend Development Status and Next Steps

The current frontend development phase has completed the main functional public-dashboard foundation.


### Completed Frontend Areas

The following areas are currently implemented:

```text
frontend application setup
dashboard navigation
artist search
artist detail pages
associated artist tracks
historical streaming performance
historical chart performance
artist momentum intelligence
track forecasting intelligence
track anomaly intelligence
artist anomaly summaries
country geographic intelligence
country market-growth intelligence
artist geographic intelligence
artist market-growth intelligence
market-movement handling
release browsing
release tracks
release-performance intelligence
analytical charts
loading states
empty states
error states
backend connection handling
functional responsive behaviour
frontend implementation documentation
```


### Functional Testing

The main workflows have also been manually tested.

Testing confirmed that:

```text
navigation works
artist search works
artist profiles load
invalid artists are handled
track history loads
empty track results are handled
release switching works
release intelligence changes correctly
intelligence sections load
charts display
empty intelligence is handled
backend failures are handled
responsive layouts remain usable
```


### Immediate Functional Follow-Up

The most important remaining functional frontend improvement is replacing temporary development limits with proper browsing controls.

This should include appropriate combinations of:

```text
pagination
search
filtering
sorting
```


### Dedicated UI/UX Phase

Final UI/UX work remains intentionally separate.

This phase should later address:

```text
final dashboard design
brand identity
colour system
typography
spacing
cards
navigation
mobile experience
tablet experience
forms
buttons
validation presentation
loading presentation
error presentation
empty states
human-friendly intelligence wording
chart styling
accessibility
interaction design
```


### Deployment Preparation

Before eventual public deployment, the project will also need to consider:

```text
production frontend configuration
production backend configuration
database deployment
environment variables
CORS configuration
hosting
build process
production testing
performance testing
security review
```


### Current Position

At the end of the current frontend development phase, PMIP can be described as:

```text
Functionally connected to the backend
+
Able to display the main intelligence outputs
+
Able to visualise analytical results
+
Able to handle loading, empty and error states
+
Functionally responsive
+
Ready for advanced browsing features and final UI/UX work
```

The current implementation therefore provides a stable functional foundation for the remaining PMIP development phases.