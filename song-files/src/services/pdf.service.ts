import * as pdfjsLib from 'pdfjs-dist';
import type { RenameData } from '../types';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

/**
 * PDF service for rendering and text extraction
 */

export class PDFService {
  private static instance: PDFService;
  
  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async getPageCount(uri: string): Promise<number> {
    try {
      // For Capacitor file system URIs, we need to read the file directly
      let blob: Blob;
      if (uri.startsWith('/DOCUMENTS/')) {
        // Extract song ID from the URI path
        const songId = uri.split('/').pop()?.replace('.pdf', '');
        if (!songId) {
          throw new Error('Could not extract song ID from URI');
        }
        const { fsService } = await import('./fs.service');
        blob = await fsService.readSongFile(songId);
      } else {
        // For regular URLs, fetch normally
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      }
      
      // Create a blob URL for PDF.js to use
      const blobUrl = URL.createObjectURL(blob);
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: blobUrl,
          verbosity: 0,
          stopAtErrors: false,
          useSystemFonts: true
        });
        const pdf = await loadingTask.promise;
        return pdf.numPages;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to get page count:', error);
      return 1; // Default to 1 page
    }
  }

  async getFirstPageLines(uri: string): Promise<string[]> {
    try {
      console.log('Loading PDF document from:', uri);
      
      // For Capacitor file system URIs, we need to read the file directly
      let blob: Blob;
      if (uri.startsWith('/DOCUMENTS/')) {
        // Extract song ID from the URI path
        const songId = uri.split('/').pop()?.replace('.pdf', '');
        if (!songId) {
          throw new Error('Could not extract song ID from URI');
        }
        const { fsService } = await import('./fs.service');
        blob = await fsService.readSongFile(songId);
        console.log('Read PDF blob for text extraction, size:', blob.size, 'type:', blob.type);
      } else {
        // For regular URLs, fetch normally
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      }
      
      // Create a blob URL for PDF.js to use
      const blobUrl = URL.createObjectURL(blob);
      
      try {
        // Try with more lenient parsing options
        const loadingTask = pdfjsLib.getDocument({
          url: blobUrl,
          verbosity: 0, // Reduce console warnings
          disableAutoFetch: false,
          disableStream: false,
          disableRange: false,
          // More lenient parsing options
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
          // Try to handle malformed PDFs
          stopAtErrors: false,
          maxImageSize: 1024 * 1024,
          isEvalSupported: false,
          useSystemFonts: true,
          // Additional options for problematic PDFs
          // @ts-ignore - pdfjs types don't have these options but they work
          disableFontFace: false,
          // @ts-ignore - pdfjs types don't have these options but they work
          disableCreateObjectURL: false,
          // @ts-ignore - pdfjs types don't have these options but they work
          disableWebGL: true
        });
      
        const pdf = await loadingTask.promise;
        console.log('PDF loaded, getting first page');
        const page = await pdf.getPage(1);
        console.log('Getting text content from page');
        const textContent = await page.getTextContent();
        console.log('Text content items:', textContent.items.length);
        
        // Extract text items and group by lines
        const lines: string[] = [];
        let currentLine = '';
        let lastY = 0;
        const lineThreshold = 5; // pixels

        textContent.items.forEach((item: any) => {
          if (item.str) {
            const itemY = item.transform[5];
            
            if (Math.abs(itemY - lastY) > lineThreshold && currentLine.trim()) {
              lines.push(currentLine.trim());
              currentLine = item.str;
            } else {
              currentLine += (currentLine ? ' ' : '') + item.str;
            }
            
            lastY = itemY;
          }
        });

        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        console.log('Extracted lines:', lines);
        return lines.slice(0, 6); // First 6 lines
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      
      // Try alternative approach with even more lenient options
      try {
        console.log('Trying alternative PDF parsing approach...');
        
        // For Capacitor file system URIs, we need to read the file directly
        let blob: Blob;
        if (uri.startsWith('/DOCUMENTS/')) {
          // Extract song ID from the URI path
          const songId = uri.split('/').pop()?.replace('.pdf', '');
          if (!songId) {
            throw new Error('Could not extract song ID from URI');
          }
          const { fsService } = await import('./fs.service');
          blob = await fsService.readSongFile(songId);
        } else {
          // For regular URLs, fetch normally
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
          }
          blob = await response.blob();
        }
        
        // Create a blob URL for PDF.js to use
        const blobUrl = URL.createObjectURL(blob);
        
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: blobUrl,
            verbosity: 0,
            stopAtErrors: false,
            useSystemFonts: true,
            disableAutoFetch: true,
            disableStream: true,
            disableRange: true,
            // Try to force text extraction even with malformed PDFs
            isEvalSupported: false,
            maxImageSize: -1,
            disableFontFace: true
          });
        
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const textContent = await page.getTextContent();
          
          // Simple text extraction - just get all text items
          const lines: string[] = [];
          let currentLine = '';
          
          for (const item of textContent.items) {
            if ('str' in item && item.str) {
              currentLine += item.str + ' ';
            }
          }
          
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          
          console.log('Alternative approach extracted lines:', lines);
          return lines;
        } finally {
          // Clean up the blob URL
          URL.revokeObjectURL(blobUrl);
        }
        
      } catch (altError) {
        console.error('Alternative PDF parsing also failed:', altError);
        
        // Third attempt: try with minimal options and force text extraction
        try {
          console.log('Trying minimal PDF parsing approach...');
          
          // For Capacitor file system URIs, we need to read the file directly
          let blob: Blob;
          if (uri.startsWith('/DOCUMENTS/')) {
            // Extract song ID from the URI path
            const songId = uri.split('/').pop()?.replace('.pdf', '');
            if (!songId) {
              throw new Error('Could not extract song ID from URI');
            }
            const { fsService } = await import('./fs.service');
            blob = await fsService.readSongFile(songId);
          } else {
            // For regular URLs, fetch normally
            const response = await fetch(uri);
            if (!response.ok) {
              throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
            }
            blob = await response.blob();
          }
          
          // Create a blob URL for PDF.js to use
          const blobUrl = URL.createObjectURL(blob);
          
          try {
            const loadingTask = pdfjsLib.getDocument({
              url: blobUrl,
              verbosity: 0,
              stopAtErrors: false,
              useSystemFonts: true,
              disableAutoFetch: true,
              disableStream: true,
              disableRange: true,
              disableFontFace: true,
              isEvalSupported: false,
              maxImageSize: -1,
              // Force basic text extraction
              // @ts-ignore - pdfjs types don't have these options but they work
              disableWorker: false,
              workerSrc: '/pdf.worker.min.js'
            });
          
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            
            // Try to get text content with different options
            const textContent = await page.getTextContent({
              // @ts-ignore - pdfjs types don't have these options but they work
              normalizeWhitespace: true,
              disableCombineTextItems: false
            });
            
            console.log('Minimal approach text items:', textContent.items.length);
            
            // Extract all text and split by lines
            const allText = textContent.items
              .filter((item): item is any => 'str' in item)
              .map(item => item.str)
              .join(' ');
            
            console.log('All extracted text:', allText);
            
            // Split by common line breaks and clean up
            const lines = allText
              .split(/[\n\r]+/)
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .slice(0, 6); // First 6 lines
            
            console.log('Minimal approach extracted lines:', lines);
            return lines;
          } finally {
            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);
          }
          
        } catch (minimalError) {
          console.error('Minimal PDF parsing also failed:', minimalError);
          console.log('All PDF parsing methods failed, using filename fallback');
          return [];
        }
      }
    }
  }

  async renderPage(uri: string, pageNumber: number, canvas: HTMLCanvasElement, scale: number = 1, containerWidth?: number, containerHeight?: number): Promise<void> {
    try {
      // For Capacitor file system URIs, we need to read the file directly
      let blob: Blob;
      if (uri.startsWith('/DOCUMENTS/')) {
        // Extract song ID from the URI path
        const songId = uri.split('/').pop()?.replace('.pdf', '');
        if (!songId) {
          throw new Error('Could not extract song ID from URI');
        }
        const { fsService } = await import('./fs.service');
        blob = await fsService.readSongFile(songId);
      } else {
        // For regular URLs, fetch normally
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      }
      
      // Check if the blob is actually a PDF
      if (blob.type !== 'application/pdf' && blob.size > 0) {
        // Try to detect PDF by checking the first few bytes
        try {
          const firstBytes = await blob.slice(0, 4).text();
          if (!firstBytes.startsWith('%PDF')) {
            console.warn('File does not appear to be a valid PDF, but attempting to load anyway');
            // Don't throw error, just warn - let PDF.js handle it
          }
        } catch (error) {
          console.warn('Could not read file header, attempting to load anyway');
          // Don't throw error, just warn - let PDF.js handle it
        }
      }
      
      // Create a blob URL for PDF.js to use
      const blobUrl = URL.createObjectURL(blob);
      
      try {
        const pdf = await pdfjsLib.getDocument({
          url: blobUrl,
          verbosity: 0,
          stopAtErrors: false,
          useSystemFonts: true,
          // Font rendering improvements
          disableFontFace: false,
          disableAutoFetch: false,
          disableStream: false,
          disableRange: false,
          // Better text rendering
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
          // Disable features that might affect text quality
          // @ts-ignore - pdfjs types don't have these options but they work
          disableWebGL: true,
          isEvalSupported: false
        }).promise;
        
        const page = await pdf.getPage(pageNumber);
        
        // Get device pixel ratio for high-DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Calculate the optimal scale for crisp rendering
        const baseScale = Math.max(scale, 1.0); // Start with user's scale, minimum 1.0 for readability
        const renderScale = baseScale * devicePixelRatio;
        
        const viewport = page.getViewport({ scale: renderScale });
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }

        // True full-screen approach: scale PDF to completely fill the container
        if (containerWidth && containerHeight) {
          // Calculate the actual PDF dimensions at the render scale
          const pdfWidth = viewport.width / devicePixelRatio;
          const pdfHeight = viewport.height / devicePixelRatio;
          
          // Calculate scale to completely fill the container (maintaining aspect ratio)
          const scaleX = containerWidth / pdfWidth;
          const scaleY = containerHeight / pdfHeight;
          const finalScale = Math.max(scaleX, scaleY); // Use the larger scale to fill the container
          
          // Calculate the actual rendered PDF dimensions
          const renderedPdfWidth = pdfWidth * finalScale;
          const renderedPdfHeight = pdfHeight * finalScale;
          
          // Set canvas to the actual PDF size (not container size) for better centering
          canvas.width = renderedPdfWidth * devicePixelRatio;
          canvas.height = renderedPdfHeight * devicePixelRatio;
          
          // Scale the context for high-DPI rendering
          context.scale(devicePixelRatio, devicePixelRatio);
          
          // Set canvas to fill the entire container
          canvas.style.width = containerWidth + 'px';
          canvas.style.height = containerHeight + 'px';
          canvas.style.display = 'block';
          canvas.style.margin = '0';
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
        } else {
          // Original behavior - use PDF dimensions with high-DPI support
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = (viewport.width / devicePixelRatio) + 'px';
          canvas.style.height = (viewport.height / devicePixelRatio) + 'px';
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
        }

        // Disable image smoothing for crisp text rendering
        context.imageSmoothingEnabled = false;
        
        // Set text rendering properties for solid text
        // @ts-ignore - property exists in browser but not in types
        context.textRenderingOptimization = 'optimizeQuality';
        context.textBaseline = 'alphabetic';
        context.textAlign = 'start';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
          // PDF.js specific rendering options for better text
          intent: 'display',
          renderInteractiveForms: false,
          enableWebGL: false
        };

        await page.render(renderContext).promise;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to render PDF page:', error);
      throw error;
    }
  }

  async extractRenameData(uri: string): Promise<RenameData> {
    const lines = await this.getFirstPageLines(uri);
    console.log('Extracted lines:', lines);
    
    if (lines.length === 0) {
      console.log('No lines extracted, returning empty data');
      return { title: '', artist: '' };
    }

    // Heuristics for title and artist extraction
    let title = '';
    let artist = '';

    // Strategy 1: Look for common patterns in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Look for title patterns (usually first substantial line)
      if (!title && this.isLikelyTitle(line)) {
        title = this.cleanTitle(line);
        continue;
      }
      
      // Look for artist patterns (usually after title)
      if (!artist && this.isLikelyArtist(line)) {
        artist = this.cleanArtist(line);
        continue;
      }
    }

    // Strategy 2: If we found a title but no artist, look for artist in remaining lines
    if (title && !artist) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && this.isLikelyArtist(line)) {
          artist = this.cleanArtist(line);
          break;
        }
      }
    }

    // Strategy 3: If we found an artist but no title, look for title in remaining lines
    if (!title && artist) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && this.isLikelyTitle(line)) {
          title = this.cleanTitle(line);
          break;
        }
      }
    }

    // Strategy 4: Fallback - use first two non-empty lines
    if (!title && !artist) {
      const nonEmptyLines = lines.filter(line => line.trim().length > 0);
      if (nonEmptyLines.length >= 1) {
        title = this.cleanTitle(nonEmptyLines[0]);
      }
      if (nonEmptyLines.length >= 2) {
        artist = this.cleanArtist(nonEmptyLines[1]);
      }
    }

    const result = { title, artist };
    console.log('Final rename data result:', result);
    return result;
  }

  private isLikelyTitle(text: string): boolean {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/);
    
    // Skip very short or very long text
    if (words.length < 2 || words.length > 15) return false;
    
    // Skip lines that look like artist names (all caps, or with commas)
    if (/^[A-Z\s,]+$/.test(trimmed) && trimmed.length < 100) return false;
    
    // Skip lines that start with common artist indicators
    if (/^(by|performed by|artist:?|written by|composed by)/i.test(trimmed)) return false;
    
    // Check for title case pattern (at least some words should be title case)
    const titleCaseWords = words.filter(word => 
      /^[A-Z][a-z]/.test(word) || /^[A-Z]+$/.test(word)
    );
    
    // At least 30% of words should be title case, or it should contain common title words
    const hasTitleWords = /\b(lyrics?|song|title|chorus|verse|bridge|refrain)\b/i.test(trimmed);
    const hasGoodTitleCase = titleCaseWords.length / words.length >= 0.3;
    
    return hasTitleWords || hasGoodTitleCase;
  }

  private isLikelyArtist(text: string): boolean {
    const trimmed = text.trim();
    
    // Check for <Name> pattern
    if (/^<[^>]+>$/.test(trimmed)) return true;
    
    // Check for lines with commas (often indicates multiple artists)
    if (trimmed.includes(',') && trimmed.length < 200) return true;
    
    // Check for ALL CAPS (but not too long and not too short)
    if (/^[A-Z\s,]+$/.test(trimmed) && trimmed.length > 5 && trimmed.length < 100) return true;
    
    // Check for common artist patterns
    if (/^(by|performed by|artist:?|written by|composed by)\s+/i.test(trimmed)) return true;
    
    // Check for name patterns (First Last, First Last, etc.)
    if (/^[A-Z][a-z]+ [A-Z][a-z]+(, [A-Z][a-z]+ [A-Z][a-z]+)*$/.test(trimmed)) return true;
    
    // Check for single names that are likely artists (not titles)
    const words = trimmed.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && 
        words.every(word => /^[A-Z][a-z]+$/.test(word)) &&
        !/\b(lyrics?|song|title|chorus|verse|bridge|refrain)\b/i.test(trimmed)) {
      return true;
    }
    
    return false;
  }

  private cleanTitle(text: string): string {
    return text
      .replace(/^(song|title):?\s*/i, '')
      .replace(/\s*\[.*?\]\s*$/, '') // Remove trailing brackets like [Lyrics]
      .replace(/\s*\(.*?\)\s*$/, '') // Remove trailing parentheses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private cleanArtist(text: string): string {
    return text
      .replace(/^<|>$/g, '') // Remove angle brackets
      .replace(/^(by|performed by|artist:?|written by|composed by)\s*/i, '')
      .replace(/^(key|bpm|capo):\s*\w+/i, '') // Remove key/bpm/capo info
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

export const pdfService = PDFService.getInstance();
