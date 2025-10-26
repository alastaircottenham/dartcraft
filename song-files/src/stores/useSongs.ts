import { create } from 'zustand';
import type { SongMeta, ImportResult, SearchResult } from '../types';
import { db } from '../db/dexie';
import Fuse from 'fuse.js';

interface SongsState {
  songs: SongMeta[];
  isLoading: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  fuse: Fuse<SongMeta> | null;
  
  // Actions
  loadSongs: () => Promise<void>;
  addSong: (song: SongMeta) => Promise<void>;
  updateSong: (id: string, updates: Partial<SongMeta>) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  findByHash: (hash: string) => Promise<SongMeta | undefined>;
  search: (query: string) => void;
  clearSearch: () => void;
  importSong: (file: File) => Promise<ImportResult>;
}

export const useSongs = create<SongsState>((set, get) => ({
  songs: [],
  isLoading: false,
  searchQuery: '',
  searchResults: [],
  fuse: null,

  loadSongs: async () => {
    set({ isLoading: true });
    try {
      const songs = await db.songs.orderBy('importedAt').reverse().toArray();
      const fuse = new Fuse(songs, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'artist', weight: 2 },
          { name: 'filename', weight: 1 }
        ],
        threshold: 0.3,
        includeScore: true
      });
      set({ songs, fuse, isLoading: false });
    } catch (error) {
      console.error('Failed to load songs:', error);
      set({ isLoading: false });
    }
  },

  addSong: async (song: SongMeta) => {
    try {
      await db.songs.add(song);
      await get().loadSongs();
    } catch (error) {
      console.error('Failed to add song:', error);
      throw error;
    }
  },

  updateSong: async (id: string, updates: Partial<SongMeta>) => {
    try {
      await db.songs.update(id, { ...updates, updatedAt: Date.now() });
      await get().loadSongs();
    } catch (error) {
      console.error('Failed to update song:', error);
      throw error;
    }
  },

  deleteSong: async (id: string) => {
    try {
      // Get the song first to access file path
      const song = await db.songs.get(id);
      if (!song) {
        throw new Error('Song not found');
      }

      // Delete from database
      await db.songs.delete(id);
      
      // Remove from all playlists
      const playlists = await db.playlists.toArray();
      for (const playlist of playlists) {
        if (playlist.songIds.includes(id)) {
          const updatedSongIds = playlist.songIds.filter(songId => songId !== id);
          await db.playlists.update(playlist.id, { songIds: updatedSongIds });
        }
      }

      // Delete annotations for this song from all playlists
      await db.playlistAnnotations.where('songId').equals(id).delete();

      // Delete the actual file from filesystem
      try {
        const { fsService } = await import('../services/fs.service');
        await fsService.deleteSongFile(id);
      } catch (fileError) {
        console.warn('Failed to delete song file from filesystem:', fileError);
        // Continue even if file deletion fails
      }

      await get().loadSongs();
    } catch (error) {
      console.error('Failed to delete song:', error);
      throw error;
    }
  },

  findByHash: async (hash: string) => {
    try {
      return await db.songs.where('contentHash').equals(hash).first();
    } catch (error) {
      console.error('Failed to find song by hash:', error);
      return undefined;
    }
  },

  search: (query: string) => {
    const { fuse } = get();
    if (!fuse || !query.trim()) {
      set({ searchQuery: '', searchResults: [] });
      return;
    }

    const results = fuse.search(query);
    const searchResults: SearchResult[] = results.map(result => ({
      song: result.item,
      score: result.score || 0
    }));

    set({ searchQuery: query, searchResults });
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] });
  },

  importSong: async (_file: File): Promise<ImportResult> => {
    // This will be implemented in the services
    throw new Error('Import functionality will be implemented in services');
  }
}));
