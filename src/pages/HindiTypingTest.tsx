import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import SEO from "@/components/SEO";

const HindiTypingTest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hindi Typing Test | हिंदी टाइपिंग टेस्ट - Krutidev & Mangal";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Hindi Typing Test — Free Online Mangal / Kruti Dev Practice" description="Free Hindi typing test online with Mangal and Kruti Dev font support. Practice Inscript and Remington layouts for CPCT and government exams." keywords="hindi typing test, mangal typing, kruti dev typing, cpct hindi typing" breadcrumbs={[{name:"Home",path:"/"},{name:"Hindi Typing Test",path:"/hindi-typing-test"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-4">हिंदी टाइपिंग टेस्ट | Hindi Typing Test</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practice Hindi typing with Krutidev and Mangal fonts. Prepare for CPCT, SSC, and other government typing exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold mb-3">Krutidev Hindi Typing</h2>
              <p className="text-muted-foreground mb-4">Practice with Krutidev font layout used in MP, RJ, UP government exams.</p>
              <Button className="gap-2" onClick={() => navigate("/keyboard-guide")}>
                <Play className="h-4 w-4" /> Start Krutidev Practice
              </Button>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold mb-3">Mangal Hindi Typing</h2>
              <p className="text-muted-foreground mb-4">Practice with Mangal (Unicode) font used in SSC and central government exams.</p>
              <Button className="gap-2" onClick={() => navigate("/smart-practice")}>
                <Play className="h-4 w-4" /> Start Mangal Practice
              </Button>
            </div>
          </div>

          <AdBanner slot="4000000002" format="horizontal" className="my-8" />

          <section className="max-w-4xl mx-auto prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-4">हिंदी टाइपिंग टेस्ट के बारे में</h2>
            <p className="text-muted-foreground mb-4">
              Hindi typing is essential for government job aspirants in India. Most government departments require Hindi typing proficiency at 25-35 WPM. Our Hindi typing test supports both Krutidev and Mangal font layouts, which are the most commonly used fonts in government typing examinations.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Krutidev vs Mangal Font</h3>
            <p className="text-muted-foreground mb-4">
              Krutidev is a non-Unicode font widely used in state government exams of Madhya Pradesh, Rajasthan, and Uttar Pradesh. Mangal is a Unicode-based font used in SSC, IBPS, and central government exams. Learning both layouts gives you maximum flexibility for competitive exams.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">CPCT Hindi Typing Requirements</h3>
            <p className="text-muted-foreground mb-4">
              The CPCT (Computer Proficiency Certification Test) requires candidates to type at least 30 WPM in Hindi with 90% accuracy. Regular practice with our Hindi typing test tool helps you achieve and exceed these benchmarks.
            </p>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default HindiTypingTest;
