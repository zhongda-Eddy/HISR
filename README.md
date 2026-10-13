# HISR

**A little perspective for life's big questions.**

HISR helps people navigate uncertainty in relationships, career decisions, philosophical questions, and everyday life. It connects historical cases, philosophical ideas, and literary works so users can develop their own judgment.

The guiding belief: history, philosophy, and literature belong in the same conversation.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works immediately in **Preview mode** with topic-based templates and a curated reference library. Preview mode is clearly labeled and does not pretend to provide personalized AI analysis.

## Connect AI

1. Copy `.env.example` to `.env.local` using your editor.
2. Add your own `OPENAI_API_KEY` to `.env.local`.
3. Set `OPENAI_MODEL` if you want to use another Responses API model supporting structured outputs. The default is `gpt-4.1-mini`.
4. Restart the development server. The interface will show **AI connected**.

API keys remain on the server; do not put them in a variable beginning with `NEXT_PUBLIC_`. `.env.local` is ignored by Git. Using the API requires a separately enabled API account and may incur charges.

API responses use [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), are validated on the server, and can cite only the supplied curated source IDs. The request sets `store: false`; provider data policies still apply.

## What works

- Situation input with optional topic selection
- Connected historical, philosophical, and literary perspectives
- Source links, factual summaries, interpretations, and limits of analogy
- Two or three possible directions, their costs, and reflection questions
- Follow-up conversations, up to eight turns per session
- Optional browser-local saving, returning to a session, and deletion
- Searchable source library
- Responsive layouts, keyboard navigation, loading states, and helpful errors
- An initial check for explicit immediate-danger statements

Saving is opt-in. Up to twelve sessions are stored in browser `localStorage` on this device. Once saved, further turns update that saved session. Unsaved sessions disappear when the page is reloaded. No account or server database is used in this version.

## Edit the project

| File                      | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `content/sources.json`    | Human-editable source notes, citations, themes, and analogy limits |
| `components/hisr-app.tsx` | Interface and client interactions                                  |
| `app/globals.css`         | Visual design and responsive layout                                |
| `lib/consult.ts`          | AI instructions, Responses API request, and validation             |
| `lib/preview.ts`          | Explicitly labeled preview templates                               |
| `lib/knowledge.ts`        | Simple category and keyword retrieval                              |
| `lib/schemas.ts`          | Input, response, source, and saved-session contracts               |
| `docs/mvp-spec.md`        | Product specification                                              |

Source notes are brief paraphrases, not full books. Links point to primary texts and accessible editions. Connections are interpretations and are not evidence that a user's situation will have the same outcome.

## Verify

```sh
npm run typecheck
npm test
npm run build
npm start
```

## Windows and WSL

Use one environment for installation and running the app. In Windows, open `C:\Users\zhong\Projects\HISR`. In WSL, the same folder is `/mnt/c/Users/zhong/Projects/HISR`.

WSL needs its own Linux Node.js and npm installation. Windows and Linux can require different native dependencies, so do not run both environments against the same `node_modules` directory concurrently. For long-term WSL development, a separate clone under `~/projects/HISR` is preferable.

## Before public deployment

This MVP binds to loopback for local development. It is not deployed or pushed automatically. Before exposing its API publicly, add authentication, reliable rate limits and usage budgets, stronger crisis handling/moderation, and the appropriate privacy policy. The current explicit-language safety check is limited and does not detect every emergency.

RAG with embeddings, a larger reviewed collection, account-based storage, and a model-provider abstraction are future work. See [the product spec](docs/mvp-spec.md).
