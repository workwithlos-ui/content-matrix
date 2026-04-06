/**
 * Content Matrix - Elite AI Generation Engine v2
 * Human-grade, platform-native, story-driven content.
 * Every piece reads like a human wrote it from experience.
 * Zero AI slop. Zero em dashes. Zero filler.
 */

import OpenAI from "openai";

export const config = {
  maxDuration: 120,
};

const PLATFORM_INSTRUCTIONS = {
  LinkedIn: `Write a LinkedIn post that sounds like a real founder or operator sharing a hard-won lesson. NOT a content marketer writing "thought leadership."

OPENING: Start mid-story. Drop the reader into a specific moment, decision, or realization. Examples of strong opens:
- "Last Tuesday I lost a $40K client. Here's what I learned."
- "We cut our team from 8 to 3. Revenue went up 40%."
- "I spent $12,000 on a strategy that returned $0. Then I changed one thing."
NEVER open with: "Imagine if", "In today's world", "Here's the thing about", "Let me tell you", "Most people don't realize", or any throat-clearing.

BODY: One core insight, told through what actually happened. Include at least 2 specific numbers (dollars, percentages, timeframes, team sizes). Short paragraphs. 1-3 sentences each. White space matters. Write like you're telling a smart friend over coffee, not presenting at a conference.

CLOSE: End with a sharp observation, a question that forces a real opinion, or a one-liner that sticks. NOT "what do you think?" or "agree?" Something like: "The uncomfortable truth is most businesses don't have a growth problem. They have a math problem."

VOICE: Conversational. Confident but not arrogant. Occasional incomplete sentences are fine. Contractions always. Never formal. Never corporate.

BANNED: em dashes (use periods or commas), hashtags, "leverage", "game-changer", "unlock", "embrace", "innovative", "synergy", "stay ahead of the curve", "in today's fast-paced", colons after every sentence, exclamation marks more than once.

200-400 words. This post should make someone think "damn, I need to save this."`,

  Twitter: `Write a 5-7 tweet thread that reads like rapid-fire insights from someone who's in the trenches, not observing from the sidelines.

Tweet 1 HOOK: A specific, concrete claim that demands explanation. Use a number. Examples:
- "I replaced a $180K/yr employee with a $200/mo AI stack. Here's exactly how:"
- "97% of businesses respond to leads in 4+ hours. The ones winning respond in under 60 seconds. Thread on why speed kills:"
NEVER start with: "Thread:", "Let's talk about", "Hot take:", "Unpopular opinion:"

EACH TWEET: One idea. One insight. Specific. At least 3 tweets must contain a hard number, dollar amount, or percentage. Write like you're texting someone smart, not writing a blog post. Incomplete sentences fine. Personality matters.

FINAL TWEET: The single sharpest takeaway. A line someone would screenshot. NOT "follow for more" or any CTA.

Format: Tweet 1: [text]\nTweet 2: [text] etc. Each under 280 chars. No em dashes. No generic motivation.`,

  Instagram: `Write an Instagram caption that sounds like a real person sharing real experience. NOT a brand posting content.

FIRST LINE (before the fold, under 125 chars): A specific hook that creates curiosity. Mid-story drops work great. "I almost said yes to a $50K deal that would've killed my business."

BODY: Tell the story or share the insight like you're voice-noting a friend. Use line breaks generously. Short paragraphs. Include 2-4 tactical takeaways with specific numbers. Write in first person. Be honest about mistakes and lessons.

CLOSE: Ask a specific question that makes people want to share their own experience. "What's a deal you walked away from that turned out to be the right call?"

VOICE: Casual. Real. First person. Contractions. Occasional humor or self-deprecation. Zero corporate speak.

150-300 words. No em dashes. 3-5 relevant hashtags after a blank line at the end.`,

  TikTok: `Write a TikTok script that sounds like someone talking to camera, not reading a script. Natural pauses, emphasis, personality.

[0-3 sec] HOOK: One line that stops the scroll. Bold, specific, slightly provocative. "I fired my $90K marketing team and hired AI agents for $200 a month. Six months later, here's the truth." Make it original to this exact topic.

[3-15 sec] CONTEXT: Quick setup. Why should anyone care right now? One or two sentences.

[15-45 sec] THE MEAT: 3 specific points with real numbers. Speak in short punchy sentences. Pause between points. [VISUAL CUE] notes for key moments. This is where the value lives.

[45-55 sec] THE TWIST: "But here's what nobody tells you..." or "The part that surprised me..." Add the nuance that makes this credible, not just hype.

[55-60 sec] CLOSER: One memorable line. The thing people repeat to their friends.

Write in spoken English. Fragments okay. Emphasis markers okay. No em dashes. No "guys" or "literally" overuse. 60-75 seconds at natural speaking pace.`,

  Email: `Write a newsletter section that people actually read instead of archiving.

SUBJECT LINES (3 options, labeled Subject 1/2/3): Under 50 chars each. Specific. Create genuine curiosity without clickbait. Think "what would make ME open this between meetings?" Examples: "We lost $40K. Here's what we changed." / "The $200/mo stack replacing $15K/mo teams"

OPENING (2-3 sentences): Drop into a specific moment or observation the reader will recognize from their own life. Make them feel seen. "You know that moment when a prospect ghosts after saying 'this is exactly what we need'? I tracked why it happens."

3 INSIGHTS (with bold headers):
Each one: a specific story or example, a real number, and one thing the reader can do today. Not "consider implementing AI" but "Open ChatGPT, paste your last 5 lost-deal notes, ask: what pattern do you see?"

CLOSER: One sentence. Forward-looking or thought-provoking. Not "see you next week" or "hit reply."

400-600 words. Write like you're emailing a smart friend who happens to run a business. Conversational. Specific. No em dashes. No "leverage AI" or "embrace technology."`,

  Blog: `Create a detailed, specific blog outline that a writer could execute without guessing.

TITLE OPTIONS (3): Specific. Click-worthy. Include a number or concrete promise. NOT "Ultimate Guide" or "Everything You Need to Know." Think: "How We Cut Response Time from 4 Hours to 58 Seconds (And Added $180K in Revenue)"

UNIQUE ANGLE: 2-3 sentences. What makes this different from the 50 existing posts on this topic? What insider perspective or data does this bring?

TARGET READER: One sentence. Who exactly, what they already know, what they're stuck on.

OUTLINE (5-7 sections):
For each: H2 title (specific, not generic), 3-4 subtopics with enough detail to write from, one data point or real example to include, estimated word count.

SEO: Primary keyword, 3 secondary keywords, meta description under 155 characters.

No em dashes. No generic section titles like "The Importance of X." Every section should teach something specific.`,

  Podcast: `Write a podcast episode outline with actual spoken-word hooks, not notes.

EPISODE TITLE: Under 60 chars. Makes someone hit play mid-commute. Not generic.

HOOK (0:00-2:00): Write the ACTUAL WORDS the host says. A story, a wild stat, a bold claim. "So last month, one of our clients automated their entire lead response system. Went from a 4-hour average response time to 58 seconds. Their close rate jumped 23%. And they didn't hire a single person. Let me tell you exactly how that happened."

SHOW NOTES: 3-4 sentences. Specific about what listeners learn. Include 2-3 concrete takeaways.

SEGMENTS (4-5 with timestamps):
Each: timestamp range, segment title, 3-4 talking points, one anchoring story or example, one question if it's an interview format.

QUOTABLE MOMENTS: 3 lines that work as audiogram clips (under 30 sec spoken). These should be sharp, memorable, self-contained.

CTA: One specific, low-friction action. Not "subscribe and review." Something like "Go time your team's average lead response. If it's over 5 minutes, DM me SPEED."

No em dashes. The hook must be written as actual speech, not bullet points.`,
};

