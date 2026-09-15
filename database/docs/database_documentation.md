# PMIP Database Documentation

## 7.1 Database Overview

The Public Music Intelligence Platform (PMIP) database provides the central data layer for the PMIP software application. Its purpose is to store the platform's core music data, historical streaming information, model and intelligence outputs, and the relationships required to support the backend API and public analytics dashboard.

The database brings together the outputs from the six PMIP intelligence components:

1. Artist Performance Forecasting
2. Artist Momentum Scoring
3. Streaming Anomaly Detection
4. Geographic Performance Intelligence
5. Market Growth Intelligence
6. Release Performance Intelligence

The database also stores the core entities required to connect these intelligence outputs together, including artists, tracks, releases, countries, streaming observations, and intelligence execution records.

### Core Music Data

The core layer contains the main entities used across PMIP:

- `artists` stores artist identities.
- `tracks` stores track records and source track identifiers.
- `track_artists` creates the many-to-many relationship between tracks and artists.
- `releases` stores release-level information.
- `release_tracks` connects tracks to releases.
- `countries` stores the markets represented in PMIP.

These tables provide the main reference entities used by the intelligence components.

### Historical Streaming Data

The `streaming_observations` table stores historical track performance observations by country and date.

Each observation can include information such as:

- track
- country
- observation date
- stream count
- chart position

This historical layer supports temporal analysis, anomaly detection, geographic intelligence, and market-growth analysis.

### Intelligence Run Tracking

The `intelligence_runs` table records individual executions of PMIP intelligence components.

Each intelligence run stores information such as:

- the intelligence component name
- component version
- generation time

Intelligence result tables reference an appropriate `run_id`, allowing PMIP to trace stored results back to the intelligence process that generated them.

### Intelligence Result Storage

PMIP stores intelligence outputs in dedicated tables rather than placing all analytical results into one large table.

The forecasting component stores results in:

- `forecast_results`

The artist momentum component stores results in:

- `artist_momentum_results`

The streaming anomaly component stores results in:

- `streaming_anomaly_results`
- `artist_anomaly_summaries`

The geographic intelligence component stores results in:

- `country_geographic_intelligence`
- `artist_geographic_intelligence`
- `track_geographic_intelligence`
- `track_market_movements`

The market growth component stores results in:

- `country_market_growth`
- `track_market_growth`
- `track_growth_intelligence`
- `artist_market_growth`
- `artist_growth_intelligence`

The release performance component stores results in:

- `release_performance_intelligence`

### Source Identity Preservation

Some intelligence datasets contain source identities that cannot always be matched directly to an existing PMIP core entity.

Instead of discarding these rows, PMIP preserves their original source identities.

Examples include fields such as:

- `source_track_id`
- `source_artist_label`
- `source_artist_key`
- `source_country`
- `source_release_id`

Where a reliable PMIP entity match exists, the corresponding internal ID is also stored. Where a reliable match does not exist, the internal ID may remain `NULL` while the original source identity remains preserved.

This allows PMIP to retain complete intelligence outputs without creating incorrect relationships.

### Database Role in the PMIP Application

The database acts as the connection point between the intelligence-development stage and the software application.

The upcoming PMIP backend API will retrieve information from these tables and expose structured data to the analytics dashboard.

For example, the backend will be able to retrieve:

- artist intelligence profiles
- track forecasting results
- streaming anomaly information
- geographic performance intelligence
- country-level market information
- artist and track growth opportunities
- release performance intelligence

Because the intelligence components are stored alongside PMIP's core music entities, the backend can also combine information from multiple components when the underlying entities share valid relationships.

### Database Validation Status

Before backend development begins, the database was tested for:

- row-count consistency
- foreign-key integrity
- duplicate identity rules
- source-identity preservation
- representative data retrieval
- cross-component joins

These tests confirmed that the PMIP database can support the next development stage: building the backend API.

## 7.2 Final Task 6 Validation Summary

Task 6 focused on testing and validating the completed PMIP database before beginning backend API development.

The validation process covered six main areas.

### 6.1 Row Count Validation

The database was checked to confirm that the expected number of records had been imported into the core, historical, and intelligence tables.

Key stored records included:

- 29,823 artists
- 95,281 tracks
- 143,818 track-artist relationships
- 4,100 releases
- 4,593 release-track relationships
- 77 countries
- 5,372,332 streaming observations
- 897 forecasting results
- 1,003 artist momentum results
- 2,940,071 streaming anomaly results
- 6,553 artist anomaly summaries
- 49,843 artist geographic intelligence records
- 110,198 track geographic intelligence records
- 353,282 track-market movement records
- 178,400 track-market growth records
- 112,213 artist-market growth records
- 51,593 track growth intelligence records
- 27,652 artist growth intelligence records
- 4,593 release performance intelligence records

The validation confirmed that imported row counts matched the expected prepared datasets.

### 6.2 Foreign-Key Integrity

Foreign-key integrity checks were performed across the core and intelligence layers.

The checks included relationships such as:

- track artists to tracks
- track artists to artists
- release tracks to releases
- release tracks to tracks
- streaming observations to tracks
- streaming observations to countries
- forecasting results to tracks
- artist momentum results to artists
- anomaly results to streaming observations
- geographic intelligence to artists, tracks, countries, and intelligence runs
- market growth intelligence to artists, tracks, countries, and intelligence runs
- release performance intelligence to tracks, releases, and intelligence runs

All tested foreign-key integrity checks returned an orphan count of zero.

This confirmed that stored internal PMIP relationships do not reference missing parent records.

### 6.3 Duplicate Identity Validation

Duplicate checks were performed using the unique identity rules designed for each table.

The validation confirmed that no unintended duplicate identity groups existed for the core relationships and intelligence source identities.

Examples included:

- `track_id + artist_id`
- `release_id + track_id`
- `track_id + country_id + observation_date`
- `track_id + run_id`
- `artist_id + run_id`
- source track identity plus run
- source artist identity plus run
- source release identity plus run

Two apparent duplicate cases were investigated separately.

For streaming anomaly results, repeated `observation_id` values existed because the source anomaly dataset could contain more than one source row mapped to the same PMIP observation. The actual uniqueness rule uses `source_index + run_id`, and this check returned zero duplicate groups.

