# PMIP Backend API Documentation

## 1. Purpose

This document describes the completed backend REST API for the Public Music Intelligence Platform (PMIP).

The API provides access to:

- core PMIP artist, track, and release data
- historical streaming and chart-performance data
- geographic intelligence
- market-growth intelligence
- artist momentum intelligence
- track forecasting intelligence
- streaming anomaly intelligence

The purpose of this documentation is to make the backend easier to understand, maintain, test, and integrate with the future PMIP frontend or other API clients.

---

## 2. Base URL

During local development, the PMIP backend API is available at:

```text
http://localhost:3000
```

All API routes begin with:

```text
/api
```

Examples:

```text
GET /api/artists
GET /api/tracks
GET /api/releases
GET /api/streaming
GET /api/intelligence/geographic/artists
```

---

## 3. Successful Response Format

Successful API responses use:

```json
{
  "status": "success",
  "data": {}
}
```

Collection endpoints return an array inside `data`.

Example:

```json
{
  "status": "success",
  "data": [
    {
      "artist_id": 1,
      "artist_name": "Tommy Richman"
    }
  ]
}
```

Paginated endpoints also include a `pagination` object:

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

Some endpoints may also include additional metadata such as `filters`.

---

## 4. Error Response Format

API errors use:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

Common error codes include:

```text
INVALID_ARTIST_ID
INVALID_TRACK_ID
INVALID_RELEASE_ID
INVALID_COUNTRY_ID
INVALID_PAGE
INVALID_LIMIT
INVALID_SEARCH_QUERY
EMPTY_SEARCH_QUERY
INVALID_FINAL_ONLY
RESOURCE_NOT_FOUND
INTELLIGENCE_NOT_FOUND
ROUTE_NOT_FOUND
BAD_REQUEST
INTERNAL_SERVER_ERROR
DATABASE_CONNECTION_ERROR
```

Unexpected server or database failures do not expose raw SQL, database credentials, stack traces, or internal MySQL error details.

---

## 5. Pagination and Validation Rules

Collection endpoints generally support:

```text
?page=1
&limit=20
```

Default values:

```text
page = 1
limit = 20
```

The maximum collection limit is:

```text
100
```

Search endpoints use a maximum limit of:

```text
50
```

The following values must be positive integers when provided:

```text
artistId
trackId
releaseId
countryId
page
limit
```

Invalid values return:

```text
400 Bad Request
```

For example:

```text
GET /api/artists?page=abc
```

returns:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PAGE",
    "message": "Page must be a positive integer."
  }
}
```

Boolean filters such as:

```text
finalOnly
```

accept:

```text
true
false
1
0
```

Unsupported values return `400 Bad Request`.

---

## 6. Health Endpoint

### GET /api/health

Checks whether the PMIP backend API is running and whether the database connection is available.

**Route parameters**

None.

**Query parameters**

None.

**Example request**

```text
GET /api/health
```

**Example success response**

```json
{
  "status": "success",
  "message": "PMIP Backend API and database are connected",
  "database": 1
}
```

**Possible error response**

If the database connection fails:

```json
{
  "status": "error",
  "error": {
    "code": "DATABASE_CONNECTION_ERROR",
    "message": "PMIP database connection failed."
  }
}
```

**HTTP status codes**

```text
200 OK
500 Internal Server Error
```

**Database support**

The endpoint performs a lightweight database connection check using:

```sql
SELECT 1 AS database_status;
```

---

## 7. Artist Endpoints

### GET /api/artists

Retrieves a paginated list of canonical PMIP artists.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of artists per page |

The maximum collection limit is `100`.

**Example request**

```text
GET /api/artists?page=1&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_id": 1,
      "artist_name": "Tommy Richman",
      "created_at": "2026-08-01T10:00:00.000Z",
      "updated_at": "2026-08-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 29823,
    "totalPages": 5965
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artists
```

---

### GET /api/artists/search

Searches artists by artist name.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `query` | String | Yes | None | Artist name search text |
| `limit` | Integer | No | `20` | Maximum number of results |

The maximum search limit is `50`.

**Example request**

```text
GET /api/artists/search?query=kend&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_id": 2,
      "artist_name": "Kendrick Lamar",
      "created_at": "2026-08-01T10:00:00.000Z",
      "updated_at": "2026-08-01T10:00:00.000Z"
    }
  ]
}
```

A valid search with no matching artists returns:

```json
{
  "status": "success",
  "data": []
}
```

**Possible errors**

```text
400 INVALID_SEARCH_QUERY
400 EMPTY_SEARCH_QUERY
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artists
```

---

### GET /api/artists/:artistId

Retrieves one canonical PMIP artist.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `artistId` | Integer | Yes | Positive canonical PMIP artist ID |

**Query parameters**

None.

**Example request**

```text
GET /api/artists/2
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "artist_id": 2,
    "artist_name": "Kendrick Lamar",
    "created_at": "2026-08-01T10:00:00.000Z",
    "updated_at": "2026-08-01T10:00:00.000Z"
  }
}
```

**Possible errors**

Invalid artist ID:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ARTIST_ID",
    "message": "Artist ID must be a positive integer."
  }
}
```

