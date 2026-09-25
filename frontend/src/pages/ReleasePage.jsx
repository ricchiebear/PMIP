import { useEffect, useState } from 'react';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';
import SummaryCard from '../components/common/SummaryCard';

import ReleasePerformanceChart
  from '../components/releases/ReleasePerformanceChart';

import {
  getReleases,
  getReleaseTracks,
  getReleasePerformance
} from '../services/releaseService';


function ReleasePage() {
  // ============================================================
  // Release collection
  // ============================================================

  const [releases, setReleases] = useState([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState('');


  // ============================================================
  // Selected release
  // ============================================================

  const [release, setRelease] = useState(null);
  const [tracks, setTracks] = useState([]);


  // ============================================================
  // Release-performance intelligence
  // ============================================================

  const [performance, setPerformance] = useState([]);


  // ============================================================
  // Release collection states
  // ============================================================

  const [loadingReleases, setLoadingReleases] = useState(true);
  const [releaseError, setReleaseError] = useState('');


  // ============================================================
  // Release details states
  // ============================================================

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');


  // ============================================================
  // Performance intelligence states
  // ============================================================

  const [
    loadingPerformance,
    setLoadingPerformance
  ] = useState(false);

  const [
    performanceError,
    setPerformanceError
  ] = useState('');

  const [
    performanceLoaded,
    setPerformanceLoaded
  ] = useState(false);


  // ============================================================
  // Load release collection
  // ============================================================

  useEffect(() => {
    async function loadReleases() {
      try {
        setLoadingReleases(true);
        setReleaseError('');

        setReleases([]);
        setSelectedReleaseId('');

        const result =
          await getReleases(
            1,
            20
          );

        const loadedReleases =
          result.data || [];

        setReleases(
          loadedReleases
        );

        if (loadedReleases.length > 0) {
          setSelectedReleaseId(
            String(
              loadedReleases[0].release_id
            )
          );
        }
      } catch (error) {
        setReleases([]);
        setSelectedReleaseId('');

        setReleaseError(
          error.message ||
          'Unable to load releases. Please try again.'
        );
      } finally {
        setLoadingReleases(false);
      }
    }

    loadReleases();
  }, []);


  // ============================================================
  // Load selected release
  // ============================================================

  useEffect(() => {
    if (!selectedReleaseId) {
      return;
    }

    async function loadReleaseDetails() {
      setRelease(null);
      setTracks([]);
      setPerformance([]);

      setDetailsError('');
      setPerformanceError('');
      setPerformanceLoaded(false);


      // =========================================================
      // Load release and tracks
      // =========================================================

      try {
        setLoadingDetails(true);

        const tracksResult =
          await getReleaseTracks(
            selectedReleaseId
          );

        setRelease(
          tracksResult.data?.release || null
        );

        setTracks(
          tracksResult.data?.tracks || []
        );
      } catch (error) {
        setRelease(null);
        setTracks([]);

        setDetailsError(
          error.message ||
          'Unable to load release details.'
        );

        setLoadingDetails(false);

        return;
      } finally {
        setLoadingDetails(false);
      }


      // =========================================================
      // Load release-performance intelligence
      // =========================================================

      try {
        setLoadingPerformance(true);
        setPerformanceError('');

        const performanceResult =
          await getReleasePerformance(
            selectedReleaseId
          );

        setPerformance(
          performanceResult.data?.performance || []
        );

        setPerformanceLoaded(true);
      } catch (error) {
        setPerformance([]);

        setPerformanceError(
          error.message ||
          'Unable to load release-performance intelligence.'
        );

        setPerformanceLoaded(true);
      } finally {
        setLoadingPerformance(false);
      }
    }

    loadReleaseDetails();
  }, [selectedReleaseId]);


  // ============================================================
  // Date formatter
  // ============================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Not available';
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  // ============================================================
  // Score formatter
  // ============================================================

  function formatScore(score) {
    if (
      score === null ||
      score === undefined ||
      score === ''
    ) {
      return 'Not available';
    }

    const parsedScore =
      Number(score);

    if (Number.isNaN(parsedScore)) {
      return 'Not available';
    }

    return parsedScore.toFixed(2);
  }


  // ============================================================
  // Review status
  // ============================================================

  function getReviewStatus(item) {
    if (
      !item.human_review_priority ||
      item.human_review_priority === 'Unavailable' ||
      item.human_review_priority === 'Not available'
    ) {
      return 'No review status';
    }

    return item.human_review_priority;
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      <PageHeader
        title="Releases"
        description="Explore releases, their tracks and PMIP's view of how those tracks are performing."
      />


      {/* ========================================================
          Release selection
      ======================================================== */}

      <ContentSection
        title="Browse Releases"
        eyebrow="Release Explorer"
        variant="intelligence"
      >

        <p>
          Choose a release to see its tracks and understand how
          PMIP evaluates their performance.
        </p>


        {loadingReleases && (
          <p className="intelligence-state-message">
            Loading releases...
          </p>
        )}


        {!loadingReleases &&
          releaseError && (
            <p className="intelligence-state-message intelligence-state-error">
              {releaseError}
            </p>
          )}


        {!loadingReleases &&
          !releaseError &&
          releases.length === 0 && (
            <p className="intelligence-state-message">
              No releases are currently available.
            </p>
          )}


        {!loadingReleases &&
          !releaseError &&
          releases.length > 0 && (
            <div className="release-selector-card">

              <label htmlFor="release-select">
                Select a release
              </label>

              <select
                id="release-select"
                value={selectedReleaseId}
                disabled={loadingDetails}
                onChange={(event) =>
                  setSelectedReleaseId(
                    event.target.value
                  )
                }
              >
                {releases.map(
                  (releaseItem) => (
                    <option
                      key={
                        releaseItem.release_id
                      }
                      value={
                        releaseItem.release_id
                      }
                    >
                      {
                        releaseItem.release_title
                      }
                    </option>
                  )
                )}
              </select>

            </div>
          )}

      </ContentSection>


      {/* ========================================================
          Release details loading
      ======================================================== */}

      {loadingDetails && (
        <ContentSection
          title="Release Details"
          eyebrow="Release Summary"
          variant="intelligence"
        >
          <p className="intelligence-state-message">
            Loading release information...
          </p>
        </ContentSection>
      )}


      {/* ========================================================
          Release details error
      ======================================================== */}

      {!loadingDetails &&
        detailsError && (
          <ContentSection
            title="Unable to Load Release"
            eyebrow="Release Summary"
            variant="intelligence"
          >
            <p className="intelligence-state-message intelligence-state-error">
              {detailsError}
            </p>
          </ContentSection>
        )}


      {/* ========================================================
          Selected release
      ======================================================== */}

      {!loadingDetails &&
        !detailsError &&
        release && (
          <>

            {/* ==================================================
                Release summary
            ================================================== */}

            <ContentSection
              title="Release Summary"
              eyebrow="Release Profile"
              variant="intelligence"
            >

              <div className="release-summary-heading">

                <div>
                  <p className="intelligence-result-kicker">
                    Selected Release
                  </p>

                  <h3>
                    {release.release_title}
                  </h3>
                </div>


                <span className="release-summary-badge">
                  {release.release_type ||
                    'Not available'}
                </span>

              </div>


              <div className="release-summary-grid">

                <SummaryCard
                  label="Release ID"
                  value={
                    release.release_id
                  }
                />


                <SummaryCard
                  label="Release Date"
                  value={
                    formatDate(
                      release.release_date
                    )
                  }
                />


                <SummaryCard
                  label="Release Type"
                  value={
                    release.release_type ||
                    'Not available'
                  }
                />


                <SummaryCard
                  label="Associated Tracks"
                  value={
                    tracks.length
                  }
                  tone="highlight"
                />

              </div>

            </ContentSection>


            {/* ==================================================
                Related tracks
            ================================================== */}

            <ContentSection
              title="Related Tracks"
              eyebrow="Track Listing"
              variant="intelligence"
            >

              <p>
                These are the tracks connected to the selected
                release.
              </p>


              {tracks.length === 0 ? (
                <p className="intelligence-state-message">
                  No tracks are associated with this release.
                </p>
              ) : (
                <div className="release-track-list">

                  {tracks.map(
                    (track) => (
                      <article
                        className="release-track-card"
                        key={track.track_id}
                      >

                        <div className="release-track-card-header">

                          <div>
                            <p className="anomaly-result-kicker">
                              Release Track
                            </p>

                            <h3>
                              {track.track_name}
                            </h3>
                          </div>


                          <span className="release-track-id-badge">
                            Track #{track.track_id}
                          </span>

                        </div>


                        <div className="release-track-meta-grid">

                          <div className="release-track-meta-item">
                            <span>
                              Track ID
                            </span>

                            <strong>
                              {track.track_id}
                            </strong>
                          </div>


                          <div className="release-track-meta-item">
                            <span>
                              ISRC
                            </span>

                            <strong>
                              {track.isrc ||
                                'Not available'}
                            </strong>
                          </div>

                        </div>

                      </article>
                    )
                  )}

                </div>
              )}

            </ContentSection>


            {/* ==================================================
                Release-performance intelligence
            ================================================== */}

            <ContentSection
              title="Release Performance Intelligence"
              eyebrow="Release Intelligence"
              variant="intelligence"
            >

              <p>
                See how each track is performing within this
                release and how much supporting data PMIP has for
                each result.
              </p>


              {loadingPerformance && (
                <p className="intelligence-state-message">
                  Loading release-performance intelligence...
                </p>
              )}


              {!loadingPerformance &&
                performanceError && (
                  <p className="intelligence-state-message intelligence-state-error">
                    Release-performance intelligence is currently
                    unavailable. {performanceError}
                  </p>
                )}


              {performanceLoaded &&
                !loadingPerformance &&
                !performanceError &&
                performance.length === 0 && (
                  <p className="intelligence-state-message">
                    No release-performance intelligence is
                    currently available for this release.
                  </p>
                )}


              {!loadingPerformance &&
                !performanceError &&
                performance.length > 0 && (
                  <>

                    <ReleasePerformanceChart
                      performance={
                        performance
                      }
                    />


                    <div className="release-performance-results-list">

                      {performance.map(
                        (item) => (
                          <article
                            className="release-performance-result-card"
                            key={
                              item.release_performance_id
                            }
                          >

                            <div className="release-performance-result-header">

                              <div>
                                <p className="anomaly-result-kicker">
                                  Track Performance
                                </p>

                                <h3>
                                  {item.track_name ||
                                    `Track ${item.track_id}`}
                                </h3>
                              </div>


                              <div className="release-performance-badges">

                                <span className="release-performance-class-badge">
                                  {item.release_performance_class ||
                                    'Not available'}
                                </span>


                                <span className="release-priority-badge">
                                  {item.release_priority_class ||
                                    'Not available'}
                                </span>

                              </div>

                            </div>


                            <div className="release-performance-metric-grid">

                              <SummaryCard
                                label="Composite Score"
                                value={
                                  formatScore(
                                    item.composite_release_performance_score
                                  )
                                }
                                helperText="An overall score that combines PMIP's main signals for this track's release performance."
                                tone="highlight"
                              />


                              <SummaryCard
                                label="Composite Percentile"
                                value={
                                  formatScore(
                                    item.composite_release_performance_percentile
                                  )
                                }
                                helperText="Shows how this result compares with other release-performance results. A higher percentile means a stronger relative position."
                              />


                              <SummaryCard
                                label="Release Rank"
                                value={
                                  item.release_rank_position ??
                                  'Not available'
                                }
                                helperText="The track's position compared with the other tracks evaluated for release performance."
                              />


                              <SummaryCard
                                label="Performance Class"
                                value={
                                  item.release_performance_class ||
                                  'Not available'
                                }
                                helperText="A simple category that describes the overall strength of the track's release performance."
                              />

                            </div>


                            <div className="release-performance-component-grid">

                              <SummaryCard
                                label="Streaming Performance"
                                value={
                                  formatScore(
                                    item.streaming_performance_score
                                  )
                                }
                                helperText="Shows how strongly the track is performing based on its available streaming activity."
                              />


                              <SummaryCard
                                label="Temporal Comparability"
                                value={
                                  formatScore(
                                    item.temporal_comparability_score
                                  )
                                }
                                helperText="Shows how fairly this track can be compared with other tracks from a similar time period."
                              />


                              <SummaryCard
                                label="Artist-Release Relationship"
                                value={
                                  formatScore(
                                    item.artist_release_relationship_score
                                  )
                                }
                                helperText="Shows how strongly the artist's available performance information supports this release result."
                              />

                            </div>


                            <div className="release-evidence-panel">

                              <div className="release-evidence-heading">

                                <div>
                                  <p className="intelligence-insight-kicker">
                                    Evidence Quality
                                  </p>

                                  <h4>
                                    How much information supports this result?
                                  </h4>
                                </div>


                                <span className="release-evidence-badge">
                                  {item.composite_evidence_strength ||
                                    'Not available'}
                                </span>

                              </div>


                              <div className="release-evidence-grid">

                                <div className="release-evidence-item">
                                  <span>
                                    Evidence strength
                                  </span>

                                  <strong>
                                    {item.composite_evidence_strength ||
                                      'Not available'}
                                  </strong>
                                </div>


                                <div className="release-evidence-item">
                                  <span>
                                    Evidence coverage
                                  </span>

                                  <strong>
                                    {formatScore(
                                      item.composite_weight_coverage_pct
                                    )}%
                                  </strong>
                                </div>

                              </div>

                            </div>


                            <div className="release-review-panel">

                              <div className="release-review-header">

                                <div>
                                  <p className="intelligence-insight-kicker">
                                    Human Review
                                  </p>

                                  <h4>
                                    Does this result need extra attention?
                                  </h4>
                                </div>


                                <span className="release-review-badge">
                                  {getReviewStatus(item)}
                                </span>

                              </div>


                              <p>
                                {item.human_review_reason ||
                                  'PMIP did not identify an additional reason for manual review.'}
                              </p>

                            </div>


                            <div className="anomaly-interpretation">

                              <p className="intelligence-insight-kicker">
                                PMIP Interpretation
                              </p>

                              <h4>
                                What does this mean?
                              </h4>


                              <p>
                                PMIP gives{' '}

                                <strong>
                                  {item.track_name ||
                                    `Track ${item.track_id}`}
                                </strong>

                                {' '}an overall release-performance
                                score of{' '}

                                <strong>
                                  {formatScore(
                                    item.composite_release_performance_score
                                  )}
                                </strong>

                                . Its performance is classified as{' '}

                                <strong>
                                  {item.release_performance_class ||
                                    'Not available'}
                                </strong>

                                .
                              </p>


                              <p>
                                PMIP rates the supporting evidence as{' '}

                                <strong>
                                  {item.composite_evidence_strength ||
                                    'not available'}
                                </strong>

                                , with{' '}

                                <strong>
                                  {formatScore(
                                    item.composite_weight_coverage_pct
                                  )}%
                                </strong>

                                {' '}of the expected evidence available
                                for this result.
                              </p>

                            </div>

                          </article>
                        )
                      )}

                    </div>

                  </>
                )}

            </ContentSection>


            {/* ==================================================
                Explanation
            ================================================== */}

            <ContentSection
              title="How to Read This Intelligence"
              eyebrow="Interpretation Guide"
              variant="intelligence"
            >

              <div className="release-guide-grid">

                <div className="release-guide-card">
                  <span>
                    Composite Score
                  </span>

                  <p>
                    An overall measurement created by combining
                    the main signals PMIP uses to evaluate release
                    performance.
                  </p>
                </div>


                <div className="release-guide-card">
                  <span>
                    Performance Class
                  </span>

                  <p>
                    Turns the overall score into an easier category
                    such as Low, Moderate or High Release
                    Performance.
                  </p>
                </div>


                <div className="release-guide-card">
                  <span>
                    Evidence Quality
                  </span>

                  <p>
                    Shows how much reliable supporting information
                    PMIP had when producing the result.
                  </p>
                </div>


                <div className="release-guide-card">
                  <span>
                    Human Review
                  </span>

                  <p>
                    Shows whether a result may need a person to
                    look at it more closely before using it for a
                    decision.
                  </p>
                </div>

              </div>

            </ContentSection>

          </>
        )}

    </PageContainer>
  );
}


export default ReleasePage;