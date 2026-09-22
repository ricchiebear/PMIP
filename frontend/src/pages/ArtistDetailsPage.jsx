import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';
import SummaryCard from '../components/common/SummaryCard';

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
      // Reset page
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

      // Essential profile is now ready
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


      // Load optional intelligence together
      await Promise.all([
        loadMomentum(),
        loadGrowth()
      ]);
    }

    loadArtistProfile();
  }, [artistId]);


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      {/* ========================================================
          Main loading state
      ======================================================== */}

      {loading && (
        <p>
          Loading artist profile...
        </p>
      )}


      {/* ========================================================
          Main API/error state
      ======================================================== */}

      {!loading && error && (
        <ContentSection title="Unable to Load Artist">
          <p>
            {error}
          </p>
        </ContentSection>
      )}


      {/* ========================================================
          Artist profile
      ======================================================== */}

      {!loading &&
        !error &&
        artist && (
          <>

            {/* Artist heading */}

            <PageHeader
              title={artist.artist_name}
              description="Artist profile and performance overview."
            />


            {/* Artist information */}

            <ContentSection title="Artist Information">
              <p>
                <strong>
                  Artist ID:
                </strong>{' '}
                {artist.artist_id}
              </p>
            </ContentSection>


            {/* Performance summary */}

            <ContentSection title="Performance Summary">

              {/* Track count */}

              <SummaryCard
                label="Total Associated Tracks"
                value={tracks.length}
              />


              {/* ==================================================
                  Momentum intelligence
              ================================================== */}

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
                  <>
                    <SummaryCard
                      label="Momentum Score"
                      value={
                        momentum.final_momentum_score
                      }
                    />

                    <SummaryCard
                      label="Momentum Category"
                      value={
                        momentum.momentum_category
                      }
                    />
                  </>
                )}

              {!momentumLoading &&
                !momentum &&
                momentumError && (
                  <p>
                    Momentum intelligence is unavailable.{' '}
                    {momentumError}
                  </p>
                )}

              {!momentumLoading &&
                !momentum &&
                !momentumError && (
                  <p>
                    Momentum intelligence is not available
                    for this artist.
                  </p>
                )}


              {/* ==================================================
                  Growth intelligence
              ================================================== */}

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
                  <>
                    <SummaryCard
                      label="Growth Score"
                      value={
                        growth.pmip_growth_score ??
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Growth Class"
                      value={
                        growth.pmip_growth_class ??
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Growth Rank"
                      value={
                        growth.pmip_growth_rank ??
                        'Not available'
                      }
                    />

                    <SummaryCard
                      label="Growth Priority"
                      value={
                        growth.pmip_priority_class ??
                        'Not available'
                      }
                    />
                  </>
                )}

              {!growthLoading &&
                !growth &&
                growthError && (
                  <p>
                    Growth intelligence is unavailable.{' '}
                    {growthError}
                  </p>
                )}

              {!growthLoading &&
                !growth &&
                !growthError && (
                  <p>
                    Growth intelligence is not available
                    for this artist.
                  </p>
                )}

            </ContentSection>


            {/* Associated tracks */}

            <ContentSection title="Associated Tracks">

              {tracks.length === 0 ? (
                <p>
                  No associated tracks were found for this artist.
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

                    <hr />
                  </div>
                ))
              )}

            </ContentSection>

          </>
        )}

    </PageContainer>
  );
}


export default ArtistDetailsPage;