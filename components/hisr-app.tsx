"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  Compass,
  Feather,
  History,
  LoaderCircle,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  categories,
  replySchema,
  sessionSchema,
  type Category,
  type ConsultReply,
  type Session,
  type Source,
} from "../lib/schemas";

const STORAGE_KEY = "hisr.sessions.v1";
type View = "reflect" | "library" | "saved" | "about";
const examples = [
  {
    label: "A different direction",
    category: "Career" as Category,
    text: "I have a stable job, but it no longer feels meaningful. How can I explore a different career without making a reckless decision?",
  },
  {
    label: "A difficult relationship",
    category: "Relationships" as Category,
    text: "My family expects me to follow a path I do not want. How can I be honest about my choices without damaging our relationship?",
  },
  {
    label: "The question of enough",
    category: "Meaning" as Category,
    text: "I keep chasing the next achievement, but I am not sure what I actually want from life. How do I figure out what is enough?",
  },
];
const kindIcons = { History, Philosophy: Compass, Literature: BookOpen };

function Logo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36">
        <path d="M8 27V9M18 27V9M28 27V9M8 18h20" />
        <path d="M3 31h30M3 5h30" />
      </svg>
    </span>
  );
}
function PerspectiveArt() {
  return (
    <div className="perspective-art" aria-hidden="true">
      <span className="art-label art-history">HISTORY</span>
      <span className="art-label art-philosophy">PHILOSOPHY</span>
      <span className="art-label art-literature">LITERATURE</span>
      <svg viewBox="0 0 300 300">
        <defs>
          <radialGradient id="center">
            <stop offset="0" stopColor="#e3c88b" />
            <stop offset="1" stopColor="#f4efe4" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="119" />
        <circle cx="150" cy="150" r="94" />
        <circle cx="150" cy="150" r="65" />
        <ellipse
          cx="150"
          cy="150"
          rx="90"
          ry="123"
          transform="rotate(42 150 150)"
        />
        <ellipse
          cx="150"
          cy="150"
          rx="90"
          ry="123"
          transform="rotate(-42 150 150)"
        />
        <circle
          className="art-center"
          cx="150"
          cy="150"
          r="35"
          fill="url(#center)"
        />
        <path
          className="art-star"
          d="M150 127c0 16-7 23-23 23 16 0 23 7 23 23 0-16 7-23 23-23-16 0-23-7-23-23Z"
        />
        <circle className="art-dot" cx="67" cy="63" r="4" />
        <circle className="art-dot" cx="267" cy="150" r="4" />
        <circle className="art-dot" cx="85" cy="250" r="4" />
      </svg>
    </div>
  );
}
function Pillar({
  source,
  compact = false,
}: {
  source: Source;
  compact?: boolean;
}) {
  const Icon = kindIcons[source.kind];
  return (
    <article className={`source-card source-${source.kind.toLowerCase()}`}>
      <div className="source-kind">
        <Icon size={16} />
        <span>{source.kind}</span>
      </div>
      <h3>{source.title}</h3>
      <p className="source-author">
        {source.author} <span>· {source.period}</span>
      </p>
      <p>{source.summary}</p>
      {!compact && (
        <>
          <div className="source-takeaway">{source.takeaway}</div>
          <p className="source-limit">
            <strong>A limit to the analogy</strong>
            {source.limitation}
          </p>
        </>
      )}
      <a
        className="source-link"
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the source <ArrowUpRight size={14} />
      </a>
      {!compact && <small className="citation">{source.citation}</small>}
    </article>
  );
}

