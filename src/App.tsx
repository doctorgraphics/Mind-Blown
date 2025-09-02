import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, Zap, Timer, Activity, Sparkles, RefreshCw, Share2, Info, Sun, Moon, Loader2, ChevronLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import Confetti from "react-confetti";

type Option = "yes" | "no";
type Reaction = "shrug" | "double" | "whoa" | "";

type Answers = { E: Option | ""; R: Reaction; Q1: Option | ""; Q3: Option | ""; Q4: Option | ""; Q5: Option | ""; Q6: Option | ""; A: Option | "" };
type QKey = keyof Omit<Answers, "A">;
type Stage = "question" | "final";

const LEVELS: Record<number, { name: string; blurb: string; icon: React.ReactNode; quip: string }> = {
  0: { name: "Not Blown", blurb: "Curiosity not engaged. Your expectations stayed intact; carry on with confidence.", icon: <Activity className="h-5 w-5" />, quip: "Mind intact. Engineers hate this one weird trick." },
  1: { name: "Mildly Blown", blurb: "A brief delight and a second look. You probably said ‘huh!’ and smiled.", icon: <Sparkles className="h-5 w-5" />, quip: "A light breeze rustles your neurons." },
  2: { name: "Considerably Blown", blurb: "Audible ‘whoa’. You shared it and maybe did a quick fact-check.", icon: <Zap className="h-5 w-5" />, quip: "Reticulating splines of amazement…" },
  3: { name: "Thoroughly Blown", blurb: "You needed a moment. Time dilated, priorities paused, stare engaged.", icon: <Brain className="h-5 w-5" />, quip: "Brain.exe has entered dramatic pause." },
  4: { name: "Existence-Level Blown", blurb: "Worldview tilt. You’re pacing, re-mapping assumptions. Sleep optional.", icon: <Brain className="h-5 w-5" />, quip: "Your worldview just did a backflip." },
};

function computeLevel(ans: Answers) {
  const path: string[] = [];
  let baseLevel: number | null = null;

  if (ans.E === "no") { baseLevel = 0; path.push("No expectation challenge → Level 0"); }

  if (ans.E === "yes") {
    path.push("Expectations challenged ✔");
    if (ans.R === "shrug") { baseLevel = 0; path.push("Immediate shrug → Level 0"); }
    else if (ans.R === "double") {
      if (ans.Q1 === "yes") { baseLevel = 1; path.push("Light signs present → Level 1"); }
      else if (ans.Q1 === "no") { baseLevel = 0; path.push("No light signs → Level 0"); }
    } else if (ans.R === "whoa") {
      if (ans.Q3 === "no") { baseLevel = 1; path.push("No awe signs → Level 1"); }
      else if (ans.Q3 === "yes") {
        if (ans.Q4 === "no") { baseLevel = 2; path.push("No verification urge → Level 2"); }
        else if (ans.Q4 === "yes") {
          if (ans.Q5 === "no") { baseLevel = 2; path.push("No function hit → Level 2"); }
          else if (ans.Q5 === "yes") {
            if (ans.Q6 === "no") { baseLevel = 3; path.push("No worldview wobble → Level 3"); }
            else if (ans.Q6 === "yes") { baseLevel = 4; path.push("Worldview wobble → Level 4"); }
          }
        }
      }
    }
  }

  const complete = baseLevel !== null;
  const withHour = (() => {
    if (!complete) return null as number | null;
    if (ans.A === "yes" && baseLevel! >= 1) return Math.min(4, baseLevel! + 1);
    return baseLevel!;
  })();

  const level = withHour;
  const label = level !== null ? `${LEVELS[level].name} (Level ${level})` : "Need more inputs";
  return { complete, baseLevel, level, path, label };
}

function getNextAfter(key: QKey, ans: Answers): QKey | "final" {
  switch (key) {
    case "E": if (ans.E === "") return "E"; return ans.E === "yes" ? "R" : "final";
    case "R": if (ans.R === "") return "R"; if (ans.R === "shrug") return "final"; if (ans.R === "double") return "Q1"; if (ans.R === "whoa") return "Q3"; return "R";
    case "Q1": if (ans.Q1 === "") return "Q1"; return "final";
    case "Q3": if (ans.Q3 === "") return "Q3"; return ans.Q3 === "yes" ? "Q4" : "final";
    case "Q4": if (ans.Q4 === "") return "Q4"; return ans.Q4 === "yes" ? "Q5" : "final";
    case "Q5": if (ans.Q5 === "") return "Q5"; return ans.Q5 === "yes" ? "Q6" : "final";
    case "Q6": if (ans.Q6 === "") return "Q6"; return "final";
  }
}

