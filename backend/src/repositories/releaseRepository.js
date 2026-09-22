const db = require('../config/database');


// ============================================================
// Release collection
// ============================================================

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


// ============================================================
// Individual release
// ============================================================

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


// ============================================================
// Release tracks
// ============================================================

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


// ============================================================
// Release-performance intelligence
// ============================================================

/**
 * Retrieve release-performance intelligence for one release.
 *
 * A release can contain multiple tracks, so this returns all
 * performance rows linked to that release from the latest run.
 *
 * @param {number} releaseId PMIP release ID.
 * @returns {Promise<Array>} Release-performance results.
 */
async function findPerformanceByReleaseId(releaseId) {
  const [rows] = await db.query(
    `
      SELECT
        rpi.release_performance_id,
        rpi.source_release_id,

        rpi.track_id,
        t.track_name,

        rpi.release_id,
        r.release_title,
        r.release_date,
        r.release_type,

        rpi.streaming_performance_score,
        rpi.chart_performance_score,
        rpi.geographic_reach_score,
        rpi.temporal_comparability_score,
        rpi.artist_release_relationship_score,
        rpi.unusual_performance_score,

        rpi.composite_release_performance_score,
        rpi.composite_release_performance_percentile,
        rpi.release_rank_position,
        rpi.release_performance_class,
        rpi.release_percentile_group,

        rpi.composite_weight_coverage_pct,
        rpi.composite_evidence_strength,

        rpi.release_priority_class,
        rpi.priority_signal_score,
        rpi.priority_signal_rank,

        rpi.high_priority_release_flag,
        rpi.priority_review_flag,
        rpi.unusual_performance_flag,

        rpi.human_review_required,
        rpi.human_review_trigger_count,
        rpi.human_review_priority,
        rpi.human_review_reason,

        rpi.run_id,
        rpi.calculated_at

      FROM release_performance_intelligence AS rpi

      LEFT JOIN tracks AS t
        ON rpi.track_id = t.track_id

      LEFT JOIN releases AS r
        ON rpi.release_id = r.release_id

      WHERE rpi.release_id = ?
        AND rpi.run_id = (
          SELECT MAX(run_id)
          FROM release_performance_intelligence
        )

      ORDER BY
        rpi.composite_release_performance_score DESC,
        rpi.release_performance_id ASC
    `,
    [releaseId]
  );

  return rows;
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  findAll,
  countAll,
  findById,
  findTracksByReleaseId,
  findPerformanceByReleaseId
};