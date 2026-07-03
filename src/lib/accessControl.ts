// Access control: license gate, maintenance mode, coming-soon pages, blocked visitors.
// Config is synced globally via Firebase Firestore. Grants + visitors + device
// fingerprint remain per-device in localStorage for offline resiliency, with live validation.
import { db } from "./firebase";
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from "firebase/firestore";

const CFG_KEY = 'tm_access_control_v1';
const VISITORS_KEY = 'tm_gate_visitors_v1';
const GRANTS_KEY = 'tm_gate_grants_v1';
const DEVICE_KEY = 'tm_device_fingerprint_v1';

// ── Type definitions ──

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
  comingSoonPages: string[];
  comingSoonMessage: string;

  // License gate for FastTrack / Lessons (and any registered gated route)
  licenseGateEnabled: boolean;
  globalLock: boolean; // when true, EVERY non-public route requires license
  lockVersion: number; // bumping this invalidates all previous grants
  licenseKeys: string[]; // fallback local keys (any of these unlocks if Firestore fails)
  gatedRoutes: string[]; // pathnames guarded
  publicRoutes: string[]; // never gated even under global lock
  gateContent: GateContent;

  // Blocked users/devices
  blockedDeviceIds: string[];
  blockedNames: string[];
  blockedMessage: string;
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
  gatedRoutes: ['/fast-track', '/lessons', '/course'],
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

// ── Config Read / Write ──

let cachedConfig: AccessConfig | null = null;
let firestoreSyncActive = false;

const readLocal = (): AccessConfig => {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultConfig };
};

export const getAccessConfig = (): AccessConfig => {
  if (cachedConfig) return cachedConfig;
  cachedConfig = readLocal();
  return cachedConfig;
};

// Apply incoming config from Firestore and notify all listeners
const applyIncoming = (data: any) => {
  const merged: AccessConfig = { ...defaultConfig, ...(data || {}) };
  cachedConfig = merged;
  localStorage.setItem(CFG_KEY, JSON.stringify(merged));
  try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
};

// Save access config to Firestore doc settings/access_config
export const saveAccessConfig = async (cfg: AccessConfig) => {
  cachedConfig = cfg;
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
  
  try {
    const docRef = doc(db, "settings", "access_config");
    await setDoc(docRef, JSON.parse(JSON.stringify(cfg)));
  } catch (error) {
    console.warn('[accessControl] Firestore save failed (will retry on next save):', error);
  }
};

// Initialize: fetch latest config from Firestore + subscribe to realtime changes.
// This is what makes admin panel changes INSTANTLY visible to all connected users.
export const initAccessControlSync = () => {
  if (firestoreSyncActive) return () => {};
  
  try {
    const docRef = doc(db, "settings", "access_config");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      firestoreSyncActive = true;
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData && Object.keys(cloudData).length > 0) {
          applyIncoming(cloudData);
        }
      } else {
        // Seed Firestore with default config if document doesn't exist yet
        const seed = readLocal();
        setDoc(docRef, JSON.parse(JSON.stringify(seed))).then(() => {
          applyIncoming(seed);
        }).catch(() => {});
      }
    }, (error) => {
      console.warn('[accessControl] Firestore realtime sync error:', error.message);
      // Fallback: use localStorage config
      firestoreSyncActive = false;
    });
    
    return unsubscribe;
  } catch (e) {
    console.warn('[accessControl] Firestore sync init failed:', e);
    firestoreSyncActive = false;
    return () => {};
  }
};

// ── Device fingerprint (browser-only pseudo hardware ID) ──
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
  if (list.length > 2000) list.splice(0, list.length - 2000);
  localStorage.setItem(VISITORS_KEY, JSON.stringify(list));

  // Sync visitor to Firestore for admin panel live view
  try {
    const visitorDoc = doc(db, "visitors", `${v.deviceId}_${v.name.replace(/\s+/g, '_')}`);
    setDoc(visitorDoc, { ...base, lastSeen: now }, { merge: true }).catch(() => {});
  } catch {}
};

export const removeGateVisitor = (deviceId: string, name: string) => {
  const list = getGateVisitors().filter(x => !(x.deviceId === deviceId && x.name === name));
  localStorage.setItem(VISITORS_KEY, JSON.stringify(list));
};

// ── Per-route unlock grants for this device (version-scoped) ──
type Grant = { name: string; licenseUsed: string; grantedAt: number; version: number };
type Grants = Record<string, Grant>;
const readGrants = (): Grants => {
  try { return JSON.parse(localStorage.getItem(GRANTS_KEY) || '{}'); } catch { return {}; }
};
const writeGrants = (g: Grants) => localStorage.setItem(GRANTS_KEY, JSON.stringify(g));

// Check if this device has a valid (non-expired, correct version) grant
export const isRouteUnlocked = (_route: string): boolean => {
  const cfg = getAccessConfig();
  const grants = readGrants();
  
  // Find any valid grant matching the current lockVersion
  const activeGrants = Object.values(grants).filter(
    g => g.version === (cfg.lockVersion || 1)
  );
  
  if (activeGrants.length === 0) return false;
  
  // Check if any grant is still within the 30-day validity period
  const now = Date.now();
  return activeGrants.some(g => {
    const ageMs = now - g.grantedAt;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return ageMs < thirtyDaysMs;
  });
};

// Grant access — writes grants for ALL gated routes so one key unlocks everything
export const grantRouteAccess = (route: string, name: string, licenseUsed: string) => {
  const cfg = getAccessConfig();
  const g = readGrants();
  const grantData: Grant = { name, licenseUsed, grantedAt: Date.now(), version: cfg.lockVersion || 1 };
  
  // Grant the specific route
  g[route] = grantData;
  
  // Also grant ALL standard gated routes so one key unlocks everything
  const allGatedRoutes = ['/lessons', '/fast-track', '/course', ...cfg.gatedRoutes];
  const uniqueRoutes = [...new Set(allGatedRoutes)];
  uniqueRoutes.forEach(r => { g[r] = grantData; });
  
  writeGrants(g);
};

