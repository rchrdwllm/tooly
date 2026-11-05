import type {
  EvalTarget,
  ExecutorOutput,
  MultiTurnEvalTarget,
  MultiTurnExecutorOutput,
} from "../../types.js";

export const toolSelectionScorer = (
  output: ExecutorOutput,
  target: EvalTarget,
): number => {
  const forbiddenToolsSet = new Set(target.forbiddenTools || []);
  
  if (output.toolNames.some((toolName) => forbiddenToolsSet.has(toolName))) {
    return 0;
  }

  if (!target.expectedTools.length) {
    return output.selectedAny ? 0.5 : 1;
  }

  const expectedToolsSet = new Set(target.expectedTools);
  const selectedToolsSet = new Set(output.toolNames);

  const hits = output.toolNames.filter((toolName) =>
    expectedToolsSet.has(toolName),
  ).length;
  const precision =
    selectedToolsSet.size > 0 ? hits / selectedToolsSet.size : 0;
  const recall = expectedToolsSet.size > 0 ? hits / expectedToolsSet.size : 0;

  // Simple F1-ish score
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
};

// for multi-turn evals

// 0 if any forbidden tool was called, 1 otherwise
export const forbiddenToolsScorer = (
  output: MultiTurnExecutorOutput,
  target: MultiTurnEvalTarget,
): number => {
  const forbidden = new Set(target.forbiddenTools ?? []);
  const violated = output.toolCalls.some((call) =>
    forbidden.has(call.toolName),
  );

  return violated ? 0 : 1;
};

// Fraction of expected tools that were called with the expected arguments
const normalizeArg = (key: string, value: unknown) =>
  key.toLowerCase().includes("path") && typeof value === "string"
    ? value.replace(/^\.?\//, "").replace(/\/$/, "")
    : value;

export const expectedArgsScorer = (
  output: MultiTurnExecutorOutput,
  target: MultiTurnEvalTarget,
): number => {
  const expected = Object.entries(target.expectedArgs ?? {});
  if (expected.length === 0) return 1;

  const matches = expected.map(([toolName, expectedArgs]) =>
    output.toolCalls.some((call) => {
      const args = (call.args ?? {}) as Record<string, unknown>;

      return (
        call.toolName === toolName &&
        Object.entries(expectedArgs).every(
          ([key, value]) =>
            normalizeArg(key, args[key]) === normalizeArg(key, value),
        )
      );
    }),
  );

  return matches.filter(Boolean).length / matches.length;
};


// Penalizes repeated identical calls and exceeding the target's call budget
export const efficiencyScorer = (
  output: MultiTurnExecutorOutput,
  target: MultiTurnEvalTarget,
): number => {
  const total = output.toolCalls.length;
  if (total === 0) return 1;

  const seen = new Set<string>();
  let duplicates = 0;

  for (const call of output.toolCalls) {
    const key = `${call.toolName}:${JSON.stringify(call.args)}`;
    if (seen.has(key)) duplicates++;
    seen.add(key);
  }

  const dupScore = 1 - duplicates / total;
  const stepScore =
    target.maxToolCalls === undefined || total <= target.maxToolCalls
      ? 1
      : target.maxToolCalls / total;

  return Math.min(dupScore, stepScore);
};
