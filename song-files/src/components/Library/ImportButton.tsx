import { useState } from 'react';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { useSongs } from '../../stores/useSongs';
import { hashFile } from '../../services/hash.service';
import { generateUUID } from '../../services/uuid.service';
import { fsService } from '../../services/fs.service';
import { pdfService } from '../../services/pdf.service';
import { renameService } from '../../services/rename.service';
import type { SongMeta, ImportResult } from '../../types';
import { Capacitor } from '@capacitor/core';

interface ImportButtonProps {
  onImportComplete?: (results: ImportResult[]) => void;
  className?: string;
}

export default function ImportButton({ onImportComplete, className }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const { addSong, findByHash } = useSongs();

  const handleImport = async () => {
    if (isImporting) return;

    try {
      setIsImporting(true);

      if (Capacitor.isNativePlatform()) {
        // Use Capacitor file picker on native platforms
        const result = await FilePicker.pickFiles({
          types: ['application/pdf'],
        });

        if (result.files && result.files.length > 0) {
          const importResults: ImportResult[] = [];
          
          for (const file of result.files) {
            try {
              const importResult = await importFile(file);
              if (importResult) {
                importResults.push(importResult);
              }
            } catch (error) {
              if (error instanceof Error && error.message === 'Manual input required') {
                // Don't add to results, the manual input dialog will handle this
                console.log('Manual input required for file:', file.name);
              } else {
                console.error('Failed to import file:', file.name, error);
                importResults.push({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            }
          }
          
          onImportComplete?.(importResults);
        }
      } else {
        // Web fallback - create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.multiple = true;
        
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const importResults: ImportResult[] = [];
            
            for (const file of Array.from(files)) {
              try {
                const importResult = await importFile(file);
                if (importResult) {
                  importResults.push(importResult);
                }
              } catch (error) {
                if (error instanceof Error && error.message === 'Manual input required') {
                  // Don't add to results, the manual input dialog will handle this
                  console.log('Manual input required for file:', file.name);
                } else {
                  console.error('Failed to import file:', file.name, error);
                  importResults.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                  });
                }
              }
            }
            
            onImportComplete?.(importResults);
          }
        };
        
        input.click();
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const importFile = async (file: File, manualRenameData?: RenameData): Promise<ImportResult> => {
    try {
      // Calculate content hash
      const contentHash = await hashFile(file);
      
      // Check for duplicates
      const existingSong = await findByHash(contentHash);
      if (existingSong) {
        return {
          success: false,
          isDuplicate: true,
          existingSong,
          error: 'Song already exists in library'
        };
      }

      // Generate unique ID and save file
      const songId = generateUUID();
      const filePath = await fsService.writeSongFile(songId, file);

      let renameData: RenameData = { title: '', artist: '' };
      let pageCount = 1;
      
      if (manualRenameData) {
        // Use provided manual data
        renameData = manualRenameData;
        console.log('Using manual rename data:', renameData);
      } else {
        // Extract text for auto-rename
        const uri = await fsService.getSongUri(songId);
        console.log('Extracting rename data from PDF:', uri);
        
        try {
          renameData = await pdfService.extractRenameData(uri);
          pageCount = await pdfService.getPageCount(uri);
          console.log('Extracted rename data:', renameData);
          
          // If no text was extracted, use filename fallback
          if (!renameData.title && !renameData.artist) {
            throw new Error('No text extracted from PDF');
          }
        } catch (error) {
          console.warn('Failed to extract PDF metadata, using filename:', error);
          
          // Check if filename has good pattern, otherwise show manual input
          const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
          const separators = [' - ', ' – ', ' — ', ' by ', ' BY '];
          let found = false;
          
          for (const sep of separators) {
            if (nameWithoutExt.includes(sep)) {
              const parts = nameWithoutExt.split(sep);
              if (parts.length >= 2) {
                renameData = {
                  title: parts[0]?.trim() || '',
                  artist: parts.slice(1).join(sep).trim() || ''
                };
                found = true;
                break;
              }
            }
          }
          
          // If no good pattern found, show manual input dialog
          if (!found) {
            setCurrentFile(file);
            setManualTitle(nameWithoutExt);
            setManualArtist('');
            setShowManualInput(true);
            throw new Error('Manual input required'); // This will be caught and handled properly
          }
          
          console.log('Filename-based rename data:', renameData);
        }
      }
      
      const filename = renameService.generateFilename(renameData, file.name);

      // Create song metadata
      const song: SongMeta = {
        id: songId,
        title: renameData.title || file.name.replace('.pdf', ''),
        artist: renameData.artist,
        filename,
        filePath,
        contentHash,
        pageCount,
        importedAt: Date.now(),
        updatedAt: Date.now()
      };

      // Save to database
      await addSong(song);

      return {
        success: true,
        song
      };
    } catch (error) {
      console.error('Failed to import file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const handleManualImport = async () => {
    if (!currentFile || !manualTitle.trim()) return;

    try {
      setIsImporting(true);
      
      // Use manual input data
      const renameData = {
        title: manualTitle.trim(),
        artist: manualArtist.trim()
      };
      
      const result = await importFile(currentFile, renameData);
      onImportComplete?.([result]);
      
      // Reset state
      setShowManualInput(false);
      setCurrentFile(null);
      setManualTitle('');
      setManualArtist('');
      
    } catch (error) {
      console.error('Manual import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const cancelManualImport = () => {
    setShowManualInput(false);
    setCurrentFile(null);
    setManualTitle('');
    setManualArtist('');
  };

  return (
    <>
      <button
        onClick={handleImport}
        disabled={isImporting}
        className={className || "ios-button flex items-center space-x-2 disabled:opacity-50"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>{isImporting ? 'Importing...' : 'Import PDFs'}</span>
      </button>

      {/* Manual Input Dialog */}
      {showManualInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-ios-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Enter Song Details
            </h3>
            <p className="text-sm text-ios-gray dark:text-gray-400 mb-4">
              PDF text extraction failed. Please enter the song details manually.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="ios-input w-full"
                  placeholder="Enter song title"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={manualArtist}
                  onChange={(e) => setManualArtist(e.target.value)}
                  className="ios-input w-full"
                  placeholder="Enter artist name (optional)"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelManualImport}
                className="flex-1 ios-button-secondary"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                onClick={handleManualImport}
                disabled={isImporting || !manualTitle.trim()}
                className="flex-1 ios-button disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
