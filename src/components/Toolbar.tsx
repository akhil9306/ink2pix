import React from "react";
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Download,
  Upload,
  Palette,
  Minus,
  Plus,
  Camera,
  ImageOff,
  Crosshair
} from "lucide-react";

interface ToolbarProps {
  tool: "brush" | "eraser";
  setTool: (tool: "brush" | "eraser") => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onLoadTemplate: () => void;
  onImportImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportSketch: () => void;
  hasPhoto?: boolean;
  onRemovePhoto?: () => void;
  onOpenCameraModal?: () => void;
}

const PRESET_COLORS = [
  "#18181b", // Black
  "#ff007f", // Bright Magenta (Section 9 Region Marker)
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#a1a1aa", // Grey
  "#ffffff"  // White
];

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onLoadTemplate,
  onImportImage,
  onExportSketch,
  hasPhoto = false,
  onRemovePhoto,
  onOpenCameraModal,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-neutral-200/80 shadow-xs">
      {/* Primary Tool Buttons */}
      <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setTool("brush")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tool === "brush"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Pen</span>
        </button>

        <button
          type="button"
          onClick={() => setTool("eraser")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tool === "eraser"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
          }`}
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Eraser</span>
        </button>

        {/* Region Marker Shortcut (Phase 2 Section 9) */}
        {hasPhoto && (
          <button
            type="button"
            onClick={() => {
              setTool("brush");
              setColor("#ff007f");
              setStrokeWidth(16);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              color === "#ff007f" && tool === "brush"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-pink-50 text-pink-700 hover:bg-pink-100"
            }`}
            title="Switch to Region Marker Brush (#ff007f magenta)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Region Brush</span>
          </button>
        )}
      </div>

      {/* Color Swatches */}
      {tool === "brush" && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[280px] sm:max-w-none">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border border-black/10 transition-transform flex items-center justify-center ${
                color === c ? "scale-110 ring-2 ring-indigo-500 ring-offset-1" : "hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              title={c === "#ff007f" ? "Magenta (Region Mark)" : c}
            />
          ))}

          {/* Custom Color Input */}
          <label className="relative cursor-pointer w-6 h-6 rounded-full border border-black/10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
            <Palette className="w-3 h-3 text-white drop-shadow-xs" />
          </label>
        </div>
      )}

      {/* Brush Size Slider */}
      <div className="flex items-center gap-2.5 bg-neutral-100/80 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-700">
        <span className="text-neutral-500">Size</span>
        <button
          type="button"
          onClick={() => setStrokeWidth(Math.max(2, strokeWidth - 2))}
          className="p-1 hover:bg-white rounded text-neutral-600"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="range"
          min="2"
          max="40"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-20 accent-indigo-600 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setStrokeWidth(Math.min(40, strokeWidth + 2))}
          className="p-1 hover:bg-white rounded text-neutral-600"
        >
          <Plus className="w-3 h-3" />
        </button>
        <span className="w-5 text-right font-semibold text-neutral-900">{strokeWidth}px</span>
        {/* Visual size dot */}
        <div className="w-6 h-6 flex items-center justify-center bg-white rounded-md border border-neutral-200">
          <div
            className="rounded-full bg-neutral-800 transition-all"
            style={{ width: `${Math.min(20, strokeWidth)}px`, height: `${Math.min(20, strokeWidth)}px` }}
          />
        </div>
      </div>

      {/* Drawing Actions & Camera Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 rounded-lg transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 rounded-lg transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-200 mx-1" />

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Clear drawing strokes"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {hasPhoto ? (
          <button
            type="button"
            onClick={onRemovePhoto}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Remove Photo Background"
          >
            <ImageOff className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Remove Photo</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoadTemplate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Load sample drawing template"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Starters</span>
          </button>
        )}

        {/* Camera Live Capture Button */}
        {onOpenCameraModal ? (
          <button
            type="button"
            onClick={onOpenCameraModal}
            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
            title="Open camera viewfinder"
          >
            <Camera className="w-4 h-4" />
          </button>
        ) : (
          <label
            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
            title="Capture photo with camera"
          >
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onImportImage}
              className="hidden"
            />
          </label>
        )}

        {/* Standard Photo / File Upload */}
        <label
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
          title="Upload photo / sketch file"
        >
          <Upload className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={onImportImage}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={onExportSketch}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Download sketch PNG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
