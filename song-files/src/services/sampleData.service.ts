import type { SongMeta } from '../types';
import { useSongs } from '../stores/useSongs';
import { usePlaylists } from '../stores/usePlaylists';
import { fsService } from './fs.service';
import { pdfService } from './pdf.service';
import { hashFile } from './hash.service';
import { generateUUID } from './uuid.service';

/**
 * Service for creating sample data for development/testing
 */

export class SampleDataService {
  private static instance: SampleDataService;
  
  static getInstance(): SampleDataService {
    if (!SampleDataService.instance) {
      SampleDataService.instance = new SampleDataService();
    }
    return SampleDataService.instance;
  }

  async createSamplePDF(): Promise<Blob> {
    // Create a simple PDF-like blob for testing
    // In a real app, this would be actual PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Sample Song) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  async createSampleSongs(): Promise<SongMeta[]> {
    const songs: SongMeta[] = [];
    const now = Date.now();

    // Try to import the real test.pdf file if it exists
    try {
      const testPdfBlob = await this.loadTestPdf();
      if (testPdfBlob) {
        const songId = generateUUID();
        const filePath = await fsService.writeSongFile(songId, testPdfBlob);
        // Convert blob to file for hashing
        const testPdfFile = new File([testPdfBlob], 'test.pdf', { type: 'application/pdf' });
        const contentHash = await hashFile(testPdfFile);
        const uri = await fsService.getSongUri(songId);
        
        // Try to extract metadata from the PDF
        let title = 'Test Song';
        let artist = 'Test Artist';
        let pageCount = 1;
        
        try {
          const renameData = await pdfService.extractRenameData(uri);
          if (renameData.title) title = renameData.title;
          if (renameData.artist) artist = renameData.artist;
          pageCount = await pdfService.getPageCount(uri);
        } catch (error) {
          console.warn('Failed to extract metadata from test PDF, using defaults:', error);
        }

        const song: SongMeta = {
          id: songId,
          title,
          artist,
          filename: `${title} - ${artist}.pdf`,
          filePath,
          contentHash,
          pageCount,
          importedAt: now,
          updatedAt: now
        };
        
        songs.push(song);
        console.log('Successfully imported test.pdf as sample song');
      }
    } catch (error) {
      console.warn('Failed to import test.pdf, falling back to fake sample data:', error);
    }

    // If we couldn't import the real test.pdf, create fake sample data
    if (songs.length === 0) {
      const sampleSongs: Omit<SongMeta, 'id' | 'filePath' | 'contentHash' | 'importedAt' | 'updatedAt'>[] = [
        {
          title: 'Amazing Grace',
          artist: 'John Newton',
          filename: 'Amazing Grace - John Newton.pdf',
          pageCount: 1
        },
        {
          title: 'Hallelujah',
          artist: 'Leonard Cohen',
          filename: 'Hallelujah - Leonard Cohen.pdf',
          pageCount: 2
        },
        {
          title: 'What a Wonderful World',
          artist: 'Louis Armstrong',
          filename: 'What a Wonderful World - Louis Armstrong.pdf',
          pageCount: 1
        }
      ];

      for (const songData of sampleSongs) {
        const song: SongMeta = {
          ...songData,
          id: generateUUID(),
          filePath: `songs/${generateUUID()}.pdf`,
          contentHash: generateUUID(), // In real app, this would be actual hash
          importedAt: now - Math.random() * 86400000, // Random time in last 24 hours
          updatedAt: now
        };
        songs.push(song);
      }
    }

    return songs;
  }

  private async loadTestPdf(): Promise<Blob | null> {
    try {
      // Try to load the test.pdf file from the public directory
      console.log('Attempting to load test.pdf from public directory...');
      const response = await fetch('/test.pdf');
      console.log('Response status:', response.status, response.statusText);
      if (response.ok) {
        const blob = await response.blob();
        console.log('Successfully loaded test.pdf, size:', blob.size, 'type:', blob.type);
        return blob;
      } else {
        console.warn('Failed to load test.pdf, status:', response.status);
      }
    } catch (error) {
      console.warn('Could not load test.pdf from public directory:', error);
    }
    
    return null;
  }

  async createSamplePlaylists(): Promise<{ name: string; songIds: string[] }[]> {
    return [
      {
        name: 'Sunday Service',
        songIds: [] // Will be populated with sample song IDs
      },
      {
        name: 'Wedding Songs',
        songIds: []
      },
      {
        name: 'Christmas Carols',
        songIds: []
      }
    ];
  }

  async generateSampleData(): Promise<void> {
    try {
      // Create sample songs
      const sampleSongs = await this.createSampleSongs();
      
      // Add songs to database
      const { addSong } = useSongs.getState();
      for (const song of sampleSongs) {
        await addSong(song);
      }

      // Create sample playlists
      const samplePlaylists = await this.createSamplePlaylists();
      const { createPlaylist } = usePlaylists.getState();
      
      for (const playlistData of samplePlaylists) {
        const playlist = await createPlaylist(playlistData.name);
        
        // Add some songs to the first playlist
        if (playlistData.name === 'Sunday Service' && sampleSongs.length > 0) {
          const { addSongToPlaylist } = usePlaylists.getState();
          await addSongToPlaylist(playlist.id, sampleSongs[0].id);
          if (sampleSongs.length > 1) {
            await addSongToPlaylist(playlist.id, sampleSongs[1].id);
          }
        }
      }

      console.log('Sample data generated successfully');
    } catch (error) {
      console.error('Failed to generate sample data:', error);
      throw error;
    }
  }
}

export const sampleDataService = SampleDataService.getInstance();