For artist geographic intelligence, case-normalised source keys could represent multiple distinct exact source labels such as differently capitalised artist identities. Exact source-label validation using binary comparison returned zero duplicate groups.

Therefore, the intended database uniqueness rules were confirmed to be working correctly.

### 6.4 Source Identity Preservation

Source identity preservation was specifically tested for the intelligence components where not every source record could be reliably linked to a PMIP core entity.

The validation confirmed that source identities were retained even when an internal PMIP ID was unavailable.

For example:

- artist geographic intelligence stored all 49,843 source identities
- track geographic intelligence stored all 110,198 source identities
- track-market movements stored all 353,282 source identities
- artist-market growth stored all 112,213 source identities
- track-market growth stored all 178,400 source identities
- artist growth intelligence stored all 27,652 source identities
- track growth intelligence stored all 51,593 source identities
- release performance intelligence stored all 4,593 source release identities

No tested rows were missing their required source identity.

This confirms that unmatched intelligence outputs are preserved rather than discarded or incorrectly forced into a PMIP core relationship.

### 6.5 Representative Retrieval Testing

Representative retrieval queries were tested to confirm that data can be retrieved in the form expected by the future backend API.

Successful retrieval tests included:

- artist intelligence retrieval
- artist momentum results
- artist anomaly summaries
- geographic intelligence
- growth intelligence
- track forecasting results
- track geographic intelligence
- track growth intelligence
- country intelligence
- streaming anomaly results
- release performance intelligence

The tests successfully returned meaningful intelligence values, classifications, scores, identities, and linked core PMIP information.

This demonstrated that the database can support practical application queries rather than only storing records.

### 6.6 Cross-Component Join Testing

Cross-component joins were tested to confirm that the core PMIP entities can connect different intelligence components.

| Cross-Component Join | Joined Rows |
|---|---:|
| Forecast → Track | 897 |
| Momentum → Artist | 1,003 |
| Anomaly → Observation → Track | 2,940,071 |
| Geographic Track → Track | 90,688 |
| Growth Track → Track | 41,664 |
| Geographic + Growth → Track | 41,664 |
| Geographic Artist → Artist | 14,733 |
| Growth Artist → Artist | 9,357 |
| Geographic + Growth → Artist | 9,418 |
| Geographic + Growth → Country | 76 |
| Release Intelligence → Track | 4,593 |
| Release Intelligence → Release | 4,593 |

These results confirm that the PMIP database supports both direct entity retrieval and cross-component intelligence queries.

The forecasting dataset does not share the same mapped track universe as the geographic and growth components. This was identified during validation and is treated as a source-data coverage difference rather than a database integrity failure.

### Task 6 Final Result

Task 6 was completed successfully.

The PMIP database has been validated for:

- expected record counts
- referential integrity
- duplicate-control rules
- preservation of source identities
- representative data retrieval
- cross-component integration

The database is therefore considered ready to support backend API development.

## 7.3 ERD and Schema Documentation

The PMIP database is organised into 22 tables grouped into five main areas:

1. Core music entities
2. Historical streaming data
3. Intelligence run tracking
4. Intelligence result tables
5. Relationship tables connecting core entities and intelligence outputs

The database design uses primary keys, foreign keys, unique constraints, and source-identity fields to preserve both internal PMIP relationships and the original identities produced by the intelligence workflows.

### Core Music Entity Tables

#### `artists`

Stores the main PMIP artist entities.

Key fields include:

- `artist_id` — primary key
- `artist_name`
- `created_at`
- `updated_at`

The table is referenced by artist-related intelligence tables and the `track_artists` relationship table.

#### `tracks`

Stores PMIP track entities.

Key fields include:

- `track_id` — primary key
- `source_track_id` — original external/source track identifier
- `isrc` — International Standard Recording Code where available
- `track_name`
- `created_at`
- `updated_at`

The table acts as one of the main linking entities across forecasting, streaming history, geographic intelligence, market-growth intelligence, anomaly results, and release intelligence.

#### `track_artists`

Creates the many-to-many relationship between tracks and artists.

Key fields include:

- `track_id`
- `artist_id`

The combination of `track_id` and `artist_id` forms the relationship identity.

#### `releases`

Stores PMIP release entities.

Key fields include:

- `release_id` — primary key
- `release_title`
- `release_date`
- `release_type`
- `created_at`
- `updated_at`

A release can contain one or more tracks.

#### `release_tracks`

Connects PMIP releases to tracks.

Key fields include:

- `release_id`
- `track_id`

This table allows the application to navigate between a release and the tracks associated with it.

#### `countries`

Stores the countries or markets represented in PMIP.

Key fields include:

- `country_id` — primary key
- `country_name`
- `country_code`

Country records are referenced by historical streaming, geographic intelligence, and market-growth intelligence.

### Historical Streaming Table

#### `streaming_observations`

Stores historical track performance by country and observation date.

Key fields include:

- `observation_id` — primary key
- `track_id`
- `country_id`
- `observation_date`
- `streams`
- `chart_position`

The unique observation identity is based on:

`track_id + country_id + observation_date`

This prevents duplicate historical observations for the same track, market, and date.

### Intelligence Run Tracking

#### `intelligence_runs`

Stores metadata about PMIP intelligence executions.

Key fields include:

- `run_id` — primary key
- `component_name`
- `component_version`
- `generated_at`

Each intelligence result table references a `run_id`.

This allows PMIP to distinguish results generated by different components or different executions of the same component.

### Forecasting Intelligence

#### `forecast_results`

Stores track-level forecasting outputs.

Key fields include:

- `forecast_result_id`
- `track_id`
- `run_id`
- `predicted_spotify_streams`
- `prediction_date`
- `feature_coverage`
- `high_forecast_review_flag`

The forecasting result is linked to a PMIP track and the intelligence run that produced it.

### Artist Momentum Intelligence

#### `artist_momentum_results`

Stores artist-level momentum results.

Key fields include:

- `momentum_result_id`
- `artist_id`
- `run_id`
- `final_momentum_score`
- `momentum_category`
- `shared_score_rank`
- `displayed_position`
- component and contribution measures

This table provides a direct link between a PMIP artist and their calculated momentum profile.

### Streaming Anomaly Intelligence

#### `streaming_anomaly_results`

