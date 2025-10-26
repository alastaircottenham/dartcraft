import type { Playlist } from '../../types';
import { useState, useEffect, useRef } from 'react';

interface PlaylistListProps {
  playlists: Playlist[];
  onPlaylistSelect?: (playlist: Playlist) => void;
  onPlaylistDelete?: (playlist: Playlist) => void;
  onPlaylistRename?: (playlist: Playlist, newName: string) => void;
}

export default function PlaylistList({ 
  playlists, 
  onPlaylistSelect, 
  onPlaylistDelete, 
  onPlaylistRename 
}: PlaylistListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRename = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setEditName(playlist.name);
    setOpenDropdownId(null); // Close dropdown when starting rename
  };

  const handleSaveRename = () => {
    if (editingId && editName.trim()) {
      const playlist = playlists.find(p => p.id === editingId);
      if (playlist) {
        onPlaylistRename?.(playlist, editName.trim());
      }
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (playlist: Playlist) => {
    onPlaylistDelete?.(playlist);
    setOpenDropdownId(null); // Close dropdown after delete
  };

  const toggleDropdown = (playlistId: string) => {
    setOpenDropdownId(openDropdownId === playlistId ? null : playlistId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="ios-card p-4 flex flex-col">
          <div className="flex-1">
            {editingId === playlist.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
                onBlur={handleSaveRename}
                className="ios-input w-full"
                autoFocus
              />
            ) : (
              <div>
                <h3 className="font-semibold text-black dark:text-white truncate">
                  {playlist.name}
                </h3>
                <p className="text-sm text-ios-gray dark:text-gray-400 mt-1">
                  {playlist.songIds.length} song{playlist.songIds.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-ios-gray dark:text-gray-500 mt-1">
                  Created {formatDate(playlist.createdAt)}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => onPlaylistSelect?.(playlist)}
              className="ios-button text-sm flex-1 mr-2"
            >
              Open
            </button>
            
            <div className="relative">
              <button 
                onClick={() => toggleDropdown(playlist.id)}
                className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-lg">⋯</span>
              </button>
              
              {openDropdownId === playlist.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-ios shadow-ios-lg border border-ios-separator dark:border-gray-700 z-10">
                  <button
                    onClick={() => handleRename(playlist)}
                    className="w-full px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-ios"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(playlist)}
                    className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-ios"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
