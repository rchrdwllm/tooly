import { generateText, ModelMessage, stepCountIs, tool, ToolSet } from "ai";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.js";
import { tools } from "../src/agent/tools/index.js";
import { MODEL } from "../src/agent/model.js";
import type { CompactionEvalData, EvalData, ExecutorOutput, MultiTurnEvalData } from "./types.js";
import z from "zod";
import { compactConversation } from "../src/agent/compaction/index.js";

export const singleTurnExecutor = async (data: EvalData): Promise<ExecutorOutput> => {
  const { toolCalls } = await generateText({
    model: MODEL,
    instructions: SYSTEM_PROMPT,
    prompt: data.prompt,
    stopWhen: stepCountIs(5),
    tools: tools as any,
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

  const allCalls = result.steps.flatMap((step) => step.toolCalls);
  const toolCalls = allCalls.map((call) => ({
    toolName: call.toolName,
    args: call.input,
  }));
  const toolCallOrder = toolCalls.map((call) => call.toolName);
  const finalResponse = result.text;

  return {
    toolCalls,
    toolNames: toolCallOrder,
    selectedAny: toolCalls.length > 0,
    finalResponse,
    toolCallOrder,
  };
}

// Pad the middle with irrelevant chatter so the facts must survive real compression
const withFiller = (messages: ModelMessage[], turns: number): ModelMessage[] => {
  const filler: ModelMessage[] = Array.from({ length: turns }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Filler message ${i}: talking about the weather and lunch options.`,
  }));
  const mid = Math.floor(messages.length / 2);
  return [...messages.slice(0, mid), ...filler, ...messages.slice(mid)];
};

export const compactionExecutor = async (data: CompactionEvalData) => {
  const { messages, fillerTurns } = data;
  const filteredMessages = withFiller(messages, fillerTurns);
  const compacted = await compactConversation(filteredMessages);
  const summary = String(compacted[0].content);

  return { summary }
}