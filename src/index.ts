#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║ NIMGEN — First MCP Server for NVIDIA NIM FLUX ║
 * ║ Generate images with FLUX models using your NVIDIA API key ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @author Gabriel Ferraresi (https://www.tech86.com.br)
 * @license Apache-2.0
 *
 * Tools provided:
 * • generate_image — Text-to-image with FLUX.1-dev or FLUX.1-schnell
 * • edit_image — Image editing with FLUX.1-Kontext-dev
 * • list_models — List available FLUX models on NVIDIA NIM
 *
 * Environment variables:
 * • NVIDIA_API_KEY — (required) Your NVIDIA API key (nvapi-...)
 * • NIMGEN_OUTPUT_DIR — (optional) Directory to save generated images
 * • NIMGEN_BASE_URL — (optional) Custom NIM endpoint base URL
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// ─── Configuration ──────────────────────────────────────────────────

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const OUTPUT_DIR = process.env.NIMGEN_OUTPUT_DIR || path.join(process.cwd(), "nimgen-output");
const BASE_URL = process.env.NIMGEN_BASE_URL || "https://ai.api.nvidia.com/v1/genai";

if (!NVIDIA_API_KEY) {
  console.error("❌ NIMGEN: NVIDIA_API_KEY environment variable is required.");
  console.error(" Get your key at: https://build.nvidia.com");
  process.exit(1);
}

// Validate API key format
if (!NVIDIA_API_KEY.startsWith("nvapi-")) {
  console.error("❌ NIMGEN: Invalid NVIDIA_API_KEY format.");
  console.error(" Key must start with 'nvapi-'. Get a valid key at: https://build.nvidia.com");
  process.exit(1);
}

// ─── Model Registry ─────────────────────────────────────────────────

interface NimagenModel {
  id: string;
  name: string;
  description: string;
  type: "text-to-image" | "image-to-image";
  maxSteps: number;
  defaultSteps: number;
  supportsCfg: boolean;
  supportsAspectRatio: boolean;
}

const MODELS: Record<string, NimagenModel> = {
  "flux-1-dev": {
    id: "black-forest-labs/flux.1-dev",
    name: "FLUX.1 Dev",
    description: "High-quality text-to-image generation. Best for detailed, artistic images.",
    type: "text-to-image",
    maxSteps: 50,
    defaultSteps: 20,
    supportsCfg: true,
    supportsAspectRatio: true,
  },
  "flux-1-schnell": {
    id: "black-forest-labs/flux_1-schnell",
    name: "FLUX.1 Schnell",
    description: "Fast text-to-image generation. Best for quick prototyping and drafts.",
    type: "text-to-image",
    maxSteps: 4,
    defaultSteps: 4,
    supportsCfg: false,
    supportsAspectRatio: true,
  },
  "flux-1-kontext": {
    id: "black-forest-labs/flux.1-kontext-dev",
    name: "FLUX.1 Kontext Dev",
    description: "Contextual image editing. Send an image + prompt to transform it.",
    type: "image-to-image",
    maxSteps: 30,
    defaultSteps: 20,
    supportsCfg: true,
    supportsAspectRatio: true,
  },
};

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

// ─── NVIDIA NIM API Client ─────────────────────────────────────────

interface GenerateRequest {
  prompt: string;
  model?: string;
  steps?: number;
  cfg_scale?: number;
  aspect_ratio?: AspectRatio;
  seed?: number;
  negative_prompt?: string;
}

interface EditRequest {
  prompt: string;
  image_base64: string;
  model?: string;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
}

interface NimApiResponse {
  artifacts?: Array<{ base64: string; seed: number; finish_reason: string }>;
  b64_json?: string;
  image?: string;
  [key: string]: unknown;
}

async function callNimApi(modelId: string, payload: Record<string, unknown>): Promise<string> {
  const url = `${BASE_URL}/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new McpError(
      ErrorCode.InternalError,
      `NVIDIA NIM API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as NimApiResponse;

  // Handle different response formats from NIM
  let base64Image: string | undefined;

  if (data.artifacts && data.artifacts.length > 0) {
    base64Image = data.artifacts[0].base64;
  } else if (data.b64_json) {
    base64Image = data.b64_json;
  } else if (data.image) {
    base64Image = data.image;
  } else {
    // Try to find base64 data in any field
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.length > 1000) {
        base64Image = value;
        break;
      }
    }
  }

  if (!base64Image) {
    throw new McpError(
      ErrorCode.InternalError,
      `Unexpected API response format: ${JSON.stringify(data).substring(0, 500)}`
    );
  }

  return base64Image;
}