Unknown artist:

```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested artist could not be found."
  }
}
```

**HTTP status codes**

```text
200 OK
400 Bad Request
404 Not Found
500 Internal Server Error
```

**Database support**

```text
artists
```

---

### GET /api/artists/:artistId/tracks

Retrieves tracks associated with one canonical PMIP artist.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `artistId` | Integer | Yes | Positive canonical PMIP artist ID |

**Query parameters**

None.

**Example request**

```text
GET /api/artists/2/tracks
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "artist": {
      "artist_id": 2,
      "artist_name": "Kendrick Lamar"
    },
    "tracks": [
      {
        "track_id": 2,
        "source_track_id": "USUG12400910",
        "isrc": "USUG12400910",
        "track_name": "Not Like Us"
      }
    ]
  }
}
```

**Possible errors**

```text
400 INVALID_ARTIST_ID
404 RESOURCE_NOT_FOUND
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artists
track_artists
tracks
```

The relationship is resolved through:

```text
artists
   ↓
track_artists
   ↓
tracks
```

---

## 8. Track Endpoints

### GET /api/tracks

Retrieves a paginated list of canonical PMIP tracks.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of tracks per page |

The maximum collection limit is `100`.

**Example request**

```text
GET /api/tracks?page=1&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "track_id": 1,
      "source_track_id": "QM24S2402528",
      "isrc": "QM24S2402528",
      "track_name": "MILLION DOLLAR BABY"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 95281,
    "totalPages": 19057
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
tracks
```

---

### GET /api/tracks/search

Searches tracks by track name.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `query` | String | Yes | None | Track name search text |
| `limit` | Integer | No | `20` | Maximum number of results |

The maximum search limit is `50`.

**Example request**

```text
GET /api/tracks/search?query=baby&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "track_id": 1,
      "source_track_id": "QM24S2402528",
      "isrc": "QM24S2402528",
      "track_name": "MILLION DOLLAR BABY"
    }
  ]
}
```

A valid search with no matching tracks returns:

```json
{
  "status": "success",
  "data": []
}
```

**Possible errors**

```text
400 INVALID_SEARCH_QUERY
400 EMPTY_SEARCH_QUERY
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
tracks
```

---

### GET /api/tracks/:trackId

Retrieves one canonical PMIP track.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `trackId` | Integer | Yes | Positive canonical PMIP track ID |

**Query parameters**

None.

**Example request**

```text
GET /api/tracks/2
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "track_id": 2,
    "source_track_id": "USUG12400910",
    "isrc": "USUG12400910",
    "track_name": "Not Like Us"
  }
}
```

**Possible errors**

Invalid track ID:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TRACK_ID",
    "message": "Track ID must be a positive integer."
  }
}
```

Unknown track:

```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested track could not be found."
  }
}
```

**HTTP status codes**

```text
200 OK
400 Bad Request
404 Not Found
500 Internal Server Error
```

**Database support**

```text
tracks
```

---

## 9. Release Endpoints

### GET /api/releases

Retrieves a paginated list of PMIP releases.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of releases per page |

The maximum collection limit is `100`.

**Example request**

```text
GET /api/releases?page=1&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "release_id": 1,
      "release_title": "Million Dollar Baby - Single",
      "release_date": "2024-04-25T23:00:00.000Z",
      "release_type": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 4100,
    "totalPages": 820
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
releases
```

---

### GET /api/releases/:releaseId

Retrieves one PMIP release.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `releaseId` | Integer | Yes | Positive PMIP release ID |

**Query parameters**

None.

**Example request**

```text
GET /api/releases/1
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "release_id": 1,
    "release_title": "Million Dollar Baby - Single",
    "release_date": "2024-04-25T23:00:00.000Z",
    "release_type": null
  }
}
```

**Possible errors**

```text
400 INVALID_RELEASE_ID
404 RESOURCE_NOT_FOUND
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
releases
```

---

### GET /api/releases/:releaseId/tracks

Retrieves tracks associated with one PMIP release.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `releaseId` | Integer | Yes | Positive PMIP release ID |

**Query parameters**

None.

**Example request**

```text
GET /api/releases/1/tracks
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "release": {
      "release_id": 1,
      "release_title": "Million Dollar Baby - Single"
    },
    "tracks": [
      {
        "track_id": 1,
        "track_name": "MILLION DOLLAR BABY"
      },
      {
        "track_id": 446,
        "track_name": "Million Dollar Baby (Vhs)"
      }
    ]
  }
}
```

**Possible errors**

```text
400 INVALID_RELEASE_ID
404 RESOURCE_NOT_FOUND
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
releases
release_tracks
tracks
```

The relationship is resolved through:

```text
releases
   ↓
release_tracks
   ↓
