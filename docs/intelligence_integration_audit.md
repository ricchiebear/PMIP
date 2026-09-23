# PMIP Intelligence Integration Audit

## 1. Artist Momentum Integration

### Purpose

The purpose of this section is to record how artist momentum intelligence flows from the PMIP analytical results into the backend API and finally into the public React dashboard.

### Data Source

Artist momentum intelligence is stored in the database table:

```text
artist_momentum_results
```

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'artist_momentum_scoring'
```

The momentum records are also joined with:

```text
artists
intelligence_runs
```

This allows the API response to include both the artist identity and metadata about the intelligence run.

Important momentum fields include:

```text
momentum_result_id
artist_id
artist_name
final_momentum_score
momentum_category
shared_score_rank
displayed_position
main_neutral_driver
relative_daily_growth_component
listener_peak_ratio_component
growth_contribution
peak_position_contribution
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

The momentum data is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findArtistMomentumResults()
countArtistMomentumResults()
findArtistMomentumResultByArtistId()
```

`findArtistMomentumResults()` retrieves paginated momentum results.

`findArtistMomentumResultByArtistId()` retrieves the latest momentum result for one specific canonical PMIP artist.

The repository selects only results belonging to the latest:

```text
artist_momentum_scoring
```

intelligence run.

### Backend Data Flow

The artist momentum integration follows the standard PMIP backend structure:

```text
artist_momentum_results
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoints

Artist momentum intelligence is served through:

```text
GET /api/intelligence/momentum/artists
```

for momentum collection results, and:

```text
GET /api/intelligence/momentum/artists/:artistId
```

for one specific artist.

The individual artist endpoint is the main endpoint used by the current public dashboard.

### Frontend Service

The frontend accesses the momentum endpoint through:

```text
frontend/src/services/intelligenceService.js
```

The service is responsible for making the API request and returning the momentum result to the React page.

### Frontend Display

Artist momentum intelligence is displayed in:

```text
frontend/src/pages/IntelligencePage.jsx
```

The page allows the user to enter an:

```text
Artist ID
```

and request the artist's momentum result.

The page displays:

```text
Momentum Score
Momentum Category
Momentum Rank
Main Contributing Signal
```

### Momentum Visualisation

The momentum score is visualised using:

```text
frontend/src/components/intelligence/MomentumScoreChart.jsx
```

The chart presents the artist's final momentum score on a 0–100 scale.

### Error and Missing-Data Handling

The frontend handles:

```text
loading state
invalid artist ID
unavailable momentum intelligence
backend API errors
backend connection errors
```

A missing momentum result does not prevent other valid artist information from being displayed elsewhere in the application.

### Integration Flow

The complete artist momentum integration can therefore be represented as:

```text
Artist Momentum Scoring Analysis
        ↓
artist_momentum_results
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/momentum/artists/:artistId
        ↓
frontend/src/services/intelligenceService.js
        ↓
IntelligencePage.jsx
        ↓
MomentumScoreChart.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Artist momentum intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

## 2. Track Forecasting Integration

### Purpose

The purpose of this section is to record how track forecasting intelligence flows from the PMIP forecasting results into the backend API and then into the public React dashboard.

### Data Source

Track forecasting intelligence is stored in the database table:

```text
forecast_results
```

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'artist_performance_forecasting'
```

The forecasting records are joined with:

```text
tracks
intelligence_runs
```

This allows the API response to include both track information and metadata about the intelligence run.

Important forecasting fields include:

```text
forecast_result_id
track_id
track_name
predicted_spotify_streams
actual_spotify_streams
raw_predicted_spotify_streams
prediction_error
absolute_prediction_error
prediction_was_clipped
prediction_date
feature_coverage
high_forecast_review_flag
run_id
component_name
component_version
generated_at
created_at
```

### Backend Repository

The forecasting data is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findTrackForecastResults()
countTrackForecastResults()
findTrackForecastResultByTrackId()
```

`findTrackForecastResults()` retrieves paginated forecasting results.

`findTrackForecastResultByTrackId()` retrieves the latest forecasting result for one specific PMIP track.

The repository selects only forecasting results belonging to the latest:

```text
artist_performance_forecasting
```

intelligence run.

### Backend Data Flow

The track forecasting integration follows the standard PMIP backend structure:

```text
forecast_results
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoints

Track forecasting intelligence is served through:

```text
GET /api/intelligence/forecasting/tracks
```

for forecasting collection results, and:

```text
GET /api/intelligence/forecasting/tracks/:trackId
```

for one specific track.

The individual track endpoint is the main endpoint used by the current public dashboard.

### Frontend Service

The frontend accesses forecasting intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service sends the selected track ID to the backend and returns the forecasting result to the React page.

### Frontend Display

Track forecasting intelligence is displayed in:

```text
frontend/src/pages/IntelligencePage.jsx
```

The page allows the user to enter a:

```text
Track ID
```

and load the corresponding forecast result.

The page currently displays:

```text
Predicted Spotify Streams
Actual Spotify Streams
Prediction Difference
Forecast Review Status
```

### Forecast Visualisation

Forecasting results are visualised using:

```text
frontend/src/components/intelligence/ForecastComparisonChart.jsx
```

The chart compares:

```text
Predicted Spotify Streams
vs
Actual Spotify Streams
```

This provides a direct visual comparison between the model prediction and the observed streaming result.

### Forecast Review Handling

The frontend also checks:

```text
high_forecast_review_flag
```

If the value indicates that the result requires additional attention, the dashboard displays:

```text
Review Recommended
```

Otherwise, it displays:

```text
No Review Flag
```

### Error and Missing-Data Handling

The frontend handles:

```text
loading state
invalid track ID
unavailable forecasting intelligence
backend API errors
backend connection errors
```

A valid track may exist even if no forecasting result is available.

The frontend therefore treats forecasting as optional intelligence rather than assuming that every track must have a forecasting result.

### Integration Flow

The complete track forecasting integration can therefore be represented as:

```text
Artist Performance Forecasting Analysis
        ↓
forecast_results
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/forecasting/tracks/:trackId
        ↓
frontend/src/services/intelligenceService.js
        ↓
IntelligencePage.jsx
        ↓
ForecastComparisonChart.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Track forecasting intelligence is successfully connected from the stored forecasting output through the backend API to the public dashboard.

## 3. Track Anomaly Integration

### Purpose

The purpose of this section is to record how track-level streaming anomaly intelligence flows from the PMIP anomaly-detection results into the backend API and then into the public React dashboard.

### Data Source

Track anomaly intelligence is stored in the database table:

```text
streaming_anomaly_results
```

The anomaly records are linked to streaming observations through:

```text
streaming_observations
```

and then joined with:

```text
tracks
intelligence_runs
```

This allows the API response to include both the anomaly result and the related track and observation information.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'streaming_anomaly_detection'
```

