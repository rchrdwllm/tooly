import { dateTime } from "./dateTime.js";
import { deleteFile, listFiles, readFile, writeFile } from "./file.js";
import { shell } from "./shell.js";
import { webSearch } from "./webSearch.js";

export const tools = {
  dateTime,
  listFiles,
  writeFile,
  readFile,
  deleteFile,
  webSearch,
  shell,
};