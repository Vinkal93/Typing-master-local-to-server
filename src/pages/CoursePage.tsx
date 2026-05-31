import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Play, Crown, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { curriculum, isLessonUnlocked, getTotalLessons, FREE_LESSON_COUNT } from "@/lib/curriculumData";
import SEO from "@/components/SEO";

const CoursePage = () => {
  const navigate = useNavigate();
  const { profile, isPremium, isLoggedIn } = useStudent();
  const completedLessons = profile?.completedLessons || [];
  const totalLessons = getTotalLessons();
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Course — Structured 12-Level Curriculum" description="Structured typing course with 12 levels and 57 lessons. Premium typing curriculum by Vinkal Prajapati." keywords="typing course, structured typing curriculum" breadcrumbs={[{name:"Home",path:"/"},{name:"Course",path:"/course"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Typing Course</h1>
              <p className="text-muted-foreground">Learn touch typing from beginner to advanced — chapter by chapter</p>
              {isLoggedIn && (
                <div className="mt-4 max-w-md mx-auto">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{completedLessons.length}/{totalLessons} lessons</span>
                    <span className="font-bold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}
            </div>

            {curriculum.map((level) => {
              const levelCompleted = level.lessons.filter(l => completedLessons.includes(l.id)).length;
              const levelTotal = level.lessons.length;
              const lvlPercent = Math.round((levelCompleted / levelTotal) * 100);

              return (
                <Card key={level.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{level.icon}</span>
                        <div>
                          <CardTitle className="text-xl">Level {level.level}: {level.title}</CardTitle>
                          <CardDescription>{level.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={lvlPercent === 100 ? 'default' : 'outline'}>
                        {lvlPercent === 100 ? '✓ Complete' : `${levelCompleted}/${levelTotal}`}
                      </Badge>
                    </div>
                    <Progress value={lvlPercent} className="h-2 mt-3" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {level.lessons.map((lesson) => {
                        const completed = completedLessons.includes(lesson.id);
                        const unlocked = isLoggedIn ? isLessonUnlocked(lesson.id, completedLessons, isPremium) : lesson.isFree;
                        const needsPremium = !lesson.isFree && !isPremium;

                        return (
                          <button
                            key={lesson.id}
                            className={`text-left p-4 rounded-lg border transition-all ${
                              completed
                                ? 'border-primary/30 bg-primary/5'
                                : unlocked
                                  ? 'border-border hover:border-primary/50 hover:bg-accent/30'
                                  : 'border-border/50 opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (!isLoggedIn) {
                                // Allow free lessons without login
                                if (lesson.isFree) navigate(`/lesson/${lesson.id}`);
                                return;
                              }
                              if (unlocked) navigate(`/lesson/${lesson.id}`);
                            }}
                            disabled={isLoggedIn ? !unlocked : !lesson.isFree}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : needsPremium ? (
                                  <Crown className="h-5 w-5 text-yellow-500" />
                                ) : !unlocked ? (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <Play className="h-5 w-5 text-foreground" />
                                )}
                                <span className="font-medium text-foreground">
                                  Lesson {lesson.lessonNumber}
                                </span>
                              </div>
                              {lesson.isFree && (
                                <Badge variant="secondary" className="text-[10px]">FREE</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{lesson.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Keys: <span className="font-mono">{lesson.keys}</span></p>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {!isPremium && (
              <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                <CardContent className="pt-6 pb-6 text-center">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-foreground mb-1">Unlock Full Course</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {FREE_LESSON_COUNT} free lessons • {getTotalLessons() - FREE_LESSON_COUNT} premium lessons available
                  </p>
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Crown className="h-4 w-4 mr-2" /> Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </AdLayout>
      <Footer />
    </div>
  );
};

export default CoursePage;
