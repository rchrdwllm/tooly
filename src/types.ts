export type Role = 'user' | 'assistant' | 'tool';

export type ToolStatus = 'running' | 'done' | 'error' | 'awaiting-approval' | 'denied';

export interface ToolInfo {
  name: string;
  input: unknown;
  status: ToolStatus;
}

export interface PendingApproval {
  id: string;
  name: string;
  input: unknown;
  decide: (approved: boolean) => void;
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
  | {type: 'usage'; inputTokens: number}
  | {
      type: 'approval-request'; 
      id: string; 
      name: string; 
      input: unknown
      respond: (approved: boolean, reason?: string) => void
    }
