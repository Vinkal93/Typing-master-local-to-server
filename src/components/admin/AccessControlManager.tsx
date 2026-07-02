import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Ban, Wrench, Rocket, KeyRound, ShieldAlert, Fingerprint, User, Lock } from "lucide-react";
import {
  AccessConfig, getAccessConfig, saveAccessConfig,
  getGateVisitors, GateVisitor, removeGateVisitor,
  blockDevice, unblockDevice, blockName, unblockName, revokeAllGrants,
} from "@/lib/accessControl";

const ROUTE_OPTIONS = [
  '/fast-track', '/lessons', '/practice', '/exam', '/advanced-exam', '/games',
  '/sport-mode', '/cpct-mock', '/smart-practice', '/course', '/dashboard',
  '/typing-test', '/1-minute-typing-test', '/3-minute-typing-test', '/5-minute-typing-test',
  '/hindi-typing-test', '/english-typing-test', '/blog', '/pricing',
];

export const AccessControlManager = () => {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<AccessConfig>(getAccessConfig());
  const [visitors, setVisitors] = useState<GateVisitor[]>(getGateVisitors());
  const [newKey, setNewKey] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [newComingSoon, setNewComingSoon] = useState('');
  const [manualBlockDevice, setManualBlockDevice] = useState('');
  const [manualBlockName, setManualBlockName] = useState('');

  useEffect(() => {
    const id = setInterval(() => setVisitors(getGateVisitors()), 4000);
    return () => clearInterval(id);
  }, []);

  const save = (next: AccessConfig) => { setCfg(next); saveAccessConfig(next); toast({ title: 'Saved' }); };
  const patch = (p: Partial<AccessConfig>) => setCfg({ ...cfg, ...p });
  const patchContent = (p: Partial<AccessConfig['gateContent']>) => setCfg({ ...cfg, gateContent: { ...cfg.gateContent, ...p } });

  return (
    <Tabs defaultValue="license" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="license"><KeyRound className="h-3 w-3 mr-1" /> License Gate</TabsTrigger>
        <TabsTrigger value="site"><Wrench className="h-3 w-3 mr-1" /> Site Mode</TabsTrigger>
        <TabsTrigger value="blocked"><Ban className="h-3 w-3 mr-1" /> Blocked</TabsTrigger>
        <TabsTrigger value="visitors"><User className="h-3 w-3 mr-1" /> Gate Visitors ({visitors.length})</TabsTrigger>
      </TabsList>

      {/* LICENSE GATE */}
      <TabsContent value="license" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> License Gate Master Switch</CardTitle>
            <CardDescription>When ON, gated routes require a name + valid license key. When OFF, everyone can access freely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="font-semibold">Require License Key</Label>
                <p className="text-xs text-muted-foreground">Active for {cfg.gatedRoutes.length} route(s)</p>
              </div>
              <Switch checked={cfg.licenseGateEnabled} onCheckedChange={v => patch({ licenseGateEnabled: v })} />
            </div>

            <div>
              <Label>License Keys (any one unlocks)</Label>
              <div className="space-y-2 mt-2">
                {cfg.licenseKeys.map((k, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={k} onChange={e => { const n = [...cfg.licenseKeys]; n[i] = e.target.value; patch({ licenseKeys: n }); }} />
                    <Button size="icon" variant="ghost" onClick={() => patch({ licenseKeys: cfg.licenseKeys.filter((_, x) => x !== i) })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Add new license key" />
                  <Button size="sm" onClick={() => { if (newKey.trim()) { patch({ licenseKeys: [...cfg.licenseKeys, newKey.trim()] }); setNewKey(''); } }}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Gated Routes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cfg.gatedRoutes.map(r => (
                  <Badge key={r} variant="secondary" className="gap-1">
                    {r}
                    <button onClick={() => patch({ gatedRoutes: cfg.gatedRoutes.filter(x => x !== r) })}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <select className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-sm" value={newRoute} onChange={e => setNewRoute(e.target.value)}>
                  <option value="">-- select route --</option>
                  {ROUTE_OPTIONS.filter(r => !cfg.gatedRoutes.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button size="sm" onClick={() => { if (newRoute) { patch({ gatedRoutes: [...cfg.gatedRoutes, newRoute] }); setNewRoute(''); } }}>
                  <Plus className="h-3 w-3 mr-1" /> Add Route
                </Button>
              </div>
            </div>

            <div className="p-3 border border-border rounded-lg space-y-3">
              <p className="font-semibold text-sm">Gate Card Content (shown to visitors)</p>
              <div><Label>Heading</Label><Input value={cfg.gateContent.heading} onChange={e => patchContent({ heading: e.target.value })} /></div>
              <div><Label>Paragraph</Label><Textarea rows={3} value={cfg.gateContent.paragraph} onChange={e => patchContent({ paragraph: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div><Label>Input Placeholder</Label><Input value={cfg.gateContent.placeholder} onChange={e => patchContent({ placeholder: e.target.value })} /></div>
                <div><Label>Button Label</Label><Input value={cfg.gateContent.buttonLabel} onChange={e => patchContent({ buttonLabel: e.target.value })} /></div>
              </div>
              <div><Label>Error Message</Label><Input value={cfg.gateContent.errorMessage} onChange={e => patchContent({ errorMessage: e.target.value })} /></div>
            </div>

            <Button onClick={() => save(cfg)}><Save className="h-4 w-4 mr-1" /> Save License Gate</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SITE MODE */}
      <TabsContent value="site" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Maintenance Mode</CardTitle>
            <CardDescription>When ON, the entire website (except /admin) shows a maintenance page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="font-semibold">Enable Maintenance</Label>
              <Switch checked={cfg.maintenanceMode} onCheckedChange={v => patch({ maintenanceMode: v })} />
            </div>
            <div><Label>Maintenance Message</Label><Textarea rows={3} value={cfg.maintenanceMessage} onChange={e => patch({ maintenanceMessage: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4" /> Coming Soon Pages</CardTitle>
            <CardDescription>Any page in this list will show a "Coming Soon" screen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {cfg.comingSoonPages.map(p => (
                <Badge key={p} variant="secondary" className="gap-1">
                  {p}
                  <button onClick={() => patch({ comingSoonPages: cfg.comingSoonPages.filter(x => x !== p) })}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </Badge>
              ))}
              {cfg.comingSoonPages.length === 0 && <p className="text-xs text-muted-foreground">No pages marked as coming soon.</p>}
            </div>
            <div className="flex gap-2">
              <select className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-sm" value={newComingSoon} onChange={e => setNewComingSoon(e.target.value)}>
                <option value="">-- select route --</option>
                {ROUTE_OPTIONS.filter(r => !cfg.comingSoonPages.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button size="sm" onClick={() => { if (newComingSoon) { patch({ comingSoonPages: [...cfg.comingSoonPages, newComingSoon] }); setNewComingSoon(''); } }}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            <div><Label>Coming Soon Message</Label><Textarea rows={2} value={cfg.comingSoonMessage} onChange={e => patch({ comingSoonMessage: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Button onClick={() => save(cfg)}><Save className="h-4 w-4 mr-1" /> Save Site Mode</Button>
      </TabsContent>

      {/* BLOCKED */}
      <TabsContent value="blocked" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Ban className="h-4 w-4" /> Blocked Users / Devices</CardTitle>
            <CardDescription>Blocked entries see your custom popup on every page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Blocked Popup Message</Label><Textarea rows={3} value={cfg.blockedMessage} onChange={e => patch({ blockedMessage: e.target.value })} /></div>

            <div>
              <Label>Blocked Device IDs</Label>
              <div className="space-y-1 mt-2">
                {cfg.blockedDeviceIds.map(d => (
                  <div key={d} className="flex items-center justify-between p-2 border border-border rounded text-xs">
                    <span className="font-mono truncate">{d}</span>
                    <Button size="icon" variant="ghost" onClick={() => { unblockDevice(d); setCfg(getAccessConfig()); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={manualBlockDevice} onChange={e => setManualBlockDevice(e.target.value)} placeholder="DEV-XXXX-YYYY" />
                  <Button size="sm" onClick={() => { if (manualBlockDevice.trim()) { blockDevice(manualBlockDevice.trim()); setManualBlockDevice(''); setCfg(getAccessConfig()); } }}>Block</Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Blocked Names</Label>
              <div className="space-y-1 mt-2">
                {cfg.blockedNames.map(n => (
                  <div key={n} className="flex items-center justify-between p-2 border border-border rounded text-xs">
                    <span>{n}</span>
                    <Button size="icon" variant="ghost" onClick={() => { unblockName(n); setCfg(getAccessConfig()); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={manualBlockName} onChange={e => setManualBlockName(e.target.value)} placeholder="Enter name to block" />
                  <Button size="sm" onClick={() => { if (manualBlockName.trim()) { blockName(manualBlockName.trim()); setManualBlockName(''); setCfg(getAccessConfig()); } }}>Block</Button>
                </div>
              </div>
            </div>

            <Button onClick={() => save(cfg)}><Save className="h-4 w-4 mr-1" /> Save Block Message</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* VISITORS */}
      <TabsContent value="visitors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Gate Visitors Log</CardTitle>
            <CardDescription>Every visitor who reached a gated page: name + device fingerprint + attempt.</CardDescription>
          </CardHeader>
          <CardContent>
            {visitors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No gate visitors yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {visitors.slice().reverse().map((v, i) => {
                  const deviceBlocked = cfg.blockedDeviceIds.includes(v.deviceId);
                  const nameBlocked = cfg.blockedNames.some(n => n.toLowerCase() === v.name.toLowerCase());
                  return (
                    <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{v.name}</span>
                            {v.unlocked ? <Badge className="text-[10px] bg-green-500/20 text-green-500">UNLOCKED</Badge> : <Badge variant="secondary" className="text-[10px]">Attempt</Badge>}
                            {deviceBlocked && <Badge variant="destructive" className="text-[10px]">Device Blocked</Badge>}
                            {nameBlocked && <Badge variant="destructive" className="text-[10px]">Name Blocked</Badge>}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{v.deviceId}</p>
                          <p className="text-[11px] text-muted-foreground">Route: {v.route} • {v.screen} • {v.language}</p>
                          <p className="text-[11px] text-muted-foreground">First: {new Date(v.firstSeen).toLocaleString()} • Last: {new Date(v.lastSeen).toLocaleString()}</p>
                          {v.licenseUsed && <p className="text-[11px] text-muted-foreground">Key used: <span className="font-mono">{v.licenseUsed}</span></p>}
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={v.userAgent}>{v.userAgent}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!deviceBlocked
                            ? <Button size="sm" variant="destructive" onClick={() => { blockDevice(v.deviceId); setCfg(getAccessConfig()); }}><Ban className="h-3 w-3 mr-1" /> Block Device</Button>
                            : <Button size="sm" variant="outline" onClick={() => { unblockDevice(v.deviceId); setCfg(getAccessConfig()); }}>Unblock Device</Button>}
                          {!nameBlocked
                            ? <Button size="sm" variant="destructive" onClick={() => { blockName(v.name); setCfg(getAccessConfig()); }}><Ban className="h-3 w-3 mr-1" /> Block Name</Button>
                            : <Button size="sm" variant="outline" onClick={() => { unblockName(v.name); setCfg(getAccessConfig()); }}>Unblock Name</Button>}
                          <Button size="sm" variant="ghost" onClick={() => { removeGateVisitor(v.deviceId, v.name); setVisitors(getGateVisitors()); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AccessControlManager;
