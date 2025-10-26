export type SongId = string;
export type PlaylistId = string;

export interface SongMeta {
  id: SongId;
  title: string;
  artist?: string;
  filename: string;       // stored name
  filePath: string;       // Filesystem URI
  contentHash: string;    // SHA-256 for dedupe
  pageCount?: number;
  importedAt: number;
  updatedAt: number;
}

export interface AnnotationStroke {
  id: string;
  page: number; // 1-based
  points: { x: number; y: number; t: number }[]; // normalised 0..1
  width: number;
  color: string; // hex
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface PlaylistAnnotations {
  songId: SongId;
  playlistId: PlaylistId;
  strokes: AnnotationStroke[];
  updatedAt: number;
}

export interface Playlist {
  id: PlaylistId;
  name: string;
  songIds: SongId[]; // order matters
  createdAt: number;
  updatedAt: number;
}

export interface ImportResult {
  success: boolean;
  song?: SongMeta;
  error?: string;
  isDuplicate?: boolean;
  existingSong?: SongMeta;
}

export interface RenameData {
  title: string;
  artist?: string;
}

export interface SearchResult {
  song: SongMeta;
  score: number;
}

export interface ViewerState {
  currentSongIndex: number;
  currentPage: number;
  zoom: number;
  isDrawing: boolean;
  drawingTool: 'pen' | 'highlighter' | 'eraser' | 'none';
  strokeColor: string;
  strokeWidth: number;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
  keepAwakeInPerformance: boolean;
}