// ─── Image I/O Helpers ──────────────────────────────────────────────

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function saveImage(base64Data: string, prefix: string): Promise<string> {
  await ensureOutputDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const shortId = randomUUID().slice(0, 8);
  const filename = `${prefix}_${timestamp}_${shortId}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);

  // Remove data URI prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");

  await fs.writeFile(filepath, buffer);
  return filepath;
}

// ─── Constants for validation ───────────────────────────────────────

const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

const IMAGE_MAGIC_NUMBERS: Record<string, number[]> = {
  png: [0x89, 0x50, 0x4e, 0x47],
  jpeg: [0xff, 0xd8, 0xff],
  webp: [0x52, 0x49, 0x46, 0x46],
  gif: [0x47, 0x49, 0x46, 0x38],
};

function validateImageMagic(buffer: Buffer): boolean {
  for (const magic of Object.values(IMAGE_MAGIC_NUMBERS)) {
    if (magic.every((byte, i) => buffer[i] === byte)) {
      return true;
    }
  }
  return false;
}

async function loadImageAsBase64(imagePath: string): Promise<string> {
  const absolutePath = path.resolve(imagePath);

  // Security: Prevent path traversal attacks
  const allowedDirs = [OUTPUT_DIR, process.cwd()];
  const isAllowed = allowedDirs.some(
    (dir) => absolutePath.startsWith(path.resolve(dir)) || absolutePath === path.resolve(dir)
  );

  if (!isAllowed) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Access denied: path '${imagePath}' is outside allowed directories. ` +
        `Allowed directories: ${allowedDirs.join(", ")}`
    );
  }

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(absolutePath);
  } catch (error) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Could not read image at '${imagePath}'. ` +
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Security: Check file size
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. ` +
        `Maximum allowed: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    );
  }

  // Security: Validate image format using magic numbers
  if (!validateImageMagic(buffer)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid image format. Supported formats: PNG, JPEG, WebP, GIF`
    );
  }

  return buffer.toString("base64");
}

// ─── MCP Server ─────────────────────────────────────────────────────

