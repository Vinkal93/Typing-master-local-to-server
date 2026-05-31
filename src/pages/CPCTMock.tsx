import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveTestRecord } from "@/lib/progressTracker";
import { trackMissedKeys } from "@/lib/missedKeysTracker";
import { Trophy, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";

const cpctTexts = {
  english: [
    "Madhya Pradesh Professional Examination Board conducts the Computer Proficiency Certification Test for candidates seeking government jobs requiring computer skills. The examination evaluates typing speed accuracy and basic computer knowledge. Candidates must demonstrate proficiency in both Hindi and English typing to qualify for various government positions across the state.",
    "The Government of India has implemented various digital initiatives to improve public service delivery and promote transparency in governance. These programs aim to bridge the digital divide and empower citizens with access to government services through electronic platforms. The Digital India program has been instrumental in transforming the countrys governance framework.",
    "Environmental conservation is a critical challenge facing our nation today. Sustainable development practices must be adopted across all sectors including agriculture industry and urban planning. The government has launched several initiatives to promote renewable energy reduce carbon emissions and protect natural resources for future generations.",
  ],
  hindi: [
    "मध्य प्रदेश व्यावसायिक परीक्षा मंडल कंप्यूटर दक्षता प्रमाणन परीक्षा का आयोजन करता है। यह परीक्षा उन अभ्यर्थियों के लिए है जो सरकारी नौकरियों में कंप्यूटर कौशल की आवश्यकता वाले पदों पर आवेदन करना चाहते हैं। परीक्षा में टाइपिंग गति सटीकता और बुनियादी कंप्यूटर ज्ञान का मूल्यांकन किया जाता है।",
    "भारत सरकार ने सार्वजनिक सेवा वितरण में सुधार और शासन में पारदर्शिता को बढ़ावा देने के लिए विभिन्न डिजिटल पहल लागू की हैं। इन कार्यक्रमों का उद्देश्य डिजिटल विभाजन को पाटना और नागरिकों को इलेक्ट्रॉनिक प्लेटफार्मों के माध्यम से सरकारी सेवाओं तक पहुंच प्रदान करना है।",
    "पर्यावरण संरक्षण आज हमारे राष्ट्र के समक्ष एक गंभीर चुनौती है। कृषि उद्योग और शहरी नियोजन सहित सभी क्षेत्रों में सतत विकास प्रथाओं को अपनाना आवश्यक है। सरकार ने नवीकरणीय ऊर्जा को बढ़ावा देने कार्बन उत्सर्जन को कम करने और भविष्य की पीढ़ियों के लिए प्राकृतिक संसाधनों की रक्षा करने के लिए कई पहल शुरू की हैं।",
  ],
};

const CPCTMock = () => {
  const { isHindi } = useLanguage();
  const [isStarted, setIsStarted] = useState(false);
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 min
  const [isFinished, setIsFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startTest = () => {
    const texts = isHindi ? cpctTexts.hindi : cpctTexts.english;
    const shuffled = [...texts].sort(() => Math.random() - 0.5);
    setText(shuffled.join(' '));
    setUserInput("");
    setTimeLeft(900);
    setIsStarted(true);
    setIsFinished(false);
    setShowResult(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && isStarted && !isFinished) finishTest();
  }, [isStarted, timeLeft, isFinished]);

  const finishTest = () => {
    setIsFinished(true);
    trackMissedKeys(text, userInput);
    const elapsed = (900 - timeLeft) / 60;
    const words = userInput.trim().split(/\s+/).filter(w => w).length;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) errors++;
    }
    const accuracy = userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : 0;
    saveTestRecord({
      type: 'exam', wpm, accuracy, errors,
      timeSpent: 900 - timeLeft,
      title: 'CPCT Mock Test',
    });
    setShowResult(true);
  };

  const getStats = () => {
    const elapsed = (900 - timeLeft) / 60;
    const words = userInput.trim().split(/\s+/).filter(w => w).length;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) errors++;
    }
    const accuracy = userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : 0;
    const passed = wpm >= 30 && accuracy >= 80;
    return { wpm, errors, accuracy, passed, elapsed };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
      <SEO title="CPCT Mock Test — Free Online CPCT Typing Test" description="Free CPCT mock typing test online. Practice with real exam paragraphs and instant WPM analysis." keywords="cpct mock test, cpct typing test, cpct online practice" breadcrumbs={[{name:"Home",path:"/"},{name:"CPCT Mock",path:"/cpct-mock"}]} />
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-lg text-center">
            <h1 className="text-3xl font-bold mb-4">📝 CPCT Mock Test</h1>
            <p className="text-muted-foreground mb-4">
              {isHindi
                ? "MP CPCT परीक्षा पैटर्न — 15 मिनट, न्यूनतम 30 WPM, 80% सटीकता, Backspace अनुमति नहीं"
                : "MP CPCT exam pattern — 15 minutes, minimum 30 WPM, 80% accuracy, no backspace allowed"}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted rounded-lg p-3">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold">15 min</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold">30 WPM</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <p className="text-sm font-bold">{isHindi ? "बैकस्पेस बंद" : "No Backspace"}</p>
              </div>
            </div>
            <Button onClick={startTest} size="lg" className="w-full">{isHindi ? "परीक्षा शुरू करें" : "Start Exam"}</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">📝 CPCT Mock</h1>
            <div className="flex items-center gap-4">
              <span className="text-lg font-mono font-bold text-primary">{formatTime(timeLeft)}</span>
              <span className="text-sm">{stats.wpm} WPM</span>
              <span className="text-sm">{stats.accuracy}%</span>
            </div>
          </div>

          <Progress value={(userInput.length / text.length) * 100} className="h-2 mb-4" />

          {/* Text display */}
          <Card className="p-6 mb-4">
            <div className="text-lg leading-relaxed font-mono select-none max-h-[250px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap" style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}>
              {text.split("").map((char, i) => {
                let cls = "text-muted-foreground/50";
                if (i < userInput.length) {
                  cls = userInput[i] === text[i] ? "text-foreground/90" : "text-destructive bg-destructive/10";
                }
                if (i === userInput.length) {
                  cls += " border-l-2 border-primary";
                }
                return <span key={i} className={cls}>{char}</span>;
              })}
            </div>
          </Card>

          {/* Input */}
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => {
              if (isFinished) return;
              const v = e.target.value;
              // No backspace
              if (v.length < userInput.length) return;
              setUserInput(v);
              if (v.length >= text.length) finishTest();
            }}
            className="w-full p-4 text-lg font-mono border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none bg-background"
            rows={4}
            spellCheck={false}
            disabled={isFinished}
          />

          <div className="flex justify-center mt-4">
            <Button onClick={finishTest} variant="destructive" disabled={isFinished}>
              {isHindi ? "परीक्षा समाप्त" : "End Exam"}
            </Button>
          </div>
        </div>
      </main>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {stats.passed ? "🎉 " : "😔 "}
              {stats.passed
                ? (isHindi ? "परीक्षा उत्तीर्ण!" : "Exam Passed!")
                : (isHindi ? "उत्तीर्ण नहीं" : "Not Passed")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">WPM</p><p className="text-2xl font-bold text-primary">{stats.wpm}</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">{isHindi ? "सटीकता" : "Accuracy"}</p><p className="text-2xl font-bold">{stats.accuracy}%</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">{isHindi ? "गलतियाँ" : "Errors"}</p><p className="text-2xl font-bold text-destructive">{stats.errors}</p></Card>
            <Card className="p-3 text-center"><p className="text-xs text-muted-foreground">{isHindi ? "समय" : "Time"}</p><p className="text-2xl font-bold">{formatTime(900 - timeLeft)}</p></Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            {isHindi ? "न्यूनतम: 30 WPM, 80% सटीकता" : "Minimum: 30 WPM, 80% accuracy"}
          </p>
          <Button onClick={startTest} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            {isHindi ? "फिर से टेस्ट दें" : "Retake Test"}
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CPCTMock;
