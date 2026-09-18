const db = require('../config/database');

// Release collection
async function findAll(limit, offset) {
  const [rows] = await db.query(
    `
      SELECT
        release_id,
        release_title,
        release_date,
        release_type,
        created_at,
        updated_at
      FROM releases
      ORDER BY release_id ASC
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
      FROM releases
    `
  );

  return Number(rows[0].total);
}

// Individual release
async function findById(releaseId) {
  const [rows] = await db.query(
    `
      SELECT
        release_id,
        release_title,
        release_date,
        release_type,
        created_at,
        updated_at
      FROM releases
      WHERE release_id = ?
      LIMIT 1
    `,
    [releaseId]
  );

  return rows[0] || null;
}

// Release tracks
async function findTracksByReleaseId(releaseId) {
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
      INNER JOIN release_tracks AS rt
        ON t.track_id = rt.track_id
      WHERE rt.release_id = ?
      ORDER BY t.track_id ASC
    `,
    [releaseId]
  );

  return rows;
}

module.exports = {
  findAll,
  countAll,
  findById,
  findTracksByReleaseId
};