import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProgressData, TestRecord } from "@/lib/progressTracker";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Target, Clock, Calendar, Filter, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const ExamHistory = () => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const progressData = getProgressData();
  
  const [selectedExam, setSelectedExam] = useState<string>("all");

  // Filter only exam records
  const examRecords = progressData.tests.filter(test => test.type === 'exam');

  // Get unique exam names
  const examNames = Array.from(new Set(examRecords.map(record => record.title || 'Unknown')));

  // Filter records based on selection
  const filteredRecords = selectedExam === 'all' 
    ? examRecords 
    : examRecords.filter(record => record.title === selectedExam);

  // Prepare chart data
  const chartData = filteredRecords.slice(-10).map((record, index) => ({
    attempt: index + 1,
    date: new Date(record.timestamp).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' }),
    wpm: record.wpm,
    accuracy: record.accuracy,
    examName: record.title
  }));

  // Calculate stats
  const calculateStats = () => {
    if (filteredRecords.length === 0) {
      return {
        totalAttempts: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        improvementRate: 0
      };
    }

    const totalAttempts = filteredRecords.length;
    const avgWpm = Math.round(filteredRecords.reduce((sum, r) => sum + r.wpm, 0) / totalAttempts);
    const avgAccuracy = Math.round(filteredRecords.reduce((sum, r) => sum + r.accuracy, 0) / totalAttempts);
    const bestWpm = Math.max(...filteredRecords.map(r => r.wpm));
    const bestAccuracy = Math.max(...filteredRecords.map(r => r.accuracy));
    
    // Calculate improvement rate (first vs last 3 attempts average)
    let improvementRate = 0;
    if (filteredRecords.length >= 6) {
      const firstThree = filteredRecords.slice(0, 3);
      const lastThree = filteredRecords.slice(-3);
      const firstAvg = firstThree.reduce((sum, r) => sum + r.wpm, 0) / 3;
      const lastAvg = lastThree.reduce((sum, r) => sum + r.wpm, 0) / 3;
      improvementRate = Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
    }

    return {
      totalAttempts,
      avgWpm,
      avgAccuracy,
      bestWpm,
      bestAccuracy,
      improvementRate
    };
  };

  const stats = calculateStats();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return isHindi ? "N/A" : "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return isHindi ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Exam History — Past Typing Exam Records" description="View your past typing exam attempts and scores." keywords="exam history, typing exam records" breadcrumbs={[{name:"Home",path:"/"},{name:"Exam History",path:"/exam-history"}]} />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {isHindi ? "परीक्षा इतिहास" : "Exam History"}
              </h1>
              <p className="text-muted-foreground">
                {isHindi ? "अपने प्रदर्शन को ट्रैक करें और सुधार देखें" : "Track your performance and see improvements"}
              </p>
            </div>
            <Button onClick={() => navigate('/lessons')} variant="outline">
              {isHindi ? "परीक्षाओं पर वापस जाएं" : "Back to Exams"}
            </Button>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder={isHindi ? "सभी परीक्षाएं" : "All Exams"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isHindi ? "सभी परीक्षाएं" : "All Exams"}</SelectItem>
                    {examNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {filteredRecords.length} {isHindi ? "प्रयास" : "attempts"}
                </span>
              </div>
            </CardContent>
          </Card>

          {filteredRecords.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  {isHindi ? "कोई परीक्षा रिकॉर्ड नहीं" : "No Exam Records Yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isHindi 
                    ? "अपना पहला परीक्षा प्रयास शुरू करें और अपनी प्रगति ट्रैक करें"
                    : "Start your first exam attempt and track your progress"}
                </p>
                <Button onClick={() => navigate('/lessons')}>
                  {isHindi ? "परीक्षा शुरू करें" : "Start an Exam"}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      {isHindi ? "कुल प्रयास" : "Total Attempts"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalAttempts}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      {isHindi ? "औसत WPM" : "Average WPM"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-success">{stats.avgWpm}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isHindi ? "सर्वश्रेष्ठ:" : "Best:"} {stats.bestWpm} WPM
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-success" />
                      {isHindi ? "औसत सटीकता" : "Average Accuracy"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-success">{stats.avgAccuracy}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isHindi ? "सर्वश्रेष्ठ:" : "Best:"} {stats.bestAccuracy}%
                    </p>
                  </CardContent>
                </Card>

                {stats.improvementRate !== 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        {isHindi ? "सुधार दर" : "Improvement Rate"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-3xl font-bold ${stats.improvementRate > 0 ? 'text-success' : 'text-destructive'}`}>
                        {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isHindi ? "पहले 3 बनाम अंतिम 3" : "First 3 vs Last 3"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? "WPM प्रगति" : "WPM Progress"}</CardTitle>
                    <CardDescription>
                      {isHindi ? "समय के साथ आपकी टाइपिंग गति" : "Your typing speed over time"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="wpm" stroke="hsl(var(--success))" strokeWidth={2} name={isHindi ? "WPM" : "WPM"} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? "सटीकता प्रगति" : "Accuracy Progress"}</CardTitle>
                    <CardDescription>
                      {isHindi ? "समय के साथ आपकी सटीकता" : "Your accuracy over time"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name={isHindi ? "सटीकता %" : "Accuracy %"} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>{isHindi ? "हाल के प्रयास" : "Recent Attempts"}</CardTitle>
                  <CardDescription>
                    {isHindi ? "आपके नवीनतम परीक्षा परिणाम" : "Your latest exam results"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRecords.slice().reverse().slice(0, 10).map((record, index) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <Trophy className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{record.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(record.timestamp).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-success">{record.wpm}</p>
                            <p className="text-xs text-muted-foreground">WPM</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{record.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">{isHindi ? "सटीकता" : "Accuracy"}</p>
                          </div>
                          {record.duration && (
                            <div className="text-center">
                              <p className="text-lg font-semibold">{formatDuration(record.duration)}</p>
                              <p className="text-xs text-muted-foreground">{isHindi ? "समय" : "Time"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExamHistory;
