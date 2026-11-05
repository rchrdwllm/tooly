import { ModelMessage, stepCountIs, streamText } from "ai";
import { SYSTEM_PROMPT } from "./system/prompt.js";
import type { Agent } from "./index.js";
import { tools } from "./tools/index.js";
import { MODEL } from "./model.js";
import { MODEL_LIMITS } from "./compaction/constants.js";
import { estimateTokens, isOverThreshold, messagesToText } from "./compaction/utils.js";
import { compactConversation } from "./compaction/index.js";

// `history` already includes the latest user message (see app.tsx), so we
// pass it as `messages` and don't pass `prompt` separately.
export const runAgent: Agent = async function* (history) {
  const modelLimits = MODEL_LIMITS;
  const textMessages = messagesToText(
    history.flatMap(({ role, content }) =>
      role === "tool" ? [] : [{ role, content }],
    ) as ModelMessage[],
  );
  const currentTokenCount = estimateTokens(textMessages);

  let messages: ModelMessage[] = history.flatMap(({ role, content }) =>
    role === "tool" ? [] : [{ role, content }],
  ) as ModelMessage[];

  if (isOverThreshold(currentTokenCount, modelLimits.contextWindow)) {
    messages = await compactConversation(
      history.flatMap(({ role, content }) =>
        role === "tool" ? [] : [{ role, content }],
      ) as ModelMessage[],
    );
  }

  while (true) {
    const result = streamText({
      model: MODEL,
      instructions: SYSTEM_PROMPT,
      // tool entries are UI-only; the model's own tool calls aren't replayed from history
      messages: messages,
      stopWhen: stepCountIs(7),
      tools: tools as any,
      toolApproval: {
        deleteFile: 'user-approval',
        shell: 'user-approval'
      }
    });
    const pending: Promise<{
      approvalId: string;
      approved: boolean;
      reason?: string;
    }>[] = [];

    for await (const part of result.stream) {
      switch (part.type) {
        case 'text-delta':
          yield { type: 'text', text: part.text };
          break;
        case 'tool-call':
          yield { type: 'tool-call', id: part.toolCallId, name: part.toolName, input: part.input };
          break;
        case 'tool-result':
          yield { type: 'tool-result', id: part.toolCallId };
          break;
        case 'tool-error':
          yield { type: 'tool-error', id: part.toolCallId, error: String(part.error) };
          break;
        case 'finish-step':
          // Each step resends the whole context, so the last step's input size is
          // the current context usage. Fall back to a local estimate if the provider omits it.
          yield {
            type: 'usage',
            inputTokens: part.usage.inputTokens ?? estimateTokens(messagesToText(messages)),
          };
          break;
        case 'tool-approval-request': {
          if (part.isAutomatic) break;

          let respond!: (approved: boolean, reason?: string) => void;

          pending.push(
            new Promise((resolve) => {
              respond = (approved, reason) =>
                resolve({ approvalId: part.approvalId, approved, reason });
            }),
          );

          yield {
            type: 'approval-request',
            id: part.toolCall.toolCallId,
            name: part.toolCall.toolName,
            input: part.toolCall.input,
            respond
          };
          
          break;
        }
      }
    }

    if (pending.length === 0) break;

    const answers = await Promise.all(pending);

    messages = [
      ...messages,
      ...(await result.responseMessages),
      {
        role: "tool",
        content: answers.map((a) => ({ type: "tool-approval-response", ...a })),
      },
    ];
  }
}
