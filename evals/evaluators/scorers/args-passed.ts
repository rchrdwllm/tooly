import { EvalTarget, ExecutorOutput } from "../../types.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const argsPassedScorer = (output: ExecutorOutput, target: EvalTarget): number => {
  if (!target.expectedArgs || Object.keys(target.expectedArgs).length === 0) {
    return 1; // no expected args, so we consider it a perfect match
  }

  const expectedArgs = target.expectedArgs;
  const actualArgs = output.toolCalls.filter(
    (call): call is typeof call & { args: Record<string, unknown> } =>
      isRecord(call.args),
  );

  let hits = 0;
  
  for (const [toolName, expected] of Object.entries(expectedArgs)) {
    if (
      isRecord(expected) &&
      actualArgs.some(
        (call) =>
          call.toolName === toolName &&
          Object.entries(expected).every(
            ([key, value]) => call.args[key] === value,
          ),
      )
    ) {
      hits++;
    }
  }

  const precision = hits / actualArgs.length || 0;
  const recall = hits / Object.keys(expectedArgs).length || 0;

  // Simple F1-ish score
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}