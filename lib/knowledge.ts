import rawSources from "../content/sources.json";
import { sourceSchema, type Category } from "./schemas";

export const sources = rawSources.map((source) => sourceSchema.parse(source));
export function inferCategory(question: string, selected: Category): Category {
  if (selected !== "General") return selected;
  const text = question.toLowerCase();
  if (/\b(job|career|boss|work|quit|salary|profession)\b/.test(text))
    return "Career";
  if (
    /\b(friend|partner|relationship|family|parents|love|breakup|marriage)\b/.test(
      text,
    )
  )
    return "Relationships";
  if (/\b(ethics|moral|values|right|wrong)\b/.test(text)) return "Values";
  if (/\b(study|learn|growth|habit|college|university)\b/.test(text))
    return "Growth";
  return "Meaning";
}
export function retrieveSources(question: string, selected: Category) {
  const category = inferCategory(question, selected);
  const tokens = new Set(question.toLowerCase().match(/[a-z]+/g) ?? []);
  return (["History", "Philosophy", "Literature"] as const).flatMap((kind) =>
    sources
      .filter((s) => s.kind === kind)
      .map((s) => ({
        source: s,
        score:
          (s.categories.includes(category) ? 4 : 0) +
          s.tags.filter((tag) => tokens.has(tag)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.source),
  );
}
