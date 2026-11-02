import { evaluate } from "@lmnr-ai/lmnr";
import data from "../data/date-time-tools.json" with { type: "json" };
import { executor } from "../executor.js";
import { EvalTarget } from "../types.js";
import { toolSelectionScorer } from "./tool-selection.js";

evaluate({
  data: data as any,
  executor: executor,
  evaluators: {
    toolSelectionScoring: (output, target?: EvalTarget) => {
      if (!target) {
        return 0;
      }

      if (target.category === 'secondary') {
        return 1;
      }

      return toolSelectionScorer(output, target);
    },
  },
});