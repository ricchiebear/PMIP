import { useState } from 'react';

import ContentSection from '../common/ContentSection';
import SummaryCard from '../common/SummaryCard';

import {
  getArtistMarketGrowth
} from '../../services/intelligenceService';

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
        error.message
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

    return Number(value).toLocaleString(
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
    return (
      artist.country_name ||
      artist.source_country ||
      'Unknown market'
    );
  }


  // ============================================================
  // Section
  // ============================================================

  return (
    <ContentSection title="Artist Market Growth">

      <p>
        Explore artists showing strong growth within individual
        country markets.
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


      {/* Error state */}

      {error && (
        <>
          <br />

          <p>
            {error}
          </p>
        </>
      )}


      {/* Empty state */}

      {hasLoaded &&
        !error &&
        artists.length === 0 && (
          <>
            <br />

            <p>
              No artist market-growth intelligence was found.
            </p>
          </>
        )}


      {/* Results */}

      {artists.length > 0 && (
        <>
          <br />

          {artists.map(
            (artist) => (
              <div
                key={artist.artist_market_growth_id}
              >
                <h3>
                  {getArtistLabel(artist)}
                </h3>

                <SummaryCard
                  label="Market"
                  value={
                    getCountryLabel(artist)
                  }
                />

                <SummaryCard
                  label="Market Growth Score"
                  value={
                    formatNumber(
                      artist.market_growth_score
                    )
                  }
                />

                <SummaryCard
                  label="Market Growth Class"
                  value={
                    artist.market_growth_class
                  }
                />

                <h4>
                  What does this mean?
                </h4>

                <p>
                  PMIP identified strong growth activity for this
                  artist in the {getCountryLabel(artist)} market.
                </p>

                <p>
                  The market-growth score is{' '}
                  {formatNumber(
                    artist.market_growth_score
                  )}, classified as{' '}
                  {artist.market_growth_class}.
                </p>

                <hr />
              </div>
            )
          )}
        </>
      )}

    </ContentSection>
  );
}

export default ArtistMarketGrowthSection;