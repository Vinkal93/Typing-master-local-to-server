import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import SEO from "@/components/SEO";

const WpmCalculator = () => {
  const [totalWords, setTotalWords] = useState("");
  const [minutes, setMinutes] = useState("");
  const [errors, setErrors] = useState("");
  const [result, setResult] = useState<{ gross: number; net: number } | null>(null);

  useEffect(() => {
    document.title = "WPM Calculator | Calculate Words Per Minute Typing Speed";
  }, []);

  const calculate = () => {
    const w = parseInt(totalWords) || 0;
    const m = parseFloat(minutes) || 1;
    const e = parseInt(errors) || 0;
    const gross = Math.round(w / m);
    const net = Math.max(0, Math.round((w - e) / m));
    setResult({ gross, net });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="WPM Calculator — Free Words Per Minute Calculator Online" description="Calculate your typing WPM instantly. Free words per minute calculator with accuracy breakdown." keywords="wpm calculator, words per minute calculator, typing speed calculator" breadcrumbs={[{name:"Home",path:"/"},{name:"WPM Calculator",path:"/wpm-calculator"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold text-foreground text-center mb-4">WPM Calculator</h1>
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Calculate your typing speed in Words Per Minute (WPM). Enter the total words typed, time taken, and errors to get your gross and net WPM.
          </p>

          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> WPM Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Total Words Typed</label>
                <Input type="number" value={totalWords} onChange={(e) => setTotalWords(e.target.value)} placeholder="e.g. 250" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Time (in minutes)</label>
                <Input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="e.g. 5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Number of Errors</label>
                <Input type="number" value={errors} onChange={(e) => setErrors(e.target.value)} placeholder="e.g. 10" />
              </div>
              <Button onClick={calculate} className="w-full">Calculate WPM</Button>

              {result && (
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Gross WPM</p>
                  <p className="text-3xl font-bold text-foreground">{result.gross}</p>
                  <p className="text-sm text-muted-foreground">Net WPM</p>
                  <p className="text-3xl font-bold text-primary">{result.net}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <AdBanner slot="4000000003" format="horizontal" className="my-8" />

          <section className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
            <h2 className="text-2xl font-bold text-foreground mb-3">How WPM is Calculated</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Gross WPM</strong> = Total Words Typed ÷ Time in Minutes. <strong>Net WPM</strong> = (Total Words - Errors) ÷ Time in Minutes. Net WPM is the more accurate measure as it accounts for typing mistakes.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">WPM Requirements for Government Exams</h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>SSC CGL/CHSL: 35 WPM in English</li>
              <li>CPCT: 30 WPM Hindi, 35 WPM English</li>
              <li>Court Typist: 40 WPM English</li>
              <li>Data Entry Operator: 8000 key depressions per hour</li>
            </ul>
          </section>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default WpmCalculator;
