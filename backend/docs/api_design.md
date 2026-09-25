# PMIP Backend API Design

## 1. Purpose

This document defines the structure and standards for the Public Music Intelligence Platform (PMIP) backend API.

The goal is to make the API consistent, predictable, and easy to use by the future PMIP public dashboard.

The API will expose core PMIP entities, historical streaming data, and intelligence outputs through REST-style endpoints.

---

## 2. Base API Path

All public API routes will begin with:

`/api`

Examples:

- `/api/artists`
- `/api/tracks`
- `/api/releases`
- `/api/countries`
- `/api/intelligence`

---

## 3. Route Naming Conventions

Routes will follow these rules:

- use lowercase route names
- use plural resource names
- use clear and readable resource paths
- use canonical PMIP IDs for entity lookup
- use query parameters for optional filtering and search
- avoid unnecessary verbs in route names

Preferred examples:

- `GET /api/artists`
- `GET /api/artists/:artistId`
- `GET /api/tracks/:trackId`

Avoid examples such as:

- `GET /api/getArtists`
- `GET /api/findTrackById`

---

## 4. Main API Resource Groups

The PMIP backend will organise routes into the following main groups:

### Artists

- `/api/artists`
- `/api/artists/:artistId`

### Tracks

- `/api/tracks`
- `/api/tracks/:trackId`

### Releases

- `/api/releases`
- `/api/releases/:releaseId`

### Countries

- `/api/countries`
- `/api/countries/:countryId`

### Streaming Data

- `/api/streaming`
- `/api/streaming/:trackId`

### Intelligence

- `/api/intelligence`

The intelligence group will contain the analytical outputs produced by the PMIP intelligence components.

---

## 5. Planned Artist Routes

Examples include:

- `GET /api/artists`
- `GET /api/artists/:artistId`
- `GET /api/artists/:artistId/tracks`

Planned intelligence routes:

- `GET /api/intelligence/artists/:artistId/momentum`
- `GET /api/intelligence/artists/:artistId/anomalies`
- `GET /api/intelligence/artists/:artistId/geographic`
- `GET /api/intelligence/artists/:artistId/growth`

---

## 6. Planned Track Routes

Examples include:

- `GET /api/tracks`
- `GET /api/tracks/:trackId`

Planned intelligence routes:

- `GET /api/intelligence/tracks/:trackId/forecast`
- `GET /api/intelligence/tracks/:trackId/anomalies`
- `GET /api/intelligence/tracks/:trackId/geographic`
- `GET /api/intelligence/tracks/:trackId/growth`

---

## 7. Planned Release Routes

Examples include:

- `GET /api/releases`
- `GET /api/releases/:releaseId`
- `GET /api/releases/:releaseId/tracks`

Planned intelligence route:

- `GET /api/intelligence/releases/:releaseId/performance`

---

## 8. Planned Country Routes

Examples include:

- `GET /api/countries`
- `GET /api/countries/:countryId`

Planned intelligence routes:

- `GET /api/intelligence/countries/:countryId/geographic`
- `GET /api/intelligence/countries/:countryId/growth`

---

## 9. Streaming Routes

Historical streaming data may be accessed through routes such as:

- `GET /api/streaming/:trackId`

Optional filters may include:

- `?countryId=5`
- `?page=1`
- `?limit=20`

Example:

`GET /api/streaming/123?countryId=5&page=1&limit=20`

---

## 10. Route ID Conventions

Canonical PMIP IDs will be used in route parameters.

The following naming pattern will be used:

- `:artistId`
- `:trackId`
- `:releaseId`
- `:countryId`

Examples:

- `GET /api/artists/804`
- `GET /api/tracks/123`
- `GET /api/releases/45`
- `GET /api/countries/5`

The backend will validate these IDs before querying the database.

---

## 11. Query Parameter Conventions

Optional request behaviour will use query parameters.

Examples include:

- `?page=1`
- `?limit=20`
- `?search=love`
- `?countryId=5`
- `?finalOnly=true`

Examples:

- `GET /api/artists?page=1&limit=20`
- `GET /api/tracks?search=love`
- `GET /api/intelligence/tracks/123/anomalies?finalOnly=true`

---

## 12. Pagination Rules

Large result sets will use pagination.

Default values:

- `page=1`
- `limit=20`

The API should apply a maximum allowed limit to prevent very large responses.

Recommended maximum:

- `limit=100`

Example request:

`GET /api/artists?page=2&limit=20`

The API should calculate the database offset from the page and limit values.

---

## 13. Filtering Rules

Filters should be applied through query parameters.

Examples may include:

