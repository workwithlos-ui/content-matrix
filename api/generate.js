/**
 * Content Matrix - Elite Content Decision Engine v3
 * Angle-first. Hook-driven. Anti-synthetic. Source-grounded.
 * Premium editorial operating system for operators and founders.
 * Zero AI slop. Zero em dashes. Zero filler. Zero template energy.
 */

import OpenAI from "openai";

export const config = {
  maxDuration: 120,
};

// ─── ANGLE ENGINE ──────────────────────────────────────────────
const ANGLE_MODES = [
  { id: "contrarian", label: "Contrarian Take", instruction: "Challenge conventional wisdom. Flip an accepted belief. Open with what everyone gets wrong and why. The reader should feel uncomfortable, then convinced." },
  { id: "case_study", label: "Case Study", instruction: "Tell a specific story with real numbers. What was broken, what changed, what happened. Show the before/after with enough detail that someone could replicate it." },
  { id: "founder_lesson", label: "Founder Lesson", instruction: "Share a hard-won lesson from building or operating. Include the mistake, the cost of the mistake, and the insight that came from it. Be honest about what went wrong." },
  { id: "market_warning", label: "Market Warning", instruction: "Sound an alarm about something most people are ignoring. Back it with evidence or pattern recognition. Create urgency without being alarmist." },
  { id: "framework", label: "Framework", instruction: "Introduce a mental model or decision framework. Name it. Show how to use it with a specific example. Make it sticky enough to remember." },
  { id: "myth_bust", label: "Myth Busting", instruction: "Name a popular belief and systematically dismantle it. Use specifics, not opinions. End with what actually works instead." },
  { id: "tactical", label: "Tactical Breakdown", instruction: "Show exactly how to do something. Specific tools, specific steps, specific numbers. Zero fluff. The reader should be able to execute after reading." },
  { id: "story_insight", label: "Story to Insight", instruction: "Start with a vivid, specific moment. Build tension. Reveal the insight that came from it. The story IS the argument." },
  { id: "prediction", label: "Prediction", instruction: "Make a specific, falsifiable prediction about what is coming. Back it with pattern recognition and evidence. Be bold but grounded." },
  { id: "teardown", label: "Teardown", instruction: "Analyze a real example (company, strategy, campaign, decision) and explain what works, what does not, and why. Be specific and fair." },
  { id: "hidden_cost", label: "Hidden Cost", instruction: "Expose a cost that people do not realize they are paying. Could be time, money, opportunity, reputation. Make the invisible visible with numbers." },
  { id: "uncomfortable_truth", label: "Uncomfortable Truth", instruction: "Say the thing nobody wants to say. The truth that is obvious once stated but that most people avoid. Back it with evidence." },
  { id: "operator_confession", label: "Operator Confession", instruction: "Admit something real. A failure, a wrong assumption, a thing you used to believe that turned out to be dead wrong. Vulnerability that builds authority." },
];
// ─── CTA STYLES ──────────────────────────────────────────────────
const CTA_STYLES = [
  { id: "soft_authority", instruction: "End with a calm, authoritative observation. No ask. Just a truth that lingers. Example: 'Worth auditing if your team handles inbound manually.'" },
  { id: "direct", instruction: "Clear, specific call to action. One thing to do. Example: 'If your response time is over 5 minutes, start there before buying more leads.'" },
  { id: "contrarian_cta", instruction: "End by flipping expected advice. Example: 'Do not spend another dollar on ads before fixing first response.'" },
  { id: "conversation", instruction: "Invite genuine exchange between operators. Example: 'Curious how other teams are enforcing first-response accountability.'" },
  { id: "operator_to_operator", instruction: "Speak peer-to-peer. Example: 'This is one of the first things I would fix in almost any service business.'" },
  { id: "dm_oriented", instruction: "Invite private conversation. Example: 'If this hit close to home, DM me. Happy to share the exact playbook.'" },
];

// ─── HOOK CATEGORIES ─────────────────────────────────────────────
const HOOK_TYPES = [
  "contrarian", "pain_first", "confession", "operator_insight",
  "teardown", "warning", "mistake", "hidden_cost", "myth_bust", "lesson"
];

