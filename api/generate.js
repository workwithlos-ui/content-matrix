/**
 * Content Matrix - Elite AI Generation Engine
 * Platform-native, story-driven, tactically dense content.
 * Every piece should be screenshot-worthy.
 * No generic advice. No filler. No em dashes.
 */

import OpenAI from "openai";

export const config = {
  maxDuration: 120,
};

const PLATFORM_INSTRUCTIONS = {
  LinkedIn: `Write a LinkedIn post that opens with a specific story or surprising data point. NOT "Imagine if" or "In today's world" or any variation of those openers. The first sentence must make someone stop scrolling.

Deliver one complete tactical insight with specific numbers, percentages, dollar amounts, or timeframes. Show your work. Be specific about what happened, what changed, and by how much.

Short paragraphs (1-2 sentences each). Every paragraph earns its place or gets cut.

End with a thought-provoking question or contrarian take that invites real debate. Not "what do you think?" but something that makes people want to defend a position.

200-400 words. No hashtags. No em dashes. No "leverage AI" or "stay ahead of the curve" or "embrace technology." Write like you have done this, not like you read about it. This post should be good enough that someone screenshots it and shares it.`,

  Twitter: `Write a 5-7 tweet thread. Tweet 1 is a hook that stops the scroll: one specific claim with a number, a counterintuitive fact, or a bold statement that demands explanation. NOT vague openers.

Each tweet delivers exactly one specific insight. Use line breaks between ideas within a tweet. At least 3 tweets must include specific numbers, percentages, named frameworks, or dollar amounts.

Final tweet: the sharpest insight or most actionable takeaway. NOT "follow me for more" or any call to action.

Format each tweet as: Tweet 1: [text]\nTweet 2: [text] etc. Each tweet under 280 characters. No em dashes. No generic advice.`,

  Instagram: `Write an Instagram caption that tells a micro-story in the first line to hook the reader before the "more" cutoff (first 125 characters). Make it specific and intriguing.

Include 3-5 specific tactical points. Use line breaks and blank lines between sections for mobile readability. Write like you are texting a smart friend the real information, not publishing a press release.

End with a genuine question that makes people want to answer. Something specific, not "what do you think?"

150-300 words. No em dashes. No generic motivational language. 3-5 relevant hashtags at the very end after a blank line.`,

  TikTok: `Write a TikTok video script. The first 3 seconds are everything: one specific hook line that creates an immediate curiosity gap or makes a bold claim. Examples of good hooks: "I tracked [specific thing] for [specific time] and the results were shocking:", "The reason [common belief] is completely wrong:", "Nobody talks about this but [specific fact]" -- but make it original to this topic.

Structure:
[0-3 sec] Hook: bold claim or curiosity gap
[3-15 sec] Setup: quick context, why this matters right now
[15-45 sec] Payoff: 3 specific tactics or insights with numbers
[45-55 sec] Retention: "But here is where it gets interesting..."
[55-60 sec] Close: the sharpest takeaway as a punchy final line

Write in spoken language. Short sentences. Add [VISUAL CUE] notes for 3-4 key moments. Include specific numbers. No em dashes. No generic advice. Total: 60-75 seconds when read at normal pace.`,

  Email: `Write a newsletter section with:

SUBJECT LINE: Write 3 options. Each under 50 characters. Specific, curiosity-driven, no clickbait. Label them Subject 1:, Subject 2:, Subject 3:

OPENING: Start with a specific story or scenario that makes the reader feel seen. 2-3 sentences. Make it feel personal.

3 KEY INSIGHTS with bold headers:
Each insight includes: a specific example or case study, a number or data point, and one actionable step the reader can take today.

CLOSING: One sentence that creates anticipation or leaves them with something to think about. Not "see you next week."

400-600 words total. Conversational but authoritative. No em dashes. No "leverage AI" or "embrace technology." Write like you are emailing 10,000 smart people who will unsubscribe if you waste their time.`,

  Blog: `Create a detailed blog outline with:

TITLE OPTIONS (3): Each specific and click-worthy with a number or specific promise. Avoid "Ultimate Guide" or "Everything You Need to Know."

UNIQUE ANGLE: 2-3 sentences on what makes this post different from the 50 other posts on this topic.

TARGET READER: One sentence on exactly who this is for and what they already know.

OUTLINE (5-7 sections):
For each section: H2 title, 3-4 specific subtopics as bullet points, one suggested data point or example to include, estimated word count.

SEO NOTES: Primary keyword, 3 secondary keywords, meta description under 155 characters.

No em dashes. Be specific about what data and examples to include. The outline should be so detailed a writer could execute it without additional research.`,

  Podcast: `Write a podcast episode outline with:

EPISODE TITLE: Specific, intriguing, under 60 characters. Something that makes someone hit play while driving.

HOOK (0:00-2:00): Write the actual opening lines the host would say. A specific story, stat, or provocative claim. Not notes, actual spoken words.

SHOW NOTES DESCRIPTION: 3-4 sentences, specific about what listeners will learn. Include 2-3 concrete takeaways.

MAIN SEGMENTS (4-5 total with timestamps):
For each: timestamp range, segment title, 3-4 key talking points, one specific story or example to anchor it, one interview question if applicable.

QUOTABLE MOMENTS: 3 specific lines that would make great audiogram clips (under 30 seconds when spoken).

CALL TO ACTION: One specific, low-friction action listeners can take today. Not "subscribe and leave a review."

No em dashes. Write the hook in actual spoken language.`,
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
    ? `The content is based on a YouTube video about: "${topic}". Extract the core insights, frameworks, and specific examples from this topic.`
    : `The content is about: "${topic}". Use your knowledge to generate specific, tactical, data-driven content about this subject.`;

  return `You are an elite content creator who has written viral content for founders, executives, and creators with millions of followers. Your writing is specific, tactical, and story-driven. You are known for making people stop scrolling.

${sourceContext}

ABSOLUTE RULES (violating any of these means the content fails):
1. NEVER use em dashes (— or –). Use periods or commas instead.
2. NEVER open with "Imagine if" or "In today's world" or "In today's fast-paced" or any variation.
3. NEVER write generic advice like "leverage AI," "embrace technology," "stay ahead of the curve," or "unlock your potential."
4. ALWAYS include at least one specific number, percentage, dollar amount, or timeframe per piece.
5. Write in a confident, direct voice. Short paragraphs. Punchy sentences. No filler.
6. Every sentence must teach something or move the story forward. Cut everything else.
7. Platform-native writing: LinkedIn posts sound like LinkedIn. Tweets sound like tweets. Instagram sounds like Instagram. NOT the same content reformatted.
8. The standard: every piece should be good enough that someone screenshots it and shares it with a friend.`;
}

function buildDayPrompt(day, topic, dayTheme) {
  const platforms = Object.keys(PLATFORM_INSTRUCTIONS);
  const platformInstructions = platforms.map(p =>
    `=== ${p.toUpperCase()} ===\n${PLATFORM_INSTRUCTIONS[p]}`
  ).join("\n\n");

  return `Generate Day ${day} content for a 5-day content calendar.

Topic: ${topic}
Day ${day} Theme: ${dayTheme.label} — ${dayTheme.description}

All content for Day ${day} should explore the "${dayTheme.label}" angle of this topic.

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
  if (!text) return text;
  return text.replace(/\u2014/g, ".").replace(/\u2013/g, ",").replace(/\u2014/g, ".").replace(/\u2013/g, ",");
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

    // Generate all 5 days in parallel for speed
    const dayPromises = DAY_THEMES.map(async (dayTheme, index) => {
      const day = index + 1;
      const userPrompt = buildDayPrompt(day, topic, dayTheme);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.85,
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
