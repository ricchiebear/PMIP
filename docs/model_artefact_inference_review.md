# PMIP Model Artefact and Inference Review

## 1. Purpose

The purpose of this review is to identify how PMIP's analytical and machine-learning components are currently used by the web application.

The review examines the model artefacts saved in the project, determines whether the Node.js and Express backend loads those artefacts directly, and classifies each intelligence feature as either using precomputed intelligence or live model inference.

The review also aims to clarify the current flow between:

```text
trained models or analytical pipelines
        ↓
generated intelligence results
        ↓
PMIP database
        ↓
backend API
        ↓
React frontend

## 2. Model Artefact Inventory

The PMIP project contains several model, configuration, metadata and result artefacts stored inside:

```text
models/
```

The current model directory is organised by intelligence feature.

The main folders identified are:

```text
models/
├── artist_momentum_scoring/
├── forecasting/
├── geographic_intelligence/
├── market_growth_intelligence/
├── release_performance_scoring/
└── streaming_anomaly_detection/
```

Each intelligence area contains a different combination of:

```text
configuration files
metadata files
saved model artefacts
preprocessing artefacts
result files
review files
```

### Artist Momentum Scoring

Artist momentum artefacts are stored inside:

```text
models/artist_momentum_scoring/
```

The current files include:

```text
config/pmip_artifact_manifest.json
config/pmip_scoring_configuration.json
config/pmip_scoring_metadata.json

results/pmip_artist_momentum_ranking.csv
results/pmip_artist_momentum_results.csv
results/pmip_indicator_contributions.csv
results/pmip_top_100_momentum_artists.csv
```

No serialized trained machine-learning model file was identified in this folder.

The artefacts mainly consist of:

```text
scoring configuration
metadata
ranking results
momentum results
indicator contribution results
```

This suggests that artist momentum is currently represented as an analytical scoring pipeline with precomputed outputs rather than a model that needs to be loaded directly by the web application.

### Forecasting

Forecasting artefacts are stored inside:

```text
models/forecasting/
```

The current files include:

```text
config/pmip_forecasting_feature_configuration.json
config/pmip_forecasting_model_metadata.json

model/pmip_forecasting_preprocessor.joblib
model/pmip_gradient_boosting_forecasting_pipeline.joblib

results/forecasting_results.csv
```

Forecasting contains serialized model artefacts.

These include:

```text
pmip_forecasting_preprocessor.joblib
pmip_gradient_boosting_forecasting_pipeline.joblib
```

The Gradient Boosting forecasting pipeline is therefore an actual trained machine-learning artefact that can potentially be loaded again for future prediction.

The preprocessing artefact is also preserved so that future prediction data can be transformed consistently with the data used during model development.

The folder also contains:

```text
forecasting_results.csv
```

which stores generated forecasting outputs.

### Geographic Intelligence

Geographic intelligence artefacts are stored inside:

```text
models/geographic_intelligence/
```

The current files include:

```text
config/geographic_intelligence_artifact_manifest.json
config/geographic_intelligence_configuration.json
config/geographic_intelligence_metadata_summary.csv
config/geographic_intelligence_schema_metadata.csv
```

No serialized trained machine-learning model file was identified in this folder.

The saved artefacts primarily describe:

```text
configuration
schema information
metadata
artifact structure
```

This indicates that geographic intelligence is currently based on an analytical intelligence pipeline rather than a model that needs to be loaded directly for each web request.

### Market Growth Intelligence

Market growth artefacts are stored inside:

```text
models/market_growth_intelligence/
```

The current files include:

```text
config/pmip_market_growth_metadata.json
config/pmip_market_growth_metadata_summary.csv
```

No serialized machine-learning model file was identified.

The current artefacts primarily contain:

```text
metadata
summary information
```

This suggests that market-growth intelligence is currently generated through analytical scoring or batch intelligence processing.

### Release Performance Scoring

Release-performance artefacts are stored inside:

```text
models/release_performance_scoring/
```

The current files include:

```text
config/artifact_metadata.json
config/classification_metadata.csv
config/indicator_metadata.csv
config/scoring_configuration.json

results/high_priority_releases.csv
results/human_review_queue.csv
results/release_intelligence_results.csv
results/responsible_use_principles.csv
results/section_12_results_summary.csv
results/section_13_human_review_summary.csv
```

No serialized trained machine-learning model file was identified.

The release-performance artefacts mainly contain:

```text
scoring configuration
classification metadata
indicator metadata
release intelligence results
priority results
human review outputs
responsible-use documentation
```

This indicates that release performance currently operates as an analytical scoring system that produces precomputed intelligence outputs.

### Streaming Anomaly Detection

Streaming anomaly-detection artefacts are stored inside:

```text
models/streaming_anomaly_detection/
```

The current files include:

```text
config/model_configuration.json
config/model_metadata.json
config/preprocessed_feature_schema.json
config/preprocessing_configuration.json

model/pca_reconstruction_model.pkl
model/robust_scaler.pkl

