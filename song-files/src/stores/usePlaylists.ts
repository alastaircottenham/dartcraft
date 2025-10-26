import { create } from 'zustand';
import { generateUUID } from '../services/uuid.service';
import type { Playlist, SongId } from '../types';
import { db } from '../db/dexie';

interface PlaylistsState {
  playlists: Playlist[];
  isLoading: boolean;
  
  // Actions
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: SongId) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: SongId) => Promise<void>;
  reorderSongs: (playlistId: string, songIds: SongId[]) => Promise<void>;
  getPlaylist: (id: string) => Playlist | undefined;
}

export const usePlaylists = create<PlaylistsState>((set, get) => ({
  playlists: [],
  isLoading: false,

  loadPlaylists: async () => {
    set({ isLoading: true });
    try {
      const playlists = await db.playlists.orderBy('updatedAt').reverse().toArray();
      set({ playlists, isLoading: false });
    } catch (error) {
      console.error('Failed to load playlists:', error);
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name: string) => {
    const playlist: Playlist = {
      id: generateUUID(),
      name,
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await db.playlists.add(playlist);
      await get().loadPlaylists();
      return playlist;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  },

  updatePlaylist: async (id: string, updates: Partial<Playlist>) => {
    try {
      await db.playlists.update(id, { ...updates, updatedAt: Date.now() });
      await get().loadPlaylists();
    } catch (error) {
      console.error('Failed to update playlist:', error);
      throw error;
    }
  },

  deletePlaylist: async (id: string) => {
    try {
      await db.playlists.delete(id);
      await get().loadPlaylists();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  },

  addSongToPlaylist: async (playlistId: string, songId: SongId) => {
    const playlist = get().getPlaylist(playlistId);
    if (!playlist) return;

    if (playlist.songIds.includes(songId)) return; // Already in playlist

    const updatedSongIds = [...playlist.songIds, songId];
    await get().updatePlaylist(playlistId, { songIds: updatedSongIds });
  },

  removeSongFromPlaylist: async (playlistId: string, songId: SongId) => {
    const playlist = get().getPlaylist(playlistId);
    if (!playlist) return;

    const updatedSongIds = playlist.songIds.filter(id => id !== songId);
    await get().updatePlaylist(playlistId, { songIds: updatedSongIds });
  },

  reorderSongs: async (playlistId: string, songIds: SongId[]) => {
    await get().updatePlaylist(playlistId, { songIds });
  },

  getPlaylist: (id: string) => {
    return get().playlists.find(p => p.id === id);
  }
}));