Stores observation-level anomaly-detection results.

Key fields include:

- `anomaly_result_id`
- `source_index`
- `observation_id`
- `run_id`
- `pca_reconstruction_error`
- `anomaly_score_ratio`
- `anomaly_score_margin`
- `anomaly_score_excess_pct`
- `is_final_pca_anomaly`
- `anomaly_direction`
- `anomaly_severity`
- `severity_rank`
- `model_partition`

The source identity is preserved through `source_index`.

Multiple source anomaly records can map to the same PMIP `observation_id`, so `source_index + run_id` is used to preserve the original anomaly-result identity.

#### `artist_anomaly_summaries`

Stores artist-level summaries derived from streaming anomaly results.

Key fields include:

- `artist_anomaly_summary_id`
- `source_artist_label`
- `artist_id`
- `run_id`
- total observation and anomaly counts
- anomaly-rate measures
- maximum anomaly scores
- `artist_review_score`
- `artist_level_explanation`
- `latest_observation_date`

The original source artist identity is retained even where multiple source labels map to the same canonical PMIP artist.

### Geographic Intelligence

#### `country_geographic_intelligence`

Stores country-level geographic performance intelligence.

Key fields include:

- `country_geo_result_id`
- `country_id`
- `run_id`
- observation and stream measures
- chart-performance measures
- percentile measures
- `country_findings_index`
- `country_findings_class`

#### `artist_geographic_intelligence`

Stores geographic intelligence for artist source identities.

Key fields include:

- `artist_geo_result_id`
- `source_artist_label`
- `source_artist_key`
- `source_artist_identity_key`
- `artist_id`
- `run_id`
- market reach measures
- penetration measures
- concentration measures
- diversification measures
- geographic profile measures
- findings index and class

`artist_id` is nullable because some geographic source identities represent collaborations or grouped artist identities rather than one individual PMIP artist.

The exact source identity is preserved separately to prevent case-sensitive identities from being incorrectly merged.

#### `track_geographic_intelligence`

Stores final track-level geographic intelligence.

Key fields include:

- `track_geo_result_id`
- `source_track_id`
- `track_id`
- `run_id`
- `geographic_reach_score`
- `market_penetration_score`
- `geographic_concentration_score`
- `geographic_expansion_indicator`
- `geographic_intelligence_score`
- `geographic_balance_index`
- geographic classifications and performance profiles

`source_track_id` preserves the original geographic source identity.

#### `track_market_movements`

Stores track-country geographic movement information.

Key fields include:

- `movement_id`
- `source_track_id`
- `source_country`
- `track_id`
- `country_id`
- `run_id`
- observation-period dates
- market-entry information
- movement-related fields

This table preserves the exact source track-country identity while linking to PMIP tracks and countries where a reliable mapping exists.

### Market Growth Intelligence

#### `country_market_growth`

Stores country-level market-growth intelligence.

Key fields include:

- `country_growth_result_id`
- `source_country`
- `country_id`
- `run_id`
- `emerging_market_score`
- `emerging_market_class`

#### `track_market_growth`

Stores track-country market-growth results.

Key fields include:

- `track_market_growth_id`
- `source_track_id`
- `source_country`
- `track_id`
- `country_id`
- `run_id`
- `market_growth_score`
- `market_growth_class`

The source identity is based on the combination of source track, source country, and intelligence run.

#### `track_growth_intelligence`

Stores final track-level growth intelligence.

Key fields include:

- `track_growth_result_id`
- `source_track_id`
- `track_id`
- `run_id`
- `mean_market_growth_score`
- `maximum_track_emerging_market_score`
- `growth_opportunity_score`
- `growth_opportunity_class`
- `pmip_growth_score`
- `pmip_growth_class`
- `pmip_growth_rank`
- `pmip_priority_class`

#### `artist_market_growth`

Stores artist-country market-growth results.

Key fields include:

- `artist_market_growth_id`
- `source_artist_label`
- `source_artist_key`
- `source_country`
- `artist_id`
- `country_id`
- `run_id`
- `market_growth_score`
- `market_growth_class`

Source artist identities are preserved even when the source represents a collaboration or cannot be linked to one canonical PMIP artist.

#### `artist_growth_intelligence`

Stores final artist-level growth intelligence.

Key fields include:

- `artist_growth_result_id`
- `source_artist_label`
- `source_artist_key`
- `artist_id`
- `run_id`
- `mean_market_growth_score`
- `maximum_artist_emerging_market_score`
- `growth_opportunity_score`
- `growth_opportunity_class`
- `pmip_growth_score`
- `pmip_growth_class`
- `pmip_growth_rank`
- `pmip_priority_class`

### Release Performance Intelligence

#### `release_performance_intelligence`

Stores final release-performance intelligence results.

Key fields include:

- `release_performance_id`
- `source_release_id`
- `track_id`
- `release_id`
- `run_id`
- component performance scores
- composite release performance score and percentile
- rank and classification fields
- evidence coverage and strength
- priority signals
- human-review fields

The source `release_id` produced by the release-performance workflow was found to represent an ISRC-style source identity rather than the integer PMIP `release_id`.

For this reason:

- `source_release_id` preserves the original intelligence identity
- `track_id` links the result to the PMIP track
- `release_id` links the result to the normalised PMIP release

This design allows every release-performance source row to be preserved without incorrectly treating an ISRC as a database release identifier.

### Relationship Overview

At a high level, the main database relationships are:

- artists ↔ tracks through `track_artists`
- releases ↔ tracks through `release_tracks`
- tracks ↔ countries through `streaming_observations`
- tracks ↔ forecasting through `forecast_results`
- artists ↔ momentum through `artist_momentum_results`
- observations ↔ anomaly intelligence through `streaming_anomaly_results`
- artists ↔ anomaly summaries through `artist_anomaly_summaries`
- countries ↔ geographic intelligence
- artists ↔ geographic intelligence
- tracks ↔ geographic intelligence
- tracks and countries ↔ market movement intelligence
- countries ↔ market-growth intelligence
- artists ↔ market-growth intelligence
- tracks ↔ market-growth intelligence
- tracks and releases ↔ release-performance intelligence
- all intelligence result tables ↔ `intelligence_runs`