results/anomaly_direction_severity.csv
results/anomaly_results_manifest.json
results/artist_level_explanations.csv
results/final_anomaly_scores.csv
results/high_priority_anomaly_review.csv
results/human_review_controls.csv
results/human_review_policy.csv
results/human_review_validation.csv
```

Streaming anomaly detection contains serialized machine-learning artefacts:

```text
pca_reconstruction_model.pkl
robust_scaler.pkl
```

The PCA reconstruction model is the saved anomaly-detection model.

The robust scaler preserves the preprocessing transformation required before observations are evaluated by the PCA model.

The folder also contains several generated intelligence outputs covering:

```text
final anomaly scores
severity and direction
artist-level explanations
high-priority review
human review controls
validation
```

### Artefact Classification Summary

The current artefacts can be summarised as follows:

| Intelligence Feature | Serialized Model Artefact | Main Artefact Type |
|---|---|---|
| Artist Momentum | No obvious serialized model | Scoring configuration and precomputed results |
| Forecasting | Yes | Gradient Boosting model, preprocessing and forecast results |
| Geographic Intelligence | No obvious serialized model | Configuration and metadata |
| Market Growth Intelligence | No obvious serialized model | Metadata and analytical outputs |
| Release Performance | No obvious serialized model | Scoring configuration and precomputed intelligence results |
| Streaming Anomaly Detection | Yes | PCA model, scaler and anomaly results |

### Initial Artefact Finding

The inventory shows that PMIP currently contains two intelligence areas with clear serialized machine-learning model artefacts:

```text
Forecasting
Streaming Anomaly Detection
```

The remaining intelligence areas mainly preserve:

```text
configuration
metadata
scoring rules
analytical results
```

rather than trained models that need to be loaded directly by the web application.

This distinction will be used in the following sections to determine how each intelligence feature is currently served by PMIP and whether live model inference is necessary.

## 3. Backend Model Loading Review

A search of the current Node/Express backend source was performed for references to:

- `joblib`
- `pickle`
- `.pkl`
- `.joblib`
- `models/`

No references were found inside:

```text
backend/src
```

This confirms that the current PMIP backend does not directly load the saved Python model artefacts during API requests.

The current web application therefore serves precomputed intelligence stored in the PMIP database.

Forecasting and streaming anomaly detection have saved trained-model artefacts, but these artefacts are currently used outside the Node/Express request-response flow.

## 4. Intelligence Strategy Classification

The current PMIP intelligence features can be classified according to how they are served by the web application.

The two main strategies are:

```text
Precomputed intelligence
```

and:

```text
Live inference
```

### Precomputed Intelligence

Precomputed intelligence means that the analytical or machine-learning result is calculated before the user requests it from the dashboard.

The general flow is:

```text
Notebook / analytical pipeline
        ↓
Intelligence result generated
        ↓
Result stored in PMIP database
        ↓
Backend reads stored result
        ↓
Frontend displays result
```

The current PMIP web application primarily follows this approach.

### Live Inference

Live inference mean that the web application runs a trained model when the user makes a request.

The general flow would be:

```text
User request
        ↓
Backend receives input
        ↓
Trained model is loaded
        ↓
Input is preprocessed
        ↓
Model generates new prediction
        ↓
Prediction returned to frontend
```

The current Node.js and Express backend does not use this approach.

No direct loading of `.pkl` or `.joblib` model artefacts was identified inside:

```text
backend/src
```

### Artist Momentum

Artist momentum currently uses:

```text
Precomputed intelligence
```

The momentum scoring process generates artist momentum results before they are requested by the web application.

The final results are stored in:

```text
artist_momentum_results
```

The backend then retrieves the latest stored momentum result and serves it through the API.

No serialized momentum model is loaded by the backend.

### Track Forecasting

Track forecasting currently uses:

```text
Precomputed model predictions
```

Forecasting has saved machine-learning artefacts:

```text
pmip_forecasting_preprocessor.joblib
pmip_gradient_boosting_forecasting_pipeline.joblib
```

These confirm that a trained Gradient Boosting forecasting model exists.

However, the current web application does not load this model when a user requests a forecast.

Instead, predictions are generated beforehand and stored in:

```text
forecast_results
```

The backend reads the stored forecasting result and sends it to the frontend.

Therefore, forecasting is:

```text
Model-based
+
Precomputed
```

rather than live inference.

### Streaming Anomaly Detection

Streaming anomaly detection also currently uses:

```text
Precomputed model outputs
```

The project contains the saved artefacts:

```text
pca_reconstruction_model.pkl
robust_scaler.pkl
```

These artefacts represent the trained PCA anomaly-detection model and its preprocessing scaler.

However, the current Node.js backend does not load these files during API requests.

Anomaly results are calculated beforehand and stored in database tables such as:

```text
streaming_anomaly_results
artist_anomaly_summary
```

The backend then serves the stored anomaly intelligence.

Streaming anomaly detection is therefore:

```text
Model-based
+
Precomputed
```

### Geographic Intelligence

Geographic intelligence currently uses:

```text
Precomputed analytical intelligence
```

No serialized trained model artefact was identified for this intelligence area.

The geographic pipeline calculates metrics such as:

```text
country findings
artist geographic profiles
market penetration
international reach
geographic diversification
```

These outputs are stored in database tables such as:

```text
country_geographic_intelligence
artist_geographic_intelligence
```

The web application reads the stored results rather than recalculating geographic intelligence during each request.

### Market Growth Intelligence

Market growth currently uses:

```text
Precomputed analytical intelligence
```

No serialized trained machine-learning model was identified in the market-growth artefact directory.

The market-growth pipeline calculates outputs such as:

```text
emerging market scores
market growth scores
growth opportunities
final PMIP growth scores
```

These outputs are stored in database tables including:

```text
country_market_growth
artist_market_growth
artist_growth_intelligence
track_market_movements
```

The backend reads these stored intelligence results.

### Release Performance Intelligence

Release performance currently uses:

```text
Precomputed analytical scoring
```

No serialized trained machine-learning model was identified for this feature.

The release-performance pipeline applies scoring and classification logic to generate outputs such as:

```text
streaming performance score
chart performance score
geographic reach score
composite release performance score
release performance class
priority class
human review priority
```

These results are stored in:

```text
release_performance_intelligence
```

The backend then retrieves the stored release-performance results for the selected release.

### Strategy Classification Summary

| Intelligence Feature | Trained Model Artefact | Current Serving Strategy |
|---|---|---|
| Artist Momentum | No obvious serialized model | Precomputed analytical scoring |
| Track Forecasting | Yes | Precomputed model prediction |
| Streaming Anomaly Detection | Yes | Precomputed model output |
| Geographic Intelligence | No obvious serialized model | Precomputed analytical intelligence |
| Market Growth Intelligence | No obvious serialized model | Precomputed analytical intelligence |
| Release Performance Intelligence | No obvious serialized model | Precomputed analytical scoring |

### Current PMIP Strategy

The current PMIP architecture can therefore be summarised as:

```text
Models and analytical pipelines
        ↓
