import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/consult/route";
import { isSameOrigin } from "../lib/request-origin";

test("origin checks permit local aliases and reject unrelated sites", () => {
  assert.equal(
    isSameOrigin(
      new Request("http://localhost:3000/api/consult", {
        headers: { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOrigin(
      new Request("http://localhost:3000/api/consult", {
        headers: { origin: "http://127.0.0.1:3000", host: "localhost:3000" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOrigin(
      new Request("http://localhost:3000/api/consult", {
        headers: { origin: "https://unrelated.example" },
      }),
    ),
    false,
  );
  assert.equal(
    isSameOrigin(
      new Request("http://localhost:3000/api/consult", {
        headers: { origin: "http://localhost:9000" },
      }),
    ),
    false,
  );
});

test("route rejects malformed, excessive, and cross-origin payloads", async () => {
  const request = (body: string, headers: Record<string, string> = {}) =>
    new Request("http://localhost:3000/api/consult", {
      method: "POST",
      headers,
      body,
    });
  assert.equal((await POST(request("invalid-json"))).status, 400);
  assert.equal(
    (await POST(request(JSON.stringify({ question: "tiny" })))).status,
    400,
  );
  assert.equal((await POST(request("x".repeat(70001)))).status, 413);
  assert.equal(
    (
      await POST(
        request(
          JSON.stringify({ question: "A question about my next career" }),
          { origin: "https://unrelated.example" },
        ),
      )
    ).status,
    403,
  );
});