tracks
```

---

## 10. Streaming Endpoints

### GET /api/streaming

Retrieves historical streaming observations with pagination and optional filtering.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of observations per page |
| `trackId` | Integer | No | None | Filter by canonical PMIP track ID |
| `countryId` | Integer | No | None | Filter by canonical PMIP country ID |

The maximum collection limit is `100`.

**Example request**

```text
GET /api/streaming?trackId=228&limit=2
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "observation_id": 5412372,
      "track_id": 228,
      "track_name": "Cupid - Twin Ver.",
      "country_id": 46,
      "country_name": "lt",
      "country_code": "lt",
      "observation_date": "2026-01-01T00:00:00.000Z",
      "streams": 10760,
      "chart_position": 161
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 100,
    "totalPages": 50
  }
}
```

The exact pagination totals depend on the selected filters.

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
400 INVALID_TRACK_ID
400 INVALID_COUNTRY_ID
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
streaming_observations
tracks
countries
```

The endpoint joins:

```text
streaming_observations
   ↓
tracks
   ↓
countries
```

Streaming observations are ordered by:

```text
observation_date DESC
observation_id DESC
```

---

### GET /api/streaming/chart-performance

Retrieves historical chart-performance observations.

Only streaming observations with a non-null chart position are returned.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of observations per page |
| `trackId` | Integer | No | None | Filter by canonical PMIP track ID |
| `countryId` | Integer | No | None | Filter by canonical PMIP country ID |

**Example request**

```text
GET /api/streaming/chart-performance?limit=2
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "observation_id": 5424638,
      "track_id": 83401,
      "track_name": "Boys Don't Cry",
      "country_id": 21,
      "country_name": "cz",
      "country_code": "cz",
      "observation_date": "2026-01-01T00:00:00.000Z",
      "chart_position": 133
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 100,
    "totalPages": 50
  }
}
```

The exact pagination totals depend on the available chart-performance records and any selected filters.

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
400 INVALID_TRACK_ID
400 INVALID_COUNTRY_ID
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
streaming_observations
tracks
countries
```

The endpoint only includes records where:

```text
chart_position IS NOT NULL
```

and orders results by:

```text
observation_date DESC
observation_id DESC
```

---

## 11. Geographic Intelligence Endpoints

Geographic intelligence endpoints expose country, artist, and track geographic-performance results produced by the PMIP geographic intelligence component.

All geographic intelligence results are taken from the latest intelligence run where:

```text
component_name = geographic_intelligence
```

---

### GET /api/intelligence/geographic/countries

Retrieves paginated country-level geographic intelligence.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

The maximum limit is `100`.

**Example request**

```text
GET /api/intelligence/geographic/countries?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "country_geo_result_id": 1,
      "country_id": 10,
      "country_name": "Example Country",
      "country_code": "EX",
      "observations": 2500,
      "total_streams": 15000000,
      "median_streams": 4500,
      "mean_streams": 6000,
      "median_chart_position": 55,
      "top_10_rate_pct": 8.5,
      "top_50_rate_pct": 35.2,
      "number_one_rate_pct": 0.7,
      "streaming_strength_percentile": 82.4,
      "chart_strength_percentile": 76.1,
      "market_context_percentile": 79.3,
      "country_findings_index": 81.2,
      "country_findings_class": "Strong",
      "run_id": 9,
      "component_name": "geographic_intelligence",
      "component_version": "1.0"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
country_geographic_intelligence
countries
intelligence_runs
```

**PMIP intelligence component**

```text
geographic_intelligence
```

---

### GET /api/intelligence/geographic/artists

Retrieves paginated artist-level geographic intelligence.

The endpoint preserves source-only artist records even when no canonical PMIP artist mapping exists.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/geographic/artists?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_geo_result_id": 1502,
      "source_artist_label": "Source Artist",
      "source_artist_key": "source_artist_key",
      "source_artist_identity_key": "source_identity_key",
      "artist_id": null,
      "artist_name": null,
      "markets_reached": 12,
      "international_reach_index": 64.2,
      "international_reach_class": "Moderate",
      "market_penetration_index": 58.1,
      "market_penetration_class": "Moderate",
      "stream_concentration_hhi": 0.19,
      "effective_stream_markets": 7.4,
      "market_dependency_class": "Diversified",
      "local_international_profile": "International",
      "geographic_profile_index": 67.5,
      "artist_geographic_profile": "Expanding",
      "artist_diversification_index": 70.1,
      "artist_findings_index": 69.4,
      "artist_findings_class": "Promising",
      "run_id": 9,
      "component_name": "geographic_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

A source-only record may correctly return:

```json
{
  "artist_id": null,
  "artist_name": null
}
```

This prevents unmatched source records from being incorrectly attached to canonical PMIP artists.

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artist_geographic_intelligence
artists
intelligence_runs
```

The artist table is joined using a `LEFT JOIN` so unmatched source records remain available.

**PMIP intelligence component**

