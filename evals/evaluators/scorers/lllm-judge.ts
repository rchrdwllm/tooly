import z from "zod";
import { MultiTurnEvalTarget, MultiTurnExecutorOutput } from "../../types.js";
import { generateText, Output } from "ai";
import { MODEL } from "../../../src/agent/model.js";

const judgeSchema = z.object({
  score: z.number().min(0).max(10).describe("Score from 0 to 10, where 0 is the worst and 10 is the best"),
  reasoning: z.string().describe("Reasoning for the score, explaining why the output is good or bad"),
})

export const llmJudge = async (output: MultiTurnExecutorOutput, target: MultiTurnEvalTarget): Promise<number> => {
  const { output: object } = await generateText({
    model: MODEL,
    output: Output.object({
      schema: judgeSchema,
      name: "evaluation-result",
      description:
        "The evaluation result of the model's output against the target",
    }),
    instructions: `You are an expert evaluator of LLM results. You are given the output of a model and the target it was supposed
    to achieve. Your task is to evaluate how well the model's output matches the target and provide a score from
    0 to 10. Use this scoring criteria:
    
    - 10: The output perfectly matches the target and meets all expectations
    - 7-9: The output mostly matches the target, with minor issues or omissions
    - 4-6: The output partially matches the target, with significant issues or omissions
    - 1-3: The output barely matches the target, with major issues or omissions
    - 0: The output does not match the target at all and fails to meet expectations`,
    prompt: `Target original task: ${target.originalTask}
    Expected tools: ${target.expectedTools.join(", ")}
    Expected args: ${JSON.stringify(target.expectedArgs) || "None"}
    Forbidden tools: ${target.forbiddenTools?.join(", ") || "None"}

    Model output:
    Final response: ${output.finalResponse}
    Tool calls: ${JSON.stringify(output.toolCalls)}
    Tool call order: ${output.toolCallOrder.join(", ")}
    `,
  });

  return object.score / 10;
}