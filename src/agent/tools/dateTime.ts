import { tool } from "ai";
import { z } from "zod";

export const dateTime = tool({
  description: "Get the current date and time in ISO format, use as first step for relative-date questions",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      return new Date().toISOString();
    } catch (error) {
      return `Failed to get the current date and time: ${error}`;
    }
  }
})