function isAnswered(key: QKey, ans: Answers) { return (ans as any)[key] !== ""; }

function pruneDownstream(from: QKey, draft: Answers) {
  const clear = (keys: QKey[]) => keys.forEach((k) => ((draft as any)[k] = ""));
  if (from === "E") clear(["R", "Q1", "Q3", "Q4", "Q5", "Q6"]);
  if (from === "R") clear(["Q1", "Q3", "Q4", "Q5", "Q6"]);
  if (from === "Q1") clear(["Q3", "Q4", "Q5", "Q6"]);
  if (from === "Q3") clear(["Q4", "Q5", "Q6"]);
  if (from === "Q4") clear(["Q5", "Q6"]);
  if (from === "Q5") clear(["Q6"]);
}

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try { return typeof window !== "undefined" && localStorage.getItem("mb_theme") === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        localStorage.setItem("mb_theme", theme);
      }
    } catch {}
  }, [theme]);
  return { theme, setTheme } as const;
}

const THOUGHTS = [
  "Booting awe engines…","Calibrating Whoa‑O‑Meter…","Reticulating splines…","Goosebump detector warming up…",
  "Consulting jaw‑drop oracle…","Normalizing surprise coefficients…","Cross‑checking with Grandma’s wisdom…",
  "Counting the number of times you said ‘wait what’…",
];

function useThinking(deps: ReadonlyArray<unknown>) {
  const [thinking, setThinking] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => { setThinking(true); const t = setTimeout(() => setThinking(false), 900); return () => clearTimeout(t); }, deps);
  useEffect(() => { if (!thinking) return; const i = setInterval(() => setTick((x) => x + 1), 140); return () => clearInterval(i); }, [thinking]);
  const message = THOUGHTS[tick % THOUGHTS.length]; return { thinking, message } as const;
}

