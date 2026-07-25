import React from "react";
import { Link } from "wouter";
import { Sparkles, ArrowRight, Paintbrush, Wand2, Zap, Layers } from "lucide-react";

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
            i2p
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
            ink2pix
          </span>
        </div>

        <Link
          href="/app"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Hero */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Powered by Gemini Nano Banana Models</span>
        </div>

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Sketch it, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">ship it.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            A real-time digital scratch pad that turns rough drawings into finished high-resolution artwork using Gemini.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/app"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <Wand2 className="w-5 h-5" />
            <span>Start Sketching Now</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Showcase Visual Card */}
        <div className="w-full max-w-4xl mt-12 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sketch Side */}
            <div className="relative aspect-[16/9] bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-slate-400 overflow-hidden">
              <div className="absolute top-3 left-3 text-[10px] font-bold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
                1. Rough Canvas Sketch
              </div>
              <svg className="w-48 h-32 stroke-slate-700 stroke-[3] fill-none" viewBox="0 0 200 120">
                <path d="M 60 70 L 140 70 L 140 110 L 60 110 Z" />
                <path d="M 50 70 L 100 30 L 150 70" />
                <path d="M 10 110 L 60 40 L 110 110" className="stroke-indigo-400" />
                <path d="M 100 110 L 150 50 L 190 110" className="stroke-indigo-400" />
                <circle cx="160" cy="30" r="12" className="stroke-amber-500 fill-amber-100" />
              </svg>
            </div>

            {/* Rendered Side */}
            <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <div className="absolute top-3 left-3 text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full z-10">
                2. Gemini Finished Render
              </div>
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1024&q=80"
                alt="Demo rendered result"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Vector Stroke Engine</span>
              </div>
              <p className="text-xs text-slate-500">
                Pressure sensitive pen tools with high-DPI white background PNG export.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>Dual Gemini Models</span>
              </div>
              <p className="text-xs text-slate-500">
                Draft mode for fast 5s iteration or Nano Banana Pro for 2K final renders.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-2 text-pink-600 font-bold text-xs">
                <Layers className="w-3.5 h-3.5" />
                <span>Side-by-Side Compare</span>
              </div>
              <p className="text-xs text-slate-500">
                Interactive comparison slider to compare your raw drawing to the final art.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400 border-t border-slate-200">
        <p>ink2pix · Built with React 19, Bun runtime, and Gemini @google/genai SDK</p>
      </footer>
    </div>
  );
};
