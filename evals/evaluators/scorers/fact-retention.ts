import { CompactionEvalTarget } from "../../types.js";

export const factRetention = (output: { summary: string; }, target: CompactionEvalTarget) => {
  const text = output.summary.toLowerCase();
  const kept = target.facts.filter(fact => fact.keywords.some(keyword => text.includes(keyword.toLowerCase())));

  return kept.length / target.facts.length;
}