import { useState, useCallback, useMemo, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Mail,
  ArrowRight,
  Zap,
  Layers,
  Calendar,
  Youtube,
  Lightbulb,
  Loader2,
} from "lucide-react";
import type { ContentCalendar, ContentPiece } from "./types";

const LOADING_STEPS = [
  "Analyzing content...",
  "Generating Day 1...",
  "Generating Day 2...",
  "Generating Day 3...",
  "Generating Day 4...",
  "Generating Day 5...",
];

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Twitter: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Instagram: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  TikTok: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Email: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Blog: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Podcast: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  Facebook: "bg-blue-600/10 text-blue-300 border border-blue-600/20",
  General: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
};

function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.General;
}

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const ToastUI = () =>
    toast ? (
      <div
        className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fade-in ${
          toast.type === "success"
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-red-500/15 text-red-400 border border-red-500/20"
        }`}
      >
        {toast.message}
      </div>
    ) : null;
  return { show, ToastUI };
}

function ContentCard({ piece, index, showToast }: { piece: ContentPiece; index: number; showToast: (msg: string) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    const text = `${piece.title}\n\n${piece.content}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [piece, showToast]);

  return (
    <div
      className="group relative rounded-xl border border-[oklch(1_0_0/8%)] bg-[oklch(1_0_0/2%)] p-5 transition-all duration-300 hover:border-[oklch(1_0_0/14%)] hover:bg-[oklch(1_0_0/4%)] animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${getPlatformColor(piece.platform)}`}>
            {piece.platform}
          </span>
          <span className="text-xs text-[oklch(0.55_0.01_260)]">{piece.type}</span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-[oklch(0.55_0.01_260)] transition-colors hover:bg-[oklch(1_0_0/6%)] hover:text-[oklch(0.93_0.005_260)]"
          title="Copy content"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <h4 className="text-sm font-semibold text-[oklch(0.93_0.005_260)] mb-2 leading-snug">{piece.title}</h4>
      <div className="text-[13px] text-[oklch(0.55_0.01_260)] leading-relaxed whitespace-pre-wrap">{piece.content}</div>
    </div>
  );
}

