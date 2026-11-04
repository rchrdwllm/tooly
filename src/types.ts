export type Role = 'user' | 'assistant' | 'tool';

export type ToolStatus = 'running' | 'done' | 'error';

export interface ToolInfo {
  name: string;
  input: unknown;
  status: ToolStatus;
}

export interface ChatMessage {
  id: number;
  role: Role;
  content: string;
  tool?: ToolInfo;
}

export type AgentEvent =
  | {type: 'text'; text: string}
  | {type: 'tool-call'; id: string; name: string; input: unknown}
  | {type: 'tool-result'; id: string}
  | {type: 'tool-error'; id: string; error: string}
  | {type: 'usage'; inputTokens: number};
