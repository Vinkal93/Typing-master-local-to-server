// Centralized blog store, SEO engine, schema generator
import { blogPosts as defaultBlogs, BlogPost } from "./blogData";

const ADMIN_BLOGS_KEY = "tm_admin_blogs_v2";
const MEDIA_KEY = "tm_admin_media";
const VIEWS_KEY = "tm_blog_views";

export type BlogStatus = "draft" | "published" | "scheduled";

export interface AdminBlog {
  slug: string;
  title: string;
  description: string;
  metaTitle?: string;
  content: string;
  category: string;
  tags: string[];
  focusKeyword: string;
  status: BlogStatus;
  author: string;
  scheduledAt?: number;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  views: number;
  coverImage?: string;
  faq?: { question: string; answer: string }[];
}

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  uploadedAt: number;
  size?: number;
}

// ========== STORAGE ==========
export const getAdminBlogs = (): AdminBlog[] => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_BLOGS_KEY) || "[]");
  } catch { return []; }
};

export const saveAdminBlogs = (blogs: AdminBlog[]) => {
  localStorage.setItem(ADMIN_BLOGS_KEY, JSON.stringify(blogs));
};

export const upsertBlog = (blog: AdminBlog) => {
  const blogs = getAdminBlogs();
  const idx = blogs.findIndex(b => b.slug === blog.slug);
  if (idx >= 0) blogs[idx] = blog; else blogs.push(blog);
  saveAdminBlogs(blogs);
};

export const deleteAdminBlog = (slug: string) => {
  saveAdminBlogs(getAdminBlogs().filter(b => b.slug !== slug));
};

export const getMedia = (): MediaItem[] => {
  try { return JSON.parse(localStorage.getItem(MEDIA_KEY) || "[]"); } catch { return []; }
};

export const saveMedia = (items: MediaItem[]) => {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
};

export const addMedia = (item: Omit<MediaItem, "id" | "uploadedAt">) => {
  const items = getMedia();
  const newItem: MediaItem = { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), uploadedAt: Date.now() };
  items.unshift(newItem);
  saveMedia(items);
  return newItem;
};

export const deleteMedia = (id: string) => {
  saveMedia(getMedia().filter(m => m.id !== id));
};

// ========== VIEWS ==========
export const getViews = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(VIEWS_KEY) || "{}"); } catch { return {}; }
};

export const incrementView = (slug: string) => {
  const v = getViews();
  v[slug] = (v[slug] || 0) + 1;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(v));
  // also update admin blog views
  const blogs = getAdminBlogs();
  const b = blogs.find(x => x.slug === slug);
  if (b) { b.views = v[slug]; saveAdminBlogs(blogs); }
};

// ========== MERGE PUBLIC ==========
export const getAllPublishedBlogs = (): BlogPost[] => {
  const now = Date.now();
  const adminPublished = getAdminBlogs().filter(b => {
    if (b.status === "published") return true;
    if (b.status === "scheduled" && b.scheduledAt && b.scheduledAt <= now) return true;
    return false;
  }).map<BlogPost>(b => ({
    slug: b.slug,
    title: b.title,
    description: b.description,
    content: b.content,
    category: b.category || "Articles",
    keywords: b.tags,
    date: new Date(b.publishedAt || b.scheduledAt || b.createdAt).toISOString().slice(0, 10),
    readTime: `${Math.max(1, Math.ceil(b.content.split(/\s+/).length / 200))} min read`,
    faq: b.faq || [],
    relatedSlugs: [],
  }));
  return [...adminPublished, ...defaultBlogs];
};

export const getPublishedBlog = (slug: string): BlogPost | undefined => {
  return getAllPublishedBlogs().find(b => b.slug === slug);
};

// ========== SEO ENGINE ==========
export interface SeoCheck {
  label: string;
  status: "good" | "warning" | "error";
  message: string;
  points: number;
  maxPoints: number;
}

