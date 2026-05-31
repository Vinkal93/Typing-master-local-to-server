import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import SEO from "@/components/SEO";

const ThreeMinuteTypingTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "3 Minute Typing Test | Standard Typing Speed Test";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="3 Minute Typing Test — Free WPM & Accuracy Test" description="Free 3 minute typing test to measure your sustained WPM and accuracy." keywords="3 minute typing test, three minute typing test" breadcrumbs={[{name:"Home",path:"/"},{name:"3 Minute Test",path:"/3-minute-typing-test"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">3 Minute Typing Test</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The 3 minute typing test provides a balanced assessment of your typing speed and accuracy. Ideal for intermediate practice.
          </p>
          <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => navigate(`/typing-test?duration=180&r=${Date.now()}`)}>
            <Play className="h-5 w-5" /> Start 3 Minute Test
          </Button>

          <section className="max-w-3xl mx-auto text-left mt-12 prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">Why Choose 3 Minute Test?</h2>
            <p className="text-muted-foreground mb-4">
              A 3 minute typing test gives you enough time to settle into a rhythm while still being short enough for regular practice. It provides more accurate results than a 1 minute test as it reduces the impact of initial nervousness.
            </p>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default ThreeMinuteTypingTest;
