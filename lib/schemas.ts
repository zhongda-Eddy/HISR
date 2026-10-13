import { z } from "zod";

export const categories = [
  "General",
  "Relationships",
  "Career",
  "Growth",
  "Meaning",
  "Values",
] as const;
export const categorySchema = z.enum(categories);
export type Category = z.infer<typeof categorySchema>;
export const sourceSchema = z.object({
  id: z.string(),
  kind: z.enum(["History", "Philosophy", "Literature"]),
  title: z.string(),
  author: z.string(),
  period: z.string(),
  summary: z.string(),
  takeaway: z.string(),
  limitation: z.string(),
  citation: z.string(),
  url: z.string().url(),
  categories: z.array(categorySchema),
  tags: z.array(z.string()),
});
export type Source = z.infer<typeof sourceSchema>;

export const reflectionSchema = z.object({
  title: z.string(),
  understanding: z.string(),
  tension: z.string(),
  perspectives: z
    .array(
      z.object({
        sourceId: z.string(),
        connection: z.string(),
        difference: z.string(),
      }),
    )
    .length(3),
  options: z
    .array(
      z.object({ title: z.string(), benefit: z.string(), cost: z.string() }),
    )
    .min(2)
    .max(3),
  questions: z.array(z.string()).min(2).max(4),
  smallStep: z.string(),
});
export type Reflection = z.infer<typeof reflectionSchema>;
export const requestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(12, "Please share a little more (at least 12 characters).")
    .max(4000),
  category: categorySchema.default("General"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(10000),
      }),
    )
    .max(6)
    .default([]),
});
export type ConsultRequest = z.infer<typeof requestSchema>;
export const replySchema = z.object({
  mode: z.enum(["preview", "live"]),
  reflection: reflectionSchema.nullable(),
  safetyMessage: z.string().nullable(),
});
export type ConsultReply = z.infer<typeof replySchema>;
export const turnSchema = z.object({
  question: z.string(),
  reply: replySchema,
});
export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  category: categorySchema,
  turns: z.array(turnSchema).min(1).max(8),
});
export type Session = z.infer<typeof sessionSchema>;
