import { readdir } from "node:fs/promises";
import { tool } from "ai";
import z from "zod";

export const listFiles = tool({
  description: "List files in a directory",
  inputSchema: z.object({
    path: z.string().default("."),
  }),
  execute: async ({ path }) => {
    const entries = await readdir(path, { withFileTypes: true });

    return entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
    }));
  },
});