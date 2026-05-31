import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Play, BarChart3, Keyboard, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProgressData, getAverageWpm, getAverageAccuracy } from "@/lib/progressTracker";

const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect in typing.",
  "Speed and accuracy are the keys to success.",
  "Touch typing is an essential modern skill.",
];

const Index = () => {
  const navigate = useNavigate();
  const { t, isHindi } = useLanguage();
  const progress = getProgressData();
  const avgWpm = getAverageWpm();
  const avgAccuracy = getAverageAccuracy();
  const [typedText, setTypedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animated typing effect
  useEffect(() => {
    const currentText = TYPING_TEXTS[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setTypedText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setTypedText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % TYPING_TEXTS.length);
        }
      }
    }, isDeleting ? 30 : 60);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysTests = progress.tests.filter(test => test.timestamp >= today.getTime()).length;

  const stats = [
    { label: t('todaysTests'), value: todaysTests.toString(), icon: Clock, color: "text-primary" },
    { label: t('avgWPM'), value: avgWpm.toString(), icon: TrendingUp, color: "text-secondary" },
    { label: t('accuracy'), value: `${avgAccuracy}%`, icon: Target, color: "text-success" },
    { label: t('totalTests'), value: progress.totalTests.toString(), icon: BarChart3, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdLayout showSidebar={true} showHeader={true}>
        <main className="container mx-auto px-4 py-12 flex-1">
          {/* Hero Section with Animated Typing */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {isHindi ? "फ्री टाइपिंग मास्टर टूल — विंकल प्रजापति द्वारा" : "Free Typing Master Tool by Vinkal Prajapati"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {isHindi ? "अपनी टाइपिंग स्पीड, WPM और एक्यूरेसी चेक करें — इंग्लिश और हिंदी टाइपिंग प्रैक्टिस" : "Check Your Typing Speed, WPM & Accuracy — English & Hindi Typing Practice"}
            </p>
            
            {/* Animated Typing Demo */}
            <div className="max-w-2xl mx-auto mb-8 bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground ml-2">Live Demo</span>
              </div>
              <p className="text-lg md:text-xl font-mono text-foreground text-left min-h-[2rem]">
                {typedText}
                <span className="animate-pulse text-primary">|</span>
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> ~65 WPM</span>
                <span className="flex items-center gap-1"><Target className="h-3 w-3" /> 98% Accuracy</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="text-lg px-8 py-6 gap-2"
              onClick={() => navigate("/typing-test")}
            >
              <Play className="h-5 w-5" />
              {t('startTypingTest')}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm">{stat.label}</CardDescription>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdBanner slot="2345678901" format="horizontal" className="my-8" />

          {/* Quick Start Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate(`/typing-test?duration=60&r=${Date.now()}`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  1 {t('minuteTest')}
                </CardTitle>
                <CardDescription>{t('quickTest')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('perfectWarmup')}</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate(`/typing-test?duration=120&r=${Date.now()}`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  2 {t('minuteTest')}
                </CardTitle>
                <CardDescription>{t('standardTest')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('popularDuration')}</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate(`/typing-test?duration=300&r=${Date.now()}`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-success" />
                  5 {t('minuteTest')}
                </CardTitle>
                <CardDescription>{t('extendedTest')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('testEndurance')}</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-accent/5" onClick={() => navigate("/practice?mode=custom")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-accent" />
                  {t('customText')}
                </CardTitle>
                <CardDescription>{t('pasteYourText')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('practiceWithOwn')}</p>
              </CardContent>
            </Card>
          </div>

          <AdBanner slot="3456789012" format="horizontal" className="my-8" />

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate("/lessons")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">📚 {t('typingLessons')}</CardTitle>
                <CardDescription>{t('structuredLessons')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{t('learnEverything')}</p>
                <Button variant="outline" className="w-full">{t('startLearning')}</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate("/games")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">🎮 {t('typingGames')}</CardTitle>
                <CardDescription>{t('funGames')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{t('gamesDescription')}</p>
                <Button variant="outline" className="w-full">{t('playGames')}</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate("/progress")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">📊 {t('progressReport')}</CardTitle>
                <CardDescription>{t('trackImprovement')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{t('statsGraphs')}</p>
                <Button variant="outline" className="w-full">{t('viewProgress')}</Button>
              </CardContent>
            </Card>
          </div>

          {/* SEO Content Section */}
          <section className="prose prose-sm max-w-none mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Free Typing Test Online – Improve Your Typing Speed & WPM</h2>
            
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>Welcome to <strong>TypeMaster</strong>, the ultimate free typing test online platform designed to help you improve your typing speed, accuracy, and overall keyboard skills. Whether you are a student, a working professional, or preparing for competitive government exams like SSC, CPCT, or court typist positions, our comprehensive typing tool provides everything you need to become a faster and more accurate typist.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">What is a Typing Speed Test?</h3>
              <p>A typing speed test measures how fast you can type, typically expressed in Words Per Minute (WPM). The test calculates both your speed and accuracy by comparing what you type against a given passage. Our free typing speed test online tool provides real-time WPM tracking, mistake detection, and detailed performance analysis to help you understand your strengths and areas for improvement.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">Why Practice Typing Online?</h3>
              <p>Typing practice online offers several advantages over traditional methods. You get instant feedback on your performance, can track progress over time, and have access to diverse practice materials. Regular typing practice helps you type faster without looking at the keyboard (touch typing), reduces errors, and builds muscle memory for common letter combinations. Our platform offers structured typing lessons, custom practice modes, and fun typing games to keep you motivated.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">Features of Our Typing Test Tool</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Real-Time WPM Calculation</strong> – Watch your typing speed update live as you type</li>
                <li><strong>Accuracy Tracking</strong> – See your accuracy percentage with instant error highlighting</li>
                <li><strong>Multiple Test Durations</strong> – Choose from 1-minute, 2-minute, 3-minute, or 5-minute typing tests</li>
                <li><strong>Hindi & English Support</strong> – Practice typing in both Hindi (Krutidev/Mangal) and English</li>
                <li><strong>Detailed Results</strong> – Get comprehensive reports showing WPM, CPM, accuracy, and error analysis</li>
                <li><strong>Progress Tracking</strong> – Monitor your improvement with charts and statistics over time</li>
                <li><strong>Typing Games</strong> – Make learning fun with interactive typing games and challenges</li>
                <li><strong>Keyboard Guide</strong> – Learn proper finger placement with our interactive keyboard guide</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">How to Improve Your Typing Speed</h3>
              <p>Improving your typing speed requires consistent practice and proper technique. Start by learning the correct finger placement on the home row keys (ASDF JKL;). Practice without looking at the keyboard to develop touch typing skills. Begin with shorter tests like our 1-minute typing test and gradually increase to 5-minute sessions as your stamina improves. Focus on accuracy first – speed will naturally follow.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">Typing Test for Government Exams</h3>
              <p>Many government exams in India require minimum typing speeds. SSC CGL requires 35 WPM in English, while SSC CHSL requires 25-35 WPM depending on the post. The CPCT exam in Madhya Pradesh requires proficiency in both Hindi and English typing. Our platform offers dedicated mock tests for these exams, including CPCT mock tests with realistic exam conditions and timing.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">WPM Calculator – Understand Your Speed</h3>
              <p>WPM (Words Per Minute) is the standard measurement of typing speed. A "word" is defined as 5 characters including spaces. The average typing speed is around 40 WPM, while professional typists often exceed 80 WPM. Use our WPM calculator to measure your speed precisely and set improvement goals. Our accuracy calculator helps you understand your error rate and identify which keys need more practice.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">Hindi Typing Test – Krutidev & Mangal</h3>
              <p>Our Hindi typing test supports both popular layouts: Krutidev (used in many state government exams) and Mangal/Inscript (the official Unicode standard). Practice with Hindi typing paragraphs specifically designed for CPCT, SSC, and other competitive exams. Track your Hindi typing speed separately and get targeted practice suggestions.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6">Start Your Typing Journey Today</h3>
              <p>Join thousands of users who have improved their typing skills with TypeMaster. Whether you want to type faster for work, prepare for exams, or simply become more efficient at the keyboard, our free typing test platform has all the tools you need. Take your first typing test now and begin tracking your progress toward becoming a faster, more accurate typist!</p>
            </div>
          </section>
        </main>

        <Footer />
      </AdLayout>
    </div>
  );
};

export default Index;
