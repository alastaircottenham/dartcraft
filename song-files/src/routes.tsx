import { createBrowserRouter } from 'react-router-dom';
import AppShell from './layout/AppShell';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import NowSingingPage from './pages/NowSingingPage';
import SongViewerPage from './pages/SongViewerPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'library',
        element: <LibraryPage />,
      },
      {
        path: 'playlists',
        element: <PlaylistsPage />,
      },
      {
        path: 'playlists/:playlistId',
        element: <PlaylistDetailPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  // Full-screen routes that break out of AppShell
  {
    path: 'now-singing/:playlistId',
    element: <NowSingingPage />,
  },
  {
    path: 'song/:songId',
    element: <SongViewerPage />,
  },
]);

