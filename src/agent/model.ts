import { google } from "@ai-sdk/google";

// Reads GOOGLE_GENERATIVE_AI_API_KEY from the environment.
export const MODEL = google("gemini-3.5-flash-lite");
