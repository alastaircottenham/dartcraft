import type { RenameData } from '../types';

/**
 * Service for generating filenames from title and artist
 */

export class RenameService {
  private static instance: RenameService;
  
  static getInstance(): RenameService {
    if (!RenameService.instance) {
      RenameService.instance = new RenameService();
    }
    return RenameService.instance;
  }

  generateFilename(renameData: RenameData, originalFilename: string): string {
    const { title, artist } = renameData;
    
    if (!title.trim()) {
      return originalFilename;
    }

    let filename = this.sanitizeFilename(title);
    
    if (artist && artist.trim()) {
      const cleanArtist = this.sanitizeFilename(artist);
      filename = `${filename} - ${cleanArtist}`;
    }
    
    // Ensure .pdf extension
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    
    return filename;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  calculateConfidence(renameData: RenameData): number {
    const { title, artist } = renameData;
    let confidence = 0;

    // Title confidence
    if (title && title.trim()) {
      confidence += 0.6;
      
      // Bonus for title case
      if (/^[A-Z]/.test(title)) {
        confidence += 0.2;
      }
      
      // Bonus for reasonable length
      const words = title.split(/\s+/);
      if (words.length >= 2 && words.length <= 8) {
        confidence += 0.2;
      }
    }

    // Artist confidence
    if (artist && artist.trim()) {
      confidence += 0.3;
      
      // Bonus for common patterns
      if (/^<[^>]+>$/.test(artist) || /^[A-Z\s]+$/.test(artist)) {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1.0);
  }
}

export const renameService = RenameService.getInstance();
