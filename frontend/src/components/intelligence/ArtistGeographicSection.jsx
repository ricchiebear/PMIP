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
  // Section
  // ============================================================

  return (
    <ContentSection title="Artist Geographic Performance">

      <p>
        Explore how widely artists reach across markets and how
        diversified their international performance is.
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
              No artist geographic intelligence was found.
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
                key={artist.artist_geo_result_id}
              >
                <h3>
                  {getArtistLabel(artist)}
                </h3>

                <SummaryCard
                  label="Markets Reached"
                  value={
                    formatNumber(
                      artist.markets_reached
                    )
                  }
                />

                <SummaryCard
                  label="International Reach"
                  value={
                    artist.international_reach_class
                  }
                />

                <SummaryCard
                  label="Market Penetration"
                  value={
                    artist.market_penetration_class
                  }
                />

                <SummaryCard
                  label="Market Dependency"
                  value={
                    artist.market_dependency_class
                  }
                />

                <SummaryCard
                  label="Geographic Profile"
                  value={
                    artist.artist_geographic_profile
                  }
                />

                <SummaryCard
                  label="Diversification Index"
                  value={
                    formatNumber(
                      artist.artist_diversification_index
                    )
                  }
                />

                <SummaryCard
                  label="Geographic Findings Index"
                  value={
                    formatNumber(
                      artist.artist_findings_index
                    )
                  }
                />

                <SummaryCard
                  label="Geographic Strength"
                  value={
                    artist.artist_findings_class
                  }
                />

                <h4>
                  What does this mean?
                </h4>

                <p>
                  PMIP identifies this artist as having{' '}
                  {artist.international_reach_class} and{' '}
                  {artist.market_penetration_class.toLowerCase()}.
                </p>

                <p>
                  Their overall geographic strength is classified
                  as {artist.artist_findings_class}.
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

export default ArtistGeographicSection;