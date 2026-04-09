/*
 * DESIGN SYSTEM: "Obsidian Signal" - $100M Quality
 * Deep space black (#080810) + electric violet/indigo gradients
 * Canvas particles, glassmorphism, 3D tilt, scroll reveals, micro-interactions
 * Fonts: Clash Display (display) + Satoshi/IBM Plex Sans (body) + JetBrains Mono (code)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ContentCalendar, ContentPiece, ContentPreferences, PieceScorecard } from "./types";
import { STARTER_PRESETS, type ContentPreset } from "./presets";

// ─── PARTICLE CANVAS ──────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use non-null assertion via local const to satisfy TypeScript strict mode
    const c: HTMLCanvasElement = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    let animId: number;
    let w = 0, h = 0;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }> = [];

    const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8"];

    function resize() {
      w = c.width = c.offsetWidth;
      h = c.height = c.offsetHeight;
    }

    function init() {
      particles.length = 0;
      const count = Math.min(Math.floor((w * h) / 14000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.8 + 0.4,
          alpha: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function draw() {
      cx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            cx.beginPath();
            cx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 130)})`;
            cx.lineWidth = 0.5;
            cx.moveTo(particles[i].x, particles[i].y);
            cx.lineTo(particles[j].x, particles[j].y);
            cx.stroke();
          }
        }
      }
      for (const p of particles) {
        cx.beginPath();
        cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = p.color;
        cx.globalAlpha = p.alpha;
        cx.fill();
        cx.globalAlpha = 1;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    }

    resize(); init(); draw();
    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(c);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}

// ─── TILT CARD ────────────────────────────────────────────────────────────────

function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateZ(6px)`;
    el.style.boxShadow = `${-x * 16}px ${-y * 16}px 50px rgba(99,102,241,0.12), 0 16px 50px rgba(0,0,0,0.4)`;
  };
  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    el.style.boxShadow = "";
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.12s ease, box-shadow 0.12s ease", willChange: "transform", ...style }}>
      {children}
    </div>
  );
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────

function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const runAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      let start = 0;
      const step = target / 55;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(Math.floor(start));
      }, 16);
    };
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        runAnimation();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    // Fallback: if element is already visible on load, animate after a short delay
    const fallback = setTimeout(() => {
      if (!hasAnimated.current) runAnimation();
    }, 1500);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "LinkedIn", label: "LinkedIn", short: "LI", color: "#0A66C2", desc: "Thought leadership posts that drive real conversations" },
  { id: "Twitter", label: "X / Twitter", short: "X", color: "#E7E9EA", desc: "Threads that stop the scroll and get shared" },
  { id: "Instagram", label: "Instagram", short: "IG", color: "#E1306C", desc: "Captions that hook, educate, and convert" },
  { id: "TikTok", label: "TikTok", short: "TT", color: "#69C9D0", desc: "Video scripts from hook to punchy close" },
  { id: "Email", label: "Email", short: "EM", color: "#F59E0B", desc: "Newsletter sections worth opening twice" },
  { id: "Blog", label: "Blog", short: "BL", color: "#10B981", desc: "SEO-optimized outlines with a unique angle" },
  { id: "Podcast", label: "Podcast", short: "PC", color: "#8B5CF6", desc: "Episode outlines with timestamps and quotables" },
];

const STEPS = [
  { num: "01", icon: "⌘", title: "Drop your source", body: "Paste a YouTube URL or type a topic. The engine extracts the core insight, the tactical framework, and the angle that makes it worth sharing." },
  { num: "02", icon: "◈", title: "AI builds the calendar", body: "Five days. Five distinct themes. Core insight, tactical breakdown, data and proof, contrarian take, future and action. Not the same post five times." },
  { num: "03", icon: "⚡", title: "Copy. Post. Repeat.", body: "Every piece is platform-native. LinkedIn posts sound like LinkedIn. Tweets sound like tweets. Edit, post, move on." },
];

const TESTIMONIALS = [
  { quote: "I used to spend 4 hours turning one podcast episode into social content. Now it takes 10 minutes. The LinkedIn posts actually sound like me.", name: "Marcus T.", role: "Founder, B2B SaaS", avatar: "MT" },
  { quote: "The Twitter threads this generates are genuinely good. Specific, punchy, no filler. I posted 3 this week and two went semi-viral.", name: "Priya K.", role: "Content Strategist", avatar: "PK" },
  { quote: "Finally an AI tool that does not write like a robot. The email newsletter sections are the best part. Saves me 2 hours every week.", name: "Jordan R.", role: "Creator, 85K subscribers", avatar: "JR" },
];

const LOADING_MSGS = [
  "Analyzing your topic...",
  "Crafting Day 1: Core Insight...",
  "Crafting Day 2: Tactical Breakdown...",
  "Crafting Day 3: Data and Proof...",
  "Crafting Day 4: Contrarian Take...",
  "Crafting Day 5: Future and Action...",
  "Finalizing your calendar...",
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const HISTORY_KEY = "content-matrix-history-v1";
  const PRESET_KEY = "content-matrix-presets-v1";
  const CLIENT_KEY = "content-matrix-client-profile-v1";
  const REVIEW_KEY = "content-matrix-review-state-v1";
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [clientProfile, setClientProfile] = useState("Default workspace");
  const [audience, setAudience] = useState("Founders and operators");
  const [brandVoice, setBrandVoice] = useState("Sharp, premium, operator-led");
  const [offerCta, setOfferCta] = useState("Invite replies or DMs for deeper strategy help");
  const [notes, setNotes] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("Drive qualified conversations and authority");
  const [coreOffer, setCoreOffer] = useState("Strategic advisory, service, or audit");
  const [proofPoints, setProofPoints] = useState("");
  const [competitorContext, setCompetitorContext] = useState("");
  const [bannedClaims, setBannedClaims] = useState("");
  const [swipeFile, setSwipeFile] = useState("");
  const [activePresetId, setActivePresetId] = useState<string>(STARTER_PRESETS[0].id);
  const [savedPresets, setSavedPresets] = useState<ContentPreset[]>([]);
  const [reviewState, setReviewState] = useState<Record<string, { status: "draft" | "approved" | "revise"; note: string }>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ContentCalendar | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activePlatform, setActivePlatform] = useState("LinkedIn");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [history, setHistory] = useState<ContentCalendar[]>([]);
  const toolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      // ignore malformed local history
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedPresets(parsed);
    } catch {
      // ignore malformed preset memory
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(CLIENT_KEY);
    if (saved) setClientProfile(saved);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REVIEW_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setReviewState(parsed);
    } catch {
      // ignore malformed review state
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(PRESET_KEY, JSON.stringify(savedPresets.slice(0, 10)));
  }, [savedPresets]);

  useEffect(() => {
    localStorage.setItem(CLIENT_KEY, clientProfile);
  }, [clientProfile]);

  useEffect(() => {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(reviewState));
  }, [reviewState]);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const scrollToTool = () => toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const applyPreferences = useCallback((preferences: ContentPreferences) => {
    setAudience(preferences.audience);
    setBrandVoice(preferences.brandVoice);
    setOfferCta(preferences.offerCta);
    setNotes(preferences.notes);
    setCampaignGoal(preferences.campaignGoal || "Drive qualified conversations and authority");
    setCoreOffer(preferences.coreOffer || "Strategic advisory, service, or audit");
    setProofPoints(preferences.proofPoints || "");
    setCompetitorContext(preferences.competitorContext || "");
    setBannedClaims(preferences.bannedClaims || "");
    setSwipeFile(preferences.swipeFile || "");
  }, []);

  const saveCurrentPreset = useCallback(() => {
    const label = input.trim()
      ? `Preset: ${input.trim().slice(0, 28)}`
      : `Preset ${savedPresets.length + 1}`;
    const preset: ContentPreset = {
      id: `saved-${Date.now()}`,
      label,
      description: "Saved from your current generator settings.",
      preferences: {
        audience: audience.trim(),
        brandVoice: brandVoice.trim(),
        offerCta: offerCta.trim(),
        notes: notes.trim(),
        campaignGoal: campaignGoal.trim(),
        coreOffer: coreOffer.trim(),
        proofPoints: proofPoints.trim(),
        competitorContext: competitorContext.trim(),
        bannedClaims: bannedClaims.trim(),
        swipeFile: swipeFile.trim(),
      }
    };
    setSavedPresets((prev) => [preset, ...prev.filter((item) => item.label !== preset.label)].slice(0, 10));
    setActivePresetId(preset.id);
    showToast("Preset saved");
  }, [audience, bannedClaims, brandVoice, campaignGoal, competitorContext, coreOffer, input, notes, offerCta, proofPoints, savedPresets.length, showToast, swipeFile]);

  const allPresets = [...STARTER_PRESETS, ...savedPresets];

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) { showToast("Enter a YouTube URL or topic first", false); return; }
    setIsGenerating(true); setLoadingStep(0); setResult(null);
    const interval = setInterval(() => setLoadingStep(p => Math.min(p + 1, LOADING_MSGS.length - 1)), 8000);
    const preferences: ContentPreferences = {
      audience: audience.trim(),
      brandVoice: brandVoice.trim(),
      offerCta: offerCta.trim(),
      notes: notes.trim(),
      campaignGoal: campaignGoal.trim(),
      coreOffer: coreOffer.trim(),
      proofPoints: proofPoints.trim(),
      competitorContext: competitorContext.trim(),
      bannedClaims: bannedClaims.trim(),
      swipeFile: swipeFile.trim(),
    };

    try {
      const isYT = input.includes("youtube.com") || input.includes("youtu.be");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          inputType: isYT ? "youtube" : "topic",
          email: email.trim() || undefined,
          preferences,
        }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Error" })); throw new Error(e.error || `HTTP ${res.status}`); }
      const data: ContentCalendar = await res.json();
      const enriched: ContentCalendar = {
        ...data,
        preferences,
        presetName: allPresets.find((preset) => preset.id === activePresetId)?.label,
        clientProfile,
      };
      setResult(enriched); setActiveDay(0); setActivePlatform("LinkedIn");
      setHistory(prev => [enriched, ...prev.filter(item => item.generatedAt !== enriched.generatedAt)].slice(0, 8));
      showToast("5-day content calendar ready");
      setTimeout(() => toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Generation failed", false);
    } finally { clearInterval(interval); setIsGenerating(false); }
  }, [input, email, audience, brandVoice, offerCta, notes, campaignGoal, coreOffer, proofPoints, competitorContext, bannedClaims, swipeFile, showToast, allPresets, activePresetId, clientProfile]);

  const handleCopy = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id); showToast("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [showToast]);

  const handleDownloadAll = useCallback(() => {
    if (!result) return;
    let text = `CONTENT MATRIX - 5-Day Calendar\nClient: ${result.clientProfile || clientProfile}\nTopic: ${result.topic}\nGenerated: ${new Date(result.generatedAt).toLocaleDateString()}\n\n`;
    if (result.strategyBrief) {
      text += `POSITIONING\n${result.strategyBrief.positioning}\n\nHOOK THEMES\n- ${result.strategyBrief.hookThemes.join("\n- ")}\n\nPROOF ASSETS\n- ${result.strategyBrief.proofAssets.join("\n- ")}\n\nCTA STRATEGY\n${result.strategyBrief.ctaStrategy}\n\n`;
    }
    text += `${"=".repeat(60)}\n\n`;
    result.days.forEach(day => {
      text += `DAY ${day.day}: ${day.label.toUpperCase()}\n${day.description}\n${"-".repeat(40)}\n\n`;
      day.pieces.forEach((p: ContentPiece) => { text += `[${p.platform.toUpperCase()} - ${p.type}]\n${p.title}\n\n${p.content}\n\n${"-".repeat(40)}\n\n`; });
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `content-matrix-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url); showToast("Downloaded all content");
  }, [clientProfile, result, showToast]);

  const handleDownloadClientPack = useCallback(() => {
    if (!result) return;
    const sections = result.days.flatMap((day) =>
      day.pieces.map((piece) => {
        const review = reviewState[`${result.generatedAt}-${day.day}-${piece.platform}`];
        return `## Day ${day.day} - ${piece.platform}
Title: ${piece.title}
Angle: ${day.angle || "N/A"}
Status: ${review?.status || "draft"}
Review note: ${review?.note || "None"}

### Content
${piece.content}

### Alternate hooks
- ${(piece.alt_hooks || []).join("\n- ")}

### CTA options
- ${(piece.cta_options || []).join("\n- ")}
`;
      })
    ).join("\n");

    const text = `# Content Matrix Client Pack

Client: ${result.clientProfile || clientProfile}
Topic: ${result.topic}
Preset: ${result.presetName || "Custom"}
Generated: ${new Date(result.generatedAt).toLocaleString()}

## Strategy
Positioning: ${result.strategyBrief?.positioning || "N/A"}
CTA strategy: ${result.strategyBrief?.ctaStrategy || "N/A"}
Hook themes:
- ${(result.strategyBrief?.hookThemes || []).join("\n- ")}

Proof assets:
- ${(result.strategyBrief?.proofAssets || []).join("\n- ")}

## Preferences
Audience: ${result.preferences?.audience || ""}
Brand voice: ${result.preferences?.brandVoice || ""}
Campaign goal: ${result.preferences?.campaignGoal || ""}
Core offer: ${result.preferences?.coreOffer || ""}
Proof bank: ${result.preferences?.proofPoints || ""}
Competitor context: ${result.preferences?.competitorContext || ""}
Swipe file: ${result.preferences?.swipeFile || ""}
Banned claims: ${result.preferences?.bannedClaims || ""}
Notes: ${result.preferences?.notes || ""}

${sections}`;

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-matrix-client-pack-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded client pack");
  }, [clientProfile, result, reviewState, showToast]);

  const currentDay = result?.days[activeDay];
  const currentPiece = currentDay?.pieces.find((p: ContentPiece) => p.platform === activePlatform);
  const currentPieceKey = currentDay && currentPiece && result
    ? `${result.generatedAt}-${currentDay.day}-${currentPiece.platform}`
    : "";

  const buildScorecard = useCallback((piece: ContentPiece | undefined): PieceScorecard | null => {
    if (!piece) return null;
    const text = piece.content.toLowerCase();
    const hooks = piece.alt_hooks || [];
    const hasNumbers = /\d/.test(piece.content);
    const hasOffer = !!coreOffer.trim() && text.includes(coreOffer.trim().toLowerCase().split(" ")[0]);
    const lineBreakDensity = piece.content.split("\n").filter(Boolean).length;
    const hookStrength = Math.min(10, 5 + Math.min(hooks.length, 5));
    const specificity = Math.min(10, (hasNumbers ? 4 : 2) + Math.min(6, Math.floor(piece.content.length / 280)));
    const offerAlignment = Math.min(10, hasOffer ? 8 : 5);
    const platformFit = Math.min(10, lineBreakDensity >= 4 ? 8 : 6);
    const overall = Math.round((hookStrength + specificity + offerAlignment + platformFit) / 4);
    const revisionPriorities = [];
    if (!hasNumbers) revisionPriorities.push("Add one proof point, number, or concrete example.");
    if (!hasOffer) revisionPriorities.push("Tighten offer alignment so the content points toward a real business outcome.");
    if (hooks.length < 5) revisionPriorities.push("Generate stronger alternate hooks before publishing.");
    if (lineBreakDensity < 3) revisionPriorities.push("Improve readability with sharper structure and pacing.");
    return { hookStrength, specificity, offerAlignment, platformFit, overall, revisionPriorities };
  }, [coreOffer]);

  const scorecard = buildScorecard(currentPiece);

  const buildCreativeBrief = useCallback((piece: ContentPiece | undefined, dayLabel?: string) => {
    if (!piece) return null;
    const hook = piece.alt_hooks?.[0] || piece.title;
    const cta = piece.cta_options?.[0] || offerCta;
    const contentPreview = piece.content.split("\n").filter(Boolean).slice(0, 3).join(" ");
    return {
      hook,
      visualDirection: `Premium ${piece.platform} execution for ${dayLabel || "campaign"} with a ${brandVoice.toLowerCase()} tone.`,
      scenes: [
        `Open with: ${hook}`,
        `Middle section should unpack: ${contentPreview.slice(0, 160)}${contentPreview.length > 160 ? "..." : ""}`,
        `Close with CTA: ${cta}`
      ]
    };
  }, [brandVoice, offerCta]);

  const creativeBrief = buildCreativeBrief(currentPiece, currentDay?.label);

  const updateReview = useCallback((updates: Partial<{ status: "draft" | "approved" | "revise"; note: string }>) => {
    if (!currentPieceKey) return;
    setReviewState((prev) => ({
      ...prev,
      [currentPieceKey]: {
        status: updates.status || prev[currentPieceKey]?.status || "draft",
        note: updates.note ?? prev[currentPieceKey]?.note ?? ""
      }
    }));
  }, [currentPieceKey]);

  const V = "#6366f1"; // violet primary
  const BG = "#080810"; // background

  return (
    <div style={{ backgroundColor: BG, color: "#E8E8F0", minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", overflowX: "hidden" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999, padding: "14px 22px", borderRadius: "12px", background: toast.ok ? "rgba(99,102,241,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.ok ? "rgba(99,102,241,0.35)" : "rgba(239,68,68,0.35)"}`, backdropFilter: "blur(20px)", color: toast.ok ? "#a5b4fc" : "#fca5a5", fontSize: "14px", fontWeight: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", animation: "slideUp 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: "64px", display: "flex", alignItems: "center", background: "rgba(8,8,16,0.75)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)", flexShrink: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>CM</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8E8F0", letterSpacing: "-0.02em" }}>Content Matrix</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "13px", color: "rgba(232,232,240,0.35)" }}>Free tool by ELIOS</span>
            <button onClick={scrollToTool} style={{ padding: "9px 22px", borderRadius: "8px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "13px", fontWeight: 700, boxShadow: "0 0 20px rgba(99,102,241,0.3)", transition: "all 0.2s ease" }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 0 30px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 0 20px rgba(99,102,241,0.3)"; }}>
              Try free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "64px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 20% 60%, rgba(79,70,229,0.08) 0%, transparent 50%)", animation: "meshPulse 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <ParticleCanvas />
        <div style={{ position: "absolute", top: "20%", left: "8%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", animation: "float 7s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite reverse", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ maxWidth: "880px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: "32px", backdropFilter: "blur(10px)" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px rgba(99,102,241,0.8)", animation: "livePulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase" }}>Free AI Content Engine</span>
            </div>

            <h1 style={{ fontWeight: 800, fontSize: "clamp(3rem, 7.5vw, 7rem)", lineHeight: 0.97, letterSpacing: "-0.04em", marginBottom: "28px", color: "#E8E8F0" }}>
              One idea.{" "}
              <span style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                30+ pieces
              </span>
              {" "}of content.
            </h1>

            <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(232,232,240,0.5)", maxWidth: "560px", lineHeight: 1.7, marginBottom: "48px", fontWeight: 400 }}>
              Paste a YouTube URL or topic. Get a complete 5-day content calendar for LinkedIn, X, Instagram, TikTok, Email, Blog, and Podcast. Platform-native. Ready to post.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "80px" }}>
              <button onClick={scrollToTool} style={{ padding: "16px 36px", borderRadius: "12px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "16px", fontWeight: 700, boxShadow: "0 0 40px rgba(99,102,241,0.4), 0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.2s ease", letterSpacing: "-0.01em" }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 0 60px rgba(99,102,241,0.6), 0 8px 30px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 0 40px rgba(99,102,241,0.4), 0 4px 20px rgba(0,0,0,0.3)"; }}>
                Generate my calendar
              </button>
              <span style={{ fontSize: "13px", color: "rgba(232,232,240,0.3)" }}>No account. No credit card. Free forever.</span>
            </div>

            <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
              {[{ val: 30, suf: "+", label: "Pieces per topic" }, { val: 7, suf: "", label: "Platforms covered" }, { val: 5, suf: "", label: "Days of content" }].map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "stretch" }}>
                  {i > 0 && <div style={{ width: "1px", background: "rgba(99,102,241,0.2)", margin: "0 32px" }} />}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "2.5rem", background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                      <AnimatedNumber target={s.val} suffix={s.suf} />
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.35)", marginTop: "4px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", animation: "bounce 2s ease-in-out infinite" }}>
          <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, rgba(99,102,241,0.6), transparent)" }} />
        </div>
      </section>

      {/* GRADIENT DIVIDER */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(139,92,246,0.5), transparent)" }} />

      {/* TICKER */}
      <div style={{ background: "rgba(99,102,241,0.05)", borderBottom: "1px solid rgba(99,102,241,0.1)", padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "max-content" }}>
          {[...Array(4)].flatMap((_, i) => PLATFORMS.map(p => (
            <span key={`${p.id}-${i}`} style={{ fontWeight: 700, fontSize: "12px", color: p.color, padding: "0 28px", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", opacity: 0.75 }}>
              {p.label} &nbsp; ✦
            </span>
          )))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: "120px 0", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
          <RevealOnScroll>
            <div style={{ marginBottom: "80px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>How it works</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#E8E8F0" }}>Three steps. Five days of content.</h2>
            </div>
          </RevealOnScroll>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {STEPS.map((step, i) => (
              <RevealOnScroll key={step.num} delay={i * 150}>
                <TiltCard style={{ padding: "48px 40px", background: i === 1 ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.07))" : "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.12)", borderTop: i === 1 ? "2px solid #6366f1" : "2px solid rgba(99,102,241,0.2)", borderRadius: "16px", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)" }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-10px", fontWeight: 800, fontSize: "8rem", color: "rgba(99,102,241,0.06)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>{step.num}</div>
                  <div style={{ fontSize: "2.2rem", marginBottom: "20px" }}>{step.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.4rem", color: "#E8E8F0", marginBottom: "12px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: "15px", color: "rgba(232,232,240,0.5)", lineHeight: 1.7 }}>{step.body}</p>
                </TiltCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section style={{ padding: "120px 0", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(99,102,241,0.08)", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "80px", alignItems: "center" }}>
            <RevealOnScroll>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>What you get</span>
                </div>
                <h2 style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#E8E8F0", marginBottom: "20px" }}>Seven platforms.<br />One input.</h2>
                <p style={{ fontSize: "16px", color: "rgba(232,232,240,0.5)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "420px" }}>Each platform gets content written for how that platform actually works. Not the same post reformatted seven times.</p>
                <button onClick={scrollToTool} style={{ padding: "13px 28px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", fontSize: "14px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(99,102,241,0.1)"; el.style.borderColor = "rgba(99,102,241,0.6)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "transparent"; el.style.borderColor = "rgba(99,102,241,0.4)"; }}>
                  See it in action
                </button>
              </div>
            </RevealOnScroll>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {PLATFORMS.map((p, i) => (
                <RevealOnScroll key={p.id} delay={i * 70}>
                  <TiltCard style={{ padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${p.color}20`, border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: p.color }}>{p.short}</span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#E8E8F0" }}>{p.label}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(232,232,240,0.4)", lineHeight: 1.5 }}>{p.desc}</p>
                  </TiltCard>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "120px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
          <RevealOnScroll>
            <div style={{ textAlign: "center", marginBottom: "80px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>What people say</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#E8E8F0" }}>Built for people who actually ship.</h2>
            </div>
          </RevealOnScroll>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "64px" }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealOnScroll key={i} delay={i * 120}>
                <TiltCard style={{ padding: "36px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px", backdropFilter: "blur(20px)" }}>
                  <div style={{ fontSize: "2.5rem", color: "#6366f1", opacity: 0.35, lineHeight: 1, marginBottom: "16px", fontFamily: "serif" }}>"</div>
                  <p style={{ fontSize: "15px", color: "rgba(232,232,240,0.72)", lineHeight: 1.75, marginBottom: "28px", fontStyle: "italic" }}>{t.quote}</p>
                  <div style={{ height: "1px", background: "rgba(99,102,241,0.15)", marginBottom: "20px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#E8E8F0" }}>{t.name}</div>
                      <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.35)", marginTop: "1px" }}>{t.role}</div>
                    </div>
                  </div>
                </TiltCard>
              </RevealOnScroll>
            ))}
          </div>
          <RevealOnScroll>
            <div style={{ padding: "48px 60px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "20px", backdropFilter: "blur(20px)", display: "flex", gap: "0", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center" }}>
              {[{ val: 4, suf: "hrs", label: "Saved per session" }, { val: 30, suf: "+", label: "Pieces per topic" }, { val: 7, suf: "", label: "Platforms covered" }, { val: 0, suf: "", label: "Cost to use it", prefix: "$" }].map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: "16px 32px" }}>
                  <div style={{ fontWeight: 800, fontSize: "3.5rem", background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                    {s.prefix || ""}<AnimatedNumber target={s.val} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.35)", marginTop: "6px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* THE TOOL */}
      <section ref={toolRef} style={{ padding: "120px 0", background: "rgba(99,102,241,0.025)", borderTop: "1px solid rgba(99,102,241,0.1)" }} id="tool">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
          <RevealOnScroll>
            <div style={{ marginBottom: "64px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>The Tool</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#E8E8F0", marginBottom: "16px" }}>Generate your content calendar.</h2>
              <p style={{ fontSize: "16px", color: "rgba(232,232,240,0.45)", maxWidth: "480px" }}>Paste a YouTube URL or type a topic. Hit generate. Your 5-day calendar is ready in about 60 seconds.</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div style={{ display: "grid", gridTemplateColumns: history.length ? "minmax(0, 680px) 300px" : "minmax(0, 680px)", gap: "18px", alignItems: "start", marginBottom: "48px" }}>
            <div style={{ maxWidth: "680px", padding: "40px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderTop: "2px solid #6366f1", borderRadius: "16px", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(99,102,241,0.07)" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>YouTube URL or Topic</label>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !isGenerating && handleGenerate()} placeholder="e.g. youtube.com/watch?v=... or 'How to build a personal brand'"
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Email (optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Client profile</label>
                <input type="text" value={clientProfile} onChange={e => setClientProfile(e.target.value)} placeholder="Client or workspace name"
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", marginBottom: "14px" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>Brand kit preset</label>
                  <button type="button" onClick={saveCurrentPreset} style={{ background: "transparent", border: "1px solid rgba(99,102,241,0.22)", borderRadius: "999px", padding: "8px 12px", color: "#c7d2fe", cursor: "pointer", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Save current
                  </button>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {allPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setActivePresetId(preset.id);
                        applyPreferences(preset.preferences);
                        showToast(`Loaded ${preset.label}`);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: activePresetId === preset.id ? "1px solid rgba(139,92,246,0.8)" : "1px solid rgba(99,102,241,0.2)",
                        background: activePresetId === preset.id ? "rgba(99,102,241,0.16)" : "rgba(255,255,255,0.03)",
                        color: activePresetId === preset.id ? "#ffffff" : "#c7d2fe",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.42)", lineHeight: 1.6 }}>
                  {(allPresets.find((preset) => preset.id === activePresetId) || allPresets[0])?.description}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Audience</label>
                  <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="Founders, creators, operators..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Brand Voice</label>
                  <input type="text" value={brandVoice} onChange={e => setBrandVoice(e.target.value)} placeholder="Sharp, warm, contrarian..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Primary CTA Goal</label>
                <input type="text" value={offerCta} onChange={e => setOfferCta(e.target.value)} placeholder="DM for audit, book a call, join newsletter..."
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Campaign goal</label>
                  <input type="text" value={campaignGoal} onChange={e => setCampaignGoal(e.target.value)} placeholder="Lead gen, authority, launch, subscriber growth..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Core offer</label>
                  <input type="text" value={coreOffer} onChange={e => setCoreOffer(e.target.value)} placeholder="Audit, offer, product, service..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Proof bank</label>
                  <textarea value={proofPoints} onChange={e => setProofPoints(e.target.value)} rows={3} placeholder="Case studies, metrics, stories, proof texture..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Competitor context</label>
                  <textarea value={competitorContext} onChange={e => setCompetitorContext(e.target.value)} rows={3} placeholder="What competitors say, where they're weak, what angles are crowded..."
                    style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", resize: "vertical" }} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Banned claims / red lines</label>
                <input type="text" value={bannedClaims} onChange={e => setBannedClaims(e.target.value)} placeholder="No income claims, no fake urgency, no guaranteed outcomes..."
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Swipe file / reference style</label>
                <textarea value={swipeFile} onChange={e => setSwipeFile(e.target.value)} rows={3} placeholder="Winning posts, ad styles, creator references, structures to borrow..."
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Operator Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Proof points, offer, ICP nuance, forbidden claims, angle notes..."
                  style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "15px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <button onClick={handleGenerate} disabled={isGenerating || !input.trim()}
                style={{ width: "100%", padding: "17px", borderRadius: "10px", border: "none", cursor: isGenerating || !input.trim() ? "not-allowed" : "pointer", background: isGenerating || !input.trim() ? "rgba(99,102,241,0.25)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", boxShadow: isGenerating || !input.trim() ? "none" : "0 0 40px rgba(99,102,241,0.3)", transition: "all 0.2s ease", opacity: isGenerating || !input.trim() ? 0.6 : 1, letterSpacing: "-0.01em" }}
                onMouseEnter={e => { if (!isGenerating && input.trim()) { const el = e.currentTarget; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 0 60px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = "translateY(0)"; if (!isGenerating && input.trim()) el.style.boxShadow = "0 0 40px rgba(99,102,241,0.3)"; }}>
                {isGenerating ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                    {LOADING_MSGS[loadingStep]}
                  </span>
                ) : "Generate 5-Day Content Calendar"}
              </button>
              {isGenerating && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(232,232,240,0.35)", fontFamily: "monospace" }}>Building your calendar...</span>
                    <span style={{ fontSize: "11px", color: "#a5b4fc", fontFamily: "monospace" }}>~60 seconds</span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(99,102,241,0.15)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", width: `${Math.min(((loadingStep + 1) / LOADING_MSGS.length) * 100, 95)}%`, transition: "width 1s ease", borderRadius: "2px", boxShadow: "0 0 10px rgba(99,102,241,0.6)" }} />
                  </div>
                </div>
              )}
            </div>
            {history.length > 0 && (
              <div style={{ padding: "22px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: "16px", backdropFilter: "blur(20px)", position: "sticky", top: "92px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent calendars</div>
                  <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); showToast("History cleared"); }} style={{ background: "transparent", border: "none", color: "rgba(232,232,240,0.45)", cursor: "pointer", fontSize: "11px" }}>Clear</button>
                </div>
                <div style={{ display: "grid", gap: "10px" }}>
                  {history.map(item => (
                    <button key={item.generatedAt} onClick={() => {
                      setResult(item);
                      setInput(item.topic);
                      setActiveDay(0);
                      setActivePlatform("LinkedIn");
                      if (item.preferences) applyPreferences(item.preferences);
                    }} style={{ textAlign: "left", padding: "14px", borderRadius: "12px", border: "1px solid rgba(99,102,241,0.08)", background: "rgba(255,255,255,0.02)", color: "#E8E8F0", cursor: "pointer" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{item.topic.length > 42 ? `${item.topic.slice(0, 42)}...` : item.topic}</div>
                      {item.presetName && (
                        <div style={{ fontSize: "11px", color: "#a5b4fc", marginBottom: "4px" }}>{item.presetName}</div>
                      )}
                      <div style={{ fontSize: "11px", color: "rgba(232,232,240,0.35)", fontFamily: "monospace" }}>{new Date(item.generatedAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
          </RevealOnScroll>

          {/* RESULTS */}
          {result && (
            <div style={{ animation: "slideUp 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.5rem", color: "#E8E8F0", letterSpacing: "-0.02em", marginBottom: "4px" }}>Your 5-Day Calendar</h3>
                  <p style={{ fontSize: "13px", color: "rgba(232,232,240,0.35)", fontFamily: "monospace" }}>{result.topic.length > 60 ? result.topic.slice(0, 60) + "..." : result.topic}</p>
                  {result.presetName && <p style={{ fontSize: "12px", color: "#a5b4fc", marginTop: "6px" }}>Preset: {result.presetName}</p>}
                  {result.clientProfile && <p style={{ fontSize: "12px", color: "rgba(232,232,240,0.48)", marginTop: "4px" }}>Workspace: {result.clientProfile}</p>}
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={handleDownloadAll} style={{ padding: "10px 22px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    Download All
                  </button>
                  <button onClick={handleDownloadClientPack} style={{ padding: "10px 22px", borderRadius: "8px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(139,92,246,0.35)", color: "#ddd6fe", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.18)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; }}>
                    Download Client Pack
                  </button>
                </div>
              </div>

              {result.strategyBrief && (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Positioning</div>
                    <div style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(232,232,240,0.78)" }}>{result.strategyBrief.positioning}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Hook themes</div>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {result.strategyBrief.hookThemes.map((hook, index) => (
                        <div key={index} style={{ fontSize: "13px", color: "rgba(232,232,240,0.74)" }}>{hook}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Proof + CTA</div>
                    <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
                      {result.strategyBrief.proofAssets.map((asset, index) => (
                        <div key={index} style={{ fontSize: "13px", color: "rgba(232,232,240,0.74)" }}>{asset}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: "12px", color: "#c7d2fe" }}>{result.strategyBrief.ctaStrategy}</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                {result.days.map((day, i) => (
                  <button key={i} onClick={() => setActiveDay(i)}
                    style={{ padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", background: activeDay === i ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.04)", color: activeDay === i ? "#fff" : "rgba(232,232,240,0.45)", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s ease", boxShadow: activeDay === i ? "0 0 20px rgba(99,102,241,0.3)" : "none" }}>
                    Day {day.day}
                  </button>
                ))}
              </div>

              {currentDay && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(20px)" }}>
                  <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: "rgba(99,102,241,0.04)" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.75rem", background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Day {currentDay.day}</div>
                    <div style={{ width: "1px", height: "28px", background: "rgba(99,102,241,0.2)", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#E8E8F0" }}>{currentDay.label}</div>
                      <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.35)", marginTop: "2px", fontFamily: "monospace" }}>{currentDay.description}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(0,0,0,0.2)" }}>
                    {PLATFORMS.map(platform => {
                      const piece = currentDay.pieces.find((p: ContentPiece) => p.platform === platform.id);
                      if (!piece) return null;
                      return (
                        <button key={platform.id} onClick={() => setActivePlatform(platform.id)}
                          style={{ padding: "14px 20px", border: "none", cursor: "pointer", background: "transparent", color: activePlatform === platform.id ? platform.color : "rgba(232,232,240,0.35)", fontSize: "13px", fontWeight: activePlatform === platform.id ? 700 : 500, whiteSpace: "nowrap", borderBottom: activePlatform === platform.id ? `2px solid ${platform.color}` : "2px solid transparent", transition: "all 0.15s ease" }}>
                          {platform.label}
                        </button>
                      );
                    })}
                  </div>

                  {currentPiece && (
                    <div style={{ padding: "32px 28px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{currentPiece.type}</span>
                          <span style={{ fontSize: "11px", color: "rgba(232,232,240,0.25)", fontFamily: "monospace" }}>{currentPiece.content.length} chars</span>
                          {currentDay.angle && <span style={{ fontSize: "11px", color: "rgba(232,232,240,0.35)", fontFamily: "monospace" }}>Angle: {currentDay.angle}</span>}
                        </div>
                        <button onClick={() => handleCopy(currentPiece.content, `${activeDay}-${activePlatform}`)}
                          style={{ padding: "8px 18px", borderRadius: "6px", background: copiedId === `${activeDay}-${activePlatform}` ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", border: "1px solid rgba(99,102,241,0.4)", color: copiedId === `${activeDay}-${activePlatform}` ? "#fff" : "#a5b4fc", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s ease" }}
                          onMouseEnter={e => { if (copiedId !== `${activeDay}-${activePlatform}`) e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                          onMouseLeave={e => { if (copiedId !== `${activeDay}-${activePlatform}`) e.currentTarget.style.background = "transparent"; }}>
                          {copiedId === `${activeDay}-${activePlatform}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(99,102,241,0.1)", borderTop: "2px solid rgba(99,102,241,0.3)", borderRadius: "10px", padding: "28px", maxHeight: "520px", overflowY: "auto" }}>
                        <pre style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace", fontSize: "13.5px", lineHeight: 1.85, whiteSpace: "pre-wrap", color: "rgba(232,232,240,0.82)", margin: 0 }}>{currentPiece.content}</pre>
                      </div>
                      {scorecard && (
                        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "14px", marginTop: "16px" }}>
                          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Performance scorecard</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
                              {[
                                ["Overall", scorecard.overall],
                                ["Hook", scorecard.hookStrength],
                                ["Specificity", scorecard.specificity],
                                ["Offer", scorecard.offerAlignment],
                                ["Fit", scorecard.platformFit]
                              ].map(([label, value]) => (
                                <div key={label as string} style={{ padding: "12px", borderRadius: "8px", background: "rgba(99,102,241,0.08)", textAlign: "center" }}>
                                  <div style={{ fontSize: "10px", color: "rgba(232,232,240,0.48)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{label as string}</div>
                                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>{value as number}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Revision priorities</div>
                            <div style={{ display: "grid", gap: "8px" }}>
                              {(scorecard.revisionPriorities.length ? scorecard.revisionPriorities : ["Strong working draft. Final pass should sharpen proof and CTA."]).map((item, index) => (
                                <div key={index} style={{ fontSize: "13px", color: "rgba(232,232,240,0.78)" }}>{item}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px" }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Review workflow</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {(["draft", "approved", "revise"] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => updateReview({ status })}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: "999px",
                                  border: reviewState[currentPieceKey]?.status === status ? "1px solid rgba(139,92,246,0.8)" : "1px solid rgba(99,102,241,0.2)",
                                  background: reviewState[currentPieceKey]?.status === status ? "rgba(99,102,241,0.16)" : "rgba(255,255,255,0.02)",
                                  color: "#E8E8F0",
                                  cursor: "pointer",
                                  textTransform: "capitalize",
                                  fontSize: "12px",
                                  fontWeight: 700
                                }}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewState[currentPieceKey]?.note || ""}
                            onChange={(e) => updateReview({ note: e.target.value })}
                            rows={3}
                            placeholder="What needs revision before this ships?"
                            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E8E8F0", fontSize: "13px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", boxSizing: "border-box", resize: "vertical" }}
                          />
                        </div>
                        {creativeBrief && (
                          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Creative brief</div>
                            <div style={{ fontSize: "13px", color: "#c7d2fe", marginBottom: "10px" }}>{creativeBrief.visualDirection}</div>
                            <div style={{ display: "grid", gap: "8px" }}>
                              {creativeBrief.scenes.map((scene, index) => (
                                <div key={index} style={{ fontSize: "13px", color: "rgba(232,232,240,0.78)" }}>{scene}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {((currentPiece.alt_hooks?.length || 0) > 0 || (currentPiece.cta_options?.length || 0) > 0) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px" }}>
                          {!!currentPiece.alt_hooks?.length && (
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Alternate hooks</div>
                              <div style={{ display: "grid", gap: "8px" }}>
                                {currentPiece.alt_hooks?.map((hook, index) => (
                                  <button key={index} onClick={() => handleCopy(hook, `${activeDay}-${activePlatform}-hook-${index}`)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(232,232,240,0.78)", cursor: "pointer" }}>
                                    <span style={{ fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" }}>{hook}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {!!currentPiece.cta_options?.length && (
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "10px", padding: "18px" }}>
                              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>CTA options</div>
                              <div style={{ display: "grid", gap: "8px" }}>
                                {currentPiece.cta_options?.map((cta, index) => (
                                  <button key={index} onClick={() => handleCopy(cta, `${activeDay}-${activePlatform}-cta-${index}`)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(232,232,240,0.78)", cursor: "pointer" }}>
                                    <span style={{ fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" }}>{cta}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(99,102,241,0.1)", padding: "48px 0", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.3)", flexShrink: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>CM</span>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8E8F0", letterSpacing: "-0.02em" }}>Content Matrix</span>
          </div>
          <div style={{ fontSize: "13px", color: "rgba(232,232,240,0.35)" }}>
            Powered by{" "}
            <a href="https://LosSilva.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc", textDecoration: "none", fontWeight: 700, transition: "color 0.2s ease" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#6366f1"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "#a5b4fc"; }}>
              ELIOS
            </a>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(232,232,240,0.2)", fontFamily: "monospace" }}>Free. No credit card. No account.</div>
        </div>
      </footer>

      <style>{`
        @keyframes meshPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes livePulse { 0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.8); } 50% { box-shadow: 0 0 16px rgba(99,102,241,1), 0 0 24px rgba(99,102,241,0.4); } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        input::placeholder { color: rgba(232,232,240,0.2) !important; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
        @media (max-width: 900px) {
          section div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          section div[style*="minmax(0, 680px) 300px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
