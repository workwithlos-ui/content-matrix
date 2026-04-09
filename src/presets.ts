import type { ContentPreferences } from "./types";

export type ContentPreset = {
  id: string;
  label: string;
  description: string;
  preferences: ContentPreferences;
};

export const STARTER_PRESETS: ContentPreset[] = [
  {
    id: "operator-linkedin",
    label: "Operator LinkedIn",
    description: "Sharp, credible founder content for operators and executives.",
    preferences: {
      audience: "Founders, operators, and executive teams",
      brandVoice: "Sharp, premium, operator-led, direct",
      offerCta: "Invite qualified DMs or replies for strategic help",
      notes: "Use real operating tension, no generic creator language, keep it credible and specific.",
      campaignGoal: "Drive qualified conversations and authority",
      coreOffer: "Strategic advisory or audit",
      proofPoints: "Real operating lessons, before and after shifts, clear decision frameworks",
      competitorContext: "Generic AI content and shallow creator advice are the enemy",
      bannedClaims: "Avoid fake virality claims or made-up metrics",
      swipeFile: "Posts with hard-earned lessons, specific numbers, operator confessions, and punchy line breaks",
      sourceLibrary: "Founder notes, podcast clips, team call takeaways, operator screenshots",
      publishingOwner: "Founder",
      campaignWindow: "This week"
    }
  },
  {
    id: "creator-growth",
    label: "Creator Growth",
    description: "Fast-moving social content for creators, consultants, and audience growth.",
    preferences: {
      audience: "Creators, consultants, and audience builders",
      brandVoice: "Punchy, warm, internet-native, slightly contrarian",
      offerCta: "Push toward newsletter signup or direct conversation",
      notes: "Favor hooks, pattern interrupts, and personal proof. Keep it human and scroll-stopping.",
      campaignGoal: "Audience growth and subscriber capture",
      coreOffer: "Newsletter, community, or consulting offer",
      proofPoints: "Creator lessons, growth experiments, real audience response",
      competitorContext: "Most creator content is repetitive and empty",
      bannedClaims: "No fake six-figure screenshots or manufactured case studies",
      swipeFile: "Short-form hooks, confessional posts, creator myths, and pattern interrupts",
      sourceLibrary: "Voice notes, tweet drafts, screenshots, newsletter snippets",
      publishingOwner: "Content lead",
      campaignWindow: "Next 5 days"
    }
  },
  {
    id: "b2b-proof",
    label: "B2B Proof Engine",
    description: "Case-study heavy content for agencies, SaaS, and service businesses.",
    preferences: {
      audience: "B2B founders, marketers, and revenue leaders",
      brandVoice: "Calm authority, evidence-first, tactical",
      offerCta: "Direct readers to audit, call, or strategy offer",
      notes: "Prioritize proof texture, numbers with context, and repeatable frameworks.",
      campaignGoal: "Generate qualified pipeline and trust",
      coreOffer: "Audit, consulting engagement, or product demo",
      proofPoints: "Case studies, pipeline lessons, channel breakdowns, revenue metrics with context",
      competitorContext: "Competitors lean on jargon and recycled demand-gen talking points",
      bannedClaims: "No guaranteed ROI language or unsupported numbers",
      swipeFile: "Case studies, teardown threads, proof-led carousel posts, and sober operator commentary",
      sourceLibrary: "Case study docs, CRM notes, sales calls, dashboards",
      publishingOwner: "RevOps or growth lead",
      campaignWindow: "Current campaign sprint"
    }
  }
];