- `countryId`
- `search`
- `finalOnly`
- `page`
- `limit`

Filters should only be applied where they are relevant to the requested resource.

Invalid filter values should return a clear client error.

---

## 14. Successful JSON Response Format

A successful single-resource response should follow this structure:

```json
{
  "status": "success",
  "data": {}
}
```

For example:

```json
{
  "status": "success",
  "data": {
    "artistId": 804,
    "artistName": "Example Artist",
    "countryId": 5
  }
}
```

This structure ensures that successful responses remain consistent across the PMIP API.

---

## 15. Successful Collection Response Format

When an endpoint returns multiple records, the response should include the data and pagination information.

Example:

```json
{
  "status": "success",
  "data": [
    {
      "artistId": 804,
      "artistName": "Example Artist"
    },
    {
      "artistId": 805,
      "artistName": "Another Artist"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

The `pagination` object allows the future PMIP dashboard to understand how many records and pages are available.

---

## 16. Intelligence Response Format

Intelligence endpoints should use a consistent response structure while allowing each intelligence component to return its own analytical results.

Example:

```json
{
  "status": "success",
  "data": {
    "entityType": "artist",
    "entityId": 804,
    "intelligenceType": "momentum",
    "result": {}
  }
}
```

For a track forecast, an example may be:

```json
{
  "status": "success",
  "data": {
    "entityType": "track",
    "entityId": 123,
    "intelligenceType": "forecast",
    "result": {}
  }
}
```

The `result` object will contain the output produced by the relevant PMIP intelligence component.

---

## 17. Error JSON Response Format

API errors should follow a consistent structure.

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

Validation errors may use:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The provided artistId is invalid."
  }
}
```

This makes errors easier for the PMIP dashboard and other API clients to understand and handle.

---

## 18. HTTP Status Codes

The PMIP API will use standard HTTP status codes.

The main status codes will include:

- `200 OK` — request completed successfully
- `201 Created` — a new resource was successfully created
- `400 Bad Request` — the request or parameter values are invalid
- `404 Not Found` — the requested resource does not exist
- `405 Method Not Allowed` — the HTTP method is not supported by the route
- `500 Internal Server Error` — an unexpected backend error occurred

Because the initial PMIP public API will mainly expose data through `GET` requests, `200`, `400`, `404`, and `500` are expected to be the most commonly used responses.

---

## 19. API Filtering and Validation Behaviour

The backend should validate route parameters and query parameters before performing database operations.

Examples include validating:

- `artistId`
- `trackId`
- `releaseId`
- `countryId`
- `page`
- `limit`
- `finalOnly`

Numeric IDs should contain valid positive values.

Pagination values should also be positive integers.

The requested `limit` must not exceed the API maximum of `100`.

Boolean parameters such as `finalOnly` should only accept supported boolean values.

Invalid values should return a `400 Bad Request` response using the standard PMIP error format.

---

## 20. API Design Principles

The PMIP API should follow several general principles during implementation:

- keep routes predictable and consistent
- keep database implementation details hidden from API users
- use canonical PMIP IDs when identifying entities
- use query parameters for optional filtering
- return JSON consistently
- validate client input before querying the database
- use appropriate HTTP status codes
- keep intelligence routes separate from core entity routes
- avoid exposing internal model files or implementation details
- design endpoints so they can be consumed easily by the future PMIP public dashboard

These principles should be followed when new routes are added to the platform.

---

## 21. Initial API Route Summary

The planned PMIP API structure is summarised below.

### Core Resources

```text
GET /api/artists
GET /api/artists/:artistId
GET /api/artists/:artistId/tracks

GET /api/tracks
GET /api/tracks/:trackId

GET /api/releases
GET /api/releases/:releaseId
GET /api/releases/:releaseId/tracks

GET /api/countries
GET /api/countries/:countryId

GET /api/streaming/:trackId
```

### Intelligence Resources

```text
GET /api/intelligence/artists/:artistId/momentum
GET /api/intelligence/artists/:artistId/anomalies
GET /api/intelligence/artists/:artistId/geographic
GET /api/intelligence/artists/:artistId/growth

GET /api/intelligence/tracks/:trackId/forecast
GET /api/intelligence/tracks/:trackId/anomalies
GET /api/intelligence/tracks/:trackId/geographic
GET /api/intelligence/tracks/:trackId/growth

GET /api/intelligence/releases/:releaseId/performance

GET /api/intelligence/countries/:countryId/geographic
GET /api/intelligence/countries/:countryId/growth
```

This structure provides the initial REST API contract for PMIP.

The routes may be extended as the backend develops, but future additions should continue to follow the conventions defined in this document.