export function HisrApp({
  mode,
  sources,
}: {
  mode: "preview" | "live";
  sources: Source[];
}) {
  const [view, setView] = useState<View>("reflect");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [session, setSession] = useState<Session | null>(null);
  const [saved, setSaved] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [followup, setFollowup] = useState("");
  const [savingReady, setSavingReady] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed))
          setSaved(
            parsed.slice(0, 12).flatMap((item) => {
              const result = sessionSchema.safeParse(item);
              return result.success ? [result.data] : [];
            }),
          );
      }
      setSavingReady(true);
    } catch {
      setNotice(
        "Saved reflections could not be read. You can still reflect without saving.",
      );
    }
    return () => {
      requestController.current?.abort();
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileNav) return;
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNav(false);
        menuButtonRef.current?.focus();
      } else if (event.key === "Tab") {
        const buttons = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLButtonElement>("button") ??
            [],
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNav]);

  function flash(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(""), 5000);
  }
  function navigate(next: View) {
    setView(next);
    setMobileNav(false);
    setError("");
  }
  function newReflection() {
    requestId.current += 1;
    requestController.current?.abort();
    setBusy(false);
    setSession(null);
    setQuestion("");
    setFollowup("");
    setCategory("General");
    navigate("reflect");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function persist(next: Session[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next);
      return true;
    } catch {
      flash(
        "This browser could not save the reflection. Your current conversation is still here.",
      );
      return false;
    }
  }
  function saveSession() {
    if (!session || !savingReady) return;
    if (
      persist(
        [session, ...saved.filter((s) => s.id !== session.id)].slice(0, 12),
      )
    )
      flash("Reflection saved on this browser.");
  }
  async function submit(text: string, continuing = false) {
    if (busy) return;
    if (text.trim().length < 12) {
      setError("Tell us a little more — at least 12 characters.");
      return;
    }
    if (continuing && session && session.turns.length >= 8) {
      setError(
        "This reflection has reached eight turns. Start a new one to continue.",
      );
      return;
    }
    setBusy(true);
    setError("");
    const id = ++requestId.current;
    const controller = new AbortController();
    requestController.current = controller;
    const previous = continuing ? session : null;
    const history =
      previous?.turns.slice(-3).flatMap((t) => [
        { role: "user", content: t.question },
        {
          role: "assistant",
          content: JSON.stringify(
            t.reply.reflection ?? t.reply.safetyMessage,
          ).slice(0, 10000),
        },
      ]) ?? [];
    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          category: previous?.category ?? category,
          history,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ??
            "We could not finish this reflection. Please try again.",
        );
      const reply: ConsultReply = replySchema.parse(data);
      if (id !== requestId.current) return;
      const next: Session = {
        id: previous?.id ?? crypto.randomUUID(),
        title:
          previous?.title ?? reply.reflection?.title ?? "A moment for safety",
        createdAt: previous?.createdAt ?? new Date().toISOString(),
        category: previous?.category ?? category,
        turns: [...(previous?.turns ?? []), { question: text.trim(), reply }],
      };
      setSession(next);
      setFollowup("");
      // Existing saved sessions update only after a previous explicit save.
      if (saved.some((s) => s.id === next.id))
        persist(saved.map((s) => (s.id === next.id ? next : s)));
      setTimeout(
        () =>
          answerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
    } catch (err) {
      if (
        id === requestId.current &&
        !(err instanceof Error && err.name === "AbortError")
      )
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }
  const latest = session?.turns.at(-1);
  const reflection = latest?.reply.reflection;
  const isSaved = !!session && saved.some((s) => s.id === session.id);
  const library = sources.filter(
    (s) =>
      (filter === "All" || s.kind === filter) &&
      `${s.title} ${s.author} ${s.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="main-sidebar"
        className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}
      >
        <button
          className="brand"
          onClick={newReflection}
          aria-label="HISR home"
        >
          <Logo />
          <span>
            HISR<span className="brand-dot">.</span>
          </span>
        </button>
        <p className="brand-description">
          Old wisdom.
          <br />
          New perspectives.
        </p>
        <button className="new-button" onClick={newReflection}>
          <Plus size={17} />
          New reflection
        </button>
        <nav aria-label="Main navigation">
          <button
            aria-current={view === "reflect" ? "page" : undefined}
            className={view === "reflect" ? "active" : ""}
            onClick={() => navigate("reflect")}
          >
            <MessageCircle size={18} />
            Reflection room
          </button>
          <button
            aria-current={view === "saved" ? "page" : undefined}
            className={view === "saved" ? "active" : ""}
            onClick={() => navigate("saved")}
          >
            <Bookmark size={18} />
            Saved reflections
            {saved.length > 0 && (
              <span className="nav-count">{saved.length}</span>
            )}
          </button>
          <button
            aria-current={view === "library" ? "page" : undefined}
            className={view === "library" ? "active" : ""}
            onClick={() => navigate("library")}
          >
            <BookOpen size={18} />
            The library
          </button>
          <button
            aria-current={view === "about" ? "page" : undefined}
            className={view === "about" ? "active" : ""}
            onClick={() => navigate("about")}
          >
            <Compass size={18} />
            The idea behind HISR
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-illustration">
            <Feather size={28} strokeWidth={1} />
            <span>
              A little space
              <br />
              to see things differently.
            </span>
          </div>
          <div className="sidebar-foot">
            <span className="status-dot" />
            YOUR PERSONAL READING ROOM
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-location">
            <button
              ref={menuButtonRef}
              className="mobile-menu icon-button"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation"
              aria-expanded={mobileNav}
              aria-controls="main-sidebar"
            >
              {mobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>HISR</span>
            <span className="breadcrumb-slash">/</span>
            <span>
              {view === "reflect"
                ? "Reflection room"
                : view === "library"
                  ? "The library"
                  : view === "saved"
                    ? "Saved reflections"
                    : "Our philosophy"}
            </span>
          </div>
          <div className={`mode-badge ${mode}`}>
            <span className="status-dot" />
            {mode === "preview" ? "Preview mode" : "AI connected"}
          </div>
        </header>
        <main id="main-content" className="main-content">
          {notice && (
            <div className="toast" role="status">
              <Check size={16} />
              {notice}
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {view === "reflect" && (
            <>
              {!session && (
                <>
                  <section className="hero">
                    <div className="hero-copy">
                      <div className="eyebrow">
                        <span className="tiny-star">✦</span> A SPACE FOR YOUR
                        NEXT CHAPTER
                      </div>
                      <h1>
                        Some questions deserve
                        <br />a little <em>perspective.</em>
                      </h1>
                      <p>
                        Bring what’s on your mind. Find a new way to look at it
                        <br className="desktop-break" /> through history,
                        philosophy, and literature.
                      </p>
                    </div>
                    <PerspectiveArt />
                  </section>
                  <section className="compose-layout">
                    <div className="compose-card">
                      <div className="card-heading">
                        <span className="eyebrow">START WHERE YOU ARE</span>
                        <Feather size={20} strokeWidth={1.3} />
                      </div>
                      <h2>What’s on your mind?</h2>
                      <p className="compose-description">
                        A decision, a relationship, or a question you can’t
                        quite put down.
                      </p>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submit(question);
                        }}
                      >
                        <label className="sr-only" htmlFor="question">
                          Describe your situation
                        </label>
                        <textarea
                          ref={inputRef}
                          id="question"
                          value={question}
                          onChange={(event) => setQuestion(event.target.value)}
                          maxLength={4000}
                          rows={6}
                          placeholder="I’ve been thinking about…"
                          disabled={busy}
                          required
                          minLength={12}
                        />
                        <div className="textarea-footer">
                          <span>
                            Take your time. There’s no perfect way to start.
                          </span>
                          <span>
                            {question.length.toLocaleString()} / 4,000
                          </span>
                        </div>
                        <fieldset className="topic-field">
                          <legend>
                            A little context <span>(optional)</span>
                          </legend>
                          <div className="topic-chips">
                            {categories.map((item) => (
                              <button
                                type="button"
                                key={item}
                                aria-pressed={category === item}
                                className={category === item ? "selected" : ""}
                                onClick={() => setCategory(item)}
                                disabled={busy}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                        {error && (
                          <p className="error-message" role="alert">
                            {error}
                          </p>
                        )}
                        <div className="compose-actions">
                          <span>
                            <ShieldCheck size={14} />
                            Saved only when you choose
                          </span>
                          <button
                            className="primary-button"
                            type="submit"
                            disabled={busy || question.trim().length < 12}
                          >
                            {busy ? (
                              <>
                                <LoaderCircle className="spin" size={17} />
                                Finding perspective…
                              </>
                            ) : (
                              <>
                                Find perspective <ArrowRight size={17} />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                    <aside className="how-card">
                      <span className="eyebrow">THREE WAYS OF SEEING</span>
                      <h2>
                        You’re not the first
                        <br />
                        to wonder.
                      </h2>
                      <p>The details are yours. The questions connect us.</p>
                      <div className="pillar-row">
                        <span className="pillar-icon history">
                          <History size={20} strokeWidth={1.5} />
                        </span>
                        <div>
                          <h3>History offers context.</h3>
                          <p>Real lives, familiar crossroads.</p>
                        </div>
                      </div>
                      <div className="pillar-row">
                        <span className="pillar-icon philosophy">
                          <Compass size={20} strokeWidth={1.5} />
                        </span>
                        <div>
                          <h3>Philosophy opens a lens.</h3>
                          <p>Ideas that make room to think.</p>
                        </div>
                      </div>
                      <div className="pillar-row">
                        <span className="pillar-icon literature">
                          <BookOpen size={20} strokeWidth={1.5} />
                        </span>
                        <div>
                          <h3>Literature makes it human.</h3>
                          <p>Stories that help us recognize ourselves.</p>
                        </div>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate("about")}
                      >
                        The idea behind HISR <ArrowUpRight size={15} />
                      </button>
                    </aside>
                  </section>
                  <section className="examples">
                    <div className="section-heading">
                      <span className="eyebrow">NOT SURE WHERE TO BEGIN?</span>
                      <span className="muted">Borrow a starting point.</span>
                    </div>
                    <div className="example-grid">
                      {examples.map((item, index) => (
                        <button
                          key={item.label}
                          className="example-card"
                          disabled={busy}
                          onClick={() => {
                            setQuestion(item.text);
                            setCategory(item.category);
                            inputRef.current?.focus();
                          }}
                        >
                          <span className="example-number">0{index + 1}</span>
                          <span>
                            <strong>{item.label}</strong>
                            <span>{item.text}</span>
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {session && latest && (
                <div className="reflection-result" ref={answerRef}>
                  <div className="result-toolbar">
                    <button className="text-button" onClick={newReflection}>
                      <ChevronLeft size={16} />
                      New reflection
                    </button>
                    <button
                      className="secondary-button"
                      disabled={!savingReady || busy}
                      onClick={saveSession}
                    >
                      {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
                      {isSaved ? "Saved on this browser" : "Save reflection"}
                    </button>
                  </div>
                  <div className="eyebrow">
                    YOUR REFLECTION · {session.category.toUpperCase()}
                  </div>
                  <h1 className="result-title">
                    {reflection?.title ?? "Your safety comes first"}
                  </h1>
                  {latest.reply.mode === "preview" && (
                    <div className="preview-note">
                      <Sparkles size={16} />
                      <p>
                        <strong>A curated preview.</strong> These are
                        topic-based templates, not a personalized AI assessment.
                        Connect an API key to enable tailored reflections.
                      </p>
                    </div>
                  )}
                  <div className="user-question">
                    <MessageCircle size={17} />
                    <p>{latest.question}</p>
                  </div>
                  {latest.reply.safetyMessage && (
                    <div className="safety-card" role="alert">
                      <ShieldCheck size={24} />
                      <p>{latest.reply.safetyMessage}</p>
                    </div>
                  )}
                  {reflection && (
                    <>
                      <section className="understanding">
                        <span className="eyebrow">FIRST, YOUR SITUATION</span>
                        <p>{reflection.understanding}</p>
                        <div className="tension">
                          <span>A useful tension to explore</span>
                          <p>{reflection.tension}</p>
                        </div>
                      </section>
                      <section className="perspectives-section">
                        <div className="section-heading">
                          <h2>Three perspectives. One conversation.</h2>
                          <span className="muted">
                            Connections, not predictions.
                          </span>
                        </div>
                        <div className="perspectives-grid">
                          {reflection.perspectives.map((item) => {
                            const source = sources.find(
                              (s) => s.id === item.sourceId,
                            );
                            if (!source) return null;
                            const Icon = kindIcons[source.kind];
                            return (
                              <article
                                className={`perspective-card source-${source.kind.toLowerCase()}`}
                                key={source.id}
                              >
                                <div className="source-kind">
                                  <Icon size={17} />
                                  {source.kind}
                                </div>
                                <h3>{source.title}</h3>
                                <p className="source-author">
                                  {source.author} · {source.period}
                                </p>
                                <p className="source-fact">{source.summary}</p>
                                <div className="connection">
                                  <span>THE CONNECTION · INTERPRETATION</span>
                                  <p>{item.connection}</p>
                                </div>
                                <details>
                                  <summary>Where the analogy differs</summary>
                                  <p>{item.difference}</p>
                                </details>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="source-link"
                                >
                                  Read the source <ArrowUpRight size={14} />
                                </a>
                                <small className="citation">
                                  {source.citation}
                                </small>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                      <section className="options-section">
                        <div className="section-heading">
                          <h2>Ways you could move forward</h2>
                        </div>
                        <div className="options-grid">
                          {reflection.options.map((option, i) => (
                            <article className="option-card" key={i}>
                              <span className="option-number">0{i + 1}</span>
                              <h3>{option.title}</h3>
                              <span className="option-label">
                                What it could offer
                              </span>
                              <p>{option.benefit}</p>
                              <span className="option-label">
                                What it might ask of you
                              </span>
                              <p>{option.cost}</p>
                            </article>
                          ))}
                        </div>
                      </section>
                      <section className="questions-section">
                        <div>
                          <span className="eyebrow">
                            LET THE QUESTION KEEP OPENING
                          </span>
                          <h2>A few things to sit with.</h2>
                        </div>
                        <ol>
                          {reflection.questions.map((item, i) => (
                            <li key={i}>
                              <span>0{i + 1}</span>
                              {item}
                            </li>
                          ))}
                        </ol>
                      </section>
                      <div className="small-step">
                        <span className="pillar-icon">
                          <Feather size={23} strokeWidth={1.3} />
                        </span>
                        <div>
                          <span className="eyebrow">ONE SMALL NEXT STEP</span>
                          <p>{reflection.smallStep}</p>
                        </div>
                      </div>
                      <form
                        className="followup-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void submit(followup, true);
                        }}
                      >
                        <label htmlFor="followup">
                          There’s room to keep talking.
                        </label>
                        <p className="muted">
                          Add a detail, question a connection, or explore one of
                          these directions.
                        </p>
                        <div className="followup-input">
                          <textarea
                            id="followup"
                            value={followup}
                            onChange={(event) =>
                              setFollowup(event.target.value)
                            }
                            maxLength={4000}
                            minLength={12}
                            required
                            rows={2}
                            placeholder="What if…"
                            disabled={busy || session.turns.length >= 8}
                          />
                          <button
                            type="submit"
                            className="primary-button"
                            disabled={
                              busy ||
                              followup.trim().length < 12 ||
                              session.turns.length >= 8
                            }
                          >
                            {busy ? (
                              <LoaderCircle size={17} className="spin" />
                            ) : (
                              <ArrowRight size={17} />
                            )}
                            <span>{busy ? "Thinking…" : "Continue"}</span>
                          </button>
                        </div>
                        {error && (
                          <p className="error-message" role="alert">
                            {error}
                          </p>
                        )}
                        {session.turns.length >= 8 && (
                          <p className="muted">
                            This conversation has reached eight turns. Start a
                            new reflection to continue.
                          </p>
                        )}
                      </form>
                    </>
                  )}
                  {session.turns.length > 1 && (
                    <details className="earlier-turns">
                      <summary>
                        Earlier in this reflection ({session.turns.length - 1}){" "}
                        <ArrowDown size={14} />
                      </summary>
                      {session.turns.slice(0, -1).map((turn, index) => (
                        <div key={index}>
                          <p className="earlier-question">{turn.question}</p>
                          <p>
                            {turn.reply.reflection?.understanding ??
                              turn.reply.safetyMessage}
                          </p>
                          <p>{turn.reply.reflection?.smallStep}</p>
                        </div>
                      ))}
                    </details>
                  )}
                </div>
              )}
            </>
          )}

          {view === "library" && (
            <section className="library-page">
              <div className="eyebrow">THE READING ROOM</div>
              <h1>
                A few good places
                <br />
                to begin.
              </h1>
              <p className="page-description">
                A small, curated collection of lives, ideas, and stories. Every
                reference has a source, and every analogy has its limits.
              </p>
              <div className="library-controls">
                <div className="topic-chips">
                  {["All", "History", "Philosophy", "Literature"].map(
                    (kind) => (
                      <button
                        key={kind}
                        className={filter === kind ? "selected" : ""}
                        aria-pressed={filter === kind}
                        onClick={() => setFilter(kind)}
                      >
                        {kind}
                      </button>
                    ),
                  )}
                </div>
                <label className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Search the library"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ideas, authors…"
                  />
                </label>
              </div>
              <div className="library-grid">
                {library.map((source) => (
                  <Pillar source={source} key={source.id} />
                ))}
              </div>
              {library.length === 0 && (
                <div className="empty-state">
                  <Search size={30} />
                  <h2>No matching references.</h2>
                  <p>Try another author, theme, or category.</p>
                </div>
              )}
            </section>
          )}

          {view === "saved" && (
            <section className="saved-page">
              <div className="eyebrow">YOUR OWN THREAD OF THOUGHT</div>
              <h1>Reflections to return to.</h1>
              <p className="page-description">
                Saved on this browser, on this device. You decide what stays.
              </p>
              {saved.length === 0 ? (
                <div className="empty-state">
                  <Bookmark size={34} strokeWidth={1} />
                  <h2>A little room for what matters.</h2>
                  <p>
                    Save a reflection after a conversation, and you’ll find it
                    here.
                  </p>
                  <button className="primary-button" onClick={newReflection}>
                    Start a reflection <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="saved-list">
                  {saved.map((item) => (
                    <article className="saved-card" key={item.id}>
                      <button
                        className="saved-open"
                        onClick={() => {
                          setSession(item);
                          setCategory(item.category);
                          setFollowup("");
                          navigate("reflect");
                          window.scrollTo(0, 0);
                        }}
                      >
                        <span className="eyebrow">
                          {item.category} ·{" "}
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                        <h2>{item.title}</h2>
                        <p>{item.turns[0].question}</p>
                        <span className="source-link">
                          Return to this reflection <ArrowRight size={14} />
                        </span>
                      </button>
                      <button
                        className="icon-button delete-button"
                        aria-label={`Delete saved reflection: ${item.title}`}
                        onClick={() => {
                          if (persist(saved.filter((s) => s.id !== item.id)))
                            flash(
                              "Saved reflection removed from this browser.",
                            );
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "about" && (
            <section className="about-page">
              <div className="eyebrow">THE IDEA BEHIND HISR</div>
              <h1>
                A human question.
                <br />
                <em>More than one lens.</em>
              </h1>
              <p className="about-lead">
                History, philosophy, and literature belong in the same
                conversation.
              </p>
              <p>
                Life rarely arrives in tidy categories. A career decision can be
                a question of identity. A disagreement can hide a question about
                freedom. A story from another century can give words to
                something you have been feeling.
              </p>
              <p>
                HISR brings these perspectives together to help you examine your
                situation, recognize its tradeoffs, and form your own judgment.
              </p>
              <div className="about-principles">
                <article>
                  <span>01</span>
                  <h3>Context before conclusions.</h3>
                  <p>
                    Historical parallels invite questions. They cannot predict
                    the ending of your story.
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Ideas with their limits.</h3>
                  <p>
                    A philosophical lens is a way to think, not a rule you have
                    to follow.
                  </p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Stories that leave room.</h3>
                  <p>
                    Literature offers recognition and complexity. Your choices
                    remain yours.
                  </p>
                </article>
              </div>
              <div className="privacy-card">
                <ShieldCheck size={23} />
                <div>
                  <h3>Your words, your choice.</h3>
                  <p>
                    Unsaved reflections stay in the current page. Saving stores
                    them in this browser, without an account. In AI mode, your
                    question and recent conversation are sent to OpenAI to
                    generate a response; this app requests that responses not be
                    stored by the API. Your provider’s data policies still
                    apply. Preview mode uses local templates and sends nothing
                    to an AI provider.
                  </p>
                </div>
              </div>
              <p className="muted">
                HISR offers reflection, not professional medical, legal,
                financial, or crisis support. If there is immediate danger, seek
                help from local emergency services or a trusted person nearby.
              </p>
              <button className="primary-button" onClick={newReflection}>
                Bring your question <ArrowRight size={16} />
              </button>
            </section>
          )}

          <footer className="footer">
            <span>HISTORY · PHILOSOPHY · LITERATURE</span>
            <p>Perspective to support your judgment. The choice is yours.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