This structure allows the PMIP backend to start from a core entity such as an artist, track, release, or country and retrieve the relevant intelligence outputs where valid relationships exist.

### ERD

The PMIP Entity Relationship Diagram represents the 22-table database structure and shows the primary-key and foreign-key relationships between the core music entities, historical streaming observations, intelligence runs, and intelligence output tables.

The ERD source is maintained in:

`database/docs/pmip_database_erd.puml`

The ERD should be updated if future backend development introduces new tables, views, or relationships.

## 7.4 Backend-Facing Table Reference

This section provides a compact reference for the PMIP backend API. It identifies the role of each database table and the main entity through which the backend should access it.

| Table | Layer | Main Purpose | Primary Backend Link |
|---|---|---|---|
| `artists` | Core | Stores canonical PMIP artists | `artist_id` |
| `tracks` | Core | Stores canonical PMIP tracks | `track_id` |
| `track_artists` | Core Relationship | Connects artists and tracks | `artist_id`, `track_id` |
| `releases` | Core | Stores PMIP releases | `release_id` |
| `release_tracks` | Core Relationship | Connects releases and tracks | `release_id`, `track_id` |
| `countries` | Core | Stores countries and markets | `country_id` |
| `streaming_observations` | Historical | Stores historical track-country observations | `observation_id`, `track_id`, `country_id` |
| `intelligence_runs` | System | Records intelligence executions | `run_id` |
| `forecast_results` | Forecasting | Stores track forecasting results | `track_id`, `run_id` |
| `artist_momentum_results` | Momentum | Stores artist momentum intelligence | `artist_id`, `run_id` |
| `streaming_anomaly_results` | Anomaly | Stores observation-level anomaly results | `observation_id`, `run_id` |
| `artist_anomaly_summaries` | Anomaly | Stores artist anomaly summaries | `artist_id`, `run_id` |
| `country_geographic_intelligence` | Geographic | Stores country geographic intelligence | `country_id`, `run_id` |
| `artist_geographic_intelligence` | Geographic | Stores artist geographic intelligence | `artist_id`, source identity, `run_id` |
| `track_geographic_intelligence` | Geographic | Stores track geographic intelligence | `track_id`, source identity, `run_id` |
| `track_market_movements` | Geographic | Stores track-country market movements | `track_id`, `country_id`, source identity |
| `country_market_growth` | Growth | Stores country growth intelligence | `country_id`, `run_id` |
| `track_market_growth` | Growth | Stores track-country growth results | `track_id`, `country_id`, source identity |
| `track_growth_intelligence` | Growth | Stores final track growth intelligence | `track_id`, source identity, `run_id` |
| `artist_market_growth` | Growth | Stores artist-country growth results | `artist_id`, `country_id`, source identity |
| `artist_growth_intelligence` | Growth | Stores final artist growth intelligence | `artist_id`, source identity, `run_id` |
| `release_performance_intelligence` | Release | Stores release-performance intelligence | `track_id`, `release_id`, `source_release_id` |

### Backend Query Principle

The backend should normally begin queries from a canonical PMIP core entity such as an artist, track, release, or country.

For example:

- an artist profile begins with `artists`
- a track profile begins with `tracks`
- a release profile begins with `releases`
- a market profile begins with `countries`

The backend can then join the appropriate intelligence tables using the mapped PMIP IDs.

Source-identity fields should primarily be used to preserve and explain intelligence records that cannot be mapped reliably to a canonical PMIP entity.

### Nullable Intelligence Relationships

Some intelligence tables contain nullable PMIP foreign keys.

This is intentional.

A `NULL` mapped ID does not automatically mean that an intelligence result is invalid. It may mean that the source intelligence identity could not be mapped confidently to a canonical PMIP entity.

The backend should therefore distinguish between:

1. intelligence linked to a canonical PMIP entity
2. source-preserved intelligence that does not currently have a canonical mapping

The API should not silently discard source-preserved records solely because their mapped PMIP ID is `NULL`.

### Intelligence Run Selection

Backend queries should use `intelligence_runs` to determine which intelligence execution produced a result.

Where multiple runs of the same intelligence component exist, the application should normally use the authoritative or latest completed run rather than combining historical runs without an explicit reason.

For the currently validated PMIP database, the backend must respect the validated intelligence-run relationships established during database testing.

### Cross-Component Retrieval

Cross-component intelligence should only be combined where the underlying PMIP entity mapping supports the relationship.

For example, track geographic intelligence and track growth intelligence share a substantial mapped track population and can therefore be combined through `track_id`.

Forecasting currently represents a different track population and should not be artificially forced into geographic or growth results where no shared mapped track identity exists.

This approach ensures that backend responses reflect genuine database relationships rather than creating misleading connections between unrelated source records.

## 7.5 Key Database Design Decisions

The PMIP database was designed to support both reliable application queries and preservation of intelligence outputs produced by different analytical workflows.

Several important design decisions were made during implementation and validation.

### 1. Separate Core Entities from Intelligence Results

Core music entities such as artists, tracks, releases, and countries are stored separately from intelligence outputs.

This prevents analytical results from being mixed directly into the core entity tables.

The separation makes it easier to:

- update intelligence results independently
- store multiple intelligence runs
- preserve historical outputs
- query core metadata without loading intelligence fields
- add future intelligence components without restructuring the core schema

### 2. Use Relationship Tables for Many-to-Many Connections

PMIP uses relationship tables where one entity can be connected to multiple records of another type.

For example:

- `track_artists` connects tracks and artists
- `release_tracks` connects releases and tracks

This avoids duplicating artist or release information inside the track table.

It also allows one track to have multiple artists and one release to contain multiple tracks.

### 3. Preserve Original Source Identities

Several intelligence datasets contain source identifiers that do not map perfectly to canonical PMIP entities.

Instead of discarding these records, PMIP stores the original source identity alongside the mapped PMIP ID.

Examples include:

- `source_track_id`
- `source_artist_label`
- `source_artist_key`
- `source_country`
- `source_release_id`

This preserves the full analytical output while still allowing mapped records to participate in backend joins.

### 4. Allow Nullable Mapped Foreign Keys

Some intelligence tables allow mapped PMIP identifiers such as `artist_id`, `track_id`, or `country_id` to be `NULL`.

This is intentional.

A source intelligence record may be valid even if PMIP cannot confidently map it to a canonical entity.

