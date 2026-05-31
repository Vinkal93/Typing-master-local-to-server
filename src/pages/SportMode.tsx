import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Users, Play, RotateCcw, Download, Trash2, Clock, Target, Zap, Shield } from "lucide-react";
import {
  Student, CompetitionResult,
  saveStudent, findStudentByRoll,
  createCompetition, updateCompetitionStatus,
  saveResult, getLeaderboard, getStudentHistory,
  getResults, clearAllCompetitionData,
  competitionParagraphs,
} from "@/lib/competitionManager";
import jsPDF from "jspdf";
import SEO from "@/components/SEO";

type Phase = 'setup' | 'register' | 'countdown' | 'typing' | 'result';

const SportMode = () => {
  const { isHindi } = useLanguage();

  // Admin / setup
  const [duration, setDuration] = useState(60);
  const [paragraphIdx, setParagraphIdx] = useState(0);
  const [disableBackspace, setDisableBackspace] = useState(true);

  // Flow
  const [phase, setPhase] = useState<Phase>('setup');
  const [competitionId, setCompetitionId] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Registration form
  const [regName, setRegName] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regBatch, setRegBatch] = useState('');

  // Countdown
  const [countdown, setCountdown] = useState(3);

  // Typing
  const [timeLeft, setTimeLeft] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Result
  const [lastResult, setLastResult] = useState<CompetitionResult | null>(null);

  const paragraphs = isHindi ? competitionParagraphs.hi : competitionParagraphs.en;
  const currentParagraph = paragraphs[paragraphIdx % paragraphs.length];

  // ─── Start Competition (Admin) ───
  const handleStartCompetition = () => {
    const comp = createCompetition(paragraphIdx, duration);
    setCompetitionId(comp.id);
    setPhase('register');
  };

  // ─── Register Student ───
  const handleRegister = () => {
    if (!regName.trim() || !regRoll.trim()) return;
    let student = findStudentByRoll(regRoll.trim());
    if (!student) {
      student = saveStudent({
        name: regName.trim(),
        rollNo: regRoll.trim(),
        className: regClass.trim(),
        batch: regBatch.trim(),
      });
    }
    setCurrentStudent(student);
    setPhase('countdown');
    setCountdown(3);
  };

  // ─── Countdown ───
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('typing');
      setTimeLeft(duration);
      setUserInput('');
      setIsFinished(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, duration]);

  // ─── Timer ───
  useEffect(() => {
    if (phase !== 'typing' || isFinished) return;
    if (timeLeft <= 0) {
      finishTest();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft, isFinished]);

  // ─── Finish ───
  const finishTest = useCallback(() => {
    if (isFinished || !currentStudent) return;
    setIsFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    const elapsed = duration - timeLeft;
    const minutes = Math.max(elapsed, 1) / 60;
    const totalTyped = userInput.length;
    let correct = 0;
    for (let i = 0; i < totalTyped; i++) {
      if (userInput[i] === currentParagraph[i]) correct++;
    }
    const errors = totalTyped - correct;
    const wpm = Math.round((totalTyped / 5) / minutes);
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 0;

    const result = saveResult({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      rollNo: currentStudent.rollNo,
      className: currentStudent.className,
      batch: currentStudent.batch,
      competitionId,
      wpm,
      accuracy,
      errors,
      totalChars: totalTyped,
      correctChars: correct,
    });
    setLastResult(result);
    updateCompetitionStatus(competitionId, 'completed');
    setPhase('result');
  }, [isFinished, currentStudent, duration, timeLeft, userInput, currentParagraph, competitionId]);

  // ─── Input handler ───
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || phase !== 'typing') return;
    const val = e.target.value;
    // Disable backspace check
    if (disableBackspace && val.length < userInput.length) return;
    // Disable paste
    if (val.length - userInput.length > 1) return;
    setUserInput(val);
    if (val.length >= currentParagraph.length) {
      finishTest();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== 'typing') return;
    if (disableBackspace && e.key === 'Backspace') {
      e.preventDefault();
    }
    // Disable copy/paste shortcuts
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  };

  // ─── Reset for next student ───
  const handleNextStudent = () => {
    setRegName('');
    setRegRoll('');
    setRegClass('');
    setRegBatch('');
    setCurrentStudent(null);
    setLastResult(null);
    setUserInput('');
    setIsFinished(false);
    setPhase('register');
  };

  const handleNewCompetition = () => {
    setPhase('setup');
    setCompetitionId('');
    setCurrentStudent(null);
    setLastResult(null);
    setUserInput('');
  };

  // ─── Live stats ───
  const elapsed = duration - timeLeft;
  const liveMinutes = Math.max(elapsed, 1) / 60;
  const liveWpm = Math.round((userInput.length / 5) / liveMinutes);
  let liveCorrect = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === currentParagraph[i]) liveCorrect++;
  }
  const liveAccuracy = userInput.length > 0 ? Math.round((liveCorrect / userInput.length) * 100) : 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Export PDF ───
  const exportResultsPDF = () => {
    const lb = getLeaderboard(competitionId);
    if (lb.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sport Mode - Competition Results", 20, 20);
    doc.setFontSize(11);
    doc.text(`Competition ID: ${competitionId}`, 20, 30);
    doc.text(`Duration: ${duration}s | Date: ${new Date().toLocaleDateString()}`, 20, 37);

    let y = 50;
    doc.setFontSize(10);
    doc.text("Rank", 20, y); doc.text("Name", 40, y); doc.text("Roll No", 90, y);
    doc.text("WPM", 120, y); doc.text("Accuracy", 140, y); doc.text("Errors", 170, y);
    y += 8;
    lb.forEach((r, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}`, 20, y);
      doc.text(r.studentName, 40, y);
      doc.text(r.rollNo, 90, y);
      doc.text(`${r.wpm}`, 120, y);
      doc.text(`${r.accuracy}%`, 140, y);
      doc.text(`${r.errors}`, 170, y);
      y += 7;
    });
    doc.save(`competition-${competitionId}.pdf`);
  };

  // ─── RENDER ───

  // ── Setup Phase ──
  if (phase === 'setup') {
    const allResults = getLeaderboard();
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <SEO title="Sport Mode — Live Typing Competition" description="Live typing competition mode with synced countdown and local leaderboard." keywords="typing competition, sport typing mode" breadcrumbs={[{name:"Home",path:"/"},{name:"Sport Mode",path:"/sport-mode"}]} />
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-secondary" />
              <h1 className="text-3xl font-bold text-foreground">
                {isHindi ? "स्पोर्ट मोड" : "Sport Mode"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isHindi ? "प्रतियोगिता मोड — सब एक समान पैराग्राफ, टाइमर, और नियम" : "Competition Mode — Same paragraph, timer, and rules for all"}
            </p>
          </div>

          <Tabs defaultValue="start" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="start">{isHindi ? "प्रतियोगिता शुरू करें" : "Start Competition"}</TabsTrigger>
              <TabsTrigger value="leaderboard">{isHindi ? "लीडरबोर्ड" : "Leaderboard"}</TabsTrigger>
            </TabsList>

            <TabsContent value="start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {isHindi ? "प्रतियोगिता सेटिंग्स" : "Competition Settings"}
                  </CardTitle>
                  <CardDescription>
                    {isHindi ? "एडमिन: अवधि और पैराग्राफ चुनें" : "Admin: Select duration and paragraph"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isHindi ? "अवधि" : "Duration"}</Label>
                      <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 {isHindi ? "मिनट" : "Minute"}</SelectItem>
                          <SelectItem value="120">2 {isHindi ? "मिनट" : "Minutes"}</SelectItem>
                          <SelectItem value="180">3 {isHindi ? "मिनट" : "Minutes"}</SelectItem>
                          <SelectItem value="300">5 {isHindi ? "मिनट" : "Minutes"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isHindi ? "पैराग्राफ" : "Paragraph"}</Label>
                      <Select value={String(paragraphIdx)} onValueChange={v => setParagraphIdx(Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {paragraphs.map((_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {isHindi ? `पैराग्राफ ${i + 1}` : `Paragraph ${i + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground max-h-24 overflow-y-auto">
                    {currentParagraph.slice(0, 200)}...
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="disableBS"
                      checked={disableBackspace}
                      onChange={e => setDisableBackspace(e.target.checked)}
                      className="rounded border-input"
                    />
                    <Label htmlFor="disableBS">{isHindi ? "बैकस्पेस बंद करें" : "Disable Backspace"}</Label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleStartCompetition} className="flex-1 gap-2" size="lg">
                      <Play className="h-5 w-5" />
                      {isHindi ? "प्रतियोगिता शुरू करें" : "Start Competition"}
                    </Button>
                    <Button variant="destructive" onClick={() => { clearAllCompetitionData(); window.location.reload(); }} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      {isHindi ? "सब डेटा मिटाएं" : "Clear All Data"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-primary">{getResults().length}</div>
                      <div className="text-xs text-muted-foreground">{isHindi ? "कुल परिणाम" : "Total Results"}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-secondary">{duration}s</div>
                      <div className="text-xs text-muted-foreground">{isHindi ? "अवधि" : "Duration"}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-primary">#{paragraphIdx + 1}</div>
                      <div className="text-xs text-muted-foreground">{isHindi ? "पैराग्राफ" : "Paragraph"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-secondary" />
                    {isHindi ? "ऑल-टाइम लीडरबोर्ड" : "All-Time Leaderboard"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allResults.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {isHindi ? "अभी तक कोई परिणाम नहीं" : "No results yet"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {allResults.slice(0, 50).map((r, i) => (
                        <div key={r.id} className={`flex items-center gap-3 p-3 rounded-lg border ${i < 3 ? 'bg-secondary/10 border-secondary/30' : 'bg-muted/20 border-border'}`}>
                          <span className="text-lg font-bold w-8 text-center">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{r.studentName}</div>
                            <div className="text-xs text-muted-foreground">{r.rollNo} • {r.className} • {r.batch}</div>
                          </div>
                          <Badge variant="secondary" className="font-mono">{r.wpm} WPM</Badge>
                          <Badge variant="outline" className="font-mono">{r.accuracy}%</Badge>
                          <span className="text-xs text-muted-foreground">{r.errors}E</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {allResults.length > 0 && (
                    <Button variant="outline" className="mt-4 gap-2 w-full" onClick={exportResultsPDF}>
                      <Download className="h-4 w-4" />
                      {isHindi ? "PDF डाउनलोड करें" : "Export PDF"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Registration Phase ──
  if (phase === 'register') {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                {isHindi ? "प्रतिभागी पंजीकरण" : "Participant Registration"}
              </CardTitle>
              <CardDescription>
                {isHindi ? "प्रतियोगिता शुरू करने के लिए अपनी जानकारी दर्ज करें" : "Enter your details to start the competition"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isHindi ? "नाम *" : "Name *"}</Label>
                <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder={isHindi ? "अपना नाम लिखें" : "Enter your name"} />
              </div>
              <div className="space-y-2">
                <Label>{isHindi ? "रोल नंबर *" : "Roll Number *"}</Label>
                <Input value={regRoll} onChange={e => setRegRoll(e.target.value)} placeholder={isHindi ? "रोल नंबर" : "Roll Number"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{isHindi ? "कक्षा" : "Class"}</Label>
                  <Input value={regClass} onChange={e => setRegClass(e.target.value)} placeholder={isHindi ? "कक्षा" : "Class"} />
                </div>
                <div className="space-y-2">
                  <Label>{isHindi ? "बैच" : "Batch"}</Label>
                  <Input value={regBatch} onChange={e => setRegBatch(e.target.value)} placeholder={isHindi ? "बैच" : "Batch"} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleRegister} disabled={!regName.trim() || !regRoll.trim()} className="flex-1 gap-2" size="lg">
                  <Play className="h-5 w-5" />
                  {isHindi ? "शुरू करें" : "Start"}
                </Button>
                <Button variant="outline" onClick={handleNewCompetition}>
                  {isHindi ? "वापस" : "Back"}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2 space-y-1">
                <p>⏱ {isHindi ? "अवधि" : "Duration"}: {duration}s | {isHindi ? "बैकस्पेस" : "Backspace"}: {disableBackspace ? '❌' : '✅'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Countdown Phase ──
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <p className="text-lg text-muted-foreground">
              {isHindi ? "प्रतियोगिता शुरू हो रही है..." : "Competition Starting In..."}
            </p>
            <div className="text-9xl font-black text-primary animate-ping">
              {countdown}
            </div>
            <p className="text-muted-foreground font-medium">{currentStudent?.name}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Typing Phase ──
  if (phase === 'typing') {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-4 max-w-4xl">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Clock className="h-3 w-3" />
                {isHindi ? "समय" : "Time"}
              </div>
              <div className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Zap className="h-3 w-3" />
                WPM
              </div>
              <div className="text-2xl font-mono font-bold text-secondary">{liveWpm}</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Target className="h-3 w-3" />
                {isHindi ? "सटीकता" : "Accuracy"}
              </div>
              <div className="text-2xl font-mono font-bold text-primary">{liveAccuracy}%</div>
            </Card>
          </div>

          {/* Locked indicator */}
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Badge variant="destructive" className="text-xs gap-1">
              <Shield className="h-3 w-3" />
              {isHindi ? "लॉक मोड" : "LOCKED MODE"}
            </Badge>
            <Badge variant="outline" className="text-xs">{currentStudent?.name}</Badge>
          </div>

          {/* Paragraph display */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="text-lg leading-relaxed font-mono whitespace-pre-wrap break-words" style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}>
                {currentParagraph.split('').map((char, i) => {
                  let cls = 'text-muted-foreground/50';
                  if (i < userInput.length) {
                    cls = userInput[i] === char ? 'text-foreground' : 'text-destructive bg-destructive/10';
                  } else if (i === userInput.length) {
                    cls = 'border-l-2 border-primary text-foreground';
                  }
                  return <span key={i} className={cls}>{char}</span>;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Hidden input */}
          <Input
            ref={inputRef}
            value={userInput}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={e => e.preventDefault()}
            onCopy={e => e.preventDefault()}
            className="opacity-0 absolute -top-96"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Click to focus */}
          <p className="text-center text-xs text-muted-foreground cursor-pointer" onClick={() => inputRef.current?.focus()}>
            {isHindi ? "टाइप करने के लिए यहां क्लिक करें" : "Click here to start typing"}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Result Phase ──
  if (phase === 'result' && lastResult) {
    const compLeaderboard = getLeaderboard(competitionId);
    const rank = compLeaderboard.findIndex(r => r.id === lastResult.id) + 1;

    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎯'}</div>
            <h2 className="text-2xl font-bold text-foreground">
              {isHindi ? "परिणाम" : "Result"} — {lastResult.studentName}
            </h2>
            <p className="text-muted-foreground">
              {isHindi ? `रैंक: #${rank}` : `Rank: #${rank}`}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{lastResult.wpm}</div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-secondary">{lastResult.accuracy}%</div>
              <div className="text-xs text-muted-foreground">{isHindi ? "सटीकता" : "Accuracy"}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-destructive">{lastResult.errors}</div>
              <div className="text-xs text-muted-foreground">{isHindi ? "गलतियाँ" : "Errors"}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{lastResult.totalChars}</div>
              <div className="text-xs text-muted-foreground">{isHindi ? "कुल अक्षर" : "Total Chars"}</div>
            </Card>
          </div>

          {/* Competition Leaderboard */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="h-5 w-5 text-secondary" />
                {isHindi ? "इस प्रतियोगिता का लीडरबोर्ड" : "Competition Leaderboard"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {compLeaderboard.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${r.id === lastResult.id ? 'bg-primary/10 border border-primary/30' : ''}`}>
                  <span className="font-bold w-6 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="flex-1 truncate font-medium">{r.studentName}</span>
                  <Badge variant="secondary" className="font-mono text-xs">{r.wpm} WPM</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{r.accuracy}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleNextStudent} className="flex-1 gap-2" size="lg">
              <Users className="h-5 w-5" />
              {isHindi ? "अगला प्रतिभागी" : "Next Participant"}
            </Button>
            <Button variant="outline" onClick={handleNewCompetition} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {isHindi ? "नई प्रतियोगिता" : "New Competition"}
            </Button>
            <Button variant="outline" onClick={exportResultsPDF} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default SportMode;
