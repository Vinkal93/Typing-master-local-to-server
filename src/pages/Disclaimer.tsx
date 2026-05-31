import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Disclaimer = () => {
  useEffect(() => { document.title = "Disclaimer | Free Typing Test Online"; }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Disclaimer — Typing Master" description="Disclaimer for Typing Master content and tools." keywords="disclaimer" breadcrumbs={[{name:"Home",path:"/"},{name:"Disclaimer",path:"/disclaimer"}]} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-6">Disclaimer</h1>
        <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> December 2025</p>
          <h2 className="text-2xl font-bold text-foreground">General Disclaimer</h2>
          <p>The information provided on this website is for general informational and educational purposes only. While we strive to provide accurate typing speed measurements, results may vary based on your device, browser, and internet connection.</p>
          <h2 className="text-2xl font-bold text-foreground">No Guarantee</h2>
          <p>We do not guarantee that using our typing practice tools will result in specific typing speed improvements or exam success. Results depend on individual effort and practice consistency.</p>
          <h2 className="text-2xl font-bold text-foreground">External Links</h2>
          <p>This website may contain links to external websites. We are not responsible for the content or privacy practices of external sites.</p>
          <h2 className="text-2xl font-bold text-foreground">Advertising</h2>
          <p>This website displays advertisements through Google AdSense. We are not responsible for the content of advertisements displayed on our website. Ads are served by third-party advertising networks.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;
