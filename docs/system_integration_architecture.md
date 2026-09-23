# PMIP Final System Integration Architecture

## 1. Purpose

This document describes the final integration architecture of the Public Music Intelligence Platform (PMIP).

The purpose is to explain how the major technical parts of the system connect:

```text
Data Sources
        ↓
Analytical Notebooks / Intelligence Pipelines
        ↓
Model and Analytical Artefacts
        ↓
Database Import Layer
        ↓
MySQL Database
        ↓
Node.js / Express Backend
        ↓
REST API
        ↓
React Frontend
        ↓
PMIP Dashboard
```

PMIP uses a layered architecture so that analytical processing, data storage, backend services and frontend presentation remain separate but connected.

This separation makes the system easier to:

```text
develop
test
maintain
extend
debug
deploy
```

---

## 2. High-Level System Architecture

The overall PMIP architecture can be represented as:

```text
┌───────────────────────────────┐
│      Source Music Data        │
│                               │
│ Streaming / Artist / Market   │
│ Release / Geographic Data     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Analytical Notebooks          │
│ and Intelligence Pipelines    │
│                               │
│ Forecasting                   │
│ Momentum                      │
│ Anomaly Detection             │
│ Geographic Intelligence       │
│ Market Growth                 │
│ Release Performance           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Analytical Artefacts          │
│                               │
│ CSV results                   │
│ JSON configurations           │
│ Joblib / Pickle models        │
│ Metadata                      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Python Import Scripts         │
│                               │
│ database/import/              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ MySQL Database                │
│                               │
│ Core Music Data               │
│ Intelligence Results          │
│ Intelligence Runs             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Node.js / Express Backend     │
│                               │
│ Repository                    │
│ Service                       │
│ Controller                    │
│ Routes                        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ REST API                      │
│                               │
│ /api/...                      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ React + Vite Frontend         │
│                               │
│ Pages                         │
│ Components                    │
│ Charts                        │
│ API Services                  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ PMIP Public Dashboard         │
└───────────────────────────────┘
```

---

## 3. Analytical Intelligence Layer

The intelligence layer is responsible for generating PMIP analytical outputs.

The main analytical components are:

```text
Artist Momentum Scoring
Artist Performance Forecasting
Streaming Anomaly Detection
Geographic Intelligence
Market Growth Intelligence
Release Performance Scoring
```

These components were developed primarily through Jupyter notebooks and supporting Python processing.

The analytical layer does not run inside the Node.js backend during a normal API request.

Instead, PMIP currently follows a:

```text
batch intelligence generation
+
database-backed serving
```

architecture.

This means that intelligence is generated before the user requests it.

---

## 4. Model and Analytical Artefacts

Generated analytical artefacts are stored under:

```text
models/
```

The major artefact groups include:

```text
models/artist_momentum_scoring/
models/forecasting/
models/geographic_intelligence/
models/market_growth_intelligence/
models/release_performance_scoring/
models/streaming_anomaly_detection/
```

Depending on the analytical component, these directories contain:

```text
model files
preprocessors
configuration files
metadata
CSV outputs
review queues
result summaries
```

### Forecasting

The forecasting component contains serialized machine-learning artefacts including:

```text
pmip_gradient_boosting_forecasting_pipeline.joblib
pmip_forecasting_preprocessor.joblib
```

The final forecasting results are also exported as analytical output.

### Streaming Anomaly Detection

The anomaly-detection component contains:

```text
pca_reconstruction_model.pkl
robust_scaler.pkl
```

together with anomaly result files and review metadata.

### Analytical Components Without Serialized Predictive Models

Some PMIP intelligence components are analytical scoring systems rather than runtime predictive models.

Examples include:

```text
Artist Momentum
Geographic Intelligence
Market Growth
Release Performance
```

Their calculated results are exported and later imported into the PMIP database.

---

## 5. Intelligence Generation Strategy

