export type Point = [x: number, y: number, pressure?: number];

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  erase: boolean;
};

export type ModelKey = "draft" | "final" | "fast";

export type StylePreset =
  | "none"
  | "photorealistic"
  | "concept-art"
  | "watercolor"
  | "anime"
  | "cyberpunk"
  | "blueprint"
  | "3d-render"
  | "oil-painting"
  | "pixel-art";

export interface GenerationResult {
  image: string;
  videoUrl?: string;
  text?: string;
  model: string;
  modelName: string;
  timestamp: number;
  prompt: string;
  stylePreset: StylePreset;
  sketchPng: string;
  interactionId?: string;
}

export interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultPrompt: string;
  strokes: Stroke[];
}
