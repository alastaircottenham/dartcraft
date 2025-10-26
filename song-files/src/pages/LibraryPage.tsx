import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongs } from '../stores/useSongs';
import { usePlaylists } from '../stores/usePlaylists';
import ImportButton from '../components/Library/ImportButton';
import SongCard from '../components/Library/SongCard';
import AddToPlaylistModal from '../components/Library/AddToPlaylistModal';
import RenameSongModal from '../components/Library/RenameSongModal';
import type { SongMeta, ImportResult } from '../types';

type SortOption = 'title' | 'artist' | 'importedAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { 
    songs, 
    isLoading, 
    searchQuery, 
    searchResults, 
    loadSongs, 
    search, 
    clearSearch,
    deleteSong,
    updateSong
  } = useSongs();
  
  const { loadPlaylists } = usePlaylists();
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [songToRename, setSongToRename] = useState<SongMeta | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadSongs();
    loadPlaylists();
  }, [loadSongs, loadPlaylists]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      search(query);
    } else {
      clearSearch();
    }
  };

  const handleSongSelect = (song: SongMeta) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedSongs(new Set([song.id]));
    } else {
      const newSelected = new Set(selectedSongs);
      if (newSelected.has(song.id)) {
        newSelected.delete(song.id);
      } else {
        newSelected.add(song.id);
      }
      setSelectedSongs(newSelected);
      
      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    }
  };

  const handleSongClick = (song: SongMeta) => {
    if (isSelectionMode) {
      handleSongSelect(song);
    } else {
      navigate(`/song/${song.id}`, { state: { returnTo: '/library' } });
    }
  };

  const handleLongPress = (song: SongMeta) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedSongs(new Set([song.id]));
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedSongs(new Set());
  };

  const handleAddToPlaylist = (song: SongMeta) => {
    setSelectedSongs(new Set([song.id]));
    setShowAddToPlaylist(true);
  };

  const handleDeleteSong = async (song: SongMeta) => {
    if (window.confirm(`Are you sure you want to delete "${song.title}"? This will remove it from all playlists and cannot be undone.`)) {
      try {
        await deleteSong(song.id);
        const newSelected = new Set(selectedSongs);
        newSelected.delete(song.id);
        setSelectedSongs(newSelected);
      } catch (error) {
        console.error('Failed to delete song:', error);
        alert('Failed to delete song. Please try again.');
      }
    }
  };

  const handleRenameSong = (song: SongMeta) => {
    setSongToRename(song);
    setShowRenameModal(true);
  };

  const handleSaveRename = async (songId: string, title: string, artist: string) => {
    try {
      await updateSong(songId, { title, artist });
      setShowRenameModal(false);
      setSongToRename(null);
    } catch (error) {
      console.error('Failed to rename song:', error);
      alert('Failed to rename song. Please try again.');
    }
  };

  const handleCloseRenameModal = () => {
    setShowRenameModal(false);
    setSongToRename(null);
  };

  const handleImportComplete = (results: ImportResult[]) => {
    setImportResults(results);
    setTimeout(() => {
      setImportResults([]);
    }, 5000);
  };

  // Sort songs based on current sort option and direction
  const sortedSongs = useMemo(() => {
    const songsToSort = searchQuery ? searchResults.map(r => r.song) : songs;
    
    return [...songsToSort].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortOption) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'artist':
          aValue = (a.artist || '').toLowerCase();
          bValue = (b.artist || '').toLowerCase();
          break;
        case 'importedAt':
          aValue = a.importedAt;
          bValue = b.importedAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [songs, searchResults, searchQuery, sortOption, sortDirection]);

  const displaySongs = sortedSongs;

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-pink-50/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        {/* Header with import button */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-ios-blue/10 dark:from-purple-500/20 dark:to-ios-blue/20 rounded-3xl blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-block relative mb-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/20 to-purple-500/20 blur-2xl rounded-full -z-10" />
                  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-ios-blue via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight pb-1">
                    Your Library
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  {songs.length} song{songs.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ImportButton 
                onImportComplete={handleImportComplete}
                className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-ios-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-ios-blue/30 hover:shadow-xl hover:shadow-ios-blue/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2" 
              />
            </div>
          </div>
        </div>

        {/* Import results */}
        {importResults.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <span className="text-xl">📥</span>
                Import Results
              </h3>
              <div className="space-y-2">
                {importResults.map((result, index) => (
                  <div key={index} className="text-sm font-medium">
                    {result.success ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {result.song?.title}
                      </span>
                    ) : result.isDuplicate ? (
                      <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Already exists: {result.existingSong?.title}
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {result.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Sort */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-lg -z-10" />
            <div className="relative">
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl w-full pl-12 pr-4 py-3 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
            </div>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="importedAt">Date Imported</option>
              <option value="updatedAt">Last Updated</option>
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
        </div>

        {/* Selection mode indicator and actions */}
        {isSelectionMode && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-ios-blue/80 dark:bg-blue-900/50 border border-blue-300/50 dark:border-blue-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">
                    Selection Mode
                  </span>
                  <span className="text-blue-100 text-sm">
                    {selectedSongs.size} selected
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowAddToPlaylist(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    disabled={selectedSongs.size === 0}
                  >
                    Add to Playlist
                  </button>
                  <button
                    onClick={exitSelectionMode}
                    className="bg-white text-ios-blue px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Songs grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading songs...</div>
          </div>
        ) : displaySongs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
              <span className="text-7xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
              {searchQuery ? 'No songs found' : 'No songs yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Import your first PDF to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {displaySongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onSelect={handleSongSelect}
                onClick={handleSongClick}
                onLongPress={handleLongPress}
                onAddToPlaylist={handleAddToPlaylist}
                onDelete={handleDeleteSong}
                onRename={handleRenameSong}
                isSelected={selectedSongs.has(song.id)}
                isSelectionMode={isSelectionMode}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showAddToPlaylist && (
          <AddToPlaylistModal
            selectedSongIds={Array.from(selectedSongs)}
            onClose={() => {
              setShowAddToPlaylist(false);
              exitSelectionMode();
            }}
          />
        )}

        <RenameSongModal
          song={songToRename}
          isOpen={showRenameModal}
          onClose={handleCloseRenameModal}
          onSave={handleSaveRename}
        />
      </div>
    </div>
  );
}