function LoadingState({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-2xl bg-[oklch(0.78_0.154_194.77/15%)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-[oklch(0.78_0.154_194.77)] animate-spin" />
        </div>
        <div className="absolute -inset-4 rounded-3xl bg-[oklch(0.78_0.154_194.77/5%)] animate-pulse-glow" />
      </div>
      <p className="text-lg font-medium text-[oklch(0.93_0.005_260)] mb-6">
        {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}
      </p>
      <div className="w-full max-w-xs">
        <div className="h-1 rounded-full bg-[oklch(1_0_0/6%)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.154_194.77)] to-[oklch(0.72_0.14_180)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(((step + 1) / LOADING_STEPS.length) * 100, 95)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[oklch(0.4_0.008_260)]">Step {Math.min(step + 1, LOADING_STEPS.length)} of {LOADING_STEPS.length}</span>
          <span className="text-xs text-[oklch(0.4_0.008_260)]">{Math.round(Math.min(((step + 1) / LOADING_STEPS.length) * 100, 95))}%</span>
        </div>
      </div>
    </div>
  );
}

function EmailGate({ onSubmit, loading }: { onSubmit: (email: string) => void; loading: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    onSubmit(email);
  };

  return (
    <div className="max-w-lg mx-auto py-20 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.78_0.154_194.77/15%)] mb-4">
          <Mail className="h-6 w-6 text-[oklch(0.78_0.154_194.77)]" />
        </div>
        <h3 className="text-xl font-semibold text-[oklch(0.93_0.005_260)] mb-2">Unlock Your Content Calendar</h3>
        <p className="text-[oklch(0.55_0.01_260)] text-sm leading-relaxed">
          Enter your email to generate your personalized 5-day content calendar with 30+ ready-to-publish pieces.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
            className="w-full h-12 px-4 rounded-xl bg-[oklch(1_0_0/5%)] border border-[oklch(1_0_0/10%)] text-[oklch(0.93_0.005_260)] placeholder:text-[oklch(0.4_0.008_260)] text-sm focus:outline-none focus:border-[oklch(0.78_0.154_194.77/50%)] focus:ring-1 focus:ring-[oklch(0.78_0.154_194.77/20%)] transition-all"
          />
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[oklch(0.78_0.154_194.77)] to-[oklch(0.72_0.14_180)] text-black font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate My Content Calendar
        </button>
        <p className="text-xs text-center text-[oklch(0.4_0.008_260)]">Free forever. No credit card required.</p>
      </form>
    </div>
  );
}

function generateDownloadText(calendar: ContentCalendar): string {
  let text = "CONTENT REPURPOSING MATRIX\n";
  text += "=".repeat(50) + "\n";
  text += `Topic: ${calendar.topic}\n`;
  text += `Generated: ${new Date(calendar.generatedAt).toLocaleDateString()}\n`;
  text += "=".repeat(50) + "\n\n";
  for (const day of calendar.days) {
    text += `\n${"=".repeat(50)}\n`;
    text += `DAY ${day.day}: ${day.label.toUpperCase()}\n`;
    text += `${day.description}\n`;
    text += "=".repeat(50) + "\n\n";
    for (const piece of day.pieces) {
      text += "-".repeat(40) + "\n";
      text += `[${piece.platform}] ${piece.type}\n`;
      text += "-".repeat(40) + "\n";
      text += `${piece.title}\n\n${piece.content}\n\n`;
    }
  }
  text += "\n" + "=".repeat(50) + "\n";
  text += "Powered by ELIOS | LosSilva.com\n";
  text += "=".repeat(50) + "\n";
  return text;
}

function CalendarResults({ calendar, showToast }: { calendar: ContentCalendar; showToast: (msg: string) => void }) {
  const [activeDay, setActiveDay] = useState(1);

  const handleDownload = useCallback(() => {
    const text = generateDownloadText(calendar);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-calendar-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Calendar downloaded");
  }, [calendar, showToast]);

  const totalPieces = useMemo(() => calendar.days.reduce((s, d) => s + d.pieces.length, 0), [calendar]);
  const currentDay = calendar.days.find((d) => d.day === activeDay) || calendar.days[0];

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[oklch(0.93_0.005_260)]">Your Content Calendar</h3>
          <p className="text-sm text-[oklch(0.55_0.01_260)]">{totalPieces} content pieces across 5 days, ready to publish</p>
        </div>
        <button
          onClick={handleDownload}
          className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[oklch(1_0_0/8%)] bg-[oklch(1_0_0/3%)] text-[oklch(0.93_0.005_260)] text-sm font-medium hover:bg-[oklch(1_0_0/6%)] hover:border-[oklch(1_0_0/14%)] transition-all"
        >
          <Download className="h-4 w-4" />
          Download All
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[oklch(1_0_0/3%)] border border-[oklch(1_0_0/8%)] mb-6 overflow-x-auto">
        {calendar.days.map((day) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            className={`flex-1 min-w-[64px] py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeDay === day.day
                ? "bg-gradient-to-r from-[oklch(0.78_0.154_194.77/20%)] to-[oklch(0.72_0.14_180/20%)] text-[oklch(0.78_0.154_194.77)] border border-[oklch(0.78_0.154_194.77/30%)]"
                : "text-[oklch(0.55_0.01_260)] hover:text-[oklch(0.93_0.005_260)] hover:bg-[oklch(1_0_0/4%)]"
            }`}
          >
            <span className="hidden sm:inline">Day {day.day}</span>
            <span className="sm:hidden">D{day.day}</span>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h4 className="text-base font-semibold text-[oklch(0.93_0.005_260)]">{currentDay.label}</h4>
        <p className="text-sm text-[oklch(0.55_0.01_260)]">{currentDay.description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {currentDay.pieces.map((piece, i) => (
          <ContentCard key={`${currentDay.day}-${i}`} piece={piece} index={i} showToast={showToast} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<"youtube" | "topic">("topic");
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const loadingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { show: showToast, ToastUI } = useToast();

  const detectInputType = useCallback((value: string) => {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    setInputType(ytRegex.test(value.trim()) ? "youtube" : "topic");
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      detectInputType(e.target.value);
      if (error) setError("");
    },
    [detectInputType, error]
  );

  const handleGenerate = useCallback(() => {
    if (!inputValue.trim()) {
      setError("Please enter a YouTube URL or content topic");
      return;
    }
    setShowEmailGate(true);
    setCalendar(null);
    setError("");
  }, [inputValue]);

  const handleEmailSubmit = useCallback(
    async (email: string) => {
      const captures = JSON.parse(localStorage.getItem("cm_emails") || "[]");
      captures.push({ email, input: inputValue, inputType, timestamp: Date.now() });
      localStorage.setItem("cm_emails", JSON.stringify(captures));

      setIsLoading(true);
      setLoadingStep(0);
      loadingInterval.current = setInterval(() => {
        setLoadingStep((prev) => (prev >= LOADING_STEPS.length - 1 ? prev : prev + 1));
      }, 4000);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue.trim(), inputType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setCalendar(data);
        setShowEmailGate(false);
        showToast("Content calendar generated!");
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to generate content. Please try again.";
        setError(msg);
        setShowEmailGate(false);
        showToast(msg, "error");
      } finally {
        if (loadingInterval.current) clearInterval(loadingInterval.current);
        setIsLoading(false);
      }
    },
    [inputValue, inputType, showToast]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Enter") handleGenerate(); },
    [handleGenerate]
  );

  const handleReset = useCallback(() => {
    setCalendar(null);
    setInputValue("");
    setShowEmailGate(false);
    setError("");
    setInputType("topic");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.07_0.005_260)]">
      <ToastUI />

      {/* Header */}
      <header className="border-b border-[oklch(1_0_0/8%)] bg-[oklch(0.07_0.005_260/80%)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.154_194.77)] to-[oklch(0.72_0.14_180)] flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-[oklch(0.93_0.005_260)] tracking-tight leading-none">Content Repurposing Matrix</span>
              <span className="text-[10px] text-[oklch(0.55_0.01_260)] leading-none mt-0.5 hidden sm:block">Turn one idea into 30+ pieces of content</span>
            </div>
          </div>
          <a href="https://LosSilva.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[oklch(0.55_0.01_260)] hover:text-[oklch(0.93_0.005_260)] transition-colors">
            by ELIOS
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.78_0.154_194.77/3%)] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[oklch(0.78_0.154_194.77/4%)] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.78_0.154_194.77/20%)] bg-[oklch(0.78_0.154_194.77/6%)] px-3 py-1 text-xs font-medium text-[oklch(0.78_0.154_194.77)] mb-6">
              <Zap className="h-3 w-3" />
              Free AI-Powered Tool
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[oklch(0.93_0.005_260)] mb-4 leading-[1.1]">
              Content Repurposing<br />
              <span className="bg-gradient-to-r from-[oklch(0.78_0.154_194.77)] to-[oklch(0.72_0.14_180)] bg-clip-text text-transparent">Matrix</span>
            </h1>
            <p className="text-base sm:text-lg text-[oklch(0.55_0.01_260)] max-w-xl mx-auto mb-10 leading-relaxed">
              Turn one idea into 30+ pieces of content. Enter a YouTube URL or topic and get a complete 5-day content calendar, ready to publish.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[oklch(0.4_0.008_260)]">
                    {inputType === "youtube" ? <Youtube className="h-4 w-4 text-red-400" /> : <Lightbulb className="h-4 w-4 text-amber-400" />}
                  </div>
                  <input
                    type="text"
                    placeholder="Paste a YouTube URL or enter a topic..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[oklch(1_0_0/5%)] border border-[oklch(1_0_0/10%)] text-[oklch(0.93_0.005_260)] placeholder:text-[oklch(0.4_0.008_260)] text-sm focus:outline-none focus:border-[oklch(0.78_0.154_194.77/50%)] focus:ring-1 focus:ring-[oklch(0.78_0.154_194.77/20%)] transition-all"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-[oklch(0.78_0.154_194.77)] to-[oklch(0.72_0.14_180)] text-black font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-2 text-left">{error}</p>}
              <p className="text-xs text-[oklch(0.4_0.008_260)] mt-3">
                {inputType === "youtube" ? "YouTube URL detected. We will analyze the video topic." : "Enter any topic, niche, or idea to generate content around."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      {!showEmailGate && !calendar && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Calendar, title: "5-Day Calendar", desc: "Structured daily content plan with platform-specific pieces" },
              { icon: Layers, title: "30+ Pieces", desc: "LinkedIn, Twitter, Instagram, TikTok, Email, Blog, Podcast" },
              { icon: Zap, title: "Ready to Publish", desc: "Copy any piece directly. Download everything at once." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-[oklch(1_0_0/8%)] bg-[oklch(1_0_0/2%)] p-5 text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(1_0_0/4%)] mb-3">
                  <f.icon className="h-5 w-5 text-[oklch(0.78_0.154_194.77)]" />
                </div>
                <h3 className="text-sm font-semibold text-[oklch(0.93_0.005_260)] mb-1">{f.title}</h3>
                <p className="text-xs text-[oklch(0.55_0.01_260)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main content area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 flex-1 pb-16" ref={resultsRef}>
        {showEmailGate && !isLoading && !calendar && <EmailGate onSubmit={handleEmailSubmit} loading={isLoading} />}
        {isLoading && <LoadingState step={loadingStep} />}
        {calendar && (
          <div>
            <CalendarResults calendar={calendar} showToast={showToast} />
            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-[oklch(1_0_0/8%)] bg-[oklch(1_0_0/3%)] text-[oklch(0.93_0.005_260)] text-sm font-medium hover:bg-[oklch(1_0_0/6%)] hover:border-[oklch(1_0_0/14%)] transition-all"
              >
                <Sparkles className="h-4 w-4 text-[oklch(0.78_0.154_194.77)]" />
                Generate Another Calendar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[oklch(1_0_0/8%)] bg-[oklch(0.07_0.005_260/80%)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
          <div className="flex items-center gap-2 text-sm text-[oklch(0.55_0.01_260)]">
            <span>Powered by</span>
            <a href="https://LosSilva.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[oklch(0.93_0.005_260)] hover:text-[oklch(0.78_0.154_194.77)] transition-colors">
              ELIOS
            </a>
          </div>
          <p className="text-xs text-[oklch(0.4_0.008_260)]">Free content repurposing tool. No credit card required.</p>
        </div>
      </footer>
    </div>
  );
}