const DAY_THEMES = [
  { label: "Core Insight", description: "The primary value proposition and most important insight from this topic" },
  { label: "Tactical Breakdown", description: "Step-by-step framework, specific process, or actionable how-to" },
  { label: "Data and Proof", description: "Statistics, case studies, real examples, and evidence-based angles" },
  { label: "Contrarian Take", description: "Challenge conventional wisdom, expose common mistakes, flip the narrative" },
  { label: "Future and Action", description: "What this means going forward, what to do next, the bigger picture" },
];

function buildSystemPrompt(topic, sourceType) {
  const sourceContext = sourceType === "youtube"
    ? `The content draws from a YouTube video about: "${topic}". Extract the sharpest insights, real frameworks, and specific examples. Treat the video as raw material, not something to summarize.`
    : `The content is about: "${topic}". Write from the perspective of someone who has DONE this, not read about it. First-person experience, specific details, real numbers.`;

  return `You are a human founder and operator who builds in public. You've scaled businesses, made expensive mistakes, and learned what actually works vs. what sounds good in a blog post. You write content that other founders screenshot and send to their partners.

You are NOT an AI. You are NOT a content marketer. You are NOT a copywriter. You are a practitioner who shares what they've learned. Your writing sounds like a smart person talking, not a machine generating.

${sourceContext}

VOICE RULES (non-negotiable):
- Write in first person. "I" not "you should." "We tested" not "companies are finding."
- Use contractions always. "I'm" not "I am." "Don't" not "do not." "Here's" not "here is."
- Vary sentence length dramatically. Some sentences are 4 words. Some run longer to build a point.
- Occasional fragments are good. "Big difference." "Not even close." "Worth it."
- Be specific to the point of being almost uncomfortably detailed. "$47,200 in Q3" not "significant revenue."
- Include at least one moment of honesty or vulnerability per piece. Admit a mistake, share a doubt, acknowledge complexity.
- Sound like you're TALKING, not WRITING. Read it out loud. If it sounds stiff, rewrite it.

ABSOLUTE BANS (instant fail if any appear):
- NEVER use em dashes (\u2014 or \u2013). Use periods, commas, or restructure the sentence.
- NEVER use en dashes. No dashes of any kind connecting thoughts.
- NEVER open with: "Imagine if", "In today's world", "In today's fast-paced", "Here's the thing", "Let me tell you", "Picture this", "What if I told you", "Most people don't realize"
- NEVER use: "leverage", "game-changer", "unlock", "empower", "innovative", "synergy", "revolutionize", "cutting-edge", "next-level", "stay ahead of the curve", "embrace technology", "digital transformation", "paradigm shift", "deep dive", "unpack", "at the end of the day", "it's not about X it's about Y" pattern
- NEVER use more than one exclamation mark in an entire piece
- NEVER end with "What do you think?" or "Agree or disagree?" or "Drop a comment"
- NEVER use the word "landscape" in a business context
- NEVER structure every paragraph the same way. Mix it up.
- NEVER use colon-heavy formatting (point: explanation. point: explanation.)

QUALITY CHECK: Before finishing each piece, ask yourself: "Would a real human post this on their personal account?" If it reads like AI wrote it, rewrite it until it doesn't.`;
}

