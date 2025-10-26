import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongs } from '../stores/useSongs';
import { usePlaylists } from '../stores/usePlaylists';
import ImportButton from '../components/Library/ImportButton';

export default function HomePage() {
  const navigate = useNavigate();
  const { songs, loadSongs } = useSongs();
  const { playlists, loadPlaylists } = usePlaylists();

  useEffect(() => {
    loadSongs();
    loadPlaylists();
  }, [loadSongs, loadPlaylists]);

  // Get recent playlists (last 3 created)
  const recentPlaylists = playlists
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  // Get recent songs (last 3 added)
  const recentSongs = songs
    .sort((a, b) => b.importedAt - a.importedAt)
    .slice(0, 3);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-50/30 to-pink-50/20 dark:from-ios-blue/10 dark:via-purple-900/20 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative space-y-8">
        {/* Welcome Header with Modern Design */}
        <div className="text-center space-y-4 py-8 px-4">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/20 to-purple-500/20 blur-3xl rounded-full -z-10" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-ios-blue via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Welcome to Song Files
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Your personal music library and playlist manager
          </p>
        </div>

        {/* Quick Actions with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 dark:from-ios-blue/20 dark:to-purple-500/20 rounded-3xl blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  navigate('/playlists');
                  window.scrollTo(0, 0);
                }}
                className="group relative overflow-hidden bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl hover:shadow-ios-blue/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span>Manage Playlists</span>
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <ImportButton className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Playlists */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 to-purple-500/5 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🎵</span>
                  Recent Playlists
                </h2>
                <button
                  onClick={() => {
                    navigate('/playlists');
                    window.scrollTo(0, 0);
                  }}
                  className="text-ios-blue hover:text-blue-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-ios-blue/10 transition-all"
                >
                  View All →
                </button>
              </div>
              
              {recentPlaylists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-br from-ios-blue/20 to-purple-500/20 mb-4">
                    <span className="text-5xl">🎵</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No playlists yet</p>
                  <button
                    onClick={() => {
                      navigate('/playlists');
                      window.scrollTo(0, 0);
                    }}
                    className="bg-gradient-to-r from-ios-blue to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl hover:shadow-ios-blue/40 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Create Your First Playlist
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPlaylists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      onClick={() => navigate(`/playlists/${playlist.id}`)}
                      className="group/item relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-ios-blue dark:hover:border-ios-blue cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-black dark:text-white">
                              {playlist.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-ios-blue/10 text-ios-blue text-xs font-semibold rounded-full">
                              {playlist.songIds.length} song{playlist.songIds.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(playlist.createdAt)}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover/item:text-ios-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Songs */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Recent Songs
                </h2>
                <button
                  onClick={() => {
                    navigate('/library');
                    window.scrollTo(0, 0);
                  }}
                  className="text-ios-blue hover:text-blue-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-ios-blue/10 transition-all"
                >
                  View All →
                </button>
              </div>
              
              {recentSongs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                    <span className="text-5xl">📚</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No songs yet</p>
                  <ImportButton />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSongs.map((song, index) => (
                    <div
                      key={song.id}
                      onClick={() => navigate(`/song/${song.id}`, { state: { returnTo: '/' } })}
                      className="group/item relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black dark:text-white truncate mb-1">
                            {song.title}
                          </h3>
                          {song.artist && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                              {song.artist}
                            </p>
                          )}
                          {song.pageCount && (
                            <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                              {song.pageCount} page{song.pageCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {formatDate(song.importedAt)}
                          </p>
                          <svg className="w-5 h-5 text-gray-400 group-hover/item:text-purple-500 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started - Enhanced CTA */}
        {songs.length === 0 && playlists.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue via-purple-600 to-pink-600 animate-pulse" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative p-12 text-center text-white">
              <div className="inline-block p-6 rounded-full bg-white/20 backdrop-blur-xl mb-6">
                <span className="text-7xl">🎵</span>
              </div>
              <h2 className="text-4xl font-extrabold mb-4">Get Started with Song Files</h2>
              <p className="mb-8 text-lg opacity-95 max-w-2xl mx-auto">
                Import your first PDF song or create a playlist to begin organizing your music library.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ImportButton />
                <button
                  onClick={() => {
                    navigate('/playlists');
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white text-ios-blue px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Create Playlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
