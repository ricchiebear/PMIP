const db = require('../config/database');

// Artist collection
async function findAll(limit = 20, offset = 0) {
  const [rows] = await db.query(
    `
      SELECT
        artist_id,
        artist_name,
        created_at,
        updated_at
      FROM artists
      ORDER BY artist_id ASC
      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows;
}

async function countAll() {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM artists
    `
  );

  return Number(rows[0].total);
}

// Individual artist
async function findById(artistId) {
  const [rows] = await db.query(
    `
      SELECT
        artist_id,
        artist_name,
        created_at,
        updated_at
      FROM artists
      WHERE artist_id = ?
      LIMIT 1
    `,
    [artistId]
  );

  return rows[0] || null;
}

// Artist tracks
async function findTracksByArtistId(artistId) {
  const [rows] = await db.query(
    `
      SELECT
        t.track_id,
        t.source_track_id,
        t.isrc,
        t.track_name,
        t.created_at,
        t.updated_at
      FROM tracks AS t
      INNER JOIN track_artists AS ta
        ON t.track_id = ta.track_id
      WHERE ta.artist_id = ?
      ORDER BY t.track_id ASC
    `,
    [artistId]
  );

  return rows;
}

// Artist search
async function searchByName(query, limit = 20) {
  const searchPattern = `%${query}%`;

  const [rows] = await db.query(
    `
      SELECT
        artist_id,
        artist_name,
        created_at,
        updated_at
      FROM artists
      WHERE artist_name LIKE ?
      ORDER BY artist_name ASC
      LIMIT ?
    `,
    [searchPattern, limit]
  );

  return rows;
}

module.exports = {
  findAll,
  countAll,
  findById,
  findTracksByArtistId,
  searchByName
};