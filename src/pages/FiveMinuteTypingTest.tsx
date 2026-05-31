import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import SEO from "@/components/SEO";

const FiveMinuteTypingTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "5 Minute Typing Test | Extended Typing Speed Test";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="5 Minute Typing Test — Free Endurance WPM Test" description="Free 5 minute typing test online — measure endurance, WPM and accuracy with random paragraphs." keywords="5 minute typing test, five minute typing test, endurance typing" breadcrumbs={[{name:"Home",path:"/"},{name:"5 Minute Test",path:"/5-minute-typing-test"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">5 Minute Typing Test</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The 5 minute typing test is perfect for exam preparation. Test your endurance and consistency over a longer duration.
          </p>
          <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => navigate(`/typing-test?duration=300&r=${Date.now()}`)}>
            <Play className="h-5 w-5" /> Start 5 Minute Test
          </Button>

          <section className="max-w-3xl mx-auto text-left mt-12 prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">5 Minute Test for Exam Preparation</h2>
            <p className="text-muted-foreground mb-4">
              Government typing exams like CPCT, SSC CGL, and court typing tests typically last 5-10 minutes. Practicing with a 5 minute test helps build the stamina and consistency needed to maintain speed throughout longer typing sessions.
            </p>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default FiveMinuteTypingTest;
