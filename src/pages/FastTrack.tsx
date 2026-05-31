import { useState, useEffect, useRef, useCallback } from "react";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw, Zap, Timer, Target, TrendingUp, Trophy, Delete } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackMissedKeys } from "@/lib/missedKeysTracker";
import { saveTestRecord } from "@/lib/progressTracker";
import { useTypingSettings, getCaretClassName, getHighlightClassName } from "@/hooks/useTypingSettings";
import { soundManager } from "@/lib/soundManager";
import SEO from "@/components/SEO";

const englishSentences = [
  "The only way to do great work is to love what you do.",
  "In the middle of difficulty lies opportunity.",
  "Success is not final failure is not fatal it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The greatest glory in living lies not in never falling but in rising every time we fall.",
  "The way to get started is to quit talking and begin doing.",
  "Your time is limited so do not waste it living someone elses life.",
  "If life were predictable it would cease to be life and be without flavor.",
  "Life is what happens when you are busy making other plans.",
  "The purpose of our lives is to be happy.",
  "You only live once but if you do it right once is enough.",
  "Many of lifes failures are people who did not realize how close they were to success when they gave up.",
  "If you want to live a happy life tie it to a goal not to people or things.",
  "Never let the fear of striking out keep you from playing the game.",
  "Money and success dont change people they merely amplify what is already there.",
  "Not how long but how well you have lived is the main thing.",
  "In three words I can sum up everything I have learned about life it goes on.",
  "Life is really simple but we insist on making it complicated.",
  "The best time to plant a tree was twenty years ago the second best time is now.",
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "The five boxing wizards jump quickly.",
  "Sphinx of black quartz judge my vow.",
  "Two driven jocks help fax my big quiz.",
  "The job requires extra pluck and zeal from every young wage earner.",
  "A mad boxer shot a quick gloved jab to the jaw of his dizzy opponent.",
  "Crazy Frederick bought many very exquisite opal jewels.",
  "We promptly judged antique ivory buckles for the next prize.",
  "Please schedule a meeting for next Monday at ten in the morning.",
  "The quarterly report shows significant improvement in all departments.",
  "Could you please review the attached documents and provide feedback.",
  "We appreciate your continued support and look forward to working together.",
  "The deadline for the project submission has been extended by two weeks.",
  "Please ensure all team members have access to the shared drive.",
  "The new software update will be deployed during the maintenance window.",
  "Customer satisfaction remains our top priority across all service areas.",
  "The annual budget review meeting will be held in the main conference room.",
  "Please submit your expense reports by the end of this business day.",
  "The algorithm processes data efficiently using parallel computing techniques.",
  "Version control helps teams collaborate on software development projects.",
  "Cloud computing enables scalable and flexible infrastructure solutions.",
  "Machine learning models require large datasets for accurate predictions.",
  "The database query returned over one million records in seconds.",
  "Responsive design ensures websites work well on all device sizes.",
  "The API endpoint accepts JSON formatted requests and responses.",
  "Encryption protects sensitive data during transmission and storage.",
  "The load balancer distributes traffic across multiple server instances.",
  "Continuous integration automates the testing and deployment process.",
  "Education is the most powerful weapon which you can use to change the world.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "It is during our darkest moments that we must focus to see the light.",
  "The best and most beautiful things in the world cannot be seen or even touched they must be felt with the heart.",
  "Tell me and I forget teach me and I remember involve me and I learn.",
  "Do not judge each day by the harvest you reap but by the seeds that you plant.",
  "The greatest wealth is to live content with little.",
  "Happiness is not something ready made it comes from your own actions.",
  "In the end we will remember not the words of our enemies but the silence of our friends.",
  "Believe you can and you are halfway there.",
];