const server = new Server(
  {
    name: "nimgen",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ─── Tool Definitions ───────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_image",
      description:
        "Generate an image from a text prompt using NVIDIA NIM FLUX models. " +
        "Returns the file path of the saved image. " +
        "Use 'flux-1-dev' for high quality or 'flux-1-schnell' for speed.",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: {
            type: "string",
            description:
              "Text description of the image to generate. Be detailed and specific. " +
              "Example: 'A futuristic cityscape at sunset with flying cars and neon lights, " +
              "photorealistic, high detail, cinematic lighting'",
          },
          model: {
            type: "string",
            enum: ["flux-1-dev", "flux-1-schnell"],
            default: "flux-1-dev",
            description:
              "Model to use. 'flux-1-dev' = high quality (30 steps), " +
              "'flux-1-schnell' = fast (4 steps).",
          },
          aspect_ratio: {
            type: "string",
            enum: ASPECT_RATIOS as unknown as string[],
            default: "1:1",
            description:
              "Aspect ratio of the output image. " +
              "Common: '1:1' (square), '16:9' (landscape), '9:16' (portrait/stories).",
          },
          steps: {
            type: "number",
            description:
              "Number of inference steps. More steps = higher quality but slower. " +
              "Default: 30 for flux-1-dev, 4 for flux-1-schnell.",
          },
          cfg_scale: {
            type: "number",
            default: 5,
            description:
              "Classifier-free guidance scale (1-20). Higher = more faithful to prompt, " +
              "lower = more creative. Default: 5.",
          },
          negative_prompt: {
            type: "string",
            description:
              "Things to exclude from the image. " +
              "Example: 'blurry, low quality, watermark, text'",
          },
          seed: {
            type: "number",
            description:
              "Random seed for reproducibility. Use 0 for random. " +
              "Same seed + same prompt = same image.",
          },
        },
        required: ["prompt"],
      },
    },
    {
      name: "edit_image",
      description:
        "Edit an existing image using text instructions via FLUX.1-Kontext. " +
        "Provide a source image path and describe the desired changes. " +
        "Great for mockups, style transfer, and contextual editing.",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: {
            type: "string",
            description:
              "Text description of the desired edit. Be specific about changes. " +
              "Example: 'Add a realistic dragon tattoo on the forearm'",
          },
          image_path: {
            type: "string",
            description:
              "Absolute or relative path to the source image to edit.",
          },
          steps: {
            type: "number",
            default: 20,
            description: "Number of inference steps (1-30). Default: 20.",
          },
          cfg_scale: {
            type: "number",
            default: 7,
            description: "Guidance scale (1-20). Default: 7.",
          },
          seed: {
            type: "number",
            description: "Random seed for reproducibility. Use 0 for random.",
          },
        },
        required: ["prompt", "image_path"],
      },
    },
    {
      name: "list_models",
      description:
        "List all available FLUX models on NVIDIA NIM and their capabilities.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
  ],
}));

// ─── Tool Execution ─────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
// ── generate_image ────────────────────────────────────────────
  case "generate_image": {
  const genArgs = args as Record<string, unknown>;
  const prompt = genArgs.prompt as string;
  const model = (genArgs.model as string) ?? "flux-1-dev";
  const aspect_ratio = (genArgs.aspect_ratio as string) ?? "1:1";
  const steps = genArgs.steps as number | undefined;
  const cfg_scale = (genArgs.cfg_scale as number) ?? 5;
  const negative_prompt = genArgs.negative_prompt as string | undefined;
  const seed = (genArgs.seed as number) ?? 0;

  // Validate prompt length
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new McpError(
    ErrorCode.InvalidParams,
    `Prompt too long: ${prompt.length} characters. Maximum: ${MAX_PROMPT_LENGTH}`
    );
  }

  const modelInfo = MODELS[model];
  if (!modelInfo) {
    throw new McpError(
    ErrorCode.InvalidParams,
    `Unknown model '${model}'. Available: ${Object.keys(MODELS).join(", ")}`
    );
  }

  if (modelInfo.type !== "text-to-image") {
    throw new McpError(
    ErrorCode.InvalidParams,
    `Model '${model}' is for ${modelInfo.type}, not text-to-image. Use 'flux-1-dev' or 'flux-1-schnell'.`
    );
  }

  const inferenceSteps = steps ?? modelInfo.defaultSteps;

  const payload: Record<string, unknown> = {
  prompt,
  seed,
        steps: Math.min(inferenceSteps, modelInfo.maxSteps),
      };

      if (modelInfo.supportsCfg) {
        payload.cfg_scale = cfg_scale;
      }

      if (modelInfo.supportsAspectRatio) {
        payload.aspect_ratio = aspect_ratio;
      }

      if (negative_prompt && modelInfo.supportsCfg) {
        payload.negative_prompt = negative_prompt;
      }

