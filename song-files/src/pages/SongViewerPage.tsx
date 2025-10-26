import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSongs } from '../stores/useSongs';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import type { SongMeta } from '../types';

export default function SongViewerPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { songs } = useSongs();
  const [song, setSong] = useState<SongMeta | null>(null);
  
  // Get the return path from location state, default to library
  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/library';

  useEffect(() => {
    if (songId) {
      const foundSong = songs.find(s => s.id === songId);
      if (foundSong) {
        setSong(foundSong);
      } else {
        // Song not found, redirect back to the return path
        navigate(returnTo);
      }
    }
  }, [songId, songs, navigate, returnTo]);

  if (!song) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen fixed inset-0 bg-black overflow-hidden z-50">
      {/* PDF Viewer */}
      <div className="absolute inset-0">
        <PdfViewer 
          key={song.id}
          song={song} 
          playlistId="single-song-viewer"
          isPerformanceMode={true}
          onClose={() => navigate(returnTo)}
        />
      </div>

      {/* Floating UI Controls */}
      {/* Top-left: Simple back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(returnTo)}
          className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white hover:bg-white/10 transition-colors"
          title={`Back to ${returnTo === '/' ? 'Home' : 'Library'}`}
        >
          <span className="text-lg">←</span>
        </button>
      </div>
    </div>
  );
}