```text
geographic_intelligence
```

---

### GET /api/intelligence/geographic/tracks

Retrieves paginated track-level geographic intelligence.

Source-only track intelligence is preserved when no canonical PMIP track mapping exists.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/geographic/tracks?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "track_geo_result_id": 1,
      "source_track_id": "SOURCE-TRACK-001",
      "track_id": 25,
      "track_name": "Example Track",
      "geographic_reach_score": 78.3,
      "market_penetration_score": 69.2,
      "geographic_concentration_score": 55.4,
      "geographic_expansion_indicator": 73.1,
      "geographic_intelligence_score": 71.8,
      "geographic_balance_index": 67.5,
      "geographic_intelligence_class": "Strong",
      "geographic_performance_profile": "International Growth",
      "strongest_geographic_dimension": "Reach",
      "weakest_geographic_dimension": "Concentration",
      "run_id": 9,
      "component_name": "geographic_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
track_geographic_intelligence
tracks
intelligence_runs
```

**PMIP intelligence component**

```text
geographic_intelligence
```

---

## 12. Market Intelligence Endpoints

Market intelligence endpoints expose market movement and market-growth results produced by the PMIP market-growth intelligence component.

All results come from the latest run where:

```text
component_name = market_growth_intelligence
```

---

### GET /api/intelligence/markets/movements

Retrieves track-market movement intelligence.

The endpoint preserves source-only track or country records when canonical PMIP mappings are unavailable.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/markets/movements?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "movement_id": 1,
      "source_track_id": "SOURCE-TRACK-001",
      "source_country": "GB",
      "track_id": 10,
      "track_name": "Example Track",
      "country_id": 5,
      "country_name": "United Kingdom",
      "country_code": "GB",
      "first_observation_date": "2025-01-01T00:00:00.000Z",
      "latest_observation_date": "2026-01-01T00:00:00.000Z",
      "market_entry_flag": 1,
      "expansion_flag": 1,
      "contraction_flag": 0,
      "cross_market_momentum": 0.74,
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
track_market_movements
tracks
countries
intelligence_runs
```

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

### GET /api/intelligence/markets/countries

Retrieves country-level market-growth intelligence.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/markets/countries?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "country_growth_result_id": 1,
      "source_country": "GB",
      "country_id": 5,
      "country_name": "United Kingdom",
      "country_code": "GB",
      "emerging_market_score": 78.4,
      "emerging_market_class": "High Opportunity",
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
country_market_growth
countries
intelligence_runs
```

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

### GET /api/intelligence/markets/artists

Retrieves artist-level market-growth intelligence by market.

Source-only artist or country information is preserved when no canonical PMIP mapping exists.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/markets/artists?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_market_growth_id": 1,
      "source_artist_label": "Example Artist",
      "source_artist_key": "example_artist",
      "source_country": "GB",
      "artist_id": 2,
      "artist_name": "Kendrick Lamar",
      "country_id": 5,
      "country_name": "United Kingdom",
      "country_code": "GB",
      "market_growth_score": 74.6,
      "market_growth_class": "Strong Growth",
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artist_market_growth
artists
countries
intelligence_runs
```

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

### GET /api/intelligence/markets/tracks

Retrieves track-level market-growth intelligence by market.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/markets/tracks?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "track_market_growth_id": 1,
      "source_track_id": "SOURCE-TRACK-001",
      "source_country": "GB",
      "track_id": 25,
      "track_name": "Example Track",
      "country_id": 5,
      "country_name": "United Kingdom",
      "country_code": "GB",
      "market_growth_score": 76.3,
      "market_growth_class": "Strong Growth",
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
track_market_growth
tracks
countries
intelligence_runs
```

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

## 13. Growth Intelligence Endpoints

Growth intelligence endpoints expose the final artist and track growth intelligence produced from the PMIP market-growth intelligence workflow.

Results come from the latest:

```text
market_growth_intelligence
```

run.

---

### GET /api/intelligence/growth/artists

Retrieves final artist growth intelligence.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/growth/artists?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_growth_result_id": 1,
      "source_artist_label": "Example Artist",
      "source_artist_key": "example_artist",
      "artist_id": 2,
      "artist_name": "Kendrick Lamar",
      "mean_market_growth_score": 71.8,
      "maximum_artist_emerging_market_score": 84.5,
      "growth_opportunity_score": 77.4,
      "growth_opportunity_class": "High",
      "pmip_growth_score": 79.2,
      "pmip_growth_class": "Strong Growth",
      "pmip_growth_rank": 1,
      "pmip_priority_class": "High Priority",
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artist_growth_intelligence
artists
intelligence_runs
```

Source-only artist intelligence is preserved through a `LEFT JOIN`.

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

### GET /api/intelligence/growth/tracks

Retrieves final track growth intelligence.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of results per page |

**Example request**