const hindiSentences = [
  "करत करत अभ्यास के जड़मति होत सुजान।",
  "जहां चाह वहां राह।",
  "परिश्रम ही सफलता की कुंजी है।",
  "धीरे धीरे रे मना धीरे सब कुछ होय।",
  "अभ्यास से ही सिद्धि प्राप्त होती है।",
  "समय बहुत बलवान है।",
  "जो बीत गई सो बात गई।",
  "आज का काम कल पर मत छोड़ो।",
  "सच्चा मित्र वही है जो विपत्ति में साथ दे।",
  "ज्ञान से बड़ा कोई धन नहीं होता।",
  "मेहनत का फल मीठा होता है।",
  "सब्र का फल मीठा होता है।",
  "एकता में शक्ति है।",
  "अच्छी शुरुआत आधी जीत है।",
  "हार मानना सबसे बड़ी हार है।",
  "भारत एक महान देश है जहां विविधता में एकता है।",
  "हिंदी हमारी राष्ट्रभाषा है और हमें इस पर गर्व है।",
  "शिक्षा जीवन का सबसे महत्वपूर्ण भाग है।",
  "प्रौद्योगिकी ने हमारे जीवन को बहुत आसान बना दिया है।",
  "स्वास्थ्य ही सबसे बड़ा धन है इसे संभाल कर रखो।",
  "किताबें हमारी सबसे अच्छी मित्र होती हैं।",
  "प्रकृति की रक्षा करना हमारा कर्तव्य है।",
  "परिवार के साथ समय बिताना बहुत जरूरी है।",
  "सकारात्मक सोच से जीवन में बदलाव आता है।",
  "हमें अपने लक्ष्य पर केंद्रित रहना चाहिए।",
  "कृपया अपना काम समय पर पूरा करें।",
  "बैठक कल सुबह दस बजे होगी।",
  "आपका सहयोग हमारे लिए बहुत महत्वपूर्ण है।",
  "नई परियोजना अगले महीने शुरू होगी।",
  "कृपया सभी दस्तावेज़ जमा करें।",
];

const englishWords = {
  easy: [
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
    "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
    "boy", "did", "let", "put", "say", "she", "too", "use", "big", "ask",
    "run", "sit", "eat", "red", "blue", "top", "low", "end", "own", "set",
    "try", "why", "man", "few", "act", "add", "age", "ago", "air", "also",
    "any", "arm", "art", "bad", "bag", "bed", "bit", "box", "bus", "car",
    "cat", "cup", "cut", "dog", "ear", "eye", "far", "fat", "fit", "fly",
    "fun", "gas", "god", "got", "gun", "guy", "hat", "hit", "hot", "ice",
    "job", "key", "kid", "law", "leg", "lie", "lot", "map", "mix", "mom",
    "net", "oil", "pay", "pen", "pet", "pop", "pot", "raw", "row", "sea",
    "sit", "six", "sky", "son", "sun", "tax", "tea", "ten", "tie", "tip",
    "top", "toy", "war", "web", "win", "won", "yes", "yet", "zoo", "bar"
  ],
  medium: [
    "about", "after", "again", "being", "below", "between", "both", "come",
    "could", "down", "each", "find", "first", "from", "give", "good", "great",
    "have", "here", "high", "home", "house", "into", "just", "know", "last",
    "life", "little", "long", "made", "make", "more", "most", "much", "must",
    "name", "never", "next", "only", "other", "over", "part", "place", "right",
    "small", "start", "state", "still", "story", "study", "style", "table",
    "teach", "thank", "there", "these", "thing", "think", "those", "three",
    "today", "under", "until", "using", "value", "voice", "water", "watch",
    "week", "where", "which", "while", "white", "whole", "woman", "women",
    "world", "would", "write", "wrong", "years", "young", "yield", "zonal",
    "above", "accept", "across", "action", "active", "actual", "advice", "affect",
    "agency", "almost", "always", "amount", "animal", "answer", "anyone", "appear",
    "around", "attack", "author", "become", "before", "behind", "better", "beyond",
    "black", "blood", "board", "bring", "brown", "build", "buyer", "carry",
    "catch", "cause", "center", "change", "charge", "check", "child", "choice",
    "civil", "claim", "class", "clean", "clear", "close", "coach", "color",
    "coming", "common", "corner", "couple", "course", "cover", "create", "cross",
    "death", "design", "detail", "direct", "doctor", "drive", "early", "earth"
  ],
  hard: [
    "absolutely", "accomplish", "achievement", "acknowledge", "administration",
    "approximately", "background", "beautiful", "beginning", "believe",
    "breakthrough", "calculation", "certificate", "characteristic", "communication",
    "comprehensive", "concentration", "consideration", "contemporary", "contribution",
    "development", "difference", "difficulty", "disappointment", "discrimination",
    "effectiveness", "environment", "established", "examination", "extraordinary",
    "fundamental", "furthermore", "government", "immediately", "implementation",
    "improvement", "independent", "information", "infrastructure", "international",
    "investigation", "manufacturing", "nevertheless", "opportunities", "organization",
    "participation", "particularly", "performance", "philosophical", "possibilities",
    "professional", "psychological", "qualification", "recommendation", "relationship",
    "representative", "responsibility", "significantly", "sophisticated", "specification",
    "straightforward", "substantially", "technological", "transformation", "understanding",
    "unfortunately", "unprecedented", "visualization", "vulnerability", "accomplishment",
    "accountability", "acknowledgement", "administrative", "advantageous", "alternatively",
    "announcement", "appreciation", "architectural", "automatically", "characteristics"
  ]
};

