# ink2pix (GDG Brooklyn Hackthon)🎨✨

> **Sketch it, ship it** — A real-time scratch pad that turns rough drawings, sketches, and annotated photos into finished artwork and video animations using Google Gemini models.

![Status: Operational](https://img.shields.io/badge/Status-Operational-brightgreen?style=for-the-badge&logo=checkmarx)
![Build: Passing](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge&logo=github)
![Gemini API: Ready](https://img.shields.io/badge/Gemini_API-Ready-blue?style=for-the-badge&logo=google)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 🚀 Features

### 1. Vector Drawing Surface (`/app`)
- **Pressure-Sensitive Pen**: Smooth, organic pressure-tapered strokes powered by `perfect-freehand`.
- **Drawing Tools**: Pen with preset swatches + custom color picker, stroke width slider, eraser, undo, redo, clear, and high-DPI white-background PNG exporter.
- **Sample Starter Templates**: Instant loading preset drawings (Mountain Cabin, Cyberpunk Car, Friendly Robot).

### 2. Dual Gemini Image Generation
- **Draft Mode**: Fast iteration (~5–10s) using `gemini-3.1-flash-image`.
- **Final Render Mode**: High-detail 2K renders (~15–30s) using `gemini-3-pro-image`.
- **Lite Mode**: Lightweight generation (~3–5s) using `gemini-3.1-flash-lite-image`.
- **Context Thread Chaining**: Conversational refinement via `previous_interaction_id` for multi-turn edits (e.g. *"make the sky orange"*).

### 3. Camera & Photo Inpainting Mode
- **Live Viewfinder & Photo Upload**: Capture background photos directly using live device camera or upload image files.
- **Region Marker Brush**: Automatic pink/magenta brush (`#ff007f`) to mark exact regions on top of photos for targeted AI replacement.

### 4. Gemini Omni Flash Video Animations
- **Image-to-Video Engine**: Animate generated stills or sketches using `gemini-omni-flash-preview`.
- **Custom Controls**:
  - Clip Durations: `3s`, `5s`, `10s`.
  - Aspect Ratios: `16:9` Wide, `9:16` Tall, `1:1` Square.
  - Camera Motion Styles: `Cinematic`, `Slow Zoom In`, `Pan Right`, `3D Orbit`, `Timelapse`, `Dynamic Action`.
- **Synced Ambient Audio**: Includes matching sound effects and soundtrack generated on the fly.

### 5. Interactive Compare & Output View
- **Before/After Split Slider**: Drag slider to compare raw canvas drawing against finished Gemini output.
- **Asset Export**: Instant PNG image download & MP4 video download.
- **Recent History**: Persistent thumbnail history reel for quick toggling.

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| **Runtime & Server** | Node.js / Bun (`tsx server.ts`, Express + Vite dev server) |
| **Frontend Framework** | React 19 + TypeScript |
| **Routing** | `wouter` |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Icons** | `lucide-react` |
| **Drawing Engine** | Native `<canvas>` + `perfect-freehand` |
| **Gemini Client** | `@google/genai` (Server-side API calls) |

---

## ⚙️ Quick Start

### 1. Installation
Clone or navigate to the repository folder:
```bash
cd ink2pix-app
bun install
```
*(or `npm install`)*

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here
PORT=3000
```
> Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 3. Run Development Server
```bash
bun dev
```
*(or `npm run dev`)*

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏷️ Operational Status

- **Status**: `OPERATIONAL`
- **Core API Routes**:
  - `GET /api/health` ➔ `{"status": "ok"}`
  - `GET /api/models` ➔ returns model choices
  - `POST /api/generate` ➔ Image generation & context chaining
  - `POST /api/animate` ➔ Video generation
  - `GET /clips/*` ➔ Static MP4 video clip serving

---

*Built for hackathons & rapid creative iteration with Google Gemini.*
