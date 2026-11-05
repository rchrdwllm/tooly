import { generateText, ModelMessage } from "ai";
import { MODEL } from "../model.js";
import { SUMMARIZER_PROMPT } from "./prompt.js";
import { messagesToText } from "./utils.js";

export const compactConversation = async (messages: ModelMessage[]) => {
  const textMessages = messagesToText(messages);
  const { text: summary } = await generateText({
    model: MODEL,
    maxRetries: 8,
    instructions: SUMMARIZER_PROMPT,
    prompt: textMessages
  });

  const compactedMessages: ModelMessage[] = [
    {
      role: "user",
      content: `Here is the summarized conversation: ${summary}`
    },
    {
      role: "assistant",
      content: "Understood. I've reviewed the summarized conversation and am ready to continue."
    }
  ];

  return compactedMessages;
}