The current PMIP intelligence strategy is:

```text
Input data
        ↓
Notebook / analytical pipeline
        ↓
Data preparation
        ↓
Feature engineering
        ↓
Model or scoring process
        ↓
Validation / evaluation
        ↓
Final analytical results
        ↓
CSV / artefact output
```

The Node.js backend does not directly execute:

```text
Python
joblib models
pickle models
Jupyter notebooks
```

during a web request.

This keeps the public application independent from the computational intelligence-generation environment.

---

## 6. Database Import Layer

After analytical results are generated, Python import scripts move the intelligence outputs into MySQL.

These scripts are located under:

```text
database/import/
```

Important intelligence import scripts include:

```text
06_import_forecasting_results.py
07_import_artist_momentum_results.py
08_import_streaming_anomaly_results.py
08b_import_artist_anomaly_summaries.py
09_import_geographic_intelligence.py
10_import_market_growth_intelligence.py
11_import_release_performance_intelligence.py
```

The integration flow is therefore:

```text
Notebook / intelligence pipeline
        ↓
Result artefact
        ↓
Python import script
        ↓
MySQL intelligence table
```

The import layer provides a clear boundary between analytical generation and the production application.

---

## 7. Intelligence Run Tracking

PMIP uses:

```text
intelligence_runs
```

to track analytical executions.

Each analytical component is associated with a component name such as:

```text
artist_momentum_scoring
artist_performance_forecasting
streaming_anomaly_detection
geographic_intelligence
market_growth_intelligence
```

Intelligence result rows contain a:

```text
run_id
```

which links them to a particular analytical execution.

The backend normally retrieves the latest relevant run using logic such as:

```sql
SELECT MAX(run_id)
FROM intelligence_runs
WHERE component_name = '...'
```

This prevents different historical intelligence generations from being mixed in the dashboard.

Release-performance intelligence currently identifies its latest run from:

```text
release_performance_intelligence
```

using the highest available `run_id`.

A future scheduled intelligence pipeline should strengthen this mechanism by selecting the latest successfully completed run rather than only the highest numerical run ID.

---

## 8. MySQL Database Layer

The PMIP database stores both:

```text
core music entities
```

and:

```text
generated intelligence
```

### Core Entities

Examples include:

```text
artists
tracks
releases
countries
streaming_observations
```

These provide the canonical entities used by the application.

### Intelligence Tables

Important intelligence tables include:

```text
artist_momentum_results
forecast_results
streaming_anomaly_results
artist_anomaly_summaries

country_geographic_intelligence
artist_geographic_intelligence
track_geographic_intelligence

country_market_growth
artist_market_growth
track_market_growth

artist_growth_intelligence
track_growth_intelligence
track_market_movements

release_performance_intelligence
```

The database therefore acts as the main bridge between:

```text
offline intelligence generation
```

and:

```text
online web application delivery
```

---

## 9. Canonical Entity Integration

PMIP uses internal canonical identifiers including:

```text
artist_id
track_id
release_id
country_id
```

These IDs connect analytical outputs to the main music entities.

The general relationship is:

```text
analytical source identity
        ↓
identity mapping
        ↓
canonical PMIP ID
        ↓
intelligence table
        ↓
backend joins
        ↓
frontend display
```

Where canonical mapping is unavailable, source-level identifiers can be preserved.

Examples include:

```text
source_artist_label
source_artist_key
source identity fields
```

This allows PMIP to preserve analytical information without forcing uncertain entity matches.

---

## 10. Backend Architecture

The PMIP backend uses:

```text
Node.js
Express.js
MySQL
```

and follows a layered architecture.

The main flow is:

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

Each layer has a different responsibility.

### Routes

Routes define HTTP endpoints.

Example:

```text
GET /api/intelligence/momentum/artists/:artistId
```

### Controllers

Controllers:

```text
receive requests
read request parameters
call the service layer
return HTTP responses
```

