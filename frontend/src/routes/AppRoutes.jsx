import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import ArtistPage from '../pages/ArtistPage';
import ArtistDetailsPage from '../pages/ArtistDetailsPage';
import TracksPage from '../pages/TracksPage';
import ReleasePage from '../pages/ReleasePage';
import CountriesPage from '../pages/CountriesPage';
import IntelligencePage from '../pages/IntelligencePage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Main dashboard pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/artists" element={<ArtistPage />} />

      {/* Individual artist profile */}
      <Route
        path="/artists/:artistId"
        element={<ArtistDetailsPage />}
      />

      <Route path="/tracks" element={<TracksPage />} />
      <Route path="/releases" element={<ReleasePage />} />
      <Route path="/countries" element={<CountriesPage />} />
      <Route path="/intelligence" element={<IntelligencePage />} />

      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;