// ─── SOURCE-GROUNDING ────────────────────────────────────────────
const SOURCE_GROUNDING_RULES = `
SOURCE-GROUNDING RULES (critical for trust):
Before writing, classify the source material:
- If real client data/results exist: use specific numbers with proof texture (what was broken, what changed, what surprised)
- If anecdote or personal experience: write from first person, use approximate numbers ("roughly $47K" not "$47,200")
- If opinion or observation: own it explicitly ("I believe", "In my experience", "What I have seen")
- If framework or model: name it, credit it if not original, show one concrete example
- If no real source: DO NOT invent precise metrics. Use insight, observation, or story mode instead.
PROOF TEXTURE (required when claiming numbers):
- What was broken before
- What specifically changed
- Where the number came from
- What behavior shifted
- What surprised you about the result
- What the audience should learn from it

METRIC TRUST RULES:
- If 3+ precise metrics appear in one piece, run a synthetic-trust check
- Round numbers signal honesty. Exact numbers demand proof context.
- Never stack unrelated stats. Each metric needs its own sentence of context.
- If you cannot explain WHERE a number came from, cut it.
`;

// ─── ANTI-SYNTHETIC FILTER ───────────────────────────────────────
const ANTI_SYNTHETIC_FILTER = `
ANTI-SYNTHETIC DETECTION (run this check on every piece):
1. EM DASH CHECK: Zero em dashes. Replace with periods or commas.
2. ADVERB DENSITY: Flag "significantly", "incredibly", "fundamentally", "essentially", "ultimately". Cut or replace with specifics.
3. CORPORATE FILLER: Kill "leverage", "utilize", "optimize", "streamline", "innovative", "cutting-edge", "game-changer", "dive into", "unpack", "let us explore".
4. OPENING LINE: Must NOT start with a question, "In today's...", "As a...", "When it comes to...", or any throat-clearing.
5. STRUCTURE: Vary paragraph lengths. Mix 1-sentence paragraphs with longer ones. No uniform block structure.
6. SPECIFICITY: Every claim needs a concrete detail. "Revenue increased" becomes "Revenue went from $12K/mo to $31K/mo in 90 days."
7. VOICE: Read it out loud. If any sentence sounds like it came from a language model, rewrite it.
8. HUMAN PROOF: Each piece must contain at least ONE of: a specific mistake admitted, a surprising detail, a number with context, a named tool or tactic, a moment of doubt or honesty.
`;

const BANNED_PATTERNS = `
BANNED WORDS AND PATTERNS (hard filter):
Never use: "game-changer", "dive into", "let us explore", "unpack", "deep dive"Never use: "revolutionize", "transformative", "elevate your", "unlock the power"
Never use: "In today's fast-paced", "In the world of", "As we navigate"
Never use: "It's no secret that", "The truth is", "Here's the thing"
Never use: "comprehensive", "robust", "seamless", "cutting-edge", "innovative"
Never use: "leverage", "utilize", "optimize" (unless in a technical/math context)
Never start with: "As a [role]...", "When it comes to...", "In today's..."
Never end with: "The future is...", "It's time to...", "Are you ready to..."
Em dashes (—) are BANNED. Use periods or commas instead.
Semicolons are BANNED in social content. Use periods.
Parenthetical asides are limited to 1 per piece maximum.
`;

