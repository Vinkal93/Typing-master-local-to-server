import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMissedKeysData } from "@/lib/missedKeysTracker";
import SEO from "@/components/SEO";

const fingerMap: Record<string, { finger: string; hand: string }> = {
  'q': { finger: 'Left Pinky', hand: 'left' }, 'a': { finger: 'Left Pinky', hand: 'left' }, 'z': { finger: 'Left Pinky', hand: 'left' },
  'w': { finger: 'Left Ring', hand: 'left' }, 's': { finger: 'Left Ring', hand: 'left' }, 'x': { finger: 'Left Ring', hand: 'left' },
  'e': { finger: 'Left Middle', hand: 'left' }, 'd': { finger: 'Left Middle', hand: 'left' }, 'c': { finger: 'Left Middle', hand: 'left' },
  'r': { finger: 'Left Index', hand: 'left' }, 'f': { finger: 'Left Index', hand: 'left' }, 'v': { finger: 'Left Index', hand: 'left' },
  't': { finger: 'Left Index', hand: 'left' }, 'g': { finger: 'Left Index', hand: 'left' }, 'b': { finger: 'Left Index', hand: 'left' },
  'y': { finger: 'Right Index', hand: 'right' }, 'h': { finger: 'Right Index', hand: 'right' }, 'n': { finger: 'Right Index', hand: 'right' },
  'u': { finger: 'Right Index', hand: 'right' }, 'j': { finger: 'Right Index', hand: 'right' }, 'm': { finger: 'Right Index', hand: 'right' },
  'i': { finger: 'Right Middle', hand: 'right' }, 'k': { finger: 'Right Middle', hand: 'right' }, ',': { finger: 'Right Middle', hand: 'right' },
  'o': { finger: 'Right Ring', hand: 'right' }, 'l': { finger: 'Right Ring', hand: 'right' }, '.': { finger: 'Right Ring', hand: 'right' },
  'p': { finger: 'Right Pinky', hand: 'right' }, ';': { finger: 'Right Pinky', hand: 'right' }, '/': { finger: 'Right Pinky', hand: 'right' },
  ' ': { finger: 'Thumbs', hand: 'both' },
};

const fingerNames = ['Left Pinky', 'Left Ring', 'Left Middle', 'Left Index', 'Thumbs', 'Right Index', 'Right Middle', 'Right Ring', 'Right Pinky'];
const fingerNamesHi: Record<string, string> = {
  'Left Pinky': 'बाईं छोटी', 'Left Ring': 'बाईं अनामिका', 'Left Middle': 'बाईं मध्यमा', 'Left Index': 'बाईं तर्जनी',
  'Thumbs': 'अंगूठे', 'Right Index': 'दाईं तर्जनी', 'Right Middle': 'दाईं मध्यमा', 'Right Ring': 'दाईं अनामिका', 'Right Pinky': 'दाईं छोटी',
};

const FingerHeatmap = () => {
  const { isHindi } = useLanguage();
  const data = getMissedKeysData();

  const fingerErrors = useMemo(() => {
    const counts: Record<string, number> = {};
    fingerNames.forEach(f => counts[f] = 0);
    Object.entries(data.missedKeys).forEach(([key, val]) => {
      const mapping = fingerMap[key.toLowerCase()];
      if (mapping) counts[mapping.finger] = (counts[mapping.finger] || 0) + val.count;
    });
    return counts;
  }, [data]);

  const maxErrors = Math.max(...Object.values(fingerErrors), 1);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxErrors;
    if (intensity > 0.7) return 'bg-destructive text-destructive-foreground';
    if (intensity > 0.4) return 'bg-orange-500 text-white';
    if (intensity > 0.1) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const topMissedKeys = Object.entries(data.missedKeys)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Finger Heatmap — Visualize Your Typing Errors" description="Interactive finger heatmap to visualize typing errors and weak fingers." keywords="finger heatmap, typing finger analysis" breadcrumbs={[{name:"Home",path:"/"},{name:"Finger Heatmap",path:"/finger-heatmap"}]} />
      <Navbar />
      <AdLayout>
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
          {isHindi ? "🖐️ फिंगर हीटमैप" : "🖐️ Finger Heatmap"}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {isHindi ? "कौन सी उंगली से ज़्यादा गलतियाँ हो रही हैं" : "Which fingers make the most errors"}
        </p>

        {/* Hands Visualization */}
        <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
          {/* Left Hand */}
          <div>
            <h3 className="text-center font-semibold mb-3">{isHindi ? "बायां हाथ" : "Left Hand"}</h3>
            <div className="flex justify-center gap-2">
              {['Left Pinky', 'Left Ring', 'Left Middle', 'Left Index'].map(finger => (
                <div key={finger} className="text-center">
                  <div className={`w-12 h-20 rounded-t-full ${getHeatColor(fingerErrors[finger])} flex items-end justify-center pb-2 text-xs font-bold transition-colors`}>
                    {fingerErrors[finger]}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 w-12 truncate">{isHindi ? fingerNamesHi[finger] : finger.replace('Left ', '')}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right Hand */}
          <div>
            <h3 className="text-center font-semibold mb-3">{isHindi ? "दायां हाथ" : "Right Hand"}</h3>
            <div className="flex justify-center gap-2">
              {['Right Index', 'Right Middle', 'Right Ring', 'Right Pinky'].map(finger => (
                <div key={finger} className="text-center">
                  <div className={`w-12 h-20 rounded-t-full ${getHeatColor(fingerErrors[finger])} flex items-end justify-center pb-2 text-xs font-bold transition-colors`}>
                    {fingerErrors[finger]}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 w-12 truncate">{isHindi ? fingerNamesHi[finger] : finger.replace('Right ', '')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thumbs */}
        <div className="text-center mb-8">
          <div className={`inline-block w-24 h-10 rounded-full ${getHeatColor(fingerErrors['Thumbs'])} flex items-center justify-center text-xs font-bold mx-auto`}>
            {isHindi ? "अंगूठे" : "Thumbs"}: {fingerErrors['Thumbs']}
          </div>
        </div>

        {/* Bar Chart */}
        <Card className="p-6 max-w-3xl mx-auto mb-8">
          <h3 className="font-semibold mb-4">{isHindi ? "उंगली-वार गलतियाँ" : "Finger-wise Errors"}</h3>
          <div className="space-y-3">
            {fingerNames.map(finger => (
              <div key={finger} className="flex items-center gap-3">
                <span className="text-sm w-28 text-right text-muted-foreground">{isHindi ? fingerNamesHi[finger] : finger}</span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${fingerErrors[finger] > 0 ? 'bg-primary' : ''}`}
                    style={{ width: `${(fingerErrors[finger] / maxErrors) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-8">{fingerErrors[finger]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Missed Keys */}
        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold mb-4">{isHindi ? "सबसे ज़्यादा गलत Keys" : "Most Missed Keys"}</h3>
          {topMissedKeys.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{isHindi ? "अभी कोई डेटा नहीं। टाइपिंग शुरू करें!" : "No data yet. Start typing!"}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {topMissedKeys.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <kbd className="bg-background border rounded px-2 py-1 font-mono text-lg">{key === ' ' ? '␣' : key}</kbd>
                  <span className="text-sm text-destructive font-bold">{val.count}x</span>
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

export default FingerHeatmap;
