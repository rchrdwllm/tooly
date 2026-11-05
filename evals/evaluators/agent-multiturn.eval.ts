import { evaluate } from "@lmnr-ai/lmnr";
import dataset from "../data/multi-turn.json" with { type: "json" };
import { multiTurnExecutor } from "../executor.js";
import { MultiTurnEvalData } from "../types.js";
import { llmJudge } from "./scorers/lllm-judge.js";
import { expectedArgsScorer, forbiddenToolsScorer } from "./scorers/tool-selection.js";

evaluate({
  data: dataset as any,
  executor: async (data: MultiTurnEvalData) => {
    return multiTurnExecutor(data);
  },
  evaluators: {
    forbiddenTools: (output: any, target: any) =>
      forbiddenToolsScorer(output, target),
    expectedArgs: (output: any, target: any) =>
      expectedArgsScorer(output, target),
    outputQuality: async (output: any, target: any) => {
      // A forbidden call fails the case, and the judge is not consulted
      if (forbiddenToolsScorer(output, target) === 0) return 0;

      return llmJudge(output, target);
    },
  },
});