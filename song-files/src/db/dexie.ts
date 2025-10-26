import Dexie, { type Table } from 'dexie';
import type { SongMeta, Playlist, PlaylistAnnotations } from '../types';

export class SongFilesDB extends Dexie {
  songs!: Table<SongMeta>;
  playlists!: Table<Playlist>;
  playlistAnnotations!: Table<PlaylistAnnotations>;

  constructor() {
    super('SongFilesDB');
    this.version(1).stores({
      songs: 'id, title, artist, filename, contentHash, importedAt, updatedAt',
      playlists: 'id, name, songIds, createdAt, updatedAt',
      playlistAnnotations: '[playlistId+songId], songId, playlistId, updatedAt'
    });
  }
}

export const db = new SongFilesDB();
