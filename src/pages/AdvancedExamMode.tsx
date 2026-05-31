import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, Flame, Shield, Timer, RotateCcw, Trophy, Hash,
  Type as TypeIcon, KeyRound, ArrowRight, CheckCircle2,
} from "lucide-react";
import {
  getRandomParagraph,
  getPoolSize,
  type Difficulty,
  type ExamTag,
  type AdvancedParagraph,
} from "@/lib/advancedParagraphs";
import { saveTestRecord } from "@/lib/progressTracker";
import SEO from "@/components/SEO";

const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; icon: any; desc: string }> = {
  medium: { label: "Medium", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Shield, desc: "Warm-up · basic punctuation" },
  hard: { label: "Hard", color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: Flame, desc: "Exam level · numbers + symbols" },
  extreme: { label: "Extreme", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: AlertTriangle, desc: "BSF / SSC high-level · stress mode" },
};

interface Mistakes { symbols: number; numbers: number; caps: number; letters: number; }

const isSymbol = (c: string) => /[^A-Za-z0-9\s]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);

// Append a fresh paragraph when user is approaching end of current text.
const APPEND_THRESHOLD = 200; // chars remaining

const AdvancedExamMode = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [exam, setExam] = useState<ExamTag | "any">("any");
  const [examModeOn, setExamModeOn] = useState(false);
  const [noBackspace, setNoBackspace] = useState(false);
  const [duration, setDuration] = useState(5); // minutes

  const [text, setText] = useState("");
  const [currentTags, setCurrentTags] = useState<{ difficulty: Difficulty; exam: ExamTag } | null>(null);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [finalStats, setFinalStats] = useState<ReturnType<typeof computeStats> | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => { document.title = "Advanced Exam Mode — SSC, BSF, CPCT Typing Practice"; }, []);

  // Compute stats from given input/text/start
  function computeStats(input: string, full: string, start: number | null) {
    let errors = 0;
    const m: Mistakes = { symbols: 0, numbers: 0, caps: 0, letters: 0 };
    for (let i = 0; i < input.length; i++) {
      const u = input[i]; const t = full[i];
      if (u !== t) {
        errors++;
        if (t && isSymbol(t)) m.symbols++;
        else if (t && isDigit(t)) m.numbers++;
        else if (t && t !== t.toLowerCase() && u.toLowerCase() === t.toLowerCase()) m.caps++;
        else m.letters++;
      }
    }
    const minutes = start ? (Date.now() - start) / 60000 : 0;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    const cpm = minutes > 0 ? Math.round(input.length / minutes) : 0;
    const accuracy = input.length ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100)) : 100;
    return { wpm, cpm, accuracy, errors, mistakes: m, words, minutes };
  }

  const startFresh = useCallback((opts?: { keepSession?: boolean }) => {
    const p = getRandomParagraph(difficulty, exam === "any" ? undefined : exam);
    setText(p.text);
    setCurrentTags({ difficulty: p.difficulty, exam: p.exam });
    setUserInput("");
    setStartTime(null);
    setFinished(false);
    finishedRef.current = false;
    setFinalStats(null);
    setTimeLeft(examModeOn ? duration * 60 : null);
    if (!opts?.keepSession) setSessionCount(1);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, exam, examModeOn, duration]);

  // Initial + on filter/timer change
  useEffect(() => { startFresh(); }, [startFresh]);

  // Auto-extend paragraph so user never runs out before timer ends
  useEffect(() => {
    if (finished || !text) return;
    if (text.length - userInput.length < APPEND_THRESHOLD) {
      const next = getRandomParagraph(
        currentTags?.difficulty || difficulty,
        exam === "any" ? undefined : exam
      );
      setText((t) => t + " " + next.text);
    }
  }, [userInput, text, finished, currentTags, difficulty, exam]);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    const s = computeStats(userInput, text, startTime);
    setFinalStats(s);
    saveTestRecord({
      type: "exam",
      wpm: s.wpm,
      cpm: s.cpm,
      accuracy: s.accuracy,
      errors: s.errors,
      timeSpent: Math.round(s.minutes * 60),
      title: `Advanced ${difficulty.toUpperCase()}${exam !== "any" ? " (" + exam.toUpperCase() + ")" : ""}`,
    });
  }, [userInput, text, startTime, difficulty, exam]);

  // Timer
  useEffect(() => {
    if (!examModeOn || !startTime || finished) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = duration * 60 - elapsed;
      if (left <= 0) { setTimeLeft(0); finishTest(); clearInterval(id); }
      else setTimeLeft(left);
    }, 250);
    return () => clearInterval(id);
  }, [examModeOn, startTime, finished, duration, finishTest]);

  const liveStats = computeStats(userInput, text, startTime);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;
    let val = e.target.value;
    // Hard guard: never let input shrink when no-backspace is on
    if (noBackspace && val.length < userInput.length) return;
    if (val.length > text.length) val = val.slice(0, text.length);
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setUserInput(val);
  };

  // Block Backspace/Delete keys at the keydown level when toggle on
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (finished) { e.preventDefault(); return; }
    if (noBackspace && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
    }
  };

  const onRetry = () => startFresh({ keepSession: true });
  const onNextExam = () => {
    setSessionCount((c) => c + 1);
    startFresh({ keepSession: true });
  };

  const renderText = () =>
    text.split("").map((ch, i) => {
      let cls = "text-muted-foreground";
      if (i < userInput.length) cls = userInput[i] === ch ? "text-success" : "text-destructive bg-destructive/15";
      else if (i === userInput.length) cls = "text-foreground bg-primary/20 underline";
      return <span key={i} className={cls + " transition-colors"}>{ch}</span>;
    });

  const fmtTime = (s: number | null) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60); const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const Icon = DIFFICULTY_META[difficulty].icon;

  // ---------- RESULT VIEW ----------
  if (finished && finalStats) {
    const s = finalStats;
    const totalMistakes = s.mistakes.symbols + s.mistakes.numbers + s.mistakes.caps + s.mistakes.letters || 1;
    const bar = (n: number) => Math.round((n / totalMistakes) * 100);
    return (
      <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Advanced Exam Mode — SSC, BSF, Banking Typing Practice" description="Advanced typing exam simulator with dynamic paragraphs for SSC, BSF, and Banking exams." keywords="advanced typing exam, ssc typing, bsf typing, banking typing" breadcrumbs={[{name:"Home",path:"/"},{name:"Advanced Exam",path:"/advanced-exam"}]} />
        <Navbar />
        <AdLayout>
          <main className="container mx-auto px-4 py-8 flex-1">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary/30 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                  <h2 className="text-3xl font-bold">Exam Complete!</h2>
                  <p className="opacity-90 mt-1">
                    {DIFFICULTY_META[difficulty].label} · Session #{sessionCount}
                  </p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-xs text-muted-foreground">WPM</p>
                      <p className="text-3xl font-bold text-primary">{s.wpm}</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-3xl font-bold text-success">{s.accuracy}%</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-xs text-muted-foreground">Errors</p>
                      <p className="text-3xl font-bold text-destructive">{s.errors}</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-3xl font-bold font-mono">{fmtTime(Math.round(s.minutes * 60))}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Mistake Heatmap
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Symbols", icon: Hash, val: s.mistakes.symbols, color: "bg-red-500" },
                        { label: "Numbers", icon: () => <span className="text-xs font-bold">123</span>, val: s.mistakes.numbers, color: "bg-orange-500" },
                        { label: "Capitals", icon: TypeIcon, val: s.mistakes.caps, color: "bg-yellow-500" },
                        { label: "Letters", icon: () => <span className="text-xs font-bold">Aa</span>, val: s.mistakes.letters, color: "bg-blue-500" },
                      ].map((row) => {
                        const Ico: any = row.icon;
                        return (
                          <div key={row.label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-2"><Ico className="h-3 w-3" /> {row.label}</span>
                              <span className="font-semibold">{row.val}</span>
                            </div>
                            <div className="h-2 w-full rounded bg-muted overflow-hidden">
                              <div className={`h-full ${row.color} transition-all`} style={{ width: `${bar(row.val)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button size="lg" className="flex-1 gap-2" onClick={onRetry}>
                      <RotateCcw className="h-5 w-5" /> Retry
                    </Button>
                    <Button size="lg" variant="secondary" className="flex-1 gap-2" onClick={onNextExam}>
                      Next Exam <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </AdLayout>
      </div>
    );
  }

  // ---------- ACTIVE EXAM VIEW ----------
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              🔥 NEW · Advanced Exam Mode
            </Badge>
            <h1 className="text-4xl font-bold mb-2">Advanced Exam Typing Practice</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Auto-extending paragraphs · {getPoolSize()}+ dynamic variations · session #{sessionCount}
            </p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" /> Configure Your Drill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <TabsList className="grid grid-cols-3 w-full">
                  {(["medium", "hard", "extreme"] as Difficulty[]).map((d) => {
                    const M = DIFFICULTY_META[d]; const DI = M.icon;
                    return (
                      <TabsTrigger key={d} value={d} className="gap-2">
                        <DI className="h-4 w-4" /> {M.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
              <p className="text-sm text-muted-foreground">{DIFFICULTY_META[difficulty].desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Exam Type</Label>
                  <Select value={exam} onValueChange={(v) => setExam(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="ssc">SSC</SelectItem>
                      <SelectItem value="bsf">BSF</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="cpct">CPCT</SelectItem>
                      <SelectItem value="court">Court</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Timer (Exam Mode)</Label>
                  <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes (CPCT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <Label htmlFor="exam-mode" className="text-sm flex items-center gap-1">
                      <Timer className="h-4 w-4" /> Exam Mode
                    </Label>
                    <Switch id="exam-mode" checked={examModeOn} onCheckedChange={setExamModeOn} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <Label htmlFor="no-bs" className="text-sm flex items-center gap-1">
                      <KeyRound className="h-4 w-4" /> No Backspace
                    </Label>
                    <Switch id="no-bs" checked={noBackspace} onCheckedChange={setNoBackspace} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">WPM</p><p className="text-2xl font-bold">{liveStats.wpm}</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Accuracy</p><p className="text-2xl font-bold text-success">{liveStats.accuracy}%</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Errors</p><p className="text-2xl font-bold text-destructive">{liveStats.errors}</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">Typed</p><p className="text-2xl font-bold">{userInput.length}</p></Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Timer className="h-3 w-3" /> Time</p>
              <p className="text-2xl font-bold font-mono">{examModeOn ? fmtTime(timeLeft) : "Free"}</p>
            </Card>
          </div>

          {examModeOn && timeLeft !== null && (
            <Progress value={(1 - timeLeft / (duration * 60)) * 100} className="mb-4 h-2" />
          )}

          {/* Paragraph */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={DIFFICULTY_META[difficulty].color}>{DIFFICULTY_META[difficulty].label}</Badge>
                  {currentTags && <Badge variant="outline">{currentTags.exam.toUpperCase()}</Badge>}
                  <span className="text-xs text-muted-foreground">auto-extending</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onRetry}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Retry
                  </Button>
                  <Button size="sm" variant="secondary" onClick={onNextExam}>
                    Next Exam <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  {examModeOn && startTime && (
                    <Button size="sm" onClick={finishTest}>Finish</Button>
                  )}
                </div>
              </div>
              <div className="text-lg leading-relaxed font-mono select-none break-words max-h-72 overflow-y-auto">
                {renderText()}
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={finished}
                spellCheck={false}
                rows={5}
                placeholder="Start typing here..."
                className="w-full p-3 text-lg font-mono bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none disabled:opacity-60"
              />
              {noBackspace && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Backspace & Delete disabled — type carefully!
                </p>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default AdvancedExamMode;
