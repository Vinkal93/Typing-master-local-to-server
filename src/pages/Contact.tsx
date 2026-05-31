import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const Contact = () => {
  useEffect(() => { document.title = "Contact Us | Free Typing Test Online"; }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you soon." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Contact Vinkal Prajapati — Typing Master Support" description="Contact the Typing Master team or Vinkal Prajapati for support, feedback and partnerships." keywords="contact typing master, vinkal prajapati contact" breadcrumbs={[{name:"Home",path:"/"},{name:"Contact",path:"/contact"}]} />
      <Navbar />
      <AdLayout showSidebar={false}>
        <main className="container mx-auto px-4 py-8 flex-1 max-w-2xl">
          <h1 className="text-4xl font-bold text-foreground text-center mb-6">Contact Us</h1>
          <p className="text-muted-foreground text-center mb-8">Have questions, feedback, or suggestions? We'd love to hear from you.</p>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input placeholder="Your name" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea placeholder="Your message..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default Contact;
