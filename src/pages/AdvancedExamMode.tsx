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
import { AlertTriangle, Flame, Shield, Timer, RotateCcw, Trophy, Hash, Type as TypeIcon, KeyRound } from "lucide-react";
import {
  getRandomParagraph,
  getPoolSize,
  type Difficulty,
  type ExamTag,
  type AdvancedParagraph,
} from "@/lib/advancedParagraphs";
import { saveTestRecord } from "@/lib/progressTracker";

const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; icon: any; desc: string }> = {
  medium: { label: "Medium", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Shield, desc: "Warm-up · basic punctuation" },
  hard: { label: "Hard", color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: Flame, desc: "Exam level · numbers + symbols" },
  extreme: { label: "Extreme", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: AlertTriangle, desc: "BSF / SSC high-level · stress mode" },
};

interface Mistakes {
  symbols: number;
  numbers: number;
  caps: number;
  letters: number;
}

const isSymbol = (c: string) => /[^A-Za-z0-9\s]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);

const AdvancedExamMode = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [exam, setExam] = useState<ExamTag | "any">("any");
  const [examModeOn, setExamModeOn] = useState(false);
  const [noBackspace, setNoBackspace] = useState(false);
  const [duration, setDuration] = useState(5); // minutes
  const [paragraph, setParagraph] = useState<AdvancedParagraph | null>(null);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = "Advanced Exam Mode — SSC, BSF, CPCT Typing Practice";
    loadNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload on filter change
  useEffect(() => {
    loadNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, exam]);

  const loadNew = useCallback(() => {
    const p = getRandomParagraph(difficulty, exam === "any" ? undefined : exam);
    setParagraph(p);
    setUserInput("");
    setStartTime(null);
    setFinished(false);
    setTimeLeft(examModeOn ? duration * 60 : null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, exam, examModeOn, duration]);

  // Timer
  useEffect(() => {
    if (!examModeOn || !startTime || finished) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = duration * 60 - elapsed;
      if (left <= 0) {
        setTimeLeft(0);
        setFinished(true);
        clearInterval(id);
      } else setTimeLeft(left);
    }, 250);
    return () => clearInterval(id);
  }, [examModeOn, startTime, finished, duration]);

  const text = paragraph?.text || "";

  // Stats
  const calcStats = () => {
    let errors = 0;
    const m: Mistakes = { symbols: 0, numbers: 0, caps: 0, letters: 0 };
    for (let i = 0; i < userInput.length; i++) {
      const u = userInput[i];
      const t = text[i];
      if (u !== t) {
        errors++;
        if (t && isSymbol(t)) m.symbols++;
        else if (t && isDigit(t)) m.numbers++;
        else if (t && t !== t.toLowerCase() && u.toLowerCase() === t.toLowerCase()) m.caps++;
        else m.letters++;
      }
    }
    const minutes = startTime ? (Date.now() - startTime) / 60000 : 0;
    const words = userInput.trim().split(/\s+/).filter(Boolean).length;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    const accuracy = userInput.length ? Math.max(0, Math.round(((userInput.length - errors) / userInput.length) * 100)) : 100;
    return { wpm, accuracy, errors, mistakes: m, words, minutes };
  };

  const stats = calcStats();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;
    let val = e.target.value;
    if (noBackspace && val.length < userInput.length) return; // block backspace
    if (val.length > text.length) val = val.slice(0, text.length);
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setUserInput(val);
    if (val.length === text.length) finishTest();
  };

  const finishTest = () => {
    setFinished(true);
    const s = calcStats();
    saveTestRecord({
      type: "exam",
      wpm: s.wpm,
      cpm: Math.round(userInput.length / Math.max(s.minutes, 0.01)),
      accuracy: s.accuracy,
      errors: s.errors,
      timeSpent: Math.round(s.minutes * 60),
      title: `Advanced ${difficulty.toUpperCase()} ${exam !== "any" ? "(" + exam.toUpperCase() + ")" : ""}`,
    });
  };

  const renderText = () =>
    text.split("").map((ch, i) => {
      let cls = "text-muted-foreground";
      if (i < userInput.length) cls = userInput[i] === ch ? "text-success" : "text-destructive bg-destructive/15";
      else if (i === userInput.length) cls = "text-foreground bg-primary/20 underline";
      return (
        <span key={i} className={cls + " transition-colors"}>
          {ch}
        </span>
      );
    });

  const fmtTime = (s: number | null) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const Icon = DIFFICULTY_META[difficulty].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              🔥 NEW · Advanced Exam Mode
            </Badge>
            <h1 className="text-4xl font-bold mb-2">Advanced Exam Typing Practice</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real exam-pattern paragraphs with symbols, numbers & stress elements. Pool of {getPoolSize()}+ dynamic
              paragraphs — no two sessions are the same.
            </p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" />
                Configure Your Drill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <TabsList className="grid grid-cols-3 w-full">
                  {(["medium", "hard", "extreme"] as Difficulty[]).map((d) => {
                    const M = DIFFICULTY_META[d];
                    const DI = M.icon;
                    return (
                      <TabsTrigger key={d} value={d} className="gap-2">
                        <DI className="h-4 w-4" />
                        {M.label}
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
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">WPM</p>
              <p className="text-2xl font-bold">{stats.wpm}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{Math.round((userInput.length / Math.max(text.length, 1)) * 100)}%</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Timer className="h-3 w-3" /> Time</p>
              <p className="text-2xl font-bold font-mono">{examModeOn ? fmtTime(timeLeft) : "Free"}</p>
            </Card>
          </div>

          <Progress value={(userInput.length / Math.max(text.length, 1)) * 100} className="mb-4 h-2" />

          {/* Paragraph */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={DIFFICULTY_META[difficulty].color}>{DIFFICULTY_META[difficulty].label}</Badge>
                  {paragraph && <Badge variant="outline">{paragraph.exam.toUpperCase()}</Badge>}
                  <span className="text-xs text-muted-foreground">{text.length} chars</span>
                </div>
                <Button size="sm" variant="outline" onClick={loadNew}>
                  <RotateCcw className="h-4 w-4 mr-1" /> New Paragraph
                </Button>
              </div>
              <div className="text-lg leading-relaxed font-mono select-none break-words">{renderText()}</div>
            </CardContent>
          </Card>

          {/* Input */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleChange}
                disabled={finished}
                spellCheck={false}
                rows={5}
                placeholder={finished ? "Test finished — click 'New Paragraph' to retry" : "Start typing here..."}
                className="w-full p-3 text-lg font-mono bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none disabled:opacity-60"
              />
              {noBackspace && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Backspace disabled — type carefully!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mistake Heatmap */}
          {(stats.errors > 0 || finished) && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Mistake Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4" /> Symbols</div>
                  <p className="text-2xl font-bold text-destructive">{stats.mistakes.symbols}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">123 Numbers</div>
                  <p className="text-2xl font-bold text-destructive">{stats.mistakes.numbers}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><TypeIcon className="h-4 w-4" /> Capitals</div>
                  <p className="text-2xl font-bold text-destructive">{stats.mistakes.caps}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">Aa Letters</div>
                  <p className="text-2xl font-bold text-destructive">{stats.mistakes.letters}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {finished && (
            <div className="text-center">
              <Button size="lg" onClick={loadNew} className="gap-2">
                <RotateCcw className="h-5 w-5" /> Try Another Paragraph
              </Button>
            </div>
          )}
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default AdvancedExamMode;