Important track anomaly fields include:

```text
anomaly_result_id
observation_id
track_id
track_name
country_id
observation_date
streams
chart_position
pca_reconstruction_error
anomaly_score_ratio
anomaly_score_margin
anomaly_score_excess_pct
is_final_pca_anomaly
anomaly_direction
anomaly_severity
severity_rank
model_partition
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Track anomaly data is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions include:

```text
findTrackAnomalyResults()
countTrackAnomalyResults()
```

`findTrackAnomalyResults()` retrieves paginated track anomaly records.

The repository can return only the final PCA anomalies by applying:

```text
is_final_pca_anomaly = 1
```

when final-only results are requested.

### Duplicate Anomaly Handling

The repository includes logic to prevent repeated anomaly rows for the same streaming observation.

For each:

```text
observation_id
```

the query retains the anomaly row with the smallest:

```text
anomaly_result_id
```

for the current intelligence run.

This means the public API returns one deduplicated anomaly result per streaming observation.

### Latest Intelligence Run

Only anomaly results belonging to the latest:

```text
streaming_anomaly_detection
```

run are returned.

The repository identifies the latest run using the PMIP:

```text
intelligence_runs
```

table.

### Backend Data Flow

The track anomaly integration follows the standard PMIP backend structure:

```text
streaming_anomaly_results
        ↓
streaming_observations
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Track anomaly intelligence is served through:

```text
GET /api/intelligence/anomalies/tracks
```

The endpoint returns track-level anomaly results using pagination.

The current frontend requests a small number of results during development rather than loading the full anomaly dataset.

### Frontend Service

The frontend accesses track anomaly intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service sends the request to the anomaly endpoint and returns the result collection to the React page.

### Frontend Display

Track anomaly intelligence is displayed in:

```text
frontend/src/pages/IntelligencePage.jsx
```

The user can load the current anomaly results using the:

```text
Load Track Anomalies
```

button.

For each anomaly, the page displays information including:

```text
Track Name
Anomaly Severity
Anomaly Direction
Streams
Chart Position
Anomaly Score Ratio
Observation Date
Country ID
```

### Track Anomaly Visualisation

Track anomalies are visualised using:

```text
frontend/src/components/intelligence/TrackAnomalyChart.jsx
```

The chart compares:

```text
Track
vs
Anomaly Score Ratio
```

This helps users identify which loaded track observations have the strongest anomaly scores.

### Empty-State Handling

If the API request is successful but no anomaly results are returned, the frontend displays:

```text
No track anomalies were found.
```

This is treated as a valid empty result rather than an application error.

### Error Handling

The frontend handles:

```text
loading state
empty anomaly results
backend API errors
backend connection errors
```

If the backend cannot be reached, the shared service error handling provides a readable connection message rather than exposing a low-level browser error.

### Integration Flow

The complete track anomaly integration can therefore be represented as:

```text
Streaming Anomaly Detection Analysis
        ↓
streaming_anomaly_results
        ↓
streaming_observations
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/anomalies/tracks
        ↓
frontend/src/services/intelligenceService.js
        ↓
IntelligencePage.jsx
        ↓
TrackAnomalyChart.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Track anomaly intelligence is successfully connected from the stored anomaly-detection output through the backend API to the public dashboard.

The current integration also includes latest-run filtering, final-anomaly filtering and duplicate-observation protection.

## 4. Artist Anomaly Summary Integration

### Purpose

The purpose of this section is to record how artist-level anomaly summaries flow from PMIP anomaly-detection outputs into the backend API and then into the public React dashboard.

### Data Source

Artist anomaly summaries are stored in the database table:

```text
artist_anomaly_summary
```

The backend combines anomaly activity for canonical PMIP artists and joins the results with:

```text
artists
intelligence_runs
```

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'streaming_anomaly_detection'
```

Important artist anomaly fields include:

```text
artist_id
artist_name
source_artist_labels
total_observations
final_anomaly_count
high_priority_anomaly_count
extreme_anomaly_count
positive_anomaly_count
negative_anomaly_count
anomaly_rate_pct
artist_review_score
latest_observation_date
run_id
component_name
component_version
generated_at
```

### Backend Repository

Artist anomaly summaries are retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions include:

```text
findArtistAnomalySummaries()
countArtistAnomalySummaries()
```

`findArtistAnomalySummaries()` retrieves paginated artist-level anomaly summaries.

### Canonical Artist Aggregation

The repository is designed to handle situations where multiple source artist labels map to the same canonical PMIP artist.

Instead of returning repeated rows for the same artist, the backend groups source records by:

```text
artist_id
```

and combines related source artist labels.

This allows one canonical artist to appear once in the API response even if different source labels were present in the underlying analytical data.

### Aggregated Anomaly Metrics

The repository combines anomaly activity across related source records.

This includes totals such as:

```text
Total Observations
Detected Anomalies
High-Priority Anomalies
Extreme Anomalies
Positive Anomalies
Negative Anomalies
```

The result therefore provides a higher-level summary of anomaly behaviour for each artist rather than one row per individual streaming observation.

### Latest Intelligence Run

Only artist anomaly summaries belonging to the latest:

```text
streaming_anomaly_detection
```

run are returned.

The latest run is identified through:

```text
intelligence_runs
```

### Backend Data Flow

The artist anomaly summary integration follows the PMIP backend structure:

```text
artist_anomaly_summary
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Artist anomaly summaries are served through:

```text
GET /api/intelligence/anomalies/artists
```

The endpoint returns paginated artist-level anomaly intelligence.

The current frontend requests only a small number of records during development.

### Frontend Service

The frontend accesses artist anomaly summaries through:

```text
frontend/src/services/intelligenceService.js
```

The service requests the anomaly collection from the backend and returns the result array to the React page.

### Frontend Display

Artist anomaly summaries are displayed in:

```text
frontend/src/pages/IntelligencePage.jsx
```

The user loads the results using the:

```text
Load Artist Anomalies
```

button.

For each artist, the page currently displays:

```text
Artist Name
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

### Artist Anomaly Visualisation

Artist anomaly summaries are visualised using:

```text
frontend/src/components/intelligence/ArtistAnomalyChart.jsx
```

The chart compares:

```text
Artist
vs
Detected Anomaly Count
```

This gives users a quick visual comparison of anomaly activity across the loaded artists.

