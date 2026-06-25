// Pricing, plans, coupons, razorpay config & transactions (localStorage-backed)

export type PlanTier = 'free' | 'basic' | 'pro' | 'elite';

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number; // INR
  originalPrice?: number; // for strikethrough
  color: string; // tailwind gradient class fragment
  icon: string;
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    advancedExamPerDay: number; // -1 unlimited
    lessonsUnlocked: number;    // -1 unlimited
    certificateAccess: boolean;
    leaderboardPriority: boolean;
    customDrills: boolean;
    aiContent: boolean;
    adFree: boolean;
    prioritySupport: boolean;
  };
}

export interface Coupon {
  code: string;
  discountPercent: number; // 0-100
  maxDiscount?: number;
  validUntil?: number;
  applicablePlans: PlanTier[];
  active: boolean;
  description?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  badge: string; // e.g. "🔥 50% OFF"
  active: boolean;
  bannerColor: string;
  validUntil?: number;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret?: string; // stored locally; admin reference only
  enabled: boolean;
  testMode: boolean;
  merchantName: string;
  merchantLogo?: string;
  themeColor: string;
}

export interface Transaction {
  id: string;
  uid: string;
  studentId: string;
  email: string;
  displayName: string;
  planId: PlanTier;
  planName: string;
  amount: number;
  originalAmount: number;
  discount: number;
  couponCode?: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  verified?: boolean;
  verificationNote?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: number;
  durationMonths: number;
  expiryAt: number;
  mode: 'razorpay' | 'manual';
}

const PLANS_KEY = 'tm_pricing_plans_v2';
const COUPONS_KEY = 'tm_coupons_v1';
const OFFERS_KEY = 'tm_offers_v1';
const RAZORPAY_KEY = 'tm_razorpay_config_v1';
const TXN_KEY = 'tm_transactions_v1';

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Start your typing journey',
    priceMonthly: 49,
    originalPrice: 99,
    color: 'from-blue-500 to-cyan-500',
    icon: '🚀',
    features: [
      { label: 'All 12 Beginner Lessons', included: true },
      { label: 'Advanced Exam Mode (5/day)', included: true },
      { label: 'Practice Mode (Limited)', included: true },
      { label: 'Basic Progress Tracking', included: true },
      { label: 'Ad-Free Experience', included: false },
      { label: 'Smart AI Drills', included: false },
      { label: 'Certificates', included: false },
      { label: 'Priority Support', included: false },
    ],
    limits: {
      advancedExamPerDay: 5,
      lessonsUnlocked: 12,
      certificateAccess: false,
      leaderboardPriority: false,
      customDrills: false,
      aiContent: false,
      adFree: false,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Most popular for serious learners',
    priceMonthly: 99,
    originalPrice: 199,
    color: 'from-violet-500 to-fuchsia-500',
    icon: '⭐',
    popular: true,
    features: [
      { label: 'All Lessons Unlocked', included: true },
      { label: 'Unlimited Advanced Exam', included: true },
      { label: 'Full Practice Suite', included: true },
      { label: 'All Typing Games', included: true },
      { label: 'Smart AI Drills', included: true },
      { label: 'Advanced Analytics', included: true },
      { label: 'Ad-Free Experience', included: true },
      { label: 'Certificates', included: false },
    ],
    limits: {
      advancedExamPerDay: -1,
      lessonsUnlocked: -1,
      certificateAccess: false,
      leaderboardPriority: true,
      customDrills: true,
      aiContent: true,
      adFree: true,
      prioritySupport: false,
    },
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Govt exam ready · BSF · SSC',
    priceMonthly: 149,
    originalPrice: 299,
    color: 'from-amber-500 to-orange-500',
    icon: '👑',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'CPCT + SSC + BSF Mocks', included: true },
      { label: 'Certificates (PDF)', included: true },
      { label: 'Sport Mode Access', included: true },
      { label: 'Personal Coach Tips (AI)', included: true },
      { label: 'Priority Leaderboard', included: true },
      { label: 'Premium Gold Dashboard', included: true },
      { label: '24/7 Priority Support', included: true },
    ],
    limits: {
      advancedExamPerDay: -1,
      lessonsUnlocked: -1,
      certificateAccess: true,
      leaderboardPriority: true,
      customDrills: true,
      aiContent: true,
      adFree: true,
      prioritySupport: true,
    },
  },
];

export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'WELCOME20', discountPercent: 20, applicablePlans: ['basic', 'pro', 'elite'], active: true, description: 'Welcome offer - 20% off' },
  { code: 'STUDENT50', discountPercent: 50, maxDiscount: 75, applicablePlans: ['basic', 'pro'], active: true, description: 'Student special - 50% off' },
  { code: 'ELITE10', discountPercent: 10, applicablePlans: ['elite'], active: true, description: 'Elite upgrade - 10% off' },
];

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'launch',
    title: '🎉 Launch Offer — Flat 50% OFF',
    description: 'Limited time launch pricing on all plans. Use code WELCOME20 for extra 20% off.',
    badge: '50% OFF',
    active: true,
    bannerColor: 'from-amber-500 via-orange-500 to-pink-500',
  },
];