Using nullable mapped IDs avoids two undesirable outcomes:

- deleting otherwise valid intelligence records
- creating incorrect relationships purely to satisfy a foreign-key requirement

Where a match exists, the PMIP ID is stored. Where no reliable match exists, the source identity remains available.

### 5. Track Intelligence Executions Separately

The `intelligence_runs` table records each intelligence component execution.

Intelligence result tables reference a `run_id`.

This allows PMIP to distinguish:

- different intelligence components
- different versions of a component
- repeated executions
- historical and current results

The backend can therefore select a specific authoritative run rather than assuming that every row belongs to the same analytical execution.

### 6. Avoid Forcing Cross-Component Relationships

PMIP only combines intelligence components where a valid shared PMIP identity exists.

For example, geographic intelligence and market-growth intelligence can be combined for many tracks because both map to the same `track_id`.

Forecasting currently covers a different track population and therefore does not overlap with the geographic and growth track population.

The database does not artificially create relationships between these components.

This prevents misleading cross-component results.

### 7. Preserve Exact Artist Source Identities

Artist source data can contain differences in capitalisation, collaborations, list-style identities, and grouped artist representations.

PMIP therefore distinguishes between:

- the exact source artist label
- a normalised source artist key
- the mapped canonical PMIP `artist_id`

The normalised key supports matching and comparison, while the exact label preserves the original source identity.

This prevents distinct source records from being incorrectly merged.

### 8. Use Source-Based Uniqueness Where Necessary

Not every intelligence table can use a mapped PMIP ID as its true unique identity.

For example, streaming anomaly results may contain multiple source records that map to the same PMIP observation.

For this reason, anomaly uniqueness is based on:

`source_index + run_id`

rather than:

`observation_id + run_id`

Similarly, source-based uniqueness is used in geographic, growth, and release intelligence where source identities must remain distinct.

### 9. Treat Release Intelligence Source IDs Separately from PMIP Release IDs

The release-performance workflow produced a `release_id` field that represented an ISRC-style source identity rather than the integer primary key used by the PMIP `releases` table.

The database therefore stores this value as:

`source_release_id`

and separately stores:

- `track_id`
- `release_id`

for the mapped PMIP entities.

This avoids treating an external source identifier as an internal database primary key.

### 10. Keep Intelligence Components Modular

Each intelligence component has its own result tables.

This modular design allows the backend to request only the intelligence needed for a particular page or endpoint.

For example:

- artist pages can retrieve momentum, anomaly, geographic, and growth results
- track pages can retrieve forecasting, geographic, growth, and anomaly information
- release pages can retrieve release-performance intelligence
- country pages can retrieve geographic and growth intelligence

This structure also makes future extensions easier because new analytical components can be introduced without redesigning the existing result tables.

### Design Outcome

These decisions ensure that the PMIP database prioritises:

- data integrity
- traceability
- source preservation
- reliable entity relationships
- modular intelligence storage
- safe cross-component joins
- backend-readiness

The final structure supports the PMIP application without sacrificing source data simply because every analytical record cannot be perfectly mapped to a canonical entity.

## 7.6 Source-Identity and Unmatched-Record Strategy

Some PMIP intelligence datasets contain valid analytical records that cannot always be mapped directly to a canonical PMIP artist, track, release, or country.

The database therefore uses a source-preservation strategy rather than discarding unmatched records.

### Why Unmatched Records Exist

Unmatched records can occur for several reasons, including:

- differences between source systems
- missing canonical identifiers
- chart-only tracks that do not appear in the integrated core dataset
- artist collaborations represented as grouped or list-style identities
- differences in capitalisation or formatting
- external track or release identifiers that do not directly match PMIP primary keys
- historical records that contain incomplete metadata

An unmatched record does not automatically mean that the intelligence result is incorrect.

It means that PMIP could not establish a sufficiently reliable mapping to one canonical database entity.

### Source Identity Fields

PMIP stores original source identities in dedicated fields.

Examples include:

- `source_track_id`
- `source_artist_label`
- `source_artist_key`
- `source_country`
- `source_release_id`
- `source_index`

These fields preserve the identity used by the analytical workflow that generated the record.

### Mapped PMIP Identifiers

Where a reliable match exists, the corresponding PMIP internal identifier is also stored.

Examples include:

- `artist_id`
- `track_id`
- `country_id`
- `release_id`
- `observation_id`

These mapped identifiers allow the backend to join intelligence results to canonical PMIP entities.

### Nullable Mapping Strategy

Mapped PMIP IDs are nullable in tables where a reliable match cannot always be guaranteed.

For example:

```text
source_track_id = available
track_id = NULL
```

This means the intelligence record is preserved, but no confident canonical PMIP track relationship currently exists.

The same principle applies to artist, country, and release mappings where necessary.

### Backend Behaviour for Unmatched Records

The backend should not treat a nullable mapped ID as a database error.

For canonical entity pages, the backend should normally return intelligence that has a valid mapped PMIP ID.

For analytical or administrative endpoints, source-preserved unmatched records may also be exposed where useful.

This allows PMIP to support both clean application-facing entity queries and complete analytical traceability.

### Artist Identity Handling

Artist data requires additional care because one source record may represent:

- one artist
- multiple collaborating artists
- a list-style artist representation
- differently capitalised versions of the same label
- a source-specific artist identity

PMIP therefore preserves the exact source label separately from its normalised key and mapped `artist_id`.

The three relevant fields are:

```text
source_artist_label
source_artist_key
artist_id
```

The exact source label is retained for traceability.

The normalised key helps with matching and comparison.

The mapped `artist_id` provides the connection to the canonical PMIP artist where a reliable relationship exists.

### Track Identity Handling

Track intelligence tables preserve the source track identifier even where no PMIP track mapping exists.

This is particularly important for chart and geographic datasets containing tracks outside the main integrated track population.

Where possible:

```text
source_track_id -> track_id
```

Where no reliable match exists:

```text
source_track_id -> NULL track_id
```

The intelligence row remains stored in both situations.

### Release Identity Handling

Release-performance intelligence requires a special identity strategy.

The source release-performance workflow used an ISRC-style value as its release identity.

This value is stored as:

```text
source_release_id
```

