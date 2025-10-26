import { useState, useEffect } from 'react';
import type { SongMeta } from '../../types';

interface RenameSongModalProps {
  song: SongMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (songId: string, title: string, artist: string) => void;
}

export default function RenameSongModal({ 
  song, 
  isOpen, 
  onClose, 
  onSave 
}: RenameSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist || '');
    }
  }, [song]);

  const handleSave = () => {
    if (song && title.trim()) {
      onSave(song.id, title.trim(), artist.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !song) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-ios-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          Rename Song
        </h3>
        <p className="text-sm text-ios-gray dark:text-gray-400 mb-4">
          Edit the song title and artist information.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Song Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ios-input w-full"
              placeholder="Enter song title"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Artist
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="ios-input w-full"
              placeholder="Enter artist name (optional)"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 ios-button-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 ios-button disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
