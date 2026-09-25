import { useState } from 'react';
import { Link } from 'react-router-dom';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';

import {
  searchArtists
} from '../services/artistService';


function ArtistPage() {
  // ============================================================
  // Search data
  // ============================================================

  const [query, setQuery] = useState('');

  const [searchedQuery, setSearchedQuery] = useState('');

  const [artists, setArtists] = useState([]);


  // ============================================================
  // Page states
  // ============================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [hasSearched, setHasSearched] = useState(false);


  // ============================================================
  // Handle artist search
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();


    // Empty search
    if (!trimmedQuery) {
      setArtists([]);
      setError(
        'Please enter an artist name.'
      );
      setHasSearched(false);
      setSearchedQuery('');

      return;
    }


    // Search
    try {
      setLoading(true);
      setError('');
      setArtists([]);
      setHasSearched(true);
      setSearchedQuery(trimmedQuery);

      const result =
        await searchArtists(
          trimmedQuery,
          20
        );

      setArtists(
        result.data || []
      );
    } catch (error) {
      setArtists([]);

      setError(
        error.message ||
        'Unable to search for artists. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // Page
  // ============================================================

  return (
    <PageContainer>

      {/* ========================================================
          Page header
      ======================================================== */}

      <PageHeader
        title="Artists"
        description="Search artists and explore their profiles, performance and PMIP intelligence."
      />


      {/* ========================================================
          Artist search panel
      ======================================================== */}

      <section className="artist-search-panel">

        <div className="artist-search-copy">
          <p className="artist-search-kicker">
            Artist Discovery
          </p>

          <h2>
            Find an Artist
          </h2>

          <p>
            Search by artist name to open a profile and explore
            available momentum, growth and performance intelligence.
          </p>
        </div>


        <form
          className="artist-search-form"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="artist-search"
            className="artist-search-label"
          >
            Artist name
          </label>

          <div className="artist-search-controls">

            <input
              id="artist-search"
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search for an artist..."
              className={
                error && !query.trim()
                  ? 'artist-search-input artist-search-input-error'
                  : 'artist-search-input'
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="artist-search-button"
            >
              {loading
                ? 'Searching...'
                : 'Search Artists'}
            </button>

          </div>


          {/* Validation / API error */}

          {error && (
            <p className="artist-search-error">
              {error}
            </p>
          )}

        </form>

      </section>


      {/* ========================================================
          Search results
      ======================================================== */}

      <section className="artist-results-section">

        <div className="artist-results-heading">
          <div>
            <p className="artist-search-kicker">
              Results
            </p>

            <h2>
              Search Results
            </h2>
          </div>

          {!loading &&
            !error &&
            artists.length > 0 && (
              <p className="artist-results-count">
                {artists.length}{' '}
                {artists.length === 1
                  ? 'artist found'
                  : 'artists found'}
              </p>
            )}
        </div>


        {/* Before first search */}

        {!hasSearched &&
          !loading &&
          !error && (
            <div className="artist-state-card">
              <span
                className="artist-state-icon"
                aria-hidden="true"
              >
                ◉
              </span>

              <h3>
                Start with an Artist Name
              </h3>

              <p>
                Search results will appear here after you enter an
                artist name.
              </p>
            </div>
          )}


        {/* Loading state */}

        {loading && (
          <div className="artist-state-card">
            <div
              className="artist-loading-spinner"
              aria-hidden="true"
            />

            <h3>
              Searching PMIP
            </h3>

            <p>
              Looking for artists matching "{searchedQuery}".
            </p>
          </div>
        )}


        {/* Empty state */}

        {hasSearched &&
          !loading &&
          !error &&
          artists.length === 0 && (
            <div className="artist-state-card">
              <span
                className="artist-state-icon"
                aria-hidden="true"
              >
                ◌
              </span>

              <h3>
                No Artists Found
              </h3>

              <p>
                No artists were found for "{searchedQuery}".
                Try another spelling or a different artist name.
              </p>
            </div>
          )}


        {/* Search results */}

        {!loading &&
          !error &&
          artists.length > 0 && (
            <div className="artist-results-grid">

              {artists.map((artist) => (
                <article
                  key={artist.artist_id}
                  className="artist-result-card"
                >
                  <div className="artist-result-card-top">

                    <div
                      className="artist-result-avatar"
                      aria-hidden="true"
                    >
                      {artist.artist_name
                        ?.trim()
                        ?.charAt(0)
                        ?.toUpperCase() || 'A'}
                    </div>

                    <div>
                      <p className="artist-result-type">
                        Artist
                      </p>

                      <h3>
                        {artist.artist_name}
                      </h3>
                    </div>

                  </div>


                  <div className="artist-result-meta">
                    <span>
                      PMIP Artist ID
                    </span>

                    <strong>
                      {artist.artist_id}
                    </strong>
                  </div>


                  <Link
                    to={`/artists/${artist.artist_id}`}
                    className="artist-result-action"
                  >
                    View Artist Profile →
                  </Link>
                </article>
              ))}

            </div>
          )}

      </section>

    </PageContainer>
  );
}


export default ArtistPage;