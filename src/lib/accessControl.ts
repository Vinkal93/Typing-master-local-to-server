// Access control: license gate, maintenance mode, coming-soon pages, blocked visitors
// All persisted client-side in localStorage. Admin edits everything from AccessControlManager.

const CFG_KEY = 'tm_access_control_v1';
const VISITORS_KEY = 'tm_gate_visitors_v1';
const GRANTS_KEY = 'tm_gate_grants_v1';
const DEVICE_KEY = 'tm_device_fingerprint_v1';

export interface GateContent {
  heading: string;
  paragraph: string;
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  errorMessage: string;
}

export interface AccessConfig {
  // Global blocks
  maintenanceMode: boolean;
  maintenanceMessage: string;
  comingSoonPages: string[]; // list of pathnames like "/games"
  comingSoonMessage: string;

  // License gate for FastTrack / Lessons (and any registered gated route)
  licenseGateEnabled: boolean;
  globalLock: boolean; // when true, EVERY non-public route requires license
  lockVersion: number; // bumping this invalidates all previous grants
  licenseKeys: string[]; // any of these unlocks
  gatedRoutes: string[]; // pathnames guarded
  publicRoutes: string[]; // never gated even under global lock
  gateContent: GateContent;

  // Blocked users/devices
  blockedDeviceIds: string[];
  blockedNames: string[]; // case-insensitive name match
  blockedMessage: string; // shown as popup for blocked visitors
}

const defaultConfig: AccessConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'We are performing scheduled maintenance. Please check back shortly.',
  comingSoonPages: [],
  comingSoonMessage: 'This section is coming soon. Stay tuned!',

  licenseGateEnabled: false,
  globalLock: false,
  lockVersion: 1,
  licenseKeys: ['vinkal9305040597@890'],
  gatedRoutes: ['/fast-track', '/lessons'],
  publicRoutes: ['/', '/admin', '/admin/dashboard', '/blog', '/about', '/contact', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/pricing', '/checkout', '/profile', '/seo-status'],
  gateContent: {
    heading: '🔐 Premium Access Required',
    paragraph:
      'This section is protected. Please enter your name and a valid license key to unlock premium typing lessons and the Fast Track engine.',
    placeholder: 'Enter your license key',
    buttonLabel: 'Unlock Access',
    successMessage: 'Access granted! Enjoy your session.',
    errorMessage: 'Invalid license key. Please contact support if you believe this is a mistake.',
  },

  blockedDeviceIds: [],
  blockedNames: [],
  blockedMessage: 'Your access to this website has been restricted by the administrator.',
};

export const getAccessConfig = (): AccessConfig => {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultConfig };
};

export const saveAccessConfig = (cfg: AccessConfig) => {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event('tm-access-updated'));
};

// ── Device fingerprint (browser-only pseudo "MAC address") ──
export const getDeviceFingerprint = (): string => {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    (navigator as any).hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
  ].join('||');
  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = ((hash << 5) - hash + parts.charCodeAt(i)) | 0;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const id = `DEV-${Math.abs(hash).toString(16).toUpperCase()}-${rand.toUpperCase()}`;
  localStorage.setItem(DEVICE_KEY, id);
  return id;
};

// ── Visitor log (name + device + first-seen) shown in admin analytics ──
export interface GateVisitor {
  deviceId: string;
  name: string;
  firstSeen: number;
  lastSeen: number;
  route: string;
  userAgent: string;
  screen: string;
  language: string;
  licenseUsed?: string;
  unlocked: boolean;
}

export const getGateVisitors = (): GateVisitor[] => {
  try {
    return JSON.parse(localStorage.getItem(VISITORS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const upsertGateVisitor = (v: Partial<GateVisitor> & { deviceId: string; name: string; route: string }) => {
  const list = getGateVisitors();
  const idx = list.findIndex(x => x.deviceId === v.deviceId && x.name.toLowerCase() === v.name.toLowerCase());
  const now = Date.now();
  const base: GateVisitor = {
    deviceId: v.deviceId,
    name: v.name,
    route: v.route,
    firstSeen: now,
    lastSeen: now,
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    licenseUsed: v.licenseUsed,
    unlocked: v.unlocked ?? false,
  };
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...base, firstSeen: list[idx].firstSeen, lastSeen: now };
  } else {
    list.push(base);
  }
  // cap to 2000 entries
  if (list.length > 2000) list.splice(0, list.length - 2000);
  localStorage.setItem(VISITORS_KEY, JSON.stringify(list));
};

export const removeGateVisitor = (deviceId: string, name: string) => {
  const list = getGateVisitors().filter(x => !(x.deviceId === deviceId && x.name === name));
  localStorage.setItem(VISITORS_KEY, JSON.stringify(list));
};

// ── Per-route unlock grants for this device ──
type Grants = Record<string, { name: string; licenseUsed: string; grantedAt: number }>;
const readGrants = (): Grants => {
  try { return JSON.parse(localStorage.getItem(GRANTS_KEY) || '{}'); } catch { return {}; }
};
const writeGrants = (g: Grants) => localStorage.setItem(GRANTS_KEY, JSON.stringify(g));

export const isRouteUnlocked = (route: string): boolean => !!readGrants()[route];
export const grantRouteAccess = (route: string, name: string, licenseUsed: string) => {
  const g = readGrants();
  g[route] = { name, licenseUsed, grantedAt: Date.now() };
  writeGrants(g);
};
export const revokeAllGrants = () => localStorage.removeItem(GRANTS_KEY);

// ── Blocked check for current device / name ──
export const isCurrentlyBlocked = (name?: string): { blocked: boolean; reason?: string } => {
  const cfg = getAccessConfig();
  const deviceId = getDeviceFingerprint();
  if (cfg.blockedDeviceIds.includes(deviceId)) return { blocked: true, reason: 'device' };
  if (name && cfg.blockedNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
    return { blocked: true, reason: 'name' };
  }
  return { blocked: false };
};

export const blockDevice = (deviceId: string) => {
  const cfg = getAccessConfig();
  if (!cfg.blockedDeviceIds.includes(deviceId)) cfg.blockedDeviceIds.push(deviceId);
  saveAccessConfig(cfg);
};
export const unblockDevice = (deviceId: string) => {
  const cfg = getAccessConfig();
  cfg.blockedDeviceIds = cfg.blockedDeviceIds.filter(d => d !== deviceId);
  saveAccessConfig(cfg);
};
export const blockName = (name: string) => {
  const cfg = getAccessConfig();
  if (!cfg.blockedNames.includes(name)) cfg.blockedNames.push(name);
  saveAccessConfig(cfg);
};
export const unblockName = (name: string) => {
  const cfg = getAccessConfig();
  cfg.blockedNames = cfg.blockedNames.filter(n => n !== name);
  saveAccessConfig(cfg);
};

export const validateLicense = (key: string): boolean => {
  const cfg = getAccessConfig();
  return cfg.licenseKeys.map(k => k.trim()).includes(key.trim());
};
