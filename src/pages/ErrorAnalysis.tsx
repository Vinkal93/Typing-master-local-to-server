import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMissedKeysData } from "@/lib/missedKeysTracker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown } from "lucide-react";
import { getProgressData, getAverageWpm, getAverageAccuracy } from "@/lib/progressTracker";
import jsPDF from "jspdf";
import SEO from "@/components/SEO";

const ErrorAnalysis = () => {
  const { isHindi } = useLanguage();
  const missedData = getMissedKeysData();
  const progress = getProgressData();

  const chartData = useMemo(() => {
    return Object.entries(missedData.missedKeys)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 20)
      .map(([key, val]) => ({ key: key === ' ' ? 'Space' : key.toUpperCase(), errors: val.count }));
  }, [missedData]);

  const recentErrors = useMemo(() => {
    return Object.entries(missedData.missedKeys)
      .sort(([, a], [, b]) => b.lastMissed - a.lastMissed)
      .slice(0, 10);
  }, [missedData]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const avgWpm = getAverageWpm();
    const avgAcc = getAverageAccuracy();

    doc.setFontSize(20);
    doc.text("Typing Performance Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Tests: ${progress.totalTests}`, 20, 42);
    doc.text(`Best WPM: ${progress.bestWpm}`, 20, 50);
    doc.text(`Average WPM: ${avgWpm}`, 20, 58);
    doc.text(`Best Accuracy: ${progress.bestAccuracy}%`, 20, 66);
    doc.text(`Average Accuracy: ${avgAcc}%`, 20, 74);
    doc.text(`Total Key Misses: ${missedData.totalMisses}`, 20, 86);

    doc.setFontSize(14);
    doc.text("Top Missed Keys:", 20, 100);
    doc.setFontSize(11);
    chartData.slice(0, 15).forEach((item, i) => {
      doc.text(`${item.key}: ${item.errors} errors`, 25, 110 + i * 8);
    });

    doc.setFontSize(14);
    doc.text("Recent Tests:", 20, 110 + Math.min(chartData.length, 15) * 8 + 10);
    doc.setFontSize(10);
    const recentTests = progress.tests.slice(-10).reverse();
    recentTests.forEach((t, i) => {
      const y = 120 + Math.min(chartData.length, 15) * 8 + 10 + i * 7;
      if (y < 280) {
        doc.text(`${t.title || 'Test'} - ${t.wpm} WPM, ${t.accuracy}% acc (${new Date(t.timestamp).toLocaleDateString()})`, 25, y);
      }
    });

    doc.save("typing-report.pdf");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Error Analysis — Character & Word Heatmap" description="Detailed character and word error analysis with PDF export." keywords="typing error analysis, typing heatmap" breadcrumbs={[{name:"Home",path:"/"},{name:"Error Analysis",path:"/error-analysis"}]} />
      <Navbar />
      <AdLayout>
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              📊 {isHindi ? "विस्तृत एरर विश्लेषण" : "Detailed Error Analysis"}
            </h1>
            <p className="text-muted-foreground">{isHindi ? "कौन से अक्षर/शब्दों में बार-बार गलती" : "Recurring character & word errors"}</p>
          </div>
          <Button onClick={exportPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            {isHindi ? "PDF डाउनलोड" : "Export PDF"}
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{isHindi ? "कुल गलतियाँ" : "Total Misses"}</p>
            <p className="text-2xl font-bold text-destructive">{missedData.totalMisses}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{isHindi ? "अलग Keys" : "Unique Keys"}</p>
            <p className="text-2xl font-bold text-foreground">{Object.keys(missedData.missedKeys).length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{isHindi ? "सर्वश्रेष्ठ WPM" : "Best WPM"}</p>
            <p className="text-2xl font-bold text-primary">{progress.bestWpm}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{isHindi ? "कुल टेस्ट" : "Total Tests"}</p>
            <p className="text-2xl font-bold text-foreground">{progress.totalTests}</p>
          </Card>
        </div>

        {/* Error Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="font-semibold mb-4">{isHindi ? "सबसे ज़्यादा गलत Keys" : "Most Missed Keys"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recent Errors */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{isHindi ? "हाल की गलतियाँ" : "Recent Errors"}</h3>
          {recentErrors.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{isHindi ? "कोई डेटा नहीं" : "No error data yet"}</p>
          ) : (
            <div className="space-y-2">
              {recentErrors.map(([key, val]) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <kbd className="bg-background border rounded px-3 py-1 font-mono text-lg min-w-[40px] text-center">{key === ' ' ? '␣' : key}</kbd>
                  <div className="flex-1">
                    <p className="text-sm">{val.count} {isHindi ? "बार गलत" : "times missed"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(val.lastMissed).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
      <Footer />
      </AdLayout>
    </div>
  );
};

export default ErrorAnalysis;
