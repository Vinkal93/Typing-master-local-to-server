import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  Users, Eye, Monitor, Smartphone, Tablet, Globe, TrendingUp,
  FileText, LogOut, Shield, Activity, MousePointer, ArrowUpRight,
  PenTool, Plus, Save, Trash2, Search, CheckCircle, AlertCircle,
  GraduationCap, Crown, Ban, UserCheck, DollarSign, Settings,
  CreditCard, Clock, Mail, Key, RefreshCw
} from "lucide-react";
import {
  getAnalyticsData, getLiveVisitors, getTodayVisits,
  getTopPages, getTrafficSources, getDailyVisitsChart, clearAnalytics, AnalyticsData
} from "@/lib/analyticsTracker";
import { blogPosts as defaultBlogPosts } from "@/lib/blogData";
import { curriculum, getTotalLessons } from "@/lib/curriculumData";
import { StudentProfile, getProfiles, saveProfile, saveAllProfiles } from "@/contexts/StudentContext";
import { AdvancedBlogEditor } from "@/components/admin/AdvancedBlogEditor";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { AdminBlog as StoredBlog, getAdminBlogs as getStoredBlogs, deleteAdminBlog, analyzeSeo, getViews } from "@/lib/adminBlogStore";

const COLORS = [
  'hsl(198, 93%, 60%)', 'hsl(24, 95%, 53%)', 'hsl(142, 71%, 45%)',
  'hsl(280, 65%, 60%)', 'hsl(340, 82%, 52%)', 'hsl(45, 93%, 47%)',
];

