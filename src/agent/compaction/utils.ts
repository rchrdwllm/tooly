import { ModelMessage } from "ai"
import { THRESHOLD } from "./constants.js"

export const isOverThreshold = (currentTokenCount: number, contextWindow: number) => {
  return currentTokenCount > contextWindow * THRESHOLD
}

export const estimateTokens = (text: string) => {
  return Math.ceil(text.length / 3.75)
}

export const extractMessageText = (message: ModelMessage) => {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === "string") return part;
        if ("text" in part && typeof part.text === "string") return part.text;
        if ("value" in part && typeof part.value === "string")
          return part.value;
        if (
          "output" in part &&
          typeof part.output === "object" &&
          part.output
        ) {
          const output = part.output as Record<string, unknown>;
          if ("value" in output && typeof output.value === "string") {
            return output.value;
          }
        }
        // Fallback: stringify the part
        return JSON.stringify(part);
      })
      .join(" ");
  }

  return JSON.stringify(message.content);
};

export const messagesToText = (messages: ModelMessage[]) => {
  return messages
    .map((msg) => {
      const role = msg.role.toUpperCase();
      const content = extractMessageText(msg);
      return `[${role}]: ${content}`;
    })
    .join("\n\n");
};

export const tokenizer = (messages: ModelMessage[]) => {
  let input = 0;
  let output = 0;

  for (const message of messages) {
    const text = extractMessageText(message);
    const tokens = estimateTokens(text);

    if (message.role === "assistant") {
      output += tokens;
    } else {
      // system, user, tool messages count as input
      input += tokens;
    }
  }

  return {
    input,
    output,
    total: input + output,
  };
}