### Services

Services contain application-level logic between the controller and repository.

They help keep database code separate from HTTP handling.

### Repositories

Repositories are responsible for:

```text
SQL queries
joins
pagination
latest-run filtering
database retrieval
```

This architecture prevents SQL logic from being embedded directly inside frontend-facing routes.

---

## 11. Intelligence API Layer

The backend exposes intelligence through REST endpoints.

Important examples include:

### Geographic Intelligence

```text
GET /api/intelligence/geographic/countries
GET /api/intelligence/geographic/artists
GET /api/intelligence/geographic/tracks
```

### Market Growth Intelligence

```text
GET /api/intelligence/markets/movements
GET /api/intelligence/markets/countries
GET /api/intelligence/markets/artists
GET /api/intelligence/markets/tracks
```

### Final Growth Intelligence

```text
GET /api/intelligence/growth/artists
GET /api/intelligence/growth/tracks
GET /api/intelligence/growth/artists/:artistId
```

### Artist Momentum

```text
GET /api/intelligence/momentum/artists
GET /api/intelligence/momentum/artists/:artistId
```

### Forecasting

```text
GET /api/intelligence/forecasting/tracks
GET /api/intelligence/forecasting/tracks/:trackId
```

### Streaming Anomalies

```text
GET /api/intelligence/anomalies/tracks
GET /api/intelligence/anomalies/artists
```

### Release Performance

```text
GET /api/releases/:releaseId/performance
```

The API therefore provides the boundary between the backend data layer and the React application.

---

## 12. Frontend Architecture

The PMIP frontend uses:

```text
React
Vite
React Router
Recharts
native fetch
CSS
```

The frontend does not query MySQL directly.

Instead:

```text
React component
        ↓
frontend API service
        ↓
REST endpoint
        ↓
Express backend
        ↓
MySQL
```

This separation protects the database from direct browser access and keeps application logic within the backend.

---

## 13. Frontend Intelligence Integration

The main intelligence dashboard is implemented through:

```text
frontend/src/pages/IntelligencePage.jsx
```

This page integrates major analytical features including:

```text
Artist Momentum
Track Forecasting
Track Anomalies
Artist Anomaly Summaries
Geographic Intelligence
Market Growth Intelligence
```

Supporting components include intelligence-specific sections and charts.

Examples include:

```text
MomentumScoreChart.jsx
ForecastComparisonChart.jsx
TrackAnomalyChart.jsx
ArtistAnomalyChart.jsx
```

Additional intelligence is integrated into entity-specific pages.

### Artist Details

```text
ArtistDetailsPage.jsx
```

can display final artist growth intelligence.

### Release Details

```text
ReleasePage.jsx
```

loads release-performance intelligence through:

```text
GET /api/releases/:releaseId/performance
```

and can display the results using:

```text
ReleasePerformanceChart.jsx
```

---

## 14. Complete Artist Momentum Flow

Artist momentum provides a clear example of the complete system architecture.

```text
Momentum notebook / scoring pipeline
        ↓
pmip_artist_momentum_results.csv
        ↓
07_import_artist_momentum_results.py
        ↓
artist_momentum_results
        ↓
intelligenceRepository
        ↓
intelligenceService
        ↓
intelligenceController
        ↓
GET /api/intelligence/momentum/artists/:artistId
        ↓
frontend API request
        ↓
IntelligencePage
        ↓
MomentumScoreChart
        ↓
Displayed artist momentum intelligence
```

This flow was directly validated using:

```text
Artist ID: 1184
Artist: Bryan Martin
Momentum Score: 100.00
```

---

## 15. Complete Forecasting Flow

Track forecasting follows:

```text
Forecasting notebook
        ↓
Gradient Boosting forecasting pipeline
        ↓
forecasting_results.csv
        ↓
06_import_forecasting_results.py
        ↓
forecast_results
        ↓
backend repository
        ↓
service
        ↓
controller
        ↓
GET /api/intelligence/forecasting/tracks/:trackId
        ↓
React frontend
        ↓
ForecastComparisonChart
```

