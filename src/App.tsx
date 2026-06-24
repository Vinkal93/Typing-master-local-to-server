import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { FontProvider } from "./contexts/FontContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminProvider } from "./contexts/AdminContext";
import { StudentProvider } from "./contexts/StudentContext";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { trackPageView } from "./lib/analyticsTracker";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import TypingTest from "./pages/TypingTest";
import Lessons from "./pages/Lessons";
import PracticeMode from "./pages/PracticeMode";
import ExamMode from "./pages/ExamMode";
import ExamHistory from "./pages/ExamHistory";
import Games from "./pages/Games";
import Progress from "./pages/Progress";
import FullHistory from "./pages/FullHistory";
import KeyboardGuide from "./pages/KeyboardGuide";
import AboutDeveloper from "./pages/AboutDeveloper";
import FastTrack from "./pages/FastTrack";
import SmartPractice from "./pages/SmartPractice";
import FingerHeatmap from "./pages/FingerHeatmap";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import ErrorAnalysis from "./pages/ErrorAnalysis";
import CPCTMock from "./pages/CPCTMock";
import SportMode from "./pages/SportMode";
import NotFound from "./pages/NotFound";
import TypingPractice from "./pages/TypingPractice";
import OneMinuteTypingTest from "./pages/OneMinuteTypingTest";
import ThreeMinuteTypingTest from "./pages/ThreeMinuteTypingTest";
import FiveMinuteTypingTest from "./pages/FiveMinuteTypingTest";
import HindiTypingTest from "./pages/HindiTypingTest";
import EnglishTypingTest from "./pages/EnglishTypingTest";
import WpmCalculator from "./pages/WpmCalculator";
import AccuracyCalculator from "./pages/AccuracyCalculator";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Disclaimer from "./pages/Disclaimer";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoursePage from "./pages/CoursePage";
import LessonPractice from "./pages/LessonPractice";
import AdvancedExamMode from "./pages/AdvancedExamMode";
import SeoStatus from "./pages/SeoStatus";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import StudentProfile from "./pages/StudentProfile";

const queryClient = new QueryClient();

// Analytics tracker component
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <AnalyticsTracker />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/typing-test" element={<TypingTest />} />
      <Route path="/typing-practice" element={<TypingPractice />} />
      <Route path="/1-minute-typing-test" element={<OneMinuteTypingTest />} />
      <Route path="/3-minute-typing-test" element={<ThreeMinuteTypingTest />} />
      <Route path="/5-minute-typing-test" element={<FiveMinuteTypingTest />} />
      <Route path="/hindi-typing-test" element={<HindiTypingTest />} />
      <Route path="/english-typing-test" element={<EnglishTypingTest />} />
      <Route path="/wpm-calculator" element={<WpmCalculator />} />
      <Route path="/accuracy-calculator" element={<AccuracyCalculator />} />
      <Route path="/lessons" element={<Lessons />} />
      <Route path="/practice" element={<PracticeMode />} />
      <Route path="/exam" element={<ExamMode />} />
      <Route path="/exam-history" element={<ExamHistory />} />
      <Route path="/games" element={<Games />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/full-history" element={<FullHistory />} />
      <Route path="/keyboard-guide" element={<KeyboardGuide />} />
      <Route path="/about-developer" element={<AboutDeveloper />} />
      <Route path="/fast-track" element={<FastTrack />} />
      <Route path="/smart-practice" element={<SmartPractice />} />
      <Route path="/finger-heatmap" element={<FingerHeatmap />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/error-analysis" element={<ErrorAnalysis />} />
      <Route path="/cpct-mock" element={<CPCTMock />} />
      <Route path="/sport-mode" element={<SportMode />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/course" element={<CoursePage />} />
      <Route path="/lesson/:lessonId" element={<LessonPractice />} />
      <Route path="/advanced-exam" element={<AdvancedExamMode />} />
      <Route path="/seo-status" element={<SeoStatus />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <FontProvider>
          <AdminProvider>
            <StudentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider defaultOpen={false}>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-x-hidden">
                      <AppRoutes />
                    </main>
                  </div>
                </SidebarProvider>
              </BrowserRouter>
            </TooltipProvider>
            </StudentProvider>
          </AdminProvider>
        </FontProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
