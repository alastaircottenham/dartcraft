import { useRef, useEffect, useState } from 'react';
import type { AnnotationStroke } from '../../types';
import { generateUUID } from '../../services/uuid.service';

interface DrawingLayerProps {
  width: number;
  height: number;
  strokes: AnnotationStroke[];
  isDrawing: boolean;
  drawingTool: 'pen' | 'highlighter' | 'eraser' | 'none';
  strokeColor: string;
  strokeWidth: number;
  onStrokeComplete: (stroke: AnnotationStroke) => void;
  onStrokeUpdate: (stroke: AnnotationStroke) => void;
  onStrokesRemove: (strokeIds: string[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function DrawingLayer({
  width,
  height,
  strokes,
  isDrawing,
  drawingTool,
  strokeColor,
  strokeWidth,
  onStrokeComplete,
  onStrokeUpdate,
  onStrokesRemove,
  canvasRef
}: DrawingLayerProps) {
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingStroke, setIsDrawingStroke] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<AnnotationStroke | null>(null);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    const pdfCanvas = canvasRef.current;
    if (!canvas || !pdfCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get PDF dimensions and position from the PDF canvas
    const pdfRect = pdfCanvas.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();
    
    // Calculate PDF position relative to container
    const pdfX = pdfRect.left - containerRect.left;
    const pdfY = pdfRect.top - containerRect.top;
    const pdfWidth = pdfRect.width;
    const pdfHeight = pdfRect.height;

    // Set drawing canvas size to match the container
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes within the PDF area
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke, pdfX, pdfY, pdfWidth, pdfHeight);
    });

    // Draw current stroke if drawing
    if (currentStroke) {
      drawStroke(ctx, currentStroke, pdfX, pdfY, pdfWidth, pdfHeight);
    }
  }, [strokes, currentStroke, width, height, canvasRef]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: AnnotationStroke, pdfX: number, pdfY: number, pdfWidth: number, pdfHeight: number) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.3;
    }
    
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    
    const firstPoint = stroke.points[0];
    ctx.moveTo(pdfX + firstPoint.x * pdfWidth, pdfY + firstPoint.y * pdfHeight);
    
    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      ctx.lineTo(pdfX + point.x * pdfWidth, pdfY + point.y * pdfHeight);
    }
    
    ctx.stroke();
    ctx.restore();
  };

  const getNormalizedPoint = (e: React.PointerEvent): { x: number; y: number; t: number } => {
    const drawingCanvas = drawingCanvasRef.current;
    const pdfCanvas = canvasRef.current;
    if (!drawingCanvas || !pdfCanvas) return { x: -1, y: -1, t: Date.now() };

    const drawingRect = drawingCanvas.getBoundingClientRect();
    const pdfRect = pdfCanvas.getBoundingClientRect();
    
    // Calculate PDF position relative to drawing canvas
    const pdfX = pdfRect.left - drawingRect.left;
    const pdfY = pdfRect.top - drawingRect.top;
    
    // Check if the click is within the PDF area
    const relativeX = e.clientX - drawingRect.left;
    const relativeY = e.clientY - drawingRect.top;
    
    if (relativeX < pdfX || relativeX > pdfX + pdfRect.width ||
        relativeY < pdfY || relativeY > pdfY + pdfRect.height) {
      // Click is outside PDF area, return invalid point
      return { x: -1, y: -1, t: Date.now() };
    }
    
    // Convert to normalized coordinates relative to PDF (0-1)
    return {
      x: (relativeX - pdfX) / pdfRect.width,
      y: (relativeY - pdfY) / pdfRect.height,
      t: Date.now()
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDrawing || drawingTool === 'eraser' || drawingTool === 'none') return;

    e.preventDefault();
    const point = getNormalizedPoint(e);
    
    // Only start drawing if the point is within the PDF area
    if (point.x < 0 || point.y < 0) return;
    
    setIsDrawingStroke(true);

    const stroke: AnnotationStroke = {
      id: generateUUID(),
      page: 1, // This will be set by parent component
      points: [point],
      width: strokeWidth,
      color: strokeColor,
      tool: drawingTool
    };

    setCurrentStroke(stroke);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingStroke || !currentStroke) return;

    e.preventDefault();
    const point = getNormalizedPoint(e);
    
    // Only add points that are within the PDF area
    if (point.x >= 0 && point.y >= 0) {
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, point]
      };

      setCurrentStroke(updatedStroke);
      onStrokeUpdate(updatedStroke);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawingStroke || !currentStroke) return;

    e.preventDefault();
    setIsDrawingStroke(false);
    
    if (currentStroke.points.length > 1) {
      onStrokeComplete(currentStroke);
    }
    
    setCurrentStroke(null);
  };

  const handleEraserDown = (e: React.PointerEvent) => {
    if (drawingTool !== 'eraser') return;

    e.preventDefault();
    setIsErasing(true);
    handleEraserMove(e);
  };

  const handleEraserMove = (e: React.PointerEvent) => {
    if (drawingTool !== 'eraser' || !isErasing) return;

    e.preventDefault();
    const point = getNormalizedPoint(e);
    
    // Only erase if the point is within the PDF area
    if (point.x < 0 || point.y < 0) {
      console.log('Eraser point outside PDF area:', point);
      return;
    }
    
    // Calculate eraser radius based on stroke width (make it larger for easier erasing)
    const eraserRadius = Math.max((strokeWidth / 100) * 0.15, 0.02); // Scale based on normalized coordinates, minimum 0.02
    
    console.log('Eraser at point:', point, 'radius:', eraserRadius, 'total strokes:', strokes.length);
    
    // Find strokes that intersect with the eraser point
    const strokesToRemove = strokes.filter(stroke => {
      return stroke.points.some(p => {
        const distance = Math.sqrt(
          Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
        );
        return distance < eraserRadius;
      });
    });

    // Remove intersecting strokes
    if (strokesToRemove.length > 0) {
      const strokeIds = strokesToRemove.map(stroke => stroke.id);
      console.log('Erasing strokes:', strokeIds);
      onStrokesRemove(strokeIds);
    } else {
      console.log('No strokes found to erase');
    }
  };

  const handleEraserUp = (e: React.PointerEvent) => {
    if (drawingTool !== 'eraser') return;

    e.preventDefault();
    setIsErasing(false);
  };

  return (
    <canvas
      ref={drawingCanvasRef}
      width={width}
      height={height}
      className="absolute inset-0 touch-none"
      style={{ 
        pointerEvents: (isDrawing || drawingTool === 'eraser') ? 'auto' : 'none',
        cursor: drawingTool === 'eraser' ? 'crosshair' : 'default'
      }}
      onPointerDown={drawingTool === 'eraser' ? handleEraserDown : handlePointerDown}
      onPointerMove={drawingTool === 'eraser' ? handleEraserMove : handlePointerMove}
      onPointerUp={drawingTool === 'eraser' ? handleEraserUp : handlePointerUp}
    />
  );
}
