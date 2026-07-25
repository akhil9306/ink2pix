import getStroke from "perfect-freehand";
import type { Stroke } from "./types";

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;

// Cover-crop helper to draw an image bitmap/element to fill 1024x576 exactly without stretching
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | HTMLVideoElement,
  targetWidth = CANVAS_WIDTH,
  targetHeight = CANVAS_HEIGHT
) {
  const imgWidth = (img as any).videoWidth || (img as any).naturalWidth || (img as any).width || 1024;
  const imgHeight = (img as any).videoHeight || (img as any).naturalHeight || (img as any).height || 576;

  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  ctx.drawImage(img as any, offsetX, offsetY, drawWidth, drawHeight);
}

// Convert perfect-freehand outline points to Path2D or canvas path commands
export function getStrokePath2D(strokePoints: number[][]): Path2D {
  const path = new Path2D();
  if (strokePoints.length === 0) return path;

  const [first, ...rest] = strokePoints;
  path.moveTo(first[0], first[1]);

  for (const point of rest) {
    path.lineTo(point[0], point[1]);
  }
  path.closePath();
  return path;
}

// Render all strokes onto a 2D canvas context (with optional background photo)
export function renderStrokesToCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  currentStroke: Stroke | null,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
  isExport = false,
  bgPhoto: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null = null
) {
  // Clear or background
  if (bgPhoto) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    drawCoverImage(ctx, bgPhoto, width, height);
  } else if (isExport) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

  for (const stroke of allStrokes) {
    if (stroke.points.length === 0) continue;

    ctx.save();

    if (stroke.erase) {
      if (bgPhoto) {
        // Erasing when photo is present clears stroke overlay back to original photo region
        ctx.globalCompositeOperation = "destination-out";
      } else if (isExport) {
        // When exporting sketch to white PNG, eraser paints white over drawing
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.globalCompositeOperation = "destination-out";
      }
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = stroke.color;
      ctx.strokeStyle = stroke.color;
    }

    if (stroke.points.length === 1) {
      // Single point dot
      const [x, y] = stroke.points[0];
      ctx.beginPath();
      ctx.arc(x, y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Use perfect-freehand for organic stroke widths
      try {
        const inputPoints = stroke.points.map((p) => [p[0], p[1], p[2] ?? 0.5]);
        const outlinePoints = getStroke(inputPoints, {
          size: stroke.width,
          thinning: stroke.erase ? 0 : 0.4,
          smoothing: 0.6,
          streamline: 0.5,
          simulatePressure: true,
        });

        if (outlinePoints.length > 0) {
          const path2d = getStrokePath2D(outlinePoints);
          ctx.fill(path2d);
        }
      } catch (e) {
        // Fallback standard line drawing if perfect-freehand fails
        ctx.beginPath();
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

// Export clean photo alone on 1024x576 canvas
export function exportCleanPhotoPng(
  bgPhoto: HTMLImageElement | HTMLCanvasElement | ImageBitmap
): string {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = CANVAS_WIDTH;
  exportCanvas.height = CANVAS_HEIGHT;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawCoverImage(ctx, bgPhoto, CANVAS_WIDTH, CANVAS_HEIGHT);

  return exportCanvas.toDataURL("image/png");
}

// Flatten canvas onto white background and export clean Base64 string
export function exportPng(
  sourceCanvas: HTMLCanvasElement,
  bgPhoto: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null = null
): string {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = CANVAS_WIDTH;
  exportCanvas.height = CANVAS_HEIGHT;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return "";

  if (bgPhoto) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawCoverImage(ctx, bgPhoto, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    // White background is critical for Gemini image understanding
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Draw source canvas onto the canvas
  ctx.drawImage(sourceCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Return base64 string
  return exportCanvas.toDataURL("image/png");
}