const AdminDashboard = () => {
  const { user, logout, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'active' | 'premium' | 'suspended'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Blog state
  const [adminBlogs, setAdminBlogs] = useState<StoredBlog[]>(getStoredBlogs());
  const [editingBlog, setEditingBlog] = useState<StoredBlog | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');

  // Mediapicker callback for editor
  const [mediaPickerCb, setMediaPickerCb] = useState<((url: string) => void) | null>(null);

  // SEO checker state
  const [seoUrl, setSeoUrl] = useState("");
  const [seoResults, setSeoResults] = useState<{label: string; status: 'good'|'warning'|'error'; message: string}[]>([]);

  const loadStudents = () => {
    const profiles = getProfiles();
    setStudents(Object.values(profiles));
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin");
      return;
    }
    const loadData = () => {
      setAnalytics(getAnalyticsData());
      setLiveVisitors(getLiveVisitors());
      setTodayVisits(getTodayVisits());
      loadStudents();
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-foreground">Loading...</div>;
  if (!isAdmin) return null;

  const topPages = getTopPages(10);
  const trafficSources = getTrafficSources();
  const dailyChart = getDailyVisitsChart(30);
  const deviceData = analytics ? Object.entries(analytics.devices).map(([name, value]) => ({ name, value })) : [];
  const browserData = analytics ? Object.entries(analytics.browsers).map(([name, value]) => ({ name, value })) : [];
  const osData = analytics ? Object.entries(analytics.os).map(([name, value]) => ({ name, value })) : [];

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  // Student management
  const updateStudentStatus = (uid: string, status: StudentProfile['status']) => {
    const profiles = getProfiles();
    if (profiles[uid]) {
      profiles[uid].status = status;
      if (status === 'premium') {
        profiles[uid].plan = 'premium';
      }
      saveAllProfiles(profiles);
      loadStudents();
    }
  };

  const activatePremium = (uid: string, months: number) => {
    const profiles = getProfiles();
    if (profiles[uid]) {
      profiles[uid].status = 'premium';
      profiles[uid].plan = 'premium';
      profiles[uid].premiumExpiry = Date.now() + (months * 30 * 24 * 60 * 60 * 1000);
      saveAllProfiles(profiles);
      loadStudents();
    }
  };

  const deleteStudent = (uid: string) => {
    const profiles = getProfiles();
    delete profiles[uid];
    saveAllProfiles(profiles);
    loadStudents();
  };

  const filteredStudents = students.filter(s => {
    if (studentFilter !== 'all' && s.status !== studentFilter) return false;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      return s.displayName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    }
    return true;
  });

  // Blog management
  const reloadBlogs = () => setAdminBlogs(getStoredBlogs());

  const startNewBlog = () => { setEditingBlog(null); setShowEditor(true); };
  const editBlog = (blog: StoredBlog) => { setEditingBlog(blog); setShowEditor(true); };
  const removeBlog = (slug: string) => { deleteAdminBlog(slug); reloadBlogs(); };

  const filteredBlogs = adminBlogs.filter(b => blogStatusFilter === 'all' || b.status === blogStatusFilter);
  const blogStats = {
    total: adminBlogs.length,
    drafts: adminBlogs.filter(b => b.status === 'draft').length,
    published: adminBlogs.filter(b => b.status === 'published').length,
    scheduled: adminBlogs.filter(b => b.status === 'scheduled').length,
    totalViews: Object.values(getViews()).reduce((a, b) => a + b, 0),
  };

  // SEO checker
  const runSeoCheck = () => {
    const stored = adminBlogs.find(b => b.slug === seoUrl);
    if (stored) {
      const r = analyzeSeo(stored);
      setSeoResults([
        { label: 'SEO Score', status: r.score >= 80 ? 'good' : r.score >= 50 ? 'warning' : 'error', message: `${r.score}/100 (${r.grade})` },
        ...r.checks.map(c => ({ label: c.label, status: c.status, message: c.message })),
      ]);
      return;
    }
    const page = defaultBlogPosts.find(p => p.slug === seoUrl);
    if (!page) {
      setSeoResults([{ label: 'Page Found', status: 'error', message: 'No blog with this slug' }]);
      return;
    }
    const r = analyzeSeo({ title: page.title, description: page.description, content: page.content, focusKeyword: page.keywords[0] || '', metaTitle: page.title });
    setSeoResults([
      { label: 'SEO Score', status: r.score >= 80 ? 'good' : r.score >= 50 ? 'warning' : 'error', message: `${r.score}/100 (${r.grade})` },
      ...r.checks.map(c => ({ label: c.label, status: c.status, message: c.message })),
    ]);
  };


  const allBlogs = [...defaultBlogPosts.map(b => ({ ...b, status: 'published' as const, createdAt: new Date(b.date).getTime(), updatedAt: new Date(b.date).getTime(), views: 0, keywords: b.keywords.join(', ') })), ...adminBlogs];

  const premiumStudents = students.filter(s => s.plan === 'premium');
  const pendingStudents = students.filter(s => s.status === 'pending');
  const activeStudents = students.filter(s => (s.completedLessons?.length || 0) > 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowUpRight className="h-4 w-4 mr-1" /> View Site
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Activity, label: 'Live Visitors', value: liveVisitors, color: 'text-[hsl(142,71%,45%)]' },
            { icon: Eye, label: "Today's Visits", value: todayVisits, color: 'text-primary' },
            { icon: Users, label: 'Total Students', value: students.length, color: 'text-foreground' },
            { icon: Clock, label: 'Pending', value: pendingStudents.length, color: 'text-[hsl(45,80%,50%)]' },
            { icon: Crown, label: 'Premium', value: premiumStudents.length, color: 'text-[hsl(45,80%,50%)]' },
            { icon: MousePointer, label: 'Page Views', value: analytics?.totalVisits || 0, color: 'text-foreground' },
          ].map((stat, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} /> {stat.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            {['overview', 'students', 'payments', 'blogs', 'media', 'seo', 'analytics', 'settings'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize">{tab}</TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="border-border">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Daily Traffic (30 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stroke="hsl(198, 93%, 60%)" fill="hsl(198, 93%, 60%)" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topPages.slice(0, 8).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-foreground truncate max-w-[60%]">{p.page || '/'}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-primary/20 rounded-full w-16">
                            <div className="h-2 bg-primary rounded-full" style={{ width: `${topPages.length > 0 ? (p.views / topPages[0].views) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium text-foreground w-8 text-right">{p.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trafficSources.map((t, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{t.source}</span>
                        <span className="text-sm font-medium text-foreground">{t.count}</span>
                      </div>
                    ))}
                    {trafficSources.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Management */}
          <TabsContent value="students" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Input 
                placeholder="Search by name, email, or ID..." 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)} 
                className="max-w-xs"
              />
              {(['all', 'pending', 'active', 'premium', 'suspended'] as const).map(f => (
                <Button key={f} variant={studentFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStudentFilter(f)} className="capitalize">
                  {f} {f === 'all' ? `(${students.length})` : f === 'pending' ? `(${pendingStudents.length})` : f === 'premium' ? `(${premiumStudents.length})` : ''}
                </Button>
              ))}
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{students.length}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-[hsl(45,80%,50%)]">{premiumStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{activeStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Active Learners</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.completedLessons?.length || 0), 0) / students.length) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Lessons/Student</p>
                </CardContent>
              </Card>
            </div>

            {/* Student Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Student Management
                </CardTitle>
                <CardDescription>{filteredStudents.length} students shown</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium text-muted-foreground">Student</th>
                          <th className="text-left py-2 px-2 font-medium text-muted-foreground">ID</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Plan</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Lessons</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Best WPM</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Accuracy</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Practice</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Last Login</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s) => {
                          const completed = s.completedLessons?.length || 0;
                          const total = getTotalLessons();
                          const pct = Math.round((completed / total) * 100);
                          const allL = curriculum.flatMap(l => l.lessons);
                          const nextL = allL.find(l => !(s.completedLessons || []).includes(l.id));
                          const currentLvl = nextL ? curriculum.find(lvl => lvl.lessons.some(l => l.id === nextL.id)) : null;

                          return (
                            <tr key={s.uid} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-2.5 px-2">
                                <p className="font-medium text-foreground">{s.displayName}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                              </td>
                              <td className="py-2.5 px-2">
                                <span className="font-mono text-xs text-primary">{s.studentId}</span>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <Badge variant={s.status === 'active' || s.status === 'premium' ? 'default' : s.status === 'suspended' ? 'destructive' : 'secondary'} className="text-[10px]">
                                  {s.status}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <Badge variant={s.plan === 'premium' ? 'default' : 'secondary'} className={`text-[10px] ${s.plan === 'premium' ? 'bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] text-white border-0' : ''}`}>
                                  {s.plan === 'premium' ? '⭐ Premium' : 'Free'}
                                </Badge>
                                {s.premiumExpiry && (
                                  <p className="text-[9px] text-muted-foreground mt-0.5">
                                    Exp: {new Date(s.premiumExpiry).toLocaleDateString()}
                                  </p>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <div className="flex items-center gap-1 justify-center">
                                  <span className="font-medium text-foreground text-xs">{completed}/{total}</span>
                                  <div className="h-1.5 bg-muted rounded-full w-12">
                                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                                <p className="text-[9px] text-muted-foreground">
                                  {currentLvl ? `${currentLvl.icon} ${currentLvl.title.split('—')[0].trim()}` : '🎉 Done'}
                                </p>
                              </td>
                              <td className="py-2.5 px-2 text-center font-medium text-foreground text-xs">{s.bestWpm || 0}</td>
                              <td className="py-2.5 px-2 text-center font-medium text-foreground text-xs">{s.bestAccuracy || 0}%</td>
                              <td className="py-2.5 px-2 text-center text-xs text-muted-foreground">
                                {Math.round((s.totalPracticeTime || 0) / 60)}m
                              </td>
                              <td className="py-2.5 px-2 text-center text-xs text-muted-foreground">
                                {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-2.5 px-2">
                                <div className="flex items-center gap-1 justify-center flex-wrap">
                                  {s.status === 'pending' && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateStudentStatus(s.uid, 'active')}>
                                      <UserCheck className="h-3 w-3 mr-1" /> Approve
                                    </Button>
                                  )}
                                  {s.status !== 'premium' && s.status !== 'suspended' && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-[hsl(45,70%,60%)]/50 text-[hsl(45,80%,45%)]" onClick={() => activatePremium(s.uid, 1)}>
                                      <Crown className="h-3 w-3 mr-1" /> 1M
                                    </Button>
                                  )}
                                  {s.status !== 'premium' && s.status !== 'suspended' && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-[hsl(45,70%,60%)]/50 text-[hsl(45,80%,45%)]" onClick={() => activatePremium(s.uid, 12)}>
                                      <Crown className="h-3 w-3 mr-1" /> 1Y
                                    </Button>
                                  )}
                                  {s.status !== 'suspended' && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-destructive" onClick={() => updateStudentStatus(s.uid, 'suspended')}>
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {s.status === 'suspended' && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateStudentStatus(s.uid, 'active')}>
                                      <RefreshCw className="h-3 w-3 mr-1" /> Reactivate
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1 text-destructive" onClick={() => deleteStudent(s.uid)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No students found</p>
                )}
              </CardContent>
            </Card>

            {/* Lesson Completion Chart */}
            {students.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Lesson Completion Overview</CardTitle>
                  <CardDescription>How many students completed each lesson</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={curriculum.flatMap(lvl => lvl.lessons).map(lesson => ({
                        name: `L${lesson.lessonNumber}`,
                        completed: students.filter(s => (s.completedLessons || []).includes(lesson.id)).length,
                        title: lesson.title,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis />
                        <Tooltip formatter={(value: any, _: any, props: any) => [`${value} students`, props.payload.title]} />
                        <Bar dataKey="completed" fill="hsl(198, 93%, 60%)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <DollarSign className="h-5 w-5 text-[hsl(142,71%,45%)] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{premiumStudents.length}</p>
                  <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <CreditCard className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">₹{premiumStudents.length * 499}</p>
                  <p className="text-xs text-muted-foreground">Estimated Revenue</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <Clock className="h-5 w-5 text-[hsl(45,80%,50%)] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">
                    {premiumStudents.filter(s => s.premiumExpiry && s.premiumExpiry < Date.now() + 7 * 24 * 60 * 60 * 1000).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expiring This Week</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Premium Students</CardTitle>
              </CardHeader>
              <CardContent>
                {premiumStudents.length > 0 ? (
                  <div className="space-y-2">
                    {premiumStudents.map(s => (
                      <div key={s.uid} className="flex items-center justify-between border-b border-border pb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.displayName}</p>
                          <p className="text-xs text-muted-foreground">{s.email} • {s.studentId}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gradient-to-r from-[hsl(45,80%,50%)] to-[hsl(30,80%,50%)] text-white border-0 text-[10px]">Premium</Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {s.premiumExpiry ? `Expires: ${new Date(s.premiumExpiry).toLocaleDateString()}` : 'Lifetime'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No premium students yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management */}
          <TabsContent value="blogs" className="space-y-4">
            {showEditor ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{editingBlog ? 'Edit Post' : 'Create New Post'}</h3>
                  <Button size="sm" variant="outline" onClick={() => { setShowEditor(false); reloadBlogs(); }}>← Back to Posts</Button>
                </div>
                <AdvancedBlogEditor
                  initial={editingBlog}
                  onSaved={() => { setShowEditor(false); setEditingBlog(null); reloadBlogs(); }}
                  onCancel={() => { setShowEditor(false); setEditingBlog(null); }}
                  onPickMedia={(cb) => setMediaPickerCb(() => cb)}
                />
                {mediaPickerCb && (
                  <Card className="border-primary">
                    <CardHeader><CardTitle className="text-sm">Pick Media</CardTitle></CardHeader>
                    <CardContent>
                      <MediaLibrary selectMode onSelect={(url) => { mediaPickerCb(url); setMediaPickerCb(null); }} />
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => setMediaPickerCb(null)}>Cancel</Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground">Blog Manager</h3>
                  <Button size="sm" onClick={startNewBlog}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Total', value: blogStats.total + defaultBlogPosts.length },
                    { label: 'Published', value: blogStats.published + defaultBlogPosts.length },
                    { label: 'Drafts', value: blogStats.drafts },
                    { label: 'Scheduled', value: blogStats.scheduled },
                    { label: 'Total Views', value: blogStats.totalViews },
                  ].map((s, i) => (
                    <Card key={i} className="border-border"><CardContent className="pt-4 pb-3 text-center">
                      <p className="text-xl font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                    </CardContent></Card>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['all', 'draft', 'published', 'scheduled'] as const).map(f => (
                    <Button key={f} size="sm" variant={blogStatusFilter === f ? 'default' : 'outline'} onClick={() => setBlogStatusFilter(f)} className="capitalize">{f}</Button>
                  ))}
                </div>

                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">Posts ({filteredBlogs.length})</CardTitle></CardHeader>
                  <CardContent>
                    {filteredBlogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">No posts yet. Click "New Post" to start writing.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-border text-left text-muted-foreground text-xs">
                            <th className="py-2 px-2">Title</th>
                            <th className="py-2 px-2">Status</th>
                            <th className="py-2 px-2">SEO</th>
                            <th className="py-2 px-2">Category</th>
                            <th className="py-2 px-2 text-center">Views</th>
                            <th className="py-2 px-2">Updated</th>
                            <th className="py-2 px-2 text-right">Actions</th>
                          </tr></thead>
                          <tbody>
                            {filteredBlogs.map(b => {
                              const seo = analyzeSeo(b);
                              const seoColor = seo.score >= 80 ? 'text-[hsl(142,71%,45%)]' : seo.score >= 50 ? 'text-[hsl(45,80%,50%)]' : 'text-destructive';
                              return (
                                <tr key={b.slug} className="border-b border-border/50 hover:bg-muted/30">
                                  <td className="py-2 px-2">
                                    <p className="font-medium text-foreground">{b.title || '(untitled)'}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">/blog/{b.slug}</p>
                                  </td>
                                  <td className="py-2 px-2">
                                    <Badge variant={b.status === 'published' ? 'default' : b.status === 'scheduled' ? 'outline' : 'secondary'} className="text-[10px]">{b.status}</Badge>
                                  </td>
                                  <td className={`py-2 px-2 font-bold ${seoColor}`}>{seo.score}</td>
                                  <td className="py-2 px-2 text-xs text-muted-foreground">{b.category}</td>
                                  <td className="py-2 px-2 text-center">{b.views || 0}</td>
                                  <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(b.updatedAt).toLocaleDateString()}</td>
                                  <td className="py-2 px-2 text-right">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`/blog/${b.slug}`, '_blank')} title="View"><Eye className="h-3 w-3" /></Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editBlog(b)} title="Edit"><PenTool className="h-3 w-3" /></Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeBlog(b.slug)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base">Built-in Posts ({defaultBlogPosts.length})</CardTitle><CardDescription>Default content shipped with the app</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {defaultBlogPosts.map(b => (
                        <div key={b.slug} className="flex items-center justify-between border-b border-border pb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                            <span className="text-xs text-muted-foreground">{b.category}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`/blog/${b.slug}`, '_blank')}><Eye className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Media Library */}
          <TabsContent value="media" className="space-y-4">
            <MediaLibrary />
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> SEO Checker</CardTitle>
                <CardDescription>Enter a blog slug to analyze SEO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={seoUrl} onChange={e => setSeoUrl(e.target.value)} placeholder="e.g. how-to-increase-typing-speed" />
                  <Button onClick={runSeoCheck}>Analyze</Button>
                </div>
                {seoResults.length > 0 && (
                  <div className="space-y-2">
                    {seoResults.map((r, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2">
                          {r.status === 'good' ? <CheckCircle className="h-4 w-4 text-[hsl(142,71%,45%)]" /> :
                           r.status === 'warning' ? <AlertCircle className="h-4 w-4 text-[hsl(45,80%,50%)]" /> :
                           <AlertCircle className="h-4 w-4 text-destructive" />}
                          <span className="text-sm font-medium text-foreground">{r.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{r.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4" /> Devices</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Browsers</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={browserData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Hourly Traffic</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Array.from({ length: 24 }, (_, i) => ({
                      hour: `${i}:00`,
                      visits: analytics?.hourlyVisits[i.toString()] || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="hsl(142, 71%, 45%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">OS Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={osData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {osData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Site Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Site Title</Label>
                    <Input defaultValue="TypeMaster — Free Typing Test & Practice" />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea defaultValue="Check your typing speed online with free typing tests. Practice Hindi and English typing with 1 minute, 3 minute and 5 minute tests." />
                  </div>
                  <div>
                    <Label>Google Analytics ID</Label>
                    <Input placeholder="G-XXXXXXXXXX" />
                  </div>
                  <div>
                    <Label>Google Site Verification</Label>
                    <Input defaultValue="ZIZF8DHa6f8B7MdWnHlDuqt87KaKwymg3zP2ibvG7DU" />
                  </div>
                </div>
                <Button><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => { clearAnalytics(); window.location.reload(); }}>
                  Clear Analytics Data
                </Button>
                <p className="text-xs text-muted-foreground">This will reset all traffic and visitor data.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
