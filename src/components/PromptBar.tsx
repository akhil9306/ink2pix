import React, { useState } from "react";
import { Sparkles, Zap, Cpu, Palette, Wand2, Link2, Link2Off, Film } from "lucide-react";
import type { ModelKey, StylePreset } from "../types";

export interface VideoParams {
  duration: "3s" | "5s" | "10s";
  aspectRatio: "16:9" | "9:16" | "1:1";
  motionStyle: "cinematic" | "zoom-in" | "pan-right" | "orbit" | "timelapse" | "action";
}

interface PromptBarProps {
  prompt: string;
  setPrompt: (p: string) => void;
  model: ModelKey;
  setModel: (m: ModelKey) => void;
  stylePreset: StylePreset;
  setStylePreset: (s: StylePreset) => void;
  onGenerate: () => void;
  onGenerateVideo?: (params?: VideoParams) => void;
  isGenerating: boolean;
  isGeneratingVideo?: boolean;
  hasStrokes: boolean;
  hasResultImage?: boolean;
  hasContext?: boolean;
  onClearContext?: () => void;
}

const STYLE_PRESETS: { id: StylePreset; label: string; icon: string }[] = [
  { id: "none", label: "Default", icon: "✨" },
  { id: "photorealistic", label: "Photorealistic", icon: "📷" },
  { id: "concept-art", label: "Concept Art", icon: "🎨" },
  { id: "watercolor", label: "Watercolor", icon: "🖌️" },
  { id: "anime", label: "Anime / Manga", icon: "🌸" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "🌃" },
  { id: "3d-render", label: "3D Render", icon: "🧊" },
  { id: "blueprint", label: "Blueprint", icon: "📐" },
  { id: "oil-painting", label: "Oil Painting", icon: "🖼️" },
  { id: "pixel-art", label: "Pixel Art", icon: "👾" },
];

const INSPIRATION_PROMPTS = [
  "A cozy cottage near a foggy pine forest at sunrise",
  "Futuristic hovercar racing through neon skyscraper canyons",
  "Cute mechanical owl perched on a glowing crystal branch",
  "Epic fantasy castle on a floating island above clouds",
  "Vibrant underwater coral reef with bioluminescent jellyfish",
];

