import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdLayout from "@/components/AdLayout";
import SEO from "@/components/SEO";

const About = () => {
  useEffect(() => { document.title = "About Us | Free Typing Test Online"; }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="About Typing Master by Vinkal Prajapati" description="Learn about Typing Master, a free typing platform built by Vinkal Prajapati to help students master typing skills." keywords="about typing master, vinkal prajapati typing" breadcrumbs={[{name:"Home",path:"/"},{name:"About",path:"/about"}]} />
      <Navbar />
      <AdLayout showSidebar={false}>
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-6">About Us</h1>
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-muted-foreground mb-4">Welcome to our free typing test platform! We are dedicated to helping students, professionals, and typing enthusiasts improve their typing speed and accuracy.</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground mb-4">Our mission is to provide the best free typing practice tools for everyone. Whether you're preparing for government exams like CPCT, SSC, or simply want to type faster, our platform offers comprehensive tools and exercises.</p>
            <h2 className="text-2xl font-bold text-foreground mb-3">What We Offer</h2>
            <ul className="text-muted-foreground list-disc pl-5 space-y-2 mb-4">
              <li>Free typing speed tests (1, 2, 3, 5 minute durations)</li>
              <li>Hindi and English typing practice</li>
              <li>Krutidev and Mangal font support</li>
              <li>Real-time WPM and accuracy tracking</li>
              <li>Structured typing lessons for beginners to advanced</li>
              <li>Typing games for fun practice</li>
              <li>Exam mock tests (CPCT, SSC, Court Typist)</li>
              <li>Detailed progress reports and analytics</li>
            </ul>
            <h2 className="text-2xl font-bold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground">Have questions or suggestions? Visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
          </div>
        </main>
        <Footer />
      </AdLayout>
    </div>
  );
};

export default About;
