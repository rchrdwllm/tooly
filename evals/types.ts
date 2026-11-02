export type EvalData = {
  prompt: string;
  tools: string[];
}

export type EvalTarget = {
  expectedTools: string[];
  category: "golden" | "secondary" | "negative";
};

export type ExecutorOutput = {
  toolCalls: Array<{ toolName: string; args: unknown }>;
  toolNames: string[];
  selectedAny: boolean;
}