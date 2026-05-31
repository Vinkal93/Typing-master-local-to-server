import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, RotateCcw, Heart, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveTestRecord } from "@/lib/progressTracker";
import SEO from "@/components/SEO";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
}

interface Bubble {
  id: number;
  word: string;
  x: number;
  y: number;
  color: string;
  exploding: boolean;
}

interface Alien {
  id: number;
  word: string;
  x: number;
  y: number;
  destroyed: boolean;
}

interface Zombie {
  id: number;
  word: string;
  x: number;
  distance: number;
  speed: number;
}

const Games = () => {
  const navigate = useNavigate();
  const { isHindi, t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Falling Words Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [level, setLevel] = useState(1);
  const gameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Word Shooter Game State
  const [shooterGameStarted, setShooterGameStarted] = useState(false);
  const [shooterScore, setShooterScore] = useState(0);
  const [shooterGameOver, setShooterGameOver] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shooterInput, setShooterInput] = useState("");
  const [shooterLevel, setShooterLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const shooterInputRef = useRef<HTMLInputElement>(null);

  // Speed Race Game State
  const [raceGameStarted, setRaceGameStarted] = useState(false);
  const [raceScore, setRaceScore] = useState(0);
  const [raceGameOver, setRaceGameOver] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");
  const [raceInput, setRaceInput] = useState("");
  const [raceLevel, setRaceLevel] = useState(1);
  const [carPosition, setCarPosition] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [raceStartTime, setRaceStartTime] = useState<number>(0);
  const [currentLapStartTime, setCurrentLapStartTime] = useState<number>(0);
  const raceInputRef = useRef<HTMLInputElement>(null);

  // Space Typing Game State
  const [spaceGameStarted, setSpaceGameStarted] = useState(false);
  const [spaceScore, setSpaceScore] = useState(0);
  const [spaceGameOver, setSpaceGameOver] = useState(false);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [spaceInput, setSpaceInput] = useState("");
  const [spaceLevel, setSpaceLevel] = useState(1);
  const [spaceLives, setSpaceLives] = useState(5);
  const spaceInputRef = useRef<HTMLInputElement>(null);

  // Zombie Typing Game State
  const [zombieGameStarted, setZombieGameStarted] = useState(false);
  const [zombieScore, setZombieScore] = useState(0);
  const [zombieGameOver, setZombieGameOver] = useState(false);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [zombieInput, setZombieInput] = useState("");
  const [zombieLevel, setZombieLevel] = useState(1);
  const [zombieLives, setZombieLives] = useState(3);
  const zombieInputRef = useRef<HTMLInputElement>(null);

  // Marathon Game State
  const [marathonGameStarted, setMarathonGameStarted] = useState(false);
  const [marathonScore, setMarathonScore] = useState(0);
  const [marathonGameOver, setMarathonGameOver] = useState(false);
  const [marathonWords, setMarathonWords] = useState<string[]>([]);
  const [marathonInput, setMarathonInput] = useState("");
  const [marathonTime, setMarathonTime] = useState(60);
  const [marathonWPM, setMarathonWPM] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const marathonInputRef = useRef<HTMLInputElement>(null);

  // Easy words (Level 1-3)
  const easyEnglishWords = [
    "cat", "dog", "run", "jump", "fast", "slow", "blue", "red", "green", "happy",
    "type", "word", "game", "play", "quick", "speed", "time", "moon", "star", "sun"
  ];

  // Medium words (Level 4-6)  
  const mediumEnglishWords = [
    "code", "learn", "skill", "power", "focus", "think", "smart", "brain", "idea", "love",
    "book", "desk", "chair", "door", "window", "light", "dark", "night", "table", "phone",
    "keyboard", "computer", "practice", "learning", "progress", "success", "achieve", "master"
  ];

  // Hard words (Level 7+)
  const hardEnglishWords = [
    "development", "programming", "achievement", "experience", "professional", "technology",
    "communication", "understanding", "improvement", "application", "visualization", "performance",
    "efficiency", "productivity", "collaboration", "responsibility", "determination", "opportunity"
  ];

  const easyHindiWords = [
    "कल", "आज", "खेल", "दौड़", "तेज", "धीमा", "नीला", "लाल", "हरा", "खुश",
    "टाइप", "शब्द", "गेम", "खेलो", "जल्दी", "स्पिड", "समय", "चांद", "तारा", "सूरज"
  ];

  const mediumHindiWords = [
    "कोड", "सीखो", "कौशल", "शक्ति", "ध्यान", "सोचो", "स्मार्ट", "दिमाग", "विचार", "प्यार",
    "किताब", "कलम", "मेज", "कुर्सी", "दरवाजा", "खिड़की", "रोशनी", "अंधेरा", "दिन", "रात"
  ];

  const hardHindiWords = [
    "कंप्यूटर", "प्रोग्रामिंग", "टेक्नोलॉजी", "डेवलपमेंट", "प्रोफेशनल", "अचीवमेंट",
    "कम्युनिकेशन", "अंडरस्टैंडिंग", "इम्प्रूवमेंट", "एप्लीकेशन", "परफॉर्मेंस", "प्रोडक्टिविटी"
  ];

  // Get words based on level
  const getWordsByLevel = (level: number) => {
    if (isHindi) {
      if (level <= 3) return easyHindiWords;
      if (level <= 6) return [...easyHindiWords, ...mediumHindiWords];
      return [...mediumHindiWords, ...hardHindiWords];
    } else {
      if (level <= 3) return easyEnglishWords;
      if (level <= 6) return [...easyEnglishWords, ...mediumEnglishWords];
      return [...mediumEnglishWords, ...hardEnglishWords];
    }
  };

  const wordsList = isHindi ? [...easyHindiWords, ...mediumHindiWords] : [...easyEnglishWords, ...mediumEnglishWords];

  const englishSentences = [
    "The quick brown fox jumps over the lazy dog",
    "Practice makes perfect in everything you do",
    "Typing fast requires focus and dedication",
    "Speed and accuracy go hand in hand",
    "Keep practicing to improve your skills"
  ];

  const hindiSentences = [
    "अभ्यास से ही सब कुछ संभव है",
    "तेज टाइपिंग के लिए फोकस जरूरी है",
    "स्पीड और सटीकता दोनों महत्वपूर्ण हैं",
    "हर दिन अभ्यास करने से सुधार होता है",
    "मेहनत और लगन से सब कुछ हासिल होता है"
  ];

  const sentencesList = isHindi ? hindiSentences : englishSentences;

  // Falling Words Game Logic
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = setInterval(() => {
        setWords((prevWords) => {
          const updatedWords = prevWords.map((word) => ({
            ...word,
            y: word.y + word.speed,
          }));

          const reachedBottom = updatedWords.some((word) => word.y > 400);
          if (reachedBottom) {
            setGameOver(true);
            saveTestRecord({ type: 'game', wpm: Math.round(score / 5), accuracy: 95, title: 'Falling Words' });
            return updatedWords;
          }

          return updatedWords;
        });
      }, 50);

      return () => clearInterval(gameLoop);
    }
  }, [gameStarted, gameOver, score]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const levelWords = getWordsByLevel(level);
      const spawnInterval = setInterval(
        () => {
          const newWord: FallingWord = {
            id: Date.now(),
            word: levelWords[Math.floor(Math.random() * levelWords.length)],
            x: Math.random() * 80 + 10,
            y: 0,
            speed: 1 + level * 0.4, // Increased speed scaling
          };
          setWords((prev) => [...prev, newWord]);
        },
        Math.max(2500 - level * 250, 600) // Faster spawn at higher levels
      );

      return () => clearInterval(spawnInterval);
    }
  }, [gameStarted, level, gameOver, isHindi]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setWords([]);
    setCurrentInput("");
    setLevel(1);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    const matchedWord = words.find((word) => word.word === value.trim());
    if (matchedWord) {
      setWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
      setScore((prev) => prev + value.length * 10);
      setCurrentInput("");
      
      if ((score + value.length * 10) % 50 === 0) {
        setLevel((prev) => prev + 1);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setWords([]);
    setCurrentInput("");
    setLevel(1);
  };

  // Word Shooter Game Logic
  const bubbleColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

  const startShooterGame = () => {
    setShooterGameStarted(true);
    setShooterGameOver(false);
    setShooterScore(0);
    setBubbles([]);
    setShooterInput("");
    setShooterLevel(1);
    setLives(3);
    setTimeout(() => shooterInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (shooterGameStarted && !shooterGameOver && lives > 0) {
      const spawnInterval = setInterval(
        () => {
          const newBubble: Bubble = {
            id: Date.now() + Math.random(),
            word: wordsList[Math.floor(Math.random() * wordsList.length)],
            x: Math.random() * 70 + 10,
            y: Math.random() * 60 + 10,
            color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
            exploding: false,
          };
          setBubbles((prev) => {
            if (prev.length < 8) {
              return [...prev, newBubble];
            }
            return prev;
          });
        },
        Math.max(3000 - shooterLevel * 300, 1500)
      );

      return () => clearInterval(spawnInterval);
    }
  }, [shooterGameStarted, shooterLevel, shooterGameOver, lives, wordsList]);

  useEffect(() => {
    if (shooterGameStarted && !shooterGameOver && bubbles.length > 10) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setShooterGameOver(true);
          saveTestRecord({ type: 'game', wpm: Math.round(shooterScore / 7), accuracy: 92, title: 'Word Shooter' });
        }
        return newLives;
      });
      setBubbles((prev) => prev.slice(0, 8));
    }
  }, [bubbles.length, shooterGameStarted, shooterGameOver, shooterScore]);

  const handleShooterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShooterInput(value);

    const matchedBubble = bubbles.find((bubble) => !bubble.exploding && bubble.word === value.trim());
    if (matchedBubble) {
      setBubbles((prev) =>
        prev.map((b) => (b.id === matchedBubble.id ? { ...b, exploding: true } : b))
      );
      
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== matchedBubble.id));
      }, 500);

      setShooterScore((prev) => prev + value.length * 15);
      setShooterInput("");

      if ((shooterScore + value.length * 15) % 100 === 0) {
        setShooterLevel((prev) => prev + 1);
      }
    }
  };

  const resetShooterGame = () => {
    setShooterGameStarted(false);
    setShooterGameOver(false);
    setShooterScore(0);
    setBubbles([]);
    setShooterInput("");
    setShooterLevel(1);
    setLives(3);
  };

  // Speed Race Game Logic
  const startRaceGame = () => {
    setRaceGameStarted(true);
    setRaceGameOver(false);
    setRaceScore(0);
    setRaceInput("");
    setRaceLevel(1);
    setCarPosition(0);
    setLapTimes([]);
    const now = Date.now();
    setRaceStartTime(now);
    setCurrentLapStartTime(now);
    setCurrentSentence(sentencesList[Math.floor(Math.random() * sentencesList.length)]);
    setTimeout(() => raceInputRef.current?.focus(), 100);
  };

  const handleRaceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRaceInput(value);

    if (value === currentSentence) {
      const progress = 100 / 3;
      const newPosition = carPosition + progress;
      setCarPosition(newPosition);
      setRaceScore((prev) => prev + currentSentence.length * 5);
      setRaceInput("");

      if (Math.floor(newPosition / 33.33) > lapTimes.length) {
        const lapTime = (Date.now() - currentLapStartTime) / 1000;
        setLapTimes((prev) => [...prev, lapTime]);
        setCurrentLapStartTime(Date.now());
      }

      if (newPosition >= 100) {
        setRaceGameOver(true);
        const totalTime = (Date.now() - raceStartTime) / 1000;
        const wpm = Math.round((raceScore / 5) / (totalTime / 60));
        saveTestRecord({ type: 'game', wpm, accuracy: 98, title: 'Speed Race', duration: totalTime });
        return;
      }

      setCurrentSentence(sentencesList[Math.floor(Math.random() * sentencesList.length)]);

      if (raceScore % 500 === 0) {
        setRaceLevel((prev) => prev + 1);
      }
    }
  };

  const resetRaceGame = () => {
    setRaceGameStarted(false);
    setRaceGameOver(false);
    setRaceScore(0);
    setRaceInput("");
    setRaceLevel(1);
    setCarPosition(0);
    setLapTimes([]);
  };

  // Space Typing Game Logic
  const startSpaceGame = () => {
    setSpaceGameStarted(true);
    setSpaceGameOver(false);
    setSpaceScore(0);
    setAliens([]);
    setSpaceInput("");
    setSpaceLevel(1);
    setSpaceLives(5);
    setTimeout(() => spaceInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (spaceGameStarted && !spaceGameOver && spaceLives > 0) {
      const levelWords = getWordsByLevel(spaceLevel);
      const maxAliens = Math.min(4 + spaceLevel, 10); // More aliens at higher levels
      const spawnInterval = setInterval(
        () => {
          const newAlien: Alien = {
            id: Date.now() + Math.random(),
            word: levelWords[Math.floor(Math.random() * levelWords.length)],
            x: Math.random() * 80 + 10,
            y: Math.random() * 40 + 10,
            destroyed: false,
          };
          setAliens((prev) => {
            if (prev.length < maxAliens) {
              return [...prev, newAlien];
            }
            return prev;
          });
        },
        Math.max(2500 - spaceLevel * 300, 800) // Faster spawn
      );

      return () => clearInterval(spawnInterval);
    }
  }, [spaceGameStarted, spaceLevel, spaceGameOver, spaceLives, isHindi]);

  useEffect(() => {
    if (spaceGameStarted && !spaceGameOver && aliens.length > 8) {
      setSpaceLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setSpaceGameOver(true);
          saveTestRecord({ type: 'game', wpm: Math.round(spaceScore / 6), accuracy: 94, title: 'Space Typing' });
        }
        return newLives;
      });
      setAliens((prev) => prev.slice(0, 6));
    }
  }, [aliens.length, spaceGameStarted, spaceGameOver, spaceScore]);

  const handleSpaceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSpaceInput(value);

    const matchedAlien = aliens.find((alien) => !alien.destroyed && alien.word === value.trim());
    if (matchedAlien) {
      setAliens((prev) =>
        prev.map((a) => (a.id === matchedAlien.id ? { ...a, destroyed: true } : a))
      );
      
      setTimeout(() => {
        setAliens((prev) => prev.filter((a) => a.id !== matchedAlien.id));
      }, 300);

      setSpaceScore((prev) => prev + value.length * 20);
      setSpaceInput("");

      if ((spaceScore + value.length * 20) % 150 === 0) {
        setSpaceLevel((prev) => prev + 1);
      }
    }
  };

  const resetSpaceGame = () => {
    setSpaceGameStarted(false);
    setSpaceGameOver(false);
    setSpaceScore(0);
    setAliens([]);
    setSpaceInput("");
    setSpaceLevel(1);
    setSpaceLives(5);
  };

  // Zombie Typing Game Logic
  const startZombieGame = () => {
    setZombieGameStarted(true);
    setZombieGameOver(false);
    setZombieScore(0);
    setZombies([]);
    setZombieInput("");
    setZombieLevel(1);
    setZombieLives(3);
    setTimeout(() => zombieInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (zombieGameStarted && !zombieGameOver && zombieLives > 0) {
      const levelWords = getWordsByLevel(zombieLevel);
      const maxZombies = Math.min(3 + zombieLevel, 8); // More zombies at higher levels
      const spawnInterval = setInterval(
        () => {
          const newZombie: Zombie = {
            id: Date.now() + Math.random(),
            word: levelWords[Math.floor(Math.random() * levelWords.length)],
            x: Math.random() * 80 + 10,
            distance: 100,
            speed: 0.6 + zombieLevel * 0.25, // Faster zombies
          };
          setZombies((prev) => {
            if (prev.length < maxZombies) {
              return [...prev, newZombie];
            }
            return prev;
          });
        },
        Math.max(3000 - zombieLevel * 350, 1500) // Faster spawn
      );

      return () => clearInterval(spawnInterval);
    }
  }, [zombieGameStarted, zombieLevel, zombieGameOver, zombieLives, isHindi]);

  useEffect(() => {
    if (zombieGameStarted && !zombieGameOver) {
      const moveInterval = setInterval(() => {
        setZombies((prev) => {
          const updated = prev.map((zombie) => ({
            ...zombie,
            distance: zombie.distance - zombie.speed,
          }));

          const reachedPlayer = updated.some((zombie) => zombie.distance <= 0);
          if (reachedPlayer) {
            setZombieLives((lives) => {
              const newLives = lives - 1;
              if (newLives <= 0) {
                setZombieGameOver(true);
                saveTestRecord({ type: 'game', wpm: Math.round(zombieScore / 6), accuracy: 90, title: 'Zombie Typing' });
              }
              return newLives;
            });
            return updated.filter((zombie) => zombie.distance > 0);
          }

          return updated;
        });
      }, 100);

      return () => clearInterval(moveInterval);
    }
  }, [zombieGameStarted, zombieGameOver, zombieScore]);

  const handleZombieInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZombieInput(value);

    const matchedZombie = zombies.find((zombie) => zombie.word === value.trim());
    if (matchedZombie) {
      setZombies((prev) => prev.filter((z) => z.id !== matchedZombie.id));
      setZombieScore((prev) => prev + value.length * 18);
      setZombieInput("");

      if ((zombieScore + value.length * 18) % 120 === 0) {
        setZombieLevel((prev) => prev + 1);
      }
    }
  };

  const resetZombieGame = () => {
    setZombieGameStarted(false);
    setZombieGameOver(false);
    setZombieScore(0);
    setZombies([]);
    setZombieInput("");
    setZombieLevel(1);
    setZombieLives(3);
  };

  // Marathon Game Logic
  const startMarathonGame = () => {
    setMarathonGameStarted(true);
    setMarathonGameOver(false);
    setMarathonScore(0);
    setMarathonInput("");
    setMarathonTime(60);
    setCorrectWords(0);
    setMarathonWPM(0);
    const initialWords = Array.from({ length: 5 }, () => 
      wordsList[Math.floor(Math.random() * wordsList.length)]
    );
    setMarathonWords(initialWords);
    setTimeout(() => marathonInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (marathonGameStarted && !marathonGameOver && marathonTime > 0) {
      const timer = setInterval(() => {
        setMarathonTime((prev) => {
          if (prev <= 1) {
            setMarathonGameOver(true);
            const wpm = Math.round((correctWords * 60) / 60);
            saveTestRecord({ type: 'game', wpm, accuracy: 96, title: 'Word Marathon', duration: 60 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [marathonGameStarted, marathonGameOver, marathonTime, correctWords]);

  const handleMarathonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMarathonInput(value);

    if (value.endsWith(" ") && marathonWords[0] === value.trim()) {
      setMarathonScore((prev) => prev + value.trim().length * 10);
      setCorrectWords((prev) => prev + 1);
      setMarathonInput("");
      setMarathonWords((prev) => {
        const newWords = [...prev.slice(1)];
        newWords.push(wordsList[Math.floor(Math.random() * wordsList.length)]);
        return newWords;
      });
      
      const elapsed = 60 - marathonTime;
      if (elapsed > 0) {
        setMarathonWPM(Math.round((correctWords + 1) * 60 / elapsed));
      }
    }
  };

  const resetMarathonGame = () => {
    setMarathonGameStarted(false);
    setMarathonGameOver(false);
    setMarathonScore(0);
    setMarathonInput("");
    setMarathonTime(60);
    setMarathonWPM(0);
    setCorrectWords(0);
  };

  // Space Typing Game Render
  if (selectedGame === "space-typing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Games — Free Fun Speed Games Online" description="Play free typing games to improve your speed and accuracy. 6 fun games with difficulty scaling." keywords="typing games, free typing games, typing speed games" breadcrumbs={[{name:"Home",path:"/"},{name:"Games",path:"/games"}]} />
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "स्कोर" : "Score"}</p>
                <p className="text-3xl font-bold text-primary">{spaceScore}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "लेवल" : "Level"}</p>
                <p className="text-3xl font-bold text-secondary">{spaceLevel}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "एलियंस" : "Aliens"}</p>
                <p className="text-3xl font-bold text-warning">{aliens.length}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "जीवन" : "Lives"}</p>
                <p className="text-3xl font-bold text-destructive flex items-center justify-center gap-1">
                  {Array.from({ length: spaceLives }).map((_, i) => (
                    <Heart key={i} className="h-5 w-5 fill-current" />
                  ))}
                </p>
              </Card>
            </div>

            <Card className="relative overflow-hidden bg-gradient-to-b from-indigo-950 to-black" style={{ height: "500px" }}>
              <div className="relative w-full h-full p-4">
                {!spaceGameStarted && !spaceGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">
                        👾 {isHindi ? "स्पेस टाइपिंग" : "Space Typing"}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {isHindi 
                          ? "एलियंस को नष्ट करने के लिए शब्द टाइप करें! सावधान रहें, वे तेजी से आ रहे हैं!"
                          : "Type words to destroy aliens! Be careful, they're coming fast!"}
                      </p>
                      <Button onClick={startSpaceGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {isHindi ? "गेम शुरू करें" : "Start Game"}
                      </Button>
                    </div>
                  </div>
                )}

                {spaceGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-foreground">
                        {isHindi ? "गेम ओवर!" : "Game Over!"}
                      </h3>
                      <p className="text-2xl mb-2 text-primary">{isHindi ? "अंतिम स्कोर" : "Final Score"}: {spaceScore}</p>
                      <p className="text-lg mb-6 text-muted-foreground">
                        {isHindi ? "लेवल" : "Level"}: {spaceLevel}
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetSpaceGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {isHindi ? "फिर से खेलें" : "Play Again"}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {isHindi ? "गेम्स पर वापस" : "Back to Games"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {spaceGameStarted && !spaceGameOver && (
                  <div className="relative h-full">
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-6xl">
                      🚀
                    </div>

                    {aliens.map((alien) => (
                      <div
                        key={alien.id}
                        className={`absolute text-3xl transition-all duration-300 ${
                          alien.destroyed ? 'scale-0' : 'scale-100'
                        }`}
                        style={{
                          left: `${alien.x}%`,
                          top: `${alien.y}%`,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-1">👾</div>
                          <div className="bg-background/90 px-2 py-1 rounded text-xs font-mono text-foreground">
                            {alien.word}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {spaceGameStarted && !spaceGameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={spaceInputRef}
                  value={spaceInput}
                  onChange={handleSpaceInputChange}
                  placeholder={isHindi ? "एलियंस को नष्ट करने के लिए टाइप करें..." : "Type to destroy aliens..."}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Zombie Typing Game Render
  if (selectedGame === "zombie-typing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "स्कोर" : "Score"}</p>
                <p className="text-3xl font-bold text-primary">{zombieScore}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "लेवल" : "Level"}</p>
                <p className="text-3xl font-bold text-secondary">{zombieLevel}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "ज़ोंबी" : "Zombies"}</p>
                <p className="text-3xl font-bold text-warning">{zombies.length}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "जीवन" : "Lives"}</p>
                <p className="text-3xl font-bold text-destructive flex items-center justify-center gap-1">
                  {Array.from({ length: zombieLives }).map((_, i) => (
                    <Heart key={i} className="h-5 w-5 fill-current" />
                  ))}
                </p>
              </Card>
            </div>

            <Card className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900" style={{ height: "500px" }}>
              <div className="relative w-full h-full p-4">
                {!zombieGameStarted && !zombieGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">
                        🧟 {isHindi ? "ज़ोंबी टाइपिंग" : "Zombie Typing"}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {isHindi 
                          ? "ज़ोंबी आ रहे हैं! उन्हें मारने के लिए शब्द टाइप करें इससे पहले कि वे आप तक पहुंचें!"
                          : "Zombies are coming! Type words to kill them before they reach you!"}
                      </p>
                      <Button onClick={startZombieGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {isHindi ? "गेम शुरू करें" : "Start Game"}
                      </Button>
                    </div>
                  </div>
                )}

                {zombieGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-destructive">
                        {isHindi ? "ज़ोंबी ने आपको पकड़ लिया!" : "Zombies Got You!"}
                      </h3>
                      <p className="text-2xl mb-2 text-primary">{isHindi ? "अंतिम स्कोर" : "Final Score"}: {zombieScore}</p>
                      <p className="text-lg mb-6 text-muted-foreground">
                        {isHindi ? "लेवल" : "Level"}: {zombieLevel}
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetZombieGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {isHindi ? "फिर से खेलें" : "Play Again"}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {isHindi ? "गेम्स पर वापस" : "Back to Games"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {zombieGameStarted && !zombieGameOver && (
                  <div className="relative h-full">
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-6xl">
                      🏠
                    </div>

                    {zombies.map((zombie) => (
                      <div
                        key={zombie.id}
                        className="absolute transition-all duration-100"
                        style={{
                          left: `${zombie.x}%`,
                          bottom: `${zombie.distance}px`,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-1">🧟</div>
                          <div className="bg-background/90 px-2 py-1 rounded text-xs font-mono text-foreground">
                            {zombie.word}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-red-500/30" />
                  </div>
                )}
              </div>
            </Card>

            {zombieGameStarted && !zombieGameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={zombieInputRef}
                  value={zombieInput}
                  onChange={handleZombieInputChange}
                  placeholder={isHindi ? "ज़ोंबी को मारने के लिए टाइप करें..." : "Type to kill zombies..."}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Word Marathon Game Render
  if (selectedGame === "word-marathon") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "स्कोर" : "Score"}</p>
                <p className="text-3xl font-bold text-primary">{marathonScore}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "समय" : "Time"}</p>
                <p className="text-3xl font-bold text-destructive">{marathonTime}s</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "शब्द" : "Words"}</p>
                <p className="text-3xl font-bold text-success">{correctWords}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">WPM</p>
                <p className="text-3xl font-bold text-secondary">{marathonWPM}</p>
              </Card>
            </div>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950" style={{ height: "400px" }}>
              <div className="relative w-full h-full p-8">
                {!marathonGameStarted && !marathonGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">
                        🏃 {isHindi ? "वर्ड मैराथन" : "Word Marathon"}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {isHindi 
                          ? "60 सेकंड में जितने हो सके उतने शब्द टाइप करें! प्रत्येक शब्द के बाद स्पेस दबाएं।"
                          : "Type as many words as you can in 60 seconds! Press space after each word."}
                      </p>
                      <Button onClick={startMarathonGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {isHindi ? "गेम शुरू करें" : "Start Game"}
                      </Button>
                    </div>
                  </div>
                )}

                {marathonGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-foreground">
                        {isHindi ? "मैराथन पूरी हुई!" : "Marathon Complete!"}
                      </h3>
                      <p className="text-2xl mb-2 text-primary">{isHindi ? "कुल स्कोर" : "Total Score"}: {marathonScore}</p>
                      <p className="text-lg mb-2 text-success">{isHindi ? "शब्द टाइप किए" : "Words Typed"}: {correctWords}</p>
                      <p className="text-lg mb-6 text-secondary">WPM: {marathonWPM}</p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetMarathonGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {isHindi ? "फिर से खेलें" : "Play Again"}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {isHindi ? "गेम्स पर वापस" : "Back to Games"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {marathonGameStarted && !marathonGameOver && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center mb-8">
                      <div className="text-6xl font-bold text-primary mb-4">
                        {marathonWords[0]}
                      </div>
                      <div className="flex gap-4 justify-center text-2xl text-muted-foreground">
                        {marathonWords.slice(1, 4).map((word, idx) => (
                          <span key={idx} className="opacity-50">{word}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="w-full max-w-md">
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full bg-primary transition-all duration-1000"
                          style={{ width: `${(marathonTime / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {marathonGameStarted && !marathonGameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={marathonInputRef}
                  value={marathonInput}
                  onChange={handleMarathonInputChange}
                  placeholder={isHindi ? "शब्द टाइप करें और स्पेस दबाएं..." : "Type word and press space..."}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (selectedGame === "speed-race") {
    const totalTime = lapTimes.reduce((a, b) => a + b, 0);
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('score')}</p>
                <p className="text-3xl font-bold text-primary">{raceScore}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('currentLap')}</p>
                <p className="text-3xl font-bold text-secondary">{Math.min(lapTimes.length + 1, 3)}/3</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('speed')}</p>
                <p className="text-3xl font-bold text-success">{Math.floor(carPosition)}%</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('time')}</p>
                <p className="text-3xl font-bold text-warning">
                  {raceGameStarted && !raceGameOver ? Math.floor((Date.now() - raceStartTime) / 1000) : totalTime.toFixed(1)}s
                </p>
              </Card>
            </div>

            {/* Race Track */}
            <Card className="relative overflow-hidden bg-gradient-to-b from-green-100 to-gray-200 dark:from-green-900 dark:to-gray-800" style={{ height: "400px" }}>
              <div className="relative w-full h-full p-4">
                {!raceGameStarted && !raceGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">{t('speedRaceGame')}</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {t('speedRaceInstruction')}
                      </p>
                      <Button onClick={startRaceGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {t('startGame')}
                      </Button>
                    </div>
                  </div>
                )}

                {raceGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-foreground">{t('raceFinished')}</h3>
                      <p className="text-2xl mb-2 text-primary">{t('finalScore')}: {raceScore}</p>
                      <p className="text-lg mb-2 text-muted-foreground">{t('totalTime')}: {totalTime.toFixed(2)}s</p>
                      <div className="mb-6">
                        {lapTimes.map((time, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {t('lap')} {index + 1}: {time.toFixed(2)}s
                          </p>
                        ))}
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetRaceGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {t('playAgain')}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {t('backToGames')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Race Track Visualization */}
                {raceGameStarted && (
                  <div className="relative h-full">
                    {/* Track lanes */}
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-border" />
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-border" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-border" />
                    
                    {/* Lap markers */}
                    <div className="absolute top-0 left-1/3 bottom-0 w-px bg-yellow-500 opacity-30" />
                    <div className="absolute top-0 left-2/3 bottom-0 w-px bg-yellow-500 opacity-30" />
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-red-500 opacity-50" />
                    
                    {/* Car */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 text-4xl"
                      style={{ left: `${carPosition}%` }}
                    >
                      🏎️
                    </div>

                    {/* Current sentence display */}
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <div className="inline-block bg-background/90 px-6 py-3 rounded-lg border border-border">
                        <p className="text-lg font-mono">
                          {currentSentence.split('').map((char, idx) => (
                            <span
                              key={idx}
                              className={
                                idx < raceInput.length
                                  ? raceInput[idx] === char
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                  : 'text-foreground'
                              }
                            >
                              {char}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Input Area */}
            {raceGameStarted && !raceGameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={raceInputRef}
                  value={raceInput}
                  onChange={handleRaceInputChange}
                  placeholder={t('typeToRace')}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (selectedGame === "falling-words") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-3xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('score')}</p>
                <p className="text-3xl font-bold text-primary">{score}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('level')}</p>
                <p className="text-3xl font-bold text-secondary">{level}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('words')}</p>
                <p className="text-3xl font-bold text-warning">{words.length}</p>
              </Card>
            </div>

            {/* Game Area */}
            <Card className="relative overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-950 dark:to-background" style={{ height: "500px" }}>
              <div ref={gameRef} className="relative w-full h-full">
                {!gameStarted && !gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">{t('fallingWords')}</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {t('fallingWordsInstruction')}
                      </p>
                      <Button onClick={startGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {t('startGame')}
                      </Button>
                    </div>
                  </div>
                )}

                {gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-foreground">{t('gameOver')}</h3>
                      <p className="text-2xl mb-2 text-primary">{t('finalScore')}: {score}</p>
                      <p className="text-lg mb-6 text-muted-foreground">{t('levelReached')}: {level}</p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {t('playAgain')}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {t('backToGames')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Falling words */}
                {words.map((word) => (
                  <div
                    key={word.id}
                    className="absolute bg-primary text-primary-foreground px-3 py-1 rounded-md font-mono text-lg shadow-lg"
                    style={{
                      left: `${word.x}%`,
                      top: `${word.y}px`,
                      transition: "top 0.05s linear",
                    }}
                  >
                    {word.word}
                  </div>
                ))}
              </div>
            </Card>

            {/* Input Area */}
            {gameStarted && !gameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={handleInputChange}
                  placeholder={t('typeWords')}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (selectedGame === "word-shooter") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('score')}</p>
                <p className="text-3xl font-bold text-primary">{shooterScore}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('level')}</p>
                <p className="text-3xl font-bold text-secondary">{shooterLevel}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('bubbles')}</p>
                <p className="text-3xl font-bold text-warning">{bubbles.length}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('lives')}</p>
                <p className="text-3xl font-bold text-destructive flex items-center justify-center gap-1">
                  {Array.from({ length: lives }).map((_, i) => (
                    <Heart key={i} className="h-5 w-5 fill-current" />
                  ))}
                </p>
              </Card>
            </div>

            {/* Game Area */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950" style={{ height: "500px" }}>
              <div className="relative w-full h-full p-4">
                {!shooterGameStarted && !shooterGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-4 text-foreground">{t('wordShooter')}</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {t('wordShooterInstruction')}
                      </p>
                      <Button onClick={startShooterGame} size="lg" className="gap-2">
                        <Play className="h-5 w-5" />
                        {t('startGame')}
                      </Button>
                    </div>
                  </div>
                )}

                {shooterGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-4 text-foreground">{t('gameOver')}</h3>
                      <p className="text-2xl mb-2 text-primary">{t('finalScore')}: {shooterScore}</p>
                      <p className="text-lg mb-6 text-muted-foreground">{t('levelReached')}: {shooterLevel}</p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={resetShooterGame} size="lg" className="gap-2">
                          <RotateCcw className="h-5 w-5" />
                          {t('playAgain')}
                        </Button>
                        <Button onClick={() => setSelectedGame(null)} variant="outline" size="lg">
                          {t('backToGames')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bubbles */}
                {bubbles.map((bubble) => (
                  <div
                    key={bubble.id}
                    className={`absolute rounded-full flex items-center justify-center font-mono font-bold text-white shadow-lg transition-all duration-500 ${
                      bubble.exploding ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                    }`}
                    style={{
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      width: "80px",
                      height: "80px",
                      backgroundColor: bubble.color,
                    }}
                  >
                    {bubble.word}
                  </div>
                ))}
              </div>
            </Card>

            {/* Input Area */}
            {shooterGameStarted && !shooterGameOver && (
              <Card className="mt-6 p-6">
                <Input
                  ref={shooterInputRef}
                  value={shooterInput}
                  onChange={handleShooterInputChange}
                  placeholder={t('shootBubbles')}
                  className="text-2xl text-center font-mono"
                  autoFocus
                />
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('funTypingGames')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('gameTagline')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("falling-words")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🎯 {t('fallingWords')}
                </CardTitle>
                <CardDescription className="text-base">
                  {t('fallingWordsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('fallingWordsInfo')}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("speed-race")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🚀 {t('speedRace')}
                </CardTitle>
                <CardDescription className="text-base">
                  {t('speedRaceDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('speedRaceInfo')}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("word-shooter")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  💥 {t('wordShooter')}
                </CardTitle>
                <CardDescription className="text-base">
                  {t('wordShooterDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('wordShooterInfo')}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("space-typing")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  👾 {t('spaceTyping')}
                </CardTitle>
                <CardDescription className="text-base">
                  {t('spaceTypingDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('spaceTypingInfo')}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("zombie-typing")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🧟 {isHindi ? "ज़ोंबी टाइपिंग" : "Zombie Typing"}
                </CardTitle>
                <CardDescription className="text-base">
                  {isHindi ? "ज़ोंबी से बचाव करें" : "Defend against zombies"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {isHindi 
                    ? "ज़ोंबी को मारने के लिए शब्द टाइप करें इससे पहले कि वे आप तक पहुंचें!"
                    : "Type words to kill zombies before they reach you!"}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-border hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              onClick={() => setSelectedGame("word-marathon")}
            >
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  🏃 {isHindi ? "वर्ड मैराथन" : "Word Marathon"}
                </CardTitle>
                <CardDescription className="text-base">
                  {isHindi ? "60 सेकंड की चुनौती" : "60 second challenge"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {isHindi 
                    ? "60 सेकंड में जितने हो सके उतने शब्द टाइप करें!"
                    : "Type as many words as you can in 60 seconds!"}
                </p>
                <Button className="w-full gap-2">
                  <Play className="h-5 w-5" />
                  {t('playNow')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