export interface SeoReport {
  score: number;
  grade: "Green" | "Yellow" | "Red";
  checks: SeoCheck[];
  readability: { sentences: number; avgWords: number; longSentences: number; passive: number; score: number };
  keywordStats: { density: number; inTitle: boolean; inMeta: boolean; inFirstPara: boolean; inHeadings: boolean };
  contentStats: { words: number; chars: number; headings: number; images: number; links: number };
}

export const analyzeSeo = (b: Pick<AdminBlog, "title" | "description" | "content" | "focusKeyword" | "metaTitle">): SeoReport => {
  const checks: SeoCheck[] = [];
  const kw = (b.focusKeyword || "").toLowerCase().trim();
  const content = b.content || "";
  const title = (b.metaTitle || b.title || "").trim();
  const meta = (b.description || "").trim();
  const lowerContent = content.toLowerCase();
  const words = content.replace(/[#*`_>\[\]\(\)]/g, " ").split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const headings = (content.match(/^#{2,3}\s.+$/gm) || []).length;
  const images = (content.match(/!\[.*?\]\(.+?\)/g) || []).length;
  const internalLinks = (content.match(/\]\(\/[^\)]+\)/g) || []).length;
  const externalLinks = (content.match(/\]\(https?:\/\/[^\)]+\)/g) || []).length;
  const firstPara = content.split(/\n\n/).find(p => p.trim() && !p.trim().startsWith("#")) || "";

  // Title 15
  if (title.length >= 30 && title.length <= 60) checks.push({ label: "Title length", status: "good", message: `${title.length} chars (ideal 30-60)`, points: 8, maxPoints: 8 });
  else checks.push({ label: "Title length", status: "warning", message: `${title.length} chars (aim 30-60)`, points: 3, maxPoints: 8 });
  if (kw && title.toLowerCase().includes(kw)) checks.push({ label: "Keyword in title", status: "good", message: "Found", points: 7, maxPoints: 7 });
  else checks.push({ label: "Keyword in title", status: kw ? "error" : "warning", message: kw ? "Missing" : "No focus keyword set", points: 0, maxPoints: 7 });

  // Meta 10
  if (meta.length >= 120 && meta.length <= 160) checks.push({ label: "Meta description", status: "good", message: `${meta.length} chars`, points: 6, maxPoints: 6 });
  else checks.push({ label: "Meta description", status: "warning", message: `${meta.length} chars (aim 120-160)`, points: 2, maxPoints: 6 });
  if (kw && meta.toLowerCase().includes(kw)) checks.push({ label: "Keyword in meta", status: "good", message: "Found", points: 4, maxPoints: 4 });
  else checks.push({ label: "Keyword in meta", status: "warning", message: "Missing", points: 0, maxPoints: 4 });

  // Keyword density 20
  const kwOccurrences = kw ? (lowerContent.match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length : 0;
  const density = wordCount > 0 ? (kwOccurrences * (kw.split(/\s+/).length)) / wordCount * 100 : 0;
  if (density >= 0.5 && density <= 2.5) checks.push({ label: "Keyword density", status: "good", message: `${density.toFixed(2)}% (ideal)`, points: 12, maxPoints: 12 });
  else if (density > 0) checks.push({ label: "Keyword density", status: "warning", message: `${density.toFixed(2)}% (aim 0.5-2.5%)`, points: 5, maxPoints: 12 });
  else checks.push({ label: "Keyword density", status: "error", message: "Keyword not found", points: 0, maxPoints: 12 });
  if (kw && firstPara.toLowerCase().includes(kw)) checks.push({ label: "Keyword in intro", status: "good", message: "Found", points: 8, maxPoints: 8 });
  else checks.push({ label: "Keyword in intro", status: "warning", message: "Add to first paragraph", points: 0, maxPoints: 8 });

  // Content length 15
  if (wordCount >= 1200) checks.push({ label: "Content length", status: "good", message: `${wordCount} words`, points: 15, maxPoints: 15 });
  else if (wordCount >= 600) checks.push({ label: "Content length", status: "warning", message: `${wordCount} words (aim 1200+)`, points: 8, maxPoints: 15 });
  else checks.push({ label: "Content length", status: "error", message: `${wordCount} words (too short)`, points: 2, maxPoints: 15 });

  // Images 10
  if (images >= 3) checks.push({ label: "Images", status: "good", message: `${images} images`, points: 10, maxPoints: 10 });
  else if (images >= 1) checks.push({ label: "Images", status: "warning", message: `${images} (add 3+)`, points: 5, maxPoints: 10 });
  else checks.push({ label: "Images", status: "error", message: "No images", points: 0, maxPoints: 10 });

  // Internal links 10
  if (internalLinks >= 2) checks.push({ label: "Internal links", status: "good", message: `${internalLinks} links`, points: 10, maxPoints: 10 });
  else if (internalLinks === 1) checks.push({ label: "Internal links", status: "warning", message: "Add 1+ more", points: 5, maxPoints: 10 });
  else checks.push({ label: "Internal links", status: "error", message: "None", points: 0, maxPoints: 10 });

  // External links 5
  if (externalLinks >= 1) checks.push({ label: "External links", status: "good", message: `${externalLinks} links`, points: 5, maxPoints: 5 });
  else checks.push({ label: "External links", status: "warning", message: "Add authority links", points: 0, maxPoints: 5 });

  // Headings 10
  if (headings >= 3) checks.push({ label: "Heading structure", status: "good", message: `${headings} headings`, points: 10, maxPoints: 10 });
  else checks.push({ label: "Heading structure", status: "warning", message: `${headings} (aim 3+)`, points: 4, maxPoints: 10 });

  // Readability
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const avgWords = sentences.length > 0 ? wordCount / sentences.length : 0;
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;
  const passive = (content.match(/\b(was|were|been|being|is|are)\s+\w+ed\b/gi) || []).length;
  const readScore = Math.max(0, Math.min(5, 5 - longSentences * 0.3 - (avgWords > 22 ? 2 : 0)));
  checks.push({ label: "Readability", status: readScore >= 4 ? "good" : readScore >= 2 ? "warning" : "error", message: `Avg ${avgWords.toFixed(1)} w/sentence`, points: Math.round(readScore), maxPoints: 5 });

  const totalPoints = checks.reduce((s, c) => s + c.points, 0);
  const maxPoints = checks.reduce((s, c) => s + c.maxPoints, 0);
  const score = Math.round((totalPoints / maxPoints) * 100);

  return {
    score,
    grade: score >= 80 ? "Green" : score >= 50 ? "Yellow" : "Red",
    checks,
    readability: { sentences: sentences.length, avgWords, longSentences, passive, score: readScore },
    keywordStats: {
      density,
      inTitle: kw ? title.toLowerCase().includes(kw) : false,
      inMeta: kw ? meta.toLowerCase().includes(kw) : false,
      inFirstPara: kw ? firstPara.toLowerCase().includes(kw) : false,
      inHeadings: kw ? (content.match(new RegExp(`^#{2,3}.*${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*$`, "gmi")) || []).length > 0 : false,
    },
    contentStats: { words: wordCount, chars: content.length, headings, images, links: internalLinks + externalLinks },
  };
};

// ========== SCHEMA / SITEMAP ==========
const SITE_URL = "https://typingmaster2.vercel.app";

export const generateArticleSchema = (b: AdminBlog | BlogPost) => {
  const slug = (b as any).slug;
  const title = (b as any).title;
  const desc = (b as any).description;
  const date = (b as any).publishedAt ? new Date((b as any).publishedAt).toISOString() : (b as any).date;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: desc,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished: date,
    dateModified: (b as any).updatedAt ? new Date((b as any).updatedAt).toISOString() : date,
    author: { "@type": "Person", name: (b as any).author || "Vinkal Prajapati" },
    publisher: { "@type": "Organization", name: "TypeMaster", url: SITE_URL },
  };
};

export const generateBreadcrumbSchema = (slug: string, title: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/blog/${slug}` },
  ],
});

export const generateFaqSchema = (faq: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(f => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
