import { useState } from 'react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isDrawing: boolean;
  drawingTool: 'pen' | 'highlighter' | 'eraser' | 'none';
  strokeColor: string;
  strokeWidth: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onDrawingToggle: (enabled: boolean) => void;
  onToolChange: (tool: 'pen' | 'highlighter' | 'eraser' | 'none') => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onHideUI: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
];

const strokeWidths = [2, 4, 6, 8, 12];

export default function Toolbar({
  currentPage,
  totalPages,
  zoom,
  isDrawing,
  drawingTool,
  strokeColor,
  strokeWidth,
  onPageChange,
  onZoomChange,
  onDrawingToggle,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onHideUI,
  canUndo,
  canRedo
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-ios-separator dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            ←
          </button>
          
          <span className="text-sm text-black dark:text-white min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            →
          </button>
        </div>

        {/* Center - Drawing tools */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDrawingToggle(!isDrawing)}
            className={`p-2 rounded-ios ${
              isDrawing 
                ? 'bg-ios-blue text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ✏️
          </button>

          {isDrawing && (
            <>
              <button
                onClick={() => onToolChange('pen')}
                className={`p-2 rounded-ios ${
                  drawingTool === 'pen' 
                    ? 'bg-ios-blue text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                ✏️
              </button>
              
              <button
                onClick={() => onToolChange('highlighter')}
                className={`p-2 rounded-ios ${
                  drawingTool === 'highlighter' 
                    ? 'bg-ios-blue text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🖍️
              </button>
              
              <button
                onClick={() => onToolChange('eraser')}
                className={`p-2 rounded-ios ${
                  drawingTool === 'eraser' 
                    ? 'bg-ios-blue text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🧹
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ backgroundColor: strokeColor }}
                >
                  🎨
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-ios shadow-ios-lg border border-ios-separator dark:border-gray-700 p-2 z-10">
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            onColorChange(color);
                            setShowColorPicker(false);
                          }}
                          className="w-8 h-8 rounded-ios border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowWidthPicker(!showWidthPicker)}
                  className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  📏
                </button>
                
                {showWidthPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-ios shadow-ios-lg border border-ios-separator dark:border-gray-700 p-2 z-10">
                    <div className="space-y-2">
                      {strokeWidths.map(width => (
                        <button
                          key={width}
                          onClick={() => {
                            onWidthChange(width);
                            setShowWidthPicker(false);
                          }}
                          className={`w-full p-2 rounded-ios text-left ${
                            strokeWidth === width 
                              ? 'bg-ios-blue text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div 
                            className="bg-black dark:bg-white rounded-full"
                            style={{ height: `${width}px` }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                ↶
              </button>
              
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                ↷
              </button>
            </>
          )}
        </div>

        {/* Right side - Zoom and hide */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            🔍-
          </button>
          
          <span className="text-sm text-black dark:text-white min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
            className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            🔍+
          </button>
          
          <button
            onClick={onHideUI}
            className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            👁️
          </button>
        </div>
      </div>
    </div>
  );
}

