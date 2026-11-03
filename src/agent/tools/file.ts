import { tool } from "ai";
import z from "zod";
import fs from 'node:fs/promises';
import path from "node:path";

export const listFiles = tool({
  description: "List files in a directory",
  inputSchema: z.object({
    path: z.string().describe("The path of the directory to list files of").default("."),
  }),
  execute: async ({ path }) => {
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });

      return entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
      }));
    } catch (error) {
      return `Failed to list files in ${path}: ${error}`;
    }
  },
});

export const writeFile = tool({
  description: "Write to or update a file. Create the file if it doesn't exist, else, update or overwrite it.",
  inputSchema: z.object({
    filePath: z.string().describe("The absolute or relative path of the file to write to"),
    content: z.string().describe("The content to write to the file")
  }),
  execute: async ({ filePath, content }) => {
    try {
      // check the directory first
      const dir = path.dirname(filePath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(dir, content, { encoding: 'utf-8'})

      return `Successfully written to file ${filePath}, ${content.length} characters`
    } catch (error) {
      return `Failed to write to file ${filePath}: ${error}`
    }
  }
});

export const readFile = tool({
  description: "Read the contents of a specified file. Use when reading contents or asked to read contents of a file",
  inputSchema: z.object({
    filePath: z.string().describe("The absolute or relative path of the file to read from"),
  }),
  execute: async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, { encoding: 'utf-8' });

      return content;
    } catch (error) {
      return `Failed to read file ${filePath}: ${error}`;
    }
  },
})

export const deleteFile = tool({
  description: "Delete the file from a specified path. Use with caution as this is irreversible and destructive.",
  inputSchema: z.object({
    filePath: z.string().describe("The absolute or relative path of the file to delete")
  }),
  execute: async ({ filePath }) => {
    try {
      await fs.unlink(filePath);

      return `File ${filePath} has been deleted.`
    } catch (error) {
      return `Failed to delete file ${filePath}: ${error}`
    }
  }
})