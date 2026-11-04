import { groq } from "@ai-sdk/groq";

export const webSearch = groq.tools.browserSearch({})