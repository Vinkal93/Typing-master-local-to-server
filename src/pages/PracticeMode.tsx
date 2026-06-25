import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TestResult from "@/components/TestResult";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { saveTestRecord, markLessonComplete } from "@/lib/progressTracker";
import { trackMissedKeys } from "@/lib/missedKeysTracker";
import SEO from "@/components/SEO";
import { useStudent } from "@/contexts/StudentContext";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface TestStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  timeSpent: number;
}

const PracticeMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPremium, profile } = useStudent();

  // Plan-based custom text character limits
  // Free (logged-out / no premium) → 250 chars
  // Premium (Pro/Elite) → unlimited (0)
  // Logged-in but no premium (treated as Basic free-trial) → 800 chars
  const customLimit = isPremium ? 0 : profile ? 800 : 250;
  
  const mode = searchParams.get("mode") || "custom";
  const urlText = searchParams.get("text");
  const lessonTitle = searchParams.get("title");
  const lessonId = searchParams.get("lessonId");
  
  const [text, setText] = useState(urlText || "");
  const [customInput, setCustomInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState<TestStats>({
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    errors: 0,
    timeSpent: 0,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (userInput.length > 0 && !startTime) {
      setStartTime(Date.now());
    }

    if (userInput.length > 0 && startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const charsTyped = userInput.length;
      
      const errors = calculateErrors();
      const accuracy = userInput.length > 0 
        ? Math.max(0, ((userInput.length - errors) / userInput.length) * 100)
        : 100;

      setStats({
        wpm: timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0,
        cpm: timeElapsed > 0 ? Math.round(charsTyped / timeElapsed) : 0,
        accuracy: Math.round(accuracy),
        errors,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
      });
    }
  }, [userInput, startTime]);

  const calculateErrors = () => {
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) {
        errors++;
      }
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= text.length) {
      setUserInput(value);
    }

    if (value.length === text.length) {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    
    // Track missed keys for smart practice
    trackMissedKeys(text, userInput);
    
    // Save progress
    saveTestRecord({
      type: 'lesson',
      wpm: stats.wpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      timeSpent: stats.timeSpent,
      title: lessonTitle || 'Practice'
    });
    
    // Mark lesson as complete if it's a lesson
    if (lessonId) {
      markLessonComplete(lessonId);
    }
  };

  const handleRestart = () => {
    setUserInput("");
    setStartTime(null);
    setIsFinished(false);
    setStats({
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      errors: 0,
      timeSpent: 0,
    });
    inputRef.current?.focus();
  };

  const handleStartCustom = () => {
    if (customInput.trim()) {
      setText(customInput.trim());
      setCustomInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return "text-muted-foreground";
    if (userInput[index] === text[index]) return "text-success";
    return "text-destructive bg-destructive/10";
  };

  if (isFinished) {
    return <TestResult stats={stats} onRestart={handleRestart} duration={stats.timeSpent} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Practice — Free Online Practice Sessions" description="Free typing practice sessions with random and custom paragraphs." keywords="typing practice, free typing practice" breadcrumbs={[{name:"Home",path:"/"},{name:"Practice",path:"/practice"}]} />
      <Navbar />
      <AdLayout>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Custom Text Input */}
        {mode === "custom" && !text && (
          <Card className="max-w-3xl mx-auto p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              अपना Text Paste करें
            </h2>
            <p className="text-muted-foreground mb-4">
              आप जिस भी text पर practice करना चाहते हैं, उसे नीचे paste करें
            </p>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="अपना text यहां paste करें..."
              className="min-h-[200px] text-lg mb-4"
            />
            <Button onClick={handleStartCustom} size="lg" className="w-full" disabled={!customInput.trim()}>
              Start Practice
            </Button>
          </Card>
        )}

        {/* Practice Area */}
        {text && (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">WPM</p>
                <p className="text-2xl font-bold text-foreground">{stats.wpm}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">CPM</p>
                <p className="text-2xl font-bold text-foreground">{stats.cpm}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Errors</p>
                <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
              </Card>
            </div>

            {/* Typing Area */}
            <Card className="max-w-5xl mx-auto p-8 mb-6">
              <div className="text-xl leading-relaxed font-mono mb-6 select-none">
                {text.split("").map((char, index) => (
                  <span key={index} className={getCharacterClass(index)}>
                    {char}
                  </span>
                ))}
              </div>
              
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-4 text-xl font-mono border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none bg-background"
                placeholder="Type here..."
                rows={4}
                autoFocus
                spellCheck={false}
              />

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {userInput.length} / {text.length} characters
              </div>
            </Card>

            {/* Controls */}
            <div className="flex justify-center gap-4 max-w-5xl mx-auto">
              <Button onClick={handleRestart} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Restart
              </Button>
              {userInput.length > 0 && (
                <Button onClick={handleFinish} size="lg">
                  Finish
                </Button>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      </AdLayout>
    </div>
  );
};

export default PracticeMode;
