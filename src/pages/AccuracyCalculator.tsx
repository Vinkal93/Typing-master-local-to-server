import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import SEO from "@/components/SEO";

const AccuracyCalculator = () => {
  const [totalChars, setTotalChars] = useState("");
  const [correctChars, setCorrectChars] = useState("");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Typing Accuracy Calculator | Check Your Typing Accuracy";
  }, []);

  const calculate = () => {
    const total = parseInt(totalChars) || 0;
    const correct = parseInt(correctChars) || 0;
    if (total > 0) {
      setResult(Math.round((correct / total) * 10000) / 100);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Accuracy Calculator — Free Online Tool" description="Free typing accuracy calculator. Compute typing accuracy percentage instantly." keywords="typing accuracy calculator, accuracy percentage" breadcrumbs={[{name:"Home",path:"/"},{name:"Accuracy Calculator",path:"/accuracy-calculator"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold text-foreground text-center mb-4">Typing Accuracy Calculator</h1>
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Calculate your typing accuracy percentage. Enter total characters typed and correct characters to find your accuracy rate.
          </p>

          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Accuracy Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Total Characters Typed</label>
                <Input type="number" value={totalChars} onChange={(e) => setTotalChars(e.target.value)} placeholder="e.g. 500" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Correct Characters</label>
                <Input type="number" value={correctChars} onChange={(e) => setCorrectChars(e.target.value)} placeholder="e.g. 475" />
              </div>
              <Button onClick={calculate} className="w-full">Calculate Accuracy</Button>

              {result !== null && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Your Accuracy</p>
                  <p className="text-4xl font-bold text-primary">{result}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <section className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">Why Typing Accuracy Matters</h2>
            <p className="text-muted-foreground mb-4">
              Accuracy is just as important as speed in typing tests. Most government exams require 90%+ accuracy. Typing with high accuracy reduces the need for corrections and ultimately makes you faster in real-world tasks.
            </p>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default AccuracyCalculator;
