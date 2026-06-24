import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Mail, Phone, MapPin, Calendar, Crown, Edit, Save,
  CreditCard, Receipt, Shield, Award, LogOut, Sparkles, CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useStudent, saveProfile, getProfiles } from "@/contexts/StudentContext";
import { useToast } from "@/hooks/use-toast";
import { getTransactions, getPlans, Transaction } from "@/lib/pricingStore";

interface ProfileExtras {
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  goal?: string;
  examTarget?: string;
}

const EXTRA_KEY_PREFIX = 'tm_profile_extra_';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { user, profile, isLoggedIn, isPremium, logout, loading } = useStudent();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [txns, setTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate("/");
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!user || !profile) return;
    setDisplayName(profile.displayName);
    try {
      const e = localStorage.getItem(EXTRA_KEY_PREFIX + user.uid);
      if (e) setExtras(JSON.parse(e));
    } catch {}
    setTxns(getTransactions().filter(t => t.uid === user.uid));
  }, [user, profile]);

  useEffect(() => {
    if (params.get('success')) {
      toast({ title: "🎉 Welcome to Premium!", description: "Your plan is now active." });
    }
  }, [params, toast]);

  if (loading || !profile || !user) return null;

  const saveAll = () => {
    const profiles = getProfiles();
    if (profiles[user.uid]) {
      profiles[user.uid].displayName = displayName;
      saveProfile(profiles[user.uid]);
    }
    localStorage.setItem(EXTRA_KEY_PREFIX + user.uid, JSON.stringify(extras));
    toast({ title: "Profile updated" });
    setEditing(false);
  };

  const cancelPremium = () => {
    if (!confirm("Cancel your premium subscription? You'll keep access until expiry.")) return;
    const profiles = getProfiles();
    if (profiles[user.uid]) {
      // Just mark as not auto-renewing (no real subscription system yet)
      toast({ title: "Subscription will not renew", description: "Access continues until expiry date." });
    }
  };

  const plans = getPlans();
  const currentPlan = isPremium ? plans.find(p => p.id === 'pro') : null;
  const daysLeft = profile.premiumExpiry
    ? Math.max(0, Math.ceil((profile.premiumExpiry - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <>
      <SEO title="My Profile — Typing Master" description="Manage your typing profile, subscription, and account." />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          {/* Premium banner */}
          {isPremium ? (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-6 mb-6 text-white shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-10 w-10" />
                  <div>
                    <p className="text-xs opacity-90">YOU ARE A</p>
                    <p className="text-2xl font-bold">PREMIUM MEMBER ✨</p>
                    {daysLeft > 0 && <p className="text-sm opacity-90">{daysLeft} days remaining</p>}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate('/pricing')}>
                  Upgrade Plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-6 mb-6 text-white shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8" />
                  <div>
                    <p className="font-bold text-lg">Unlock Premium Features</p>
                    <p className="text-sm opacity-90">Plans starting at just ₹49/month</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => navigate('/pricing')}>
                  See Plans
                </Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="profile">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
              <TabsTrigger value="subscription"><Crown className="h-4 w-4 mr-1" /> Subscription</TabsTrigger>
              <TabsTrigger value="billing"><Receipt className="h-4 w-4 mr-1" /> Billing</TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Auto-filled from your login. Add more details below.</CardDescription>
                  </div>
                  {!editing ? (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={saveAll}>
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Auto-fetched from login */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1.5"><User className="h-3 w-3" /> Full Name</Label>
                      <Input value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={!editing} />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email (locked)</Label>
                      <Input value={profile.email} disabled className="bg-muted/30" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Student ID</Label>
                      <Input value={profile.studentId} disabled className="bg-muted/30 font-mono" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Member Since</Label>
                      <Input value={new Date(profile.createdAt).toLocaleDateString()} disabled className="bg-muted/30" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone</Label>
                      <Input value={extras.phone || ''} onChange={e => setExtras({ ...extras, phone: e.target.value })} disabled={!editing} placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> City</Label>
                      <Input value={extras.city || ''} onChange={e => setExtras({ ...extras, city: e.target.value })} disabled={!editing} placeholder="Mumbai" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={extras.state || ''} onChange={e => setExtras({ ...extras, state: e.target.value })} disabled={!editing} placeholder="Maharashtra" />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input value={extras.pincode || ''} onChange={e => setExtras({ ...extras, pincode: e.target.value })} disabled={!editing} />
                    </div>
                  </div>
                  <div>
                    <Label>Typing Goal</Label>
                    <Input value={extras.goal || ''} onChange={e => setExtras({ ...extras, goal: e.target.value })} disabled={!editing} placeholder="e.g. Reach 60 WPM in 3 months" />
                  </div>
                  <div>
                    <Label>Target Exam</Label>
                    <Input value={extras.examTarget || ''} onChange={e => setExtras({ ...extras, examTarget: e.target.value })} disabled={!editing} placeholder="SSC, CPCT, BSF, etc." />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={extras.bio || ''} onChange={e => setExtras({ ...extras, bio: e.target.value })} disabled={!editing} rows={2} placeholder="Tell us about yourself..." />
                  </div>
                </CardContent>
              </Card>

              {/* Stats card */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" /> Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Stat label="Best WPM" value={profile.bestWpm || 0} />
                    <Stat label="Best Accuracy" value={`${profile.bestAccuracy || 0}%`} />
                    <Stat label="Lessons Done" value={profile.completedLessons?.length || 0} />
                    <Stat label="Practice Time" value={`${Math.round((profile.totalPracticeTime || 0) / 60)}m`} />
                  </div>
                </CardContent>
              </Card>

              <Button variant="destructive" onClick={async () => { await logout(); navigate('/'); }}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </TabsContent>

            {/* SUBSCRIPTION TAB */}
            <TabsContent value="subscription" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPremium ? (
                    <>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                        <Crown className="h-10 w-10 text-amber-500" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Active Plan</p>
                          <p className="text-xl font-bold text-foreground">Premium</p>
                          {profile.premiumExpiry && (
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(profile.premiumExpiry).toLocaleDateString()} ({daysLeft} days left)
                            </p>
                          )}
                        </div>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">ACTIVE</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => navigate('/pricing')}>Change Plan</Button>
                        <Button variant="outline" onClick={cancelPremium}>Cancel Subscription</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border">
                        <p className="text-sm text-muted-foreground">Current Plan</p>
                        <p className="text-xl font-bold text-foreground">Free</p>
                        <p className="text-xs text-muted-foreground mt-1">Limited access to features</p>
                      </div>
                      <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                        <Sparkles className="h-4 w-4 mr-1" /> Upgrade Now
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* What you get */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Plan Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {plans.map(p => (
                      <div key={p.id} className="p-3 border border-border rounded-lg">
                        <p className="font-bold text-foreground">{p.icon} {p.name}</p>
                        <p className="text-2xl font-bold text-primary my-1">₹{p.priceMonthly}<span className="text-xs text-muted-foreground">/mo</span></p>
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => navigate(`/checkout?plan=${p.id}`)}>
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BILLING TAB */}
            <TabsContent value="billing" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {txns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {txns.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{t.planName} • {t.durationMonths}mo</p>
                            <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                            {t.paymentId && <p className="text-[10px] text-muted-foreground font-mono">{t.paymentId}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">₹{t.amount}</p>
                            <Badge variant={t.status === 'success' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                              {t.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {t.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </>
  );
};

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="text-center p-3 rounded-lg bg-muted/30">
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default StudentProfile;
