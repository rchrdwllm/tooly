import { groq } from "@ai-sdk/groq";

// Reads GROQ_API_KEY from the environment.
export const MODEL = groq("openai/gpt-oss-120b");