// ─── PLATFORM INSTRUCTIONS ───────────────────────────────────────
const PLATFORM_INSTRUCTIONS = {
  LinkedIn: `LINKEDIN (scroll-stopping authority post):
- 1000-1600 characters. Every line earns the next line.
- FORMAT IS EVERYTHING. One thought per line. Lots of whitespace. Short punchy lines.
- First line is a COMMAND or CONFRONTATION that stops the scroll. Examples: "Stop doing X." / "X brands, listen up." / "Your Y is broken."
- Second line creates CONTRAST or TENSION. Example: "Your ads are optimised. Your funnel? Not so much."
- Use line breaks aggressively. Never more than 2 sentences in a row without a break.
- Emoji usage: 1-3 max, used as STRUCTURAL MARKERS for lists or section breaks (pointing finger, numbered squares). Never decorative.
- When listing tactical items, use numbered emoji (1️⃣ 2️⃣ 3️⃣) with one specific actionable per line.
- Include real acronyms and metrics where relevant (CRO, RPV, AOV, CAC, LTV) for credibility.
- CTA is soft but clear. "DM me X" or "Comment Y if you want Z."
- No hashtag spam. 0-2 max at the very end.
- Avoid: long paragraphs, storytelling mode, "I remember when...", walls of text.
- The post should feel like a founder calling out a problem and handing over the solution in under 60 seconds of reading.
- CRITICAL: If someone skimming only reads the first word of each line, they should still get the message.`,

  Twitter: `TWITTER/X (sharp + punchy):
- Thread format: 5-8 tweets. First tweet is the hook, must stand alone.
- Each tweet: max 280 chars. One idea per tweet.
- Tweet 1: Hook that stops scrolling. Tweet 2-6: Build the argument. Last tweet: CTA or takeaway.
- Use line breaks within tweets for rhythm.
- No emojis as bullet points. Minimal emoji use (0-2 per thread).
- Voice: confident, slightly provocative, peer-to-peer.
- The thread should read like a masterclass compressed into 60 seconds.`,
  Instagram: `INSTAGRAM (3-MODE FORMAT required):
Generate ALL THREE formats for every Instagram piece:

CAPTION MODE:
- 300-600 characters. Hook in first line. Story or insight in body. CTA at end.
- 3-5 relevant hashtags grouped at the end.
- Voice: personal, direct, slightly raw. Like a voice memo transcribed.

CAROUSEL MODE:
- 7-10 slides. Slide 1 is the hook (big, bold claim or question).
- Each slide: ONE idea, 15-25 words max. Visual-first thinking.
- Last slide: CTA or summary takeaway.
- Format each slide as "Slide N: [text]"

REEL SCRIPT MODE:
- 30-60 second script. Timestamp-based format.
- [0-3 sec] Hook that stops the scroll
- [3-15 sec] Context or setup
- [15-40 sec] Core insight or breakdown
- [40-55 sec] Proof or example
- [55-60 sec] CTA
- Voice: conversational, high energy, pattern-interrupt opening.
- Include camera directions: [talking to camera], [text overlay], [b-roll suggestion]`,

  TikTok: `TIKTOK (pattern-interrupt + authenticity):
- 30-60 second script. Hook in first 3 seconds or they scroll.
- Conversational, unpolished energy. Sound like you are telling a friend.
- Format: [0-3s] Hook > [3-20s] Context > [20-45s] Payoff > [45-60s] CTA
- Include: camera directions, text overlay suggestions, trending format references.
- The content should feel like catching someone mid-thought, not a presentation.`,
  Email: `EMAIL (intimate + valuable):
- Subject line: 6-10 words. Curiosity or specificity. No clickbait.
- Preview text: First 40 chars should compel the open.
- Body: 200-400 words. One core insight per email.
- Structure: Personal hook > Story/Context > Insight > One clear CTA
- Voice: like writing to one smart friend. Warm but substantive.
- No corporate newsletter energy. This is a personal note that delivers value.`,

  Blog: `BLOG (SEO + depth):
- Full outline with H2/H3 structure. 1500-2500 word target.
- Title: specific, benefit-driven, includes primary keyword naturally.
- Intro: Hook + promise + why this matters NOW.
- Body: 3-5 main sections, each with a specific example or proof point.
- Include: one original framework or model, specific numbers, actionable takeaways.
- Conclusion: Summary + CTA. No fluffy "in conclusion" energy.
- The post should be the definitive resource someone bookmarks.`,

  Podcast: `PODCAST (conversational + structured):
- Episode outline with 3-5 segments.
- Cold open: Start with the most interesting insight or story. No "welcome to the show."
- Each segment: clear topic, talking points, one specific example or story.
- Include: transition suggestions, audience engagement moments, callback opportunities.
- Tone: like explaining something important to a smart friend over coffee.
- End: clear takeaway + specific CTA (not just "subscribe").`,
};

