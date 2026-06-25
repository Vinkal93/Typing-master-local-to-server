import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, CheckCircle2, ArrowLeft, Tag, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  getPlan, calcPrice, getRazorpayConfig, loadRazorpayScript,
  saveTransaction, updateTransaction, Transaction, PlanTier
} from "@/lib/pricingStore";
import { useStudent } from "@/contexts/StudentContext";
import { saveProfile, getProfiles } from "@/contexts/StudentContext";

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, profile, user } = useStudent();

  const planId = (params.get("plan") || "pro") as PlanTier;
  const [months, setMonths] = useState<number>(Number(params.get("months") || 1));
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const plan = getPlan(planId);
  const rzpConfig = getRazorpayConfig();

  const price = useMemo(() => plan ? calcPrice(plan, months, appliedCoupon) : null, [plan, months, appliedCoupon]);

  useEffect(() => {
    if (!plan) navigate("/pricing");
  }, [plan, navigate]);

  if (!plan || !price) return null;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
    const p = calcPrice(plan, months, code);
    if (p.couponMsg && p.discount > 0) {
      toast({ title: "Coupon applied!", description: p.couponMsg });
    } else {
      toast({ title: "Coupon error", description: p.couponMsg || 'Invalid coupon', variant: 'destructive' });
      setAppliedCoupon("");
    }
  };

  const handlePay = async () => {
    if (!isLoggedIn || !profile || !user) {
      toast({ title: "Please login first", description: "Login or sign up to continue", variant: 'destructive' });
      return;
    }
    if (!rzpConfig.enabled || !rzpConfig.keyId) {
      toast({
        title: "Payment gateway not configured",
        description: "Admin must configure Razorpay keys in admin panel.",
        variant: 'destructive',
      });
      return;
    }
    setProcessing(true);
    const ok = await loadRazorpayScript();
    if (!ok) {
      toast({ title: "Failed to load payment gateway", variant: 'destructive' });
      setProcessing(false);
      return;
    }

    const txn: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      uid: user.uid,
      studentId: profile.studentId,
      email: profile.email,
      displayName: profile.displayName,
      planId: plan.id,
      planName: plan.name,
      amount: price.total,
      originalAmount: price.base,
      discount: price.discount + price.multiDiscount,
      couponCode: appliedCoupon || undefined,
      status: 'pending',
      createdAt: Date.now(),
      durationMonths: months,
      expiryAt: Date.now() + months * 30 * 24 * 60 * 60 * 1000,
      mode: 'razorpay',
    };
    saveTransaction(txn);

    const options: any = {
      key: rzpConfig.keyId,
      amount: price.total * 100, // paise
      currency: "INR",
      name: rzpConfig.merchantName,
      description: `${plan.name} Plan • ${months} month${months > 1 ? 's' : ''}`,
      image: rzpConfig.merchantLogo || '/favicon.png',
      prefill: {
        name: profile.displayName,
        email: profile.email,
      },
      notes: {
        student_id: profile.studentId,
        plan: plan.id,
        months: String(months),
      },
      theme: { color: rzpConfig.themeColor || '#8b5cf6' },
      handler: async (resp: any) => {
        // 🔐 Signature verification — only upgrade after success
        const { verifyPaymentSignature } = await import('@/lib/razorpayVerify');
        const verify = await verifyPaymentSignature({
          orderId: resp.razorpay_order_id,
          paymentId: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
          keySecret: rzpConfig.keySecret,
        });

        updateTransaction(txn.id, {
          status: verify.ok ? 'success' : 'failed',
          paymentId: resp.razorpay_payment_id,
          orderId: resp.razorpay_order_id,
          signature: resp.razorpay_signature,
          verified: verify.ok,
          verificationNote: verify.reason,
        });

        if (!verify.ok) {
          toast({
            title: 'Payment verification failed',
            description: verify.reason || 'Signature mismatch. Plan not activated.',
            variant: 'destructive',
          });
          setProcessing(false);
          return;
        }

        // ✅ Verified — upgrade profile
        const profiles = getProfiles();
        if (profiles[user.uid]) {
          profiles[user.uid].plan = 'premium';
          profiles[user.uid].status = 'premium';
          profiles[user.uid].premiumExpiry = txn.expiryAt;
          saveProfile(profiles[user.uid]);
        }
        toast({
          title: '🎉 Payment Verified & Activated!',
          description: `${plan.name} plan active for ${months} month(s)`,
        });
        navigate(`/profile?success=1&txn=${txn.id}`);
      },
      modal: {
        ondismiss: () => {
          updateTransaction(txn.id, { status: 'failed' });
          setProcessing(false);
          toast({ title: "Payment cancelled" });
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        updateTransaction(txn.id, { status: 'failed' });
        toast({ title: "Payment failed", description: resp.error?.description || 'Try again', variant: 'destructive' });
        setProcessing(false);
      });
      rzp.open();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: 'destructive' });
      setProcessing(false);
    }
  };

  return (
    <>
      <SEO title={`Checkout — ${plan.name} Plan`} description="Secure checkout for Typing Master premium plans." />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Plans
          </Button>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Order details */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Secure Checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan card */}
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Selected Plan</p>
                        <p className="text-2xl font-bold">{plan.icon} {plan.name}</p>
                        <p className="text-xs opacity-80 mt-1">{plan.tagline}</p>
                      </div>
                      <Badge className="bg-white/20 backdrop-blur border-white/30 text-white">
                        ₹{plan.priceMonthly}/mo
                      </Badge>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="mb-2 block">Billing Duration</Label>
                    <Tabs value={String(months)} onValueChange={v => setMonths(Number(v))}>
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="1">1 Mo</TabsTrigger>
                        <TabsTrigger value="3">3 Mo</TabsTrigger>
                        <TabsTrigger value="6">6 Mo</TabsTrigger>
                        <TabsTrigger value="12">12 Mo</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Customer */}
                  {isLoggedIn && profile ? (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                      <p className="text-xs text-muted-foreground">Billing Account</p>
                      <p className="text-sm font-semibold text-foreground">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                      <p className="text-xs text-muted-foreground">ID: {profile.studentId}</p>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-yellow-500/50 rounded-lg bg-yellow-500/5">
                      <p className="text-sm font-medium text-foreground mb-2">⚠ Please login to continue</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        You must be signed in as a student to purchase a plan.
                      </p>
                    </div>
                  )}

                  {/* Coupon */}
                  <div>
                    <Label className="mb-2 flex items-center gap-1.5 text-sm">
                      <Tag className="h-3.5 w-3.5" /> Have a coupon code?
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="WELCOME20"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <Button variant="outline" onClick={() => { setAppliedCoupon(""); setCouponInput(""); }}>
                          Remove
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                      )}
                    </div>
                    {appliedCoupon && price.discount > 0 && (
                      <p className="text-xs text-green-500 mt-1.5">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                        {appliedCoupon} applied — saved ₹{price.discount}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { i: Shield, t: 'Razorpay Secure' },
                  { i: Lock, t: '256-bit SSL' },
                  { i: ShieldCheck, t: '15-day Refund' },
                ].map((b, i) => (
                  <div key={i} className="text-center p-3 border border-border rounded-lg">
                    <b.i className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{b.t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <Card className="border-border sticky top-20">
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{plan.name} × {months}mo</span>
                    <span className="text-foreground">₹{price.base}</span>
                  </div>
                  {price.multiDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Multi-month discount</span>
                      <span className="text-green-500">−₹{price.multiDiscount}</span>
                    </div>
                  )}
                  {price.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Coupon ({appliedCoupon})</span>
                      <span className="text-green-500">−₹{price.discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{price.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="text-foreground">₹{price.gst}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">₹{price.total}</span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 text-white border-0 mt-2"
                    onClick={handlePay}
                    disabled={processing || !isLoggedIn}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : `Pay ₹${price.total} Securely`}
                  </Button>

                  {!rzpConfig.enabled && (
                    <p className="text-[11px] text-yellow-500 text-center">
                      ⚠ Payment gateway is not yet configured by admin
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground text-center">
                    By proceeding you agree to our <a href="/terms-and-conditions" className="underline">Terms</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;
