import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAccessConfig, isCurrentlyBlocked } from "@/lib/accessControl";
import BlockedOverlay from "@/components/BlockedOverlay";
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
  const [cfg, setCfg] = useState(getAccessConfig());

  useEffect(() => {
    const r = () => setCfg(getAccessConfig());
    window.addEventListener('tm-access-updated', r);
    window.addEventListener('storage', r);
    return () => {
      window.removeEventListener('tm-access-updated', r);
      window.removeEventListener('storage', r);
    };
  }, []);

  // Admin routes always bypass guards so admin can toggle off maintenance
  const isAdminRoute = location.pathname.startsWith('/admin');

  const savedName = typeof window !== 'undefined' ? (localStorage.getItem('tm_gate_name') || undefined) : undefined;
  const blocked = isCurrentlyBlocked(savedName);
  if (blocked.blocked && !isAdminRoute) return <BlockedOverlay />;

  if (cfg.maintenanceMode && !isAdminRoute) {
    return <FullPageMessage icon={<Wrench className="h-8 w-8 text-primary" />} title="Under Maintenance" message={cfg.maintenanceMessage} />;
  }

  if (cfg.comingSoonPages.includes(location.pathname) && !isAdminRoute) {
    return <FullPageMessage icon={<Rocket className="h-8 w-8 text-primary" />} title="Coming Soon" message={cfg.comingSoonMessage} />;
  }

  return <>{children}</>;
};

export default GlobalAccessGuard;
