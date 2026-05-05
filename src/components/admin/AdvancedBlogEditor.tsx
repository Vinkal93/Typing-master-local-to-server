import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Code, Quote,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, AlertCircle, CheckCircle,
  Save, Send, Calendar, Eye, FileCode, X
} from "lucide-react";
import { AdminBlog, analyzeSeo, slugify, upsertBlog, SeoReport, generateArticleSchema, generateBreadcrumbSchema, generateFaqSchema } from "@/lib/adminBlogStore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  initial?: AdminBlog | null;
  onSaved: () => void;
  onCancel?: () => void;
  onPickMedia?: (callback: (url: string) => void) => void;
}

const emptyBlog = (): AdminBlog => ({
  slug: "", title: "", description: "", metaTitle: "", content: "",
  category: "Tips & Tricks", tags: [], focusKeyword: "",
  status: "draft", author: "Admin",
  createdAt: Date.now(), updatedAt: Date.now(), views: 0, faq: [],
});

export const AdvancedBlogEditor = ({ initial, onSaved, onCancel, onPickMedia }: Props) => {
  const [blog, setBlog] = useState<AdminBlog>(initial || emptyBlog());
  const [tagInput, setTagInput] = useState("");
  const [faqInput, setFaqInput] = useState({ question: "", answer: "" });
  const [report, setReport] = useState<SeoReport>(analyzeSeo(blog));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setReport(analyzeSeo(blog)), 250);
    return () => clearTimeout(t);
  }, [blog.title, blog.description, blog.content, blog.focusKeyword, blog.metaTitle]);

  const update = (patch: Partial<AdminBlog>) => setBlog(b => ({ ...b, ...patch, updatedAt: Date.now() }));

  const insertAtCursor = (before: string, after = "", placeholder = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = blog.content.slice(start, end) || placeholder;
    const next = blog.content.slice(0, start) + before + sel + after + blog.content.slice(end);
    update({ content: next });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const handlePickMedia = () => {
    if (onPickMedia) {
      onPickMedia((url) => insertAtCursor(`![image](${url})`, "", ""));
    } else {
      const url = prompt("Image URL:");
      if (url) insertAtCursor(`![image](${url})`);
    }
  };

  const save = (status: AdminBlog["status"]) => {
    if (!blog.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const slug = blog.slug || slugify(blog.title);
    const finalBlog: AdminBlog = {
      ...blog,
      slug,
      status,
      publishedAt: status === "published" ? (blog.publishedAt || Date.now()) : blog.publishedAt,
      updatedAt: Date.now(),
    };
    upsertBlog(finalBlog);
    toast({ title: status === "published" ? "Published!" : status === "scheduled" ? "Scheduled" : "Draft saved" });
    onSaved();
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    update({ tags: [...new Set([...blog.tags, tagInput.trim()])] });
    setTagInput("");
  };

  const addFaq = () => {
    if (!faqInput.question.trim() || !faqInput.answer.trim()) return;
    update({ faq: [...(blog.faq || []), { ...faqInput }] });
    setFaqInput({ question: "", answer: "" });
  };

  const scoreColor = report.score >= 80 ? "text-[hsl(142,71%,45%)]" : report.score >= 50 ? "text-[hsl(45,80%,50%)]" : "text-destructive";
  const scoreBg = report.score >= 80 ? "bg-[hsl(142,71%,45%)]" : report.score >= 50 ? "bg-[hsl(45,80%,50%)]" : "bg-destructive";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{initial ? "Edit Post" : "New Post"}</CardTitle>
              {onCancel && <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={blog.title}
                onChange={e => update({ title: e.target.value, slug: blog.slug || slugify(e.target.value) })}
                placeholder="An engaging blog title with focus keyword" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={blog.slug} onChange={e => update({ slug: slugify(e.target.value) })} placeholder="url-slug" />
              </div>
              <div>
                <Label>Focus Keyword</Label>
                <Input value={blog.focusKeyword} onChange={e => update({ focusKeyword: e.target.value })} placeholder="e.g. typing speed test" />
              </div>
            </div>
            <div>
              <Label>Meta Description ({blog.description.length}/160)</Label>
              <Textarea value={blog.description} onChange={e => update({ description: e.target.value })}
                placeholder="120-160 chars including focus keyword" className="h-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={blog.category} onValueChange={v => update({ category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Tips & Tricks", "Guides", "Tutorials", "Exam Prep", "Hindi Typing", "Productivity", "News"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Author</Label>
                <Input value={blog.author} onChange={e => update({ author: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag and press Enter" />
                <Button type="button" size="sm" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {blog.tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs gap-1">
                    {t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => update({ tags: blog.tags.filter(x => x !== t) })} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={blog.coverImage || ""} onChange={e => update({ coverImage: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Toolbar + Editor */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap gap-1 border-b pb-2">
              {[
                { icon: Heading1, label: "H1", action: () => insertAtCursor("\n# ", "\n", "Heading 1") },
                { icon: Heading2, label: "H2", action: () => insertAtCursor("\n## ", "\n", "Heading 2") },
                { icon: Heading3, label: "H3", action: () => insertAtCursor("\n### ", "\n", "Heading 3") },
                { icon: Bold, label: "B", action: () => insertAtCursor("**", "**", "bold") },
                { icon: Italic, label: "I", action: () => insertAtCursor("*", "*", "italic") },
                { icon: List, label: "UL", action: () => insertAtCursor("\n- ", "\n", "item") },
                { icon: ListOrdered, label: "OL", action: () => insertAtCursor("\n1. ", "\n", "item") },
                { icon: Quote, label: "Quote", action: () => insertAtCursor("\n> ", "\n", "quote") },
                { icon: Code, label: "Code", action: () => insertAtCursor("\n```\n", "\n```\n", "code") },
                { icon: LinkIcon, label: "Link", action: () => { const u = prompt("URL:") || ""; insertAtCursor("[", `](${u})`, "link text"); } },
                { icon: ImageIcon, label: "Image", action: handlePickMedia },
                { icon: TableIcon, label: "Table", action: () => insertAtCursor("\n| Col 1 | Col 2 |\n| --- | --- |\n| A | B |\n") },
                { icon: AlertCircle, label: "Callout", action: () => insertAtCursor("\n> 💡 **Tip:** ", "\n", "important note") },
              ].map((b, i) => (
                <Button key={i} type="button" size="sm" variant="ghost" className="h-8 px-2" title={b.label} onClick={b.action}>
                  <b.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write"><FileCode className="h-3 w-3 mr-1" /> Write</TabsTrigger>
                <TabsTrigger value="preview"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea ref={textareaRef} value={blog.content} onChange={e => update({ content: e.target.value })}
                  placeholder="Write content in Markdown. Use the toolbar above..."
                  className="min-h-[420px] font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-1">{report.contentStats.words} words • {report.contentStats.chars} chars • {report.contentStats.headings} headings • {report.contentStats.images} images</p>
              </TabsContent>
              <TabsContent value="preview">
                <div className="prose prose-sm dark:prose-invert max-w-none min-h-[420px] p-4 border rounded">
                  {renderPreview(blog.content)}
                </div>
              </TabsContent>
              <TabsContent value="faq" className="space-y-3">
                <div className="grid gap-2">
                  <Input placeholder="Question" value={faqInput.question} onChange={e => setFaqInput({ ...faqInput, question: e.target.value })} />
                  <Textarea placeholder="Answer" value={faqInput.answer} onChange={e => setFaqInput({ ...faqInput, answer: e.target.value })} className="h-20" />
                  <Button size="sm" onClick={addFaq}>Add FAQ</Button>
                </div>
                <div className="space-y-2">
                  {(blog.faq || []).map((f, i) => (
                    <div key={i} className="p-2 border rounded flex justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{f.question}</p>
                        <p className="text-xs text-muted-foreground">{f.answer}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => update({ faq: (blog.faq || []).filter((_, x) => x !== i) })}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="schema">
                <pre className="text-[10px] bg-muted p-3 rounded overflow-x-auto max-h-[420px]">
                  {JSON.stringify({
                    article: generateArticleSchema(blog),
                    breadcrumb: generateBreadcrumbSchema(blog.slug, blog.title),
                    faq: (blog.faq || []).length > 0 ? generateFaqSchema(blog.faq || []) : null,
                  }, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Publish actions */}
        <Card className="border-border">
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local"
                value={blog.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : ""}
                onChange={e => update({ scheduledAt: e.target.value ? new Date(e.target.value).getTime() : undefined })} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => save("published")} className="gap-1"><Send className="h-4 w-4" /> Publish Now</Button>
              <Button variant="outline" onClick={() => save("draft")} className="gap-1"><Save className="h-4 w-4" /> Save Draft</Button>
              <Button variant="outline" onClick={() => save("scheduled")} disabled={!blog.scheduledAt} className="gap-1"><Calendar className="h-4 w-4" /> Schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-20 self-start">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live SEO Score</CardTitle>
            <CardDescription>{report.grade} • {report.contentStats.words} words</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-3">
              <p className={`text-5xl font-bold ${scoreColor}`}>{report.score}</p>
              <p className="text-xs text-muted-foreground">/ 100</p>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className={`h-2 ${scoreBg}`} style={{ width: `${report.score}%` }} />
              </div>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {report.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                  {c.status === "good" ? <CheckCircle className="h-3.5 w-3.5 text-[hsl(142,71%,45%)] shrink-0 mt-0.5" /> :
                   c.status === "warning" ? <AlertCircle className="h-3.5 w-3.5 text-[hsl(45,80%,50%)] shrink-0 mt-0.5" /> :
                   <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{c.label}</p>
                    <p className="text-muted-foreground">{c.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{c.points}/{c.maxPoints}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Keyword Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">
            <Row label="Density" value={`${report.keywordStats.density.toFixed(2)}%`} good={report.keywordStats.density >= 0.5 && report.keywordStats.density <= 2.5} />
            <Row label="In Title" good={report.keywordStats.inTitle} />
            <Row label="In Meta" good={report.keywordStats.inMeta} />
            <Row label="In Intro" good={report.keywordStats.inFirstPara} />
            <Row label="In Headings" good={report.keywordStats.inHeadings} />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Readability</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">
            <Row label="Sentences" value={report.readability.sentences.toString()} />
            <Row label="Avg words/sent" value={report.readability.avgWords.toFixed(1)} good={report.readability.avgWords <= 22} />
            <Row label="Long sentences" value={report.readability.longSentences.toString()} good={report.readability.longSentences === 0} />
            <Row label="Passive voice" value={report.readability.passive.toString()} good={report.readability.passive < 5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Row = ({ label, value, good }: { label: string; value?: string; good?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <span className="flex items-center gap-1 font-medium text-foreground">
      {value}
      {good !== undefined && (good ? <CheckCircle className="h-3 w-3 text-[hsl(142,71%,45%)]" /> : <AlertCircle className="h-3 w-3 text-[hsl(45,80%,50%)]" />)}
    </span>
  </div>
);

const renderPreview = (md: string) => {
  return md.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <br key={i} />;
    if (t.startsWith("### ")) return <h3 key={i}>{t.slice(4)}</h3>;
    if (t.startsWith("## ")) return <h2 key={i}>{t.slice(3)}</h2>;
    if (t.startsWith("# ")) return <h1 key={i}>{t.slice(2)}</h1>;
    if (t.startsWith("> ")) return <blockquote key={i}>{t.slice(2)}</blockquote>;
    if (t.startsWith("- ") || t.startsWith("* ")) return <li key={i}>{t.slice(2)}</li>;
    if (/^!\[.*?\]\(.+?\)/.test(t)) {
      const m = t.match(/!\[(.*?)\]\((.+?)\)/);
      return m ? <img key={i} src={m[2]} alt={m[1]} className="rounded my-2 max-h-64" /> : null;
    }
    return <p key={i} dangerouslySetInnerHTML={{
      __html: t
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    }} />;
  });
};

export default AdvancedBlogEditor;
