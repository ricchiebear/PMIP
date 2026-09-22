const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


// ============================================================
// Shared request helper
// ============================================================

async function requestJson(url, fallbackMessage) {
  try {
    const response = await fetch(url);

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      throw new Error(
        result?.error?.message ||
        fallbackMessage
      );
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to connect to the PMIP backend. Please try again.'
      );
    }

    throw error;
  }
}


// ============================================================
// Momentum intelligence
// ============================================================

async function getArtistMomentum(artistId) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/momentum/artists/${artistId}`,
    'Unable to load artist momentum.'
  );
}


// ============================================================
// Growth intelligence
// ============================================================

async function getArtistGrowth(artistId) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/growth/artists/${artistId}`,
    'Unable to load artist growth.'
  );
}


// ============================================================
// Forecasting intelligence
// ============================================================

async function getTrackForecast(trackId) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/forecasting/tracks/${trackId}`,
    'Unable to load track forecast.'
  );
}


// ============================================================
// Anomaly intelligence
// ============================================================

async function getTrackAnomalies(
  page = 1,
  limit = 20
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/anomalies/tracks?page=${page}&limit=${limit}`,
    'Unable to load track anomalies.'
  );
}


async function getArtistAnomalies(
  page = 1,
  limit = 20
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/anomalies/artists?page=${page}&limit=${limit}`,
    'Unable to load artist anomaly summaries.'
  );
}


// ============================================================
// Geographic intelligence
// ============================================================

async function getCountryGeographicIntelligence(
  page = 1,
  limit = 5
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/geographic/countries?page=${page}&limit=${limit}`,
    'Unable to load country geographic intelligence.'
  );
}


async function getArtistGeographicIntelligence(
  page = 1,
  limit = 5
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/geographic/artists?page=${page}&limit=${limit}`,
    'Unable to load artist geographic intelligence.'
  );
}


// ============================================================
// Market intelligence
// ============================================================

async function getCountryMarketGrowth(
  page = 1,
  limit = 5
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/markets/countries?page=${page}&limit=${limit}`,
    'Unable to load country market growth.'
  );
}


async function getArtistMarketGrowth(
  page = 1,
  limit = 5
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/markets/artists?page=${page}&limit=${limit}`,
    'Unable to load artist market growth.'
  );
}


async function getMarketMovements(
  page = 1,
  limit = 5
) {
  return requestJson(
    `${API_BASE_URL}/api/intelligence/markets/movements?page=${page}&limit=${limit}`,
    'Unable to load market movements.'
  );
}


// ============================================================
// Exports
// ============================================================

export {
  getArtistMomentum,
  getArtistGrowth,
  getTrackForecast,
  getTrackAnomalies,
  getArtistAnomalies,
  getCountryGeographicIntelligence,
  getArtistGeographicIntelligence,
  getCountryMarketGrowth,
  getArtistMarketGrowth,
  getMarketMovements
};