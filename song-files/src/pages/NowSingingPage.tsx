import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylists } from '../stores/usePlaylists';
import { useSongs } from '../stores/useSongs';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import type { SongMeta } from '../types';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

export default function NowSingingPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { getPlaylist, loadPlaylists, isLoading: playlistsLoading } = usePlaylists();
  const { songs, loadSongs } = useSongs();
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playlistSongs, setPlaylistSongs] = useState<SongMeta[]>([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const playlist = playlistId ? getPlaylist(playlistId) : null;

  useEffect(() => {
    // Load playlists and songs on mount
    loadPlaylists();
    loadSongs();
  }, [loadPlaylists, loadSongs]);

  useEffect(() => {
    if (playlist) {
      const playlistSongList = playlist.songIds
        .map(songId => songs.find(song => song.id === songId))
        .filter((song): song is SongMeta => song !== undefined);
      setPlaylistSongs(playlistSongList);
    }
  }, [playlist, songs]);

  useEffect(() => {
    // Keep screen awake during performance
    if (Capacitor.isNativePlatform()) {
      KeepAwake.keepAwake();
      
      return () => {
        KeepAwake.allowSleep();
      };
    }
  }, []);

  const handleSongChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    } else if (direction === 'next' && currentSongIndex < playlistSongs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handleClose = () => {
    navigate(`/playlists/${playlistId}`);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleSongChange('next');
    } else {
      handleSongChange('prev');
    }
  };

  // Show loading state while playlists are being loaded
  if (playlistsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading playlist...
          </h3>
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Playlist not found
          </h3>
          <button
            onClick={() => navigate('/playlists')}
            className="ios-button"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  if (playlistSongs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            No songs in playlist
          </h3>
          <p className="text-ios-gray dark:text-gray-400 mb-4">
            Add songs to this playlist to start singing
          </p>
          <button
            onClick={() => navigate(`/playlists/${playlistId}`)}
            className="ios-button"
          >
            Back to Playlist
          </button>
        </div>
      </div>
    );
  }

  const currentSong = playlistSongs[currentSongIndex];

  return (
    <div className="h-screen w-screen fixed inset-0 bg-black overflow-hidden z-50">
      {/* PDF Viewer - Full Screen */}
      <div className="absolute inset-0">
        <PdfViewer
          key={currentSong.id}
          song={currentSong}
          playlistId={playlistId!}
          isPerformanceMode={true}
          onSongChange={handleSongChange}
          onClose={handleClose}
        />
        
        {/* Swipe areas for song navigation */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div 
            className="w-1/3 cursor-pointer pointer-events-auto"
            onClick={() => handleSwipe('right')}
            title="Previous song"
          />
          <div className="w-1/3" />
          <div 
            className="w-1/3 cursor-pointer pointer-events-auto"
            onClick={() => handleSwipe('left')}
            title="Next song"
          />
        </div>
      </div>

      {/* Simple back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleClose}
          className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white hover:bg-white/10 transition-colors"
          title="Back to Playlist"
        >
          <span className="text-lg">←</span>
        </button>
      </div>

      {/* Collapsible Playlist Sidebar - Right Side */}
      <div className="fixed top-4 right-4 z-50 flex items-start">
        {/* Playlist Content - Opens to the left of button */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden mr-2 ${
          isPlaylistOpen 
            ? 'max-h-80 opacity-100 translate-x-0' 
            : 'max-h-0 opacity-0 translate-x-4'
        }`}>
          <div className="bg-black/90 backdrop-blur-sm text-white rounded-lg p-3 w-48 shadow-lg">
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <span className="text-lg">🎵</span>
              Playlist
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {playlistSongs.map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => {
                    setCurrentSongIndex(index);
                    setIsPlaylistOpen(false); // Auto-close after selection
                  }}
                  className={`w-full text-left p-1.5 rounded text-xs transition-all duration-200 ${
                    index === currentSongIndex 
                      ? 'bg-ios-blue text-white shadow-md' 
                      : 'hover:bg-gray-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-60">#{index + 1}</span>
                    <span className="truncate">{song.title}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400 text-center">
              {currentSongIndex + 1} of {playlistSongs.length}
            </div>
          </div>
        </div>

         {/* Toggle Button - On the right side */}
         <button
           onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
           className={`backdrop-blur-sm rounded-lg p-3 transition-all duration-300 shadow-lg ${
             isPlaylistOpen 
               ? 'bg-ios-blue text-white hover:bg-blue-600 active:bg-blue-700' 
               : 'bg-black/90 text-white hover:bg-gray-800 active:bg-gray-700'
           }`}
           title={isPlaylistOpen ? "Hide Playlist" : "Show Playlist"}
         >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isPlaylistOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