function buildDayPrompt(day, topic, dayTheme) {
  const platforms = Object.keys(PLATFORM_INSTRUCTIONS);
  const platformInstructions = platforms.map(p =>
    `=== ${p.toUpperCase()} ===\n${PLATFORM_INSTRUCTIONS[p]}`
  ).join("\n\n");

  return `Generate Day ${day} content for a 5-day content calendar.

Topic: ${topic}
Day ${day} Theme: ${dayTheme.label}, ${dayTheme.description}

All Day ${day} content explores the "${dayTheme.label}" angle. Each platform piece must feel COMPLETELY DIFFERENT from the others. Not the same idea reformatted. Each platform has its own native voice, structure, and energy.

CRITICAL REMINDERS:
- Write as a real person sharing experience. First person. Specific numbers. Real stories.
- ZERO em dashes or en dashes anywhere. Not one. Use periods or commas instead.
- ZERO generic AI language. No "leverage", "unlock", "embrace", "game-changer", "landscape".
- Every piece needs at least 2 specific numbers (dollars, percentages, timeframes).
- Read each piece out loud in your head. If it sounds like AI wrote it, rewrite it.

${platformInstructions}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "day": ${day},
  "label": "${dayTheme.label}",
  "description": "One sentence describing what makes Day ${day} content unique",
  "pieces": [
    {"platform": "LinkedIn", "type": "Long-form post", "title": "Short descriptive title", "content": "Full post content here"},
    {"platform": "Twitter", "type": "Thread", "title": "Short descriptive title", "content": "Full thread content here"},
    {"platform": "Instagram", "type": "Caption", "title": "Short descriptive title", "content": "Full caption here"},
    {"platform": "TikTok", "type": "Video script", "title": "Short descriptive title", "content": "Full script here"},
    {"platform": "Email", "type": "Newsletter section", "title": "Short descriptive title", "content": "Full email section here"},
    {"platform": "Blog", "type": "Blog outline", "title": "Short descriptive title", "content": "Full outline here"},
    {"platform": "Podcast", "type": "Episode outline", "title": "Short descriptive title", "content": "Full outline here"}
  ]
}`;
}

function stripEmDashes(text) {
  if (!text || typeof text !== 'string') return text;
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
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    const { input, inputType } = req.body;
    if (!input || !input.trim()) return res.status(400).json({ error: "Input is required" });

    const topic = input.trim();
    const sourceType = inputType || "topic";

    const openai = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });

    const systemPrompt = buildSystemPrompt(topic, sourceType);

    const dayPromises = DAY_THEMES.map(async (dayTheme, index) => {
      const day = index + 1;
      const userPrompt = buildDayPrompt(day, topic, dayTheme);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.78,
        response_format: { type: "json_object" },
      });

      const rawContent = completion.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error(`No content for day ${day}`);

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error(`Failed to parse day ${day} content`);
      }

      return {
        day: parsed.day || day,
        label: stripEmDashes(parsed.label || dayTheme.label),
        description: stripEmDashes(parsed.description || dayTheme.description),
        pieces: (parsed.pieces || []).map(cleanPiece),
      };
    });

    const results = await Promise.all(dayPromises);
    results.sort((a, b) => a.day - b.day);

    return res.status(200).json({
      topic: topic,
      sourceType: sourceType,
      days: results,
      generatedAt: Date.now(),
    });

  } catch (err) {
    console.error("Generate error:", err);
    const msg = err?.message || "Internal server error. Please try again.";
    return res.status(500).json({ error: msg });
  }
}