```text
GET /api/intelligence/growth/tracks?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "track_growth_result_id": 1,
      "source_track_id": "SOURCE-TRACK-001",
      "track_id": 25,
      "track_name": "Example Track",
      "mean_market_growth_score": 69.6,
      "maximum_track_emerging_market_score": 87.2,
      "growth_opportunity_score": 78.5,
      "growth_opportunity_class": "High",
      "pmip_growth_score": 80.1,
      "pmip_growth_class": "Strong Growth",
      "pmip_growth_rank": 1,
      "pmip_priority_class": "High Priority",
      "run_id": 10,
      "component_name": "market_growth_intelligence"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
track_growth_intelligence
tracks
intelligence_runs
```

**PMIP intelligence component**

```text
market_growth_intelligence
```

---

## 14. Momentum Intelligence Endpoints

Momentum intelligence endpoints expose artist momentum scores produced by the PMIP artist momentum scoring component.

Results are taken from the latest run where:

```text
component_name = artist_momentum_scoring
```

---

### GET /api/intelligence/momentum/artists

Retrieves paginated artist momentum intelligence.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of momentum results per page |

**Example request**

```text
GET /api/intelligence/momentum/artists?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "momentum_result_id": 568,
      "artist_id": 2,
      "artist_name": "Kendrick Lamar",
      "final_momentum_score": 60.6,
      "momentum_category": "High Momentum",
      "shared_score_rank": 568,
      "displayed_position": 568,
      "main_neutral_driver": "Listener Peak Ratio",
      "relative_daily_growth_component": 0.0,
      "listener_peak_ratio_component": 0.606,
      "growth_contribution": 0.0,
      "peak_position_contribution": 60.6,
      "run_id": 2,
      "component_name": "artist_momentum_scoring",
      "component_version": "1.0"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artist_momentum_results
artists
intelligence_runs
```

**PMIP intelligence component**

```text
artist_momentum_scoring
```

---

### GET /api/intelligence/momentum/artists/:artistId

Retrieves the latest momentum intelligence for one canonical PMIP artist.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `artistId` | Integer | Yes | Positive canonical PMIP artist ID |

**Query parameters**

None.

**Example request**

```text
GET /api/intelligence/momentum/artists/2
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "momentum_result_id": 568,
    "artist_id": 2,
    "artist_name": "Kendrick Lamar",
    "final_momentum_score": 60.6,
    "momentum_category": "High Momentum",
    "shared_score_rank": 568,
    "displayed_position": 568,
    "main_neutral_driver": "Listener Peak Ratio",
    "run_id": 2,
    "component_name": "artist_momentum_scoring",
    "component_version": "1.0"
  }
}
```

**Possible errors**

Invalid artist ID:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ARTIST_ID",
    "message": "Artist ID must be a positive integer."
  }
}
```

Valid artist ID with no momentum result:

```json
{
  "status": "error",
  "error": {
    "code": "INTELLIGENCE_NOT_FOUND",
    "message": "No artist momentum result was found for this artist in the latest artist momentum intelligence run."
  }
}
```

**HTTP status codes**

```text
200 OK
400 Bad Request
404 Not Found
500 Internal Server Error
```

**Database support**

```text
artist_momentum_results
artists
intelligence_runs
```

**PMIP intelligence component**

```text
artist_momentum_scoring
```

---

## 15. Forecasting Intelligence Endpoints

Forecasting endpoints expose track-level Spotify stream predictions produced by the PMIP artist performance forecasting component.

Results are taken from the latest run where:

```text
component_name = artist_performance_forecasting
```

---

### GET /api/intelligence/forecasting/tracks

Retrieves paginated track forecasting results.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of forecast results per page |

**Example request**

```text
GET /api/intelligence/forecasting/tracks?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "forecast_result_id": 477,
      "track_id": 9,
      "track_name": "Example Track",
      "predicted_spotify_streams": 150000000,
      "actual_spotify_streams": 145000000,
      "raw_predicted_spotify_streams": 150000000,
      "prediction_error": 5000000,
      "absolute_prediction_error": 5000000,
      "prediction_was_clipped": 0,
      "prediction_date": "2026-01-01T00:00:00.000Z",
      "feature_coverage": 1,
      "high_forecast_review_flag": 0,
      "run_id": 1,
      "component_name": "artist_performance_forecasting",
      "component_version": "1.0"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 100,
    "totalPages": 20
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
forecast_results
tracks
intelligence_runs
```

**PMIP intelligence component**

```text
artist_performance_forecasting
```

---

### GET /api/intelligence/forecasting/tracks/:trackId

Retrieves the latest forecasting result for one canonical PMIP track.

**Route parameters**

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `trackId` | Integer | Yes | Positive canonical PMIP track ID |

**Query parameters**

None.

**Example request**

```text
GET /api/intelligence/forecasting/tracks/9
```

**Example success response**

```json
{
  "status": "success",
  "data": {
    "forecast_result_id": 477,
    "track_id": 9,
    "track_name": "Example Track",
    "predicted_spotify_streams": 150000000,
    "actual_spotify_streams": 145000000,
    "raw_predicted_spotify_streams": 150000000,
    "prediction_error": 5000000,
    "absolute_prediction_error": 5000000,
    "prediction_was_clipped": 0,
    "prediction_date": "2026-01-01T00:00:00.000Z",
    "feature_coverage": 1,
    "high_forecast_review_flag": 0,
    "run_id": 1,
    "component_name": "artist_performance_forecasting",
    "component_version": "1.0"
  }
}
```

**Possible errors**

Invalid track ID:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TRACK_ID",
    "message": "Track ID must be a positive integer."
  }
}
```

