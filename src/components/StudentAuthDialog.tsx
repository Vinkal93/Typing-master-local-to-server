import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudent } from "@/contexts/StudentContext";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Mail, Lock, UserPlus, LogIn, Copy, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentAuthDialog = () => {
  const { user, profile, isLoggedIn, signup, login, logout, loading } = useStudent();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPass);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setOpen(false);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPass.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSignupLoading(true);
    try {
      await signup(signupEmail, signupPass, signupName);
      toast({ title: "Account Created!", description: "Welcome to TypeMaster!" });
      setOpen(false);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup Failed", description: err.message || "Could not create account", variant: "destructive" });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out" });
    setOpen(false);
  };

  const copyId = () => {
    if (profile?.studentId) {
      navigator.clipboard.writeText(profile.studentId);
      toast({ title: "Copied!", description: `Student ID: ${profile.studentId}` });
    }
  };

  if (loading) return null;

  if (isLoggedIn && profile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{profile.displayName}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{profile.displayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Student ID</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-primary">{profile.studentId}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className={`text-sm font-medium ${profile.plan === 'premium' ? 'text-primary' : 'text-muted-foreground'}`}>
                  {profile.plan === 'premium' ? '⭐ Premium' : 'Free'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lessons Done</span>
                <span className="font-medium text-foreground">{profile.completedLessons.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/profile"); }}>
                My Profile
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/pricing"); }}>
                Upgrade
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Student Login</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Portal</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login"><LogIn className="h-3.5 w-3.5 mr-1" /> Login</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus className="h-3.5 w-3.5 mr-1" /> Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3 mt-3">
              <div>
                <Label>Email or Student ID</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="email@example.com or TM-XXXXXX" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    className="pl-10" required 
                  />
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" placeholder="••••••••" 
                    value={loginPass} onChange={e => setLoginPass(e.target.value)} 
                    className="pl-10" required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-3 mt-3">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Your Name" value={signupName} onChange={e => setSignupName(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" placeholder="email@example.com" 
                    value={signupEmail} onChange={e => setSignupEmail(e.target.value)} 
                    className="pl-10" required 
                  />
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" placeholder="Min 6 characters" 
                    value={signupPass} onChange={e => setSignupPass(e.target.value)} 
                    className="pl-10" required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={signupLoading}>
                {signupLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                A unique Student ID will be assigned to you after signup
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAuthDialog;