// ── PLANS ────────────────────────────────────────────────
export const getPlans = (): PricingPlan[] => {
  try {
    const d = localStorage.getItem(PLANS_KEY);
    return d ? JSON.parse(d) : DEFAULT_PLANS;
  } catch { return DEFAULT_PLANS; }
};
export const savePlans = (plans: PricingPlan[]) =>
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
export const getPlan = (id: PlanTier): PricingPlan | undefined =>
  getPlans().find(p => p.id === id);

// ── COUPONS ──────────────────────────────────────────────
export const getCoupons = (): Coupon[] => {
  try {
    const d = localStorage.getItem(COUPONS_KEY);
    return d ? JSON.parse(d) : DEFAULT_COUPONS;
  } catch { return DEFAULT_COUPONS; }
};
export const saveCoupons = (c: Coupon[]) =>
  localStorage.setItem(COUPONS_KEY, JSON.stringify(c));

export const validateCoupon = (code: string, planId: PlanTier): { valid: boolean; coupon?: Coupon; error?: string } => {
  const cp = getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!cp) return { valid: false, error: 'Invalid coupon code' };
  if (!cp.active) return { valid: false, error: 'Coupon is no longer active' };
  if (cp.validUntil && cp.validUntil < Date.now()) return { valid: false, error: 'Coupon expired' };
  if (!cp.applicablePlans.includes(planId)) return { valid: false, error: 'Coupon not valid for this plan' };
  return { valid: true, coupon: cp };
};

// ── OFFERS ───────────────────────────────────────────────
export const getOffers = (): Offer[] => {
  try {
    const d = localStorage.getItem(OFFERS_KEY);
    return d ? JSON.parse(d) : DEFAULT_OFFERS;
  } catch { return DEFAULT_OFFERS; }
};
export const saveOffers = (o: Offer[]) =>
  localStorage.setItem(OFFERS_KEY, JSON.stringify(o));

// ── RAZORPAY ─────────────────────────────────────────────
export const DEFAULT_RAZORPAY: RazorpayConfig = {
  keyId: '',
  keySecret: '',
  enabled: false,
  testMode: true,
  merchantName: 'Typing Master by Vinkal Prajapati',
  themeColor: '#8b5cf6',
};

export const getRazorpayConfig = (): RazorpayConfig => {
  try {
    const d = localStorage.getItem(RAZORPAY_KEY);
    return d ? { ...DEFAULT_RAZORPAY, ...JSON.parse(d) } : DEFAULT_RAZORPAY;
  } catch { return DEFAULT_RAZORPAY; }
};
export const saveRazorpayConfig = (c: RazorpayConfig) =>
  localStorage.setItem(RAZORPAY_KEY, JSON.stringify(c));

// ── TRANSACTIONS ─────────────────────────────────────────
export const getTransactions = (): Transaction[] => {
  try {
    const d = localStorage.getItem(TXN_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
};
export const saveTransaction = (t: Transaction) => {
  const all = getTransactions();
  all.unshift(t);
  localStorage.setItem(TXN_KEY, JSON.stringify(all.slice(0, 500)));
};
export const updateTransaction = (id: string, patch: Partial<Transaction>) => {
  const all = getTransactions();
  const idx = all.findIndex(t => t.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch };
    localStorage.setItem(TXN_KEY, JSON.stringify(all));
  }
};

// ── PRICE CALC ───────────────────────────────────────────
export const calcPrice = (plan: PricingPlan, months: number, couponCode?: string) => {
  const base = plan.priceMonthly * months;
  let discount = 0;
  let couponMsg = '';
  if (couponCode) {
    const v = validateCoupon(couponCode, plan.id);
    if (v.valid && v.coupon) {
      discount = Math.round((base * v.coupon.discountPercent) / 100);
      if (v.coupon.maxDiscount) discount = Math.min(discount, v.coupon.maxDiscount);
      couponMsg = `${v.coupon.discountPercent}% off applied`;
    } else {
      couponMsg = v.error || '';
    }
  }
  // Multi-month auto discount
  let multiDiscount = 0;
  if (months >= 12) multiDiscount = Math.round(base * 0.25);
  else if (months >= 6) multiDiscount = Math.round(base * 0.15);
  else if (months >= 3) multiDiscount = Math.round(base * 0.08);
  const subtotal = base - discount - multiDiscount;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  return { base, discount, multiDiscount, subtotal, gst, total, couponMsg };
};

// ── RAZORPAY LOADER ──────────────────────────────────────
export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise(resolve => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
