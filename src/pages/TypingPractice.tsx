import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard, Clock, Target, TrendingUp, BookOpen, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEO from "@/components/SEO";

const TypingPractice = () => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();

  useEffect(() => {
    document.title = "Typing Practice Online | Free Typing Practice Paragraphs";
  }, []);

  const practiceOptions = [
    { title: "Beginner Practice", titleHi: "शुरुआती अभ्यास", desc: "Simple words and sentences for beginners", icon: BookOpen, route: "/practice?mode=custom", color: "text-primary" },
    { title: "Speed Building", titleHi: "स्पीड बिल्डिंग", desc: "Medium difficulty paragraphs to build speed", icon: TrendingUp, route: "/fast-track", color: "text-secondary" },
    { title: "Accuracy Focus", titleHi: "सटीकता फोकस", desc: "Practice with focus on reducing errors", icon: Target, route: "/smart-practice", color: "text-success" },
    { title: "Timed Practice", titleHi: "समयबद्ध अभ्यास", desc: "Practice with timer for exam preparation", icon: Clock, route: "/typing-test", color: "text-accent" },
    { title: "Exam Practice", titleHi: "परीक्षा अभ्यास", desc: "Mock tests for government exams like CPCT, SSC", icon: Trophy, route: "/exam", color: "text-primary" },
    { title: "Keyboard Lessons", titleHi: "कीबोर्ड पाठ", desc: "Learn proper finger placement and touch typing", icon: Keyboard, route: "/lessons", color: "text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Practice — Free Online Tool" description="Free typing practice tool with custom text support." keywords="typing practice" breadcrumbs={[{name:"Home",path:"/"},{name:"Practice",path:"/typing-practice"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {isHindi ? "ऑनलाइन टाइपिंग अभ्यास" : "Typing Practice Online"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isHindi
                ? "मुफ्त टाइपिंग अभ्यास पैराग्राफ के साथ अपनी टाइपिंग स्पीड और सटीकता में सुधार करें।"
                : "Improve your typing speed and accuracy with free typing practice paragraphs. Choose from beginner to advanced levels."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {practiceOptions.map((opt) => (
              <Card key={opt.title} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer" onClick={() => navigate(opt.route)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <opt.icon className={`h-5 w-5 ${opt.color}`} />
                    {isHindi ? opt.titleHi : opt.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{opt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdBanner slot="4000000001" format="horizontal" className="my-8" />

          {/* SEO Content */}
          <section className="max-w-4xl mx-auto prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Practice Typing Online?</h2>
            <p className="text-muted-foreground mb-4">
              Typing practice is essential for anyone looking to improve their keyboard skills. Whether you're preparing for government exams like CPCT, SSC, or UPSC, or simply want to type faster at work, regular practice is the key to success. Our free online typing practice tool offers a variety of exercises designed for all skill levels.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Typing Practice Paragraphs for Beginners</h3>
            <p className="text-muted-foreground mb-4">
              Start with simple sentences and gradually move to complex paragraphs. Our beginner-friendly typing practice paragraphs help you build muscle memory and develop proper finger placement on the keyboard. Practice with both English and Hindi text to become proficient in bilingual typing.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Benefits of Daily Typing Practice</h3>
            <ul className="text-muted-foreground mb-4 list-disc pl-5 space-y-2">
              <li>Increase typing speed from 20 WPM to 60+ WPM</li>
              <li>Improve accuracy and reduce typing errors</li>
              <li>Prepare for competitive exams requiring typing tests</li>
              <li>Boost productivity in professional work</li>
              <li>Learn touch typing without looking at the keyboard</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">How to Practice Typing Effectively</h3>
            <p className="text-muted-foreground mb-4">
              Focus on accuracy first, then gradually increase your speed. Use proper finger placement—your fingers should rest on the home row keys (ASDF JKL;). Practice for at least 15-30 minutes daily for best results. Track your progress using our WPM calculator and accuracy tracker to see improvement over time.
            </p>
          </section>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate("/typing-test")} className="gap-2">
              <Keyboard className="h-5 w-5" /> Start Typing Test Now
            </Button>
          </div>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default TypingPractice;