const hindiWords = {
  easy: [
    "और", "का", "है", "में", "को", "से", "के", "पर", "यह", "था",
    "हम", "वह", "जो", "तो", "भी", "ने", "या", "कि", "एक", "हो",
    "अब", "जब", "कब", "क्या", "कौन", "कहां", "यहां", "वहां", "कैसे", "क्यों",
    "मैं", "तुम", "आप", "उस", "इस", "अपना", "सब", "कुछ", "ज़रा", "बस",
    "आज", "कल", "पहले", "बाद", "ऊपर", "नीचे", "अंदर", "बाहर", "साथ", "बीच",
    "घर", "काम", "दिन", "रात", "समय", "बात", "आदमी", "औरत", "बच्चा", "लोग"
  ],
  medium: [
    "करना", "होना", "जाना", "आना", "देना", "लेना", "कहना", "रहना", "बनना", "चलना",
    "सकता", "चाहिए", "लगता", "मिलना", "पाना", "रखना", "देखना", "सोचना", "समझना", "पहुँचना",
    "बताना", "सुनना", "पढ़ना", "लिखना", "खाना", "पीना", "सोना", "उठना", "बैठना", "खड़ा",
    "अच्छा", "बुरा", "बड़ा", "छोटा", "नया", "पुराना", "सही", "गलत", "आसान", "मुश्किल"
  ],
  hard: [
    "प्रशासन", "सम्मान", "व्यवस्था", "अभिव्यक्ति", "प्रतिनिधित्व", "सुविधाजनक",
    "अनुभव", "स्थापित", "संस्थान", "विकास", "सम्बन्ध", "प्रभावशाली",
    "सरकार", "संविधान", "लोकतंत्र", "अधिकार", "स्वतंत्रता", "समानता", "न्याय", "कानून",
    "शिक्षा", "स्वास्थ्य", "अर्थव्यवस्था", "उद्योग", "प्रौद्योगिकी", "विज्ञान", "अनुसंधान", "आविष्कार"
  ]
};

interface TestStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  timeSpent: number;
}

interface WpmDataPoint {
  time: number;
  wpm: number;
}

const TIME_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "120s", value: 120 },
];

