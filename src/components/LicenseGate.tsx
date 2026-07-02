import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, KeyRound, ShieldCheck, User, Fingerprint, AlertTriangle, Loader2 } from "lucide-react";
import {
  getAccessConfig,
  getDeviceFingerprint,
  isRouteUnlocked,
  upsertGateVisitor,
  isCurrentlyBlocked,
  isGateRequiredForRoute,
  verifyLicenseWithFirebase,
} from "@/lib/accessControl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockedOverlay from "@/components/BlockedOverlay";

interface Props { children: ReactNode }

const LicenseGate = ({ children }: Props) => {
  const location = useLocation();
  const [cfg, setCfg] = useState(getAccessConfig());
  const [name, setName] = useState<string>(localStorage.getItem('tm_gate_name') || '');
  const [nameSubmitted, setNameSubmitted] = useState<boolean>(!!localStorage.getItem('tm_gate_name'));
  const [licenseInput, setLicenseInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(isRouteUnlocked(location.pathname));
  const deviceId = useMemo(() => getDeviceFingerprint(), []);

  useEffect(() => {
    const refresh = () => { setCfg(getAccessConfig()); setUnlocked(isRouteUnlocked(location.pathname)); };
    window.addEventListener('tm-access-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('tm-access-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [location.pathname]);

  useEffect(() => { setUnlocked(isRouteUnlocked(location.pathname)); }, [location.pathname]);

  const gateRequired = isGateRequiredForRoute(location.pathname);
  const blocked = isCurrentlyBlocked(name);

  if (blocked.blocked) return <BlockedOverlay />;
  if (!gateRequired || unlocked) return <>{children}</>;

  const handleNameContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError('Please enter your full name (2+ characters)'); return; }
    localStorage.setItem('tm_gate_name', trimmed);
    upsertGateVisitor({ deviceId, name: trimmed, route: location.pathname, unlocked: false });
    setNameSubmitted(true);
    setError('');
  };

  const handleUnlock = async () => {
    const cleanKey = licenseInput.trim();
    if (!cleanKey) {
      setError('Please enter your license key.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await verifyLicenseWithFirebase(cleanKey, name.trim(), deviceId);
      
      if (!res.success) {
        setError(res.message);
        upsertGateVisitor({ 
          deviceId, 
          name: name.trim(), 
          route: location.pathname, 
          licenseUsed: cleanKey, 
          unlocked: false 
        });
      } else {
        upsertGateVisitor({ 
          deviceId, 
          name: name.trim(), 
          route: location.pathname, 
          licenseUsed: cleanKey, 
          unlocked: true 
        });
        setUnlocked(true);
        // Dispatch a global event to instantly update sidebar UI and other routes
        window.dispatchEvent(new Event('tm-access-updated'));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16 z-10">
        <Card className="w-full max-w-lg border-primary/20 shadow-2xl bg-card/60 backdrop-blur-md relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500" />
          
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner animate-pulse">
              {nameSubmitted ? (
                <KeyRound className="h-8 w-8 text-primary" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                {cfg.gateContent.heading}
              </CardTitle>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {cfg.gateContent.paragraph}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-3.5 rounded-full bg-muted/40 border border-border w-max mx-auto text-[11px] font-medium text-muted-foreground">
              <Fingerprint className="h-3 w-3 text-primary/70" />
              <span>Device ID:</span>
              <span className="font-mono font-bold text-foreground">{deviceId}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pb-8">
            {!nameSubmitted ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name-input"
                      className="pl-9 h-11 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 bg-background/50"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      onKeyDown={e => e.key === 'Enter' && handleNameContinue()}
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <Button className="w-full h-11 text-sm font-semibold tracking-wide shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300" onClick={handleNameContinue}>
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                  <div className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-muted-foreground text-xs">Awaiting Activation for:</span>
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5"><Lock className="h-3 w-3 mr-1 text-primary" /> Locked</Badge>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    License Key
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="license-input"
                      className="pl-9 h-11 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 bg-background/50 uppercase tracking-widest font-mono"
                      value={licenseInput}
                      onChange={e => setLicenseInput(e.target.value)}
                      placeholder={cfg.gateContent.placeholder}
                      onKeyDown={e => e.key === 'Enter' && !loading && handleUnlock()}
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-11 text-xs" 
                    onClick={() => setNameSubmitted(false)}
                    disabled={loading}
                  >
                    Change Name
                  </Button>
                  <Button 
                    className="flex-[2] h-11 text-sm font-semibold tracking-wide shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all duration-300" 
                    onClick={handleUnlock}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        {cfg.gateContent.buttonLabel}
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground/80 leading-normal pt-1">
                  Your device fingerprint is bound to this license for security. Contact admin for resets.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default LicenseGate;
