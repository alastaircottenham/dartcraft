import { useState, useEffect } from 'react';
import { usePlaylists } from '../../stores/usePlaylists';

interface AddToPlaylistModalProps {
  selectedSongIds: string[];
  onClose: () => void;
}

export default function AddToPlaylistModal({ selectedSongIds, onClose }: AddToPlaylistModalProps) {
  const { playlists, loadPlaylists, addSongToPlaylist, createPlaylist } = usePlaylists();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleAddToPlaylist = async () => {
    if (isCreatingNew) {
      if (!newPlaylistName.trim()) return;
      
      setIsLoading(true);
      try {
        const newPlaylist = await createPlaylist(newPlaylistName.trim());
        for (const songId of selectedSongIds) {
          await addSongToPlaylist(newPlaylist.id, songId);
        }
        onClose();
      } catch (error) {
        console.error('Failed to create playlist and add songs:', error);
        alert('Failed to create playlist. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!selectedPlaylistId) return;

      setIsLoading(true);
      try {
        for (const songId of selectedSongIds) {
          await addSongToPlaylist(selectedPlaylistId, songId);
        }
        onClose();
      } catch (error) {
        console.error('Failed to add songs to playlist:', error);
        alert('Failed to add songs to playlist. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedPlaylistId('');
    setNewPlaylistName('');
  };

  const handleSelectExisting = () => {
    setIsCreatingNew(false);
    setNewPlaylistName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-ios-lg shadow-ios-lg max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-ios-separator dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Add to Playlist
          </h3>
          <p className="text-sm text-ios-gray dark:text-gray-400 mt-1">
            Select a playlist to add {selectedSongIds.length} song{selectedSongIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Create New Playlist Option */}
          <div className="mb-4">
            <label
              className={`
                block p-4 rounded-ios cursor-pointer transition-all
                ${isCreatingNew 
                  ? 'bg-ios-blue bg-opacity-10 border-2 border-ios-blue' 
                  : 'bg-ios-light-gray dark:bg-gray-700 border-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="playlistOption"
                  checked={isCreatingNew}
                  onChange={handleCreateNew}
                  className="sr-only"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black dark:text-white flex items-center gap-2">
                    <span className="text-lg">➕</span>
                    Create New Playlist
                  </h4>
                  <p className="text-sm text-ios-gray dark:text-gray-400">
                    Add songs to a new playlist
                  </p>
                </div>
                {isCreatingNew && (
                  <span className="text-ios-blue text-xl ml-2">✓</span>
                )}
              </div>
            </label>
            
            {isCreatingNew && (
              <div className="mt-3 ml-6">
                <input
                  type="text"
                  placeholder="Enter playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Existing Playlists */}
          {playlists.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                <span className="text-sm text-ios-gray dark:text-gray-400 px-2">OR</span>
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              </div>
              
              <label
                className={`
                  block p-4 rounded-ios cursor-pointer transition-all
                  ${!isCreatingNew && selectedPlaylistId === '' 
                    ? 'bg-ios-blue bg-opacity-10 border-2 border-ios-blue' 
                    : 'bg-ios-light-gray dark:bg-gray-700 border-2 border-transparent'
                  }
                `}
                onClick={handleSelectExisting}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="playlistOption"
                    checked={!isCreatingNew}
                    onChange={handleSelectExisting}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-black dark:text-white">
                      Select Existing Playlist
                    </h4>
                    <p className="text-sm text-ios-gray dark:text-gray-400">
                      Choose from {playlists.length} existing playlist{playlists.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {!isCreatingNew && selectedPlaylistId === '' && (
                    <span className="text-ios-blue text-xl ml-2">✓</span>
                  )}
                </div>
              </label>

              {!isCreatingNew && (
                <div className="space-y-2 ml-4">
                  {playlists.map((playlist) => (
                    <label
                      key={playlist.id}
                      className={`
                        block p-3 rounded-lg cursor-pointer transition-all
                        ${selectedPlaylistId === playlist.id 
                          ? 'bg-ios-blue bg-opacity-10 border-2 border-ios-blue' 
                          : 'bg-ios-light-gray dark:bg-gray-700 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="playlist"
                          value={playlist.id}
                          checked={selectedPlaylistId === playlist.id}
                          onChange={(e) => setSelectedPlaylistId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-black dark:text-white">
                            {playlist.name}
                          </h4>
                          <p className="text-sm text-ios-gray dark:text-gray-400">
                            {playlist.songIds.length} song{playlist.songIds.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {selectedPlaylistId === playlist.id && (
                          <span className="text-ios-blue text-xl ml-2">✓</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {playlists.length === 0 && !isCreatingNew && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-ios-gray dark:text-gray-400 mb-4">
                No playlists available
              </p>
              <p className="text-sm text-ios-gray dark:text-gray-500">
                Create a new playlist above to add songs
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-ios-separator dark:border-gray-700 flex justify-end space-x-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="ios-button-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddToPlaylist}
            disabled={
              isLoading || 
              (isCreatingNew && !newPlaylistName.trim()) ||
              (!isCreatingNew && !selectedPlaylistId)
            }
            className="ios-button disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isCreatingNew ? 'Creating...' : 'Adding...'}
              </div>
            ) : (
              isCreatingNew ? 'Create & Add' : 'Add to Playlist'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

