export type EvalData = {
  prompt: string;
  tools: string[];
}

export type MultiTurnToolData = {
  description: string;
  inputSchema: Record<string, any>;
  output: string;
};

export type MultiTurnEvalData = {
  prompt: string;
  mockTools: Record<string, MultiTurnToolData>;
};

export type EvalTarget = {
  expectedTools: string[];
  category: "golden" | "secondary" | "negative";
};

export type MultiTurnEvalTarget = {
  originalTask: string;
  expectedTools: string[];
  forbiddenTools?: string[];
  category: "golden" | "secondary" | "negative";
}

export type ExecutorOutput = {
  toolCalls: Array<{ toolName: string; args: unknown }>;
  toolNames: string[];
  selectedAny: boolean;
}

export type MultiTurnExecutorOutput = {
  toolCalls: Array<{ toolName: string; args: unknown }>;
  toolNames: string[];
  selectedAny: boolean;
  finalResponse: string;
  toolCallOrder: string[];
}