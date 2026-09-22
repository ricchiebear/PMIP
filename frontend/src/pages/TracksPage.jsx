import { useState } from 'react';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';

import StreamingTrendChart from '../components/tracks/StreamingTrendChart';
import ChartPositionTrendChart from '../components/tracks/ChartPositionTrendChart';

import {
  getStreamingHistory,
  getChartPerformance
} from '../services/streamingService';


function TracksPage() {
  // ============================================================
  // Search inputs
  // ============================================================

  const [trackId, setTrackId] = useState('228');
  const [countryId, setCountryId] = useState('65');


  // ============================================================
  // Streaming data
  // ============================================================

  const [streamingHistory, setStreamingHistory] = useState([]);
  const [chartPerformance, setChartPerformance] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);


  // ============================================================
  // Load track performance
  // ============================================================

  async function handleLoadPerformance(event) {
    event.preventDefault();

    const parsedTrackId = Number(trackId);
    const parsedCountryId = Number(countryId);


    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (
      !Number.isInteger(parsedTrackId) ||
      parsedTrackId <= 0 ||
      !Number.isInteger(parsedCountryId) ||
      parsedCountryId <= 0
    ) {
      setStreamingHistory([]);
      setChartPerformance([]);
      setHasLoaded(false);

      setError(
        'Please enter a valid positive track ID and country ID.'
      );

      return;
    }


    // ----------------------------------------------------------
    // Load performance data
    // ----------------------------------------------------------

    try {
      setLoading(true);
      setError('');
      setHasLoaded(false);

      setStreamingHistory([]);
      setChartPerformance([]);

      const [
        streamingResult,
        chartResult
      ] = await Promise.all([
        getStreamingHistory(
          parsedTrackId,
          parsedCountryId
        ),
        getChartPerformance(
          parsedTrackId,
          parsedCountryId
        )
      ]);


      // Sort streaming history oldest to newest
      const sortedStreaming =
        [...(streamingResult.data || [])].sort(
          (a, b) =>
            new Date(a.observation_date) -
            new Date(b.observation_date)
        );


      // Sort chart history oldest to newest
      const sortedChartPerformance =
        [...(chartResult.data || [])].sort(
          (a, b) =>
            new Date(a.observation_date) -
            new Date(b.observation_date)
        );


      setStreamingHistory(
        sortedStreaming
      );

      setChartPerformance(
        sortedChartPerformance
      );

      setHasLoaded(true);
    } catch (error) {
      setStreamingHistory([]);
      setChartPerformance([]);

      setError(
        error.message ||
        'Unable to load track performance. Please try again.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Date formatter
  // ============================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'Not available';
    }

    return new Date(
      dateValue
    ).toLocaleDateString();
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      {/* Page heading */}

      <PageHeader
        title="Tracks"
        description="Explore track streaming performance and historical chart trends."
      />


      {/* ========================================================
          Performance search
      ======================================================== */}

      <ContentSection title="Track Performance Search">

        <form onSubmit={handleLoadPerformance}>

          <div>
            <label htmlFor="trackId">
              Track ID
            </label>

            <br />

            <input
              id="trackId"
              type="number"
              min="1"
              value={trackId}
              onChange={(event) =>
                setTrackId(
                  event.target.value
                )
              }
            />
          </div>

          <br />

          <div>
            <label htmlFor="countryId">
              Country ID
            </label>

            <br />

            <input
              id="countryId"
              type="number"
              min="1"
              value={countryId}
              onChange={(event) =>
                setCountryId(
                  event.target.value
                )
              }
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : 'Load Performance'}
          </button>

        </form>

      </ContentSection>


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <ContentSection title="Loading Performance">
          <p>
            Loading streaming and chart-performance data...
          </p>
        </ContentSection>
      )}


      {/* ========================================================
          Error state
      ======================================================== */}

      {!loading && error && (
        <ContentSection title="Unable to Load Performance">
          <p>
            {error}
          </p>
        </ContentSection>
      )}


      {/* ========================================================
          Historical streaming performance
      ======================================================== */}

      {hasLoaded &&
        !loading &&
        !error && (
          <ContentSection title="Historical Streaming Performance">

            {streamingHistory.length === 0 ? (
              <p>
                No streaming history was found for this track
                and country.
              </p>
            ) : (
              <>

                {/* Streaming trend chart */}

                <StreamingTrendChart
                  data={streamingHistory}
                />


                {/* Historical streaming records */}

                {streamingHistory.map(
                  (observation) => (
                    <div
                      key={observation.observation_id}
                    >
                      <h3>
                        {formatDate(
                          observation.observation_date
                        )}
                      </h3>

                      <p>
                        <strong>
                          Track:
                        </strong>{' '}
                        {observation.track_name}
                      </p>

                      <p>
                        <strong>
                          Country:
                        </strong>{' '}
                        {observation.country_name}
                      </p>

                      <p>
                        <strong>
                          Streams:
                        </strong>{' '}
                        {Number(
                          observation.streams
                        ).toLocaleString()}
                      </p>

                      <p>
                        <strong>
                          Chart Position:
                        </strong>{' '}
                        {observation.chart_position ??
                          'Not available'}
                      </p>

                      <hr />
                    </div>
                  )
                )}

              </>
            )}

          </ContentSection>
        )}


      {/* ========================================================
          Historical chart performance
      ======================================================== */}

      {hasLoaded &&
        !loading &&
        !error && (
          <ContentSection title="Historical Chart Performance">

            {chartPerformance.length === 0 ? (
              <p>
                No chart-performance history was found for this
                track and country.
              </p>
            ) : (
              <>

                {/* Chart-position trend chart */}

                <ChartPositionTrendChart
                  data={chartPerformance}
                />


                {/* Historical chart-position records */}

                {chartPerformance.map(
                  (observation) => (
                    <div
                      key={observation.observation_id}
                    >
                      <h3>
                        {formatDate(
                          observation.observation_date
                        )}
                      </h3>

                      <p>
                        <strong>
                          Track:
                        </strong>{' '}
                        {observation.track_name}
                      </p>

                      <p>
                        <strong>
                          Country:
                        </strong>{' '}
                        {observation.country_name}
                      </p>

                      <p>
                        <strong>
                          Chart Position:
                        </strong>{' '}
                        {observation.chart_position ??
                          'Not available'}
                      </p>

                      <hr />
                    </div>
                  )
                )}

              </>
            )}

          </ContentSection>
        )}

    </PageContainer>
  );
}


export default TracksPage;