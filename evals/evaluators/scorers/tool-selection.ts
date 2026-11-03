import type { EvalTarget, ExecutorOutput } from "../../types.js";

export const toolSelectionScorer = (
  output: ExecutorOutput,
  target: EvalTarget,
): number => {
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