Valid track ID with no forecasting result:

```json
{
  "status": "error",
  "error": {
    "code": "INTELLIGENCE_NOT_FOUND",
    "message": "No track forecasting result was found for this track in the latest forecasting intelligence run."
  }
}
```

**HTTP status codes**

```text
200 OK
400 Bad Request
404 Not Found
500 Internal Server Error
```

**Database support**

```text
forecast_results
tracks
intelligence_runs
```

**PMIP intelligence component**

```text
artist_performance_forecasting
```

---

## 16. Streaming Anomaly Endpoints

Streaming anomaly endpoints expose track-level anomaly results and artist-level anomaly summaries produced by the PMIP streaming anomaly detection component.

Results are taken from the latest run where:

```text
component_name = streaming_anomaly_detection
```

---

### GET /api/intelligence/anomalies/tracks

Retrieves paginated track-level streaming anomaly results.

The endpoint deduplicates repeated anomaly source rows so that only one API result is returned for each unique streaming observation.

When duplicate anomaly rows exist for the same observation and run, the record with the smallest matching `anomaly_result_id` is retained.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of anomaly results per page |
| `finalOnly` | Boolean/String | No | `true` | Whether to return only final PCA anomalies |

Supported `finalOnly` values are:

```text
true
false
1
0
```

**Example request**

```text
GET /api/intelligence/anomalies/tracks?finalOnly=true&limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "anomaly_result_id": 100,
      "observation_id": 500000,
      "track_id": 25,
      "track_name": "Example Track",
      "country_id": 5,
      "observation_date": "2026-01-01T00:00:00.000Z",
      "streams": 450000,
      "chart_position": 12,
      "pca_reconstruction_error": 2.84,
      "anomaly_score_ratio": 3.12,
      "anomaly_score_margin": 1.42,
      "anomaly_score_excess_pct": 212.5,
      "is_final_pca_anomaly": 1,
      "anomaly_direction": "positive",
      "anomaly_severity": "high",
      "severity_rank": 3,
      "model_partition": "test",
      "run_id": 6,
      "component_name": "streaming_anomaly_detection",
      "component_version": "1.0"
    }
  ],
  "filters": {
    "finalOnly": true
  },
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 12338,
    "totalPages": 2468
  }
}
```

When `finalOnly=false`, non-final anomaly results may also be returned.

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
400 INVALID_FINAL_ONLY
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
streaming_anomaly_results
streaming_observations
tracks
intelligence_runs
```

**Deduplication behaviour**

The raw anomaly table may contain multiple source rows for the same observation.

The API counts:

```text
DISTINCT observation_id
```

and returns one anomaly result per unique observation.

**PMIP intelligence component**

```text
streaming_anomaly_detection
```

---

### GET /api/intelligence/anomalies/artists

Retrieves paginated artist-level anomaly summaries.

Multiple source artist labels may map to the same canonical PMIP artist. The endpoint combines those rows so that each canonical artist appears once.

**Route parameters**

None.

**Query parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---:|---:|---|
| `page` | Integer | No | `1` | Page number |
| `limit` | Integer | No | `20` | Number of artists per page |

**Example request**

```text
GET /api/intelligence/anomalies/artists?limit=5
```

**Example success response**

```json
{
  "status": "success",
  "data": [
    {
      "artist_id": 259,
      "artist_name": "SEVENTEEN",
      "source_artist_labels": "SEVENTEEN, Seventeen",
      "total_observations": 134,
      "final_anomaly_count": 1,
      "high_priority_anomaly_count": 0,
      "extreme_anomaly_count": 0,
      "positive_anomaly_count": 1,
      "negative_anomaly_count": 0,
      "flat_anomaly_count": 0,
      "anomaly_rate_pct": 0.7463,
      "high_priority_share_pct": 0,
      "maximum_pca_score": 2.5,
      "maximum_anomaly_score_ratio": 3.1,
      "artist_review_score": 1.4,
      "latest_observation_date": "2026-01-01T00:00:00.000Z",
      "run_id": 6,
      "component_name": "streaming_anomaly_detection",
      "component_version": "1.0"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 6543,
    "totalPages": 1309
  }
}
```

**Possible errors**

```text
400 INVALID_PAGE
400 INVALID_LIMIT
500 INTERNAL_SERVER_ERROR
```

**Database support**

```text
artist_anomaly_summaries
artists
intelligence_runs
```

**Aggregation behaviour**

The endpoint groups anomaly summaries by canonical `artist_id`.

When multiple source labels map to the same canonical artist:

- source labels are combined
- observation counts are summed
- anomaly counts are summed
- maximum scores are preserved using the appropriate aggregate
- the canonical artist appears only once in the API response

**PMIP intelligence component**

```text
streaming_anomaly_detection
```

---

## 17. Common Error Responses

The PMIP backend uses a consistent JSON structure for errors:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

The following error responses are used across the API.

---

### 400 Bad Request

A `400 Bad Request` response is returned when the request contains invalid route parameters, query parameters, malformed JSON, or unsupported filter values.

#### INVALID_ARTIST_ID

Returned when `artistId` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ARTIST_ID",
    "message": "Artist ID must be a positive integer."
  }
}
```

---

#### INVALID_TRACK_ID

Returned when `trackId` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TRACK_ID",
    "message": "Track ID must be a positive integer."
  }
}
```

---

#### INVALID_RELEASE_ID

Returned when `releaseId` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_RELEASE_ID",
    "message": "Release ID must be a positive integer."
  }
}
```