export const revokeAllGrants = () => {
  localStorage.removeItem(GRANTS_KEY);
  const cfg = getAccessConfig();
  saveAccessConfig({ ...cfg, lockVersion: (cfg.lockVersion || 1) + 1 });
};

// Is the gate required for a specific route based on current config?
export const isGateRequiredForRoute = (pathname: string): boolean => {
  const cfg = getAccessConfig();
  if (pathname.startsWith('/admin')) return false;
  
  if (cfg.globalLock) {
    if (cfg.publicRoutes.includes(pathname)) return false;
    return true;
  }
  
  if (cfg.licenseGateEnabled) {
    // Intercept lessons, course, fast-track, and specific lesson paths
    const isLessonsOrFastTrack = 
      pathname === '/lessons' || 
      pathname === '/course' || 
      pathname === '/fast-track' ||
      pathname.startsWith('/lesson/');
      
    if (isLessonsOrFastTrack) return true;
    
    // Check general gated routes list from admin config
    if (cfg.gatedRoutes.includes(pathname)) return true;
  }
  return false;
};

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

// Validate license key locally (as a fallback when Firestore is offline)
export const validateLicense = (key: string): boolean => {
  const cfg = getAccessConfig();
  return cfg.licenseKeys.map(k => k.trim()).includes(key.trim());
};

// ── Firebase Firestore License Key Verification ──
export interface FirebaseLicense {
  key: string;
  isActive: boolean;
  createdAt: number;
  expiryDate: number | null;
  deviceId: string | null;
  name: string | null;
  activatedAt: number | null;
  durationMonths: number;
}

export const verifyLicenseWithFirebase = async (
  key: string,
  name: string,
  deviceId: string
): Promise<{ success: boolean; message: string }> => {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { success: false, message: "Please enter a license key." };
  }

  try {
    // 1. Fetch license from Firestore
    const docRef = doc(db, "licenses", cleanKey);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Fallback: check config's local license keys list
      if (validateLicense(cleanKey)) {
        grantRouteAccess('/lessons', name, cleanKey);
        try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
        return { success: true, message: "Access granted! (Unlocked via fallback key)" };
      }
      return { success: false, message: "Invalid license key. Please check spelling or contact support." };
    }

    const data = docSnap.data() as FirebaseLicense;

    // 2. Check if key is active
    if (!data.isActive) {
      return { success: false, message: "This license key is disabled by the admin." };
    }

    const now = Date.now();

    // 3. Check if key is already expired
    if (data.expiryDate && data.expiryDate < now) {
      return { success: false, message: "This license key has expired." };
    }

    // 4. Check device lock binding
    if (data.deviceId && data.deviceId !== deviceId) {
      return { success: false, message: "This license key is already linked to another device." };
    }

    // 5. If key is fresh/unbound, bind to device and set activation expiry
    const updates: Record<string, any> = {};
    let shouldUpdate = false;

    if (!data.deviceId) {
      updates.deviceId = deviceId;
      updates.name = name;
      updates.activatedAt = now;
      
      if (!data.expiryDate) {
        const months = data.durationMonths || 1;
        updates.expiryDate = now + months * 30 * 24 * 60 * 60 * 1000;
      }
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await updateDoc(docRef, updates);
    }

    // 6. Grant access to ALL gated routes in localStorage
    grantRouteAccess('/lessons', name, cleanKey);
    try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}

    return { success: true, message: "Access granted! Welcome to premium features." };
  } catch (error: any) {
    console.error('[verifyLicense] Firebase error:', error);
    // Offline / Network error fallback check
    if (validateLicense(key)) {
      grantRouteAccess('/lessons', name, key.trim());
      try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
      return { success: true, message: "Access granted! (Offline fallback)" };
    }
    return { success: false, message: `Verification failed: ${error.message || 'Network error'}` };
  }
};

// ── Background Live Verification check ──
// Called on every route change to verify the active license is still valid on the server.
// If admin disables or deletes a key, this will instantly revoke local access.
export const checkActiveLicenseLive = async () => {
  const cfg = getAccessConfig();
  if (!cfg.licenseGateEnabled && !cfg.globalLock) return;
  
  const grants = readGrants();
  const activeGrants = Object.values(grants).filter(
    g => g.version === (cfg.lockVersion || 1)
  );
  
  if (activeGrants.length === 0) return;
  
  const firstGrant = activeGrants[0];
  const key = firstGrant.licenseUsed;
  
  // Skip background check for local fallback keys
  if (cfg.licenseKeys.includes(key)) return;
  
  const deviceId = getDeviceFingerprint();
  
  try {
    const docRef = doc(db, "licenses", key);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn("[accessControl] License key no longer exists on server. Revoking.");
      localStorage.removeItem(GRANTS_KEY);
      try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
      return;
    }
    
    const data = docSnap.data() as FirebaseLicense;
    const now = Date.now();
    
    // Revoke local access if key is deactivated, expired, or reassigned
    if (!data.isActive || (data.expiryDate && data.expiryDate < now) || (data.deviceId && data.deviceId !== deviceId)) {
      console.warn("[accessControl] License revoked: disabled, expired, or reassigned.");
      localStorage.removeItem(GRANTS_KEY);
      try { window.dispatchEvent(new Event('tm-access-updated')); } catch {}
    }
  } catch (err) {
    // Don't revoke on network errors — just log
    console.warn("[accessControl] Background license validation failed (offline?):", err);
  }
};
