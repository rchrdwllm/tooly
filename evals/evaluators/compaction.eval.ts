import { evaluate } from "@lmnr-ai/lmnr";
import data from "../data/compaction.json" with { type: "json" };
import { compactionExecutor } from "../executor.js";
import { CompactionEvalData } from "../types.js";
import { factRetention } from "./scorers/fact-retention.js";

evaluate({
  data: data as any,
  executor: async (data: CompactionEvalData) => {
    return compactionExecutor(data)
  },
  evaluators: {
    factRetention: (output: any, target: any) => {
      return factRetention(output, target)
    }
  },
  groupName: "compaction"
})