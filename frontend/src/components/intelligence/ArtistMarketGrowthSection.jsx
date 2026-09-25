import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';

import {
  getArtistMarketGrowth
} from '../../services/intelligenceService';

import {
  getCountryName
} from '../../utils/countryNames';


function ArtistMarketGrowthSection() {
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
  // Load artist market-growth intelligence
  // ============================================================

  async function handleLoadArtistMarketGrowth() {
    try {
      setLoading(true);
      setError('');
      setArtists([]);
      setHasLoaded(false);

      const result =
        await getArtistMarketGrowth(
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
        'Unable to load artist market-growth intelligence.'
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
  // Country label
  // ============================================================

  function getCountryLabel(artist) {
    return getCountryName(
      artist.country_name ||
      artist.source_country,
      artist.country_code ||
      artist.source_country
    );
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection
      title="Artist Market Growth"
      eyebrow="Market-Growth Intelligence"
      variant="intelligence"
    >

      <p>
        See which artists are showing stronger growth within
        individual country markets. This helps highlight where
        an artist&apos;s performance may be gaining momentum.
      </p>

      <br />

      <button
        type="button"
        onClick={handleLoadArtistMarketGrowth}
        disabled={loading}
      >
        {loading
          ? 'Loading...'
          : 'Load Artist Market Growth'}
      </button>


      {/* ========================================================
          Loading state
      ======================================================== */}

      {loading && (
        <p className="intelligence-state-message">
          Loading artist market-growth intelligence...
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
            No artist market-growth intelligence was found.
          </p>
        )}


      {/* ========================================================
          Results
      ======================================================== */}

      {!loading &&
        !error &&
        artists.length > 0 && (
          <div className="artist-market-growth-results-list">

            {artists.map(
              (artist) => (
                <article
                  className="artist-market-growth-result-card"
                  key={artist.artist_market_growth_id}
                >

                  {/* ==========================================
                      Artist heading
                  ========================================== */}

                  <div className="artist-market-growth-header">

                    <div>
                      <p className="anomaly-result-kicker">
                        Artist Market Profile
                      </p>

                      <h3>
                        {getArtistLabel(artist)}
                      </h3>

                      <p className="artist-market-growth-market">
                        {getCountryLabel(artist)}
                      </p>
                    </div>


                    <span className="market-growth-classification-badge">
                      {artist.market_growth_class ||
                        'Not available'}
                    </span>

                  </div>


                  {/* ==========================================
                      Main metrics
                  ========================================== */}

                  <div className="artist-market-growth-metric-grid">

                    <SummaryCard
                      label="Market"
                      value={
                        getCountryLabel(artist)
                      }
                      helperText="The country market where this artist's growth is being measured."
                    />


                    <SummaryCard
                      label="Market Growth Score"
                      value={
                        formatNumber(
                          artist.market_growth_score
                        )
                      }
                      helperText="An overall PMIP score showing the strength of this artist's growth within the selected market. Higher values indicate stronger growth."
                      tone="highlight"
                    />


                    <SummaryCard
                      label="Market Growth Class"
                      value={
                        artist.market_growth_class ||
                        'Not available'
                      }
                      helperText="A simple category that describes the strength of the artist's growth within this market."
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
                      PMIP has identified growth activity for{' '}

                      <strong>
                        {getArtistLabel(artist)}
                      </strong>

                      {' '}in{' '}

                      <strong>
                        {getCountryLabel(artist)}
                      </strong>

                      .
                    </p>


                    <p>
                      The artist&apos;s Market Growth Score is{' '}

                      <strong>
                        {formatNumber(
                          artist.market_growth_score
                        )}
                      </strong>

                      . PMIP places this result in the{' '}

                      <strong>
                        {artist.market_growth_class ||
                          'Not available'}
                      </strong>

                      {' '}growth category.
                    </p>


                    <p>
                      This gives a simple view of how strongly the
                      artist&apos;s performance appears to be growing
                      within this specific market.
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


export default ArtistMarketGrowthSection;