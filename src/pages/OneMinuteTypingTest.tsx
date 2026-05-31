import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import SEO from "@/components/SEO";

const OneMinuteTypingTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "1 Minute Typing Test | Quick Typing Speed Test";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="1 Minute Typing Test — Free Quick WPM Test" description="Take a free 1 minute typing test online. Quick WPM check with random English paragraphs." keywords="1 minute typing test, quick typing test, one minute wpm" breadcrumbs={[{name:"Home",path:"/"},{name:"1 Minute Test",path:"/1-minute-typing-test"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">1 Minute Typing Test</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take a quick 1 minute typing test to check your typing speed and accuracy. Perfect for daily warm-up and quick practice sessions.
          </p>
          <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => navigate(`/typing-test?duration=60&r=${Date.now()}`)}>
            <Play className="h-5 w-5" /> Start 1 Minute Test
          </Button>

          <section className="max-w-3xl mx-auto text-left mt-12 prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">About 1 Minute Typing Test</h2>
            <p className="text-muted-foreground mb-4">
              The 1 minute typing test is the quickest way to measure your typing speed. It's ideal for beginners who want a short practice session and for experienced typists warming up before longer tests. Your results will show WPM (Words Per Minute), accuracy percentage, and error count.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Tips for 1 Minute Test</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-2">
              <li>Focus on accuracy over speed—errors reduce your net WPM</li>
              <li>Keep your eyes on the screen, not the keyboard</li>
              <li>Maintain proper posture and finger placement</li>
              <li>Take multiple tests to get a consistent average</li>
            </ul>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default OneMinuteTypingTest;
