import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, Trash2, Filter, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProgressData, TestRecord } from "@/lib/progressTracker";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const FullHistory = () => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const progress = getProgressData();
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const filteredTests = progress.tests
    .filter(test => filterType === "all" || test.type === filterType)
    .sort((a, b) => {
      if (sortBy === "newest") return b.timestamp - a.timestamp;
      if (sortBy === "oldest") return a.timestamp - b.timestamp;
      if (sortBy === "wpm-high") return b.wpm - a.wpm;
      if (sortBy === "wpm-low") return a.wpm - b.wpm;
      if (sortBy === "accuracy-high") return b.accuracy - a.accuracy;
      return a.accuracy - b.accuracy;
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'test': return 'bg-primary/20 text-primary';
      case 'exam': return 'bg-secondary/20 text-secondary';
      case 'game': return 'bg-success/20 text-success';
      case 'lesson': return 'bg-accent/20 text-accent-foreground';
      case 'drill': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeName = (type: string) => {
    if (isHindi) {
      switch (type) {
        case 'test': return 'टेस्ट';
        case 'exam': return 'परीक्षा';
        case 'game': return 'गेम';
        case 'lesson': return 'पाठ';
        case 'drill': return 'ड्रिल';
        default: return type;
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString(isHindi ? 'hi-IN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const handleClearHistory = () => {
    localStorage.removeItem('typing_progress');
    toast({
      title: isHindi ? "इतिहास साफ हो गया" : "History Cleared",
      description: isHindi ? "आपका सभी प्रगति डेटा साफ कर दिया गया है" : "All your progress data has been cleared",
    });
    setShowClearDialog(false);
    window.location.reload();
  };

  // Group tests by date
  const groupedByDate: Record<string, TestRecord[]> = {};
  filteredTests.forEach(test => {
    const dateKey = new Date(test.timestamp).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(test);
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Full Typing History — Complete Test Records" description="View complete typing test history with WPM, accuracy and timestamps." keywords="typing history, typing records" breadcrumbs={[{name:"Home",path:"/"},{name:"Full History",path:"/full-history"}]} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isHindi ? "पूर्ण इतिहास" : "Full History"}
                </h1>
                <p className="text-muted-foreground">
                  {isHindi ? `कुल ${progress.tests.length} रिकॉर्ड` : `Total ${progress.tests.length} records`}
                </p>
              </div>
            </div>
            {progress.tests.length > 0 && (
              <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isHindi ? "सब साफ करें" : "Clear All"}
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    <Filter className="h-4 w-4 inline mr-2" />
                    {isHindi ? "फ़िल्टर" : "Filter"}
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isHindi ? "सभी" : "All"}</SelectItem>
                      <SelectItem value="test">{isHindi ? "टेस्ट" : "Test"}</SelectItem>
                      <SelectItem value="exam">{isHindi ? "परीक्षा" : "Exam"}</SelectItem>
                      <SelectItem value="game">{isHindi ? "गेम" : "Game"}</SelectItem>
                      <SelectItem value="lesson">{isHindi ? "पाठ" : "Lesson"}</SelectItem>
                      <SelectItem value="drill">{isHindi ? "ड्रिल" : "Drill"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    {isHindi ? "क्रमबद्ध करें" : "Sort By"}
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{isHindi ? "नवीनतम पहले" : "Newest First"}</SelectItem>
                      <SelectItem value="oldest">{isHindi ? "पुराना पहले" : "Oldest First"}</SelectItem>
                      <SelectItem value="wpm-high">{isHindi ? "उच्च WPM" : "Highest WPM"}</SelectItem>
                      <SelectItem value="wpm-low">{isHindi ? "निम्न WPM" : "Lowest WPM"}</SelectItem>
                      <SelectItem value="accuracy-high">{isHindi ? "उच्च सटीकता" : "Highest Accuracy"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History List */}
          {filteredTests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {isHindi ? "कोई इतिहास नहीं" : "No History"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isHindi ? "अभी तक कोई रिकॉर्ड नहीं है" : "No records found yet"}
                </p>
                <Button onClick={() => navigate("/typing-test")}>
                  {isHindi ? "टेस्ट शुरू करें" : "Start Test"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, tests]) => (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      {date}
                    </CardTitle>
                    <CardDescription>
                      {isHindi ? `${tests.length} रिकॉर्ड` : `${tests.length} record${tests.length > 1 ? 's' : ''}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{isHindi ? "समय" : "Time"}</TableHead>
                            <TableHead>{isHindi ? "प्रकार" : "Type"}</TableHead>
                            <TableHead>{isHindi ? "शीर्षक" : "Title"}</TableHead>
                            <TableHead className="text-center">WPM</TableHead>
                            <TableHead className="text-center">{isHindi ? "सटीकता" : "Accuracy"}</TableHead>
                            <TableHead className="text-center">{isHindi ? "अवधि" : "Duration"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tests.map((test) => {
                            const { time } = formatDateTime(test.timestamp);
                            return (
                              <TableRow key={test.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    {time}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getTypeColor(test.type)} variant="secondary">
                                    {getTypeName(test.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {test.title || test.testName || (isHindi ? "टाइपिंग टेस्ट" : "Typing Test")}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <span className="font-bold">{test.wpm}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Target className="h-4 w-4 text-success" />
                                    <span className="font-bold text-success">{test.accuracy}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {test.duration ? `${Math.round(test.duration)}s` : '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isHindi ? "क्या आप सुनिश्चित हैं?" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isHindi
                ? "यह सभी इतिहास और प्रगति डेटा को स्थायी रूप से हटा देगा।"
                : "This will permanently delete all history and progress data."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isHindi ? "रद्द करें" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isHindi ? "हां, साफ करें" : "Yes, Clear All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FullHistory;
