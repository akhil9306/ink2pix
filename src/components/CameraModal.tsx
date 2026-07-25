import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, AlertCircle } from "lucide-react";
import { drawCoverImage, CANVAS_WIDTH, CANVAS_HEIGHT } from "../canvas";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (img: HTMLImageElement) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop all camera tracks helper
  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start media stream
  useEffect(() => {
    if (!isOpen) {
      stopTracks();
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setError(null);

    async function initCamera() {
      try {
        stopTracks();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported in this browser environment.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsInitializing(false);
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (isMounted) {
          setError(
            err?.message ||
              "Could not access camera. Please allow camera permissions or upload an image file."
          );
          setIsInitializing(false);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopTracks();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const ctx = tempCanvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawCoverImage(ctx, video, CANVAS_WIDTH, CANVAS_HEIGHT);

      const dataUrl = tempCanvas.toDataURL("image/png");
      const img = new Image();
      img.onload = () => {
        stopTracks();
        onCapture(img);
        onClose();
      };
      img.src = dataUrl;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Camera Capture</h3>
              <p className="text-[11px] text-slate-400">Take a photo as your drawing canvas background</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Display Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-rose-300 font-medium">{error}</p>
              <p className="text-[11px] text-slate-400">
                You can grant camera permission in your browser or select an image file directly.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />
              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                  <p className="text-xs text-slate-400">Starting camera sensor...</p>
                </div>
              )}
            </>
          )}

          {/* Guidelines Overlay */}
          {!error && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl m-4 flex items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-l-2 border-purple-400/80 absolute top-0 left-0" />
              <div className="w-12 h-12 border-t-2 border-r-2 border-purple-400/80 absolute top-0 right-0" />
              <div className="w-12 h-12 border-b-2 border-l-2 border-purple-400/80 absolute bottom-0 left-0" />
              <div className="w-12 h-12 border-b-2 border-r-2 border-purple-400/80 absolute bottom-0 right-0" />
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleFacingMode}
            disabled={!!error || isInitializing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Switch front/back camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Camera ({facingMode === "environment" ? "Rear" : "Front"})</span>
          </button>

          {!error ? (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isInitializing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all cursor-pointer scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
