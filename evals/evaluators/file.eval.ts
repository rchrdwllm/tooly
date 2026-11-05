import { evaluate } from "@lmnr-ai/lmnr";
import data from "../data/single-turn/file-tools.json" with { type: "json" };
import { singleTurnExecutor } from "../executor.js";
import { EvalTarget } from "../types.js";
import { toolSelectionScorer } from "./scorers/tool-selection.js";
import { argsPassedScorer } from "./scorers/args-passed.js";

evaluate({
  data: data as any,
  executor: singleTurnExecutor,
  evaluators: {
    toolSelectionScoring: (output, target?: EvalTarget) => {
      if (!target) {
        return 0;
      }

      if (target.category === "secondary") {
        return 1;
      }

      return toolSelectionScorer(output, target);
    },
    argsPassedScoring: (output, target?: EvalTarget) => {
      if (!target) {
        return 0;
      }

      if (target.category === "secondary") {
        return 1;
      }

      return argsPassedScorer(output, target);
    }
  },
  groupName: "single-turn/file-tools"
});