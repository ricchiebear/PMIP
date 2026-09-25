import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PageContainer from '../components/layout/PageContainer';

import {
  getArtistById,
  getArtistTracks
} from '../services/artistService';

import {
  getArtistMomentum,
  getArtistGrowth
} from '../services/intelligenceService';


function ArtistDetailsPage() {
  // ============================================================
  // URL
  // ============================================================

  const { artistId } = useParams();


  // ============================================================
  // Artist data
  // ============================================================

  const [artist, setArtist] = useState(null);

  const [tracks, setTracks] = useState([]);


  // ============================================================
  // Intelligence data
  // ============================================================

  const [momentum, setMomentum] = useState(null);

  const [growth, setGrowth] = useState(null);


  // ============================================================
  // Main page states
  // ============================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  // ============================================================
  // Momentum states
  // ============================================================

  const [momentumLoading, setMomentumLoading] = useState(false);

  const [momentumError, setMomentumError] = useState('');


  // ============================================================
  // Growth states
  // ============================================================

  const [growthLoading, setGrowthLoading] = useState(false);

  const [growthError, setGrowthError] = useState('');


  // ============================================================
  // Load artist profile
  // ============================================================

  useEffect(() => {
    async function loadArtistProfile() {
      setLoading(true);
      setError('');

      setArtist(null);
      setTracks([]);

      setMomentum(null);
      setMomentumError('');

      setGrowth(null);
      setGrowthError('');


      // --------------------------------------------------------
      // Load essential artist information
      // --------------------------------------------------------

      try {
        const [
          artistResult,
          tracksResult
        ] = await Promise.all([
          getArtistById(artistId),
          getArtistTracks(artistId, 1, 20)
        ]);

        setArtist(
          artistResult.data
        );

        setTracks(
          tracksResult.data?.tracks || []
        );
      } catch (error) {
        setArtist(null);
        setTracks([]);

        setError(
          error.message ||
          'Unable to load the artist profile.'
        );

        setLoading(false);

        return;
      }

      setLoading(false);


      // --------------------------------------------------------
      // Load momentum intelligence
      // --------------------------------------------------------

      async function loadMomentum() {
        try {
          setMomentumLoading(true);
          setMomentumError('');

          const result =
            await getArtistMomentum(artistId);

          setMomentum(
            result.data || null
          );
        } catch (error) {
          setMomentum(null);

          setMomentumError(
            error.message ||
            'Momentum intelligence could not be loaded.'
          );
        } finally {
          setMomentumLoading(false);
        }
      }


      // --------------------------------------------------------
      // Load growth intelligence
      // --------------------------------------------------------

      async function loadGrowth() {
        try {
          setGrowthLoading(true);
          setGrowthError('');

          const result =
            await getArtistGrowth(artistId);

          setGrowth(
            result.data || null
          );
        } catch (error) {
          setGrowth(null);

          setGrowthError(
            error.message ||
            'Growth intelligence could not be loaded.'
          );
        } finally {
          setGrowthLoading(false);
        }
      }


      await Promise.all([
        loadMomentum(),
        loadGrowth()
      ]);
    }

    loadArtistProfile();
  }, [artistId]);


  // ============================================================
  // Main loading state
  // ============================================================

  if (loading) {
    return (
      <PageContainer>
        <div className="artist-profile-state">
          <div
            className="artist-loading-spinner"
            aria-hidden="true"
          />

          <h2>
            Loading Artist Profile
          </h2>

          <p>
            PMIP is retrieving the artist information and
            available performance intelligence.
          </p>
        </div>
      </PageContainer>
    );
  }


  // ============================================================
  // Main error state
  // ============================================================

  if (error) {
    return (
      <PageContainer>
        <div className="artist-profile-state artist-profile-error">
          <h2>
            Unable to Load Artist
          </h2>

          <p>
            {error}
          </p>
        </div>
      </PageContainer>
    );
  }


  // ============================================================
  // Artist profile
  // ============================================================

  return (
    <PageContainer>

      {artist && (
        <>

          {/* ====================================================
              Artist hero
          ==================================================== */}

          <section className="artist-profile-hero">

            <div
              className="artist-profile-avatar"
              aria-hidden="true"
            >
              {artist.artist_name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || 'A'}
            </div>

            <div className="artist-profile-hero-content">
              <p className="artist-profile-kicker">
                Artist Profile
              </p>

              <h1>
                {artist.artist_name}
              </h1>

              <p className="artist-profile-description">
                Explore performance, momentum, growth and
                associated track information for this artist.
              </p>

              <div className="artist-profile-meta">
                <span>
                  PMIP Artist ID
                </span>

                <strong>
                  {artist.artist_id}
                </strong>
              </div>
            </div>

          </section>


          {/* ====================================================
              Performance overview
          ==================================================== */}

          <section className="artist-profile-section">

            <div className="artist-profile-section-heading">
              <div>
                <p className="artist-profile-kicker">
                  Overview
                </p>

                <h2>
                  Performance Summary
                </h2>
              </div>

              <p>
                Key artist-level metrics currently available
                through PMIP.
              </p>
            </div>


            <div className="artist-profile-metrics">

              <article className="artist-profile-metric-card">
                <p>
                  Associated Tracks
                </p>

                <strong>
                  {tracks.length}
                </strong>
              </article>


              <article className="artist-profile-metric-card">
                <p>
                  Momentum Score
                </p>

                <strong>
                  {momentumLoading
                    ? 'Loading...'
                    : momentum?.final_momentum_score ??
                      'Not available'}
                </strong>
              </article>


              <article className="artist-profile-metric-card">
                <p>
                  Growth Score
                </p>

                <strong>
                  {growthLoading
                    ? 'Loading...'
                    : growth?.pmip_growth_score ??
                      'Not available'}
                </strong>
              </article>

            </div>

          </section>


          {/* ====================================================
              Intelligence
          ==================================================== */}

          <section className="artist-profile-section">

            <div className="artist-profile-section-heading">
              <div>
                <p className="artist-profile-kicker">
                  Intelligence
                </p>

                <h2>
                  Artist Intelligence
                </h2>
              </div>

              <p>
                PMIP combines analytical outputs to provide a
                clearer view of artist momentum and growth.
              </p>
            </div>


            <div className="artist-intelligence-grid">

              {/* Momentum intelligence */}

              <article className="artist-intelligence-card">
                <span className="artist-intelligence-badge">
                  Momentum
                </span>

                <h3>
                  Momentum Intelligence
                </h3>

                {momentumLoading && (
                  <p>
                    Loading momentum intelligence...
                  </p>
                )}

                {!momentumLoading &&
                  momentum && (
                    <div className="artist-intelligence-values">

                      <div>
                        <span>
                          Momentum Score
                        </span>

                        <strong>
                          {momentum.final_momentum_score}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Momentum Category
                        </span>

                        <strong>
                          {momentum.momentum_category}
                        </strong>
                      </div>

                      {momentum.shared_score_rank !==
                        undefined && (
                        <div>
                          <span>
                            Momentum Rank
                          </span>

                          <strong>
                            {momentum.shared_score_rank}
                          </strong>
                        </div>
                      )}

                    </div>
                  )}

                {!momentumLoading &&
                  !momentum && (
                    <div className="artist-intelligence-empty">
                      <p>
                        Momentum intelligence is currently
                        unavailable for this artist.
                      </p>

                      {momentumError && (
                        <small>
                          {momentumError}
                        </small>
                      )}
                    </div>
                  )}

              </article>


              {/* Growth intelligence */}

              <article className="artist-intelligence-card">
                <span className="artist-intelligence-badge">
                  Growth
                </span>

                <h3>
                  Growth Intelligence
                </h3>

                {growthLoading && (
                  <p>
                    Loading growth intelligence...
                  </p>
                )}

                {!growthLoading &&
                  growth && (
                    <div className="artist-intelligence-values">

                      <div>
                        <span>
                          Growth Score
                        </span>

                        <strong>
                          {growth.pmip_growth_score ??
                            'Not available'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Growth Class
                        </span>

                        <strong>
                          {growth.pmip_growth_class ??
                            'Not available'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Growth Rank
                        </span>

                        <strong>
                          {growth.pmip_growth_rank ??
                            'Not available'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Growth Priority
                        </span>

                        <strong>
                          {growth.pmip_priority_class ??
                            'Not available'}
                        </strong>
                      </div>

                    </div>
                  )}

                {!growthLoading &&
                  !growth && (
                    <div className="artist-intelligence-empty">
                      <p>
                        Growth intelligence is currently
                        unavailable for this artist.
                      </p>

                      {growthError && (
                        <small>
                          {growthError}
                        </small>
                      )}
                    </div>
                  )}

              </article>

            </div>

          </section>


          {/* ====================================================
              Associated tracks
          ==================================================== */}

          <section className="artist-profile-section">

            <div className="artist-profile-section-heading">
              <div>
                <p className="artist-profile-kicker">
                  Catalogue
                </p>

                <h2>
                  Associated Tracks
                </h2>
              </div>

              <p>
                Tracks currently connected to this artist in PMIP.
              </p>
            </div>


            {tracks.length === 0 ? (
              <div className="artist-profile-state">
                <h3>
                  No Tracks Found
                </h3>

                <p>
                  No associated tracks were found for this artist.
                </p>
              </div>
            ) : (
              <div className="artist-track-grid">

                {tracks.map((track) => (
                  <article
                    key={track.track_id}
                    className="artist-track-card"
                  >
                    <span
                      className="artist-track-icon"
                      aria-hidden="true"
                    >
                      ♫
                    </span>

                    <div>
                      <p className="artist-track-label">
                        Track
                      </p>

                      <h3>
                        {track.track_name}
                      </h3>

                      <span className="artist-track-id">
                        PMIP Track ID {track.track_id}
                      </span>
                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>

        </>
      )}

    </PageContainer>
  );
}


export default ArtistDetailsPage;