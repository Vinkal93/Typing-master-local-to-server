import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getPlans, savePlans, getCoupons, saveCoupons, getOffers, saveOffers,
  getRazorpayConfig, saveRazorpayConfig, getTransactions,
  Coupon, Offer, PricingPlan, RazorpayConfig
} from "@/lib/pricingStore";
import { Plus, Trash2, Save, Tag, Megaphone, CreditCard, Eye, EyeOff, DollarSign, TrendingUp } from "lucide-react";

export const PlansManager = () => {
  const { toast } = useToast();
  const [plans, setPlansState] = useState<PricingPlan[]>(getPlans());
  const [coupons, setCouponsState] = useState<Coupon[]>(getCoupons());
  const [offers, setOffersState] = useState<Offer[]>(getOffers());
  const [rzp, setRzp] = useState<RazorpayConfig>(getRazorpayConfig());
  const [showSecret, setShowSecret] = useState(false);
  const txns = getTransactions();

  // ── plans ──
  const updatePlan = (idx: number, patch: Partial<PricingPlan>) => {
    const next = [...plans];
    next[idx] = { ...next[idx], ...patch };
    setPlansState(next);
  };
  const savePlansAll = () => { savePlans(plans); toast({ title: "Plans saved" }); };

  // ── coupons ──
  const addCoupon = () => {
    setCouponsState([...coupons, {
      code: 'NEW' + Math.floor(Math.random() * 1000),
      discountPercent: 10, applicablePlans: ['basic', 'pro', 'elite'], active: true, description: ''
    }]);
  };
  const updateCoupon = (i: number, patch: Partial<Coupon>) => {
    const n = [...coupons]; n[i] = { ...n[i], ...patch }; setCouponsState(n);
  };
  const removeCoupon = (i: number) => setCouponsState(coupons.filter((_, idx) => idx !== i));
  const saveCouponsAll = () => { saveCoupons(coupons); toast({ title: "Coupons saved" }); };

  // ── offers ──
  const addOffer = () => {
    setOffersState([...offers, {
      id: `offer_${Date.now()}`, title: 'New Offer', description: '',
      badge: 'NEW', active: true, bannerColor: 'from-violet-500 to-fuchsia-500'
    }]);
  };
  const updateOffer = (i: number, patch: Partial<Offer>) => {
    const n = [...offers]; n[i] = { ...n[i], ...patch }; setOffersState(n);
  };
  const removeOffer = (i: number) => setOffersState(offers.filter((_, idx) => idx !== i));
  const saveOffersAll = () => { saveOffers(offers); toast({ title: "Offers saved" }); };

  // ── razorpay ──
  const saveRzp = () => { saveRazorpayConfig(rzp); toast({ title: "Razorpay configured" }); };

  const totalRevenue = txns.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const successfulTxns = txns.filter(t => t.status === 'success').length;

  return (
    <Tabs defaultValue="plans" className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-4 text-center">
          <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">₹{totalRevenue}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{successfulTxns}</p>
          <p className="text-xs text-muted-foreground">Successful Payments</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <Tag className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{coupons.filter(c => c.active).length}</p>
          <p className="text-xs text-muted-foreground">Active Coupons</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center">
          <CreditCard className="h-5 w-5 text-foreground mx-auto mb-1" />
          <p className={`text-sm font-bold ${rzp.enabled ? 'text-green-500' : 'text-red-500'}`}>
            {rzp.enabled ? 'CONFIGURED' : 'NOT SET'}
          </p>
          <p className="text-xs text-muted-foreground">Razorpay Status</p>
        </CardContent></Card>
      </div>

      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
        <TabsTrigger value="offers">Offers</TabsTrigger>
        <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      {/* PLANS */}
      <TabsContent value="plans" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Pricing Plans</CardTitle>
            <CardDescription>Adjust price, features, and limits for each tier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.map((p, i) => (
              <div key={p.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground">{p.icon} {p.name}</p>
                  {p.popular && <Badge>POPULAR</Badge>}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={p.name} onChange={e => updatePlan(i, { name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Price ₹/month</Label>
                    <Input type="number" value={p.priceMonthly} onChange={e => updatePlan(i, { priceMonthly: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Original ₹ (strikethrough)</Label>
                    <Input type="number" value={p.originalPrice || ''} onChange={e => updatePlan(i, { originalPrice: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={p.tagline} onChange={e => updatePlan(i, { tagline: e.target.value })} />
                </div>
              </div>
            ))}
            <Button onClick={savePlansAll}><Save className="h-4 w-4 mr-1" /> Save All Plans</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* COUPONS */}
      <TabsContent value="coupons" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" /> Discount Coupons</CardTitle>
              <CardDescription>Create promo codes for your students.</CardDescription>
            </div>
            <Button size="sm" onClick={addCoupon}><Plus className="h-3 w-3 mr-1" /> Add</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {coupons.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-12 gap-2 items-center p-3 border border-border rounded-lg">
                <div className="sm:col-span-3"><Input value={c.code} onChange={e => updateCoupon(i, { code: e.target.value.toUpperCase() })} placeholder="CODE" /></div>
                <div className="sm:col-span-2"><Input type="number" value={c.discountPercent} onChange={e => updateCoupon(i, { discountPercent: Number(e.target.value) })} placeholder="% off" /></div>
                <div className="sm:col-span-2"><Input type="number" value={c.maxDiscount || ''} onChange={e => updateCoupon(i, { maxDiscount: Number(e.target.value) || undefined })} placeholder="Max ₹" /></div>
                <div className="sm:col-span-3"><Input value={c.description || ''} onChange={e => updateCoupon(i, { description: e.target.value })} placeholder="Description" /></div>
                <div className="sm:col-span-1 flex justify-center"><Switch checked={c.active} onCheckedChange={v => updateCoupon(i, { active: v })} /></div>
                <div className="sm:col-span-1 flex justify-end"><Button size="icon" variant="ghost" onClick={() => removeCoupon(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
              </div>
            ))}
            <Button onClick={saveCouponsAll}><Save className="h-4 w-4 mr-1" /> Save Coupons</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* OFFERS */}
      <TabsContent value="offers" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" /> Promotional Offers</CardTitle>
              <CardDescription>Banners shown on the pricing page.</CardDescription>
            </div>
            <Button size="sm" onClick={addOffer}><Plus className="h-3 w-3 mr-1" /> Add</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {offers.map((o, i) => (
              <div key={o.id} className="p-3 border border-border rounded-lg space-y-2">
                <div className="grid sm:grid-cols-3 gap-2">
                  <Input value={o.title} onChange={e => updateOffer(i, { title: e.target.value })} placeholder="Title" />
                  <Input value={o.badge} onChange={e => updateOffer(i, { badge: e.target.value })} placeholder="Badge" />
                  <div className="flex items-center gap-2">
                    <Switch checked={o.active} onCheckedChange={v => updateOffer(i, { active: v })} />
                    <Label>Active</Label>
                    <Button size="icon" variant="ghost" onClick={() => removeOffer(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <Textarea value={o.description} onChange={e => updateOffer(i, { description: e.target.value })} placeholder="Description" rows={2} />
                <Input value={o.bannerColor} onChange={e => updateOffer(i, { bannerColor: e.target.value })} placeholder="Tailwind gradient e.g. from-violet-500 to-fuchsia-500" />
              </div>
            ))}
            <Button onClick={saveOffersAll}><Save className="h-4 w-4 mr-1" /> Save Offers</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* RAZORPAY */}
      <TabsContent value="razorpay" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Razorpay Configuration</CardTitle>
            <CardDescription>
              Get your keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener" className="text-primary underline">Razorpay Dashboard → Settings → API Keys</a>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="font-semibold">Enable Razorpay Payments</Label>
                <p className="text-xs text-muted-foreground">Required to accept payments from students.</p>
              </div>
              <Switch checked={rzp.enabled} onCheckedChange={v => setRzp({ ...rzp, enabled: v })} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label>Test Mode</Label>
                <p className="text-xs text-muted-foreground">Use test keys (rzp_test_*) for sandbox.</p>
              </div>
              <Switch checked={rzp.testMode} onCheckedChange={v => setRzp({ ...rzp, testMode: v })} />
            </div>

            <div>
              <Label>Razorpay Key ID *</Label>
              <Input
                placeholder={rzp.testMode ? "rzp_test_xxxxxxxxxxxxx" : "rzp_live_xxxxxxxxxxxxx"}
                value={rzp.keyId}
                onChange={e => setRzp({ ...rzp, keyId: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Public key — safe to expose in client.</p>
            </div>

            <div>
              <Label>Razorpay Key Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  value={rzp.keySecret || ''}
                  onChange={e => setRzp({ ...rzp, keySecret: e.target.value })}
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-amber-500 mt-1">⚠ For full server-side order verification, also store the secret in your backend.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Merchant Name</Label>
                <Input value={rzp.merchantName} onChange={e => setRzp({ ...rzp, merchantName: e.target.value })} />
              </div>
              <div>
                <Label>Theme Color</Label>
                <Input value={rzp.themeColor} onChange={e => setRzp({ ...rzp, themeColor: e.target.value })} type="color" />
              </div>
            </div>
            <div>
              <Label>Merchant Logo URL</Label>
              <Input value={rzp.merchantLogo || ''} onChange={e => setRzp({ ...rzp, merchantLogo: e.target.value })} placeholder="https://..." />
            </div>

            <Button onClick={saveRzp}><Save className="h-4 w-4 mr-1" /> Save Razorpay Config</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TRANSACTIONS */}
      <TabsContent value="transactions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Transactions ({txns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {txns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {txns.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{t.displayName}</p>
                      <p className="text-xs text-muted-foreground">{t.email} • {t.studentId}</p>
                      <p className="text-xs text-muted-foreground">{t.planName} × {t.durationMonths}mo • {new Date(t.createdAt).toLocaleString()}</p>
                      {t.paymentId && <p className="text-[10px] text-muted-foreground font-mono">{t.paymentId}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{t.amount}</p>
                      <Badge variant={t.status === 'success' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
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
  );
};

export default PlansManager;