const DAY_THEMES = [
  { label: "Core Insight", description: "The primary value proposition and most important insight from this topic" },
  { label: "Tactical Breakdown", description: "Step-by-step framework, specific process, or actionable how-to" },
  { label: "Data and Proof", description: "Statistics, case studies, real examples, and evidence-based angles" },
  { label: "Contrarian Take", description: "Challenge conventional wisdom, expose common mistakes, flip the narrative" },
  { label: "Future and Action", description: "What this means going forward, what to do next, the bigger picture" },
];
// ─── ANGLE SELECTION LOGIC ──────────────────────────────────────
function selectAnglesForDay(dayTheme, dayIndex) {
  const angleMap = {
    "Core Insight": ["story_insight", "founder_lesson", "framework"],
    "Tactical Breakdown": ["tactical", "case_study", "teardown"],
    "Data and Proof": ["case_study", "hidden_cost", "teardown"],
    "Contrarian Take": ["contrarian", "myth_bust", "uncomfortable_truth"],
    "Future and Action": ["prediction", "market_warning", "operator_confession"],
  };
  const angles = angleMap[dayTheme.label] || ["story_insight", "founder_lesson", "contrarian"];
  const primary = angles[dayIndex % angles.length];
  return ANGLE_MODES.find(a => a.id === primary) || ANGLE_MODES[0];
}

// ─── SYSTEM PROMPT BUILDER (v3) ─────────────────────────────────
function buildSystemPrompt(topic, sourceType, preferences = {}) {
  const audience = preferences.audience?.trim();
  const brandVoice = preferences.brandVoice?.trim();
  const offerCta = preferences.offerCta?.trim();
  const notes = preferences.notes?.trim();
  const sourceContext = sourceType === "youtube"
    ? `The content draws from a YouTube video about: "${topic}". Extract the sharpest insights, real frameworks, and specific examples. Treat the video as raw material to mine for gold, not something to summarize.`
    : `The content is about: "${topic}". Write from the perspective of someone who has DONE this, not read about it. First-person experience, specific details, real stakes.`;

  return `You are a human founder and operator who builds in public. You have scaled businesses, made expensive mistakes, and learned what actually works vs. what sounds good in a blog post. You write content that other founders screenshot and send to their partners.

You are NOT an AI. You are NOT a content marketer. You are NOT a copywriter. You are a practitioner who shares what they have learned. Your writing sounds like a smart person talking, not a machine generating.

${sourceContext}

${audience ? `PRIMARY AUDIENCE: ${audience}` : "PRIMARY AUDIENCE: founders, operators, and growth-minded decision makers."}
${brandVoice ? `BRAND VOICE: ${brandVoice}` : "BRAND VOICE: sharp, premium, direct, operator-led."}
${offerCta ? `COMMERCIAL CTA CONTEXT: ${offerCta}` : "COMMERCIAL CTA CONTEXT: default to soft authority or operator-to-operator CTAs unless the brief clearly needs a direct CTA."}
${notes ? `EXTRA CONTEXT TO RESPECT: ${notes}` : ""}

VOICE RULES (non-negotiable):
- Write in first person. "I" not "you should." "We tested" not "companies are finding."
- Contractions always. "I'm" not "I am." "Don't" not "do not." "Here's" not "here is."- Vary sentence length dramatically. Some sentences are 4 words. Some run longer to build a point.
- Occasional fragments are good. "Big difference." "Not even close." "Worth it."
- Be specific but GROUNDED. Only use precise numbers if you provide context for them.
- Include at least one moment of honesty or vulnerability per piece. Admit a mistake, share a doubt, acknowledge complexity.
- Sound like you are TALKING, not WRITING. Read it out loud. If it sounds stiff, rewrite it.
- Write with EDGE. Have a point of view. Be willing to say the uncomfortable thing.
- Every piece needs TENSION. Something at stake. A conflict. A surprise. A cost.

${SOURCE_GROUNDING_RULES}

${ANTI_SYNTHETIC_FILTER}

${BANNED_PATTERNS}

QUALITY CHECK: Before finishing each piece, ask yourself: "Would a real human post this on their personal account and be proud of it?" If it reads like AI wrote it, rewrite it until it does not.`;
}

