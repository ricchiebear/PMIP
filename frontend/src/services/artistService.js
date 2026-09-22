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
// Artist search
// ============================================================

async function searchArtists(
  query,
  limit = 20
) {
  return requestJson(
    `${API_BASE_URL}/api/artists/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    'Unable to search for artists.'
  );
}


// ============================================================
// Individual artist
// ============================================================

async function getArtistById(artistId) {
  return requestJson(
    `${API_BASE_URL}/api/artists/${artistId}`,
    'Unable to load artist.'
  );
}


// ============================================================
// Artist tracks
// ============================================================

async function getArtistTracks(
  artistId,
  page = 1,
  limit = 20
) {
  return requestJson(
    `${API_BASE_URL}/api/artists/${artistId}/tracks?page=${page}&limit=${limit}`,
    'Unable to load artist tracks.'
  );
}


// ============================================================
// Exports
// ============================================================

export {
  searchArtists,
  getArtistById,
  getArtistTracks
};