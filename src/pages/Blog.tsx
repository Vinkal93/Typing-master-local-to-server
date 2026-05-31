import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import AdBanner from "@/components/AdBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPublishedBlogs } from "@/lib/adminBlogStore";
import { Clock, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const Blog = () => {
  const navigate = useNavigate();
  const blogPosts = getAllPublishedBlogs();
  const categories = [...new Set(blogPosts.map(p => p.category))];

  useEffect(() => {
    document.title = "Typing Blog | Tips, Guides & Practice Resources";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Master Blog — Tips, Guides & Speed Improvement" description="Read the Typing Master blog by Vinkal Prajapati for typing tips, finger placement guides, exam preparation and speed improvement strategies." keywords="typing blog, typing tips, typing speed guide" breadcrumbs={[{name:"Home",path:"/"},{name:"Blog",path:"/blog"}]} />
      <Navbar />
      <AdLayout>
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-4">Typing Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, guides, and resources to help you improve your typing speed and prepare for typing exams.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Badge key={cat} variant="secondary" className="text-sm px-3 py-1">{cat}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  <CardDescription className="text-sm">{post.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdBanner slot="5000000001" format="horizontal" className="my-8" />
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default Blog;