### Empty-State Handling

If the API request succeeds but no artist anomaly summaries are returned, the frontend displays:

```text
No artist anomaly summaries were found.
```

This is treated as a valid empty result rather than a system failure.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

The application therefore provides clear feedback instead of leaving the intelligence section blank.

### Integration Flow

The complete artist anomaly summary integration can therefore be represented as:

```text
Streaming Anomaly Detection Analysis
        ↓
artist_anomaly_summary
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/anomalies/artists
        ↓
frontend/src/services/intelligenceService.js
        ↓
IntelligencePage.jsx
        ↓
ArtistAnomalyChart.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Artist anomaly summaries are successfully connected from the stored anomaly-analysis output through the backend API to the public dashboard.

The current integration also handles canonical artist aggregation so repeated source labels do not create duplicate public artist entries.

## 5. Country Geographic Intelligence Integration

### Purpose

The purpose of this section is to record how country-level geographic intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Country geographic intelligence is stored in the database table:

```text
country_geographic_intelligence
```

The backend joins these intelligence results with:

```text
countries
intelligence_runs
```

This allows the API response to include readable country information together with metadata about the intelligence run.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'geographic_intelligence'
```

Important country geographic fields include:

```text
country_geo_result_id
country_id
country_name
country_code
observations
total_streams
median_streams
mean_streams
median_chart_position
top_10_rate_pct
top_50_rate_pct
number_one_rate_pct
streaming_strength_percentile
chart_strength_percentile
market_context_percentile
country_findings_index
country_findings_class
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Country geographic intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findCountryGeographicIntelligence()
countCountryGeographicIntelligence()
```

`findCountryGeographicIntelligence()` retrieves paginated country-level geographic intelligence.

`countCountryGeographicIntelligence()` returns the total number of country geographic results belonging to the latest geographic intelligence run.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
geographic_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This prevents older geographic intelligence outputs from being mixed with the current dashboard results.

### Country Join

The intelligence table is joined with:

```text
countries
```

using:

```text
country_id
```

This allows the backend to return:

```text
country_name
country_code
```

alongside the analytical metrics.

### Result Ordering

Country geographic intelligence is ordered primarily by:

```text
country_findings_index
```

from highest to lowest.

This means stronger country findings appear before weaker findings in the paginated result set.

### Backend Data Flow

The country geographic integration follows the standard PMIP backend structure:

```text
country_geographic_intelligence
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Country geographic intelligence is served through:

```text
GET /api/intelligence/geographic/countries
```

The endpoint supports paginated collection results.

### Frontend Service

The frontend accesses country geographic intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The frontend service sends the pagination request to the backend and returns the resulting country intelligence data.

### Frontend Display

Country geographic intelligence is displayed through:

```text
frontend/src/components/intelligence/CountryGeographicSection.jsx
```

This component is rendered inside:

```text
frontend/src/pages/IntelligencePage.jsx
```

The section handles the loading and presentation of country geographic intelligence.

### Displayed Information

The current frontend presents country-level information including metrics such as:

```text
Country
Total Streams
Median Streams
Mean Streams
Median Chart Position
Top 10 Rate
Top 50 Rate
Country Findings Index
Country Findings Class
```

Additional geographic metrics returned by the backend remain available for future dashboard expansion.

### Country Geographic Visualisation

Country geographic intelligence is visualised using:

```text
frontend/src/components/intelligence/CountryGeographicChart.jsx
```

The chart compares:

```text
Country
vs
Country Findings Index
```

The findings index is presented on a:

```text
0–1 scale
```

This provides a quick visual comparison of the geographic strength of the loaded markets.

### Empty-State Handling

If the API request succeeds but no country geographic intelligence is returned, the frontend displays an empty-data message rather than treating the request as a system error.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

This prevents the geographic section from appearing blank when the backend is unavailable or no results exist.

### Current Development Limit

The frontend currently requests only a small number of country geographic records during development.

The current pattern uses pagination similar to:

```text
page = 1
limit = 5
```

This is a temporary development decision.

The final application should later provide proper pagination, search, filtering or browsing controls rather than loading the full dataset at once.

### Integration Flow

The complete country geographic intelligence integration can therefore be represented as:

```text
Geographic Intelligence Analysis
        ↓
country_geographic_intelligence
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/geographic/countries
        ↓
frontend/src/services/intelligenceService.js
        ↓
CountryGeographicSection.jsx
        ↓
CountryGeographicChart.jsx
        ↓
IntelligencePage.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Country geographic intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

The current implementation includes latest-run filtering, country metadata joins, pagination, empty-state handling and geographic-strength visualisation.

## 6. Artist Geographic Intelligence Integration

### Purpose

The purpose of this section is to record how artist-level geographic intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Artist geographic intelligence is stored in the database table:

```text
artist_geographic_intelligence
```

The backend joins these intelligence results with:

```text
artists
intelligence_runs
```

A `LEFT JOIN` is used with the `artists` table so that source-only artist records are preserved even when no canonical PMIP artist ID is available.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'geographic_intelligence'
```

Important artist geographic fields include:

```text
artist_geo_result_id
source_artist_label
source_artist_key
source_artist_identity_key
artist_id
artist_name
markets_reached
international_reach_index
international_reach_class
market_penetration_index
market_penetration_class
stream_concentration_hhi
effective_stream_markets
market_dependency_class
local_international_profile
geographic_profile_index
artist_geographic_profile
artist_diversification_index
artist_findings_index
artist_findings_class
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Artist geographic intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findArtistGeographicIntelligence()
countArtistGeographicIntelligence()
```

`findArtistGeographicIntelligence()` retrieves paginated artist-level geographic intelligence.

`countArtistGeographicIntelligence()` returns the total number of artist geographic records belonging to the latest geographic intelligence run.

### Canonical and Source-Only Artist Handling

The repository uses a `LEFT JOIN` between:

```text
artist_geographic_intelligence
```

and:

```text
artists
```

using:

```text
artist_id
```

This means the API can preserve analytical records even when a canonical PMIP artist match is unavailable.

For matched records, the API can return:

```text
artist_name
```

For unmatched records, the frontend can fall back to fields such as:

```text
source_artist_label
source_artist_key
```

This prevents valid intelligence records from being lost simply because an artist has not been mapped to the canonical artist table.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
geographic_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This ensures that older geographic results are not mixed with the current dashboard output.

### Result Ordering

Artist geographic intelligence is ordered primarily by:

```text
artist_findings_index
```

from highest to lowest.

This places stronger artist geographic findings earlier in the paginated result set.

### Backend Data Flow

The artist geographic integration follows the standard PMIP backend structure:

```text
artist_geographic_intelligence
        ↓
