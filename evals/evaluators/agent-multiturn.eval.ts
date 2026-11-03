import { evaluate } from "@lmnr-ai/lmnr";
import dataset from "../data/multi-turn.json" with { type: "json" };
import { multiTurnExecutor } from "../executor.js";
import { MultiTurnEvalData } from "../types.js";
import { llmJudge } from "./scorers/lllm-judge.js";

evaluate({
  data: dataset as any,
  executor: async (data: MultiTurnEvalData) => {
    return multiTurnExecutor(data);
  },
  evaluators: {
    outputQuality: (output: any, target: any) => {
      return llmJudge(output, target);
    }
  }
})