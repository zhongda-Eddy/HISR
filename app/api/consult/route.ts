import { NextResponse } from "next/server";
import { consult, ConsultationError } from "../../../lib/consult";
import { requestSchema } from "../../../lib/schemas";
import { isSameOrigin } from "../../../lib/request-origin";

export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403 },
    );
  }
  const reader = request.body?.getReader();
  if (!reader)
    return NextResponse.json(
      { error: "A question is required." },
      { status: 400 },
    );
  let raw = "",
    bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 70000) {
        await reader.cancel();
        return NextResponse.json(
          {
            error:
              "This conversation is too long. Please start a new reflection.",
          },
          { status: 413 },
        );
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const input = requestSchema.safeParse(data);
    if (!input.success)
      return NextResponse.json(
        { error: input.error.issues[0]?.message ?? "Check your question." },
        { status: 400 },
      );
    return NextResponse.json(await consult(input.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ConsultationError
            ? error.message
            : "Something went wrong. Please try again.",
      },
      { status: error instanceof ConsultationError ? error.status : 500 },
    );
  }
}