---

#### INVALID_COUNTRY_ID

Returned when `countryId` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_COUNTRY_ID",
    "message": "Country ID must be a positive integer."
  }
}
```

---

#### INVALID_PAGE

Returned when `page` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PAGE",
    "message": "Page must be a positive integer."
  }
}
```

---

#### INVALID_LIMIT

Returned when `limit` is not a positive integer.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_LIMIT",
    "message": "Limit must be a positive integer."
  }
}
```

---

#### INVALID_SEARCH_QUERY

Returned when the search query is missing or is not valid text.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_SEARCH_QUERY",
    "message": "Search query must be text."
  }
}
```

---

#### EMPTY_SEARCH_QUERY

Returned when a search query contains no usable text after trimming whitespace.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "EMPTY_SEARCH_QUERY",
    "message": "Search query cannot be empty."
  }
}
```

---

#### INVALID_FINAL_ONLY

Returned when the `finalOnly` anomaly filter contains an unsupported value.

Supported values are:

```text
true
false
1
0
```

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_FINAL_ONLY",
    "message": "finalOnly must be true or false."
  }
}
```

---

#### BAD_REQUEST

Returned for malformed requests such as invalid JSON request bodies.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "BAD_REQUEST",
    "message": "Unexpected end of JSON input"
  }
}
```

---

### 404 Not Found

A `404 Not Found` response is returned when the request is valid but the requested resource, intelligence result, or API route does not exist.

#### RESOURCE_NOT_FOUND

Returned when a valid canonical entity ID does not match an existing artist, track, or release.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested artist could not be found."
  }
}
```

The message changes according to the resource being requested.

---

#### INTELLIGENCE_NOT_FOUND

Returned when a valid artist or track exists but no matching intelligence result exists in the latest relevant intelligence run.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INTELLIGENCE_NOT_FOUND",
    "message": "No artist momentum result was found for this artist in the latest artist momentum intelligence run."
  }
}
```

---

#### ROUTE_NOT_FOUND

Returned when the requested API route does not exist.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "The requested API route could not be found."
  }
}
```

---

### 500 Internal Server Error

Unexpected backend failures return a safe `500` response.

#### INTERNAL_SERVER_ERROR

Example:

```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected server error occurred."
  }
}
```

Internal MySQL error codes, SQL queries, stack traces, database credentials, and other sensitive implementation details are not returned to API clients.

Detailed unexpected errors may still be logged on the backend server for debugging.

---

#### DATABASE_CONNECTION_ERROR

The health endpoint uses a dedicated error when the database connection check fails.

Example:

```json
{
  "status": "error",
  "error": {
    "code": "DATABASE_CONNECTION_ERROR",
    "message": "PMIP database connection failed."
  }
}
```

---

## 18. Database and Intelligence Component Mapping

This section summarises which PMIP database tables and intelligence components support each endpoint group.

