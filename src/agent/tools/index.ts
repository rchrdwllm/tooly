import { groq } from "@ai-sdk/groq";
import { dateTime } from "./dateTime.js";
import { deleteFile, listFiles, readFile, writeFile } from "./file.js";

export const tools = {
  dateTime,
  listFiles,
  writeFile,
  readFile,
  deleteFile,
  webSearch: groq.tools.browserSearch({})
}