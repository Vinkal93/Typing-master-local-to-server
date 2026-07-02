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
import { 
  Plus, Trash2, Save, Ban, Wrench, Rocket, KeyRound, 
  ShieldAlert, Fingerprint, User, Lock as LockIcon, Copy, RefreshCw, Check, CheckCircle, XCircle 
} from "lucide-react";
import {
  AccessConfig, getAccessConfig, saveAccessConfig,
  getGateVisitors, GateVisitor, removeGateVisitor,
  blockDevice, unblockDevice, blockName, unblockName, revokeAllGrants,
} from "@/lib/accessControl";
import { db } from "@/lib/firebase";
import { 
  collection, doc, setDoc, deleteDoc, getDoc, getDocs, updateDoc, 
  onSnapshot, query, orderBy, writeBatch 
} from "firebase/firestore";

const ROUTE_OPTIONS = [
  '/fast-track', '/lessons', '/practice', '/exam', '/advanced-exam', '/games',
  '/sport-mode', '/cpct-mock', '/smart-practice', '/course', '/dashboard',
  '/typing-test', '/1-minute-typing-test', '/3-minute-typing-test', '/5-minute-typing-test',
  '/hindi-typing-test', '/english-typing-test', '/blog', '/pricing',
];

interface FirebaseLicense {
  key: string;
  isActive: boolean;
  createdAt: number;
  expiryDate: number | null;
  deviceId: string | null;
  name: string | null;
  activatedAt: number | null;
  durationMonths: number;
}

