import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RotateCcw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TestResult from "@/components/TestResult";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import AdLayout from "@/components/AdLayout";
import { saveTestRecord } from "@/lib/progressTracker";
import { trackMissedKeys } from "@/lib/missedKeysTracker";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTypingSettings, getCaretClassName, getHighlightClassName } from "@/hooks/useTypingSettings";
import { soundManager } from "@/lib/soundManager";
import SEO from "@/components/SEO";

const englishParagraphs = [
  "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. Practice makes perfect when it comes to typing speed and accuracy. Every keystroke matters in the digital age where communication happens at the speed of light. The ability to type quickly and accurately is a fundamental skill that opens doors to countless opportunities in the modern workplace.",
  "Technology has transformed the way we communicate and work. Every keystroke matters in the digital age. Learning to type efficiently can significantly improve productivity and reduce strain. In today's fast-paced world, the ability to express thoughts quickly through a keyboard is invaluable. From writing emails to coding software, typing is an essential skill that touches every aspect of professional life.",
  "Consistent practice is the key to mastering touch typing. Focus on accuracy first, then gradually build up your speed. Remember to maintain proper posture while typing for better results. The journey from hunt-and-peck typing to fluid touch typing requires dedication and patience. Set aside time each day to practice, and you will see remarkable improvement in just a few weeks.",
  "The internet has revolutionized how we access information and connect with people around the world. Search engines process billions of queries every day, helping users find exactly what they need in seconds. Social media platforms have created new ways for people to share experiences and build communities across geographical boundaries.",
  "Artificial intelligence is rapidly changing the landscape of technology and business. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions with remarkable accuracy. From healthcare diagnostics to autonomous vehicles, AI applications are transforming industries and creating new possibilities for innovation.",
  "The history of computing stretches back to the earliest mechanical calculators and has evolved through vacuum tubes, transistors, and integrated circuits to the powerful microprocessors we use today. Each generation of technology has brought exponential increases in processing power while dramatically reducing size and cost.",
  "Climate change represents one of the most significant challenges facing humanity today. Rising global temperatures are causing polar ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists around the world are working to develop sustainable solutions including renewable energy sources, carbon capture technology, and more efficient transportation systems.",
  "The art of writing well requires both natural talent and disciplined practice. Great writers understand the power of clear, concise language and know how to structure their thoughts in ways that engage and inform their readers. Whether writing fiction, journalism, or technical documentation, the ability to communicate effectively through the written word remains an essential skill.",
  "Space exploration has captured human imagination for centuries, from early astronomical observations to modern missions beyond our solar system. The development of rockets, satellites, and space stations has expanded our understanding of the universe and led to countless technological innovations that benefit life on Earth.",
  "Education is the foundation of personal growth and societal progress. Schools and universities provide structured environments where students can develop critical thinking skills, gain knowledge across diverse subjects, and prepare for successful careers. The digital age has expanded access to education through online courses and virtual classrooms.",
  "Music has been an integral part of human culture throughout history, serving as a means of expression, celebration, and connection. From classical symphonies to modern electronic beats, music continues to evolve and adapt to new technologies while maintaining its power to move and inspire people across all boundaries.",
  "The global economy is an interconnected system where events in one country can have ripple effects across the entire world. International trade, financial markets, and digital commerce create complex networks of economic relationships that drive growth and development while also presenting challenges for policymakers.",
];

const hindiParagraphs = [
  "भारत एक महान देश है जहां विविधता में एकता है। यहां अनेक भाषाएं, धर्म और संस्कृतियां मिलकर एक सुंदर समाज का निर्माण करती हैं। प्राचीन काल से ही भारत ज्ञान और विज्ञान का केंद्र रहा है। यहां के महान विद्वानों ने गणित, खगोल विज्ञान और चिकित्सा के क्षेत्र में अमूल्य योगदान दिया है।",
  "शिक्षा जीवन का सबसे महत्वपूर्ण भाग है। यह हमें सही और गलत में अंतर करना सिखाती है। शिक्षा के माध्यम से हम अपने जीवन को बेहतर बना सकते हैं और समाज में सकारात्मक बदलाव ला सकते हैं। एक शिक्षित व्यक्ति न केवल अपना बल्कि पूरे समाज का विकास करता है।",
  "प्रौद्योगिकी ने हमारे जीवन को बहुत आसान बना दिया है। आज हम इंटरनेट के माध्यम से दुनिया के किसी भी कोने से जुड़ सकते हैं। मोबाइल फोन और कंप्यूटर ने संचार और कार्य करने के तरीके को पूरी तरह बदल दिया है। डिजिटल तकनीक ने शिक्षा, स्वास्थ्य और व्यापार के क्षेत्र में क्रांति ला दी है।",
  "स्वास्थ्य ही सबसे बड़ा धन है। नियमित व्यायाम, संतुलित आहार और पर्याप्त नींद अच्छे स्वास्थ्य की कुंजी हैं। आधुनिक जीवनशैली में हमें अपने शरीर और मन दोनों का ध्यान रखना बहुत जरूरी है। योग और ध्यान मानसिक शांति और शारीरिक स्वास्थ्य दोनों के लिए अत्यंत लाभदायक हैं।",
  "पर्यावरण की रक्षा करना हमारा कर्तव्य है। बढ़ते प्रदूषण और जलवायु परिवर्तन ने पूरी दुनिया को चिंतित कर दिया है। पेड़ लगाना, जल संरक्षण करना और प्लास्टिक का उपयोग कम करना कुछ ऐसे कदम हैं जो हम सब उठा सकते हैं। प्रकृति हमारी धरोहर है और इसे आने वाली पीढ़ियों के लिए सुरक्षित रखना हमारी जिम्मेदारी है।",
];