It is not treated as the PMIP `releases.release_id` primary key.

The importer separately maps this source identity to:

```text
track_id
release_id
```

where a reliable PMIP relationship exists.

This prevents external source identifiers from being confused with internal database keys.

### Anomaly Identity Handling

Streaming anomaly results preserve a source-level row identity through:

```text
source_index
```

Multiple anomaly source rows may map to the same `observation_id`.

Because of this, the uniqueness rule is based on:

```text
source_index + run_id
```

rather than:

```text
observation_id + run_id
```

This preserves every valid anomaly result generated by the source workflow.

### No Forced Matching

PMIP deliberately avoids forcing uncertain matches.

A weak or incorrect mapping would be more harmful than leaving the PMIP foreign key as `NULL`.

Incorrect matching could cause:

- intelligence to appear under the wrong artist
- growth results to be attached to the wrong track
- market intelligence to appear under the wrong country
- release-performance results to be associated with the wrong release

The database therefore prioritises mapping confidence over maximum mapping coverage.

### Future Remapping

Preserving source identities also allows PMIP to improve mappings later.

If better metadata, matching logic, or external identifiers become available, previously unmatched rows can be reviewed and linked without re-running the original intelligence workflow.

This makes the database more maintainable over time.

### Strategy Summary

The PMIP source-identity strategy follows four principles:

1. Preserve every valid intelligence source record.
2. Store the original source identity.
3. Map to canonical PMIP entities only when sufficiently reliable.
4. Allow unmatched records to remain available for future review and remapping.

This approach provides both analytical completeness and database integrity.

## 7.7 Example Backend/API Queries

This section documents representative SQL query patterns that the future PMIP backend API can use.

These examples are not executed as part of Task 7. They are reference examples showing how the validated PMIP schema can support common API operations.

### Retrieve a Basic Artist Profile

A backend artist endpoint should begin from the canonical `artists` table.

```sql
SELECT
    artist_id,
    artist_name
FROM artists
WHERE artist_id = ?;
```

Possible endpoint:

```text
GET /api/artists/:artistId
```

The `?` placeholder represents a parameter supplied safely by the backend.

### Retrieve Artist Momentum Intelligence

```sql
SELECT
    a.artist_id,
    a.artist_name,
    amr.final_momentum_score,
    amr.momentum_category,
    amr.shared_score_rank,
    amr.displayed_position
FROM artists a
JOIN artist_momentum_results amr
    ON amr.artist_id = a.artist_id
WHERE a.artist_id = ?;
```

Possible endpoint:

```text
GET /api/artists/:artistId/momentum
```

### Retrieve Combined Artist Intelligence

Artist intelligence can span several components, including momentum, anomaly summaries, geographic intelligence, and growth intelligence.

Because some components can contain more than one source representation mapped to the same canonical artist, the backend should avoid assuming that one large join will always return a single row.

A safer backend design is to retrieve each component independently and combine the results in the response layer.

Possible endpoint:

```text
GET /api/artists/:artistId/intelligence
```

### Retrieve Tracks for an Artist

```sql
SELECT
    t.track_id,
    t.track_name,
    t.isrc
FROM track_artists ta
JOIN tracks t
    ON t.track_id = ta.track_id
WHERE ta.artist_id = ?
ORDER BY t.track_name;
```

Possible endpoint:

```text
GET /api/artists/:artistId/tracks
```

### Retrieve Track Forecasting Results

```sql
SELECT
    t.track_id,
    t.track_name,
    fr.predicted_spotify_streams,
    fr.prediction_date,
    fr.feature_coverage,
    fr.high_forecast_review_flag
FROM forecast_results fr
JOIN tracks t
    ON t.track_id = fr.track_id
WHERE t.track_id = ?;
```

Possible endpoint:

```text
GET /api/tracks/:trackId/forecast
```

### Retrieve Track Geographic Intelligence

```sql
SELECT
    t.track_id,
    t.track_name,
    tgi.geographic_reach_score,
    tgi.market_penetration_score,
    tgi.geographic_concentration_score,
    tgi.geographic_expansion_indicator,
    tgi.geographic_intelligence_score,
    tgi.geographic_balance_index
FROM track_geographic_intelligence tgi
JOIN tracks t
    ON t.track_id = tgi.track_id
WHERE tgi.track_id = ?
  AND tgi.run_id = 9;
```

Possible endpoint:

```text
GET /api/tracks/:trackId/geographic
```

### Retrieve Track Growth Intelligence

```sql
SELECT
    t.track_id,
    t.track_name,
    tgr.mean_market_growth_score,
    tgr.growth_opportunity_score,
    tgr.growth_opportunity_class,
    tgr.pmip_growth_score,
    tgr.pmip_growth_class,
    tgr.pmip_growth_rank,
    tgr.pmip_priority_class
FROM track_growth_intelligence tgr
JOIN tracks t
    ON t.track_id = tgr.track_id
WHERE tgr.track_id = ?
  AND tgr.run_id = 10;
```

Possible endpoint:

```text
GET /api/tracks/:trackId/growth
```

### Retrieve Combined Geographic and Growth Track Intelligence

The validation stage confirmed that geographic and growth intelligence share a mapped track population.

These components can therefore be combined through `track_id`.

```sql
SELECT
    t.track_id,
    t.track_name,
    tgi.geographic_intelligence_score,
    tgi.geographic_reach_score,
    tgi.market_penetration_score,
    tgr.pmip_growth_score,
    tgr.pmip_growth_class,
    tgr.pmip_growth_rank,
    tgr.pmip_priority_class
FROM tracks t
JOIN track_geographic_intelligence tgi
    ON tgi.track_id = t.track_id
JOIN track_growth_intelligence tgr
    ON tgr.track_id = t.track_id
WHERE t.track_id = ?
  AND tgi.run_id = 9
  AND tgr.run_id = 10;
```

Possible endpoint:

```text
GET /api/tracks/:trackId/intelligence
```

Forecasting should not currently be forced into this combined query because validation showed that the forecasting track population does not overlap with the mapped geographic and growth track population.

### Retrieve Streaming Anomalies for a Track

Streaming anomalies are linked to tracks through historical streaming observations.

