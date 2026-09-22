import { useState } from 'react';
import { Link } from 'react-router-dom';

import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';

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

      {/* Page heading */}

      <PageHeader
        title="Artists"
        description="Search and explore artist analytics."
      />


      {/* ========================================================
          Artist search
      ======================================================== */}

      <ContentSection title="Artist Search">

        <form onSubmit={handleSubmit}>

          <label htmlFor="artist-search">
            Artist name
          </label>

          <br />

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
          />

          <br />
          <br />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Searching...'
              : 'Search'}
          </button>

        </form>


        {/* Search error */}

        {error && (
          <>
            <br />

            <p>
              {error}
            </p>
          </>
        )}

      </ContentSection>


      {/* ========================================================
          Search results
      ======================================================== */}

      <ContentSection title="Search Results">

        {/* Before first search */}

        {!hasSearched &&
          !loading &&
          !error && (
            <p>
              Search results will appear here.
            </p>
          )}


        {/* Loading state */}

        {loading && (
          <p>
            Searching for artists...
          </p>
        )}


        {/* Empty search result */}

        {hasSearched &&
          !loading &&
          !error &&
          artists.length === 0 && (
            <p>
              No artists were found for "{searchedQuery}".
            </p>
          )}


        {/* Search results */}

        {!loading &&
          !error &&
          artists.length > 0 && (
            <>
              <p>
                Found {artists.length}{' '}
                {artists.length === 1
                  ? 'artist'
                  : 'artists'}.
              </p>

              {artists.map((artist) => (
                <div
                  key={artist.artist_id}
                >
                  <h3>
                    <Link
                      to={`/artists/${artist.artist_id}`}
                    >
                      {artist.artist_name}
                    </Link>
                  </h3>

                  <p>
                    <strong>
                      Artist ID:
                    </strong>{' '}
                    {artist.artist_id}
                  </p>

                  <hr />
                </div>
              ))}
            </>
          )}

      </ContentSection>

    </PageContainer>
  );
}


export default ArtistPage;