interface TestStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  timeSpent: number;
}

const TypingTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isHindi } = useLanguage();
  const typingSettings = useTypingSettings();
  const duration = parseInt(searchParams.get("duration") || "60");

  const generateText = useCallback(() => {
    const paragraphs = isHindi ? hindiParagraphs : englishParagraphs;
    // For longer tests, combine multiple paragraphs
    if (duration >= 300) {
      const shuffled = [...paragraphs].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).join(' ');
    } else if (duration >= 120) {
      const shuffled = [...paragraphs].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2).join(' ');
    }
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
  }, [isHindi, duration]);

  const [text, setText] = useState(() => generateText());
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState<TestStats>({
    wpm: 0, cpm: 0, accuracy: 100, errors: 0, timeSpent: 0,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isStarted) {
      handleFinish();
    }
  }, [isStarted, timeLeft, isFinished]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      const timeElapsed = (duration - timeLeft) / 60;
      const wordsTyped = userInput.trim().split(/\s+/).filter(w => w).length;
      const charsTyped = userInput.length;
      const errors = calculateErrors();
      const accuracy = userInput.length > 0 
        ? Math.max(0, ((userInput.length - errors) / userInput.length) * 100) : 100;

      setStats({
        wpm: timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0,
        cpm: timeElapsed > 0 ? Math.round(charsTyped / timeElapsed) : 0,
        accuracy: Math.round(accuracy),
        errors,
        timeSpent: duration - timeLeft,
      });
    }
  }, [userInput, timeLeft, isStarted, duration]);

  const calculateErrors = () => {
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) errors++;
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!isStarted) setIsStarted(true);
    if (typingSettings.stopOnError && value.length > userInput.length) {
      const lastIndex = value.length - 1;
      if (value[lastIndex] !== text[lastIndex]) { soundManager.playError(); return; }
    }
    if (value.length > userInput.length) {
      const lastChar = value[value.length - 1];
      if (lastChar === text[value.length - 1]) soundManager.playKeyPress();
      else soundManager.playError();
    }
    if (value.length <= text.length) setUserInput(value);
    if (value.length === text.length) handleFinish();
  };

  const handleFinish = () => {
    setIsFinished(true);
    trackMissedKeys(text, userInput);
    saveTestRecord({
      type: 'test', wpm: stats.wpm, cpm: stats.cpm,
      accuracy: stats.accuracy, errors: stats.errors,
      timeSpent: stats.timeSpent, title: `${duration}s Typing Test`
    });
  };

  const handleRestart = () => {
    setText(generateText());
    setUserInput("");
    setTimeLeft(duration);
    setIsStarted(false);
    setIsFinished(false);
    setStats({ wpm: 0, cpm: 0, accuracy: 100, errors: 0, timeSpent: 0 });
    inputRef.current?.focus();
  };

  const currentIndex = userInput.length;

  const getCharacterClass = (index: number) => {
    return getHighlightClassName(typingSettings.highlightMode, index, currentIndex, text, userInput);
  };

  const getCaretClass = (index: number) => {
    return getCaretClassName(typingSettings.caretStyle, typingSettings.smoothCaret, index === currentIndex);
  };

  if (isFinished) {
    return <TestResult stats={stats} onRestart={handleRestart} duration={duration} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Speed Test Online — Free WPM & Accuracy Test" description="Take a free typing speed test online. Measure WPM, accuracy and improve with real-time feedback. English & Hindi support." keywords="typing test, typing speed test, wpm test online, free typing test" breadcrumbs={[{name:"Home",path:"/"},{name:"Typing Test",path:"/typing-test"}]} />
      <Navbar />
      <AdLayout showSidebar={true} showHeader={true}>
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{isHindi ? "शेष समय" : "Time Left"}</p>
            <p className="text-2xl font-bold text-primary">{timeLeft}s</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">WPM</p>
            <p className="text-2xl font-bold text-foreground">{stats.wpm}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">CPM</p>
            <p className="text-2xl font-bold text-foreground">{stats.cpm}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{isHindi ? "सटीकता" : "Accuracy"}</p>
            <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{isHindi ? "गलतियाँ" : "Errors"}</p>
            <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={(userInput.length / text.length) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            {userInput.length} / {text.length} {isHindi ? "अक्षर" : "characters"}
          </p>
        </div>

        {/* Typing Area */}
        <Card className="p-8 mb-6">
          <div className="text-xl leading-relaxed font-mono mb-4 select-none max-h-[300px] overflow-y-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {text.split("").map((char, index) => (
              <span key={index} className={`${getCharacterClass(index)} ${getCaretClass(index)}`}>
                {char}
              </span>
            ))}
          </div>
          
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-4 text-xl font-mono border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none bg-background"
            placeholder={isStarted ? "" : (isHindi ? "यहां टाइप करना शुरू करें..." : "Start typing here...")}
            rows={4}
            autoFocus
            spellCheck={false}
          />
        </Card>

        {/* Below Typing Box Ad */}
        <AdBanner slot="1000000005" format="horizontal" className="my-4" />

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleRestart} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5 mr-2" />
            {isHindi ? "पुनः आरंभ" : "Restart"}
          </Button>
          {isStarted && (
            <Button onClick={handleFinish} size="lg">
              {isHindi ? "टेस्ट समाप्त करें" : "Finish Test"}
            </Button>
          )}
        </div>
      </main>
      <Footer />
      </AdLayout>
    </div>
  );
};

export default TypingTest;
