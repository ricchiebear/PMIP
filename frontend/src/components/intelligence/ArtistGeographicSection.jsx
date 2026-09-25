import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';

import {
  getArtistGeographicIntelligence
} from '../../services/intelligenceService';


function ArtistGeographicSection() {
  // ============================================================
  // Data
  // ============================================================

  const [artists, setArtists] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [hasLoaded, setHasLoaded] = useState(false);


  // ============================================================
  // Load artist geographic intelligence
  // ============================================================

  async function handleLoadArtists() {
    try {
      setLoading(true);
      setError('');
      setArtists([]);
      setHasLoaded(false);

      const result =
        await getArtistGeographicIntelligence(
          1,
          5
        );

      setArtists(
        result.data || []
      );

      setHasLoaded(true);
    } catch (error) {
      setArtists([]);

      setError(
        error.message ||
        'Unable to load artist geographic intelligence.'
      );

      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Number formatter
  // ============================================================

  function formatNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'Not available';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return 'Not available';
    }

    return number.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2
      }
    );
  }


  // ============================================================
  // Artist label
  // ============================================================

  function getArtistLabel(artist) {
    return (
      artist.artist_name ||
      artist.source_artist_label ||
      'Unknown artist'
    );
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection
      title="Artist Geographic Performance"
      eyebrow="Geographic Intelligence"
      variant="intelligence"
    >

      <p>
        See how widely an artist&apos;s performance is spread
        across different countries and whether their success
        depends heavily on only a small number of markets.
      </p>

      <br />

      <button
        type="button"
        onClick={handleLoadArtists}
        disabled={loading}
      >
        {loading
          ? 'Loading...'
          : 'Load Artist Geographic Intelligence'}
      </button>


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <p className="intelligence-state-message">
          Loading artist geographic intelligence...
        </p>
      )}


      {/* ========================================================
          Error state
      ======================================================== */}

      {!loading &&
        error && (
          <p className="intelligence-state-message intelligence-state-error">
            {error}
          </p>
        )}


      {/* ========================================================
          Empty state
      ======================================================== */}

      {hasLoaded &&
        !loading &&
        !error &&
        artists.length === 0 && (
          <p className="intelligence-state-message">
            No artist geographic intelligence was found.
          </p>
        )}


      {/* ========================================================
          Results
      ======================================================== */}

      {!loading &&
        !error &&
        artists.length > 0 && (
          <div className="geographic-results-list">

            {artists.map(
              (artist) => (
                <article
                  className="geographic-result-card"
                  key={artist.artist_geo_result_id}
                >

                  {/* ==========================================
                      Artist heading
                  ========================================== */}

                  <div className="geographic-result-header">

                    <div>
                      <p className="anomaly-result-kicker">
                        Artist Geographic Profile
                      </p>

                      <h3>
                        {getArtistLabel(artist)}
                      </h3>
                    </div>


                    <span className="geographic-classification-badge">
                      {artist.artist_findings_class ||
                        'Not available'}
                    </span>

                  </div>


                  {/* ==========================================
                      Main metrics
                  ========================================== */}

                  <div className="geographic-metric-grid">

                    <SummaryCard
                      label="Markets Reached"
                      value={
                        formatNumber(
                          artist.markets_reached
                        )
                      }
                      helperText="The number of markets where PMIP has identified performance activity for this artist."
                    />


                    <SummaryCard
                      label="International Reach"
                      value={
                        artist.international_reach_class ||
                        'Not available'
                      }
                      helperText="Shows how widely the artist's performance extends across different countries."
                    />


                    <SummaryCard
                      label="Market Penetration"
                      value={
                        artist.market_penetration_class ||
                        'Not available'
                      }
                      helperText="Shows how strongly the artist is established across the markets they have reached."
                    />


                    <SummaryCard
                      label="Market Dependency"
                      value={
                        artist.market_dependency_class ||
                        'Not available'
                      }
                      helperText="Shows whether the artist depends heavily on only a small number of markets or has a more balanced international presence."
                    />


                    <SummaryCard
                      label="Geographic Profile"
                      value={
                        artist.artist_geographic_profile ||
                        'Not available'
                      }
                      helperText="A simple description of the artist's overall geographic performance pattern."
                    />


                    <SummaryCard
                      label="Diversification Index"
                      value={
                        formatNumber(
                          artist.artist_diversification_index
                        )
                      }
                      helperText="Shows how evenly the artist's performance is spread across markets. Higher values generally indicate a more diversified international presence."
                    />


                    <SummaryCard
                      label="Geographic Strength Index"
                      value={
                        formatNumber(
                          artist.artist_findings_index
                        )
                      }
                      helperText="An overall PMIP score summarising the strength of the artist's geographic performance across markets."
                      tone="highlight"
                    />


                    <SummaryCard
                      label="Geographic Strength"
                      value={
                        artist.artist_findings_class ||
                        'Not available'
                      }
                      helperText="A simple category describing the artist's overall geographic strength."
                    />

                  </div>


                  {/* ==========================================
                      Interpretation
                  ========================================== */}

                  <div className="anomaly-interpretation">

                    <p className="intelligence-insight-kicker">
                      PMIP Interpretation
                    </p>

                    <h4>
                      What does this mean?
                    </h4>


                    <p>
                      PMIP describes{' '}

                      <strong>
                        {getArtistLabel(artist)}
                      </strong>

                      {' '}as having{' '}

                      <strong>
                        {artist.international_reach_class ||
                          'Not available'}
                      </strong>

                      {' '}international reach and{' '}

                      <strong>
                        {artist.market_penetration_class ||
                          'Not available'}
                      </strong>

                      {' '}market penetration.
                    </p>


                    <p>
                      Their Geographic Strength Index is{' '}

                      <strong>
                        {formatNumber(
                          artist.artist_findings_index
                        )}
                      </strong>

                      , placing them in the{' '}

                      <strong>
                        {artist.artist_findings_class ||
                          'Not available'}
                      </strong>

                      {' '}geographic strength category.
                    </p>


                    <p>
                      The market dependency and diversification
                      measures help show whether the artist&apos;s
                      performance is concentrated in a few markets
                      or spread more evenly across different
                      countries.
                    </p>

                  </div>

                </article>
              )
            )}

          </div>
        )}

    </ContentSection>
  );
}


export default ArtistGeographicSection;