The end-to-end flow was validated using:

```text
Track ID: 119
Track: Believer
```

The database, API and frontend returned matching predicted and actual streaming values.

---

## 16. Complete Anomaly Detection Flow

Streaming anomaly intelligence follows:

```text
Streaming observations
        ↓
anomaly detection notebook
        ↓
robust scaling
        ↓
PCA reconstruction model
        ↓
anomaly scoring
        ↓
result artefacts
        ↓
08_import_streaming_anomaly_results.py
        ↓
streaming_anomaly_results
        ↓
backend API
        ↓
React dashboard
```

Artist-level anomaly summaries are also generated and imported into:

```text
artist_anomaly_summaries
```

The anomaly integration was directly validated using:

```text
Track: Starboy
Anomaly Severity: Extreme
Anomaly Direction: Positive
```

---

## 17. Geographic Intelligence Flow

Geographic intelligence follows:

```text
processed geographic data
        ↓
geographic intelligence pipeline
        ↓
analytical result artefacts
        ↓
09_import_geographic_intelligence.py
        ↓
country_geographic_intelligence
artist_geographic_intelligence
track_geographic_intelligence
        ↓
backend API
        ↓
frontend geographic intelligence sections
```

The frontend retrieves the latest geographic intelligence run rather than combining historical runs.

---

## 18. Market Growth Intelligence Flow

Market-growth intelligence follows:

```text
historical market / streaming data
        ↓
market-growth analytical pipeline
        ↓
growth calculations
        ↓
10_import_market_growth_intelligence.py
        ↓
country_market_growth
artist_market_growth
track_market_growth
artist_growth_intelligence
track_growth_intelligence
track_market_movements
        ↓
backend API
        ↓
React frontend
```

Market Movements currently provides a useful empty-data example.

The latest intelligence run contains no movement rows.

The system correctly handles this as:

```text
database: no rows
        ↓
API: empty result
        ↓
frontend: empty-state message
```

rather than reporting an application failure.

---

## 19. Release Performance Intelligence Flow

Release-performance intelligence follows:

```text
release and track performance data
        ↓
release-performance scoring pipeline
        ↓
release_intelligence_results.csv
        ↓
11_import_release_performance_intelligence.py
        ↓
release_performance_intelligence
        ↓
releaseRepository
        ↓
release service/controller
        ↓
GET /api/releases/:releaseId/performance
        ↓
ReleasePage
        ↓
ReleasePerformanceChart
```

The architecture supports:

```text
one release
        ↓
multiple tracks
        ↓
multiple performance intelligence rows
```

This prevents the system from incorrectly assuming that every release contains only one track.

---

## 20. Missing Intelligence Handling

PMIP treats analytical intelligence as optional where appropriate.

For example:

```text
artist exists
        ↓
momentum result unavailable
        ↓
artist remains valid
        ↓
frontend displays unavailable intelligence
```

The same principle applies to:

```text
forecasting
growth intelligence
release performance
other analytical sections
```

This prevents a missing analytical result from breaking the core entity page.

---

## 21. Empty Result Handling

The frontend distinguishes between:

```text
loading
successful result
empty result
unavailable intelligence
API error
backend connection error
```

This distinction is important because:

```text
no intelligence currently available
```

is not the same as:

```text
system failure
```

The Market Movements integration confirmed this behaviour.

---

## 22. Integration Strategy Summary

PMIP currently uses the following integration strategy:

```text
OFFLINE / BATCH SIDE

Data
 ↓
Notebook / Pipeline
 ↓
Model or analytical scoring
 ↓
Result artefacts
 ↓
Python import script


DATABASE BOUNDARY

MySQL
 ↓
Intelligence tables
 ↓
Latest run selection


ONLINE APPLICATION SIDE

Repository
 ↓
Service
 ↓
Controller
 ↓
REST API
 ↓
React frontend
 ↓
Dashboard
```

