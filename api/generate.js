export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `You are an expert content strategist and copywriter. You create high-quality, platform-specific content derivatives from a single topic or idea.

CRITICAL RULES:
- NEVER use em dashes (the long dash character). Use periods, commas, semicolons, or line breaks instead.
- Write in a conversational, engaging tone that feels human and authentic.
- Each piece of content must be unique, specific, and actionable.
- Tailor content format and tone to each platform best practices.
- Include relevant hashtags for social media posts.
- Make content practical and valuable, not generic filler.

Generate a complete 5-day content calendar:

Day 1: LinkedIn and Twitter Focus
- 3 LinkedIn posts (professional, thought-leadership style, 150-300 words each)
- 2 Twitter/X threads (5-8 tweets each, punchy and engaging)
- 1 Instagram carousel outline (8-10 slides with headline and key point per slide)

Day 2: Video and Email Focus
- 3 short-form video scripts (for Reels/Shorts/TikTok, 30-60 seconds each, with hook, body, CTA)
- 2 email newsletter sections (subject line, preview text, body with 200-400 words)

Day 3: Blog and Quotes Focus
- 2 blog post outlines (title, meta description, 5-7 sections with SEO keywords)
- 3 tweet-sized quotes (under 280 characters, shareable and impactful)

Day 4: Visual and Audio Focus
- 2 carousel concepts (theme, 8-10 slide outlines with visual direction)
- 1 podcast episode outline (title, intro hook, 4-5 talking points, closing CTA)
- 3 story ideas (Instagram/Facebook stories with text overlay suggestions)

Day 5: Long-form and Engagement Focus
- 1 long-form article outline (title, subtitle, 8-10 sections, estimated 2000+ words)
- 3 engagement posts (questions, polls, or interactive content for any platform)
- 2 DM templates (outreach messages for networking or collaboration)

Return valid JSON only. No markdown. No code blocks. Raw JSON matching the schema.`;

function buildUserPrompt(input, inputType) {
  if (inputType === "youtube") {
    return `Generate a complete 5-day content calendar based on this YouTube video URL: ${input}

Extract the likely topic, key themes, and talking points from the URL context and create derivative content around those themes.

NEVER use em dashes. Use periods, commas, or line breaks instead.`;
  }
  return `Generate a complete 5-day content calendar based on this topic: "${input}"

Create comprehensive, platform-specific content that explores different angles and subtopics. Make each piece unique, valuable, and ready to publish.

NEVER use em dashes. Use periods, commas, or line breaks instead.`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    const { input, inputType } = req.body;
    if (!input || !input.trim()) return res.status(400).json({ error: "Input is required" });

    const userPrompt = buildUserPrompt(input.trim(), inputType || "topic");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 16000,
        temperature: 0.8,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "content_calendar",
            strict: true,
            schema: {
              type: "object",
              properties: {
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "integer" },
                      label: { type: "string" },
                      description: { type: "string" },
                      pieces: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string" },
                            title: { type: "string" },
                            content: { type: "string" },
                            platform: { type: "string" },
                          },
                          required: ["type", "title", "content", "platform"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["day", "label", "description", "pieces"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["days"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return res.status(502).json({ error: `AI generation failed (${response.status}). Please try again.` });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return res.status(502).json({ error: "No content generated. Please try again." });

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({ error: "Failed to parse generated content. Please try again." });
    }

    // Remove any em dashes that slipped through
    const cleanDays = parsed.days.map((day) => ({
      ...day,
      description: (day.description || "").replace(/\u2014/g, ".").replace(/\u2013/g, ","),
      pieces: (day.pieces || []).map((piece) => ({
        ...piece,
        title: (piece.title || "").replace(/\u2014/g, ".").replace(/\u2013/g, ","),
        content: (piece.content || "").replace(/\u2014/g, ".").replace(/\u2013/g, ","),
      })),
    }));

    return res.status(200).json({
      topic: input.trim(),
      sourceType: inputType || "topic",
      days: cleanDays,
      generatedAt: Date.now(),
    });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
