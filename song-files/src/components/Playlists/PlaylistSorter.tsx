import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SongMeta } from '../../types';

interface SortableSongItemProps {
  song: SongMeta;
  onRemove?: (songId: string) => void;
}

function SortableSongItem({ song, onRemove }: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ios-card p-4 mb-3
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-ios"
          >
            <span className="text-ios-gray">⋮⋮</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-black dark:text-white truncate">
              {song.title}
            </h4>
            {song.artist && (
              <p className="text-sm text-ios-gray dark:text-gray-400 truncate">
                {song.artist}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onRemove?.(song.id)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-ios"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
}

interface PlaylistSorterProps {
  songs: SongMeta[];
  onReorder: (songIds: string[]) => void;
  onRemoveSong: (songId: string) => void;
}

export default function PlaylistSorter({ songs, onReorder, onRemoveSong }: PlaylistSorterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex(song => song.id === active.id);
      const newIndex = songs.findIndex(song => song.id === over.id);
      
      const newSongs = arrayMove(songs, oldIndex, newIndex);
      const newSongIds = newSongs.map(song => song.id);
      
      onReorder(newSongIds);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={songs.map(song => song.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {songs.map((song) => (
            <SortableSongItem
              key={song.id}
              song={song}
              onRemove={onRemoveSong}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
