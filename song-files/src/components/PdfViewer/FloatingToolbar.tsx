import { useState } from 'react';

interface FloatingToolbarProps {
  isDrawing: boolean;
  drawingTool: 'pen' | 'highlighter' | 'eraser' | 'none';
  strokeColor: string;
  strokeWidth: number;
  onToolChange: (tool: 'pen' | 'highlighter' | 'eraser' | 'none') => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onHide: () => void;
  onAutoSelectPencil: () => void;
}

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Orange', value: '#FFA500' }
];

const strokeWidths = [
  { size: 2, label: 'Thin' },
  { size: 4, label: 'Medium' },
  { size: 6, label: 'Thick' },
  { size: 8, label: 'Extra Thick' },
  { size: 12, label: 'Very Thick' }
];

export default function FloatingToolbar({
  isDrawing,
  drawingTool,
  strokeColor,
  strokeWidth,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isVisible,
  onToggleVisibility,
  onHide,
  onAutoSelectPencil
}: FloatingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            // If no tool is selected, auto-select pencil with default settings when opening
            if (drawingTool === 'none') {
              onAutoSelectPencil();
            }
            onToggleVisibility();
          }}
          className={`backdrop-blur-sm rounded-full p-4 shadow-lg transition-colors border relative ${
            drawingTool !== 'none' 
              ? 'bg-red-500/95 text-white hover:bg-red-600/95 border-red-300' 
              : 'bg-white/95 hover:bg-white border-gray-200'
          }`}
          title={drawingTool !== 'none' ? "Drawing Active - Click to Close" : "Show Drawing Tools"}
        >
          <span className="text-2xl">✏️</span>
          {drawingTool !== 'none' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
          )}
        </button>
      </div>
    );
  }

  const currentColor = colors.find(c => c.value === strokeColor) || colors[0];
  const currentWidth = strokeWidths.find(w => w.size === strokeWidth) || strokeWidths[1];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2">
        <div className="flex items-center space-x-1">
          {/* Hide button */}
          <button
            onClick={() => {
              onHide(); // Reset drawing state
              onToggleVisibility(); // Hide toolbar
            }}
            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
            title="Hide Tools"
          >
            <span className="text-lg">✕</span>
          </button>

          {/* Quick toggle for drawing mode */}
          <button
            onClick={() => onToolChange(drawingTool === 'none' ? 'pen' : 'none')}
            className={`p-3 rounded-xl transition-all ${
              drawingTool !== 'none' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={drawingTool === 'none' ? "Start Drawing" : "Stop Drawing"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>

          {/* Tool selection */}
          {drawingTool !== 'none' && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => onToolChange('pen')}
                className={`p-2 rounded-lg transition-all ${
                  drawingTool === 'pen' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
                title="Pen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
            
            <button
              onClick={() => onToolChange('highlighter')}
              className={`p-2 rounded-lg transition-all ${
                drawingTool === 'highlighter' 
                  ? 'bg-white shadow-sm text-yellow-600' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Highlighter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            
            <button
              onClick={() => onToolChange('eraser')}
              className={`p-2 rounded-lg transition-all ${
                drawingTool === 'eraser' 
                  ? 'bg-white shadow-sm text-red-600' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Eraser"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36z"/>
              </svg>
            </button>
            </div>
          )}

          {/* Color picker */}
          {drawingTool !== 'none' && (
            <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              title={`Color: ${currentColor.name}`}
            >
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: currentColor.value }}
              />
              <span className="text-sm text-gray-600">▼</span>
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        onColorChange(color.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        strokeColor === color.value 
                          ? 'border-gray-400 shadow-md' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Stroke width picker */}
          {drawingTool !== 'none' && (
            <div className="relative">
            <button
              onClick={() => setShowWidthPicker(!showWidthPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              title={`Width: ${currentWidth.label}`}
            >
              <div className="flex items-center space-x-1">
                <div 
                  className="bg-gray-600 rounded-full"
                  style={{ 
                    width: `${currentWidth.size * 2}px`, 
                    height: `${currentWidth.size}px` 
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">▼</span>
            </button>
            
            {showWidthPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                <div className="space-y-2">
                  {strokeWidths.map(width => (
                    <button
                      key={width.size}
                      onClick={() => {
                        onWidthChange(width.size);
                        setShowWidthPicker(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left transition-colors flex items-center space-x-3 ${
                        strokeWidth === width.size 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="bg-gray-600 rounded-full"
                        style={{ 
                          width: `${width.size * 2}px`, 
                          height: `${width.size}px` 
                        }}
                      />
                      <span className="text-sm">{width.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Undo/Redo */}
          {drawingTool !== 'none' && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-gray-600 hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
              </svg>
            </button>
            
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-gray-600 hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
              </svg>
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
