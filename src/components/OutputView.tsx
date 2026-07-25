import React, { useState } from "react";
import { Download, Maximize2, Copy, Check, Sparkles, Image as ImageIcon, Film, Play, Volume2 } from "lucide-react";
import type { GenerationResult } from "../types";

interface OutputViewProps {
  result: GenerationResult | null;
  isGenerating: boolean;
  isGeneratingVideo?: boolean;
  sketchPng: string;
  onRegenerate: () => void;
  history: GenerationResult[];
  onSelectHistory: (item: GenerationResult) => void;
  onUpdateResultVideo?: (videoUrl: string) => void;
}

export const OutputView: React.FC<OutputViewProps> = ({
  result,
  isGenerating,
  isGeneratingVideo = false,
  sketchPng,
  onRegenerate,
  history,
  onSelectHistory,
  onUpdateResultVideo,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"image" | "video" | "slider">("image");

  const handleDownloadImage = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.image;
    a.download = `ink2pix-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadVideo = () => {
    if (!result?.videoUrl) return;
    const a = document.createElement("a");
    a.href = result.videoUrl;
    a.download = `ink2pix-animation-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.image);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-md rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 border-b border-neutral-200/80 bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-neutral-800">Generated Output</h3>
          {result && (
            <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              {result.modelName}
            </span>
          )}
          {result?.videoUrl && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200 flex items-center gap-1">
              <Film className="w-3 h-3" />
              <span>Video Ready</span>
            </span>
          )}
        </div>

        {/* Action icons */}
        {result && (
          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-200/60 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("image")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  viewMode === "image" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-600"
                }`}
              >
                Still
              </button>

              {result.videoUrl && (
                <button
                  type="button"
                  onClick={() => setViewMode("video")}
                  className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    viewMode === "video" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-neutral-600"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Video</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewMode("slider")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  viewMode === "slider" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-600"
                }`}
              >
                Compare
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors"
              title="Copy base64 image string"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={viewMode === "video" && result.videoUrl ? handleDownloadVideo : handleDownloadImage}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors"
              title="Download asset"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors"
              title="Fullscreen preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="relative flex-1 min-h-[300px] w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
        {isGenerating ? (
          /* Loading Animation State */
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Rendering with Gemini</p>
              <p className="text-xs text-neutral-400">Analyzing sketch geometry & applying textures...</p>
            </div>
          </div>
        ) : isGeneratingVideo ? (
          /* Video Animation Loading State */
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-amber-500 border-l-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Animating Video with Gemini Omni Flash</p>
              <p className="text-xs text-purple-300 font-mono">Generating realistic motion & synced audio (~20-40s)...</p>
            </div>
          </div>
        ) : result ? (
          /* Rendered Image / Video View */
          viewMode === "video" && result.videoUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                src={result.videoUrl}
                controls
                autoPlay
                loop
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                <Film className="w-3 h-3 text-purple-400" />
                <span>Gemini Omni Video</span>
                <Volume2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          ) : viewMode === "image" ? (
            <img
              src={result.image}
              alt="Gemini generated output"
              className="w-full h-full object-contain"
            />
          ) : (
            /* Interactive Before/After Compare Slider */
            <div
              className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setSliderPos(Math.max(0, Math.min(100, pos)));
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                  setSliderPos(Math.max(0, Math.min(100, pos)));
                }
              }}
            >
              {/* Generated Result (Base) */}
              <img
                src={result.image}
                alt="Generated"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Raw Sketch Layer (Clipped) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden bg-white/95"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={result.sketchPng || sketchPng}
                  alt="Raw Sketch"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  Original Sketch
                </span>
              </div>

              <span className="absolute top-2 right-2 text-[10px] font-bold bg-indigo-600/90 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                Gemini Output
              </span>

              {/* Divider Handle */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-7 h-7 bg-white text-neutral-800 rounded-full shadow-md flex items-center justify-center text-xs font-bold border border-neutral-300">
                  ↔
                </div>
              </div>
            </div>
          )
        ) : (
          /* Empty Placeholder State */
          <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">No output generated yet</p>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Draw on the canvas and hit 'Generate Image' to see Gemini turn your drawing into a high resolution piece.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* History Thumbnail Bar */}
      {history.length > 0 && (
        <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/50 space-y-1.5">
          <p className="text-xs font-semibold text-neutral-500">Recent Generations ({history.length})</p>
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {history.map((item) => (
              <button
                key={item.timestamp}
                type="button"
                onClick={() => {
                  onSelectHistory(item);
                  if (item.videoUrl) setViewMode("video");
                  else setViewMode("image");
                }}
                className={`relative group shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  result?.timestamp === item.timestamp
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.prompt || "History thumb"}
                  className="w-full h-full object-cover"
                />
                {item.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && result && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-neutral-300 p-2 text-xl font-bold bg-white/10 rounded-full cursor-pointer"
          >
            ✕
          </button>
          {viewMode === "video" && result.videoUrl ? (
            <video
              src={result.videoUrl}
              controls
              autoPlay
              loop
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <img
              src={result.image}
              alt="Fullscreen output"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={viewMode === "video" && result.videoUrl ? handleDownloadVideo : handleDownloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {viewMode === "video" ? "Video MP4" : "Image PNG"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