This architecture keeps computational analytical processing separate from public application requests.

---

## 23. Why PMIP Does Not Currently Use Live Model Inference

Although PMIP contains trained forecasting and anomaly-detection models, the Node.js backend does not load those models during API requests.

For the current dashboard, live inference is not required.

The present approach provides several advantages:

```text
faster API responses
simpler backend
lower runtime requirements
repeatable analytical outputs
easier validation
clear run history
reduced coupling between Python and Node.js
```

Forecasting could become a candidate for live inference in the future if PMIP introduces functionality such as:

```text
submit new track features
        ↓
generate immediate forecast
```

That is different from the current dashboard, which primarily displays generated intelligence.

---

## 24. Future Scheduled Intelligence Refresh Architecture

The main future integration improvement is automatic intelligence refresh.

The intended architecture is:

```text
New source data
        ↓
Scheduled pipeline
        ↓
Run analytical components
        ↓
Generate new artefacts
        ↓
Execute database imports
        ↓
Create new intelligence run
        ↓
Validate successful completion
        ↓
Backend automatically reads latest successful run
        ↓
Frontend receives refreshed intelligence
```

A future scheduled process could therefore replace the current manual execution workflow.

Possible technologies may include:

```text
cron / launchd for local development
GitHub Actions
cloud schedulers
container-based scheduled jobs
workflow orchestration tools
```

The specific deployment mechanism can be selected during the deployment phase.

---

## 25. Future Run-Status Improvement

The current backend generally assumes:

```text
MAX(run_id)
=
latest valid run
```

This is sufficient for the current manually controlled workflow.

For automated scheduling, `intelligence_runs` should ideally track statuses such as:

```text
started
completed
failed
partial
```

The backend could then retrieve:

```text
latest successful completed run
```

instead of simply retrieving the largest `run_id`.

This would protect the dashboard from partially completed or failed intelligence refreshes.

---

## 26. Final Integration Architecture

The completed PMIP integration can be summarised as:

```text
Raw / Processed Music Data
            ↓
Jupyter Notebooks
            ↓
ML Models / Analytical Scoring
            ↓
Generated Intelligence Artefacts
            ↓
Python Database Import Scripts
            ↓
MySQL Intelligence Tables
            ↓
Latest Intelligence Run Selection
            ↓
Backend Repository Layer
            ↓
Backend Service Layer
            ↓
Backend Controller Layer
            ↓
Express REST API
            ↓
Frontend API Integration
            ↓
React Pages and Components
            ↓
Charts / Intelligence Explanations
            ↓
PMIP Public Analytics Dashboard
```

Each layer has a clear responsibility and communicates with the next layer through a defined boundary.

---

## 27. Final Integration Assessment

The PMIP system now connects its major technical components successfully:

```text
analytical notebooks
models and scoring pipelines
result artefacts
database import scripts
MySQL intelligence tables
backend repositories
services
controllers
REST endpoints
React frontend
dashboard visualisations
```

Previous integration testing confirmed that analytical values can travel correctly from the database through the backend and into the user interface.

Representative end-to-end validation included:

```text
Artist Momentum
Track Forecasting
Track Anomaly Intelligence
```

Additional intelligence features were also tested during frontend development and integration.

The architecture correctly supports:

```text
latest-run intelligence
optional intelligence
canonical entity IDs
source-only identities
multi-track releases
empty analytical results
```

No major integration issue remains that prevents the current intelligence architecture from supporting the PMIP web application.

---

## 28. Task 5 Status

```text
Task 5 — Document Final System Integration Architecture
Status: Complete
```

The final PMIP system integration architecture has been documented from analytical generation through database persistence, backend delivery and frontend presentation.

The next major platform phase can therefore move beyond core intelligence integration.