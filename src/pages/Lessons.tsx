import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, CheckCircle2, Keyboard, FileText, Target, Trophy, Clock, AlertCircle, Flame, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProgressData, markLessonComplete } from "@/lib/progressTracker";
import SEO from "@/components/SEO";

interface Lesson {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  type: "key" | "word" | "paragraph";
  level: "beginner" | "intermediate" | "advanced";
  practiceText: string;
  practiceTextHindi: string;
}

const Lessons = () => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const progressData = getProgressData();

  const [lessons] = useState<Lesson[]>([
    // KEY DRILLS - Beginner
    {
      id: "key-home-row",
      title: "Home Row Keys (ASDF JKL;)",
      titleHindi: "होम रो कुंजियाँ (ो े ् ि प र क त च)",
      description: "Master the foundation of touch typing",
      descriptionHindi: "टच टाइपिंग की नींव में महारत हासिल करें",
      type: "key",
      level: "beginner",
      practiceText: "asdf jkl; asdf jkl; aaa sss ddd fff jjj kkk lll ;;; asdf jkl; fall jak lads flask salad fall",
      practiceTextHindi: "ो े ् ि प र क त च ो े ् ि प र क त च ोोो ेेे ््् ििि पपप ररर ककक ततत चचच"
    },
    {
      id: "key-top-row",
      title: "Top Row Keys (QWERT YUIOP)",
      titleHindi: "ऊपरी रो कुंजियाँ (औ ै ा ी ू ब ह ग द ज)",
      description: "Learn the top row letter keys",
      descriptionHindi: "ऊपरी रो अक्षर कुंजियाँ सीखें",
      type: "key",
      level: "beginner",
      practiceText: "qwert yuiop qwert yuiop qqq www eee rrr ttt yyy uuu iii ooo ppp query power type writer quote",
      practiceTextHindi: "औ ै ा ी ू ब ह ग द ज औऔऔ ैैै ााा ीीी ूूू बबबब हहह गगग ददद जजज"
    },
    {
      id: "key-bottom-row",
      title: "Bottom Row Keys (ZXCVBNM)",
      titleHindi: "निचली रो कुंजियाँ (ं ँ म न व ल स)",
      description: "Complete your key knowledge with bottom row",
      descriptionHindi: "निचली रो के साथ अपना कुंजी ज्ञान पूरा करें",
      type: "key",
      level: "beginner",
      practiceText: "zxcv bnm zxcv bnm zzz xxx ccc vvv bbb nnn mmm zoom box cave mint zone",
      practiceTextHindi: "ं ँ म न व ल स ंंं ँँँ ममम ननन ववव ललल ससस"
    },
    
    // WORD DRILLS - Intermediate
    {
      id: "word-common-3",
      title: "3-Letter Words",
      titleHindi: "3-अक्षर के शब्द",
      description: "Practice common 3-letter words",
      descriptionHindi: "सामान्य 3-अक्षर के शब्दों का अभ्यास करें",
      type: "word",
      level: "intermediate",
      practiceText: "the and for are you can was not all but one out two day get has him had how man new now old see way who boy did its let put say she too use",
      practiceTextHindi: "एक दो तीन चार पाँच कौन कहा कैसे क्या क्यों कहाँ कब तक जब तब यह वह कोई सभी बहुत कम ज्यादा थोड़ा सारा पूरा आज कल परसों"
    },
    {
      id: "word-common-5",
      title: "5-Letter Words",
      titleHindi: "5-अक्षर के शब्द",
      description: "Build speed with 5-letter words",
      descriptionHindi: "5-अक्षर के शब्दों के साथ गति बढ़ाएं",
      type: "word",
      level: "intermediate",
      practiceText: "about after again asked being could every first found great house large later never other place right small still their these thing think three under water where which while world would write",
      practiceTextHindi: "क्योंकि अगर इसलिए जब तक जबकि जैसे तैसे वैसे कहाँ किसने किसको किससे किसका किसकी मगर लेकिन पर परंतु"
    },
    {
      id: "word-speed-drill",
      title: "Speed Words",
      titleHindi: "तेज़ शब्द",
      description: "Fast common words for speed building",
      descriptionHindi: "गति बढ़ाने के लिए तेज़ सामान्य शब्द",
      type: "word",
      level: "intermediate",
      practiceText: "fast type quick speed rapid swift hasty speedy hurry rush dash sprint race zoom fly jet bolt dart",
      practiceTextHindi: "तेज़ गति रफ्तार दौड़ भागो चलो आओ जाओ करो लो दो पढ़ो लिखो देखो सुनो बोलो"
    },
    
    // PARAGRAPH DRILLS - Advanced
    {
      id: "para-technology",
      title: "Technology Paragraph",
      titleHindi: "प्रौद्योगिकी पैराग्राफ",
      description: "Practice with technology-themed content",
      descriptionHindi: "प्रौद्योगिकी-थीम वाली सामग्री के साथ अभ्यास करें",
      type: "paragraph",
      level: "advanced",
      practiceText: "Technology has revolutionized the way we communicate and work in the modern world. From smartphones to artificial intelligence, innovation continues to shape our daily lives. Learning to type efficiently is now more important than ever as we spend countless hours on computers and digital devices. The digital age demands proficiency in keyboard skills for both personal and professional success.",
      practiceTextHindi: "प्रौद्योगिकी ने आधुनिक दुनिया में हमारे संवाद और काम करने के तरीके में क्रांति ला दी है। स्मार्टफोन से लेकर कृत्रिम बुद्धिमत्ता तक, नवाचार हमारे दैनिक जीवन को आकार देना जारी रखता है। कंप्यूटर और डिजिटल उपकरणों पर अनगिनत घंटे बिताने के कारण कुशलता से टाइप करना सीखना पहले से कहीं अधिक महत्वपूर्ण है।"
    },
    {
      id: "para-education",
      title: "Education Paragraph",
      titleHindi: "शिक्षा पैराग्राफ",
      description: "Practice with educational content",
      descriptionHindi: "शैक्षिक सामग्री के साथ अभ्यास करें",
      type: "paragraph",
      level: "advanced",
      practiceText: "Education is the foundation of personal and societal growth. It empowers individuals with knowledge and skills necessary to navigate the complexities of modern life. Through continuous learning and dedication, we can achieve our goals and contribute meaningfully to society. The pursuit of knowledge is a lifelong journey that enriches our understanding of the world.",
      practiceTextHindi: "शिक्षा व्यक्तिगत और सामाजिक विकास की नींव है। यह व्यक्तियों को आधुनिक जीवन की जटिलताओं को समझने के लिए आवश्यक ज्ञान और कौशल से सशक्त बनाती है। निरंतर सीखने और समर्पण के माध्यम से, हम अपने लक्ष्यों को प्राप्त कर सकते हैं और समाज में सार्थक योगदान दे सकते हैं।"
    },
    {
      id: "para-motivation",
      title: "Motivational Paragraph",
      titleHindi: "प्रेरक पैराग्राफ",
      description: "Inspiring content for practice",
      descriptionHindi: "अभ्यास के लिए प्रेरणादायक सामग्री",
      type: "paragraph",
      level: "advanced",
      practiceText: "Success is not final, failure is not fatal, it is the courage to continue that counts. Every expert was once a beginner, and every master was once a disaster. Practice consistently, embrace your mistakes as learning opportunities, and never give up on your dreams. The journey of a thousand miles begins with a single step, so start today and keep moving forward.",
      practiceTextHindi: "सफलता अंतिम नहीं है, असफलता घातक नहीं है, जारी रखने का साहस ही मायने रखता है। हर विशेषज्ञ कभी शुरुआत करने वाला था, और हर मास्टर कभी शुरुआती था। लगातार अभ्यास करें, अपनी गलतियों को सीखने के अवसर के रूप में स्वीकार करें, और अपने सपनों को कभी न छोड़ें।"
    },
    {
      id: "para-accuracy",
      title: "Accuracy Challenge",
      titleHindi: "सटीकता चुनौती",
      description: "Difficult words for accuracy improvement",
      descriptionHindi: "सटीकता सुधार के लिए कठिन शब्द",
      type: "paragraph",
      level: "advanced",
      practiceText: "Accommodate beginning committee environment government independent maintenance necessary occasion privilege receive separate successful unnecessary. Conscientious embarrassment exhilarating manoeuvre millennium phenomenon pseudonym rhythm vacuum. These challenging words will test your accuracy and attention to detail.",
      practiceTextHindi: "आवश्यकता अनुशासन व्यवस्था प्रशासन संविधान स्वतंत्रता परिवर्तन विकास समृद्धि। ये चुनौतीपूर्ण शब्द आपकी सटीकता और विस्तार पर ध्यान की परीक्षा लेंगे।"
    }
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success/10 text-success border-success/20";
      case "intermediate":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "advanced":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLevelTitle = (level: string) => {
    switch (level) {
      case "beginner":
        return isHindi ? "शुरुआती" : "Beginner";
      case "intermediate":
        return isHindi ? "मध्यम" : "Intermediate";
      case "advanced":
        return isHindi ? "उन्नत" : "Advanced";
      default:
        return level;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "key":
        return <Keyboard className="h-5 w-5" />;
      case "word":
        return <FileText className="h-5 w-5" />;
      case "paragraph":
        return <Target className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case "key":
        return isHindi ? "कुंजी ड्रिल" : "Key Drill";
      case "word":
        return isHindi ? "शब्द ड्रिल" : "Word Drill";
      case "paragraph":
        return isHindi ? "पैराग्राफ ड्रिल" : "Paragraph Drill";
      default:
        return type;
    }
  };

  const startLesson = (lesson: Lesson) => {
    const text = isHindi ? lesson.practiceTextHindi : lesson.practiceText;
    const title = isHindi ? lesson.titleHindi : lesson.title;
    navigate(`/practice?mode=lesson&text=${encodeURIComponent(text)}&title=${encodeURIComponent(title)}&lessonId=${lesson.id}`);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progressData.lessonProgress[lessonId] === true;
  };

  const lessonsByType = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.type]) {
      acc[lesson.type] = [];
    }
    acc[lesson.type].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Lessons — Free Structured Typing Course Online" description="Learn touch typing with free structured lessons. Home row, top row, numbers and symbols with progress tracking." keywords="typing lessons, free typing course, learn typing online, touch typing" breadcrumbs={[{name:"Home",path:"/"},{name:"Lessons",path:"/lessons"}]} />
      <Navbar />
      <AdLayout>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {isHindi ? "चरण-दर-चरण टच टाइपिंग सीखें" : "Learn Touch Typing Step by Step"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {isHindi 
                ? "कुंजी ड्रिल से लेकर पैराग्राफ तक - हर पाठ के साथ सुधार करें" 
                : "From key drills to paragraphs - improve with every lesson"}
            </p>
          </div>

          {/* Advanced Exam Mode Promo */}
          <Card
            className="mb-10 border-0 cursor-pointer overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:shadow-2xl transition-all hover:scale-[1.01]"
            onClick={() => navigate("/advanced-exam")}
          >
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <Flame className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/25 text-white border-0 hover:bg-white/30">🔥 NEW</Badge>
                    <span className="text-xs uppercase tracking-wider opacity-90">Advanced Exam Mode</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">
                    {isHindi ? "BSF / SSC लेवल — Symbols + Numbers + Stress Mode" : "BSF / SSC Level — Symbols, Numbers & Stress Mode"}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {isHindi
                      ? "200+ डायनामिक पैराग्राफ · हर बार नया · 3 difficulty levels"
                      : "200+ dynamic paragraphs · fresh every time · 3 difficulty levels"}
                  </p>
                </div>
              </div>
              <Button size="lg" className="bg-white text-red-600 hover:bg-white/90 gap-2 shrink-0">
                Start Now <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="all">{isHindi ? "सभी" : "All"}</TabsTrigger>
              <TabsTrigger value="key">
                <Keyboard className="h-4 w-4 mr-2" />
                {isHindi ? "कुंजी" : "Keys"}
              </TabsTrigger>
              <TabsTrigger value="word">
                <FileText className="h-4 w-4 mr-2" />
                {isHindi ? "शब्द" : "Words"}
              </TabsTrigger>
              <TabsTrigger value="paragraph">
                <Target className="h-4 w-4 mr-2" />
                {isHindi ? "पैराग्राफ" : "Paragraphs"}
              </TabsTrigger>
              <TabsTrigger value="exam">
                <Trophy className="h-4 w-4 mr-2" />
                {isHindi ? "परीक्षा" : "Exams"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {Object.entries(lessonsByType).map(([type, typeLessons]) => (
                <div key={type} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <h3 className="text-2xl font-bold">{getTypeTitle(type)}</h3>
                    </div>
                    <div className="h-px bg-border flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                        onClick={() => startLesson(lesson)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getLevelColor(lesson.level)}>
                              {getLevelTitle(lesson.level)}
                            </Badge>
                            {isLessonCompleted(lesson.id) && (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            )}
                          </div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getTypeIcon(lesson.type)}
                            {isHindi ? lesson.titleHindi : lesson.title}
                          </CardTitle>
                          <CardDescription>
                            {isHindi ? lesson.descriptionHindi : lesson.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm text-muted-foreground overflow-hidden">
                            {(isHindi ? lesson.practiceTextHindi : lesson.practiceText).substring(0, 60)}...
                          </div>
                          <Button className="w-full mt-4" variant="default">
                            {isHindi ? "अभ्यास शुरू करें" : "Start Practice"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {["key", "word", "paragraph"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessonsByType[type]?.map((lesson) => (
                    <Card
                      key={lesson.id}
                      className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                      onClick={() => startLesson(lesson)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getLevelColor(lesson.level)}>
                            {getLevelTitle(lesson.level)}
                          </Badge>
                          {isLessonCompleted(lesson.id) && (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getTypeIcon(lesson.type)}
                          {isHindi ? lesson.titleHindi : lesson.title}
                        </CardTitle>
                        <CardDescription>
                          {isHindi ? lesson.descriptionHindi : lesson.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm text-muted-foreground overflow-hidden">
                          {(isHindi ? lesson.practiceTextHindi : lesson.practiceText).substring(0, 60)}...
                        </div>
                        <Button className="w-full mt-4" variant="default">
                          {isHindi ? "अभ्यास शुरू करें" : "Start Practice"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
            
            <TabsContent value="exam">
              <div className="mb-8">
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg mb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        {isHindi ? "परीक्षा मोड के बारे में" : "About Exam Mode"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isHindi 
                          ? "वास्तविक सरकारी टाइपिंग परीक्षाओं के नियमों के साथ अभ्यास करें। प्रत्येक परीक्षा में न्यूनतम WPM, सटीकता की आवश्यकताएं और समय सीमा है। कुछ परीक्षाओं में बैकस्पेस अक्षम है!"
                          : "Practice with real government typing exam rules. Each exam has minimum WPM, accuracy requirements, and time limits. Some exams disable backspace!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: "SSC Stenographer",
                    nameHindi: "SSC आशुलिपिक",
                    wpm: 100,
                    accuracy: 95,
                    time: "10 मिनट",
                    timeEng: "10 mins",
                    backspace: false,
                    difficulty: "advanced"
                  },
                  {
                    name: "High Court Stenographer",
                    nameHindi: "उच्च न्यायालय आशुलिपिक",
                    wpm: 80,
                    accuracy: 98,
                    time: "15 मिनट",
                    timeEng: "15 mins",
                    backspace: false,
                    difficulty: "advanced"
                  },
                  {
                    name: "IBPS Clerk",
                    nameHindi: "IBPS क्लर्क",
                    wpm: 35,
                    accuracy: 93,
                    time: "15 मिनट",
                    timeEng: "15 mins",
                    backspace: false,
                    difficulty: "intermediate"
                  },
                  {
                    name: "State PSC Data Entry",
                    nameHindi: "राज्य PSC डेटा एंट्री",
                    wpm: 40,
                    accuracy: 96,
                    time: "10 मिनट",
                    timeEng: "10 mins",
                    backspace: true,
                    difficulty: "intermediate"
                  },
                  {
                    name: "CRPF Constable",
                    nameHindi: "CRPF कांस्टेबल",
                    wpm: 30,
                    accuracy: 90,
                    time: "15 मिनट",
                    timeEng: "15 mins",
                    backspace: false,
                    difficulty: "beginner"
                  },
                  {
                    name: "RRB Clerk",
                    nameHindi: "RRB क्लर्क",
                    wpm: 30,
                    accuracy: 92,
                    time: "10 मिनट",
                    timeEng: "10 mins",
                    backspace: false,
                    difficulty: "beginner"
                  },
                  {
                    name: "Court Clerk",
                    nameHindi: "कोर्ट क्लर्क",
                    wpm: 40,
                    accuracy: 95,
                    time: "10 मिनट",
                    timeEng: "10 mins",
                    backspace: false,
                    difficulty: "intermediate"
                  },
                  {
                    name: "Data Entry Operator",
                    nameHindi: "डेटा एंट्री ऑपरेटर",
                    wpm: 35,
                    accuracy: 95,
                    time: "5 मिनट",
                    timeEng: "5 mins",
                    backspace: true,
                    difficulty: "intermediate"
                  }
                ].map((exam) => (
                  <Card
                    key={exam.name}
                    className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`/exam?examId=${exam.name}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getLevelColor(exam.difficulty)}>
                          {getLevelTitle(exam.difficulty)}
                        </Badge>
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {isHindi ? exam.nameHindi : exam.name}
                      </CardTitle>
                      <CardDescription className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{isHindi ? exam.time : exam.timeEng}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{isHindi ? "न्यूनतम WPM:" : "Min WPM:"}</span>
                          <span className="font-semibold">{exam.wpm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{isHindi ? "न्यूनतम सटीकता:" : "Min Accuracy:"}</span>
                          <span className="font-semibold">{exam.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{isHindi ? "बैकस्पेस:" : "Backspace:"}</span>
                          <span className={`font-semibold ${exam.backspace ? 'text-success' : 'text-destructive'}`}>
                            {exam.backspace 
                              ? (isHindi ? "अनुमत ✓" : "Allowed ✓")
                              : (isHindi ? "अनुमति नहीं ✗" : "Not Allowed ✗")}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="default">
                        <Trophy className="h-4 w-4 mr-2" />
                        {isHindi ? "परीक्षा शुरू करें" : "Start Exam"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      </AdLayout>
    </div>
  );
};

export default Lessons;