export const AccessControlManager = () => {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<AccessConfig>(getAccessConfig());
  
  // Real-time Lists from Firestore
  const [licenses, setLicenses] = useState<FirebaseLicense[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<GateVisitor[]>([]);
  
  // Creation Form State
  const [genKeyType, setGenKeyType] = useState<'random' | 'custom'>('random');
  const [customKeyVal, setCustomKeyVal] = useState('');
  const [genDuration, setGenDuration] = useState<number>(1); // In months, 0 = Lifetime
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'active' | 'expired' | 'disabled'>('all');

  // Input bindings
  const [newRoute, setNewRoute] = useState('');
  const [newComingSoon, setNewComingSoon] = useState('');
  const [manualBlockDevice, setManualBlockDevice] = useState('');
  const [manualBlockName, setManualBlockName] = useState('');
  const [newKey, setNewKey] = useState('');

  // Firestore listeners
  useEffect(() => {
    // 1. Licenses Listener
    const qLicenses = query(collection(db, "licenses"));
    const unsubLicenses = onSnapshot(qLicenses, (snap) => {
      const list: FirebaseLicense[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as FirebaseLicense);
      });
      // Sort: newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      setLicenses(list);
    }, (err) => {
      console.warn("Failed to listen to licenses collection:", err);
    });

    // 2. Visitors Listener (Synced live visitors)
    const qVisitors = query(collection(db, "visitors"));
    const unsubVisitors = onSnapshot(qVisitors, (snap) => {
      const list: GateVisitor[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as GateVisitor);
      });
      // Sort: last seen first
      list.sort((a, b) => b.lastSeen - a.lastSeen);
      setLiveVisitors(list);
    }, (err) => {
      console.warn("Failed to listen to visitors collection:", err);
    });

    return () => {
      unsubLicenses();
      unsubVisitors();
    };
  }, []);

  const save = (next: AccessConfig) => { 
    setCfg(next); 
    saveAccessConfig(next); 
    toast({ title: 'Config Saved', description: 'Updated access control configuration.' }); 
  };
  
  const patch = (p: Partial<AccessConfig>) => setCfg({ ...cfg, ...p });
  const patchContent = (p: Partial<AccessConfig['gateContent']>) => setCfg({ ...cfg, gateContent: { ...cfg.gateContent, ...p } });

  // Generate a premium random license key format: TM-XXXX-XXXX
  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TM-${p1}-${p2}`;
  };

  const handleCreateLicense = async () => {
    let key = '';
    if (genKeyType === 'random') {
      key = generateRandomKey();
    } else {
      key = customKeyVal.trim().toUpperCase();
      if (!key) {
        toast({ title: "Validation Error", description: "Please enter a key value.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      const docRef = doc(db, "licenses", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        toast({ title: "Duplicate Key", description: "This license key already exists.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // If active key is set, expiry date will calculate at activation or pre-set if needed.
      // Usually, pre-setting it based on creation date is best, or let it compute on first activation.
      // We will set expiryDate to null for fresh keys, and calculate it when the student activates it.
      const newLicense: FirebaseLicense = {
        key,
        isActive: true,
        createdAt: Date.now(),
        expiryDate: null, 
        deviceId: null,
        name: null,
        activatedAt: null,
        durationMonths: genDuration
      };

      await setDoc(docRef, newLicense);
      toast({ title: "License Created", description: `License key ${key} added successfully.` });
      setCustomKeyVal('');
    } catch (err: any) {
      toast({ title: "Firestore Error", description: err.message || "Failed to save key.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLicense = async (licenseKey: string, currentStatus: boolean) => {
    try {
      const docRef = doc(db, "licenses", licenseKey);
      await updateDoc(docRef, { isActive: !currentStatus });
      toast({ title: "License Updated", description: `${licenseKey} is now ${!currentStatus ? 'Active' : 'Disabled'}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleResetDevice = async (licenseKey: string) => {
    try {
      const docRef = doc(db, "licenses", licenseKey);
      await updateDoc(docRef, {
        deviceId: null,
        name: null,
        activatedAt: null,
        expiryDate: null
      });
      toast({ title: "Device Link Reset", description: `Cleared device binding for ${licenseKey}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteLicense = async (licenseKey: string) => {
    if (!confirm(`Are you sure you want to delete ${licenseKey}?`)) return;
    try {
      const docRef = doc(db, "licenses", licenseKey);
      await deleteDoc(docRef);
      toast({ title: "License Deleted", description: `Removed key ${licenseKey} from Firestore.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleClearVisitors = async () => {
    if (!confirm("Are you sure you want to clear the visitor registry?")) return;
    try {
      const snap = await getDocs(collection(db, "visitors"));
      const batch = writeBatch(db);
      snap.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
      toast({ title: "Logs Cleared", description: "Successfully deleted visitor entries." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copied!", description: "License key copied to clipboard." });
  };

  // Filter Logic
  const filteredLicenses = licenses.filter(lic => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      lic.key.toLowerCase().includes(q) || 
      (lic.name && lic.name.toLowerCase().includes(q)) || 
      (lic.deviceId && lic.deviceId.toLowerCase().includes(q));
    
    if (!matchSearch) return false;

    const now = Date.now();
    const isExpired = lic.expiryDate && lic.expiryDate < now;

    if (statusFilter === 'available' && (lic.deviceId || !lic.isActive || isExpired)) return false;
    if (statusFilter === 'active' && (!lic.deviceId || !lic.isActive || isExpired)) return false;
    if (statusFilter === 'expired' && !isExpired) return false;
    if (statusFilter === 'disabled' && lic.isActive) return false;

    return true;
  });

  return (
    <Tabs defaultValue="db-licenses" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 border border-border/80 rounded-lg">
        <TabsTrigger value="db-licenses" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm">
          <KeyRound className="h-3.5 w-3.5 text-primary" /> Firestore Licenses ({licenses.length})
        </TabsTrigger>
        <TabsTrigger value="license-settings" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm">
          <LockIcon className="h-3.5 w-3.5 text-amber-500" /> Gate Config
        </TabsTrigger>
        <TabsTrigger value="site" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm">
          <Wrench className="h-3.5 w-3.5" /> Maintenance & Coming Soon
        </TabsTrigger>
        <TabsTrigger value="blocked" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm">
          <Ban className="h-3.5 w-3.5 text-destructive" /> Blocked List
        </TabsTrigger>
        <TabsTrigger value="visitors" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm">
          <User className="h-3.5 w-3.5" /> Live Visitors ({liveVisitors.length})
        </TabsTrigger>
      </TabsList>

      {/* FIRESTORE LICENSE DATABASE */}
      <TabsContent value="db-licenses" className="space-y-4">
        {/* Metric Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Keys', val: licenses.length, color: 'text-primary' },
            { label: 'Activated (In Use)', val: licenses.filter(l => l.deviceId && l.isActive && (!l.expiryDate || l.expiryDate > Date.now())).length, color: 'text-green-500' },
            { label: 'Expired Keys', val: licenses.filter(l => l.expiryDate && l.expiryDate < Date.now()).length, color: 'text-destructive' },
            { label: 'Available Keys', val: licenses.filter(l => !l.deviceId && l.isActive).length, color: 'text-amber-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.val}</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${stat.color}`}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Generator Card */}
          <Card className="lg:col-span-1 border-border/60 shadow-md bg-card/30">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Generate License Keys</CardTitle>
              <CardDescription>Add customized or randomized keys with specific validity durations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Key Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={genKeyType === 'random' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setGenKeyType('random')}
                    className="text-xs"
                  >
                    Random (TM-XXXX)
                  </Button>
                  <Button 
                    variant={genKeyType === 'custom' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setGenKeyType('custom')}
                    className="text-xs"
                  >
                    Custom Value
                  </Button>
                </div>
              </div>

              {genKeyType === 'custom' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="custom-key-val">Custom License String</Label>
                  <Input 
                    id="custom-key-val"
                    placeholder="E.G. STUDENT-FREE-99" 
                    value={customKeyVal} 
                    onChange={e => setCustomKeyVal(e.target.value)}
                    className="uppercase font-mono"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="key-duration" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Validity Period</Label>
                <select 
                  id="key-duration"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  value={genDuration}
                  onChange={e => setGenDuration(Number(e.target.value))}
                >
                  <option value={1}>1 Month (30 Days)</option>
                  <option value={3}>3 Months (90 Days)</option>
                  <option value={6}>6 Months (180 Days)</option>
                  <option value={12}>1 Year (365 Days)</option>
                  <option value={0}>Lifetime (Never Expires)</option>
                </select>
              </div>

              <Button 
                onClick={handleCreateLicense} 
                disabled={loading}
                className="w-full shadow-lg shadow-primary/10"
              >
                {loading ? "Generating..." : "Generate & Save to Firestore"}
              </Button>
            </CardContent>
          </Card>

          {/* Licenses Database Table */}
          <Card className="lg:col-span-2 border-border/60 shadow-md">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Key Database</CardTitle>
                <CardDescription>Search and manage status, device locks, and expirations.</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <Input 
                  placeholder="Search keys/names..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 max-w-xs text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Table Filters */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(['all', 'available', 'active', 'expired', 'disabled'] as const).map(f => (
                  <Button 
                    key={f}
                    variant={statusFilter === f ? 'default' : 'outline'}
                    size="xs"
                    onClick={() => setStatusFilter(f)}
                    className="capitalize text-[10px] h-7 px-2.5"
                  >
                    {f}
                  </Button>
                ))}
              </div>

              {filteredLicenses.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                  No matching licenses found in Firestore.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/80 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">License Key</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                        <th className="py-2.5 px-2">Assigned User</th>
                        <th className="py-2.5 px-2">Expiry Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredLicenses.map((lic) => {
                        const now = Date.now();
                        const isExpired = lic.expiryDate && lic.expiryDate < now;
                        
                        let badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
                        let statusText = "Fresh";

                        if (!lic.isActive) {
                          badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                          statusText = "Disabled";
                        } else if (isExpired) {
                          badgeColor = "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
                          statusText = "Expired";
                        } else if (lic.deviceId) {
                          badgeColor = "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
                          statusText = "In Use";
                        }

                        return (
                          <tr key={lic.key} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-[120px] sm:max-w-none">{lic.key}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 hover:bg-muted" 
                                  onClick={() => copyToClipboard(lic.key)}
                                >
                                  {copiedKey === lic.key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge className={`text-[9px] border px-1.5 py-0.5 font-bold uppercase ${badgeColor}`}>
                                {statusText}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              {lic.name ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-foreground">{lic.name}</p>
                                  <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[80px]" title={lic.deviceId || ''}>
                                    {lic.deviceId}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-2 font-medium">
                              {lic.expiryDate ? (
                                <div className="space-y-0.5">
                                  <p className={isExpired ? 'text-destructive' : 'text-foreground'}>
                                    {new Date(lic.expiryDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {isExpired ? 'Ended' : lic.durationMonths > 0 ? `${lic.durationMonths}M limit` : 'Monthly'}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sets on activation</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  variant="outline" 
                                  size="xs"
                                  onClick={() => handleToggleLicense(lic.key, lic.isActive)}
                                  title={lic.isActive ? "Deactivate key" : "Activate key"}
                                  className="h-7 px-2"
                                >
                                  {lic.isActive ? <XCircle className="h-3.5 w-3.5 text-amber-500" /> : <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                                </Button>
                                {lic.deviceId && (
                                  <Button 
                                    variant="outline" 
                                    size="xs"
                                    onClick={() => handleResetDevice(lic.key)}
                                    title="Unbind device (Allow reuse)"
                                    className="h-7 px-2"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteLicense(lic.key)}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* LICENSE CONFIG SWITCHES */}
      <TabsContent value="license-settings" className="space-y-4">
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> License Gate Configuration</CardTitle>
            <CardDescription>Toggle licensing checks and manage public / private route access parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
              <div>
                <Label className="font-bold flex items-center gap-2 text-foreground"><LockIcon className="h-4 w-4 text-destructive" /> Global Gate Lock (Whole Website)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">When ON, all pages except public ones are locked and require a license key. Overrides tab config.</p>
              </div>
              <Switch checked={cfg.globalLock} onCheckedChange={v => { const n = { ...cfg, globalLock: v, lockVersion: (cfg.lockVersion || 1) + 1 }; save(n); }} />
            </div>

            <div className="flex items-center justify-between p-4 border border-border/80 rounded-lg bg-muted/20">
              <div>
                <Label className="font-bold text-foreground">Require License Key for Premium Tabs</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enforces licensing checks on Course, Lessons, and Fast Track sections.</p>
              </div>
              <Switch checked={cfg.licenseGateEnabled} onCheckedChange={v => patch({ licenseGateEnabled: v })} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => { revokeAllGrants(); setCfg(getAccessConfig()); toast({ title: 'Lock Applied', description: 'Revoked access and logged out all existing device grants.' }); }}>
                <RefreshCw className="h-4 w-4 mr-1.5 text-destructive" /> Reset All Device Sessions
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Fallback License Keys (Offline)</Label>
                <div className="space-y-2 mt-2">
                  {cfg.licenseKeys.map((k, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={k} onChange={e => { const n = [...cfg.licenseKeys]; n[i] = e.target.value; patch({ licenseKeys: n }); }} className="font-mono uppercase h-9" />
                      <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => patch({ licenseKeys: cfg.licenseKeys.filter((_, x) => x !== i) })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Add backup local key" className="font-mono uppercase h-9" />
                    <Button size="sm" onClick={() => { if (newKey.trim()) { patch({ licenseKeys: [...cfg.licenseKeys, newKey.trim()] }); setNewKey(''); } }}>
                      Add Backup
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Other Custom Gated Routes</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {cfg.gatedRoutes.map(r => (
                    <Badge key={r} variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
                      {r}
                      <button onClick={() => patch({ gatedRoutes: cfg.gatedRoutes.filter(x => x !== r) })}>
                        <Trash2 className="h-3 w-3 text-destructive hover:scale-110" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <select className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-xs" value={newRoute} onChange={e => setNewRoute(e.target.value)}>
                    <option value="">-- select route --</option>
                    {ROUTE_OPTIONS.filter(r => !cfg.gatedRoutes.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <Button size="sm" onClick={() => { if (newRoute) { patch({ gatedRoutes: [...cfg.gatedRoutes, newRoute] }); setNewRoute(''); } }}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg space-y-4 bg-muted/10">
              <p className="font-bold text-sm text-foreground">Lock Screen Display Message</p>
              <div><Label className="text-xs">Card Heading</Label><Input value={cfg.gateContent.heading} onChange={e => patchContent({ heading: e.target.value })} className="h-9 mt-1" /></div>
              <div><Label className="text-xs">Lock Explanation Paragraph</Label><Textarea rows={3} value={cfg.gateContent.paragraph} onChange={e => patchContent({ paragraph: e.target.value })} className="mt-1" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label className="text-xs">Placeholder Text</Label><Input value={cfg.gateContent.placeholder} onChange={e => patchContent({ placeholder: e.target.value })} className="h-9 mt-1" /></div>
                <div><Label className="text-xs">Unlock Button Text</Label><Input value={cfg.gateContent.buttonLabel} onChange={e => patchContent({ buttonLabel: e.target.value })} className="h-9 mt-1" /></div>
              </div>
              <div><Label className="text-xs">Incorrect Key Error Message</Label><Input value={cfg.gateContent.errorMessage} onChange={e => patchContent({ errorMessage: e.target.value })} className="h-9 mt-1" /></div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => save(cfg)} className="shadow-md"><Save className="h-4 w-4 mr-2" /> Save Gate Config</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SITE MODES (MAINTENANCE) */}
      <TabsContent value="site" className="space-y-4">
        <Card className="border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Maintenance Mode</CardTitle>
            <CardDescription>Enable or disable maintenance cover page. Blocks all students except admin paths.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10">
              <div>
                <Label className="font-bold text-foreground">Enable Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle maintenance overlay immediately on site.</p>
              </div>
              <Switch checked={cfg.maintenanceMode} onCheckedChange={v => patch({ maintenanceMode: v })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maint-msg">Maintenance Message</Label>
              <Textarea id="maint-msg" rows={3} value={cfg.maintenanceMessage} onChange={e => patch({ maintenanceMessage: e.target.value })} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4 text-violet-500" /> Coming Soon Screens</CardTitle>
            <CardDescription>Select specific pages that should show a temporary "Coming Soon" cover screen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {cfg.comingSoonPages.map(p => (
                <Badge key={p} variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
                  {p}
                  <button onClick={() => patch({ comingSoonPages: cfg.comingSoonPages.filter(x => x !== p) })}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </Badge>
              ))}
              {cfg.comingSoonPages.length === 0 && <p className="text-xs text-muted-foreground py-2">No routes locked under coming soon mode.</p>}
            </div>
            <div className="flex gap-2">
              <select className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-xs" value={newComingSoon} onChange={e => setNewComingSoon(e.target.value)}>
                <option value="">-- select route --</option>
                {ROUTE_OPTIONS.filter(r => !cfg.comingSoonPages.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button size="sm" onClick={() => { if (newComingSoon) { patch({ comingSoonPages: [...cfg.comingSoonPages, newComingSoon] }); setNewComingSoon(''); } }}>
                Add
              </Button>
            </div>
            <div className="space-y-1">
              <Label htmlFor="soon-msg">Coming Soon Display Message</Label>
              <Textarea id="soon-msg" rows={2} value={cfg.comingSoonMessage} onChange={e => patch({ comingSoonMessage: e.target.value })} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button onClick={() => save(cfg)} className="shadow-md"><Save className="h-4 w-4 mr-2" /> Save Site Mode</Button>
        </div>
      </TabsContent>

      {/* BLOCKED USERS */}
      <TabsContent value="blocked" className="space-y-4">
        <Card className="border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Ban className="h-4 w-4 text-destructive" /> Blocked Devices / Names</CardTitle>
            <CardDescription>Manually restrict specific hardware fingerprints or user names from accessing the software.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="block-msg">Blocked Overlay Text Message</Label>
              <Textarea id="block-msg" rows={3} value={cfg.blockedMessage} onChange={e => patch({ blockedMessage: e.target.value })} className="mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Blocked Devices ({cfg.blockedDeviceIds.length})</Label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-border p-2 rounded-lg bg-muted/10">
                  {cfg.blockedDeviceIds.map(d => (
                    <div key={d} className="flex items-center justify-between p-2 border border-border bg-card rounded text-xs">
                      <span className="font-mono truncate">{d}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { unblockDevice(d); setCfg(getAccessConfig()); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {cfg.blockedDeviceIds.length === 0 && <p className="text-xs text-muted-foreground py-2 text-center">No devices blocked.</p>}
                </div>
                <div className="flex gap-2">
                  <Input value={manualBlockDevice} onChange={e => setManualBlockDevice(e.target.value)} placeholder="E.G. DEV-8F2B-A19" className="h-9 text-xs" />
                  <Button size="sm" onClick={() => { if (manualBlockDevice.trim()) { blockDevice(manualBlockDevice.trim()); setManualBlockDevice(''); setCfg(getAccessConfig()); } }} className="h-9">Block</Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Blocked Name Patterns ({cfg.blockedNames.length})</Label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-border p-2 rounded-lg bg-muted/10">
                  {cfg.blockedNames.map(n => (
                    <div key={n} className="flex items-center justify-between p-2 border border-border bg-card rounded text-xs">
                      <span>{n}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { unblockName(n); setCfg(getAccessConfig()); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {cfg.blockedNames.length === 0 && <p className="text-xs text-muted-foreground py-2 text-center">No names blocked.</p>}
                </div>
                <div className="flex gap-2">
                  <Input value={manualBlockName} onChange={e => setManualBlockName(e.target.value)} placeholder="E.G. John Doe" className="h-9 text-xs" />
                  <Button size="sm" onClick={() => { if (manualBlockName.trim()) { blockName(manualBlockName.trim()); setManualBlockName(''); setCfg(getAccessConfig()); } }} className="h-9">Block</Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => save(cfg)} className="shadow-md"><Save className="h-4 w-4 mr-2" /> Save Block Configuration</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* LIVE VISITORS */}
      <TabsContent value="visitors" className="space-y-4">
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Live Visitor Registry</CardTitle>
              <CardDescription>Real-time monitor of students attempting or accessing gated routes.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearVisitors} className="text-xs">
              Clear Visitor History
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {liveVisitors.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No live visitors logged in Firestore yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {liveVisitors.map((v, i) => {
                  const isDeviceBlocked = cfg.blockedDeviceIds.includes(v.deviceId);
                  const isNameBlocked = cfg.blockedNames.some(n => n.toLowerCase() === v.name.toLowerCase());
                  
                  // Check if active (last seen in last 15 seconds)
                  const isActive = Date.now() - v.lastSeen < 15000;

                  return (
                    <div key={i} className="p-3.5 border border-border/80 rounded-lg bg-card/30 flex flex-col justify-between gap-3 hover:border-primary/30 transition-all">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{v.name}</span>
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} title={isActive ? "Active Now" : "Offline"} />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {v.unlocked ? (
                              <Badge className="text-[9px] bg-green-500/10 text-green-500 border-green-500/20 font-bold uppercase px-1.5 py-0.5">Access OK</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-500 bg-amber-500/5 font-bold uppercase px-1.5 py-0.5">Attempt</Badge>
                            )}
                            {isDeviceBlocked && <Badge className="text-[9px] bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase px-1.5 py-0.5">Dev Blocked</Badge>}
                            {isNameBlocked && <Badge className="text-[9px] bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase px-1.5 py-0.5">Name Blocked</Badge>}
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-[11px] text-muted-foreground leading-normal">
                          <p className="font-mono text-muted-foreground/75 truncate bg-muted/40 py-0.5 px-1.5 rounded w-max">{v.deviceId}</p>
                          <p>Current Tab: <span className="font-semibold text-foreground">{v.route}</span></p>
                          <p>Resolution: <span className="font-medium text-foreground/80">{v.screen} ({v.language})</span></p>
                          <p>Last Activity: <span className="font-medium text-foreground/80">{new Date(v.lastSeen).toLocaleTimeString()}</span></p>
                          {v.licenseUsed && (
                            <p>Key Entered: <span className="font-mono text-primary font-bold bg-primary/5 border border-primary/10 px-1 py-0.5 rounded">{v.licenseUsed}</span></p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-2 border-t border-border/40">
                        <Button 
                          size="xs" 
                          variant={isDeviceBlocked ? 'outline' : 'destructive'} 
                          onClick={() => {
                            if (isDeviceBlocked) unblockDevice(v.deviceId);
                            else blockDevice(v.deviceId);
                            setCfg(getAccessConfig());
                          }}
                          className="flex-1 text-[10px] h-7 px-1"
                        >
                          {isDeviceBlocked ? "Unblock Dev" : "Block Device"}
                        </Button>
                        <Button 
                          size="xs" 
                          variant={isNameBlocked ? 'outline' : 'destructive'} 
                          onClick={() => {
                            if (isNameBlocked) unblockName(v.name);
                            else blockName(v.name);
                            setCfg(getAccessConfig());
                          }}
                          className="flex-1 text-[10px] h-7 px-1"
                        >
                          {isNameBlocked ? "Unblock Name" : "Block Name"}
                        </Button>
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
