import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylists } from '../stores/usePlaylists';
import { useSongs } from '../stores/useSongs';
import PlaylistSorter from '../components/Playlists/PlaylistSorter';
import type { SongMeta } from '../types';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { getPlaylist, removeSongFromPlaylist, reorderSongs, addSongToPlaylist, loadPlaylists } = usePlaylists();
  const { songs, loadSongs } = useSongs();
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  const playlist = playlistId ? getPlaylist(playlistId) : null;
  const playlistSongs = playlist ? 
    playlist.songIds
      .map(songId => songs.find(song => song.id === songId))
      .filter((song): song is SongMeta => song !== undefined) : [];

  useEffect(() => {
    loadSongs();
    loadPlaylists();
  }, [loadSongs, loadPlaylists]);

  if (!playlist) {
    return (
      <div className="relative min-h-full p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-orange-50/20 to-pink-50/30 dark:from-red-900/10 dark:via-orange-900/10 dark:to-pink-900/10 pointer-events-none" />
        <div className="relative text-center py-12">
          <div className="inline-block p-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-6">
            <span className="text-7xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
            Playlist not found
          </h3>
          <button
            onClick={() => navigate('/playlists')}
            className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mt-4"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSongFromPlaylist(playlist.id, songId);
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
    }
  };

  const handleReorderSongs = async (songIds: string[]) => {
    try {
      await reorderSongs(playlist.id, songIds);
    } catch (error) {
      console.error('Failed to reorder songs:', error);
    }
  };

  const handleSongSelect = (song: SongMeta) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(song.id)) {
      newSelected.delete(song.id);
    } else {
      newSelected.add(song.id);
    }
    setSelectedSongs(newSelected);
  };

  const handleAddSelectedSongs = async () => {
    if (!playlist) return;
    
    try {
      for (const songId of selectedSongs) {
        await addSongToPlaylist(playlist.id, songId);
      }
      setShowAddSongs(false);
      setSelectedSongs(new Set());
    } catch (error) {
      console.error('Failed to add songs to playlist:', error);
    }
  };

  const availableSongs = songs.filter(song => !playlist.songIds.includes(song.id));

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-50/30 to-pink-50/20 dark:from-ios-blue/10 dark:via-purple-900/20 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/playlists')}
              className="text-ios-blue hover:text-blue-600 font-semibold flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Playlists
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-black dark:text-white">
                {playlist.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                {playlistSongs.length} song{playlistSongs.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowAddSongs(true)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Songs
              </button>
              <button
                onClick={() => navigate(`/now-singing/${playlist.id}`)}
                className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl hover:shadow-ios-blue/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Singing
              </button>
            </div>
          </div>
        </div>

        {/* Songs list */}
        {playlistSongs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-ios-blue/20 to-purple-500/20 mb-6">
              <span className="text-7xl">🎵</span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
              No songs in this playlist
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Add songs from your library to get started
            </p>
            <button
              onClick={() => setShowAddSongs(true)}
              className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Add Songs
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                Songs in Playlist
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag to reorder songs in your playlist
              </p>
              <PlaylistSorter
                songs={playlistSongs}
                onReorder={handleReorderSongs}
                onRemoveSong={handleRemoveSong}
              />
            </div>
          </div>
        )}

        {/* Add songs modal */}
        {showAddSongs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                  <span className="text-2xl">➕</span>
                  Add Songs to Playlist
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {availableSongs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                      <span className="text-5xl">📚</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      All songs are already in this playlist
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSongs.map((song) => (
                      <div
                        key={song.id}
                        className={`
                          group relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl border cursor-pointer transition-all duration-300
                          ${selectedSongs.has(song.id) 
                            ? 'border-ios-blue ring-2 ring-ios-blue/50 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md'
                          }
                        `}
                        onClick={() => handleSongSelect(song)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-black dark:text-white truncate">
                              {song.title}
                            </h4>
                            {song.artist && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {song.artist}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            {selectedSongs.has(song.id) ? (
                              <span className="text-ios-blue text-2xl">✓</span>
                            ) : (
                              <span className="text-gray-400 text-2xl">○</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddSongs(false);
                    setSelectedSongs(new Set());
                  }}
                  className="bg-gray-100 dark:bg-gray-700 text-black dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedSongs}
                  disabled={selectedSongs.size === 0}
                  className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add {selectedSongs.size} Song{selectedSongs.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