const FastTrack = () => {
  const { isHindi } = useLanguage();
  const typingSettings = useTypingSettings();
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [testCount, setTestCount] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [avgWpm, setAvgWpm] = useState(0);
  const [totalWpmSum, setTotalWpmSum] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);
  const [stats, setStats] = useState<TestStats>({
    wpm: 0, cpm: 0, accuracy: 100, errors: 0, timeSpent: 0,
  });
  
  // New settings
  const [backspaceEnabled, setBackspaceEnabled] = useState(true);
  const [timerMode, setTimerMode] = useState<number | null>(null); // null = no timer (type to end)
  const [customTime, setCustomTime] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const wpmTrackingRef = useRef<WpmDataPoint[]>([]);

  const generateParagraph = useCallback((wordCount: number = 150) => {
    // Generate much longer text for extended typing
    if (Math.random() < 0.3) {
      const sentences = isHindi ? hindiSentences : englishSentences;
      const numSentences = Math.min(sentences.length, Math.floor(Math.random() * 10) + 8);
      const shuffled = [...sentences].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, numSentences).join(' ');
    }
    const words = isHindi ? hindiWords : englishWords;
    const pool = [...words.easy, ...(difficulty !== 'easy' ? words.medium : []), ...(difficulty === 'hard' ? words.hard : [])];
    const result: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result.join(' ');
  }, [isHindi, difficulty]);

  const startNewTest = useCallback(() => {
    setText(generateParagraph(150));
    setUserInput("");
    setStartTime(null);
    setIsActive(false);
    setShowResult(false);
    wpmTrackingRef.current = [];
    setWpmHistory([]);
    setStats({ wpm: 0, cpm: 0, accuracy: 100, errors: 0, timeSpent: 0 });
    setTimeRemaining(timerMode);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [generateParagraph, timerMode]);

  useEffect(() => {
    startNewTest();
  }, [difficulty, isHindi]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || !startTime || timerMode === null || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      finishTest();
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime, timerMode, timeRemaining]);

  // Track WPM over time
  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const wordsTyped = userInput.trim().split(/\s+/).filter(w => w).length;
      const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
      wpmTrackingRef.current.push({ time: Math.round(elapsed), wpm });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime, userInput]);

  useEffect(() => {
    if (userInput.length > 0 && !startTime) {
      setStartTime(Date.now());
      setIsActive(true);
    }

    if (userInput.length > 0 && startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60;
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const charsTyped = userInput.length;
      let errors = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== text[i]) errors++;
      }
      const accuracy = userInput.length > 0 
        ? Math.max(0, ((userInput.length - errors) / userInput.length) * 100) : 100;
      const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      setStats({
        wpm: currentWpm,
        cpm: timeElapsed > 0 ? Math.round(charsTyped / timeElapsed) : 0,
        accuracy: Math.round(accuracy),
        errors,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
      });
    }
  }, [userInput, startTime, text]);

  // Auto-scroll text display
  useEffect(() => {
    if (textDisplayRef.current && userInput.length > 0) {
      const currentCharEl = textDisplayRef.current.querySelector(`[data-index="${userInput.length}"]`);
      if (currentCharEl) {
        currentCharEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Block backspace when disabled
    if (!backspaceEnabled && value.length < userInput.length) {
      return;
    }
    
    // Stop on error
    if (typingSettings.stopOnError && value.length > userInput.length) {
      const lastIndex = value.length - 1;
      if (value[lastIndex] !== text[lastIndex]) {
        soundManager.playError();
        return;
      }
    }
    if (value.length > userInput.length) {
      const lastChar = value[value.length - 1];
      if (lastChar === text[value.length - 1]) {
        soundManager.playKeyPress();
      } else {
        soundManager.playError();
      }
    }
    if (value.length <= text.length) {
      setUserInput(value);
    }
    if (value.length === text.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    trackMissedKeys(text, userInput);
    const newTestCount = testCount + 1;
    setTestCount(newTestCount);
    const newTotalWpm = totalWpmSum + stats.wpm;
    setTotalWpmSum(newTotalWpm);
    setAvgWpm(Math.round(newTotalWpm / newTestCount));
    if (stats.wpm > bestWpm) setBestWpm(stats.wpm);
    
    saveTestRecord({
      type: 'test', wpm: stats.wpm, cpm: stats.cpm,
      accuracy: stats.accuracy, errors: stats.errors,
      timeSpent: stats.timeSpent, title: 'Fast Track'
    });
    
    if (stats.accuracy >= 95 && stats.wpm >= 40 && difficulty === 'easy') setDifficulty('medium');
    else if (stats.accuracy >= 90 && stats.wpm >= 50 && difficulty === 'medium') setDifficulty('hard');
    
    setWpmHistory([...wpmTrackingRef.current]);
    setShowResult(true);
    setIsActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      startNewTest();
    }
    if (!backspaceEnabled && e.key === 'Backspace') {
      e.preventDefault();
    }
    // Ctrl + Enter = new paragraph (restart with new text)
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      startNewTest();
    }
  };

  // Auto-focus on any keypress so typing starts immediately
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showResult) return;
      // Ignore modifier-only keys and special keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].includes(e.key)) return;
      // If input is not focused, focus it
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showResult]);

  const handleSetTimer = (seconds: number | null) => {
    setTimerMode(seconds);
    setTimeRemaining(seconds);
    setShowCustomInput(false);
    // Restart test with new timer
    setText(generateParagraph(150));
    setUserInput("");
    setStartTime(null);
    setIsActive(false);
    setShowResult(false);
    wpmTrackingRef.current = [];
    setWpmHistory([]);
    setStats({ wpm: 0, cpm: 0, accuracy: 100, errors: 0, timeSpent: 0 });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCustomTimeSubmit = () => {
    const val = parseInt(customTime);
    if (val > 0 && val <= 3600) {
      handleSetTimer(val);
      setCustomTime("");
    }
  };

  const currentIndex = userInput.length;

  const getCharacterClass = (index: number) => {
    return getHighlightClassName(typingSettings.highlightMode, index, currentIndex, text, userInput);
  };

  const getCaretClass = (index: number) => {
    return getCaretClassName(typingSettings.caretStyle, typingSettings.smoothCaret, index === currentIndex);
  };

  const getPerformanceMessage = () => {
    if (stats.wpm >= 60 && stats.accuracy >= 95) return { message: isHindi ? "उत्कृष्ट! प्रोफेशनल लेवल" : "Excellent! Professional Level", emoji: "🏆" };
    if (stats.wpm >= 40 && stats.accuracy >= 90) return { message: isHindi ? "बहुत अच्छा! औसत से ऊपर" : "Great! Above Average", emoji: "🌟" };
    if (stats.wpm >= 25 && stats.accuracy >= 80) return { message: isHindi ? "अच्छा! अभ्यास जारी रखें" : "Good! Keep Practicing", emoji: "👍" };
    return { message: isHindi ? "जारी रखें! अभ्यास से सब होता है" : "Keep Going! Practice Makes Perfect", emoji: "💪" };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Fast Track Mode — Quick Typing Speed Builder" description="Fast Track typing mode with custom timer and instant restart shortcuts." keywords="fast track typing, quick typing speed" breadcrumbs={[{name:"Home",path:"/"},{name:"Fast Track",path:"/fast-track"}]} />
      <Navbar />
      <AdLayout>
      <main className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto overflow-hidden">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Fast Track
            </h1>
            <p className="text-muted-foreground">
              {isHindi 
                ? "Tab दबाएं नया paragraph पाने के लिए • बस टाइप करते रहें"
                : "Press Tab for new paragraph • Just keep typing"}
            </p>
          </div>

          {/* Controls Row: Backspace Toggle + Timer + Difficulty */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {/* Backspace Toggle */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <Delete className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="backspace-toggle" className="text-sm cursor-pointer">
                {isHindi ? "बैकस्पेस" : "Backspace"}
              </Label>
              <Switch
                id="backspace-toggle"
                checked={backspaceEnabled}
                onCheckedChange={setBackspaceEnabled}
              />
            </div>

            {/* Timer Options */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1">
              <Timer className="h-4 w-4 text-muted-foreground mr-1" />
              <Button
                variant={timerMode === null ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleSetTimer(null)}
              >
                {isHindi ? "अंत तक" : "No Timer"}
              </Button>
              {TIME_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={timerMode === opt.value ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleSetTimer(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
              {showCustomInput ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    placeholder="sec"
                    className="h-7 w-16 text-xs"
                    min={1}
                    max={3600}
                    onKeyDown={e => { if (e.key === 'Enter') handleCustomTimeSubmit(); }}
                  />
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={handleCustomTimeSubmit}>
                    ✓
                  </Button>
                </div>
              ) : (
                <Button
                  variant={timerMode !== null && !TIME_OPTIONS.some(o => o.value === timerMode) ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowCustomInput(true)}
                >
                  {isHindi ? "कस्टम" : "Custom"}
                </Button>
              )}
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">{isHindi ? "टेस्ट" : "Tests"}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{testCount}</p>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{isHindi ? "सर्वश्रेष्ठ" : "Best"}</span>
              </div>
              <p className="text-xl font-bold text-primary">{bestWpm}</p>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Timer className="h-4 w-4" />
                <span className="text-xs">{isHindi ? "औसत" : "Avg"}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{avgWpm}</p>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs">{isHindi ? "स्तर" : "Level"}</span>
              </div>
              <p className="text-xl font-bold capitalize text-foreground">
                {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'}
              </p>
            </Card>
          </div>

          {/* Difficulty Selector */}
          <div className="flex justify-center gap-2 mb-4">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(d)}
              >
                {d === 'easy' ? (isHindi ? 'आसान' : 'Easy') : 
                 d === 'medium' ? (isHindi ? 'मध्यम' : 'Medium') : 
                 (isHindi ? 'कठिन' : 'Hard')}
              </Button>
            ))}
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="p-4 text-center bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">WPM</p>
              <p className="text-3xl font-bold text-foreground">{stats.wpm}</p>
            </Card>
            <Card className="p-4 text-center bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">CPM</p>
              <p className="text-3xl font-bold text-foreground">{stats.cpm}</p>
            </Card>
            <Card className="p-4 text-center bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
            </Card>
            <Card className="p-4 text-center bg-card/50">
              <p className="text-xs text-muted-foreground mb-1">
                {timerMode !== null ? (isHindi ? "शेष" : "Left") : (isHindi ? "समय" : "Time")}
              </p>
              <p className={`text-3xl font-bold ${timerMode !== null && timeRemaining !== null && timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                {timerMode !== null && timeRemaining !== null ? timeRemaining : stats.timeSpent}s
              </p>
            </Card>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {!backspaceEnabled && (
              <span className="text-xs text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded">
                ⌫ {isHindi ? "बैकस्पेस बंद" : "Backspace OFF"}
              </span>
            )}
            {timerMode !== null && (
              <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded">
                ⏱ {timerMode}s {isHindi ? "टाइमर" : "Timer"}
              </span>
            )}
          </div>

          {/* Typing Area */}
          <Card 
            className="p-8 mb-4 bg-card cursor-text overflow-hidden max-w-full"
            onClick={() => inputRef.current?.focus()}
          >
            <div 
              ref={textDisplayRef}
              className="text-2xl md:text-3xl leading-relaxed font-mono select-none mb-8 tracking-wide max-h-[300px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap"
              style={{ wordSpacing: '0.3em', overflowWrap: 'break-word', wordBreak: 'normal' }}
            >
              {text.split("").map((char, index) => (
                <span 
                  key={index}
                  data-index={index}
                  className={`${getCharacterClass(index)} ${getCaretClass(index)}`}
                >
                  {char}
                </span>
              ))}
            </div>
            
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 h-0 w-0 overflow-hidden"
              style={{ pointerEvents: 'auto' }}
              autoFocus
              spellCheck={false}
            />

            {!isActive && userInput.length === 0 && (
              <div 
                className="text-center text-muted-foreground cursor-pointer py-4"
                onClick={() => inputRef.current?.focus()}
              >
                {isHindi ? "टाइप करना शुरू करें..." : "Click here or start typing..."}
              </div>
            )}
          </Card>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={startNewTest} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              {isHindi ? "नया (Tab)" : "New (Tab)"}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {userInput.length} / {text.length} • {Math.round((userInput.length / text.length) * 100)}%
          </div>
        </div>
      </main>

      {/* Result Popup Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              {isHindi ? "टेस्ट पूरा!" : "Test Complete!"}
            </DialogTitle>
          </DialogHeader>

          <div className="text-center mb-4">
            <span className="text-4xl">{getPerformanceMessage().emoji}</span>
            <p className="text-lg font-semibold text-primary mt-2">{getPerformanceMessage().message}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">WPM</p>
              <p className="text-2xl font-bold text-primary">{stats.wpm}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">CPM</p>
              <p className="text-2xl font-bold text-foreground">{stats.cpm}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{isHindi ? "सटीकता" : "Accuracy"}</p>
              <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{isHindi ? "गलतियाँ" : "Errors"}</p>
              <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
            </Card>
          </div>

          {/* WPM Line Chart */}
          {wpmHistory.length > 1 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-2 text-center">
                {isHindi ? "टाइपिंग स्पीड ग्राफ" : "Typing Speed Over Time"}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={wpmHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: isHindi ? "समय (s)" : "Time (s)", position: "insideBottom", offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "WPM", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mb-4">
            {isHindi ? `समय: ${stats.timeSpent}s` : `Time: ${stats.timeSpent}s`}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => { setShowResult(false); startNewTest(); }} className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              {isHindi ? "अगला टेस्ट" : "Next Test"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
      </AdLayout>
    </div>
  );
};

export default FastTrack;
