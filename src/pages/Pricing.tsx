import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Sparkles, Crown, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getPlans, getOffers } from "@/lib/pricingStore";
import { useStudent } from "@/contexts/StudentContext";

const Pricing = () => {
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useStudent();
  const [months, setMonths] = useState<number>(1);
  const plans = getPlans();
  const offers = getOffers().filter(o => o.active);

  const handleSelect = (planId: string) => {
    if (!isLoggedIn) {
      navigate(`/checkout?plan=${planId}&months=${months}&login=1`);
      return;
    }
    navigate(`/checkout?plan=${planId}&months=${months}`);
  };

  const multiDiscountLabel = (m: number) =>
    m >= 12 ? 'Save 25%' : m >= 6 ? 'Save 15%' : m >= 3 ? 'Save 8%' : '';

  return (
    <>
      <SEO
        title="Pricing — Typing Master Premium Plans by Vinkal Prajapati"
        description="Affordable typing premium plans starting at ₹49/month. Unlock advanced exam mode, AI drills, certificates and more for SSC, BSF, CPCT preparation."
       
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-10">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> Limited Launch Pricing
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              Choose Your Typing Journey
            </h1>
            <p className="text-muted-foreground text-lg">
              Unlock premium features and ace your typing exams. Cancel anytime.
            </p>
          </div>

          {/* Offer banners */}
          {offers.map(o => (
            <div
              key={o.id}
              className={`bg-gradient-to-r ${o.bannerColor} text-white rounded-xl p-4 mb-6 text-center shadow-lg`}
            >
              <p className="font-bold text-lg">{o.title}</p>
              <p className="text-sm opacity-90">{o.description}</p>
            </div>
          ))}

          {/* Billing cycle */}
          <div className="flex justify-center mb-8">
            <Tabs value={String(months)} onValueChange={v => setMonths(Number(v))}>
              <TabsList>
                <TabsTrigger value="1">1 Month</TabsTrigger>
                <TabsTrigger value="3">3 Months <Badge variant="secondary" className="ml-1 text-[10px]">-8%</Badge></TabsTrigger>
                <TabsTrigger value="6">6 Months <Badge variant="secondary" className="ml-1 text-[10px]">-15%</Badge></TabsTrigger>
                <TabsTrigger value="12">12 Months <Badge variant="secondary" className="ml-1 text-[10px]">-25%</Badge></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map(plan => {
              const isCurrent = profile?.plan === 'premium' && plan.id === 'pro';
              const totalBase = plan.priceMonthly * months;
              const monthLabel = months === 1 ? '/month' : ` total / ${months}mo`;
              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? 'border-violet-500 shadow-2xl shadow-violet-500/20'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 px-3 py-1">
                        🔥 MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl shadow-lg mb-2`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="text-center">
                      {plan.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{plan.originalPrice}/mo
                        </p>
                      )}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-foreground">₹{plan.priceMonthly}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      {months > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{totalBase}{monthLabel} • {multiDiscountLabel(months)}
                        </p>
                      )}
                    </div>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 text-white border-0'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => handleSelect(plan.id)}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Plan' : `Get ${plan.name}`}
                    </Button>

                    <div className="space-y-2 pt-2 border-t border-border">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          {f.included ? (
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                          )}
                          <span className={f.included ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            {[
              { icon: Shield, t: 'Secure Payment', s: 'Razorpay encrypted' },
              { icon: Zap, t: 'Instant Activation', s: 'No waiting' },
              { icon: Crown, t: '15-Day Refund', s: 'Hassle-free' },
              { icon: Sparkles, t: 'Cancel Anytime', s: 'No commitment' },
            ].map((b, i) => (
              <div key={i} className="text-center p-4 rounded-lg border border-border">
                <b.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm text-foreground">{b.t}</p>
                <p className="text-xs text-muted-foreground">{b.s}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-6">FAQ</h2>
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription anytime from your profile. No questions asked.' },
              { q: 'Is the payment secure?', a: 'All payments are processed through Razorpay with 256-bit SSL encryption.' },
              { q: 'Do I get a refund if not satisfied?', a: 'Yes, we offer 15-day money-back guarantee on all plans.' },
              { q: 'What payment methods are accepted?', a: 'UPI, Cards, Net Banking, Wallets — anything supported by Razorpay.' },
            ].map((f, i) => (
              <Card key={i} className="border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="font-semibold text-foreground mb-1">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
