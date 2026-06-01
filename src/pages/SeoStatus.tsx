import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

const SITE = "https://typingmaster2.vercel.app";

const ROUTES = [
  "/", "/typing-test", "/typing-practice", "/1-minute-typing-test",
  "/3-minute-typing-test", "/5-minute-typing-test", "/hindi-typing-test",
  "/english-typing-test", "/wpm-calculator", "/accuracy-calculator",
  "/lessons", "/practice", "/exam", "/games", "/progress", "/keyboard-guide",
  "/blog", "/about", "/contact", "/privacy-policy", "/terms-and-conditions",
  "/disclaimer", "/course", "/dashboard", "/smart-practice", "/sport-mode",
  "/finger-heatmap", "/achievements", "/leaderboard", "/error-analysis",
  "/cpct-mock", "/fast-track", "/about-developer", "/advanced-exam",
];

type Status = "pass" | "fail" | "warn" | "checking";

interface CheckRow {
  label: string;
  status: Status;
  detail?: string;
}

const StatusIcon = ({ s }: { s: Status }) => {
  if (s === "pass") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (s === "fail") return <XCircle className="h-4 w-4 text-red-500" />;
  if (s === "warn") return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
};

const SeoStatus = () => {
  const [global, setGlobal] = useState<CheckRow[]>([]);
  const [routes, setRoutes] = useState<Record<string, Status>>({});
  const [schemaCount, setSchemaCount] = useState(0);

  useEffect(() => {
    const checks: CheckRow[] = [];
    // SSL
    checks.push({
      label: "SSL / HTTPS",
      status: window.location.protocol === "https:" ? "pass" : "warn",
      detail: window.location.protocol,
    });
    // Canonical domain
    checks.push({
      label: "Canonical Domain",
      status: "pass",
      detail: SITE,
    });
    // Schema markup
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');
    setSchemaCount(schemas.length);
    checks.push({
      label: "JSON-LD Schemas",
      status: schemas.length >= 3 ? "pass" : "warn",
      detail: `${schemas.length} schema(s) detected`,
    });
    // Meta description
    const desc = document.querySelector('meta[name="description"]');
    checks.push({
      label: "Meta Description",
      status: desc?.getAttribute("content") ? "pass" : "fail",
    });
    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogImg = document.querySelector('meta[property="og:image"]');
    checks.push({
      label: "OpenGraph Tags",
      status: ogTitle && ogImg ? "pass" : "warn",
    });
    // Twitter card
    const tw = document.querySelector('meta[name="twitter:card"]');
    checks.push({
      label: "Twitter Card",
      status: tw ? "pass" : "warn",
    });
    // Viewport
    checks.push({
      label: "Mobile Viewport",
      status: document.querySelector('meta[name="viewport"]') ? "pass" : "fail",
    });
    // Favicon
    checks.push({
      label: "Favicon",
      status: document.querySelector('link[rel="icon"]') ? "pass" : "fail",
    });
    setGlobal(checks);

    // Sitemap & robots
    Promise.all([
      fetch("/sitemap.xml").then((r) => r.ok).catch(() => false),
      fetch("/robots.txt").then((r) => r.ok).catch(() => false),
    ]).then(([sm, rb]) => {
      setGlobal((prev) => [
        ...prev,
        { label: "sitemap.xml", status: sm ? "pass" : "fail" },
        { label: "robots.txt", status: rb ? "pass" : "fail" },
      ]);
    });

    // Route checks
    const r: Record<string, Status> = {};
    ROUTES.forEach((p) => (r[p] = "checking"));
    setRoutes(r);
    ROUTES.forEach((p) => {
      fetch(p, { method: "HEAD" })
        .then((res) =>
          setRoutes((prev) => ({ ...prev, [p]: res.ok ? "pass" : "fail" }))
        )
        .catch(() => setRoutes((prev) => ({ ...prev, [p]: "fail" })));
    });
  }, []);

  const passCount = global.filter((c) => c.status === "pass").length;
  const score = global.length ? Math.round((passCount / global.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="SEO Status Report — Typing Master"
        description="Live SEO audit: schema coverage, sitemap, robots, SSL, and per-route status for Typing Master by Vinkal Prajapati."
        keywords="seo report, schema coverage, sitemap status, typing master seo"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "SEO Status", path: "/seo-status" }]}
        noindex
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SEO Status Report</h1>
          <p className="text-muted-foreground">
            Live audit of schema markup, sitemap, robots, SSL and per-route health.
          </p>
        </header>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall SEO Health</p>
              <p className="text-5xl font-bold text-primary">{score}%</p>
            </div>
            <Badge variant={score >= 90 ? "default" : "secondary"} className="text-lg px-4 py-2">
              {score >= 90 ? "Excellent" : score >= 70 ? "Good" : "Needs Work"}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Core Checks</h2>
          <div className="space-y-2">
            {global.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded border border-border">
                <div className="flex items-center gap-3">
                  <StatusIcon s={c.status} />
                  <span className="font-medium">{c.label}</span>
                </div>
                {c.detail && <span className="text-sm text-muted-foreground">{c.detail}</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">External Validators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Google Rich Results Test", url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE)}` },
              { name: "Schema.org Validator", url: `https://validator.schema.org/#url=${encodeURIComponent(SITE)}` },
              { name: "PageSpeed Insights", url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(SITE)}` },
              { name: "Facebook Sharing Debugger", url: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(SITE)}` },
              { name: "Twitter Card Validator", url: `https://cards-dev.twitter.com/validator` },
              { name: "LinkedIn Post Inspector", url: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(SITE)}` },
            ].map((v) => (
              <a key={v.name} href={v.url} target="_blank" rel="noopener noreferrer"
                className="p-3 rounded border border-border hover:bg-accent transition text-sm font-medium">
                → {v.name}
              </a>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Route Coverage ({ROUTES.length} routes)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ROUTES.map((p) => (
              <div key={p} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                <span className="font-mono truncate">{p}</span>
                <StatusIcon s={routes[p] || "checking"} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {schemaCount} schema blocks loaded on this page.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SeoStatus;
