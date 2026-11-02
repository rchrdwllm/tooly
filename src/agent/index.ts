import type {AgentEvent, ChatMessage} from '../types.js';

/**
 * The seam between the UI and your AI logic.
 * Yield events as they happen: text deltas and tool call lifecycle.
 */
export type Agent = (history: readonly ChatMessage[]) => AsyncIterable<AgentEvent>;
