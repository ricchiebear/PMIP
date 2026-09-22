import { useEffect, useState } from 'react';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';

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
      // Reset selected-release data
      setRelease(null);
      setTracks([]);
      setPerformance([]);

      setDetailsError('');
      setPerformanceError('');
      setPerformanceLoaded(false);


      // --------------------------------------------------------
      // Load essential release and track data
      // --------------------------------------------------------

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


      // --------------------------------------------------------
      // Load optional release-performance intelligence
      // --------------------------------------------------------

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
  // Helpers
  // ============================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Unavailable';
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Unavailable';
    }

    return date.toLocaleDateString();
  }


  function formatScore(score) {
    if (
      score === null ||
      score === undefined ||
      score === ''
    ) {
      return 'Unavailable';
    }

    const parsedScore =
      Number(score);

    if (Number.isNaN(parsedScore)) {
      return 'Unavailable';
    }

    return parsedScore.toFixed(2);
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      <PageHeader
        title="Releases"
        description="Explore releases, related tracks and PMIP release-performance intelligence."
      />


      {/* ========================================================
          Release selection
      ======================================================== */}

      <ContentSection title="Browse Releases">

        {loadingReleases && (
          <p>
            Loading releases...
          </p>
        )}


        {!loadingReleases &&
          releaseError && (
            <p>
              {releaseError}
            </p>
          )}


        {!loadingReleases &&
          !releaseError &&
          releases.length === 0 && (
            <p>
              No releases are currently available.
            </p>
          )}


        {!loadingReleases &&
          !releaseError &&
          releases.length > 0 && (
            <>
              <label htmlFor="release-select">
                Select a release:
              </label>

              <br />

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
            </>
          )}

      </ContentSection>


      {/* ========================================================
          Release details loading
      ======================================================== */}

      {loadingDetails && (
        <ContentSection title="Release Details">
          <p>
            Loading release information...
          </p>
        </ContentSection>
      )}


      {/* ========================================================
          Release details error
      ======================================================== */}

      {!loadingDetails &&
        detailsError && (
          <ContentSection title="Unable to Load Release">
            <p>
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

            {/* Release summary */}

            <ContentSection title="Release Summary">

              <p>
                <strong>
                  Title:
                </strong>{' '}
                {release.release_title}
              </p>

              <p>
                <strong>
                  Release ID:
                </strong>{' '}
                {release.release_id}
              </p>

              <p>
                <strong>
                  Release Date:
                </strong>{' '}
                {formatDate(
                  release.release_date
                )}
              </p>

              <p>
                <strong>
                  Release Type:
                </strong>{' '}
                {release.release_type ||
                  'Unavailable'}
              </p>

              <p>
                <strong>
                  Associated Tracks:
                </strong>{' '}
                {tracks.length}
              </p>

            </ContentSection>


            {/* ==================================================
                Related tracks
            ================================================== */}

            <ContentSection title="Related Tracks">

              {tracks.length === 0 ? (
                <p>
                  No tracks are associated with this release.
                </p>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track.track_id}
                  >
                    <h3>
                      {track.track_name}
                    </h3>

                    <p>
                      <strong>
                        Track ID:
                      </strong>{' '}
                      {track.track_id}
                    </p>

                    <p>
                      <strong>
                        ISRC:
                      </strong>{' '}
                      {track.isrc ||
                        'Unavailable'}
                    </p>

                    <hr />
                  </div>
                ))
              )}

            </ContentSection>


            {/* ==================================================
                Release-performance intelligence
            ================================================== */}

            <ContentSection title="Release Performance Intelligence">

              {/* Loading */}

              {loadingPerformance && (
                <p>
                  Loading release-performance intelligence...
                </p>
              )}


              {/* API error */}

              {!loadingPerformance &&
                performanceError && (
                  <p>
                    Release-performance intelligence is
                    currently unavailable.{' '}
                    {performanceError}
                  </p>
                )}


              {/* Empty intelligence */}

              {performanceLoaded &&
                !loadingPerformance &&
                !performanceError &&
                performance.length === 0 && (
                  <p>
                    No release-performance intelligence is
                    currently available for this release.
                  </p>
                )}


              {/* Intelligence results */}

              {!loadingPerformance &&
                !performanceError &&
                performance.length > 0 && (
                  <>

                    <ReleasePerformanceChart
                      performance={
                        performance
                      }
                    />

                    <br />


                    {performance.map((item) => (
                      <div
                        key={
                          item.release_performance_id
                        }
                      >
                        <h3>
                          {item.track_name ||
                            `Track ${item.track_id}`}
                        </h3>

                        <p>
                          <strong>
                            Performance Class:
                          </strong>{' '}
                          {
                            item.release_performance_class ||
                            'Unavailable'
                          }
                        </p>

                        <p>
                          <strong>
                            Composite Performance Score:
                          </strong>{' '}
                          {formatScore(
                            item.composite_release_performance_score
                          )}
                        </p>

                        <p>
                          <strong>
                            Composite Percentile:
                          </strong>{' '}
                          {formatScore(
                            item.composite_release_performance_percentile
                          )}
                        </p>

                        <p>
                          <strong>
                            Release Rank:
                          </strong>{' '}
                          {
                            item.release_rank_position ??
                            'Unavailable'
                          }
                        </p>

                        <p>
                          <strong>
                            Streaming Performance Score:
                          </strong>{' '}
                          {formatScore(
                            item.streaming_performance_score
                          )}
                        </p>

                        <p>
                          <strong>
                            Temporal Comparability Score:
                          </strong>{' '}
                          {formatScore(
                            item.temporal_comparability_score
                          )}
                        </p>

                        <p>
                          <strong>
                            Artist-Release Relationship Score:
                          </strong>{' '}
                          {formatScore(
                            item.artist_release_relationship_score
                          )}
                        </p>

                        <p>
                          <strong>
                            Priority:
                          </strong>{' '}
                          {
                            item.release_priority_class ||
                            'Unavailable'
                          }
                        </p>

                        <p>
                          <strong>
                            Evidence Strength:
                          </strong>{' '}
                          {
                            item.composite_evidence_strength ||
                            'Unavailable'
                          }
                        </p>

                        <p>
                          <strong>
                            Evidence Coverage:
                          </strong>{' '}
                          {formatScore(
                            item.composite_weight_coverage_pct
                          )}
                          %
                        </p>

                        <p>
                          <strong>
                            Human Review:
                          </strong>{' '}
                          {
                            item.human_review_priority ||
                            'Unavailable'
                          }
                        </p>

                        <p>
                          <strong>
                            Review Reason:
                          </strong>{' '}
                          {
                            item.human_review_reason ||
                            'No review reason provided.'
                          }
                        </p>

                        <hr />
                      </div>
                    ))}

                  </>
                )}

            </ContentSection>


            {/* ==================================================
                Explanation
            ================================================== */}

            <ContentSection title="How to Read This Intelligence">

              <p>
                PMIP evaluates each track connected to the
                selected release rather than assuming every
                track on the release performed in the same way.
              </p>

              <p>
                The composite release-performance score combines
                the available performance signals into an overall
                measurement. The performance class provides a
                simpler description such as Low, Moderate or High
                Release Performance.
              </p>

              <p>
                Evidence strength and evidence coverage are
                important because some intelligence signals may
                be unavailable. A human-review recommendation
                tells the user when PMIP believes the result
                should receive additional manual attention.
              </p>

            </ContentSection>

          </>
        )}

    </PageContainer>
  );
}


export default ReleasePage;