const db = require('../config/database');


// ============================================================
// Country display names
// ============================================================

const regionNames = new Intl.DisplayNames(
  ['en-GB'],
  {
    type: 'region'
  }
);


function getCountryDisplayName(country) {
  const value =
    country.country_code ||
    country.country_name;

  if (!value) {
    return '';
  }

  const code =
    String(value)
      .trim()
      .toUpperCase();

  if (code.length !== 2) {
    return String(
      country.country_name || value
    );
  }

  try {
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
}


// ============================================================
// Global search
// ============================================================

async function searchAll(query, limit = 5) {
  const searchPattern = `%${query}%`;

  const [
    [artists],
    [tracks],
    [releases],
    [countryRows]
  ] = await Promise.all([

    // Artists
    db.query(
      `
        SELECT
          artist_id,
          artist_name
        FROM artists
        WHERE artist_name LIKE ?
        ORDER BY artist_name ASC
        LIMIT ?
      `,
      [searchPattern, limit]
    ),


    // Tracks
    db.query(
      `
        SELECT
          track_id,
          source_track_id,
          isrc,
          track_name
        FROM tracks
        WHERE track_name LIKE ?
        ORDER BY track_name ASC
        LIMIT ?
      `,
      [searchPattern, limit]
    ),


    // Releases
    db.query(
      `
        SELECT
          release_id,
          release_title,
          release_date,
          release_type
        FROM releases
        WHERE release_title LIKE ?
        ORDER BY release_title ASC
        LIMIT ?
      `,
      [searchPattern, limit]
    ),


    // Countries
    db.query(
      `
        SELECT
          country_id,
          country_name,
          country_code
        FROM countries
        ORDER BY country_name ASC
      `
    )

  ]);


  // ============================================================
  // Country search
  // ============================================================

  const normalisedQuery =
    query
      .trim()
      .toLowerCase();


  const countries =
    countryRows
      .filter((country) => {
        const storedName =
          String(
            country.country_name || ''
          ).toLowerCase();

        const storedCode =
          String(
            country.country_code || ''
          ).toLowerCase();

        const displayName =
          getCountryDisplayName(country)
            .toLowerCase();

        return (
          storedName.includes(normalisedQuery) ||
          storedCode.includes(normalisedQuery) ||
          displayName.includes(normalisedQuery)
        );
      })
      .slice(0, limit);


  return {
    artists,
    tracks,
    releases,
    countries
  };
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  searchAll
};