artists
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Artist geographic intelligence is served through:

```text
GET /api/intelligence/geographic/artists
```

The endpoint returns paginated artist-level geographic intelligence.

### Frontend Service

The frontend accesses artist geographic intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The frontend service requests the paginated geographic artist results and returns them to the relevant React component.

### Frontend Display

Artist geographic intelligence is displayed through:

```text
frontend/src/components/intelligence/ArtistGeographicSection.jsx
```

This component is rendered inside:

```text
frontend/src/pages/IntelligencePage.jsx
```

The section handles loading, empty, error and successful result states.

### Displayed Information

The frontend can display artist geographic metrics including:

```text
Artist
Markets Reached
International Reach Index
International Reach Class
Market Penetration Index
Market Penetration Class
Market Dependency Class
Local / International Profile
Geographic Profile Index
Artist Geographic Profile
Artist Diversification Index
Artist Findings Index
Artist Findings Class
```

The exact information shown can be expanded later during the final UI/UX phase.

### Source-Label Fallback

Some geographic intelligence records may not have a canonical:

```text
artist_name
```

In these cases, the frontend can use:

```text
source_artist_label
```

as a fallback display value.

This is important because PMIP may still contain useful geographic intelligence for source records that have not yet been fully mapped to a canonical artist.

### Empty-State Handling

If the API request succeeds but no artist geographic records are returned, the frontend displays a valid empty state rather than treating the result as an error.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

This gives the user clear feedback if geographic intelligence cannot currently be loaded.

### Current Development Limit

The frontend currently requests only a small number of artist geographic records during development.

The request pattern currently uses pagination similar to:

```text
page = 1
limit = 5
```

This temporary limit prevents the dashboard from trying to render tens of thousands of artist geographic records during development.

The final application should later introduce proper:

```text
pagination
search
filtering
sorting
```

for large-scale browsing.

### Integration Flow

The complete artist geographic intelligence integration can therefore be represented as:

```text
Geographic Intelligence Analysis
        ↓
artist_geographic_intelligence
        ↓
artists
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/geographic/artists
        ↓
frontend/src/services/intelligenceService.js
        ↓
ArtistGeographicSection.jsx
        ↓
IntelligencePage.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Artist geographic intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

The current implementation also preserves source-only artist intelligence, filters to the latest geographic intelligence run and supports paginated frontend retrieval.

## 7. Country Market Growth Integration

### Purpose

The purpose of this section is to record how country-level market growth intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Country market growth intelligence is stored in the database table:

```text
country_market_growth
```

The backend joins these intelligence results with:

```text
countries
intelligence_runs
```

A `LEFT JOIN` is used with the `countries` table so that valid market-growth records are preserved even when a canonical PMIP country ID is not available.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'market_growth_intelligence'
```

Important country market-growth fields include:

```text
country_growth_result_id
source_country
country_id
country_name
country_code
emerging_market_score
emerging_market_class
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Country market-growth intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findCountryMarketGrowth()
countCountryMarketGrowth()
```

`findCountryMarketGrowth()` retrieves paginated country-level market-growth intelligence.

`countCountryMarketGrowth()` returns the total number of country market-growth records belonging to the latest market-growth intelligence run.

### Canonical and Source-Only Country Handling

The repository uses a `LEFT JOIN` between:

```text
country_market_growth
```

and:

```text
countries
```

using:

```text
country_id
```

This allows PMIP to preserve analytical records even if no canonical country mapping is available.

For matched records, the API can return:

```text
country_name
country_code
```

For unmatched records, the original source value remains available through:

```text
source_country
```

This prevents market-growth intelligence from being discarded because of an incomplete country mapping.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
market_growth_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This keeps current market-growth outputs separate from older intelligence runs.

### Result Ordering

Country market-growth results are ordered by:

```text
emerging_market_score
```

from highest to lowest.

This means markets with the strongest emerging-market scores appear first in the paginated result set.

### Backend Data Flow

The country market-growth integration follows the standard PMIP backend structure:

```text
country_market_growth
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Country market-growth intelligence is served through:

```text
GET /api/intelligence/markets/countries
```

The endpoint returns paginated country-level market-growth results.

### Frontend Service

The frontend accesses country market-growth intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service requests the paginated market-growth collection from the backend and returns the results to the relevant React component.

### Frontend Display

Country market-growth intelligence is displayed through:

```text
frontend/src/components/intelligence/CountryMarketGrowthSection.jsx
```

This component is rendered inside:

```text
frontend/src/pages/IntelligencePage.jsx
```

The component handles:

```text
loading
empty results
errors
successful results
```

### Displayed Information

The current frontend displays market-growth information including:

```text
Country
Emerging Market Score
Emerging Market Class
```

The underlying API also provides country metadata and intelligence-run information for traceability.

### Market Growth Visualisation

Country market-growth intelligence is visualised using:

```text
frontend/src/components/intelligence/CountryMarketGrowthChart.jsx
```

The chart compares:

```text
Country
vs
Emerging Market Score
```

The score is presented on a:

```text
0–100 scale
```

This allows users to compare emerging-market potential across the loaded countries.

### Source-Country Fallback

If a canonical country name is unavailable, the frontend can fall back to:

```text
source_country
```

This ensures that valid analytical results can still be displayed even when country mapping is incomplete.

### Empty-State Handling

If the API request succeeds but returns no country market-growth records, the frontend displays a valid empty-data state rather than treating the request as a system error.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

This ensures that the market-growth section provides clear feedback instead of appearing blank.

### Current Development Limit

The frontend currently requests only a small number of country market-growth records during development.

The current pattern uses pagination similar to:

```text
page = 1
limit = 5
```

This temporary limit is used to keep development and testing manageable.

The final application should later support proper:

```text
pagination
search
filtering
sorting
```

for larger result sets.

### Integration Flow

The complete country market-growth integration can therefore be represented as:

```text
Market Growth Intelligence Analysis
        ↓
country_market_growth
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/markets/countries
        ↓
frontend/src/services/intelligenceService.js
        ↓
CountryMarketGrowthSection.jsx
        ↓
CountryMarketGrowthChart.jsx
        ↓
IntelligencePage.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Country market-growth intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

The current implementation includes latest-run filtering, source-country fallback handling, pagination, empty-state handling and market-growth visualisation.

## 8. Artist Market Growth Integration

### Purpose

The purpose of this section is to record how artist-level market growth intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Artist market growth intelligence is stored in the database table:

```text
artist_market_growth
```

The backend joins these intelligence results with:

```text
artists
countries
intelligence_runs
```

`LEFT JOIN` operations are used so that source-only artist and country records are preserved even when canonical PMIP IDs are unavailable.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'market_growth_intelligence'
```

Important artist market-growth fields include:

```text
artist_market_growth_id
source_artist_label
source_artist_key
source_country
artist_id
artist_name
country_id
country_name
country_code
market_growth_score
market_growth_class
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Artist market-growth intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findArtistMarketGrowth()
countArtistMarketGrowth()
```

`findArtistMarketGrowth()` retrieves paginated artist-level market-growth intelligence.

`countArtistMarketGrowth()` returns the total number of artist market-growth records belonging to the latest market-growth intelligence run.

### Canonical and Source-Only Artist Handling

The repository uses a `LEFT JOIN` between:

```text
artist_market_growth
```

and:

```text
artists
```

using:

```text
artist_id
```

This allows PMIP to preserve valid market-growth intelligence even when an artist has not been mapped to a canonical PMIP artist record.

For matched records, the API can return:

```text
artist_name
```

For unmatched records, the original source information remains available through:

```text
source_artist_label
source_artist_key
```

This prevents useful analytical results from being discarded because of incomplete artist identity mapping.

### Canonical and Source-Only Country Handling

The repository also uses a `LEFT JOIN` between:

```text
artist_market_growth
```

and:

```text
countries
```

using:

```text
country_id
```

For matched markets, the API can return:

```text
country_name
country_code
```

For unmatched markets, the source value remains available through:

```text
source_country
```

This allows market-growth intelligence to remain usable even where country mapping is incomplete.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
market_growth_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This prevents older growth results from being mixed with the current dashboard output.

### Result Ordering

Artist market-growth results are ordered by:

```text
market_growth_score
```

from highest to lowest.

This means stronger artist-market growth results appear earlier in the paginated result set.

### Backend Data Flow

The artist market-growth integration follows the standard PMIP backend structure:

```text
artist_market_growth
        ↓
artists
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Artist market-growth intelligence is served through:

```text
GET /api/intelligence/markets/artists
```

The endpoint returns paginated artist-level market-growth results.

### Frontend Service

The frontend accesses artist market-growth intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service requests the artist market-growth collection from the backend and returns the result data to the relevant React component.

### Frontend Display

Artist market-growth intelligence is displayed through:

```text
frontend/src/components/intelligence/ArtistMarketGrowthSection.jsx
```

This component is rendered inside:

```text
frontend/src/pages/IntelligencePage.jsx
```

The component handles loading, empty, error and successful result states.

### Displayed Information

The current frontend displays information including:

```text
Artist
Market
Market Growth Score
Market Growth Class
```

The API also provides source labels, country information and intelligence-run metadata for traceability.

### Artist Name Fallback

If a canonical:

```text
artist_name
```

is unavailable, the frontend can fall back to:

```text
source_artist_label
```

This allows source-only artist intelligence to remain visible on the dashboard.

### Country Fallback

If a canonical:

```text
country_name
```

is unavailable, the frontend can fall back to:

```text
source_country
```

This preserves usable market information even where canonical country mapping is incomplete.

### Empty-State Handling

If the API request succeeds but returns no artist market-growth records, the frontend displays a valid empty-data state rather than treating the request as an error.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

This ensures that the artist market-growth section provides clear feedback instead of appearing blank.

### Current Development Limit

The frontend currently requests only a small number of artist market-growth records during development.

The request pattern currently uses pagination similar to:

```text
page = 1
limit = 5
```

This temporary limit prevents the dashboard from trying to render a very large artist-market dataset during development.

The final application should later provide proper:

```text
pagination
search
filtering
sorting
```

for large-scale browsing.

### Integration Flow

The complete artist market-growth integration can therefore be represented as:

```text
Market Growth Intelligence Analysis
        ↓
artist_market_growth
        ↓
artists
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/markets/artists
        ↓
frontend/src/services/intelligenceService.js
        ↓
ArtistMarketGrowthSection.jsx
        ↓
IntelligencePage.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Artist market-growth intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

The current implementation also preserves source-only artist and country records, filters to the latest market-growth run and supports paginated frontend retrieval.

## 9. Artist Final Growth Intelligence Integration

### Purpose

The purpose of this section is to record how final artist growth intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Final artist growth intelligence is stored in the database table:

```text
artist_growth_intelligence
```

The backend joins these intelligence results with:

```text
artists
intelligence_runs
```

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'market_growth_intelligence'
```

Important final artist growth fields include:

```text
artist_growth_result_id
source_artist_label
source_artist_key
artist_id
artist_name
mean_market_growth_score
maximum_artist_emerging_market_score
growth_opportunity_score
growth_opportunity_class
pmip_growth_score
pmip_growth_class
pmip_growth_rank
pmip_priority_class
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Final artist growth intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findArtistGrowthIntelligence()
countArtistGrowthIntelligence()
findArtistGrowthIntelligenceByArtistId()
```

`findArtistGrowthIntelligence()` retrieves paginated final artist growth results.

`countArtistGrowthIntelligence()` returns the total number of final artist growth records belonging to the latest market-growth intelligence run.

`findArtistGrowthIntelligenceByArtistId()` retrieves the final growth intelligence for one specific canonical PMIP artist.

### Canonical and Source-Only Artist Handling

The collection query preserves source-only artist records using a `LEFT JOIN` with:

```text
artists
```

This means final growth intelligence can still exist even when an analytical source record has not been fully mapped to a canonical PMIP artist.

For matched records, the API can return:

```text
artist_name
```

For source-only records, the original source information remains available through:

```text
source_artist_label
source_artist_key
```

### Individual Artist Lookup

For a specific canonical artist, the backend uses:

```text
findArtistGrowthIntelligenceByArtistId()
```

The query filters using:

```text
artist_id = ?
```

and retrieves the result from the latest:

```text
market_growth_intelligence
```

run.

Only one final growth result is returned for the requested artist.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
market_growth_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This prevents older growth intelligence from being mixed with current results.

### Result Ordering

The collection is ordered primarily by:

```text
pmip_growth_rank
```

and then by:

```text
pmip_growth_score
```

This allows stronger and higher-ranked final artist growth results to appear earlier in the collection.

### Backend Data Flow

The final artist growth integration follows the standard PMIP backend structure:

```text
artist_growth_intelligence
        ↓
artists
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoints

Final artist growth intelligence is served through:

```text
GET /api/intelligence/growth/artists
```

for paginated collection results, and:

```text
GET /api/intelligence/growth/artists/:artistId
```

for one specific artist.

The individual artist endpoint is the main endpoint used by the artist profile workflow.

### Frontend Service

The frontend accesses artist growth intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service requests the selected artist's growth result from the backend.

### Frontend Display

Final artist growth intelligence is displayed in:

```text
frontend/src/pages/ArtistDetailsPage.jsx
```

The growth result is shown alongside the artist's main profile information and associated tracks.

The frontend can display information such as:

```text
PMIP Growth Score
PMIP Growth Class
PMIP Growth Rank
PMIP Priority Class
Growth Opportunity Score
Growth Opportunity Class
```

### Optional Intelligence Handling

Artist growth intelligence is treated as optional.

This means that if the artist exists but no final growth result is available, the main artist profile can still be displayed.

The frontend keeps:

```text
artist profile data
```

separate from:

```text
growth intelligence
```

This prevents missing analytical coverage from making a valid artist page appear broken.

### Error Handling

The frontend handles:

```text
loading state
unavailable growth intelligence
backend API errors
backend connection errors
```

This provides clear feedback while preserving the main artist profile.

### Integration Flow

The complete final artist growth integration can therefore be represented as:

```text
Market Growth Intelligence Analysis
        ↓
artist_growth_intelligence
        ↓
artists
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/growth/artists/:artistId
        ↓
frontend/src/services/intelligenceService.js
        ↓
ArtistDetailsPage.jsx
        ↓
Public PMIP Artist Profile
```

### Integration Status

```text
Status: Integrated
```

Final artist growth intelligence is successfully connected from the stored analytical output through the backend API to the public artist profile.

The current implementation includes latest-run filtering, canonical artist lookup, source-only collection support and optional-intelligence handling.

## 10. Market Movements Integration

### Purpose

The purpose of this section is to record how track-level market movement intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Market movement intelligence is stored in the database table:

```text
track_market_movements
```

The backend joins these movement records with:

```text
tracks
countries
intelligence_runs
```

`LEFT JOIN` operations are used with the track and country tables so that source-only records are preserved even when canonical PMIP IDs are unavailable.

The backend retrieves results from the latest intelligence run where:

```text
component_name = 'market_growth_intelligence'
```

Important market movement fields include:

```text
movement_id
source_track_id
source_country
track_id
track_name
country_id
country_name
country_code
first_observation_date
latest_observation_date
market_entry_flag
expansion_flag
contraction_flag
cross_market_momentum
run_id
component_name
component_version
generated_at
calculated_at
```

### Backend Repository

Market movement intelligence is retrieved through:

```text
backend/src/repositories/intelligenceRepository.js
```

The main repository functions are:

```text
findTrackMarketMovements()
countTrackMarketMovements()
```

`findTrackMarketMovements()` retrieves paginated track-market movement results.

`countTrackMarketMovements()` returns the total number of market movement records belonging to the latest market-growth intelligence run.

### Canonical and Source-Only Track Handling

The repository uses a `LEFT JOIN` between:

```text
track_market_movements
```

and:

```text
tracks
```

using:

```text
track_id
```

This allows market movement intelligence to remain available even when a movement record has not been mapped to a canonical PMIP track.

For matched records, the API can return:

```text
track_name
```

For unmatched records, the original source value remains available through:

```text
source_track_id
```

### Canonical and Source-Only Country Handling

The repository also uses a `LEFT JOIN` between:

```text
track_market_movements
```

and:

```text
countries
```

using:

```text
country_id
```

For matched markets, the API can return:

```text
country_name
country_code
```

For unmatched markets, the source value remains available through:

```text
source_country
```

This preserves valid market movement intelligence where country mapping is incomplete.

### Movement Signals

The market movement dataset includes several movement indicators.

These include:

```text
market_entry_flag
expansion_flag
contraction_flag
cross_market_momentum
```

These fields describe different types of market behaviour for a track.

For example:

```text
market_entry_flag
```

can indicate that a track has entered a market,

```text
expansion_flag
```

can indicate growing presence,

and:

```text
contraction_flag
```

can indicate weakening or reduced presence.

The:

```text
cross_market_momentum
```

value provides a broader indication of movement strength across markets.

### Latest Intelligence Run

The repository filters results so that only the latest:

```text
market_growth_intelligence
```

run is returned.

The latest run is identified through:

```text
intelligence_runs
```

This prevents older market movement outputs from being mixed with the latest dashboard data.

### Result Ordering

Market movement results are ordered primarily by:

```text
cross_market_momentum
```

from highest to lowest.

This places stronger movement signals earlier in the paginated collection.

### Backend Data Flow

The market movements integration follows the standard PMIP backend structure:

```text
track_market_movements
        ↓
tracks
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
intelligenceRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Market movement intelligence is served through:

```text
GET /api/intelligence/markets/movements
```

The endpoint returns paginated movement results.

### Frontend Service

The frontend accesses market movement intelligence through:

```text
frontend/src/services/intelligenceService.js
```

The service requests movement intelligence from the backend and returns the resulting collection to the relevant React component.

### Frontend Display

Market movement intelligence is displayed through:

```text
frontend/src/components/intelligence/MarketMovementsSection.jsx
```

This component is rendered inside:

```text
frontend/src/pages/IntelligencePage.jsx
```

The component is designed to handle:

```text
loading
successful results
empty results
API errors
```

### Current Empty-State Behaviour

The current latest intelligence run contains no market movement rows.

Therefore, the frontend currently displays:

```text
No market movement intelligence is available for the latest intelligence run.
```

This is a valid empty result.

It does not indicate that the backend endpoint or frontend integration is broken.

### Empty Result Interpretation

The current data flow can therefore be:

```text
successful API request
        ↓
zero movement records returned
        ↓
frontend empty state displayed
```

rather than:

```text
API failure
```

This distinction is important because the market movement integration is technically functioning even though the current intelligence run contains no result rows.

### Error Handling

The frontend handles:

```text
loading state
empty results
backend API errors
backend connection errors
```

This prevents a successful empty dataset from being confused with a system failure.

### Current Development Limit

The frontend currently requests only a small number of market movement records during development.

The request pattern uses pagination similar to:

```text
page = 1
limit = 5
```

If movement results are generated in future intelligence runs, the final dashboard should support proper:

```text
pagination
search
filtering
sorting
```

for larger collections.

### Integration Flow

The complete market movements integration can therefore be represented as:

```text
Market Growth Intelligence Analysis
        ↓
track_market_movements
        ↓
tracks
        ↓
countries
        ↓
intelligenceRepository.js
        ↓
intelligenceService.js
        ↓
intelligenceController.js
        ↓
GET /api/intelligence/markets/movements
        ↓
frontend/src/services/intelligenceService.js
        ↓
MarketMovementsSection.jsx
        ↓
IntelligencePage.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
Current Data State: No rows in the latest intelligence run
```