Generate intelligence beforehand
        ↓
Store intelligence in MySQL
        ↓
Node/Express backend reads latest results
        ↓
React dashboard displays intelligence
```

This means that PMIP currently follows a:

```text
Batch intelligence generation
+
Database-backed intelligence serving
```

architecture.

### Initial Assessment

The current strategy is suitable for the existing PMIP dashboard because most intelligence features do not need to be recalculated every time a user opens a page.

The main issue is not that intelligence is precomputed.

The main requirement is ensuring that the analytical pipelines are rerun often enough for the stored intelligence to remain current.

A scheduled intelligence-refresh process can therefore be considered later as a separate integration task.

## 5. Model-to-Database Result Flow

### Purpose

The purpose of this section is to identify how PMIP intelligence results move from the analytical or machine-learning stage into the MySQL database used by the web application.

The earlier sections confirmed that the Node.js and Express backend does not directly load saved Python model artefacts during normal API requests.

This means the important flow is:

```text
Model / analytical pipeline
        ↓
Generated intelligence results
        ↓
Persistence/import process
        ↓
PMIP database
        ↓
Backend API
        ↓
React frontend
```

This section verifies the persistence step between generated intelligence outputs and the database.

### Verified Persistence Architecture

A project-wide search confirmed that PMIP already contains dedicated Python import scripts inside:

```text
database/import/
```

These scripts contain database write operations such as:

```text
INSERT INTO
```

and are responsible for moving generated intelligence results into the appropriate MySQL intelligence tables.

The current PMIP architecture is therefore:

```text
Notebook / analytical pipeline
        ↓
CSV / result artefacts
        ↓
Python import script
        ↓
MySQL intelligence table
        ↓
Node/Express backend
        ↓
REST API
        ↓
React frontend
```

This confirms that PMIP has a persistence layer between the analytical pipelines and the web application.

---

### Forecasting Result Flow

Forecasting contains trained model artefacts:

```text
models/forecasting/model/pmip_forecasting_preprocessor.joblib
models/forecasting/model/pmip_gradient_boosting_forecasting_pipeline.joblib
```

The forecasting process generates:

```text
models/forecasting/results/forecasting_results.csv
```

The project contains the import script:

```text
database/import/06_import_forecasting_results.py
```

The search confirmed that this script contains:

```text
INSERT INTO intelligence_runs
```

and:

```text
INSERT INTO forecast_results
```

The verified forecasting flow is therefore:

```text
Gradient Boosting forecasting pipeline
        ↓
forecasting_results.csv
        ↓
06_import_forecasting_results.py
        ↓
intelligence_runs
        ↓
forecast_results
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

The web application does not run the Gradient Boosting model during the API request.

Instead, the model-generated predictions are imported into MySQL first.

---

### Artist Momentum Result Flow

Artist momentum produces result artefacts including:

```text
models/artist_momentum_scoring/results/pmip_artist_momentum_results.csv
models/artist_momentum_scoring/results/pmip_artist_momentum_ranking.csv
models/artist_momentum_scoring/results/pmip_indicator_contributions.csv
models/artist_momentum_scoring/results/pmip_top_100_momentum_artists.csv
```

The project contains the import script:

```text
database/import/07_import_artist_momentum_results.py
```

The search confirmed that this script contains:

```text
INSERT INTO intelligence_runs
```

and:

```text
INSERT INTO artist_momentum_results
```

The verified momentum flow is:

```text
Artist momentum scoring pipeline
        ↓
pmip_artist_momentum_results.csv
        ↓
07_import_artist_momentum_results.py
        ↓
intelligence_runs
        ↓
artist_momentum_results
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This confirms that artist momentum is calculated beforehand and then persisted to the database.

---

### Streaming Anomaly Result Flow

Streaming anomaly detection contains trained model artefacts:

```text
models/streaming_anomaly_detection/model/pca_reconstruction_model.pkl
models/streaming_anomaly_detection/model/robust_scaler.pkl
```

The pipeline also produces result artefacts including:

```text
final_anomaly_scores.csv
anomaly_direction_severity.csv
artist_level_explanations.csv
high_priority_anomaly_review.csv
human_review_controls.csv
human_review_policy.csv
human_review_validation.csv
```

The project contains:

```text
database/import/08_import_streaming_anomaly_results.py
```

The search confirmed that this script contains:

```text
INSERT INTO intelligence_runs
```

and:

```text
INSERT INTO streaming_anomaly_results
```

The verified track anomaly flow is therefore:

```text
PCA anomaly-detection pipeline
        ↓
Generated anomaly result files
        ↓
08_import_streaming_anomaly_results.py
        ↓
intelligence_runs
        ↓
streaming_anomaly_results
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This confirms that anomaly detection is model-based but still served through precomputed database results.

---

### Artist Anomaly Summary Result Flow

Artist-level anomaly summaries are handled separately from individual streaming anomaly rows.

The project contains:

```text
database/import/08b_import_artist_anomaly_summaries.py
```

The search confirmed that this script writes into:

```text
artist_anomaly_summaries
```

and reads from:

```text
streaming_anomaly_results
```

This means the artist-level anomaly summary flow is:

```text
Streaming anomaly results
        ↓
08b_import_artist_anomaly_summaries.py
        ↓
artist_anomaly_summaries
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This creates a higher-level artist summary from the underlying anomaly results.

---

### Geographic Intelligence Result Flow

The project contains:

```text
database/import/09_import_geographic_intelligence.py
```

The search confirmed that this script creates a new intelligence run and writes into multiple geographic intelligence tables.

These include:

```text
country_geographic_intelligence
artist_geographic_intelligence
track_geographic_intelligence
```

The script also contains a write operation for:

```text
track_market_movements
```

The verified geographic flow is:

```text
Geographic intelligence pipeline
        ↓
Generated geographic outputs
        ↓
09_import_geographic_intelligence.py
        ↓
intelligence_runs
        ↓
country_geographic_intelligence
artist_geographic_intelligence
track_geographic_intelligence
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This confirms that geographic intelligence is generated beforehand and persisted before being served to the web application.

---

### Market Growth Result Flow

The project contains:

```text
database/import/10_import_market_growth_intelligence.py
```

The search confirmed that this script creates an intelligence run and writes into multiple market-growth tables.

These include:

```text
country_market_growth
track_market_growth
artist_market_growth
track_growth_intelligence
artist_growth_intelligence
```

The verified market-growth flow is therefore:

```text
Market-growth intelligence pipeline
        ↓
Generated market-growth outputs
        ↓
10_import_market_growth_intelligence.py
        ↓
intelligence_runs
        ↓
country_market_growth
track_market_growth
artist_market_growth
track_growth_intelligence
artist_growth_intelligence
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This confirms that PMIP market-growth intelligence is stored in MySQL before being accessed by the application.

---

### Release Performance Result Flow

Release-performance scoring produces result artefacts including:

```text
models/release_performance_scoring/results/release_intelligence_results.csv
models/release_performance_scoring/results/high_priority_releases.csv
models/release_performance_scoring/results/human_review_queue.csv
```

The project contains:

```text
database/import/11_import_release_performance_intelligence.py
```

The search confirmed that this script writes into:

```text
intelligence_runs
```

and:

```text
release_performance_intelligence
```

The verified release-performance flow is:

```text
Release-performance scoring pipeline
        ↓
release_intelligence_results.csv
        ↓
11_import_release_performance_intelligence.py
        ↓
intelligence_runs
        ↓
release_performance_intelligence
        ↓
Node/Express backend
        ↓
Frontend dashboard
```

This confirms that release-performance scoring is also persisted before being served to the user.

---

### Intelligence Run Registration

Several import scripts create records inside:

```text
intelligence_runs
```

before inserting the corresponding intelligence results.

This is important because the backend later uses `run_id` to identify the latest available intelligence.

The general pattern is:

```text
Import script starts
        ↓
New intelligence_runs record created
        ↓
New run_id generated
        ↓
Results inserted using that run_id
        ↓
Backend later selects latest relevant run_id
```

This gives PMIP traceability between:

```text
analytical component
generated intelligence
database records
API output
```

---

### Verified Import Scripts

The following persistence scripts were identified:

```text
database/import/06_import_forecasting_results.py
database/import/07_import_artist_momentum_results.py
database/import/08_import_streaming_anomaly_results.py
database/import/08b_import_artist_anomaly_summaries.py
database/import/09_import_geographic_intelligence.py
database/import/10_import_market_growth_intelligence.py
database/import/11_import_release_performance_intelligence.py
```

These scripts provide the persistence layer between PMIP's generated analytical outputs and the MySQL database.

---

### Complete Verified Intelligence Flow

The current PMIP intelligence architecture can therefore be represented as:

```text
Raw / processed music data
        ↓
Notebook / analytical pipeline
        ↓
Model prediction or analytical score
        ↓
CSV / result artefact
        ↓