// ─── DAY PROMPT BUILDER (v3 with angle engine + hooks + CTAs) ───
function buildDayPrompt(day, topic, dayTheme, angle) {
  const platforms = Object.keys(PLATFORM_INSTRUCTIONS);
  const platformInstructions = platforms.map(p =>
    `=== ${p.toUpperCase()} ===\n${PLATFORM_INSTRUCTIONS[p]}`
  ).join("\n\n");

  const ctaIndex1 = (day - 1) % CTA_STYLES.length;
  const ctaIndex2 = (day) % CTA_STYLES.length;
  const ctaStyle1 = CTA_STYLES[ctaIndex1];
  const ctaStyle2 = CTA_STYLES[ctaIndex2];

  return `Generate Day ${day} content for a 5-day content calendar.
Topic: ${topic}
Day ${day} Theme: ${dayTheme.label} / ${dayTheme.description}
ASSIGNED ANGLE: ${angle.label}
ANGLE INSTRUCTION: ${angle.instruction}

All Day ${day} content MUST be written through the "${angle.label}" angle. This is not optional. The angle shapes the hook, the body structure, the tone, and the CTA.

=== HOOK SYSTEM (CRITICAL) ===
For EACH platform piece, you must generate:
- 5 hook options (labeled Hook 1 through Hook 5, each from a DIFFERENT hook category: ${HOOK_TYPES.slice(0, 5).join(", ")})
- Pick the BEST hook as the opening of the content
- Include all 5 hooks in an "alt_hooks" field

Hook quality standard (this is the minimum bar):
- "We thought we had a lead problem. We actually had a speed problem."
- "Most businesses do not need more leads. They need to stop wasting the ones they already paid for."
- "The ad did its job. The team did not."
- "One ugly metric explained why deals kept slipping through."
Hooks must create TENSION. They must be SPECIFIC. They must make someone stop scrolling.

=== CTA SYSTEM ===
For each piece, generate 2 CTA options:
- CTA Style 1: ${ctaStyle1.id} / ${ctaStyle1.instruction}
- CTA Style 2: ${ctaStyle2.id} / ${ctaStyle2.instruction}
Use the stronger one in the content. Include both in a "cta_options" field.

=== CRITIQUE PASS (required) ===
After drafting each piece, score it mentally on:
- Hook strength (does it stop scrolling?)
- Specificity (are there real numbers with context?)- Credibility (would someone believe this was written by a real operator?)
- Platform fit (does it feel NATIVE to this platform?)
- Synthetic risk (does anything feel AI-generated?)
If any score is below 7/10, rewrite that section before outputting.

Each platform piece must feel COMPLETELY DIFFERENT from the others. Not the same idea reformatted. Each platform has its own native voice, structure, and energy.

${platformInstructions}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "day": ${day},
  "label": "${dayTheme.label}",
  "angle": "${angle.label}",
  "description": "One sentence describing what makes Day ${day} content unique",
  "pieces": [
    {
      "platform": "LinkedIn",
      "type": "Long-form post",
      "title": "Short descriptive title",
      "content": "Full post content here (using the best hook as opener)",
      "alt_hooks": ["Hook 1 text", "Hook 2 text", "Hook 3 text", "Hook 4 text", "Hook 5 text"],
      "cta_options": ["CTA option 1", "CTA option 2"]
    },
    {
      "platform": "Twitter",
      "type": "Thread",
      "title": "Short descriptive title",
      "content": "Full thread content here",
      "alt_hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],      "cta_options": ["CTA 1", "CTA 2"]
    },
    {
      "platform": "Instagram",
      "type": "Caption + Carousel + Reel",
      "title": "Short descriptive title",
      "content": "CAPTION VERSION:\\n[caption content]\\n\\nCAROUSEL VERSION:\\nSlide 1: [text]\\nSlide 2: [text]\\n...\\n\\nREEL SCRIPT:\\n[0-3 sec] [hook]\\n[3-20 sec] [context]\\n...",
      "alt_hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
      "cta_options": ["CTA 1", "CTA 2"]
    },
    {
      "platform": "TikTok",
      "type": "Video script",
      "title": "Short descriptive title",
      "content": "Full script here",
      "alt_hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
      "cta_options": ["CTA 1", "CTA 2"]
    },
    {
      "platform": "Email",
      "type": "Newsletter section",
      "title": "Short descriptive title",
      "content": "Full email section here",
      "alt_hooks": ["Subject 1", "Subject 2", "Subject 3", "Subject 4", "Subject 5"],
      "cta_options": ["CTA 1", "CTA 2"]
    },
    {
      "platform": "Blog",
      "type": "Blog outline",
      "title": "Short descriptive title",      "content": "Full outline here",
      "alt_hooks": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
      "cta_options": ["CTA 1", "CTA 2"]
    },
    {
      "platform": "Podcast",
      "type": "Episode outline",
      "title": "Short descriptive title",
      "content": "Full outline here",
      "alt_hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
      "cta_options": ["CTA 1", "CTA 2"]
    }
  ]
}`;
}

