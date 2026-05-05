import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import AdBanner from "@/components/AdBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRelatedPosts } from "@/lib/blogData";
import { getPublishedBlog, getAllPublishedBlogs, incrementView, generateArticleSchema, generateBreadcrumbSchema, generateFaqSchema } from "@/lib/adminBlogStore";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getPublishedBlog(slug || "");

  useEffect(() => {
    if (post) {
      document.title = post.title;
      incrementView(post.slug);
      // Inject JSON-LD schema
      const schemas = [
        generateArticleSchema(post as any),
        generateBreadcrumbSchema(post.slug, post.title),
        ...(post.faq?.length ? [generateFaqSchema(post.faq)] : []),
      ];
      const scripts = schemas.map(s => {
        const el = document.createElement("script");
        el.type = "application/ld+json";
        el.text = JSON.stringify(s);
        document.head.appendChild(el);
        return el;
      });
      return () => { scripts.forEach(s => s.remove()); };
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center flex-1">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate("/blog")}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allPosts = getAllPublishedBlogs();
  const related = post.relatedSlugs?.length ? getRelatedPosts(post) : allPosts.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  // Generate TOC from content
  const headings = post.content.match(/^## .+$/gm)?.map(h => h.replace("## ", "")) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>

          <article className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readTime}
                </span>
                <span className="text-sm text-muted-foreground">{post.date}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              <p className="text-lg text-muted-foreground">{post.description}</p>
            </div>

            {/* Table of Contents */}
            {headings.length > 0 && (
              <Card className="mb-8">
                <CardHeader><CardTitle className="text-lg">📑 Table of Contents</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {headings.map((h, i) => (
                      <li key={i} className="text-primary hover:underline cursor-pointer text-sm">• {h}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <AdBanner slot="5000000002" format="horizontal" className="my-6" />

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
              {post.content.split("\n").map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-foreground mt-6 mb-3">{trimmed.replace("### ", "")}</h3>;
                if (trimmed.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-foreground mt-8 mb-4">{trimmed.replace("## ", "")}</h2>;
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) return <li key={i} className="text-muted-foreground ml-5">{trimmed.replace(/^[-*] /, "")}</li>;
                if (trimmed.match(/^\d+\. /)) return <li key={i} className="text-muted-foreground ml-5 list-decimal">{trimmed.replace(/^\d+\. /, "")}</li>;
                return <p key={i} className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />;
              })}
            </div>

            <AdBanner slot="5000000003" format="horizontal" className="my-6" />

            {/* FAQ Section */}
            {post.faq.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">❓ Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {post.faq.map((f, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
                        <p className="text-muted-foreground text-sm">{f.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Related Posts */}
            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">📚 Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related.map(r => (
                    <Card key={r.slug} className="hover:shadow-lg cursor-pointer transition-all" onClick={() => navigate(`/blog/${r.slug}`)}>
                      <CardContent className="pt-4">
                        <Badge variant="outline" className="mb-2 text-xs">{r.category}</Badge>
                        <h3 className="font-semibold text-foreground mb-1">{r.title}</h3>
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                        <span className="text-primary text-sm flex items-center gap-1 mt-2">Read <ArrowRight className="h-3 w-3" /></span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Internal Links */}
            <section className="bg-muted/30 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-3">🔗 Useful Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Typing Test", path: "/typing-test" },
                  { label: "Typing Practice", path: "/typing-practice" },
                  { label: "WPM Calculator", path: "/wpm-calculator" },
                  { label: "Hindi Typing Test", path: "/hindi-typing-test" },
                  { label: "Keyboard Guide", path: "/keyboard-guide" },
                ].map(link => (
                  <Button key={link.path} variant="outline" size="sm" onClick={() => navigate(link.path)}>
                    {link.label}
                  </Button>
                ))}
              </div>
            </section>
          </article>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default BlogPost;
