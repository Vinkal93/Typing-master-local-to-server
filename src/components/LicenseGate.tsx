import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, KeyRound, ShieldCheck, User, Fingerprint, AlertTriangle } from "lucide-react";
import {
  getAccessConfig,
  getDeviceFingerprint,
  isRouteUnlocked,
  grantRouteAccess,
  upsertGateVisitor,
  validateLicense,
  isCurrentlyBlocked,
  isGateRequiredForRoute,
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
  const [unlocked, setUnlocked] = useState(isRouteUnlocked(location.pathname));
  const deviceId = useMemo(() => getDeviceFingerprint(), []);

  useEffect(() => {
    const refresh = () => setCfg(getAccessConfig());
    window.addEventListener('tm-access-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('tm-access-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

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

  const handleUnlock = () => {
    if (!validateLicense(licenseInput)) {
      setError(cfg.gateContent.errorMessage);
      upsertGateVisitor({ deviceId, name: name.trim(), route: location.pathname, licenseUsed: licenseInput, unlocked: false });
      return;
    }
    grantRouteAccess(location.pathname, name.trim(), licenseInput.trim());
    upsertGateVisitor({ deviceId, name: name.trim(), route: location.pathname, licenseUsed: licenseInput.trim(), unlocked: true });
    setUnlocked(true);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-lg border-primary/30 shadow-xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              {nameSubmitted ? <KeyRound className="h-7 w-7 text-primary" /> : <User className="h-7 w-7 text-primary" />}
            </div>
            <CardTitle className="text-2xl">{cfg.gateContent.heading}</CardTitle>
            <p className="text-sm text-muted-foreground">{cfg.gateContent.paragraph}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Fingerprint className="h-3 w-3" />
              <span className="font-mono">{deviceId}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!nameSubmitted ? (
              <>
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    onKeyDown={e => e.key === 'Enter' && handleNameContinue()}
                  />
                </div>
                {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {error}</p>}
                <Button className="w-full" onClick={handleNameContinue}>Continue</Button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                  <div className="text-sm"><span className="text-muted-foreground">Welcome, </span><span className="font-semibold text-foreground">{name}</span></div>
                  <Badge variant="secondary" className="text-[10px]"><Lock className="h-3 w-3 mr-1" /> Locked</Badge>
                </div>
                <div>
                  <Label>License Key *</Label>
                  <Input
                    value={licenseInput}
                    onChange={e => setLicenseInput(e.target.value)}
                    placeholder={cfg.gateContent.placeholder}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {error}</p>}
                <Button className="w-full" onClick={handleUnlock}>
                  <ShieldCheck className="h-4 w-4 mr-1" /> {cfg.gateContent.buttonLabel}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Your name and device fingerprint are recorded for security.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LicenseGate;