Market movement intelligence is successfully connected from the backend API to the public dashboard.

The current empty dashboard state reflects the absence of movement records in the latest analytical run rather than an integration failure.

## 11. Release Performance Intelligence Integration

### Purpose

The purpose of this section is to record how release-performance intelligence flows from PMIP analytical outputs into the backend API and then into the public React dashboard.

### Data Source

Release-performance intelligence is stored in the database table:

```text
release_performance_intelligence
```

The backend retrieves release-performance results together with related:

```text
releases
tracks
```

This is important because one release can contain multiple tracks, and each track can have its own release-performance result.

Important release-performance fields include:

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

### Multiple Track-Level Results

Release-performance intelligence is stored at track level.

This means one release can contain several performance rows.

The data relationship is therefore:

```text
one release
        ↓
multiple tracks
        ↓
multiple release-performance results
```

The backend and frontend are designed around this structure.

They do not assume:

```text
one release = one performance result
```

### Backend Repository

Release-performance data is retrieved through:

```text
backend/src/repositories/releaseRepository.js
```

The repository function used for this integration is:

```text
findPerformanceByReleaseId()
```

This function retrieves all performance rows belonging to the requested release.

The query also joins:

```text
tracks
releases
```

so that the API response contains useful track and release information alongside the analytical metrics.

### Latest Intelligence Run

The repository filters release-performance results to the latest available:

```text
run_id
```

from:

```text
release_performance_intelligence
```

This ensures that the public dashboard displays the most recent release-performance output rather than mixing older analytical runs.

### Backend Service

Release-performance retrieval is handled through:

```text
backend/src/services/releaseService.js
```

The service function is:

```text
getReleasePerformance()
```

The service first validates the release ID and confirms that the requested release exists.

It then retrieves the related performance rows.

The returned structure contains:

```text
release
+
performance
```

### Backend Controller

The controller logic is located in:

```text
backend/src/controllers/releaseController.js
```

The controller exposes the release-performance service through the public API.

If the requested release does not exist, the controller returns the standard PMIP resource-not-found response.

### Backend Route

The release-performance route is defined in:

```text
backend/src/routes/releaseRoutes.js
```

The route is:

```text
GET /api/releases/:releaseId/performance
```

The route is placed before the more general:

```text
GET /api/releases/:releaseId
```

route so that:

```text
/performance
```

is correctly interpreted as a nested release resource rather than as part of the release ID.

### API Response Structure

The release-performance endpoint returns a structure similar to:

```json
{
  "status": "success",
  "data": {
    "release": {},
    "performance": []
  }
}
```

The:

```text
release
```

object contains the selected release information.

The:

```text
performance
```

array contains one or more track-level release-performance intelligence results.

### Backend Data Flow

The release-performance integration follows:

```text
release_performance_intelligence
        ↓
tracks
        ↓
releases
        ↓
releaseRepository.js
        ↓
releaseService.js
        ↓
releaseController.js
        ↓
releaseRoutes.js
        ↓
REST API
```

### Backend API Endpoint

Release-performance intelligence is served through:

```text
GET /api/releases/:releaseId/performance
```

### Frontend Service

The frontend accesses release-performance intelligence through:

```text
frontend/src/services/releaseService.js
```

The relevant service function is:

```text
getReleasePerformance()
```

This function sends the selected release ID to the backend and returns the release-performance result to the React page.

### Frontend Display

Release-performance intelligence is displayed in:

```text
frontend/src/pages/ReleasePage.jsx
```

The user selects a release from the available release list.

The page then loads:

```text
release details
related tracks
release-performance intelligence
```

### Displayed Information

The frontend can display release-performance metrics including:

```text
Release Performance Class
Composite Release Performance Score
Composite Percentile
Release Rank
Streaming Performance Score
Chart Performance Score
Geographic Reach Score
Temporal Comparability Score
Artist-Release Relationship Score
Unusual Performance Score
Priority Class
Composite Evidence Strength
Composite Weight Coverage
Human Review Priority
Human Review Reason
```

The exact displayed fields depend on the available result data.

### Release Performance Visualisation

Release-performance intelligence is visualised using:

```text
frontend/src/components/releases/ReleasePerformanceChart.jsx
```

The chart compares:

```text
Track
vs
Composite Release Performance Score
```

This is especially useful for releases containing multiple tracks because each track can have a different analytical result.

### Optional Intelligence Handling

Release-performance intelligence is treated as optional.

The frontend separates:

```text
release details
related tracks
```

from:

```text
release-performance intelligence
```

This means that if the performance request fails or returns no intelligence, the release and its tracks can still be displayed.

### Empty-State Handling

If a release exists but has no release-performance result, the frontend displays an empty state rather than treating the entire release as invalid.

For example:

```text
No release-performance intelligence is currently available for this release.
```

### Error Handling

The frontend handles:

```text
release list loading
release details loading
release-performance loading
empty performance results
release-performance API errors
backend connection errors
```

This prevents optional intelligence problems from breaking the main release page.

### Integration Flow

The complete release-performance intelligence integration can therefore be represented as:

```text
Release Performance Intelligence Analysis
        ↓
release_performance_intelligence
        ↓
tracks
        ↓
releases
        ↓
releaseRepository.js
        ↓
releaseService.js
        ↓
releaseController.js
        ↓
GET /api/releases/:releaseId/performance
        ↓
frontend/src/services/releaseService.js
        ↓
ReleasePage.jsx
        ↓
ReleasePerformanceChart.jsx
        ↓
Public PMIP Dashboard
```

### Integration Status

```text
Status: Integrated
```

Release-performance intelligence is successfully connected from the stored analytical output through the backend API to the public dashboard.

The current implementation correctly supports multiple track-level performance results for a single release and keeps optional intelligence separate from essential release information.

## 12. Final Integration Audit Summary

### Purpose

The purpose of this final section is to summarise the current state of PMIP intelligence integration across the analytical, backend and frontend layers.

The audit reviewed each major intelligence feature and recorded:

```text
where the intelligence data comes from
which backend repository retrieves it
which backend endpoint serves it
which frontend service calls it
which React component displays it
whether the integration is currently complete
```

### Audited Intelligence Features

The following intelligence features were reviewed:

