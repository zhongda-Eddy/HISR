import { test } from "node:test";
import assert from "node:assert/strict";
import { consult, immediateSafetyConcern } from "../lib/consult";
import { sources, retrieveSources } from "../lib/knowledge";
import { createPreview } from "../lib/preview";
import { reflectionSchema, requestSchema, sessionSchema } from "../lib/schemas";

test("requests reject empty questions, oversized input, and invalid topics", () => {
  assert.equal(requestSchema.safeParse({ question: "short" }).success, false);
  assert.equal(
    requestSchema.safeParse({ question: "x".repeat(4001) }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({
      question: "I wonder what matters most",
      category: "Invalid",
    }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ question: "I wonder what matters most" }).success,
    true,
  );
});

test("all topics produce three traceable disciplines and meaningful tradeoffs in preview", () => {
  for (const category of [
    "General",
    "Relationships",
    "Career",
    "Growth",
    "Meaning",
    "Values",
  ] as const) {
    const input = requestSchema.parse({
      question: "I wonder what direction to take next",
      category,
    });
    const reflection = reflectionSchema.parse(createPreview(input));
    const kinds = reflection.perspectives.map(
      (p) => sources.find((s) => s.id === p.sourceId)?.kind,
    );
    assert.deepEqual(kinds, ["History", "Philosophy", "Literature"]);
    assert.ok(reflection.options.length >= 2);
    assert.ok(reflection.perspectives.every((p) => p.difference.length > 30));
  }
});

test("retrieval and follow-ups retain a career context", () => {
  const input = requestSchema.parse({
    question: "What if I am afraid of failure?",
    history: [
      {
        role: "user",
        content: "I am considering a career change and leaving my job.",
      },
    ],
  });
  assert.equal(createPreview(input).title, "Between security and possibility");
  assert.ok(createPreview(input).understanding.includes("follow-up"));
  assert.equal(
    retrieveSources("I am considering leaving my job", "General")[0].id,
    "darwin-beagle",
  );
});

test("explicit immediate danger returns support without historical analogies", async () => {
  assert.equal(immediateSafetyConcern("I want to end my life"), true);
  assert.equal(immediateSafetyConcern("My career feels uncertain"), false);
  const reply = await consult(
    requestSchema.parse({ question: "I want to end my life" }),
  );
  assert.equal(reply.reflection, null);
  assert.ok(reply.safetyMessage?.includes("emergency"));
});

test("saved session contract rejects broken browser data", () => {
  assert.equal(
    sessionSchema.safeParse({ id: "broken", turns: [] }).success,
    false,
  );
});

test("live transport uses structured output and rejects fabricated source IDs", async () => {
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.OPENAI_API_KEY;
  const oldMode = process.env.HISR_DEMO_MODE;
  const input = requestSchema.parse({
    question: "Should I explore a new career direction?",
    category: "Career",
  });
  process.env.OPENAI_API_KEY = "test-placeholder-not-a-real-key";
  process.env.HISR_DEMO_MODE = "false";
  try {
    let requestBody: Record<string, unknown> = {};
    globalThis.fetch = async (_url, options) => {
      requestBody = JSON.parse(String(options?.body));
      return Response.json({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify(createPreview(input)),
              },
            ],
          },
        ],
      });
    };
    assert.equal((await consult(input)).mode, "live");
    assert.equal(requestBody.store, false);
    assert.equal(
      (requestBody.text as { format: { strict: boolean } }).format.strict,
      true,
    );
    const invalid = createPreview(input);
    invalid.perspectives[0].sourceId = "fabricated-source";
    globalThis.fetch = async () =>
      Response.json({
        status: "completed",
        output: [
          { content: [{ type: "output_text", text: JSON.stringify(invalid) }] },
        ],
      });
    await assert.rejects(() => consult(input), /unsupported reference/);
    globalThis.fetch = async () => new Response("", { status: 401 });
    await assert.rejects(() => consult(input), /API key was not accepted/);
    globalThis.fetch = async () => Response.json({ status: "incomplete" });
    await assert.rejects(() => consult(input), /incomplete/);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = oldKey;
    if (oldMode === undefined) delete process.env.HISR_DEMO_MODE;
    else process.env.HISR_DEMO_MODE = oldMode;
  }
});
