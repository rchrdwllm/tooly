import { generateText, stepCountIs, tool, ToolSet } from "ai";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.js";
import { tools } from "../src/agent/tools/index.js";
import { MODEL } from "../src/agent/model.js";
import type { EvalData, ExecutorOutput, MultiTurnEvalData } from "./types.js";
import z from "zod";

export const singleTurnExecutor = async (data: EvalData): Promise<ExecutorOutput> => {
  const { toolCalls } = await generateText({
    model: MODEL,
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

export const multiTurnExecutor = async (data: MultiTurnEvalData) => {
  const buildMockedTools = () => {
    const mockedTools: ToolSet = {};

    Object.entries(data.mockTools).forEach(([toolName, toolData]) => {
      const paramSchema: Record<string, z.ZodString> = {};

      for (const paramName of Object.keys(toolData.inputSchema)) {
        paramSchema[paramName] = z.string();
      }

      mockedTools[toolName] = tool({
        description: toolData.description,
        inputSchema: z.object(paramSchema),
        execute: async () => toolData.output,
      });
    });

    return mockedTools;
  }

  const result = await generateText({
    model: MODEL,
    instructions: SYSTEM_PROMPT,
    prompt: data.prompt,
    stopWhen: stepCountIs(5),
    tools: buildMockedTools(),
  });

  const toolCallOrder = result.toolCalls.map((call) => call.toolName);
  const steps = result.toolCalls.map((call) => ({
    toolName: call.toolName,
    args: call.input,
  }));
  const finalResponse = result.text;

  return {
    toolCalls: steps,
    toolNames: toolCallOrder,
    selectedAny: steps.length > 0,
    finalResponse,
    toolCallOrder,
  }
}