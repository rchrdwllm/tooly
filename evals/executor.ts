import { google } from "@ai-sdk/google";
import { generateText, stepCountIs } from "ai";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.js";
import { tools } from "../src/agent/tools/index.js";
import type { EvalData, ExecutorOutput } from "./types.js";

const MODEL_ID = "gemini-3.5-flash-lite";

export const executor = async (data: EvalData): Promise<ExecutorOutput> => {
  const { toolCalls } = await generateText({
    model: google(MODEL_ID),
    instructions: SYSTEM_PROMPT,
    prompt: data.prompt,
    stopWhen: stepCountIs(5),
    tools,
  });

  return {
    toolCalls: toolCalls.map((call) => ({
      toolName: call.toolName,
      args: call.input,
    })),
    toolNames: toolCalls.map((call) => call.toolName),
    selectedAny: toolCalls.length > 0,
  }
};
