import { useState, useRef, useEffect } from 'react';
import { pdfService } from '../../services/pdf.service';
import { fsService } from '../../services/fs.service';
import { usePlaylistAnnotations } from '../../stores/usePlaylistAnnotations';
import { useTheme } from '../../contexts/ThemeContext';
import DrawingLayer from './DrawingLayer';
import Toolbar from './Toolbar';
import FloatingToolbar from './FloatingToolbar';
import type { SongMeta, AnnotationStroke, ViewerState } from '../../types';

interface PdfViewerProps {
  song: SongMeta;
  playlistId: string;
  isPerformanceMode?: boolean;
  onSongChange?: (direction: 'prev' | 'next') => void;
  onClose?: () => void;
}

export default function PdfViewer({
  song,
  playlistId,
  isPerformanceMode = false,
  onSongChange,
  onClose
}: PdfViewerProps) {
  const { settings } = useTheme();
  
  const [viewerState, setViewerState] = useState<ViewerState>({
    currentSongIndex: 0,
    currentPage: 1,
    zoom: 1.0, // Start with 1.0 for better full-screen fitting, user can zoom as needed
    isDrawing: false,
    drawingTool: 'none',
    strokeColor: settings.defaultStrokeColor,
    strokeWidth: settings.defaultStrokeWidth
  });

  const [strokes, setStrokes] = useState<AnnotationStroke[]>([]);
  const [strokeHistory, setStrokeHistory] = useState<AnnotationStroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackViewer, setUseFallbackViewer] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [canvasDisplaySize, setCanvasDisplaySize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { loadAnnotations, saveAnnotations } = usePlaylistAnnotations();

  useEffect(() => {
    loadSongData();
  }, [song.id, playlistId]);

  // Update container size when component mounts or when switching to performance mode
  useEffect(() => {
    const updateSize = () => {
      updateCanvasDisplaySize();
    };
    
    // Initial size update
    updateSize();
    
    // Update size after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateSize, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isPerformanceMode]);

  // Cleanup blob URL when component unmounts or song changes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const loadSongData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading song data for:', song.title, 'ID:', song.id);
      console.log('Song file path:', song.filePath);

      // Load annotations for this song in this playlist
      const annotations = await loadAnnotations(playlistId, song.id);
      if (annotations) {
        setStrokes(annotations.strokes);
      } else {
        setStrokes([]);
      }

      // Reset history
      setStrokeHistory([]);
      setHistoryIndex(-1);

      // Update container size first
      updateCanvasDisplaySize();
      
      // Render first page
      await renderPage(1);
    } catch (err) {
      console.error('Failed to load song data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCanvasDisplaySize = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const newSize = { width: rect.width, height: rect.height };
      console.log('Canvas display size updated:', newSize, 'Canvas internal size:', { width: canvas.width, height: canvas.height });
      console.log('Canvas position:', { left: rect.left, top: rect.top });
      setCanvasDisplaySize(newSize);
    }
    if (container) {
      const rect = container.getBoundingClientRect();
      const newContainerSize = { width: rect.width, height: rect.height };
      console.log('Container size updated:', newContainerSize);
      setContainerSize(newContainerSize);
    }
  };

  // Debounced version of updateCanvasDisplaySize to prevent excessive updates
  const debouncedUpdateCanvasDisplaySize = useRef<NodeJS.Timeout | null>(null);
  const updateCanvasDisplaySizeDebounced = () => {
    if (debouncedUpdateCanvasDisplaySize.current) {
      clearTimeout(debouncedUpdateCanvasDisplaySize.current);
    }
    debouncedUpdateCanvasDisplaySize.current = setTimeout(() => {
      updateCanvasDisplaySize();
    }, 100);
  };

  const renderPage = async (pageNumber: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      console.log('Getting URI for song ID:', song.id);
      const uri = await fsService.getSongUri(song.id);
      console.log('Generated URI:', uri);
      await pdfService.renderPage(uri, pageNumber, canvas, viewerState.zoom, containerSize.width, containerSize.height);
      setError(null); // Clear any previous errors
      setUseFallbackViewer(false); // PDF.js worked, no need for fallback
      
      // Update canvas display size after rendering
      setTimeout(updateCanvasDisplaySize, 100);
    } catch (err) {
      console.error('Failed to render page:', err);
      
      // Check if it's a PDF structure issue or file not found
      const isPdfStructureError = err instanceof Error && (
        err.message.includes('Invalid PDF structure') ||
        err.message.includes('InvalidPDFException') ||
        err.message.includes('Failed to get song URI') ||
        err.message.includes('File does not appear to be a valid PDF') ||
        err.message.includes('Failed to fetch PDF file')
      );
      
      if (isPdfStructureError) {
        // Try fallback viewer instead of showing error
        console.log('PDF.js failed, switching to fallback viewer');
        setUseFallbackViewer(true);
        try {
          // Clean up previous blob URL if it exists
          if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
          }
          
          // Read the PDF file directly as a blob
          console.log('Reading PDF file for song ID:', song.id);
          const blob = await fsService.readSongFile(song.id);
          console.log('Read PDF blob, size:', blob.size, 'type:', blob.type);
          
          // Check if the blob is actually a PDF
          if (blob.type !== 'application/pdf' && blob.size > 0) {
            // Try to detect PDF by checking the first few bytes
            try {
              const firstBytes = await blob.slice(0, 4).text();
              if (!firstBytes.startsWith('%PDF')) {
                console.warn('File does not appear to be a valid PDF, but attempting to load anyway');
                // Don't throw error, just warn - let the fallback viewer handle it
              }
            } catch (error) {
              console.warn('Could not read file header, attempting to load anyway');
              // Don't throw error, just warn - let the fallback viewer handle it
            }
          }
          
          const blobUrl = URL.createObjectURL(blob);
          console.log('Created blob URL:', blobUrl);
          setPdfBlobUrl(blobUrl);
          setError(null);
        } catch (fallbackErr) {
          console.error('Fallback viewer also failed:', fallbackErr);
          setError('This PDF file appears to be corrupted, missing, or has an unsupported format. Please try importing a different version of this song or re-import this file.');
        }
      } else {
        setError('Failed to render PDF page. The file may be corrupted or in an unsupported format.');
      }
    }
  };

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > (song.pageCount || 1)) return;

    setViewerState(prev => ({ ...prev, currentPage: page }));
    await renderPage(page);
  };

  const handleZoomChange = async (zoom: number) => {
    setViewerState(prev => ({ ...prev, zoom }));
    await renderPage(viewerState.currentPage);
  };

  const handleStrokeComplete = async (stroke: AnnotationStroke) => {
    const newStroke = { ...stroke, page: viewerState.currentPage };
    const newStrokes = [...strokes, newStroke];
    
    setStrokes(newStrokes);
    
    // Update history
    const newHistory = strokeHistory.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setStrokeHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Save annotations
    await saveAnnotations(playlistId, song.id, newStrokes);
  };

  const handleStrokeUpdate = (_stroke: AnnotationStroke) => {
    // This is called during drawing for real-time updates
    // The actual stroke is saved in handleStrokeComplete
  };

  const handleUndo = async () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newStrokes = strokeHistory[newIndex];
      setStrokes(newStrokes);
      setHistoryIndex(newIndex);
      await saveAnnotations(playlistId, song.id, newStrokes);
    }
  };

  const handleRedo = async () => {
    if (historyIndex < strokeHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const newStrokes = strokeHistory[newIndex];
      setStrokes(newStrokes);
      setHistoryIndex(newIndex);
      await saveAnnotations(playlistId, song.id, newStrokes);
    }
  };

  const handleStrokesRemove = async (strokeIds: string[]) => {
    const newStrokes = strokes.filter(stroke => !strokeIds.includes(stroke.id));
    
    setStrokes(newStrokes);
    
    // Update history
    const newHistory = strokeHistory.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setStrokeHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Save annotations
    await saveAnnotations(playlistId, song.id, newStrokes);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onSongChange?.('prev');
    } else if (e.key === 'ArrowRight') {
      onSongChange?.('next');
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  useEffect(() => {
    if (isPerformanceMode) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPerformanceMode]);

  // Update canvas display size on window resize and canvas changes
  useEffect(() => {
    const handleResize = () => {
      updateCanvasDisplaySizeDebounced();
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to watch for container size changes (not canvas)
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    
    if (container) {
      resizeObserver = new ResizeObserver((entries) => {
        // Only update if there's a meaningful size change
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            updateCanvasDisplaySizeDebounced();
          }
        }
      });
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      // Clean up debounced timeout
      if (debouncedUpdateCanvasDisplaySize.current) {
        clearTimeout(debouncedUpdateCanvasDisplaySize.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-ios-gray">Loading PDF...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-600 dark:text-red-400 mb-4 text-4xl">❌</div>
          <div className="text-black dark:text-white mb-4 font-medium">
            Cannot Display Song
          </div>
          <div className="text-ios-gray dark:text-gray-400 mb-6 text-sm">
            {error}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                setUseFallbackViewer(true);
                loadSongData();
              }}
              className="ios-button w-full"
            >
              Try Fallback Viewer
            </button>
            <button
              onClick={() => loadSongData()}
              className="ios-button-secondary w-full"
            >
              Try Again
            </button>
            {onSongChange && (
              <button
                onClick={() => onSongChange('next')}
                className="ios-button-secondary w-full"
              >
                Next Song
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!isPerformanceMode && useFallbackViewer && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-between border-b border-ios-separator dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-ios-gray dark:text-gray-400">
              Fallback PDF Viewer
            </div>
            <div className="text-sm text-black dark:text-white">
              {song.title}
            </div>
          </div>
          <div className="text-xs text-ios-gray dark:text-gray-500">
            Some features may be limited
          </div>
        </div>
      )}

      {!isPerformanceMode && !useFallbackViewer && (
        <Toolbar
          currentPage={viewerState.currentPage}
          totalPages={song.pageCount || 1}
          zoom={viewerState.zoom}
          isDrawing={viewerState.isDrawing}
          drawingTool={viewerState.drawingTool}
          strokeColor={viewerState.strokeColor}
          strokeWidth={viewerState.strokeWidth}
          onPageChange={handlePageChange}
          onZoomChange={handleZoomChange}
          onDrawingToggle={(enabled) => 
            setViewerState(prev => ({ ...prev, isDrawing: enabled }))
          }
          onToolChange={(tool) => 
            setViewerState(prev => ({ 
              ...prev, 
              drawingTool: tool,
              isDrawing: tool === 'pen' || tool === 'highlighter' || tool === 'eraser'
            }))
          }
          onColorChange={(color) => 
            setViewerState(prev => ({ ...prev, strokeColor: color }))
          }
          onWidthChange={(width) => 
            setViewerState(prev => ({ ...prev, strokeWidth: width }))
          }
          onUndo={handleUndo}
          onRedo={handleRedo}
          onHideUI={() => {
            // TODO: Implement hide UI functionality
          }}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < strokeHistory.length - 1}
        />
      )}

      <div className="flex-1 relative overflow-hidden">
        {console.log('Render state:', { useFallbackViewer, pdfBlobUrl, error })}
        {useFallbackViewer && pdfBlobUrl ? (
          // Fallback PDF viewer using iframe with blob URL - Centered
          <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title={`PDF: ${song.title}`}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: 'none',
                  display: 'block'
                }}
              />
            </div>
            {!isPerformanceMode && (
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-ios text-sm">
                Using fallback viewer
              </div>
            )}
          </div>
        ) : useFallbackViewer && !pdfBlobUrl ? (
          // Fallback viewer is enabled but blob URL not ready yet
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-black dark:text-white mb-2">Loading PDF...</div>
              <div className="text-sm text-ios-gray dark:text-gray-400">Preparing fallback viewer</div>
            </div>
          </div>
        ) : (
          // Standard PDF.js canvas viewer - Full Screen
          <div 
            ref={containerRef}
            className="w-full h-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{
                imageRendering: 'crisp-edges',
                textRendering: 'optimizeLegibility',
                fontSmooth: 'never',
                WebkitFontSmoothing: 'none',
                MozOsxFontSmoothing: 'unset',
                display: 'block',
                margin: '0',
                padding: '0',
                border: 'none',
                outline: 'none'
              }}
            />
              
            {/* Drawing layer covering the canvas area */}
            <DrawingLayer
              width={containerSize.width}
              height={containerSize.height}
              strokes={strokes.filter(s => s.page === viewerState.currentPage)}
              isDrawing={viewerState.isDrawing}
              drawingTool={viewerState.drawingTool}
              strokeColor={viewerState.strokeColor}
              strokeWidth={viewerState.strokeWidth}
              onStrokeComplete={handleStrokeComplete}
              onStrokeUpdate={handleStrokeUpdate}
              onStrokesRemove={handleStrokesRemove}
              canvasRef={canvasRef}
            />
          </div>
        )}

        {/* Floating toolbar for performance mode */}
        {isPerformanceMode && !useFallbackViewer && (
          <FloatingToolbar
            isDrawing={viewerState.isDrawing}
            drawingTool={viewerState.drawingTool}
            strokeColor={viewerState.strokeColor}
            strokeWidth={viewerState.strokeWidth}
            onToolChange={(tool) => 
              setViewerState(prev => ({ 
                ...prev, 
                drawingTool: tool,
                isDrawing: tool === 'pen' || tool === 'highlighter' || tool === 'eraser' // Enable drawing for pen, highlighter, and eraser
              }))
            }
            onColorChange={(color) => 
              setViewerState(prev => ({ ...prev, strokeColor: color }))
            }
            onWidthChange={(width) => 
              setViewerState(prev => ({ ...prev, strokeWidth: width }))
            }
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < strokeHistory.length - 1}
            isVisible={showFloatingToolbar}
            onToggleVisibility={() => setShowFloatingToolbar(!showFloatingToolbar)}
            onHide={() => {
              // Reset drawing state when hiding toolbar
              setViewerState(prev => ({ 
                ...prev, 
                drawingTool: 'none',
                isDrawing: false
              }));
            }}
            onAutoSelectPencil={() => {
              // Auto-select pencil with user's default settings
              setViewerState(prev => ({ 
                ...prev, 
                drawingTool: 'pen',
                isDrawing: true,
                strokeColor: settings.defaultStrokeColor,
                strokeWidth: settings.defaultStrokeWidth
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
