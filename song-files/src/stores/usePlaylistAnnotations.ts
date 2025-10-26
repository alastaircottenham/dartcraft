import { create } from 'zustand';
import type { PlaylistAnnotations, AnnotationStroke, SongId, PlaylistId } from '../types';
import { db } from '../db/dexie';

interface PlaylistAnnotationsState {
  annotations: Map<string, PlaylistAnnotations>;
  isLoading: boolean;
  
  // Actions
  loadAnnotations: (playlistId: PlaylistId, songId: SongId) => Promise<PlaylistAnnotations | null>;
  saveAnnotations: (playlistId: PlaylistId, songId: SongId, strokes: AnnotationStroke[]) => Promise<void>;
  addStroke: (playlistId: PlaylistId, songId: SongId, stroke: AnnotationStroke) => Promise<void>;
  removeStroke: (playlistId: PlaylistId, songId: SongId, strokeId: string) => Promise<void>;
  clearAnnotations: (playlistId: PlaylistId, songId: SongId) => Promise<void>;
  getAnnotations: (playlistId: PlaylistId, songId: SongId) => PlaylistAnnotations | null;
}

const getAnnotationKey = (playlistId: PlaylistId, songId: SongId) => `${playlistId}:${songId}`;

export const usePlaylistAnnotations = create<PlaylistAnnotationsState>((set, get) => ({
  annotations: new Map(),
  isLoading: false,

  loadAnnotations: async (playlistId: PlaylistId, songId: SongId) => {
    const key = getAnnotationKey(playlistId, songId);
    
    try {
      const annotation = await db.playlistAnnotations
        .where('[playlistId+songId]')
        .equals([playlistId, songId])
        .first();

      if (annotation) {
        const annotations = new Map(get().annotations);
        annotations.set(key, annotation);
        set({ annotations });
        return annotation;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load annotations:', error);
      return null;
    }
  },

  saveAnnotations: async (playlistId: PlaylistId, songId: SongId, strokes: AnnotationStroke[]) => {
    const key = getAnnotationKey(playlistId, songId);
    const annotation: PlaylistAnnotations = {
      songId,
      playlistId,
      strokes,
      updatedAt: Date.now()
    };

    try {
      await db.playlistAnnotations.put(annotation);
      
      const annotations = new Map(get().annotations);
      annotations.set(key, annotation);
      set({ annotations });
    } catch (error) {
      console.error('Failed to save annotations:', error);
      throw error;
    }
  },

  addStroke: async (playlistId: PlaylistId, songId: SongId, stroke: AnnotationStroke) => {
    const key = getAnnotationKey(playlistId, songId);
    const existing = get().annotations.get(key);
    const strokes = existing ? [...existing.strokes, stroke] : [stroke];
    
    await get().saveAnnotations(playlistId, songId, strokes);
  },

  removeStroke: async (playlistId: PlaylistId, songId: SongId, strokeId: string) => {
    const key = getAnnotationKey(playlistId, songId);
    const existing = get().annotations.get(key);
    if (!existing) return;

    const strokes = existing.strokes.filter(s => s.id !== strokeId);
    await get().saveAnnotations(playlistId, songId, strokes);
  },

  clearAnnotations: async (playlistId: PlaylistId, songId: SongId) => {
    try {
      await db.playlistAnnotations
        .where('[playlistId+songId]')
        .equals([playlistId, songId])
        .delete();

      const key = getAnnotationKey(playlistId, songId);
      const annotations = new Map(get().annotations);
      annotations.delete(key);
      set({ annotations });
    } catch (error) {
      console.error('Failed to clear annotations:', error);
      throw error;
    }
  },

  getAnnotations: (playlistId: PlaylistId, songId: SongId) => {
    const key = getAnnotationKey(playlistId, songId);
    return get().annotations.get(key) || null;
  }
}));