| API area | Main database tables | Intelligence component |
|---|---|---|
| Health | Database connection | None |
| Artists | `artists`, `track_artists`, `tracks` | None |
| Tracks | `tracks` | None |
| Releases | `releases`, `release_tracks`, `tracks` | None |
| Streaming | `streaming_observations`, `tracks`, `countries` | None |
| Geographic countries | `country_geographic_intelligence`, `countries`, `intelligence_runs` | `geographic_intelligence` |
| Geographic artists | `artist_geographic_intelligence`, `artists`, `intelligence_runs` | `geographic_intelligence` |
| Geographic tracks | `track_geographic_intelligence`, `tracks`, `intelligence_runs` | `geographic_intelligence` |
| Market movements | `track_market_movements`, `tracks`, `countries`, `intelligence_runs` | `market_growth_intelligence` |
| Country market growth | `country_market_growth`, `countries`, `intelligence_runs` | `market_growth_intelligence` |
| Artist market growth | `artist_market_growth`, `artists`, `countries`, `intelligence_runs` | `market_growth_intelligence` |
| Track market growth | `track_market_growth`, `tracks`, `countries`, `intelligence_runs` | `market_growth_intelligence` |
| Artist growth | `artist_growth_intelligence`, `artists`, `intelligence_runs` | `market_growth_intelligence` |
| Track growth | `track_growth_intelligence`, `tracks`, `intelligence_runs` | `market_growth_intelligence` |
| Artist momentum | `artist_momentum_results`, `artists`, `intelligence_runs` | `artist_momentum_scoring` |
| Track forecasting | `forecast_results`, `tracks`, `intelligence_runs` | `artist_performance_forecasting` |
| Track anomalies | `streaming_anomaly_results`, `streaming_observations`, `tracks`, `intelligence_runs` | `streaming_anomaly_detection` |
| Artist anomaly summaries | `artist_anomaly_summaries`, `artists`, `intelligence_runs` | `streaming_anomaly_detection` |

### Latest-run behaviour

Intelligence endpoints return results from the latest completed run for the relevant intelligence component.

The backend identifies the latest run using the maximum available `run_id` for the required `component_name`.

Examples include:

```text
geographic_intelligence
market_growth_intelligence
artist_momentum_scoring
artist_performance_forecasting
streaming_anomaly_detection
```

This prevents older intelligence results from being mixed with the newest API responses.

### Canonical entity relationships

Core PMIP relationships include:

```text
artists
   ↓
track_artists
   ↓
tracks
```

and:

```text
releases
   ↓
release_tracks
   ↓
tracks
```

Streaming relationships include:

```text
streaming_observations
   ↓
tracks

streaming_observations
   ↓
countries
```

### Source-only intelligence records

Some intelligence tables contain source records that cannot be safely mapped to a canonical PMIP artist, track, or country.

Where appropriate, the API uses `LEFT JOIN` behaviour so those intelligence records remain available.

An unmatched source record may therefore contain:

```json
{
  "artist_id": null,
  "artist_name": null
}
```

or the equivalent null track or country fields.

This is intentional.

The backend does not create a false canonical relationship simply to avoid returning a null ID.

### Anomaly deduplication

The raw streaming anomaly data can contain multiple source rows for the same streaming observation.

The track anomaly endpoint returns one result per unique:

```text
observation_id
```

When repeated rows exist for the same observation and intelligence run, the API retains the row with the smallest matching:

```text
anomaly_result_id
```

Pagination totals are based on unique observations rather than raw anomaly rows.

Artist anomaly summaries are also grouped by canonical:

```text
artist_id
```

so multiple source artist labels mapped to the same PMIP artist do not create duplicate artist results.

---

## 19. Complete Endpoint Summary

The completed PMIP backend exposes the following API endpoints.

### Health

```text
GET /api/health
```

### Artists

```text
GET /api/artists
GET /api/artists/search
GET /api/artists/:artistId
GET /api/artists/:artistId/tracks
```

### Tracks

```text
GET /api/tracks
GET /api/tracks/search
GET /api/tracks/:trackId
```

### Releases

```text
GET /api/releases
GET /api/releases/:releaseId
GET /api/releases/:releaseId/tracks
```

### Streaming

```text
GET /api/streaming
GET /api/streaming/chart-performance
```

### Geographic Intelligence

```text
GET /api/intelligence/geographic/countries
GET /api/intelligence/geographic/artists
GET /api/intelligence/geographic/tracks
```

### Market Intelligence

```text
GET /api/intelligence/markets/movements
GET /api/intelligence/markets/countries
GET /api/intelligence/markets/artists
GET /api/intelligence/markets/tracks
```

### Growth Intelligence

```text
GET /api/intelligence/growth/artists
GET /api/intelligence/growth/tracks
```

### Momentum Intelligence

```text
GET /api/intelligence/momentum/artists
GET /api/intelligence/momentum/artists/:artistId
```

### Forecasting Intelligence

```text
GET /api/intelligence/forecasting/tracks
GET /api/intelligence/forecasting/tracks/:trackId
```

### Streaming Anomaly Intelligence

```text
GET /api/intelligence/anomalies/tracks
GET /api/intelligence/anomalies/artists
```

---

## Final Notes

The PMIP backend API is designed to provide a consistent interface between the PMIP database, intelligence outputs, and future frontend applications.

The completed API provides:

- structured access to canonical artists, tracks, and releases
- historical streaming and chart-performance information
- geographic intelligence
- market-growth intelligence
- artist momentum scoring
- track performance forecasting
- streaming anomaly detection
- consistent pagination
- search functionality
- parameter validation
- predictable success and error responses
- safe handling of unexpected server and database errors
- preservation of unmatched source intelligence records
- protection against accidental row multiplication and duplicate anomaly results

Future endpoints should continue to follow the same response structure, validation rules, error handling, naming conventions, and database relationship principles documented in this file.