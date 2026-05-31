import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import SEO from "@/components/SEO";

const EnglishTypingTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "English Typing Test | Free Online Typing Speed Test";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="English Typing Test — Free WPM Test Online" description="Free English typing test. Check your WPM, accuracy and improve with random paragraphs and real-time analytics." keywords="english typing test, wpm test, english typing speed" breadcrumbs={[{name:"Home",path:"/"},{name:"English Typing Test",path:"/english-typing-test"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">English Typing Test</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take a free English typing test and measure your WPM and accuracy. Practice with real-world paragraphs and improve your typing skills.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Button size="lg" className="gap-2" onClick={() => navigate(`/typing-test?duration=60&r=${Date.now()}`)}>
              <Play className="h-4 w-4" /> 1 Minute Test
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate(`/typing-test?duration=120&r=${Date.now()}`)}>
              <Play className="h-4 w-4" /> 2 Minute Test
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate(`/typing-test?duration=300&r=${Date.now()}`)}>
              <Play className="h-4 w-4" /> 5 Minute Test
            </Button>
          </div>

          <section className="max-w-3xl mx-auto text-left prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">Free English Typing Speed Test</h2>
            <p className="text-muted-foreground mb-4">
              Our English typing test uses carefully curated paragraphs covering various topics including technology, science, literature, and current affairs. This helps you practice typing diverse vocabulary and sentence structures that you'll encounter in real-world scenarios and competitive exams.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Average Typing Speed in English</h3>
            <p className="text-muted-foreground mb-4">
              The average typing speed for most people is around 40 WPM. Professional typists achieve 65-75 WPM, while expert typists can reach 100+ WPM. With consistent daily practice of 15-30 minutes, you can significantly improve your typing speed within 2-4 weeks.
            </p>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default EnglishTypingTest;
