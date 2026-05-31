import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Globe, Code2, Lightbulb, Target, Award, ExternalLink, Github, Linkedin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import developerImage from "@/assets/developer-profile.webp";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import SEO from "@/components/SEO";
const AboutDeveloper = () => {
  const {
    isHindi
  } = useLanguage();
  const skills = ["React", "TypeScript", "Android Development", "Java/Kotlin", "PHP", "WordPress", "AI Integration", "UI/UX Design", "Excel Automation", "Web Development", "Mobile Apps"];
  const projects = [{
    title: "TypeMaster",
    description: isHindi ? "संपूर्ण टाइपिंग प्रशिक्षण सॉफ़्टवेयर" : "Complete typing training software",
    tech: ["React", "TypeScript", "Tailwind"]
  }, {
    title: "Advanced Calculator",
    description: isHindi ? "Android कैलकुलेटर ऐप" : "Android calculator app",
    tech: ["Android", "Java"]
  }, {
    title: "AI Chatbot",
    description: isHindi ? "वेबसाइटों के लिए कस्टम चैटबॉट" : "Custom chatbot for websites",
    tech: ["AI", "JavaScript", "PHP"]
  }, {
    title: "Data Automation Tools",
    description: isHindi ? "छात्रों के लिए ऑटोमेशन" : "Automation for students",
    tech: ["Excel", "VBA", "Python"]
  }];
  return <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="About Developer — Vinkal Prajapati | Typing Master"
        description="Vinkal Prajapati — web developer and creator of Typing Master. Read about the developer behind the free typing tool."
        keywords="vinkal prajapati, vinkal prajapati developer, typing master developer, vinkal prajapati typing"
        breadcrumbs={[{name:"Home",path:"/"},{name:"About Developer",path:"/about-developer"}]}
        schema={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: "Vinkal Prajapati",
            url: "https://typingmaster2.vercel.app/about-developer",
            jobTitle: "Web Developer & Creator of Typing Master",
            sameAs: ["https://hashnode.com/@vinkalprajapati"]
          }
        }}
      />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-6">
              <Avatar className="w-32 h-32 mx-auto shadow-2xl border-4 border-primary/20">
                <AvatarImage src={developerImage} alt="Vinkal Prajapati" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-4xl text-white">
                  VP
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-foreground mb-3">
              Vinkal Prajapati
            </h1>
            <p className="text-2xl text-muted-foreground mb-6">
              {isHindi ? "वेब और Android डेवलपर" : "Web & Android Developer"}
            </p>
            
            <div className="flex gap-3 justify-center mb-8">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:vinkal93041@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" href="https://vinkal93.github.io/vinkal-prajapati/">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://dev.to/vinkalprajapati" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Dev.to
                </a>
              </Button>
            </div>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {isHindi ? "मैं एक passionate डेवलपर हूं जो आधुनिक, responsive और intelligent डिजिटल solutions बनाने के लिए प्रतिबद्ध हूं। मेरा काम सादगी, दक्षता और उच्च गुणवत्ता वाले user experience पर केंद्रित है।" : "I'm a passionate developer committed to creating modern, responsive, and intelligent digital solutions. My work focuses on simplicity, efficiency, and high-quality user experience."}
            </p>
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{isHindi ? "विज़न" : "Vision"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary mb-3">
                  {isHindi ? '"प्रौद्योगिकी को सीखने को आसान बनाना चाहिए"' : '"Technology should make learning easier"'}
                </p>
                <p className="text-muted-foreground">
                  {isHindi ? "इस विश्वास के साथ, मैंने TypeMaster बनाया - एक संपूर्ण typing training solution जो सभी के लिए डिज़ाइन किया गया है।" : "With this belief, I built TypeMaster - a complete typing training solution designed for everyone."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">{isHindi ? "मिशन" : "Mission"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isHindi ? "स्मार्ट, user-friendly और विश्वसनीय डिजिटल tools बनाना जो learners को उनके skills को बढ़ाने और excellence हासिल करने के लिए सशक्त बनाते हैं।" : "To build smart, user-friendly, and reliable digital tools that empower learners to enhance their skills and achieve excellence."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card className="mb-12 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">
                  {isHindi ? "मुख्य Skills & Expertise" : "Core Skills & Expertise"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => <Badge key={index} variant="secondary" className="px-4 py-2 text-sm font-medium hover:scale-105 transition-transform">
                    {skill}
                  </Badge>)}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-6 text-center">
              {isHindi ? "प्रमुख Projects" : "Major Projects"}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => <Card key={index} className="hover:shadow-xl transition-all hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.title}
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="text-base">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>)}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Philosophy */}
          <Card className="mb-12 bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl">{isHindi ? "कार्य दर्शन" : "Work Philosophy"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Clean & Minimal UI</p>
                    <p className="text-sm text-muted-foreground">Focused on simplicity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Fast Performance</p>
                    <p className="text-sm text-muted-foreground">Smooth user experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Problem Solving</p>
                    <p className="text-sm text-muted-foreground">Real-world solutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">User-Centric</p>
                    <p className="text-sm text-muted-foreground">Always thinking of users</p>
                  </div>
                </div>
              </div>
              <blockquote className="border-l-4 border-primary pl-4 italic text-lg font-medium text-foreground">
                {isHindi ? '"अच्छा software सिर्फ बनाया नहीं जाता — इसे detail, logic और empathy के साथ तैयार किया जाता है।"' : '"Good software is not just built — it is crafted with detail, logic, and empathy."'}
              </blockquote>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                {isHindi ? "संपर्क करें" : "Get in Touch"}
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                {isHindi ? "यदि आपके पास TypeMaster को बेहतर बनाने के लिए सुझाव या feedback हैं, तो बेझिझक संपर्क करें।" : "If you have suggestions or feedback to improve TypeMaster, feel free to reach out."}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="secondary" asChild>
                  <a href="mailto:vinkal93041@gmail.com" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    vinkal93041@gmail.com
                  </a>
                </Button>
                <Button variant="secondary" asChild>
                  <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" href="https://vinkal93.github.io/vinkal-prajapati/">
                    <Globe className="h-4 w-4" />
                    Portfolio Website
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default AboutDeveloper;