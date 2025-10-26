import { Filesystem, Directory } from '@capacitor/filesystem';
import type { SongId } from '../types';

/**
 * Filesystem service for managing song files and annotations
 */

export class FilesystemService {
  private static instance: FilesystemService;
  
  static getInstance(): FilesystemService {
    if (!FilesystemService.instance) {
      FilesystemService.instance = new FilesystemService();
    }
    return FilesystemService.instance;
  }

  async ensureDirectories(): Promise<void> {
    try {
      // Ensure songs directory exists
      await Filesystem.mkdir({
        path: 'songs',
        directory: Directory.Documents,
        recursive: true
      });

      // Ensure annotations directory exists
      await Filesystem.mkdir({
        path: 'annotations',
        directory: Directory.Documents,
        recursive: true
      });
    } catch (error) {
      console.error('Failed to ensure directories:', error);
    }
  }

  async writeSongFile(songId: SongId, blob: Blob): Promise<string> {
    try {
      const base64Data = await this.blobToBase64(blob);
      const fileName = `${songId}.pdf`;
      
      await Filesystem.writeFile({
        path: `songs/${fileName}`,
        data: base64Data,
        directory: Directory.Documents
      });

      return `songs/${fileName}`;
    } catch (error) {
      console.error('Failed to write song file:', error);
      throw error;
    }
  }

  async getSongUri(songId: SongId): Promise<string> {
    try {
      const result = await Filesystem.getUri({
        directory: Directory.Documents,
        path: `songs/${songId}.pdf`
      });
      return result.uri;
    } catch (error) {
      console.error('Failed to get song URI:', error);
      throw error;
    }
  }

  async readSongFile(songId: SongId): Promise<Blob> {
    try {
      const result = await Filesystem.readFile({
        path: `songs/${songId}.pdf`,
        directory: Directory.Documents
      });

      // Convert base64 to blob
      const byteCharacters = atob(result.data as string);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
      console.error('Failed to read song file:', error);
      throw error;
    }
  }

  async writeAnnotations(playlistId: string, songId: SongId, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      const base64Data = btoa(jsonData);
      
      // Ensure playlist annotation directory exists
      await Filesystem.mkdir({
        path: `annotations/${playlistId}`,
        directory: Directory.Documents,
        recursive: true
      });

      await Filesystem.writeFile({
        path: `annotations/${playlistId}/${songId}.json`,
        data: base64Data,
        directory: Directory.Documents
      });
    } catch (error) {
      console.error('Failed to write annotations:', error);
      throw error;
    }
  }

  async readAnnotations(playlistId: string, songId: SongId): Promise<any | null> {
    try {
      const result = await Filesystem.readFile({
        path: `annotations/${playlistId}/${songId}.json`,
        directory: Directory.Documents
      });

      const jsonData = atob(result.data as string);
      return JSON.parse(jsonData);
    } catch (error) {
      // File doesn't exist or can't be read
      return null;
    }
  }

  async deleteSongFile(songId: SongId): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `songs/${songId}.pdf`,
        directory: Directory.Documents
      });
    } catch (error) {
      console.error('Failed to delete song file:', error);
      throw error;
    }
  }

  async deleteAnnotations(playlistId: string, songId: SongId): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `annotations/${playlistId}/${songId}.json`,
        directory: Directory.Documents
      });
    } catch (error) {
      console.error('Failed to delete annotations:', error);
      throw error;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const fsService = FilesystemService.getInstance();
