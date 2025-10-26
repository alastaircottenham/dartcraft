import type { SongMeta } from '../../types';
import { useState, useEffect, useRef } from 'react';

interface SongCardProps {
  song: SongMeta;
  onSelect?: (song: SongMeta) => void;
  onClick?: (song: SongMeta) => void;
  onLongPress?: (song: SongMeta) => void;
  onAddToPlaylist?: (song: SongMeta) => void;
  onDelete?: (song: SongMeta) => void;
  onRename?: (song: SongMeta) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  showActions?: boolean;
}

export default function SongCard({ 
  song, 
  onSelect, 
  onClick,
  onLongPress,
  onAddToPlaylist, 
  onDelete,
  onRename,
  isSelected = false,
  isSelectionMode = false,
  showActions = true 
}: SongCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleCardClick = () => {
    if (isSelectionMode) {
      onSelect?.(song);
    } else {
      onClick?.(song);
    }
  };

  const startLongPress = () => {
    if (!isSelectionMode && onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(song);
      }, 500); // 500ms for long press
    }
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Mouse events for desktop
  const handleMouseDown = () => {
    startLongPress();
  };

  const handleMouseUp = () => {
    cancelLongPress();
  };

  const handleMouseLeave = () => {
    cancelLongPress();
  };

  // Touch events for mobile/iOS - simplified approach
  const handleTouchStart = () => {
    startLongPress();
  };

  const handleTouchEnd = () => {
    cancelLongPress();
  };

  const handleTouchMove = () => {
    cancelLongPress(); // Cancel long press if user moves finger
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPlaylist?.(song);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(song);
    setShowMenu(false);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename?.(song);
    setShowMenu(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div 
      className={`
        ios-card p-4 cursor-pointer transition-all duration-200 hover:shadow-ios-lg
        ${isSelected ? 'ring-2 ring-ios-blue bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isSelectionMode ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      `}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {isSelectionMode && (
            <div className="flex-shrink-0 mt-1">
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center
                ${isSelected 
                  ? 'bg-ios-blue border-ios-blue' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {isSelected && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-black dark:text-white truncate">
              {song.title}
            </h3>
          {song.artist && (
            <p className="text-sm text-ios-gray dark:text-gray-400 truncate mt-1">
              {song.artist}
            </p>
          )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-ios-gray dark:text-gray-500">
              <span>{song.pageCount || 1} page{(song.pageCount || 1) > 1 ? 's' : ''}</span>
              <span>Added {formatDate(song.importedAt)}</span>
            </div>
          </div>
        </div>
        
        {showActions && !isSelectionMode && (
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="text-lg">⋯</span>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-ios shadow-ios-lg border border-ios-separator dark:border-gray-700 z-10">
                <button
                  onClick={handleRename}
                  className="w-full px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-ios"
                >
                  Rename
                </button>
                <button
                  onClick={handleAddToPlaylist}
                  className="w-full px-4 py-3 text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Add to Playlist
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-ios"
                >
                  Delete Song
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