// ─── EM-DASH / SYNTHETIC CLEANUP ────────────────────────────────
function stripEmDashes(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/\u2014/g, ".")
    .replace(/\u2013/g, ",")
    .replace(/\u2015/g, ".")
    .replace(/\u2012/g, ",")
    .replace(/\s*--\s*/g, ". ")
    .replace(/\.\./g, ".")
    .replace(/\s+\./g, ".")
    .replace(/\.\s*,/g, ".")
    .replace(/,\s*\./g, ".");
}
function cleanPiece(piece) {
  return {
    ...piece,
    title: stripEmDashes(piece.title || ""),
    content: stripEmDashes(piece.content || ""),
    alt_hooks: (piece.alt_hooks || []).map(h => stripEmDashes(h)),
    cta_options: (piece.cta_options || []).map(c => stripEmDashes(c)),
  };
}

// ─── HANDLER ────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  if (!apiKey)
    return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    const { input, inputType, preferences } = req.body;
    if (!input || !input.trim())
      return res.status(400).json({ error: "Input is required" });
    const topic = input.trim();
    const sourceType = inputType || "topic";

    const openai = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });

    const systemPrompt = buildSystemPrompt(topic, sourceType, preferences);

    const dayPromises = DAY_THEMES.map(async (dayTheme, index) => {
      const day = index + 1;
      const angle = selectAnglesForDay(dayTheme, index);
      const userPrompt = buildDayPrompt(day, topic, dayTheme, angle);

      const modelCandidates = [
        process.env.OPENAI_MODEL,
        "gpt-4.1-mini",
        "gpt-4o-mini",
      ].filter(Boolean);

      let completion;
      let lastError;

      for (const model of modelCandidates) {
        try {
          completion = await openai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 6000,
            temperature: 0.82,
            response_format: { type: "json_object" },
          });
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!completion) {
        throw lastError || new Error(`Failed to generate day ${day}`);
      }

      const rawContent = completion.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error(`No content for day ${day}`);

      let parsed;      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error(`Failed to parse day ${day} content`);
      }

      return {
        day: parsed.day || day,
        label: stripEmDashes(parsed.label || dayTheme.label),
        angle: stripEmDashes(parsed.angle || angle.label),
        description: stripEmDashes(
          parsed.description || dayTheme.description
        ),
        pieces: (parsed.pieces || []).map(cleanPiece),
      };
    });

    const results = await Promise.all(dayPromises);
    results.sort((a, b) => a.day - b.day);

    return res.status(200).json({
      topic: topic,
      sourceType: sourceType,
      version: "v3",
      engine: "content-decision-engine",
      days: results,
      generatedAt: Date.now(),
      preferences: {
        audience: preferences?.audience || "",
        brandVoice: preferences?.brandVoice || "",
        offerCta: preferences?.offerCta || "",
        notes: preferences?.notes || "",
      },
    });
  } catch (err) {
    console.error("Generate error:", err);
    const msg = err?.message || "Internal server error. Please try again.";
    return res.status(500).json({ error: msg });
  }
}