```sql
SELECT
    sar.anomaly_result_id,
    sar.observation_id,
    so.observation_date,
    so.streams,
    so.chart_position,
    sar.anomaly_score_ratio,
    sar.anomaly_direction,
    sar.anomaly_severity,
    sar.is_final_pca_anomaly
FROM streaming_anomaly_results sar
JOIN streaming_observations so
    ON so.observation_id = sar.observation_id
WHERE so.track_id = ?
  AND sar.run_id = 6
ORDER BY so.observation_date DESC;
```

Possible endpoint:

```text
GET /api/tracks/:trackId/anomalies
```

Where required, the backend can additionally filter to final anomalies using:

```sql
AND sar.is_final_pca_anomaly = 1
```

### Retrieve Country Intelligence

```sql
SELECT
    c.country_id,
    c.country_name,
    cgi.country_findings_index,
    cgi.country_findings_class,
    cmg.emerging_market_score,
    cmg.emerging_market_class
FROM countries c
LEFT JOIN country_geographic_intelligence cgi
    ON cgi.country_id = c.country_id
    AND cgi.run_id = 9
LEFT JOIN country_market_growth cmg
    ON cmg.country_id = c.country_id
    AND cmg.run_id = 10
WHERE c.country_id = ?;
```

Possible endpoint:

```text
GET /api/countries/:countryId/intelligence
```

This query demonstrates a valid cross-component relationship between country geographic intelligence and country market-growth intelligence.

### Retrieve Release Performance Intelligence

```sql
SELECT
    rpi.source_release_id,
    rpi.track_id,
    rpi.release_id,
    t.track_name,
    r.release_title,
    rpi.composite_release_performance_score,
    rpi.release_performance_percentile,
    rpi.release_performance_class,
    rpi.priority_signal_score,
    rpi.high_priority_release_flag,
    rpi.human_review_required
FROM release_performance_intelligence rpi
LEFT JOIN tracks t
    ON t.track_id = rpi.track_id
LEFT JOIN releases r
    ON r.release_id = rpi.release_id
WHERE rpi.release_id = ?
  AND rpi.run_id = 11;
```

Possible endpoint:

```text
GET /api/releases/:releaseId/intelligence
```

### Retrieve Tracks Within a Release

```sql
SELECT
    r.release_id,
    r.release_title,
    t.track_id,
    t.track_name,
    t.isrc
FROM releases r
JOIN release_tracks rt
    ON rt.release_id = r.release_id
JOIN tracks t
    ON t.track_id = rt.track_id
WHERE r.release_id = ?;
```

Possible endpoint:

```text
GET /api/releases/:releaseId/tracks
```

### Search for an Artist

```sql
SELECT
    artist_id,
    artist_name
FROM artists
WHERE artist_name LIKE CONCAT('%', ?, '%')
ORDER BY artist_name
LIMIT 20;
```

Possible endpoint:

```text
GET /api/artists/search?q=artist-name
```

### Search for a Track

```sql
SELECT
    track_id,
    track_name,
    isrc
FROM tracks
WHERE track_name LIKE CONCAT('%', ?, '%')
ORDER BY track_name
LIMIT 20;
```

Possible endpoint:

```text
GET /api/tracks/search?q=track-name
```

### Parameterised Query Requirement

The backend must use parameterised queries rather than inserting user input directly into SQL strings.

For example, the backend should send a query containing:

```text
artist_id = ?
```

and provide the parameter value separately.

This helps protect the application against SQL injection.

### API Response Principle

The backend should transform database rows into clear JSON responses.

For example:

```json
{
  "artist_id": 804,
  "artist_name": "AURORA",
  "momentum": {
    "available": true
  },
  "geographic": {
    "available": true
  },
  "growth": {
    "available": true
  }
}
```

The exact response structure will be designed during backend development.

The database layer should provide reliable data, while the backend API should decide how that data is grouped and presented to the frontend.

### Query Design Principle

Backend queries should follow four rules:

1. Start with canonical PMIP entities where possible.
2. Use validated PMIP foreign-key relationships for joins.
3. Preserve source-only records where they are required for analytical traceability.
4. Do not force joins between intelligence components that do not share valid entity mappings.

These principles will guide the development of the PMIP backend API.

## 7.8 Backend Views and Query Layer Preparation

The PMIP database has been prepared so that the upcoming backend API can retrieve information through clear and predictable database queries.

At this stage, no additional database views are required before backend development begins.

The existing tables and validated relationships are sufficient for the first version of the backend API.

### Backend Query Layer

The backend should contain a dedicated database/query layer responsible for communicating with the PMIP database.

This layer should keep database logic separate from API route logic.

For example, the backend may eventually contain functions responsible for retrieving:

- artists
- tracks
- releases
- countries
- artist intelligence
- track intelligence
- release intelligence
- country intelligence
- streaming anomalies
- forecasting results

The API routes will call these database functions rather than placing large SQL queries directly inside every route.

### Core Entity Queries

The main starting points for backend queries should be the canonical PMIP tables:

- `artists`
- `tracks`
- `releases`
- `countries`

These tables provide the stable internal IDs used to retrieve connected intelligence records.

For example:

- `artist_id` connects artist intelligence
- `track_id` connects track intelligence
- `release_id` connects release intelligence
- `country_id` connects country intelligence

### Intelligence Query Separation

Each intelligence component should initially have its own query functions.

This means the backend can retrieve components independently, such as:

- forecasting
- momentum
- anomaly detection
- geographic intelligence
- market growth intelligence
- release performance intelligence

Keeping these queries separate makes the backend easier to test and maintain.

The API can later combine their results when building a complete artist, track, release, or country response.

### Handling Multiple Intelligence Runs

Intelligence tables can contain results from different runs.

The backend query layer must therefore consider `run_id` when retrieving intelligence.

For the current validated database, the authoritative intelligence runs are known from the database validation process.

Future backend development should avoid permanently hard-coding run numbers where possible.

A better long-term approach will be to determine the latest or authoritative completed run for each intelligence component through the `intelligence_runs` table.

This will allow future intelligence runs to be introduced without rewriting large parts of the backend.

### Handling Nullable Entity Mappings

Some intelligence records contain source identities but do not have a mapped PMIP entity ID.

For normal public entity endpoints, the query layer should primarily retrieve intelligence that is linked to the requested canonical PMIP entity.

