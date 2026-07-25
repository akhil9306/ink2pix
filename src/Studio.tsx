import React, { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import type { Stroke, ModelKey, StylePreset, GenerationResult, PresetTemplate } from "./types";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { PromptBar } from "./components/PromptBar";
import { OutputView } from "./components/OutputView";
import { CameraModal } from "./components/CameraModal";
import { exportPng, exportCleanPhotoPng } from "./canvas";
import { STARTER_TEMPLATES } from "./data/templates";

export const Studio: React.FC = () => {
  // Canvas drawing state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState<string>("#18181b");
  const [strokeWidth, setStrokeWidth] = useState<number>(8);
  const [bgPhoto, setBgPhoto] = useState<HTMLImageElement | null>(null);
  const canvasRefObj = useRef<HTMLCanvasElement | null>(null);

  // Generation state
  const [prompt, setPrompt] = useState<string>("");
  const [model, setModel] = useState<ModelKey>("draft");
  const [stylePreset, setStylePreset] = useState<StylePreset>("none");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [lastInteractionId, setLastInteractionId] = useState<string | null>(null);

  // Model switch helper (clears context chain - Section 8)
  const handleModelChange = (newModel: ModelKey) => {
    setModel(newModel);
    setLastInteractionId(null);
  };

  // Undo / Redo handlers
  const handleAddStroke = useCallback((stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setRedoStack([]); // Clear redo stack on new stroke
  }, []);

  const handleUndo = useCallback(() => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [...prev, [last]]);
    setStrokes((prev) => prev.slice(0, -1));
  }, [strokes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextStrokes = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, ...nextStrokes]);
  }, [redoStack]);

  const handleClear = useCallback(() => {
    if (strokes.length === 0) return;
    setRedoStack((prev) => [...prev, strokes]);
    setStrokes([]);
  }, [strokes]);

  const handleRemovePhoto = useCallback(() => {
    setBgPhoto(null);
  }, []);

  // Load sample starter sketch
  const handleLoadTemplate = (template: PresetTemplate) => {
    setStrokes(template.strokes);
    if (template.defaultPrompt) {
      setPrompt(template.defaultPrompt);
    }
    setShowTemplatesModal(false);
  };

  // Import photo file / camera capture onto canvas background (Phase 2 Section 9)
  const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBgPhoto(img);
        setTool("brush");
        setColor("#ff007f"); // Switch to region marker brush color automatically
        setStrokeWidth(16);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Export current sketch PNG
  const handleExportSketch = () => {
    const canvasElement = canvasRefObj.current || document.querySelector("canvas");
    if (!canvasElement) return;

    const base64Png = exportPng(canvasElement, bgPhoto);
    const a = document.createElement("a");
    a.href = base64Png;
    a.download = `sketch-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate image API call
  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    const canvasElement = canvasRefObj.current || document.querySelector("canvas");
    if (!canvasElement) {
      setError("Canvas element not found.");
      setIsGenerating(false);
      return;
    }

    try {
      let payload: any = {};
      let previewSketchPng = "";

      if (bgPhoto) {
        // Mode = place (Photo Inpainting / Camera Mode - Section 9)
        const cleanPhotoB64 = exportCleanPhotoPng(bgPhoto);
        const annotatedPhotoB64 = exportPng(canvasElement, bgPhoto);
        previewSketchPng = annotatedPhotoB64;

        payload = {
          mode: "place",
          cleanImage: cleanPhotoB64,
          annotatedImage: annotatedPhotoB64,
          prompt,
          markColor: "magenta",
          model,
          stylePreset,
          previousId: lastInteractionId,
        };
      } else {
        // Mode = create (Standard Sketch to Image - Section 7)
        const sketchBase64 = exportPng(canvasElement, null);
        previewSketchPng = sketchBase64;

        payload = {
          mode: "create",
          image: sketchBase64,
          prompt,
          model,
          stylePreset,
          previousId: lastInteractionId,
        };
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      if (data.interactionId) {
        setLastInteractionId(data.interactionId);
      }

      const newResult: GenerationResult = {
        image: data.image,
        text: data.text,
        model: data.model,
        modelName: data.modelName || model,
        timestamp: Date.now(),
        prompt,
        stylePreset,
        sketchPng: previewSketchPng,
        interactionId: data.interactionId,
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err?.message || "An unexpected error occurred during image generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Video Animation handler triggered from PromptBar or OutputView (Section 10)
  const handleAnimateVideo = async (params?: { duration?: string; aspectRatio?: string; motionStyle?: string }) => {
    const canvasElement = canvasRefObj.current || document.querySelector("canvas");
    const currentSketchPng = canvasElement ? exportPng(canvasElement, bgPhoto) : "";
    const sourceImage = result ? result.image : currentSketchPng;

    if (!sourceImage) {
      setError("Please draw on the canvas or generate an image first.");
      return;
    }

    setError(null);
    setIsGeneratingVideo(true);

    const promptText = prompt.trim() || result?.prompt || "Bring this sketch to life with realistic motion and ambient audio";

    try {
      const res = await fetch("/api/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: sourceImage,
          prompt: promptText,
          duration: params?.duration || "5s",
          aspectRatio: params?.aspectRatio || "16:9",
          motionStyle: params?.motionStyle || "cinematic",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Video animation failed.");
      }

      if (data.videoUrl) {
        if (result) {
          const updated = { ...result, videoUrl: data.videoUrl };
          setResult(updated);
          setHistory((prev) =>
            prev.map((item) => (item.timestamp === result.timestamp ? updated : item))
          );
        } else {
          // Construct a new result item if no prior image result existed
          const newResult: GenerationResult = {
            image: sourceImage,
            videoUrl: data.videoUrl,
            text: data.text || "Video animation completed",
            model: "gemini-omni-flash-preview",
            modelName: "Gemini Omni Video",
            timestamp: Date.now(),
            prompt: promptText,
            stylePreset,
            sketchPng: currentSketchPng,
          };
          setResult(newResult);
          setHistory((prev) => [newResult, ...prev]);
        }
      }
    } catch (err: any) {
      console.error("Video animation error:", err);
      setError(err?.message || "An error occurred while generating the video animation.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Studio Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              i2p
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              ink2pix Studio
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sample Sketches</span>
          </button>
        </div>
      </header>

      {/* Main Studio Grid Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-4">
        {/* Error Notification Banner */}
        {error && (
          <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Studio Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Canvas & Sketch Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Drawing Canvas</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  {strokes.length} strokes {bgPhoto ? "• photo active" : ""}
                </span>
              </h2>
            </div>

            <Canvas
              strokes={strokes}
              onAddStroke={handleAddStroke}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              bgPhoto={bgPhoto}
              onCanvasRef={(c) => {
                canvasRefObj.current = c;
              }}
            />

            <Toolbar
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              canUndo={strokes.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={handleClear}
              onLoadTemplate={() => setShowTemplatesModal(true)}
              onImportImage={handleImportImage}
              onExportSketch={handleExportSketch}
              hasPhoto={!!bgPhoto}
              onRemovePhoto={handleRemovePhoto}
              onOpenCameraModal={() => setIsCameraOpen(true)}
            />
          </div>

          {/* Right Column: AI Generation Output */}
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Gemini Output</span>
              </h2>
            </div>

            <div className="flex-1 min-h-[420px]">
              <OutputView
                result={result}
                isGenerating={isGenerating}
                isGeneratingVideo={isGeneratingVideo}
                sketchPng={exportPng(canvasRefObj.current || document.createElement("canvas"), bgPhoto)}
                onRegenerate={handleGenerate}
                history={history}
                onSelectHistory={setResult}
                onUpdateResultVideo={(videoUrl) => {
                  if (result) {
                    const updated = { ...result, videoUrl };
                    setResult(updated);
                    setHistory((prev) =>
                      prev.map((item) =>
                        item.timestamp === result.timestamp ? updated : item
                      )
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Prompt Input & Generation Settings */}
        <div className="pt-2">
          <PromptBar
            prompt={prompt}
            setPrompt={setPrompt}
            model={model}
            setModel={handleModelChange}
            stylePreset={stylePreset}
            setStylePreset={setStylePreset}
            onGenerate={handleGenerate}
            onGenerateVideo={handleAnimateVideo}
            isGenerating={isGenerating}
            isGeneratingVideo={isGeneratingVideo}
            hasStrokes={strokes.length > 0 || !!bgPhoto}
            hasResultImage={!!result}
            hasContext={!!lastInteractionId}
            onClearContext={() => setLastInteractionId(null)}
          />
        </div>
      </main>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Starter Sketch</h3>
                <p className="text-xs text-slate-500">Pick a sample drawing to instantly populate the canvas.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {STARTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    ✍️
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900">{tmpl.name}</h4>
                    <p className="text-xs text-slate-500">{tmpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera Live Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setBgPhoto(img);
          setTool("brush");
          setColor("#ff007f"); // Switch automatically to magenta region marker brush
          setStrokeWidth(16);
        }}
      />
    </div>
  );
};
