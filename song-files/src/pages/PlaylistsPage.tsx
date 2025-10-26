import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylists } from '../stores/usePlaylists';
import { useSongs } from '../stores/useSongs';
import PlaylistList from '../components/Playlists/PlaylistList';
import type { Playlist } from '../types';

type PlaylistSortOption = 'name' | 'createdAt' | 'updatedAt' | 'songCount';
type SortDirection = 'asc' | 'desc';

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const { playlists, isLoading, loadPlaylists, createPlaylist, deletePlaylist, updatePlaylist } = usePlaylists();
  const { } = useSongs();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [sortOption, setSortOption] = useState<PlaylistSortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Sort playlists based on current sort option and direction
  const sortedPlaylists = useMemo(() => {
    return [...playlists].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortOption) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'songCount':
          aValue = a.songIds.length;
          bValue = b.songIds.length;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [playlists, sortOption, sortDirection]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    navigate(`/playlists/${playlist.id}`);
  };

  const handlePlaylistDelete = async (playlist: Playlist) => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await deletePlaylist(playlist.id);
      } catch (error) {
        console.error('Failed to delete playlist:', error);
      }
    }
  };

  const handlePlaylistRename = async (playlist: Playlist, newName: string) => {
    if (newName.trim() && newName !== playlist.name) {
      try {
        await updatePlaylist(playlist.id, { name: newName.trim() });
      } catch (error) {
        console.error('Failed to rename playlist:', error);
      }
    }
  };

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-50/30 to-pink-50/20 dark:from-ios-blue/10 dark:via-purple-900/20 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 dark:from-ios-blue/20 dark:to-purple-500/20 rounded-3xl blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-block relative mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/20 to-purple-500/20 blur-2xl rounded-full -z-10" />
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-ios-blue via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight pb-1">
                      Playlists
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                    {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl hover:shadow-ios-blue/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Playlist
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          {playlists.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
              </div>
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as PlaylistSortOption)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="name">Name</option>
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
                <option value="songCount">Number of Songs</option>
              </select>
              
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium text-black dark:text-white transition-colors"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className="text-xs">{sortDirection === 'asc' ? 'A-Z' : 'Z-A'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Create playlist form */}
        {showCreateForm && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h3 className="font-bold text-black dark:text-white mb-4 text-xl flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                Create New Playlist
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreatePlaylist();
                    if (e.key === 'Escape') {
                      setShowCreateForm(false);
                      setNewPlaylistName('');
                    }
                  }}
                  className="backdrop-blur-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl w-full px-4 py-3 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue transition-all"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="flex-1 bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName('');
                    }}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-black dark:text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Playlists list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading playlists...</div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-ios-blue/20 to-purple-500/20 mb-6">
              <span className="text-7xl">🎵</span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Create your first playlist to organize your songs
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <PlaylistList
            playlists={sortedPlaylists}
            onPlaylistSelect={handlePlaylistSelect}
            onPlaylistDelete={handlePlaylistDelete}
            onPlaylistRename={handlePlaylistRename}
          />
        )}
      </div>
    </div>
  );
}
