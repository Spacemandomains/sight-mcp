import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ChatService } from "./src/services/ChatService.js";
import { FileService } from "./src/services/FileService.js";

import { resolveProviderConfig } from "./src/services/ProviderConfig.js";

const providerConfig = resolveProviderConfig();
const API_URL = providerConfig.apiUrl;
const MODEL = providerConfig.model;
const API_KEY = providerConfig.apiKey;

if (!API_KEY) {
  throw new Error(
    `${providerConfig.apiKeyEnv} environment variable is required` +
      (providerConfig.provider === "meta"
        ? " for the Meta Model API (PROVIDER=meta)"
        : ""),
  );
}

const server = new McpServer({
  name: "sight-mcp",
  version: "1.0.0",
});

const chatService = new ChatService(API_URL, MODEL, API_KEY);

server.tool(
  "analyze_image",
  "Analyze an image using advanced AI vision models with comprehensive understanding capabilities. Supports both local files and remote URL. Maximum file size: 5MB",
  {
    image: z.string().describe("Local file path or remote URL to the image (supports PNG, JPG, JPEG)"),
    prompt: z.string().describe("Detailed text prompt describing what to analyze, extract, or understand from the image"),
  },
  async ({ image, prompt }) => {
    try {
      const { dataUrl, fileInfo } = await FileService.processFile(image);
      const imageUrl = dataUrl || fileInfo.path;

      const analysis = await chatService.analyzeImage(imageUrl, prompt);

      return {
        content: [{ type: "text", text: analysis }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
      return {
        content: [{ type: "text", text: `Unknown error occurred: ${String(error)}` }],
      };
    }
  },
);

server.tool(
  "analyze_video",
  "Analyze a video using advanced AI vision models with comprehensive understanding capabilities. Supports both local files and remote URL. Maximum file size: 8MB",
  {
    video: z.string().describe("Local file path or remote URL to the video (supports MP4, MOV, M4V)"),
    prompt: z.string().describe("Detailed text prompt describing what to analyze, extract, or understand from the video"),
  },
  async ({ video, prompt }) => {
    try {
      const { dataUrl, fileInfo } = await FileService.processFile(video);
      const videoUrl = dataUrl || fileInfo.path;

      const analysis = await chatService.analyzeVideo(videoUrl, prompt);

      return {
        content: [{ type: "text", text: analysis }],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
        };
      }
      return {
        content: [{ type: "text", text: `Unknown error occurred: ${String(error)}` }],
      };
    }
  },
);

async function main() {
  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.main) {
  main();
}