export const PromptBar: React.FC<PromptBarProps> = ({
  prompt,
  setPrompt,
  model,
  setModel,
  stylePreset,
  setStylePreset,
  onGenerate,
  onGenerateVideo,
  isGenerating,
  isGeneratingVideo = false,
  hasStrokes,
  hasResultImage = false,
  hasContext = false,
  onClearContext,
}) => {
  const [showStyles, setShowStyles] = useState(false);

  // Video Parameters State
  const [videoDuration, setVideoDuration] = useState<"3s" | "5s" | "10s">("5s");
  const [videoAspect, setVideoAspect] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [videoMotion, setVideoMotion] = useState<"cinematic" | "zoom-in" | "pan-right" | "orbit" | "timelapse" | "action">("cinematic");

  return (
    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
      {/* Context Active Banner */}
      {hasContext && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-indigo-50/90 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
            </span>
            <Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong className="font-semibold text-indigo-900">Context Chain Active:</strong> The model maintains context from your previous generation for conversational edits (e.g. "make sky orange").
            </span>
          </div>

          {onClearContext && (
            <button
              type="button"
              onClick={onClearContext}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-indigo-200 hover:border-rose-300 rounded-lg font-bold text-xs transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Disconnect context thread for a fresh generation"
            >
              <Link2Off className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset Context</span>
            </button>
          )}
        </div>
      )}

      {/* Upper Row: Model Selector & Video Dropdowns & Preset Styles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Model Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setModel("draft")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              model === "draft"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Draft · fast (~5s)</span>
          </button>

          <button
            type="button"
            onClick={() => setModel("final")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              model === "final"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Final · 2K (~15s)</span>
          </button>

          <button
            type="button"
            onClick={() => setModel("fast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              model === "fast"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lite (~3s)</span>
          </button>
        </div>

        {/* Video Dropdowns Toolbar & Style Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Video Options Group */}
          <div className="flex items-center gap-1.5 bg-purple-50/90 border border-purple-200/90 p-1 rounded-xl text-xs">
            <span className="flex items-center gap-1 font-bold text-purple-900 px-2 py-0.5">
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Omni Video</span>
            </span>

            {/* Video Duration Dropdown */}
            <select
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value as any)}
              className="bg-white text-purple-900 font-semibold px-2 py-1 rounded-lg border border-purple-200 outline-none cursor-pointer hover:bg-purple-50 transition-colors"
              title="Select video clip duration"
            >
              <option value="3s">3s clip</option>
              <option value="5s">5s clip</option>
              <option value="10s">10s clip</option>
            </select>

            {/* Video Aspect Ratio Dropdown */}
            <select
              value={videoAspect}
              onChange={(e) => setVideoAspect(e.target.value as any)}
              className="bg-white text-purple-900 font-semibold px-2 py-1 rounded-lg border border-purple-200 outline-none cursor-pointer hover:bg-purple-50 transition-colors"
              title="Select video aspect ratio"
            >
              <option value="16:9">16:9 Wide</option>
              <option value="9:16">9:16 Tall</option>
              <option value="1:1">1:1 Square</option>
            </select>

            {/* Camera Motion Style Dropdown */}
            <select
              value={videoMotion}
              onChange={(e) => setVideoMotion(e.target.value as any)}
              className="bg-white text-purple-900 font-semibold px-2 py-1 rounded-lg border border-purple-200 outline-none cursor-pointer hover:bg-purple-50 transition-colors hidden md:block"
              title="Select camera motion style"
            >
              <option value="cinematic">Cinematic Motion</option>
              <option value="zoom-in">Slow Zoom In</option>
              <option value="pan-right">Pan Right</option>
              <option value="orbit">3D Orbit</option>
              <option value="timelapse">Timelapse</option>
              <option value="action">Dynamic Action</option>
            </select>
          </div>

          {/* Style Selector Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStyles(!showStyles)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl text-xs font-semibold text-neutral-700 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Style: {STYLE_PRESETS.find((s) => s.id === stylePreset)?.label}</span>
            </button>

            {showStyles && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl p-2 z-30 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-bottom-2">
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStylePreset(s.id);
                      setShowStyles(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      stylePreset === s.id
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "hover:bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Input & Generate Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating && (hasStrokes || prompt.trim())) {
                onGenerate();
              }
            }}
            placeholder="Describe what your sketch should become (e.g. 'A futuristic city at sunset')..."
            className="w-full pl-4 pr-10 py-3 bg-neutral-100/80 focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Generate Image Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || isGeneratingVideo || (!hasStrokes && !prompt.trim())}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer whitespace-nowrap active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Transforming...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {/* Animate Video Button */}
          {onGenerateVideo && (
            <button
              type="button"
              onClick={() =>
                onGenerateVideo({
                  duration: videoDuration,
                  aspectRatio: videoAspect,
                  motionStyle: videoMotion,
                })
              }
              disabled={isGenerating || isGeneratingVideo || (!hasStrokes && !prompt.trim() && !hasResultImage)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-800 hover:from-purple-600 hover:to-slate-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer whitespace-nowrap active:scale-[0.99]"
              title={`Animate video with Gemini Omni Flash (${videoDuration}, ${videoAspect}, ${videoMotion})`}
            >
              {isGeneratingVideo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Animating Video...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-purple-300" />
                  <span>Animate Video</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompt Ideas */}
      {!prompt && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs text-neutral-500">
          <span className="font-semibold text-neutral-400 whitespace-nowrap">Ideas:</span>
          {INSPIRATION_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(p)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg text-neutral-600 transition-colors whitespace-nowrap shrink-0"
            >
              "{p}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
