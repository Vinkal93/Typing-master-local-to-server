import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  getAccessConfig, 
  isCurrentlyBlocked, 
  isGateRequiredForRoute, 
  isRouteUnlocked,
  getDeviceFingerprint,
  upsertGateVisitor,
  checkActiveLicenseLive,
  AccessConfig
} from "@/lib/accessControl";
import BlockedOverlay from "@/components/BlockedOverlay";
import LicenseGate from "@/components/LicenseGate";
import { Wrench, Rocket } from "lucide-react";

const FullPageMessage = ({ icon, title, message }: { icon: ReactNode; title: string; message: string }) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-background">
    <div className="max-w-md w-full text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground whitespace-pre-wrap">{message}</p>
    </div>
  </div>
);

const GlobalAccessGuard = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [cfg, setCfg] = useState<AccessConfig>(getAccessConfig());
  const [tick, setTick] = useState(0);

  // Listen for real-time config changes from Firestore sync
  useEffect(() => {
    const refresh = () => { 
      setCfg(getAccessConfig()); 
      setTick(t => t + 1); 
    };
    window.addEventListener('tm-access-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('tm-access-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Visitor Tracking & Background License Validation on every page change
  useEffect(() => {
    if (isAdminRoute) return;
    
    // Run background license check (will revoke if admin disabled the key)
    checkActiveLicenseLive();
    
    // Log visitor to Firestore for admin live view
    const savedName = localStorage.getItem('tm_gate_name') || 'Guest';
    const deviceId = getDeviceFingerprint();
    const unlocked = isRouteUnlocked(location.pathname);
    
    upsertGateVisitor({ 
      deviceId, 
      name: savedName, 
      route: location.pathname, 
      unlocked 
    });
  }, [location.pathname, isAdminRoute, tick]);

  // Re-derive state on every render / tick change for instant reactivity
  const savedName = typeof window !== 'undefined' ? (localStorage.getItem('tm_gate_name') || undefined) : undefined;
  const blocked = isCurrentlyBlocked(savedName);
  const gateRequired = isGateRequiredForRoute(location.pathname);
  const unlocked = isRouteUnlocked(location.pathname);
  
  if (blocked.blocked && !isAdminRoute) return <BlockedOverlay />;

  if (cfg.maintenanceMode && !isAdminRoute) {
    return <FullPageMessage icon={<Wrench className="h-8 w-8 text-primary" />} title="Under Maintenance" message={cfg.maintenanceMessage} />;
  }

  if (cfg.comingSoonPages.includes(location.pathname) && !isAdminRoute) {
    return <FullPageMessage icon={<Rocket className="h-8 w-8 text-primary" />} title="Coming Soon" message={cfg.comingSoonMessage} />;
  }

  // License gate: when admin enables gate, user must enter name + valid key
  if (gateRequired && !unlocked) {
    return <LicenseGate>{children}</LicenseGate>;
  }

  return <>{children}</>;
};

export default GlobalAccessGuard;
