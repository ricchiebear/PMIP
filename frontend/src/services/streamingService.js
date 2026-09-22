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
// Historical streaming data
// ============================================================

async function getStreamingHistory(
  trackId,
  countryId,
  page = 1,
  limit = 100
) {
  return requestJson(
    `${API_BASE_URL}/api/streaming?trackId=${trackId}&countryId=${countryId}&page=${page}&limit=${limit}`,
    'Unable to load streaming history.'
  );
}


// ============================================================
// Historical chart performance
// ============================================================

async function getChartPerformance(
  trackId,
  countryId,
  page = 1,
  limit = 100
) {
  return requestJson(
    `${API_BASE_URL}/api/streaming/chart-performance?trackId=${trackId}&countryId=${countryId}&page=${page}&limit=${limit}`,
    'Unable to load chart performance.'
  );
}


// ============================================================
// Exports
// ============================================================

export {
  getStreamingHistory,
  getChartPerformance
};