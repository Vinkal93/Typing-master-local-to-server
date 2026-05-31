import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsAndConditions = () => {
  useEffect(() => { document.title = "Terms and Conditions | Free Typing Test Online"; }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Terms and Conditions — Typing Master" description="Terms and conditions for using Typing Master by Vinkal Prajapati." keywords="terms and conditions" breadcrumbs={[{name:"Home",path:"/"},{name:"Terms",path:"/terms-and-conditions"}]} />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-6">Terms and Conditions</h1>
        <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> December 2025</p>
          <h2 className="text-2xl font-bold text-foreground">Acceptance of Terms</h2>
          <p>By accessing and using this website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this website.</p>
          <h2 className="text-2xl font-bold text-foreground">Use of Service</h2>
          <p>This typing test platform is provided free of charge for educational purposes. You may use the typing tests, practice tools, and other features for personal, non-commercial use.</p>
          <h2 className="text-2xl font-bold text-foreground">Intellectual Property</h2>
          <p>All content, design, and code on this website are protected by intellectual property laws. You may not copy, modify, or distribute any content without prior written permission.</p>
          <h2 className="text-2xl font-bold text-foreground">Limitation of Liability</h2>
          <p>This website is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of this website or its content.</p>
          <h2 className="text-2xl font-bold text-foreground">Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