```text
1. Artist Momentum Intelligence
2. Track Forecasting Intelligence
3. Track Anomaly Intelligence
4. Artist Anomaly Summary Intelligence
5. Country Geographic Intelligence
6. Artist Geographic Intelligence
7. Country Market Growth Intelligence
8. Artist Market Growth Intelligence
9. Artist Final Growth Intelligence
10. Market Movements Intelligence
11. Release Performance Intelligence
```

### Integration Overview

The current PMIP intelligence flow follows the general architecture:

```text
Analytical / Intelligence Output
        ↓
Database Intelligence Table
        ↓
Backend Repository
        ↓
Backend Service
        ↓
Backend Controller
        ↓
Backend Route / REST API
        ↓
Frontend Service
        ↓
React Page / Component
        ↓
Public PMIP Dashboard
```

This architecture is used consistently across the main intelligence features.

### Integration Status Table

| Intelligence Feature | Main Data Source | Backend Endpoint | Frontend Display | Status |
|---|---|---|---|---|
| Artist Momentum | `artist_momentum_results` | `/api/intelligence/momentum/artists/:artistId` | `IntelligencePage.jsx` / `MomentumScoreChart.jsx` | Integrated |
| Track Forecasting | `forecast_results` | `/api/intelligence/forecasting/tracks/:trackId` | `IntelligencePage.jsx` / `ForecastComparisonChart.jsx` | Integrated |
| Track Anomalies | `streaming_anomaly_results` | `/api/intelligence/anomalies/tracks` | `IntelligencePage.jsx` / `TrackAnomalyChart.jsx` | Integrated |
| Artist Anomaly Summaries | `artist_anomaly_summary` | `/api/intelligence/anomalies/artists` | `IntelligencePage.jsx` / `ArtistAnomalyChart.jsx` | Integrated |
| Country Geographic Intelligence | `country_geographic_intelligence` | `/api/intelligence/geographic/countries` | `CountryGeographicSection.jsx` / `CountryGeographicChart.jsx` | Integrated |
| Artist Geographic Intelligence | `artist_geographic_intelligence` | `/api/intelligence/geographic/artists` | `ArtistGeographicSection.jsx` | Integrated |
| Country Market Growth | `country_market_growth` | `/api/intelligence/markets/countries` | `CountryMarketGrowthSection.jsx` / `CountryMarketGrowthChart.jsx` | Integrated |
| Artist Market Growth | `artist_market_growth` | `/api/intelligence/markets/artists` | `ArtistMarketGrowthSection.jsx` | Integrated |
| Artist Final Growth Intelligence | `artist_growth_intelligence` | `/api/intelligence/growth/artists/:artistId` | `ArtistDetailsPage.jsx` | Integrated |
| Market Movements | `track_market_movements` | `/api/intelligence/markets/movements` | `MarketMovementsSection.jsx` | Integrated, no rows in latest run |
| Release Performance | `release_performance_intelligence` | `/api/releases/:releaseId/performance` | `ReleasePage.jsx` / `ReleasePerformanceChart.jsx` | Integrated |

### Latest Intelligence Run Handling

Most PMIP intelligence repositories deliberately return results only from the latest relevant intelligence run.

The general pattern is:

```text
SELECT MAX(run_id)
FROM intelligence_runs
WHERE component_name = ...
```

or the equivalent latest-run logic for the relevant intelligence table.

This helps prevent older intelligence outputs from being mixed with more recent analytical results.

### Canonical Identity Handling

Several intelligence areas support source-only records where canonical PMIP IDs are unavailable.

Examples include:

```text
artist geographic intelligence
artist market growth
country market growth
market movements
```

The backend uses `LEFT JOIN` operations in these areas so that useful analytical results are not discarded when canonical mapping is incomplete.

The frontend can then fall back to values such as:

```text
source_artist_label
source_country
source_track_id
```

where required.

### Optional Intelligence Handling

The frontend does not assume that every entity must have every intelligence result.

Optional intelligence is separated from essential resource information.

Examples include:

```text
artist profile + optional momentum
artist profile + optional growth intelligence
track + optional forecasting intelligence
release + optional release-performance intelligence
```

This design prevents a missing analytical result from making a valid resource page appear broken.

### Loading, Empty and Error Handling

The audited intelligence features support frontend states such as:

```text
loading
successful result
empty result
unavailable intelligence
API error
backend connection error
```

This provides a clearer user experience than leaving sections blank when no result is available.

### Visualisation Integration

Several intelligence features include dedicated Recharts visualisations.

These include:

```text
MomentumScoreChart.jsx
ForecastComparisonChart.jsx
TrackAnomalyChart.jsx
ArtistAnomalyChart.jsx
CountryGeographicChart.jsx
CountryMarketGrowthChart.jsx
ReleasePerformanceChart.jsx
```

The charts are connected to API-derived intelligence and display the same analytical values presented in the related summary information.

### Current Development Limitations

Several collection endpoints are still requested using temporary development limits such as:

```text
page = 1
limit = 5
```

This applies to areas including:

```text
track anomalies
artist anomalies
country geographic intelligence
artist geographic intelligence
country market growth
artist market growth
market movements
```

This does not represent an integration failure.

It is a temporary frontend development decision.

The final application should later introduce proper:

```text
pagination
search
filtering
sorting
```

for large intelligence datasets.

### Market Movements Current State

The Market Movements feature is technically integrated.

However, the latest market-growth intelligence run currently contains no movement rows.

The current dashboard empty state therefore represents:

```text
successful integration
+
successful API request
+
zero current movement results
```

rather than a system failure.

### Release Performance Integration

Release-performance intelligence required an additional backend endpoint because the intelligence table existed before the public API route was available.

The completed integration now supports:

```text
one release
        ↓
multiple tracks
        ↓
multiple release-performance results
```

This confirms that release-performance intelligence is correctly represented at track level rather than forcing one result per release.

### Overall Audit Result

The audit shows that the main PMIP intelligence features are currently connected across the database, backend API and frontend dashboard.

The current system can be summarised as:

```text
Intelligence stored in PMIP database
        ↓
Backend retrieval implemented
        ↓
REST endpoints available
        ↓
Frontend service integration implemented
        ↓
React components display results
```

### Final Integration Status

```text
Overall Status: Integrated
```

The main PMIP intelligence components are successfully connected to the web application.

No major missing frontend-to-backend intelligence connection was identified during this audit.

The remaining work for the wider integration task should therefore focus on:

```text
model artefact review
precomputed vs live inference review
end-to-end validation of known examples
run_id consistency checks
canonical identifier checks
integration edge cases
final architecture documentation
```

The audit now provides a documented reference showing where each major intelligence feature comes from, how it is served by the backend and where it is displayed in the frontend.