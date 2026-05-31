import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProgressData } from "@/lib/progressTracker";
import { Trophy, Medal, Award } from "lucide-react";
import SEO from "@/components/SEO";

const Leaderboard = () => {
  const { isHindi } = useLanguage();
  const progress = getProgressData();

  const personalBests = useMemo(() => {
    const tests = [...progress.tests].sort((a, b) => b.wpm - a.wpm);
    return tests.slice(0, 20);
  }, [progress]);

  const dailyChallenge = useMemo(() => {
    const today = new Date().toDateString();
    const todayTests = progress.tests.filter(t => new Date(t.timestamp).toDateString() === today);
    return {
      testsToday: todayTests.length,
      bestWpmToday: todayTests.length > 0 ? Math.max(...todayTests.map(t => t.wpm)) : 0,
      bestAccToday: todayTests.length > 0 ? Math.max(...todayTests.map(t => t.accuracy)) : 0,
      goal: 5,
    };
  }, [progress]);

  const weeklyStats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekTests = progress.tests.filter(t => t.timestamp >= weekAgo);
    return {
      total: weekTests.length,
      avgWpm: weekTests.length > 0 ? Math.round(weekTests.reduce((s, t) => s + t.wpm, 0) / weekTests.length) : 0,
      avgAcc: weekTests.length > 0 ? Math.round(weekTests.reduce((s, t) => s + t.accuracy, 0) / weekTests.length) : 0,
    };
  }, [progress]);

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (i === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (i === 2) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Leaderboard — Top Typists & Rankings" description="See the top typists on Typing Master leaderboard." keywords="typing leaderboard, top typists" breadcrumbs={[{name:"Home",path:"/"},{name:"Leaderboard",path:"/leaderboard"}]} />
      <Navbar />
      <AdLayout>
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          🏅 {isHindi ? "लीडरबोर्ड और चैलेंज" : "Leaderboard & Challenges"}
        </h1>

        {/* Daily Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <Card className="p-6 text-center border-primary/30">
            <h3 className="font-semibold mb-2">{isHindi ? "📅 आज का चैलेंज" : "📅 Daily Challenge"}</h3>
            <p className="text-3xl font-bold text-primary mb-1">{dailyChallenge.testsToday}/{dailyChallenge.goal}</p>
            <p className="text-sm text-muted-foreground">{isHindi ? "आज के टेस्ट" : "Tests today"}</p>
            <div className="mt-3 bg-muted rounded-full h-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min((dailyChallenge.testsToday / dailyChallenge.goal) * 100, 100)}%` }} />
            </div>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-2">{isHindi ? "⚡ आज का सर्वश्रेष्ठ" : "⚡ Today's Best"}</h3>
            <p className="text-3xl font-bold text-foreground">{dailyChallenge.bestWpmToday} WPM</p>
            <p className="text-sm text-muted-foreground">{dailyChallenge.bestAccToday}% {isHindi ? "सटीकता" : "accuracy"}</p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-2">{isHindi ? "📊 साप्ताहिक" : "📊 This Week"}</h3>
            <p className="text-3xl font-bold text-foreground">{weeklyStats.total}</p>
            <p className="text-sm text-muted-foreground">{weeklyStats.avgWpm} WPM avg • {weeklyStats.avgAcc}%</p>
          </Card>
        </div>

        {/* Personal Best Leaderboard */}
        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">{isHindi ? "🏆 पर्सनल बेस्ट" : "🏆 Personal Best"}</h3>
          {personalBests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{isHindi ? "अभी कोई टेस्ट नहीं" : "No tests yet"}</p>
          ) : (
            <div className="space-y-2">
              {personalBests.map((test, i) => (
                <div key={test.id} className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? 'bg-accent/30' : 'bg-muted/30'}`}>
                  {getRankIcon(i)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{test.title || test.testName || 'Typing Test'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(test.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{test.wpm} WPM</p>
                    <p className="text-xs text-muted-foreground">{test.accuracy}%</p>
                  </div>
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

export default Leaderboard;
