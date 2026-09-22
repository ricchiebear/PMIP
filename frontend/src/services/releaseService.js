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
// Release collection
// ============================================================

async function getReleases(
  page = 1,
  limit = 20
) {
  return requestJson(
    `${API_BASE_URL}/api/releases?page=${page}&limit=${limit}`,
    'Unable to load releases.'
  );
}


// ============================================================
// Individual release
// ============================================================

async function getReleaseById(releaseId) {
  return requestJson(
    `${API_BASE_URL}/api/releases/${releaseId}`,
    'Unable to load release.'
  );
}


// ============================================================
// Release tracks
// ============================================================

async function getReleaseTracks(releaseId) {
  return requestJson(
    `${API_BASE_URL}/api/releases/${releaseId}/tracks`,
    'Unable to load release tracks.'
  );
}


// ============================================================
// Release-performance intelligence
// ============================================================

async function getReleasePerformance(releaseId) {
  return requestJson(
    `${API_BASE_URL}/api/releases/${releaseId}/performance`,
    'Unable to load release performance.'
  );
}


// ============================================================
// Exports
// ============================================================

export {
  getReleases,
  getReleaseById,
  getReleaseTracks,
  getReleasePerformance
};