try {
  const base64 = await callNimApi(modelInfo.id, payload);
  const filepath = await saveImage(base64, "nimgen");

  return {
  content: [
    {
    type: "text",
    text: [
      `✅ Image generated successfully!`,
      ``,
      `📁 **File:** ${filepath}`,
      `🎨 **Model:** ${modelInfo.name}`,
      `📐 **Aspect Ratio:** ${aspect_ratio}`,
      `🔧 **Steps:** ${inferenceSteps}`,
      `🌱 **Seed:** ${seed}`,
      `💬 **Prompt:** ${prompt}`,
    ].join("\\n"),
    },
  ],
  };
  } catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  // Provide helpful error messages
  let helpfulMessage = `❌ Generation failed: ${message}`;
  if (message.includes("401") || message.includes("Unauthorized") || message.includes("Invalid API key")) {
    helpfulMessage = "❌ Generation failed: Invalid NVIDIA API key. Get a valid key at: https://build.nvidia.com";
  } else if (message.includes("429") || message.includes("Rate limit")) {
    helpfulMessage = "❌ Generation failed: Rate limit exceeded. Please wait a moment and try again.";
  } else if (message.includes("500") || message.includes("502") || message.includes("503")) {
    helpfulMessage = "❌ Generation failed: NVIDIA NIM service temporarily unavailable. Please try again later.";
  }
return {
  content: [{ type: "text", text: helpfulMessage }],
  isError: true,
  };
  }
  }

  // ── edit_image ────────────────────────────────────────────────
  case "edit_image": {
      const rawArgs = args as Record<string, unknown>;
      const prompt = rawArgs.prompt as string;
      const image_path = rawArgs.image_path as string;
      const steps = (rawArgs.steps as number) ?? 20;
      const cfg_scale = (rawArgs.cfg_scale as number) ?? 7;
      const seed = (rawArgs.seed as number) ?? 0;

      if (!image_path) {
        throw new McpError(ErrorCode.InvalidParams, "image_path is required for edit_image.");
      }

      const modelInfo = MODELS["flux-1-kontext"];

      let imageBase64: string;
      try {
        imageBase64 = await loadImageAsBase64(image_path);
      } catch {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Could not read image at '${image_path}'. Ensure the file exists and is accessible.`
        );
      }

      const payload: Record<string, unknown> = {
        prompt,
        image: imageBase64,
        cfg_scale,
        seed,
        steps: Math.min(steps, modelInfo.maxSteps),
      };

  try {
    const base64 = await callNimApi(modelInfo.id, payload);
    const filepath = await saveImage(base64, "nimgen-edit");

    return {
      content: [
        {
          type: "text",
          text: [
            `✅ Image edited successfully!`,
            ``,
            `📁 **Output:** ${filepath}`,
            `📷 **Source:** ${image_path}`,
            `🎨 **Model:** ${modelInfo.name}`,
            `🔧 **Steps:** ${steps}`,
            `💬 **Edit prompt:** ${prompt}`,
          ].join("\n"),
        },
      ],
    };
  } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `❌ Edit failed: ${message}` }],
          isError: true,
        };
      }
    }

  // ── list_models ───────────────────────────────────────────────
  case "list_models": {
    const modelList = Object.entries(MODELS)
      .map(
        ([key, m]) =>
          `• **${m.name}** (\`${key}\`)\n  Type: ${m.type}\n  ${m.description}\n  Steps: ${m.defaultSteps} (max ${m.maxSteps})`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: [
            `🎨 **NIMGEN — Available Models**`,
            ``,
            `Provider: NVIDIA NIM (${BASE_URL})`,
            ``,
            modelList,
            ``,
            `Output directory: ${OUTPUT_DIR}`,
          ].join("\n"),
        },
      ],
    };
  }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

// ─── Server Startup ─────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🎨 NIMGEN MCP Server v1.1.0 started");
  console.error(` Provider: NVIDIA NIM (${BASE_URL})`);
  console.error(` Output: ${OUTPUT_DIR}`);
  console.error(` Models: ${Object.keys(MODELS).join(", ")}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
