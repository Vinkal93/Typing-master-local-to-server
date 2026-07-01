import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ban, Fingerprint } from "lucide-react";
import { getAccessConfig, getDeviceFingerprint } from "@/lib/accessControl";

const BlockedOverlay = () => {
  const [cfg, setCfg] = useState(getAccessConfig());
  const deviceId = getDeviceFingerprint();
  useEffect(() => {
    const r = () => setCfg(getAccessConfig());
    window.addEventListener('tm-access-updated', r);
    return () => window.removeEventListener('tm-access-updated', r);
  }, []);
  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <Dialog open>
        <DialogContent className="max-w-md" onEscapeKeyDown={e => e.preventDefault()} onPointerDownOutside={e => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <Ban className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center text-xl">Access Restricted</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-muted-foreground whitespace-pre-wrap">
            {cfg.blockedMessage}
          </p>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
              <Fingerprint className="h-3 w-3" /> Device ID
            </p>
            <p className="font-mono text-xs mt-1 text-foreground break-all">{deviceId}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockedOverlay;