Unmatched source records should remain stored in the database for traceability and possible future remapping.

They should not be forced into public artist, track, release, or country profiles where no valid mapping exists.

### Avoiding Duplicate API Results

Some source identities may map to the same PMIP entity.

For this reason, backend queries must be designed carefully so that joining several intelligence tables does not accidentally multiply rows.

Where necessary, the backend should:

- retrieve intelligence components separately
- select the required intelligence run
- aggregate records appropriately
- construct the final response after retrieval

This is preferable to creating one very large SQL query containing every intelligence component.

### Pagination and Result Limits

Endpoints that can return many records should use pagination or sensible result limits.

Examples include:

- artist search
- track search
- streaming history
- anomaly results
- market-growth rankings
- geographic rankings

This prevents the backend from returning extremely large database results in a single request.

### Sorting and Filtering

The query layer should support filters relevant to the public analytics dashboard.

Future examples may include:

- highest momentum artists
- strongest growth opportunities
- highest geographic intelligence scores
- emerging markets
- high-priority releases
- final streaming anomalies
- track or artist searches

These filters should use validated database columns rather than recreating intelligence calculations inside the backend.

### Database Views

SQL database views may be introduced later if repeated backend queries become complex or difficult to maintain.

However, views should only be added where they provide a clear benefit.

The first backend implementation should begin with the existing validated tables and normal parameterised queries.

After the API behaviour is understood, repeated query patterns can be reviewed to determine whether database views would improve maintainability or performance.

### Preparation Outcome

The PMIP database is ready for a backend query layer because:

- core entity IDs are available
- intelligence relationships have been validated
- source-only records are preserved
- cross-component joins have been tested
- intelligence runs are traceable
- representative retrieval queries have already been demonstrated

The backend can therefore be developed on top of the existing database without redesigning the database structure first.

## 7.9 Backend Integration Notes and Handover

The PMIP database implementation and validation work is now complete and ready to be handed over to backend development.

This section summarises the main points the backend implementation must respect when connecting to the database.

### Database Connection

The backend should connect to the existing PMIP MariaDB database using environment variables rather than hard-coded credentials.

The application configuration should read values such as:

- database host
- database port
- database name
- database user
- database password

Sensitive credentials must not be committed to GitHub.

The existing database connection approach should therefore be reproduced in the backend using an appropriate environment configuration file.

### Use Parameterised Queries

All backend SQL queries must use parameterised values.

User input must not be inserted directly into SQL strings.

This applies to:

- artist IDs
- track IDs
- release IDs
- country IDs
- search queries
- filters
- pagination values where appropriate

This reduces the risk of SQL injection and makes database access safer.

### Use Canonical PMIP IDs

Public-facing API endpoints should normally use the canonical PMIP entity identifiers:

- `artist_id`
- `track_id`
- `release_id`
- `country_id`

These IDs should be the main identifiers used in API routes and internal joins.

Source identities should remain available for traceability but should not replace the canonical PMIP IDs in normal application navigation.

### Respect Intelligence Run Boundaries

Each intelligence result is associated with an intelligence run.

The backend must therefore avoid combining rows from unrelated runs accidentally.

During the initial backend implementation, queries should use the validated authoritative runs for each intelligence component.

Longer term, the backend should support identifying the latest or authoritative completed run dynamically through the `intelligence_runs` table.

### Handle Missing Intelligence Gracefully

Not every artist, track, release, or country will have results from every intelligence component.

The backend should treat missing intelligence as a normal condition.

For example, an API response may indicate that geographic intelligence exists while forecasting does not.

The frontend should not fail simply because one intelligence component is unavailable.

### Handle Nullable Mappings Safely

Some intelligence records intentionally contain nullable PMIP entity mappings.

These records should remain stored for traceability, but normal entity-profile endpoints should only expose them where a valid relationship to the requested PMIP entity exists.

The backend should never guess or create a relationship simply because a source record appears similar.

### Avoid Large Cross-Component SQL Queries

Although the database supports cross-component joins, the backend should avoid creating one extremely large query containing every intelligence table.

A better approach is to retrieve the required components separately and combine them in the backend response layer.

For example, an artist-intelligence request may retrieve:

- artist profile
- momentum
- anomaly summary
- geographic intelligence
- growth intelligence

These results can then be combined into one structured JSON response.

This approach reduces accidental row multiplication and makes individual queries easier to test.

### Suggested Backend Structure

The backend should separate responsibilities into clear layers.

A suitable structure could include:

```text
backend/
├── config/
│   └── database.js
├── routes/
├── controllers/
├── services/
├── repositories/
└── app.js
```

The exact structure can be refined during backend development.

A simple responsibility split would be:

- `routes` define API URLs
- `controllers` receive requests and return responses
- `services` contain application logic
- `repositories` contain database queries
- `config` contains database connection configuration

This keeps SQL code away from route definitions and makes the application easier to maintain.

### Initial Backend Priorities

The backend should begin with simple read-only endpoints before introducing more complex intelligence responses.

Recommended initial areas include:

- health/database connection test
- artist listing and artist lookup
- track listing and track lookup
- release lookup
- country lookup
- intelligence retrieval for individual entities
- search endpoints

Once these basic endpoints work reliably, combined intelligence endpoints can be introduced.

### Validation Expectations

Each backend endpoint should be tested against the validated PMIP database.

Tests should confirm that:

- valid IDs return expected data
- unknown IDs return an appropriate response
- missing intelligence is handled correctly
- database errors are handled safely
- queries do not produce accidental duplicate rows
- source-only unmatched records do not appear under incorrect canonical entities

### Database Changes During Backend Development

The database should not be redesigned casually during backend development.

If a new table, index, relationship, or view becomes necessary, the change should be:

1. justified by a clear backend requirement
2. documented
3. added to the database schema
4. reflected in the ERD
5. tested before being relied upon by the API

This keeps the database and backend consistent.

### Task 7 Completion Outcome

Task 7 has prepared the PMIP database for backend API development by providing:

- a database overview
- the final validation summary
- schema and ERD documentation
- a backend-facing table reference
- documented database design decisions
- a source-identity preservation strategy
- example backend queries
- query-layer preparation guidance
- backend integration and handover notes

The database is therefore ready to support the next PMIP development stage:

**Develop PMIP Backend API.**
