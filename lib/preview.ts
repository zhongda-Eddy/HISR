import { inferCategory, retrieveSources } from "./knowledge";
import type { ConsultRequest, Reflection, Category } from "./schemas";

type Profile = {
  title: string;
  tension: string;
  connection: string;
  options: Reflection["options"];
  questions: string[];
  smallStep: string;
};
const career: Profile = {
  title: "Between security and possibility",
  tension:
    "One useful lens is the tension between protecting what supports you now and exploring what might fit you better. A reversible experiment can make that uncertainty more concrete.",
  connection:
    "This offers a way to examine uncertainty, expectations, and the difference between an imagined future and its everyday reality.",
  options: [
    {
      title: "Improve the current situation",
      benefit:
        "Keep stability while testing whether specific changes could make the situation more workable.",
      cost: "Some underlying constraints may remain; decide when you will reassess.",
    },
    {
      title: "Run a small experiment",
      benefit:
        "Learn about another direction through a project, conversation, or short course before committing.",
      cost: "This takes time and energy alongside your existing responsibilities.",
    },
    {
      title: "Prepare a considered transition",
      benefit:
        "Create space for a better fit while planning practical support.",
      cost: "Changing direction can involve financial risk and uncertainty; the right conditions depend on your circumstances.",
    },
  ],
  questions: [
    "Which part of the current situation would need to change for you to want to stay?",
    "What could you test without making an irreversible decision?",
    "Whose definition of success are you using?",
  ],
  smallStep:
    "Write two lists: what you need to protect, and what you want to explore. Choose one low-cost way to learn more this week.",
};
const relationships: Profile = {
  title: "Making room for understanding and boundaries",
  tension:
    "A useful starting point is to separate what happened, what you think it means, and what you need. Understanding another person and protecting your boundaries can both matter.",
  connection:
    "This invites a closer look at first impressions, the way disagreement is expressed, and the space each person needs to make choices.",
  options: [
    {
      title: "Ask for a clearer conversation",
      benefit:
        "Check assumptions and express one concrete need if a conversation feels safe.",
      cost: "The other person may not respond as you hope; clarity does not guarantee agreement.",
    },
    {
      title: "Set a specific boundary",
      benefit:
        "Make your limits visible and protect time, energy, or wellbeing.",
      cost: "A boundary may disappoint someone or change the relationship.",
    },
    {
      title: "Create some distance",
      benefit:
        "Give yourself space to notice patterns and consider what you want.",
      cost: "Distance can leave uncertainty unresolved and may need practical planning.",
    },
  ],
  questions: [
    "What did the person actually do, and what meaning have you added to it?",
    "What would a respectful outcome look like for you?",
    "Which boundary would help even if the other person does not change?",
  ],
  smallStep:
    "Draft one sentence describing an observable event and one sentence describing what you need. You do not have to send them yet.",
};
const meaning: Profile = {
  title: "Finding a direction you can live with",
  tension:
    "A helpful lens is the difference between a life that looks right from the outside and a life that feels worth living from within. You can explore that difference through ordinary choices.",
  connection:
    "This offers a lens on the relationship between daily practice, personal values, and expectations about a good life.",
  options: [
    {
      title: "Name what matters now",
      benefit:
        "Give your decisions a clearer reference point without needing a complete life plan.",
      cost: "Values can conflict; a list will not remove every tradeoff.",
    },
    {
      title: "Try a small practice",
      benefit:
        "Learn through an activity, commitment, or conversation that matters to you.",
      cost: "The experiment may disappoint you; noticing that is still useful information.",
    },
    {
      title: "Leave the question open for a while",
      benefit:
        "Allow reflection without forcing certainty before you have enough context.",
      cost: "Give yourself a review date so that openness does not become indefinite avoidance.",
    },
  ],
  questions: [
    "When have you felt engaged without needing to prove anything?",
    "Which expectation would you reconsider if nobody were watching?",
    "What would be worth doing even if it did not become a lifelong purpose?",
  ],
  smallStep:
    "Choose one value you care about and one small action that expresses it. Notice how that action feels rather than grading yourself.",
};
const profiles: Record<Category, Profile> = {
  General: meaning,
  Career: career,
  Relationships: relationships,
  Growth: meaning,
  Meaning: meaning,
  Values: meaning,
};

export function createPreview(input: ConsultRequest): Reflection {
  const context = [
    ...input.history.filter((h) => h.role === "user").map((h) => h.content),
    input.question,
  ].join(" ");
  const category = inferCategory(context, input.category);
  const profile = profiles[category];
  const pool = retrieveSources(context, category);
  const isFollowup = input.history.length > 0;
  return {
    title: profile.title,
    understanding: `${isFollowup ? "Your follow-up adds this concern" : "You shared this concern"}: “${input.question.slice(0, 500)}${input.question.length > 500 ? "…" : ""}” This preview offers a general starting point for reflection; it cannot infer the details of your situation.`,
    tension: profile.tension,
    perspectives: (["History", "Philosophy", "Literature"] as const).map(
      (kind) => {
        const source = pool.find((s) => s.kind === kind)!;
        return {
          sourceId: source.id,
          connection: `${profile.connection} ${source.takeaway}`,
          difference: source.limitation,
        };
      },
    ),
    options: profile.options,
    questions: isFollowup
      ? [
          "How does this new detail change what you need from the situation?",
          ...profile.questions.slice(0, 2),
        ]
      : profile.questions,
    smallStep: profile.smallStep,
  };
}