const ThinkingConsole: React.FC<{ thinking: boolean; message: string }> = ({ thinking, message }) => (
  <AnimatePresence>
    {thinking && (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
        className="rounded-xl border border-slate-700/50 bg-slate-900/70 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-mono text-sm text-slate-200">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

function worstCaseRemainingFrom(key: QKey | "final", ans: Answers): number {
  if (key === "final") return 0;
  switch (key) {
    case "E": return 1 + worstCaseRemainingFrom("R", ans);
    case "R": { const v = ans.R; if (v === "double") return 1 + worstCaseRemainingFrom("Q1", ans); if (v === "whoa" || v === "") return 1 + worstCaseRemainingFrom("Q3", ans); return 1; }
    case "Q1": return 1;
    case "Q3": { const v = ans.Q3; if (v === "yes" || v === "") return 1 + worstCaseRemainingFrom("Q4", ans); return 1; }
    case "Q4": { const v = ans.Q4; if (v === "yes" || v === "") return 1 + worstCaseRemainingFrom("Q5", ans); return 1; }
    case "Q5": { const v = ans.Q5; if (v === "yes" || v === "") return 1 + worstCaseRemainingFrom("Q6", ans); return 1; }
    case "Q6": return 1;
  }
}

const ProgressBar: React.FC<{ percent: number; label?: string }> = ({ percent, label }) => (
  <div className="w-full">
    <div className="h-2 w-full rounded-full bg-slate-200/30 dark:bg-slate-800 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }} transition={{ duration: 0.35 }} className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
    </div>
    {label ? <div className="mt-2 text-xs opacity-75">{label}</div> : null}
  </div>
);

const YesNoGroup: React.FC<{ value: Option | ""; onChange: (v: Option) => void; idPrefix: string; }> = ({ value, onChange, idPrefix }) => (
  <RadioGroup value={value} onValueChange={(v) => onChange(v as Option)} className="grid grid-cols-2 gap-3">
    <div className="flex items-center space-x-2"><RadioGroupItem id={`${idPrefix}-yes`} value="yes" /><Label htmlFor={`${idPrefix}-yes`}>Yes</Label></div>
    <div className="flex items-center space-x-2"><RadioGroupItem id={`${idPrefix}-no`} value="no" /><Label htmlFor={`${idPrefix}-no`}>No</Label></div>
  </RadioGroup>
);

const ReactionGroup: React.FC<{ value: Reaction; onChange: (v: Reaction) => void; }> = ({ value, onChange }) => (
  <RadioGroup value={value} onValueChange={(v) => onChange(v as Reaction)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div className="flex items-center space-x-2"><RadioGroupItem id="R-shrug" value="shrug" /><Label htmlFor="R-shrug">Shrug / meh</Label></div>
    <div className="flex items-center space-x-2"><RadioGroupItem id="R-double" value="double" /><Label htmlFor="R-double">Double‑take / “huh?”</Label></div>
    <div className="flex items-center space-x-2"><RadioGroupItem id="R-whoa" value="whoa" /><Label htmlFor="R-whoa">“Whoa!” / jaw drop</Label></div>
  </RadioGroup>
);

type TestResult = { name: string; pass: boolean; details?: string };
function runUnitTests(): TestResult[] {
  const results: TestResult[] = [];
  const clone = (o: Partial<Answers>): Answers => ({ E: "", R: "", Q1: "", Q3: "", Q4: "", Q5: "", Q6: "", A: "", ...o });
  results.push({ name: "E=no → Level 0", pass: (() => computeLevel(clone({ E: "no" })).level === 0)() });
  results.push({ name: "E=yes, R=double, Q1=yes → Level 1", pass: (() => computeLevel(clone({ E: "yes", R: "double", Q1: "yes" })).level === 1)() });
  results.push({ name: "Full whoa chain to wobble yes → Level 4", pass: (() => computeLevel(clone({ E: "yes", R: "whoa", Q3: "yes", Q4: "yes", Q5: "yes", Q6: "yes" })).level === 4)() });
  results.push({ name: "Full whoa chain wobble no → Level 3", pass: (() => computeLevel(clone({ E: "yes", R: "whoa", Q3: "yes", Q4: "yes", Q5: "yes", Q6: "no" })).level === 3)() });
  results.push({ name: "getNextAfter(E, empty) stays E", pass: getNextAfter("E", clone({} as any)) === "E" });
  results.push({ name: "getNextAfter(E=yes) → R", pass: getNextAfter("E", clone({ E: "yes" })) === "R" });
  results.push({ name: "getNextAfter(E=no) → final", pass: getNextAfter("E", clone({ E: "no" })) === "final" });
  return results;
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const [answers, setAnswers] = useState<Answers>({ E: "", R: "", Q1: "", Q3: "", Q4: "", Q5: "", Q6: "", A: "" });
  const [stage, setStage] = useState<Stage>("question");
  const [current, setCurrent] = useState<QKey>("E");
  const [trail, setTrail] = useState<QKey[]>(["E"]);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const thinkingDeps = useMemo(() => [stage, current, answers.E, answers.R, answers.Q1, answers.Q3, answers.Q4, answers.Q5, answers.Q6, answers.A],
    [stage, current, answers.E, answers.R, answers.Q1, answers.Q3, answers.Q4, answers.Q5, answers.Q6, answers.A]);
  const { thinking, message } = useThinking(thinkingDeps);

  const { level, label, path, baseLevel } = useMemo(() => computeLevel(answers), [answers]);
  const intensity = level === null ? 0 : level * 25;
  const chartData = [{ name: "Blown", value: intensity }, { name: "Remaining", value: 100 - intensity }];

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const resetAll = () => { setAnswers({ E: "", R: "", Q1: "", Q3: "", Q4: "", Q5: "", Q6: "", A: "" }); setStage("question"); setCurrent("E"); setTrail(["E"]); };

  function answerAndAdvance(key: QKey, value: Option | Reaction) {
    setAnswers((prev) => { const draft: Answers = { ...prev }; (draft as any)[key] = value; pruneDownstream(key, draft); if (key === "E" && value === "no") draft.A = ""; return draft; });
  }

  useEffect(() => {
    if (stage !== "question") return;
    const last = trail[trail.length - 1];
    if (!isAnswered(last, answers)) return;
    const next = getNextAfter(last, answers);
    if (next === "final") { setStage("final"); return; }
    if (next !== last) { setCurrent(next); setTrail((t) => (t[t.length - 1] === next ? t : [...t, next])); }
  }, [answers, stage, trail]);

  const goBack = () => {
    if (stage === "final") { setStage("question"); setCurrent(trail[trail.length - 1] || "E"); return; }
    if (trail.length <= 1) return;
    setTrail((t) => { const copy = [...t]; copy.pop(); const prevKey = copy[copy.length - 1] || "E"; setCurrent(prevKey); return copy; });
  };

  const levelBadge = level !== null ? (
    <Badge className="text-sm px-2 py-1" variant={level >= 3 ? "default" : level >= 1 ? "secondary" : "outline"}>{LEVELS[level].name}</Badge>
  ) : (<Badge variant="outline">In progress</Badge>);

  const shareText = () => { const l = level !== null ? `Level ${level} – ${LEVELS[level].name}` : "(incomplete)"; const explain = path.join(" → "); return `Mind‑Blown Diagnostic Result: ${l}. Path: ${explain}.`; };
  const copyShare = async () => { try { await navigator.clipboard.writeText(shareText()); alert("Copied result to clipboard! Paste anywhere to share."); } catch (e) { alert("Could not copy to clipboard in this environment."); } };

  const completed = Math.max(0, trail.length - 1);
  const remainingWorst = stage === "final" ? 0 : worstCaseRemainingFrom(current, answers);
  const totalSteps = completed + remainingWorst;
  const progressPct = stage === "final" ? 100 : totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
  const progressLabel = stage === "final" ? "Complete" : `Step ${completed + 1} of ${totalSteps}`;

  const META: Record<QKey, { title: string; desc: string; render: () => JSX.Element }> = {
    E: { title: "Did something just challenge your expectations?", desc: "Surprises, contradictions, and plot twists qualify. Your cat filing taxes does not. (Probably.)", render: () => <YesNoGroup value={answers.E} onChange={(v) => answerAndAdvance("E", v)} idPrefix="E" /> },
    R: { title: "What was your immediate reaction?", desc: "First instinct—before your inner fact‑checker puts on glasses.", render: () => <ReactionGroup value={answers.R} onChange={(v) => answerAndAdvance("R", v)} /> },
    Q1:{ title:"Light signs?", desc:"Re‑read once, small smile, raised brows. Side effects may include mild smugness.", render:()=><YesNoGroup value={answers.Q1} onChange={(v)=>answerAndAdvance("Q1",v)} idPrefix="Q1"/>},
    Q3:{ title:"Awe signs?", desc:"Goosebumps, jaw drop, widened eyes. If your eyebrows left orbit, count it as ‘yes’.", render:()=><YesNoGroup value={answers.Q3} onChange={(v)=>answerAndAdvance("Q3",v)} idPrefix="Q3"/>},
    Q4:{ title:"Verification urge?", desc:"Check source, quick math, ask a friend. AKA the ‘am I being bamboozled?’ test.", render:()=><YesNoGroup value={answers.Q4} onChange={(v)=>answerAndAdvance("Q4",v)} idPrefix="Q4"/>},
    Q5:{ title:"Function hit?", desc:"Lose track of time, need to sit, thousand‑yard stare. Meeting faces may become background NPCs.", render:()=><YesNoGroup value={answers.Q5} onChange={(v)=>answerAndAdvance("Q5",v)} idPrefix="Q5"/>},
    Q6:{ title:"Worldview wobble?", desc:"Rethinking assumptions; need a walk to process. Temporary reality defragmentation may occur.", render:()=><YesNoGroup value={answers.Q6} onChange={(v)=>answerAndAdvance("Q6",v)} idPrefix="Q6"/>},
  };

  const QuestionCard = (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl">{META[current].title}</CardTitle>
        <CardDescription className="opacity-80">{META[current].desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {META[current].render()}
        </motion.div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button variant="ghost" onClick={goBack} disabled={trail.length <= 1} className="gap-2"><ChevronLeft className="h-4 w-4" /> Back</Button>
        <div className="ml-auto flex items-center gap-2"><Badge variant="outline">{progressLabel}</Badge></div>
      </CardFooter>
    </Card>
  );

  const ResultPanel = (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Your Result {level !== null && levelBadge}</CardTitle>
        <CardDescription className="opacity-80">Final determination based on your answers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-52">
            {isClient ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                  <Pie data={chartData} dataKey="value" nameKey="name" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={80} isAnimationActive>
                    {chartData.map((_, idx) => (<Cell key={`cell-${idx}`} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-sm opacity-70">Loading chart…</div>)}
          </div>
          <div className="text-center space-y-1">
            <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="text-xl font-semibold">{label}</motion.div>
            {level !== null ? (<><p className="text-sm opacity-80">{LEVELS[level].blurb}</p><p className="text-xs opacity-70 italic">{LEVELS[level].quip}</p></>) : null}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> Why you got this level</h4>
            <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">{path.length ? path.map((p, i) => <li key={i}>{p}</li>) : <li>Answer questions to generate a path.</li>}</ul>
          </div>
          {baseLevel !== null && baseLevel >= 1 && (
            <div className="rounded-lg border border-slate-700/40 p-4">
              <div className="text-sm font-medium mb-2">Bonus: After ~1 hour, are you still thinking about it?</div>
              <YesNoGroup value={answers.A} onChange={(v) => setAnswers((a) => ({ ...a, A: v }))} idPrefix="A" />
              <p className="text-xs opacity-70 mt-2">If yes, we bump your score one level (capped at Level 4).</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={copyShare} className="gap-2"><Share2 className="h-4 w-4" /> Copy result summary</Button>
        <Button variant="ghost" onClick={resetAll} className="gap-2"><RefreshCw className="h-4 w-4" /> Start over</Button>
      </CardFooter>
      <AnimatePresence>{isClient && level !== null && level >= 3 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Confetti recycle={false} numberOfPieces={120} gravity={0.25} /></motion.div>)}</AnimatePresence>
    </Card>
  );

  const testResults = useMemo(
  () => (import.meta.env.DEV ? runUnitTests() : []),
  []
);

  return (
    <div className={`${theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-500`}>
      <div className="relative max-w-3xl mx-auto px-4 py-8 md:py-12">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3 w-full">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3"><Brain className="h-8 w-8" /> Mind‑Blown Diagnostic</h1>
            <p className="opacity-80 max-w-2xl">One question at a time. When a final determination is possible, your result pops right up.</p>
            <div className="flex flex-wrap items-center gap-2">{stage === "final" ? levelBadge : <Badge variant="outline">In progress</Badge>}<ThinkingConsole thinking={thinking} message={message} /></div>
            <ProgressBar percent={progressPct} label={progressLabel} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={resetAll} className="gap-2"><RefreshCw className="h-4 w-4" /> Reset</Button>
            <Button variant="ghost" onClick={toggleTheme} className="gap-2">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{theme === "dark" ? "Light" : "Dark"} mode</Button>
          </div>
        </header>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {stage === "question" ? (
              <motion.div key={`q-${current}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{QuestionCard}</motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{ResultPanel}</motion.div>
            )}
          </AnimatePresence>
        </div>

{import.meta.env.DEV && (
  <div className="mt-8">
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Dev • Unit Tests</CardTitle>
        <CardDescription className="opacity-80">
          These run on load and don’t block the app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-xs grid gap-1">
          {testResults.map((t, i) => (
            <li key={i} className={t.pass ? "text-emerald-400" : "text-rose-400"}>
              {t.pass ? "✔" : "✖"} {t.name}{t.details ? ` — ${t.details}` : ""}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </div>
)}

        {stage === "final" && (
          <div className="mt-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Legend</CardTitle><CardDescription className="opacity-80">Levels & quick cues</CardDescription></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(LEVELS).map(([num, info]) => (
                    <li key={num} className="flex items-start gap-3">
                      <div className="mt-1">{info.icon}</div>
                      <div><div className="font-medium">Level {num}: {info.name}</div><div className="text-sm opacity-80">{info.blurb}</div></div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <footer className="mt-10 text-xs opacity-70">Built with an unreasonable amount of whimsy.</footer>
      </div>
    </div>
  );
}
