import { stepCountIs, streamText } from "ai";
import { google } from '@ai-sdk/google';
import { SYSTEM_PROMPT } from "./system/prompt.js";
import type { Agent } from "./index.js";
import { tools } from "./tools/index.js";

const MODEL_ID = 'gemini-3.5-flash-lite'

// `history` already includes the latest user message (see app.tsx), so we
// pass it as `messages` and don't pass `prompt` separately.
export const runAgent: Agent = async function* (history) {
  const { stream } = streamText({
    model: google(MODEL_ID),
    instructions: SYSTEM_PROMPT,
    // tool entries are UI-only; the model's own tool calls aren't replayed from history
    messages: history.flatMap(({ role, content }) => (role === 'tool' ? [] : [{ role, content }])),
    stopWhen: stepCountIs(5),
    tools
  });

  for await (const part of stream) {
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
    }
  }
}
