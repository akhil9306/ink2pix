import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { existsSync, mkdirSync, writeFileSync } from "fs";

// Model Registry matching plan 5 section 8 and ink2pix base code
const MODELS = {
  draft: { id: "gemini-3.1-flash-image", name: "Draft", imageSize: "1K", desc: "Fast generation (~5-10s)" },
  final: { id: "gemini-3-pro-image", name: "Final", imageSize: "2K", desc: "High detail Nano Banana Pro (~15-30s)" },
  fast: { id: "gemini-3.1-flash-lite-image", name: "Flash Lite", imageSize: "1K", desc: "Lightweight (~3-5s)" },
} as const;

type ModelKey = keyof typeof MODELS;

// Ensure public clips folder exists for video files (Section 10)
const CLIPS_DIR = path.join(process.cwd(), "public", "clips");
if (!existsSync(CLIPS_DIR)) {
  mkdirSync(CLIPS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  // Serve saved video clips statically
  app.use("/clips", express.static(CLIPS_DIR));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Model list endpoint
  app.get("/api/models", (_req, res) => {
    res.json({ models: MODELS });
  });

  // Video Animation endpoint (Gemini Omni Flash - Section 10)
  app.post("/api/animate", async (req, res) => {
    const {
      image,
      prompt,
      duration = "5s",
      aspectRatio = "16:9",
      motionStyle = "cinematic",
    } = req.body;

    if (!image) {
      res.status(400).json({ error: "Missing required field: image" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY environment variable is missing on the server."
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;

      let motionText = "";
      if (motionStyle === "zoom-in") motionText = "Slow cinematic zoom in. ";
      else if (motionStyle === "pan-right") motionText = "Smooth horizontal camera pan to the right. ";
      else if (motionStyle === "orbit") motionText = "Dynamic 3D camera orbit movement around subject. ";
      else if (motionStyle === "timelapse") motionText = "Timelapse motion with evolving lighting and clouds. ";
      else if (motionStyle === "action") motionText = "High energy dynamic motion and environmental movement. ";
      else motionText = "Cinematic camera movement and motion. ";

      const animationPrompt =
        `Turn this into realistic video footage: ${prompt || "Animate subject with realistic movement"}. ` +
        `${motionText}` +
        `Use the drawing/image only as a guide for composition and movement — do not show raw pencil sketch lines in the video. Include realistic matching ambient audio.`;

      const interaction = await ai.interactions.create(
        {
          model: "gemini-omni-flash-preview",
          input: [
            {
              type: "image",
              mime_type: "image/png",
              data: cleanBase64,
            },
            {
              type: "text",
              text: animationPrompt,
            },
          ],
          response_format: {
            type: "video",
            aspect_ratio: aspectRatio === "9:16" ? "9:16" : aspectRatio === "1:1" ? "1:1" : "16:9",
            duration: duration === "10s" ? "10s" : duration === "3s" ? "3s" : "5s",
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart || (!videoPart.data && !videoPart.uri)) {
        res.status(502).json({
          error: "No video was returned by Gemini Omni Flash. Try adjusting your prompt or image.",
        });
        return;
      }

      // Write binary clip to disk (Section 10)
      const videoDataBase64 = videoPart.data || "";
      const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
      const clipFilePath = path.join(CLIPS_DIR, clipId);
      const buffer = Buffer.from(videoDataBase64, "base64");
      writeFileSync(clipFilePath, buffer);

      res.json({
        videoUrl: `/clips/${clipId}`,
        duration,
        aspectRatio,
        motionStyle,
        interactionId: interaction.id,
      });
    } catch (err: any) {
      console.error("Gemini Video Animate Error:", err);
      const errorMessage = err?.message || "Video animation failed.";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Image generation endpoint (Sections 7, 8, 9)
  app.post("/api/generate", async (req, res) => {
    const {
      mode = "create",
      image,
      cleanImage,
      annotatedImage,
      prompt,
      markColor = "magenta",
      model = "draft",
      stylePreset,
      previousId,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY environment variable is missing on the server."
      });
      return;
    }

    const modelKey = (model in MODELS ? model : "draft") as ModelKey;
    const choice = MODELS[modelKey];

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let contentsParts: any[] = [];

      if (mode === "place" && cleanImage && annotatedImage) {
        // Photo Inpainting / Placement Mode (Section 9)
        const cleanB64 = cleanImage.includes(",") ? cleanImage.split(",")[1] : cleanImage;
        const annotatedB64 = annotatedImage.includes(",") ? annotatedImage.split(",")[1] : annotatedImage;

        const placePrompt =
          `The first image is the original photo. The second image is the same photo with a region marked in ${markColor}. ` +
          `In the first image, replace or add only to the marked region with: ${prompt || "the drawn object/edit"}. ` +
          `Match the existing lighting, perspective, shadows, and camera grain seamlessly. ` +
          `Keep everything outside that region pixel-identical. Do not draw the ${markColor} marks in the final output.` +
          (stylePreset && stylePreset !== "none" ? ` Style requested: ${stylePreset}.` : "");

        contentsParts = [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanB64,
            },
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: annotatedB64,
            },
          },
          {
            text: placePrompt,
          },
        ];
      } else {
        // Standard Sketch Creation Mode (Section 7)
        if (!image) {
          res.status(400).json({ error: "Missing required field: image" });
          return;
        }

        const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;

        let fullPrompt = previousId
          ? `Refine and update the previous generation according to the sketch and requested adjustments: ${prompt || "Apply sketch updates."}.`
          : `Turn this rough sketch into a complete, high-quality, beautiful finished image. `;

        if (prompt && prompt.trim() && !previousId) {
          fullPrompt += `Details and subject: ${prompt.trim()}. `;
        }
        if (stylePreset && stylePreset !== "none" && !previousId) {
          fullPrompt += `Style requested: ${stylePreset}. `;
        }
        fullPrompt += ` Preserve the overall composition, placement, shapes, and structural layout drawn in the sketch. Read any handwritten labels or text in the sketch as direct directives.`;

        contentsParts = [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: fullPrompt,
          },
        ];
      }

      let generatedImageBase64: string | null = null;
      let textOutput = "";
      let returnedInteractionId: string | undefined = undefined;

      // Primary path: Interactions API with context thread chaining
      try {
        const interactionInput: any[] = contentsParts.map((p) => {
          if (p.inlineData) {
            return {
              type: "image",
              mime_type: p.inlineData.mimeType || "image/png",
              data: p.inlineData.data,
            };
          } else {
            return {
              type: "text",
              text: p.text || "",
            };
          }
        });

        const interaction = await ai.interactions.create(
          {
            model: choice.id,
            input: interactionInput,
            response_format: {
              type: "image",
              aspect_ratio: "16:9",
              image_size: choice.imageSize,
            },
            ...(previousId ? { previous_interaction_id: previousId } : {}),
          },
          { timeout: 120000 }
        );

        returnedInteractionId = interaction.id;
        if (interaction.output_image?.data) {
          generatedImageBase64 = interaction.output_image.data;
        }
        if (interaction.output_text) {
          textOutput = interaction.output_text;
        }
      } catch (interactionErr: any) {
        console.warn("Interactions API call failed or unsupported, falling back to generateContent:", interactionErr?.message);

        const response = await ai.models.generateContent({
          model: choice.id,
          contents: {
            parts: contentsParts,
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: choice.imageSize,
            },
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
              generatedImageBase64 = part.inlineData.data;
            } else if (part.text) {
              textOutput += part.text;
            }
          }
        }
      }

      if (!generatedImageBase64) {
        res.status(502).json({
          error: "No image was returned by Gemini. Please try adjusting your prompt or sketch.",
          textOutput: textOutput || undefined,
        });
        return;
      }

      res.json({
        image: `data:image/png;base64,${generatedImageBase64}`,
        text: textOutput,
        model: choice.id,
        modelName: choice.name,
        interactionId: returnedInteractionId,
      });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const errorMessage = err?.message || "Image generation failed.";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ink2pix server running on http://localhost:${PORT}`);
  });
}

startServer();
