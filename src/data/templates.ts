import type { PresetTemplate } from "../types";

export const STARTER_TEMPLATES: PresetTemplate[] = [
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    icon: "Mountain",
    description: "A rustic wooden cabin with mountains and a sunset lake",
    defaultPrompt: "A cozy wooden cabin on a serene lake reflecting snow-capped mountains during golden sunset",
    strokes: [
      {
        id: "m1",
        color: "#3b82f6",
        width: 6,
        erase: false,
        points: [[150, 320], [350, 120], [550, 320]]
      },
      {
        id: "m2",
        color: "#3b82f6",
        width: 6,
        erase: false,
        points: [[450, 320], [650, 150], [850, 320]]
      },
      {
        id: "sun",
        color: "#f59e0b",
        width: 8,
        erase: false,
        points: [[380, 200], [385, 200]]
      },
      {
        id: "house",
        color: "#1e293b",
        width: 8,
        erase: false,
        points: [[220, 380], [420, 380], [420, 480], [220, 480], [220, 380]]
      },
      {
        id: "roof",
        color: "#ef4444",
        width: 8,
        erase: false,
        points: [[200, 380], [320, 300], [440, 380]]
      },
      {
        id: "lake",
        color: "#06b6d4",
        width: 6,
        erase: false,
        points: [[50, 480], [970, 480]]
      },
      {
        id: "tree1",
        color: "#10b981",
        width: 6,
        erase: false,
        points: [[100, 480], [100, 360], [80, 400], [100, 360], [120, 400], [100, 360], [70, 440], [100, 360], [130, 440]]
      },
      {
        id: "tree2",
        color: "#10b981",
        width: 6,
        erase: false,
        points: [[880, 480], [880, 340], [860, 380], [880, 340], [900, 380], [880, 340], [850, 430], [880, 340], [910, 430]]
      }
    ]
  },
  {
    id: "sports-car",
    name: "Cyberpunk Car",
    icon: "Car",
    description: "A sleek sports car under neon city rain",
    defaultPrompt: "A sleek futuristic neon sports car driving through a rainy cyberpunk city at night with glowing wet reflections",
    strokes: [
      {
        id: "car-body",
        color: "#ec4899",
        width: 8,
        erase: false,
        points: [
          [150, 380], [250, 340], [380, 260], [620, 260], [750, 330], [880, 360], [900, 420], [120, 420], [150, 380]
        ]
      },
      {
        id: "wheel1",
        color: "#06b6d4",
        width: 8,
        erase: false,
        points: [[280, 420], [285, 420]]
      },
      {
        id: "wheel2",
        color: "#06b6d4",
        width: 8,
        erase: false,
        points: [[750, 420], [755, 420]]
      },
      {
        id: "headlight",
        color: "#eab308",
        width: 6,
        erase: false,
        points: [[880, 370], [980, 390], [980, 430], [880, 410]]
      }
    ]
  },
  {
    id: "robot-friend",
    name: "Friendly Robot",
    icon: "Bot",
    description: "A cute round robot in a lush garden",
    defaultPrompt: "A friendly cute white robot with expressive glowing eyes holding a colorful flower in a magical sunlit garden",
    strokes: [
      {
        id: "head",
        color: "#6366f1",
        width: 8,
        erase: false,
        points: [[380, 180], [640, 180], [640, 300], [380, 300], [380, 180]]
      },
      {
        id: "eye1",
        color: "#06b6d4",
        width: 12,
        erase: false,
        points: [[450, 240], [455, 240]]
      },
      {
        id: "eye2",
        color: "#06b6d4",
        width: 12,
        erase: false,
        points: [[570, 240], [575, 240]]
      },
      {
        id: "body",
        color: "#6366f1",
        width: 8,
        erase: false,
        points: [[410, 320], [610, 320], [610, 480], [410, 480], [410, 320]]
      },
      {
        id: "antenna",
        color: "#f43f5e",
        width: 6,
        erase: false,
        points: [[510, 180], [510, 120]]
      },
      {
        id: "ant-ball",
        color: "#f43f5e",
        width: 14,
        erase: false,
        points: [[510, 110], [515, 110]]
      }
    ]
  }
];
