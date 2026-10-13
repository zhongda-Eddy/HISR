# HISR MVP Specification v0.2

## Product definition

HISR helps people who feel uncertain about relationships, work, growth, values, or future decisions. By connecting historical cases, philosophical ideas, and literary works, it gives users context and inspiration to form their own judgment.

History offers context. Philosophy opens a lens. Literature makes it human.

## Principles

- Treat history, philosophy, and literature as connected ways of understanding a human question.
- Support the user's agency rather than decide for them.
- Distinguish factual source summaries from interpretations and uncertain parallels.
- Link every reference to a source; never invent quotations or citations.
- Explain differences as well as similarities.
- Do not replace professional medical, legal, financial, or crisis services.

## User flow

1. Describe a situation in 12–4,000 characters.
2. Optionally choose General, Relationships, Career, Growth, Meaning, or Values.
3. Receive a careful restatement and a useful tension to explore.
4. Read one historical, one philosophical, and one literary perspective.
5. Compare two or three possible directions and their benefits and costs.
6. Consider reflection questions and one small next step.
7. Add context or ask a follow-up; save the conversation if desired.

## Reflection format

- Title
- Understanding of the situation
- Core tension
- Three perspectives: source, connection, and difference
- Possible directions and tradeoffs
- Reflection questions
- One small next step

Factual summaries, authors, source links, and citations come from the reviewed starter collection. The model supplies interpretations, not new factual sources.

## MVP scope

- English interface, documentation, starter sources, and AI responses
- Responsive reflection room, library, saved reflections, and product explanation
- Next.js API route with validated input and structured output
- OpenAI Responses API with a server-only key
- Clearly labeled local preview when no API key is configured
- Category/keyword retrieval from nine reviewed starter entries
- Follow-up context with a limit of eight turns per session
- Optional browser-local storage of up to twelve sessions
- Source links and explicit analogy limits
- Initial urgent-danger handling and service error messages

## Implementation decisions

- Next.js App Router, React, TypeScript, and custom CSS
- Curated content in `content/sources.json`, editable without changing the interface
- LocalStorage for the first version: no accounts or server database yet
- API key configured in ignored `.env.local`
- Structured response validation and source-ID enforcement
- No automatic public deployment or remote Git push

These choices keep the first consultation loop small. Browser-local records are a deliberate change from the earlier SQLite/local-JSON suggestion: they avoid server-side retention and enable optional saving without accounts.

## Out of scope

- Complex accounts and permissions
- Social features
- Live web crawling
- Embeddings, vector database, or large-scale retrieval
- Native mobile applications
- Docker and public production deployment

## Acceptance criteria

- A user can submit a question within a minute.
- A reflection contains all three disciplines and at least two directions.
- Each reference has a verifiable link and a limit to its analogy.
- The user can continue, explicitly save, reopen, and remove a reflection.
- Preview templates are clearly distinguished from personalized AI output.
- The app works at desktop and mobile widths with keyboard-accessible controls.
- Invalid input and provider failures produce readable errors.
- No API key appears in client code or tracked files.

## Known limits and next work

The source library is deliberately small and its matches are sometimes broad. Neither source-ID validation nor structured output guarantees that every generated interpretation is correct. Preview mode cannot understand a unique situation beyond its template and topic selection.

Before a public launch, add authentication, usage budgets and rate limits, more comprehensive crisis detection, editorial review/evaluation, and privacy controls appropriate to the deployment. Then expand the source collection and consider embeddings-based RAG.
