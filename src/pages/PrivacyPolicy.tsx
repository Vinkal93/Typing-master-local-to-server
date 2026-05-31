import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  useEffect(() => { document.title = "Privacy Policy | Free Typing Test Online"; }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Privacy Policy — Typing Master by Vinkal Prajapati" description="Read the privacy policy of Typing Master by Vinkal Prajapati." keywords="privacy policy" breadcrumbs={[{name:"Home",path:"/"},{name:"Privacy Policy",path:"/privacy-policy"}]} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> December 2025</p>
          <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
          <p>We collect typing test results, progress data, and usage statistics locally in your browser using localStorage. We do not collect personal information unless you voluntarily provide it through our contact form.</p>
          <h2 className="text-2xl font-bold text-foreground">Cookies & Advertising</h2>
          <p>We use Google AdSense for advertising, which may use cookies to serve ads based on your browsing history. Google's use of advertising cookies enables it to serve ads based on visits to our site and other sites on the Internet. You may opt out of personalized advertising by visiting Google's Ads Settings.</p>
          <h2 className="text-2xl font-bold text-foreground">Data Storage</h2>
          <p>All typing test data, progress, and settings are stored locally on your device. We do not transmit this data to any server. Clearing your browser data will remove all stored information.</p>
          <h2 className="text-2xl font-bold text-foreground">Third-Party Services</h2>
          <p>We use Google AdSense for advertising and Google Analytics for website analytics. These services may collect anonymous usage data according to their own privacy policies.</p>
          <h2 className="text-2xl font-bold text-foreground">Contact</h2>
          <p>For privacy-related questions, please visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
