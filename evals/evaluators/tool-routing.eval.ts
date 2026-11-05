import { evaluate } from "@lmnr-ai/lmnr";
import data from "../data/tool-routing.json" with { type: "json" };
import { singleTurnExecutor } from "../executor.js";
import { EvalTarget } from "../types.js";
import { toolSelectionScorer } from "./scorers/tool-selection.js";

evaluate({
  config: { concurrencyLimit: 1 },
  data: data as any,
  executor: singleTurnExecutor,
  evaluators: {
    toolRouting: (output, target?: EvalTarget) => {
      if (!target) return 0;

      return toolSelectionScorer(output, target);
    },
  },
  groupName: "tool-routing",
});
