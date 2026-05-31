import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Trophy, BarChart3, Play, Lock, CheckCircle2, 
  Clock, Target, Zap, Star, Crown, ArrowRight, Shield, Award, 
  TrendingUp, Calendar, Flame, Medal
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { curriculum, getTotalLessons, isLessonUnlocked, FREE_LESSON_COUNT } from "@/lib/curriculumData";
import { getProgressData } from "@/lib/progressTracker";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { profile, isPremium, isApproved } = useStudent();
  const progress = getProgressData();

  const completedLessons = profile?.completedLessons || [];
  const totalLessons = getTotalLessons();
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

  const allLessons = curriculum.flatMap(l => l.lessons);
  const nextLesson = allLessons.find(l => !completedLessons.includes(l.id) && isLessonUnlocked(l.id, completedLessons, isPremium));
  const currentLevel = nextLesson ? curriculum.find(lvl => lvl.lessons.some(l => l.id === nextLesson.id)) : null;

  const avgWpm = progress.tests.length > 0 ? Math.round(progress.tests.reduce((s, t) => s + t.wpm, 0) / progress.tests.length) : 0;
  const avgAcc = progress.tests.length > 0 ? Math.round(progress.tests.reduce((s, t) => s + t.accuracy, 0) / progress.tests.length) : 0;
  const totalMinutes = Math.round((profile?.totalPracticeTime || 0) / 60);

  const today = new Date().toDateString();
  const practicedToday = progress.tests.some(t => new Date(t.timestamp).toDateString() === today);

  // WPM progress chart data (last 20 tests)
  const chartData = progress.tests.slice(-20).map((t, i) => ({
    test: i + 1,
    wpm: t.wpm,
    accuracy: t.accuracy,
  }));

  // Badges earned
  const badges = [];
  if (completedLessons.length >= 1) badges.push({ icon: '🎯', label: 'First Lesson' });
  if (completedLessons.length >= 10) badges.push({ icon: '📚', label: '10 Lessons' });
  if (completedLessons.length >= 25) badges.push({ icon: '🔥', label: '25 Lessons' });
  if (completedLessons.length >= 50) badges.push({ icon: '🏆', label: '50 Lessons' });
  if ((profile?.bestWpm || 0) >= 20) badges.push({ icon: '⚡', label: '20 WPM' });
  if ((profile?.bestWpm || 0) >= 30) badges.push({ icon: '🚀', label: '30 WPM' });
  if ((profile?.bestWpm || 0) >= 40) badges.push({ icon: '💎', label: '40 WPM' });
  if ((profile?.bestAccuracy || 0) >= 90) badges.push({ icon: '🎖️', label: '90% Accuracy' });
  if ((profile?.bestAccuracy || 0) >= 95) badges.push({ icon: '👑', label: '95% Accuracy' });

  const isPremiumUI = isPremium && isApproved;

  return (
    <div className={`min-h-screen flex flex-col ${isPremiumUI ? 'bg-gradient-to-br from-background via-background to-[hsl(45,30%,95%)]' : 'bg-background'}`}>
      <SEO title="Student Dashboard — Typing Master Learning Hub" description="Your personalized typing learning dashboard with progress, lessons and achievements." keywords="student dashboard, typing learning" breadcrumbs={[{name:"Home",path:"/"},{name:"Dashboard",path:"/dashboard"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className={`rounded-2xl p-6 ${isPremiumUI ? 'bg-gradient-to-r from-[hsl(45,80%,50%)]/10 via-[hsl(40,70%,55%)]/5 to-[hsl(35,60%,60%)]/10 border border-[hsl(45,70%,60%)]/30' : 'bg-card border border-border'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-foreground">
                      Welcome, {profile?.displayName || 'Student'} 👋
                    </h1>
                    {isPremiumUI && (
                      <Badge className="bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] text-white border-0 px-3 py-1 shadow-md">
                        <Crown className="h-3 w-3 mr-1" /> Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {currentLevel ? `Current Level: ${currentLevel.icon} ${currentLevel.title}` : 'Course Complete! 🎉'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> ID: {profile?.studentId}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                    <span className="flex items-center gap-1">
                      Status: <Badge variant={isApproved ? 'default' : 'secondary'} className="text-[10px] ml-1">
                        {profile?.status || 'pending'}
                      </Badge>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isPremium && (
                    <Button className="gap-1.5 bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] hover:from-[hsl(45,80%,45%)] hover:to-[hsl(30,80%,45%)] text-white border-0 shadow-md" onClick={() => navigate('/pricing')}>
                      <Crown className="h-4 w-4" /> Upgrade to Premium
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Notice */}
            {profile?.status === 'pending' && (
              <Card className="border-[hsl(45,70%,60%)]/30 bg-[hsl(45,80%,50%)]/5">
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[hsl(45,80%,50%)]" />
                  <div>
                    <p className="font-medium text-foreground">Account Pending Approval</p>
                    <p className="text-sm text-muted-foreground">Your account is being reviewed by admin. You can access free lessons meanwhile.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suspended Notice */}
            {profile?.status === 'suspended' && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">Account Suspended</p>
                    <p className="text-sm text-muted-foreground">Please contact admin for support.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Bar */}
            <Card className={`${isPremiumUI ? 'border-[hsl(45,70%,60%)]/20 bg-gradient-to-r from-card to-[hsl(45,30%,97%)]' : 'border-border'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Course Progress</span>
                  <span className={`text-sm font-bold ${isPremiumUI ? 'text-[hsl(45,80%,45%)]' : 'text-primary'}`}>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedLessons.length} of {totalLessons} lessons completed
                </p>
              </CardContent>
            </Card>

            {/* Daily Reminder */}
            {!practicedToday && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">You haven't practiced today!</p>
                      <p className="text-sm text-muted-foreground">Start a 5-minute practice to maintain your streak</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => nextLesson && navigate(`/lesson/${nextLesson.id}`)}>
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Zap, label: 'Avg WPM', value: avgWpm, color: 'text-primary' },
                { icon: Target, label: 'Avg Accuracy', value: `${avgAcc}%`, color: 'text-[hsl(142,71%,45%)]' },
                { icon: Trophy, label: 'Best WPM', value: profile?.bestWpm || 0, color: 'text-[hsl(45,80%,50%)]' },
                { icon: Clock, label: 'Practice Time', value: `${totalMinutes}m`, color: 'text-secondary' },
                { icon: CheckCircle2, label: 'Lessons Done', value: completedLessons.length, color: 'text-primary' },
              ].map((stat, i) => (
                <Card key={i} className={`${isPremiumUI ? 'border-[hsl(45,70%,60%)]/10' : 'border-border'}`}>
                  <CardContent className="pt-4 pb-4 text-center">
                    <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* WPM Progress Chart */}
            {chartData.length > 2 && (
              <Card className={`${isPremiumUI ? 'border-[hsl(45,70%,60%)]/10' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> WPM Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="test" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="wpm" stroke="hsl(198, 93%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <Card className={`${isPremiumUI ? 'border-[hsl(45,70%,60%)]/20 bg-gradient-to-r from-card to-[hsl(45,30%,97%)]' : 'border-border'}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Medal className="h-4 w-4 text-[hsl(45,80%,50%)]" /> Achievements Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((b, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isPremiumUI ? 'border-[hsl(45,70%,60%)]/30 bg-[hsl(45,80%,50%)]/5' : 'border-border bg-muted/30'}`}>
                        <span className="text-lg">{b.icon}</span>
                        <span className="text-sm font-medium text-foreground">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nextLesson && (
                <Button className={`h-auto py-4 flex-col gap-2 ${isPremiumUI ? 'bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] hover:from-[hsl(45,80%,45%)] hover:to-[hsl(30,80%,45%)] text-white border-0' : ''}`} onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                  <Play className="h-5 w-5" />
                  <span className="text-xs">Continue Lesson {nextLesson.lessonNumber}</span>
                </Button>
              )}
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/course')}>
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">All Lessons</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/progress')}>
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">My Progress</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/achievements')}>
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Achievements</span>
              </Button>
            </div>

            {/* Course Levels */}
            <h2 className="text-2xl font-bold text-foreground mt-8">Course Levels</h2>
            <div className="space-y-4">
              {curriculum.map((level) => {
                const levelCompleted = level.lessons.filter(l => completedLessons.includes(l.id)).length;
                const levelTotal = level.lessons.length;
                const lvlPercent = Math.round((levelCompleted / levelTotal) * 100);

                return (
                  <Card key={level.id} className={`${isPremiumUI ? 'border-[hsl(45,70%,60%)]/10' : 'border-border'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{level.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{level.title}</CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={lvlPercent === 100 ? 'default' : 'secondary'}>
                          {levelCompleted}/{levelTotal}
                        </Badge>
                      </div>
                      <Progress value={lvlPercent} className="h-2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {level.lessons.map((lesson) => {
                          const completed = completedLessons.includes(lesson.id);
                          const unlocked = isLessonUnlocked(lesson.id, completedLessons, isPremium);
                          const needsPremium = !lesson.isFree && !isPremium;

                          return (
                            <button
                              key={lesson.id}
                              className={`text-left p-3 rounded-lg border transition-all ${
                                completed 
                                  ? isPremiumUI ? 'border-[hsl(45,70%,60%)]/30 bg-[hsl(45,80%,50%)]/5' : 'border-primary/30 bg-primary/5'
                                  : unlocked 
                                    ? 'border-border hover:border-primary/50 hover:bg-accent/30 cursor-pointer' 
                                    : 'border-border/50 opacity-60 cursor-not-allowed'
                              }`}
                              onClick={() => unlocked && navigate(`/lesson/${lesson.id}`)}
                              disabled={!unlocked}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  {completed ? (
                                    <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isPremiumUI ? 'text-[hsl(45,80%,50%)]' : 'text-primary'}`} />
                                  ) : needsPremium ? (
                                    <Crown className="h-4 w-4 text-[hsl(45,80%,50%)] flex-shrink-0" />
                                  ) : !unlocked ? (
                                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  ) : (
                                    <Play className="h-4 w-4 text-foreground flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {lesson.lessonNumber}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Keys: {lesson.keys}</p>
                                  </div>
                                </div>
                                {unlocked && !completed && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Premium CTA */}
            {!isPremium && (
              <Card className="border-[hsl(45,70%,60%)]/30 bg-gradient-to-r from-[hsl(45,80%,50%)]/5 to-[hsl(30,80%,50%)]/5">
                <CardContent className="pt-6 pb-6 text-center">
                  <Crown className="h-10 w-10 text-[hsl(45,80%,50%)] mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Unlock All {getTotalLessons()} Lessons</h3>
                  <p className="text-muted-foreground mb-4">
                    Free plan includes {FREE_LESSON_COUNT} lessons. Upgrade to Premium for all chapters, speed tests, certificates, and more.
                  </p>
                  <Button className="bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] hover:from-[hsl(45,80%,45%)] hover:to-[hsl(30,80%,45%)] text-white border-0 shadow-md" onClick={() => navigate('/pricing')}>
                    <Crown className="h-4 w-4 mr-2" /> Upgrade Now
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

export default StudentDashboard;
