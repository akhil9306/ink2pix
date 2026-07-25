import React, { useRef, useEffect, useCallback } from "react";
import type { Stroke, Point } from "../types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, renderStrokesToCanvas } from "../canvas";

interface CanvasProps {
  strokes: Stroke[];
  onAddStroke: (stroke: Stroke) => void;
  tool: "brush" | "eraser";
  color: string;
  strokeWidth: number;
  bgPhoto?: HTMLImageElement | null;
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  strokes,
  onAddStroke,
  tool,
  color,
  strokeWidth,
  bgPhoto = null,
  onCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const currentStroke = useRef<Stroke | null>(null);

  // Expose canvas element to parent
  useEffect(() => {
    if (onCanvasRef) {
      onCanvasRef(canvasRef.current);
    }
  }, [onCanvasRef]);

  // Redraw canvas whenever strokes list or bgPhoto changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderStrokesToCanvas(
      ctx,
      strokes,
      currentStroke.current,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      false,
      bgPhoto
    );
  }, [strokes, bgPhoto]);

  // Setup HiDPI Canvas resolution once mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redraw();
  }, [redraw]);

  // Handle pointer coordinate mapping from screen CSS pixels to 1024x576 internal canvas pixels
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    return [x, y, pressure];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;

    const point = getCanvasCoords(e);
    currentStroke.current = {
      id: "stroke_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      points: [point],
      color,
      width: strokeWidth,
      erase: tool === "eraser",
    };

    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();

    const point = getCanvasCoords(e);
    currentStroke.current.points.push(point);
    redraw();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    isDrawing.current = false;

    if (currentStroke.current.points.length > 0) {
      onAddStroke(currentStroke.current);
    }

    currentStroke.current = null;
    redraw();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    currentStroke.current = null;
    redraw();
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-white rounded-2xl border border-neutral-200/80 shadow-inner overflow-hidden select-none touch-none group">
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="w-full h-full block cursor-crosshair touch-none"
        style={{
          aspectRatio: "16/9",
        }}
      />

      {/* Photo Mode Overlay Badge */}
      {bgPhoto && (
        <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Camera Photo Background Active</span>
        </div>
      )}

      {/* Grid watermark / instruction hint */}
      {strokes.length === 0 && !bgPhoto && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-700">Draw your sketch here</p>
          <p className="text-xs text-neutral-500 max-w-xs">
            Use the pen, add labels directly on canvas, or upload/capture a photo background to edit regions.
          </p>
        </div>
      )}

      {/* Canvas Resolution Indicator */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-neutral-400 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-neutral-200">
        1024 × 576 (16:9)
      </div>
    </div>
  );
};