database/import/*.py
        ↓
intelligence_runs
        ↓
Intelligence result tables
        ↓
Node/Express repository
        ↓
Service
        ↓
Controller
        ↓
REST API
        ↓
Frontend service
        ↓
React component
        ↓
Public PMIP Dashboard
```

---

### Current Limitation

The persistence mechanism itself is now verified.

However, this review has not yet confirmed that the import scripts are automatically triggered whenever a new analytical pipeline run is completed.

The current project contains the required import scripts, but scheduling and orchestration still need to be reviewed separately.

This means PMIP currently has:

```text
Automated import capability
```

but the project still needs to determine whether it has:

```text
Automated scheduled execution
```

for the complete intelligence-refresh workflow.

---

### Section 5 Finding

```text
Status: Verified
```

PMIP has a confirmed model-to-database persistence layer.

Generated model and analytical outputs are imported into MySQL using dedicated Python scripts before being served by the Node.js backend.

The missing architectural question is no longer how results reach the database.

The next question is whether any PMIP intelligence feature would benefit from live inference instead of the current precomputed approach.

## 6. Live Inference Assessment

### Purpose

The purpose of this section is to assess whether any PMIP intelligence feature should run its analytical or machine-learning model live when a user makes a request, instead of relying on precomputed intelligence stored in MySQL.

The current PMIP architecture mainly follows this pattern:

```text
Model / analytical pipeline
        ↓
Result generated beforehand
        ↓
Result imported into MySQL
        ↓
Backend reads stored result
        ↓
Frontend displays result
```

This section evaluates whether that approach should remain in place or whether any intelligence feature would benefit from live inference.

---

### What Live Inference Would Mean

Live inference means generating a new prediction or model output at the moment the user requests it.

A live inference flow would look like:

```text
User request
        ↓
Backend receives request
        ↓
Input data prepared
        ↓
Saved model loaded
        ↓
Model performs inference
        ↓
New prediction generated
        ↓
Result returned to frontend
```

This would be different from the current PMIP approach where results are already stored before the dashboard request is made.

---

### Benefits of Live Inference

Live inference can be useful where:

```text
the user provides new input
the prediction must be generated immediately
the result cannot reasonably be precomputed
the input changes frequently
the application needs an interactive prediction feature
```

For example, a system where a user enters a new track's features and asks:

```text
What streaming performance does PMIP predict for this track?
```

could potentially require live inference.

---

### Limitations of Live Inference

Live inference also introduces additional complexity.

The application would need to handle:

```text
model loading
Python model execution
feature preparation
preprocessing consistency
prediction latency
model failures
model version management
resource usage
deployment compatibility
```

The current backend is:

```text
Node.js + Express
```

while the trained PMIP model artefacts are Python/scikit-learn artefacts such as:

```text
.joblib
.pkl
```

The Node.js backend cannot directly use those Python model files without introducing an additional Python-based inference layer or another interoperability approach.

---

### Artist Momentum Assessment

Artist momentum currently uses analytical scoring rather than a saved trained model that needs to run during each web request.

Momentum scores depend on broader artist-performance signals and ranking information.

Recalculating this intelligence whenever a user opens an artist page would provide little benefit.

Artist momentum is therefore well suited to:

```text
Precomputed intelligence
```

Recommended strategy:

```text
Keep precomputed
```

---

### Forecasting Assessment

Forecasting is the strongest candidate for possible live inference because it has an actual trained Gradient Boosting model:

```text
pmip_gradient_boosting_forecasting_pipeline.joblib
```

and a saved preprocessing artefact:

```text
pmip_forecasting_preprocessor.joblib
```

However, the current dashboard does not ask the user to provide new forecasting features.

Instead, users retrieve forecasting results for tracks already known to PMIP.

For the current dashboard use case, the prediction can therefore be generated during the forecasting pipeline and stored in:

```text
forecast_results
```

Recommended strategy for the current application:

```text
Keep precomputed
```

Live inference may become useful later if PMIP introduces a feature where users submit new track information and request an immediate forecast.

---

### Streaming Anomaly Detection Assessment

Streaming anomaly detection uses saved model artefacts:

```text
pca_reconstruction_model.pkl
robust_scaler.pkl
```

Anomaly detection is based on streaming observations and is designed to detect unusual behaviour across incoming data.

Running the anomaly model every time a user opens the dashboard would not be efficient.

A better approach is:

```text
new streaming data arrives
        ↓
anomaly pipeline runs
        ↓
new anomaly results generated
        ↓
results stored
        ↓
dashboard displays latest results
```

Recommended strategy:

```text
Keep precomputed / scheduled batch inference
```

---

### Geographic Intelligence Assessment

Geographic intelligence calculates broader market-level and artist-level metrics across large datasets.

Examples include:

```text
international reach
market penetration
geographic diversification
country findings
artist geographic profiles
```

These calculations depend on aggregated data rather than a single user request.

Running them live for every dashboard visit would increase processing cost without providing meaningful additional value.

Recommended strategy:

```text
Keep precomputed
```

---

### Market Growth Intelligence Assessment

Market-growth intelligence also depends on aggregated performance data across artists, tracks and countries.

Outputs include:

```text
emerging market scores
market-growth scores
growth opportunities
PMIP growth scores
market movement signals
```

These calculations are more suitable for scheduled intelligence refreshes than request-time execution.

Recommended strategy:

```text
Keep precomputed
```

---

### Release Performance Assessment

Release-performance intelligence combines multiple indicators including:

```text
streaming performance
chart performance
geographic reach
temporal comparability
artist-release relationship
unusual performance behaviour
```

The resulting score represents a broader analytical assessment of the release and its tracks.

Recalculating these scores every time a release page is opened would provide little benefit.

Recommended strategy:

```text
Keep precomputed
```

---

### Live Inference Classification Summary

| Intelligence Feature | Live Inference Needed Now? | Recommended Strategy |
|---|---:|---|
| Artist Momentum | No | Precomputed |
| Track Forecasting | No for current dashboard | Precomputed prediction |
| Streaming Anomaly Detection | No | Scheduled batch inference |
| Geographic Intelligence | No | Precomputed |
| Market Growth Intelligence | No | Precomputed |
| Release Performance Intelligence | No | Precomputed |

---

### Forecasting as a Future Live-Inference Candidate

Forecasting remains the most realistic future live-inference candidate.

A future PMIP feature could allow a user to provide information for a track that does not yet have a stored forecast.

The flow could then become:

```text
User provides track features
        ↓
Python inference service
        ↓
Forecasting preprocessor
        ↓
Gradient Boosting model
        ↓
New prediction
        ↓
Backend
        ↓
Frontend
```

This would require a separate Python inference service or API layer.

It is not required for the current PMIP dashboard.

---

### Recommended Current Approach

For the current version of PMIP, the existing precomputed architecture should remain in place.

The preferred flow is:

```text
New data arrives
        ↓
Intelligence pipelines run
        ↓
Models / scoring systems generate new results
        ↓
Python import scripts persist results
        ↓
MySQL stores intelligence
        ↓
Node/Express serves latest results
        ↓
React dashboard displays intelligence
```

The main improvement needed is therefore not live inference.

The more important improvement is:

```text
automated intelligence refresh scheduling
```

so that precomputed results remain current as new data becomes available.

---

### Section 6 Finding

```text
Status: Reviewed
```

No current PMIP intelligence feature requires live inference for the existing public dashboard.

Forecasting and streaming anomaly detection use trained machine-learning models, but both can continue to generate outputs outside the web request-response cycle.

The current batch and database-backed architecture is suitable for PMIP.

The next step is to define the recommended final inference architecture for the platform.


## 7. Recommended PMIP Inference Architecture

### Purpose

The purpose of this section is to define the most suitable inference architecture for the current PMIP application based on the findings from the model artefact review.

The review has shown that PMIP currently uses a combination of:

```text
trained machine-learning models
analytical scoring pipelines
precomputed intelligence
database-backed serving
```

The recommended architecture should preserve the strengths of the current system while making future intelligence updates easier to manage.

### Recommended Architecture

The recommended PMIP inference architecture is:

```text
Raw / updated music data
        ↓
Data preparation and feature engineering
        ↓
Analytical / machine-learning pipelines
        ↓
Generated intelligence outputs
        ↓
Python import scripts
        ↓
MySQL intelligence tables
        ↓
Node/Express backend
        ↓
REST API
        ↓
React frontend
```

This should remain the default architecture for the current PMIP application.

### Why This Architecture Fits PMIP

Most PMIP intelligence features depend on:

```text
large datasets
aggregated artist information
market-level calculations
historical observations
cross-market comparisons
ranking calculations
model preprocessing
```

These operations do not need to be repeated every time a user opens a dashboard page.

Running them beforehand provides several advantages:

```text
faster frontend responses
lower backend processing requirements
consistent results for all users
clear run history
easier debugging
better model traceability
simpler deployment
```

### Role of the Analytical Layer

The analytical layer should remain responsible for:

```text
training models
loading saved model artefacts
preparing features
performing predictions
calculating scores
generating classifications
producing intelligence outputs
```

This work should remain primarily within the Python-based PMIP intelligence pipelines.

The Node.js backend should not become responsible for reproducing the analytical logic.

### Role of Saved Model Artefacts

Saved model artefacts should remain available for reproducibility and future intelligence generation.

Examples include:

```text
models/forecasting/model/pmip_gradient_boosting_forecasting_pipeline.joblib
models/forecasting/model/pmip_forecasting_preprocessor.joblib

models/streaming_anomaly_detection/model/pca_reconstruction_model.pkl
models/streaming_anomaly_detection/model/robust_scaler.pkl
```

These files should be used by the Python intelligence pipelines when new predictions or anomaly results need to be generated.

They do not currently need to be loaded directly by the Node.js backend.

### Role of Result Artefacts

Generated CSV and metadata artefacts should continue to provide an intermediate, inspectable output between analytical processing and database persistence.

Examples include:

```text
forecasting_results.csv
pmip_artist_momentum_results.csv
final_anomaly_scores.csv
release_intelligence_results.csv
```

This provides a useful audit trail because the generated intelligence can be inspected before or after it is imported into the database.

### Role of Python Import Scripts

The dedicated import scripts inside:

```text
database/import/
```

should continue to handle persistence into MySQL.

Examples include:

```text
06_import_forecasting_results.py
07_import_artist_momentum_results.py
08_import_streaming_anomaly_results.py
08b_import_artist_anomaly_summaries.py
09_import_geographic_intelligence.py
10_import_market_growth_intelligence.py
11_import_release_performance_intelligence.py
```

These scripts provide a clear boundary between:

```text
analytical generation
```

and:

```text
application data storage
```

### Role of `intelligence_runs`

The:

```text
intelligence_runs
```

table should remain an important part of the architecture.

Each new intelligence refresh should create a new run record.

This allows PMIP to track:

```text
which component generated the result
which version produced it
when it was generated
which run_id the result belongs to
```

The backend can then continue to retrieve the latest relevant run.

### Role of the Node/Express Backend

The Node.js and Express backend should primarily be responsible for:

```text
validating requests
querying MySQL
retrieving intelligence
applying API-level filtering
handling pagination
returning structured responses
handling errors
```

It should not be responsible for running heavy Python machine-learning models during normal dashboard requests.

This keeps the backend lightweight and focused on application serving.

### Role of the React Frontend

The React frontend should remain responsible for:

```text
collecting user input
calling REST endpoints
displaying intelligence
visualising results
showing loading states
showing empty states
showing errors
explaining analytical outputs
```

The frontend should not contain model logic or reproduce analytical calculations.

### Recommended Intelligence Refresh Model

The main architectural improvement should be introducing a controlled intelligence-refresh process.

The recommended future flow is:

```text
New source data available
        ↓
Refresh process triggered
        ↓
Relevant intelligence pipelines run
        ↓
New result artefacts generated
        ↓
Import scripts run
        ↓
New intelligence_runs record created
        ↓
New intelligence rows stored
        ↓
Backend automatically serves latest run
```

This allows the dashboard to remain fast while still keeping intelligence current.

### Scheduled Refresh Strategy

The refresh frequency does not need to be identical for every intelligence feature.

A possible future schedule could be:

```text
Artist Momentum
→ Daily

Forecasting
→ Daily or after meaningful new track data

Streaming Anomaly Detection
→ Daily or after new streaming observations

Geographic Intelligence
→ Daily or weekly

Market Growth Intelligence
→ Weekly

Release Performance Intelligence
→ Daily or after new release-performance data
```

The exact schedule should depend on:

```text
data availability
processing cost
business need
expected update frequency
```

### Scheduled Pipeline Orchestration

A future orchestration layer could trigger the required intelligence components in sequence.

A conceptual flow could be:

```text
run_intelligence_pipeline
        ↓
run forecasting
        ↓
import forecasting results
        ↓
run momentum scoring
        ↓
import momentum results
        ↓
run anomaly detection
        ↓
import anomaly results
        ↓
run geographic intelligence
        ↓
import geographic results
        ↓
run market growth
        ↓
import market-growth results
        ↓
run release performance
        ↓
import release-performance results
```

The exact implementation should be treated as a separate integration task.

### Failure Handling

The future refresh process should record whether each component:

```text
started
completed successfully
failed
produced no results
```

A failed analytical run should not automatically replace the latest successful intelligence available to the web application.

This would prevent incomplete or broken intelligence runs from becoming the public dashboard's active results.

### Model Versioning

Saved models and analytical components should continue to have identifiable versions.

Where possible, intelligence-run metadata should record:

```text
component_name
component_version
generated_at
run_id
```

This helps explain which version of a model or analytical pipeline generated a displayed result.

### Future Live Inference

Live inference should not be introduced unless a future feature genuinely requires it.

For example, a future forecasting tool might allow a user to submit a completely new track and request an immediate prediction.

In that case, PMIP could introduce a separate Python inference service:

```text
React frontend
        ↓
Node/Express backend
        ↓
Python inference API
        ↓
saved forecasting model
        ↓
prediction
        ↓
Node/Express
        ↓
React frontend
```

This should remain separate from the current dashboard intelligence-serving architecture.

### Recommended Final Architecture

The recommended PMIP architecture is therefore:

```text
                 PMIP Intelligence Layer
                          ↓
        ┌─────────────────────────────────┐
        │ Python analytical pipelines     │
        │ ML models                       │
        │ scoring systems                 │
        └─────────────────────────────────┘
                          ↓
                 Generated artefacts
                          ↓
                Python import scripts
                          ↓
                     MySQL
                          ↓
                  Node/Express API
                          ↓
                    React frontend
                          ↓
                 Public PMIP Dashboard
```

### Section 7 Finding

```text
Recommended Strategy:
Batch intelligence generation
+
Scheduled refresh
+
Database-backed serving
```

The current PMIP architecture should remain primarily precomputed.

The main architectural improvement should be automating the refresh cycle so that new intelligence is generated and imported regularly without requiring manual execution.

Live inference should remain a future optional capability rather than a requirement for the current dashboard.

## 8. Task 2 Summary

### Purpose

The purpose of Task 2 was to review the PMIP model artefacts and determine how machine-learning and analytical intelligence are currently used by the web application.

The review focused on:

```text
saved model artefacts
configuration files
result artefacts
backend model loading
precomputed intelligence
database persistence
live inference requirements
recommended inference architecture
```

### Artefact Review Summary

The PMIP project contains intelligence artefacts for:

```text
artist momentum scoring
forecasting
geographic intelligence
market growth intelligence
release performance scoring
streaming anomaly detection
```

Two intelligence areas contain clear serialized machine-learning model artefacts:

```text
Forecasting
Streaming Anomaly Detection
```

Forecasting contains:

```text
pmip_forecasting_preprocessor.joblib
pmip_gradient_boosting_forecasting_pipeline.joblib
```

Streaming anomaly detection contains:

```text
pca_reconstruction_model.pkl
robust_scaler.pkl
```

The remaining intelligence areas mainly contain:

```text
configuration
metadata
scoring rules
analytical results
```

rather than serialized trained models.

### Backend Model Loading Finding

A search of:

```text
backend/src
```

found no references to:

```text
joblib
pickle
.pkl
.joblib
models/
```

This confirms that the current Node.js and Express backend does not directly load Python model artefacts during API requests.

### Current Intelligence Strategy

The PMIP web application currently uses:

```text
precomputed intelligence
```

rather than live inference.

The general architecture is:

```text
Analytical / ML pipeline
        ↓
Intelligence generated beforehand
        ↓
Results persisted in MySQL
        ↓
Node/Express backend
        ↓
REST API
        ↓
React frontend
```

### Intelligence Strategy Classification

The current intelligence features can be classified as:

| Intelligence Feature | Current Strategy |
|---|---|
| Artist Momentum | Precomputed analytical scoring |
| Track Forecasting | Precomputed model prediction |
| Streaming Anomaly Detection | Precomputed model output |
| Geographic Intelligence | Precomputed analytical intelligence |
| Market Growth Intelligence | Precomputed analytical intelligence |
| Release Performance Intelligence | Precomputed analytical scoring |

### Model-to-Database Persistence

The review confirmed that PMIP already has dedicated Python import scripts for moving generated intelligence results into MySQL.

The main scripts include:

```text
database/import/06_import_forecasting_results.py
database/import/07_import_artist_momentum_results.py
database/import/08_import_streaming_anomaly_results.py
database/import/08b_import_artist_anomaly_summaries.py
database/import/09_import_geographic_intelligence.py
database/import/10_import_market_growth_intelligence.py
database/import/11_import_release_performance_intelligence.py
```

These scripts create or use:

```text
intelligence_runs
```

and insert generated intelligence into the relevant database tables.

### Verified Persistence Flow

The verified PMIP persistence architecture is:

```text
Notebook / analytical pipeline
        ↓
Generated result artefacts
        ↓
Python import scripts
        ↓
intelligence_runs
        ↓
MySQL intelligence tables
        ↓
Node/Express backend
        ↓
React frontend
```

This confirms that PMIP already has a clear boundary between:

```text
intelligence generation
```

and:

```text
web application serving
```

### Live Inference Assessment

No current PMIP dashboard feature requires live inference.

The current precomputed strategy is appropriate because most intelligence depends on:

```text
large datasets
historical observations
aggregated metrics
ranking calculations
cross-market analysis
batch scoring
```

Running these calculations every time a user opens a page would add unnecessary complexity and processing cost.

### Forecasting

Forecasting is the strongest future candidate for live inference because a trained Gradient Boosting model already exists.

However, the current dashboard only retrieves forecasts for tracks already known to PMIP.

Therefore:

```text
Current recommendation:
Keep forecasting precomputed
```

Live inference should only be considered later if PMIP introduces an interactive feature where users submit new track information and request an immediate prediction.

### Streaming Anomaly Detection

Streaming anomaly detection should remain:

```text
scheduled / batch inference
```

The PCA model should run when new streaming data is available rather than every time a user opens the dashboard.

### Recommended Architecture

The recommended PMIP inference architecture is:

```text
New / updated music data
        ↓
Python analytical and ML pipelines
        ↓
Generated intelligence
        ↓
Python import scripts
        ↓
MySQL
        ↓
Node/Express API
        ↓
React dashboard
```

The Node.js backend should remain focused on:

```text
validation
database access
API responses
pagination
error handling
```

rather than loading and executing Python models directly.

### Main Improvement Identified

The main architectural improvement needed is not live inference.

The more important improvement is:

```text
scheduled intelligence refresh
```

A future refresh process should automatically:

```text
run the required intelligence pipelines
generate new outputs
run the import scripts
create new intelligence runs
store fresh intelligence
allow the backend to serve the latest successful results
```

### Scheduling as Follow-Up Work

The scheduling and orchestration system should be treated as a separate integration task.

Possible future scheduling could include:

```text
Momentum
→ Daily

Forecasting
→ Daily or after new meaningful track data

Streaming Anomaly Detection
→ Daily or after new streaming observations

Geographic Intelligence
→ Daily or weekly

Market Growth Intelligence
→ Weekly

Release Performance
→ Daily or after new release data
```

The exact refresh frequency should be decided according to data availability and processing requirements.

### Task 2 Final Finding

```text
Task 2 — Review Model Artefacts and Inference Strategy
Status: Complete
```

The review confirms that PMIP currently uses a suitable:

```text
Batch intelligence generation
+
Database-backed serving
```

architecture.

Forecasting and streaming anomaly detection retain trained machine-learning artefacts, but the public web application does not need to execute those models during normal user requests.

The next integration work should focus on validating the complete end-to-end data flow and later introducing an automated intelligence-refresh schedule.