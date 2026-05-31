import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { saveTestRecord } from "@/lib/progressTracker";
import { Trophy, AlertCircle, Clock, Award, ChevronLeft, Search } from "lucide-react";
import Certificate from "@/components/Certificate";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";

interface ExamConfig {
  name: string;
  nameHindi: string;
  category: string;
  categoryHindi: string;
  duration: number;
  allowBackspace: boolean;
  minimumWPM: number;
  minimumAccuracy: number;
  text: string;
  textHindi: string;
}

const examConfigs: ExamConfig[] = [
  // ─── SSC ───
  {
    name: "SSC Stenographer Grade C",
    nameHindi: "SSC आशुलिपिक ग्रेड C",
    category: "SSC",
    categoryHindi: "SSC",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 100,
    minimumAccuracy: 95,
    text: "The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the alphabet and is commonly used for typing practice. Speed and accuracy are both important in typing tests. Professional typists can achieve speeds of over 100 words per minute with high accuracy. The ability to type quickly and accurately is essential for stenographic work in government offices. Stenographers must maintain focus and precision while transcribing dictation at high speeds. Regular practice and dedication are key factors in achieving the required typing speed for SSC examinations.",
    textHindi: "तेज भूरी लोमड़ी आलसी कुत्ते के ऊपर कूदती है। यह वाक्य वर्णमाला के सभी अक्षरों को शामिल करता है और आम तौर पर टाइपिंग अभ्यास के लिए उपयोग किया जाता है। टाइपिंग परीक्षणों में गति और सटीकता दोनों महत्वपूर्ण हैं। पेशेवर टाइपिस्ट उच्च सटीकता के साथ प्रति मिनट 100 से अधिक शब्दों की गति प्राप्त कर सकते हैं। सरकारी कार्यालयों में आशुलिपिक कार्य के लिए तेजी से और सटीक रूप से टाइप करने की क्षमता आवश्यक है।"
  },
  {
    name: "SSC Stenographer Grade D",
    nameHindi: "SSC आशुलिपिक ग्रेड D",
    category: "SSC",
    categoryHindi: "SSC",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 80,
    minimumAccuracy: 93,
    text: "Government offices require skilled typists who can handle large volumes of official correspondence and documentation. The ability to type with speed and accuracy is fundamental to administrative work. Officers depend on stenographers to accurately record meetings and prepare official documents. Typing tests are an integral part of the selection process for government positions. Candidates must demonstrate proficiency in typing to qualify for stenographic posts in various government departments.",
    textHindi: "सरकारी कार्यालयों में कुशल टाइपिस्टों की आवश्यकता होती है जो बड़ी मात्रा में आधिकारिक पत्राचार और दस्तावेज़ीकरण को संभाल सकें। प्रशासनिक कार्य के लिए गति और सटीकता के साथ टाइप करने की क्षमता मौलिक है। अधिकारी बैठकों को सटीक रूप से रिकॉर्ड करने और आधिकारिक दस्तावेज तैयार करने के लिए आशुलिपिकों पर निर्भर करते हैं।"
  },
  {
    name: "SSC CHSL (LDC)",
    nameHindi: "SSC CHSL (LDC)",
    category: "SSC",
    categoryHindi: "SSC",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "Lower Division Clerks play a vital role in maintaining government records and processing official documents. They handle correspondence, file management, and data entry tasks on a daily basis. The typing test for LDC positions evaluates candidates on both speed and accuracy. Consistent practice and familiarity with the keyboard layout are essential for success. Government clerical positions require attention to detail and the ability to work efficiently under time constraints.",
    textHindi: "निचले विभाग के क्लर्क सरकारी रिकॉर्ड बनाए रखने और आधिकारिक दस्तावेजों को संसाधित करने में महत्वपूर्ण भूमिका निभाते हैं। वे दैनिक आधार पर पत्राचार, फाइल प्रबंधन और डेटा प्रविष्टि कार्यों को संभालते हैं। एलडीसी पदों के लिए टाइपिंग परीक्षा उम्मीदवारों का गति और सटीकता दोनों पर मूल्यांकन करती है।"
  },
  {
    name: "SSC CGL (Typing Test)",
    nameHindi: "SSC CGL (टाइपिंग टेस्ट)",
    category: "SSC",
    categoryHindi: "SSC",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "The Combined Graduate Level examination is one of the most prestigious competitive examinations conducted by the Staff Selection Commission. Candidates who qualify for Tax Assistant and similar posts must pass a typing test as part of the selection process. The examination tests candidates on their ability to type accurately and maintain consistent speed throughout the test duration. Preparation for this test requires regular practice sessions and a thorough understanding of keyboard mechanics.",
    textHindi: "संयुक्त स्नातक स्तर की परीक्षा कर्मचारी चयन आयोग द्वारा आयोजित सबसे प्रतिष्ठित प्रतियोगी परीक्षाओं में से एक है। कर सहायक और इसी तरह के पदों के लिए अर्हता प्राप्त करने वाले उम्मीदवारों को चयन प्रक्रिया के भाग के रूप में एक टाइपिंग परीक्षा उत्तीर्ण करनी होगी।"
  },
  // ─── Banking ───
  {
    name: "IBPS Clerk",
    nameHindi: "IBPS क्लर्क",
    category: "Banking",
    categoryHindi: "बैंकिंग",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "Banking sector clerks process customer transactions and maintain accurate financial records daily. Attention to detail and consistent typing speed are essential for efficient banking operations. The banking industry requires professionals who can handle large volumes of data entry work with precision and reliability. Banks process thousands of transactions every day and clerks must ensure accuracy in every entry. Financial institutions depend on their staff to maintain error-free records for regulatory compliance.",
    textHindi: "बैंकिंग क्षेत्र के क्लर्क दैनिक रूप से ग्राहक लेनदेन को संसाधित करते हैं और सटीक वित्तीय रिकॉर्ड बनाए रखते हैं। कुशल बैंकिंग संचालन के लिए विस्तार पर ध्यान और सुसंगत टाइपिंग गति आवश्यक है। बैंकिंग उद्योग को ऐसे पेशेवरों की आवश्यकता है जो सटीकता और विश्वसनीयता के साथ बड़ी मात्रा में डेटा प्रविष्टि कार्य को संभाल सकें।"
  },
  {
    name: "IBPS PO",
    nameHindi: "IBPS PO",
    category: "Banking",
    categoryHindi: "बैंकिंग",
    duration: 900,
    allowBackspace: true,
    minimumWPM: 30,
    minimumAccuracy: 90,
    text: "Probationary Officers in banks manage various banking operations including customer service, loan processing, and account management. They must be proficient in computer operations and typing to handle daily administrative tasks efficiently. The role requires strong communication skills and the ability to process information quickly. Bank officers prepare reports, manage correspondence, and maintain accurate records of all transactions conducted at their branch.",
    textHindi: "बैंकों में परिवीक्षाधीन अधिकारी ग्राहक सेवा, ऋण प्रसंस्करण और खाता प्रबंधन सहित विभिन्न बैंकिंग कार्यों का प्रबंधन करते हैं। उन्हें दैनिक प्रशासनिक कार्यों को कुशलतापूर्वक संभालने के लिए कंप्यूटर संचालन और टाइपिंग में दक्ष होना चाहिए।"
  },
  {
    name: "SBI Clerk",
    nameHindi: "SBI क्लर्क",
    category: "Banking",
    categoryHindi: "बैंकिंग",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "State Bank of India is the largest public sector bank in India and recruits clerks through a rigorous selection process. Clerks at SBI handle cash transactions, maintain customer accounts, and process various banking documents. The typing test is crucial for candidates aspiring to join SBI as it evaluates their speed and accuracy in data entry. Working at SBI requires dedication, precision, and the ability to serve customers efficiently while maintaining accuracy in all transactions.",
    textHindi: "भारतीय स्टेट बैंक भारत का सबसे बड़ा सार्वजनिक क्षेत्र का बैंक है और कठोर चयन प्रक्रिया के माध्यम से क्लर्कों की भर्ती करता है। एसबीआई में क्लर्क नकद लेनदेन, ग्राहक खातों का रखरखाव और विभिन्न बैंकिंग दस्तावेजों को संसाधित करते हैं।"
  },
  // ─── Railway ───
  {
    name: "RRB NTPC",
    nameHindi: "RRB NTPC",
    category: "Railway",
    categoryHindi: "रेलवे",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 92,
    text: "Railway recruitment examinations test candidates on various skills including typing speed and accuracy. The typing test is an important component of the selection process for non-technical popular category posts. Candidates must practice extensively to meet the required standards and qualify for railway positions. Indian Railways is one of the largest employers in the world and offers stable career opportunities. The recruitment process is highly competitive with millions of candidates appearing for limited positions.",
    textHindi: "रेलवे भर्ती परीक्षाएं उम्मीदवारों की विभिन्न कौशलों पर परीक्षण करती हैं जिसमें टाइपिंग गति और सटीकता शामिल है। टाइपिंग परीक्षा गैर-तकनीकी लोकप्रिय श्रेणी पदों के लिए चयन प्रक्रिया का एक महत्वपूर्ण घटक है।"
  },
  {
    name: "RRB Group D",
    nameHindi: "RRB ग्रुप D",
    category: "Railway",
    categoryHindi: "रेलवे",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 25,
    minimumAccuracy: 90,
    text: "Group D positions in Indian Railways encompass various roles that support the operational backbone of the railway system. These positions require basic computer literacy and the ability to handle data entry tasks. Candidates for Group D positions must demonstrate their typing skills as part of the computer-based test. The railway department values efficiency and accuracy in all administrative processes conducted by its staff members.",
    textHindi: "भारतीय रेलवे में ग्रुप डी पदों में विभिन्न भूमिकाएं शामिल हैं जो रेलवे प्रणाली की परिचालन रीढ़ का समर्थन करती हैं। इन पदों के लिए बुनियादी कंप्यूटर साक्षरता और डेटा प्रविष्टि कार्यों को संभालने की क्षमता की आवश्यकता होती है।"
  },
  {
    name: "RRB Clerk / Typist",
    nameHindi: "RRB क्लर्क / टाइपिस्ट",
    category: "Railway",
    categoryHindi: "रेलवे",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 92,
    text: "Railway typists and clerks are responsible for maintaining records, preparing correspondence, and managing documentation across railway offices. The typing test evaluates speed and precision under timed conditions. Successful candidates join a vast network of railway administration that keeps the nation connected. Proficiency in typing is a core requirement for these positions and candidates must achieve minimum benchmarks in both English and Hindi typing tests.",
    textHindi: "रेलवे टाइपिस्ट और क्लर्क रेलवे कार्यालयों में रिकॉर्ड बनाए रखने, पत्राचार तैयार करने और दस्तावेज़ प्रबंधन के लिए जिम्मेदार हैं। टाइपिंग परीक्षा समयबद्ध स्थितियों में गति और सटीकता का मूल्यांकन करती है।"
  },
  // ─── Court ───
  {
    name: "High Court Stenographer",
    nameHindi: "उच्च न्यायालय आशुलिपिक",
    category: "Court",
    categoryHindi: "न्यायालय",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 80,
    minimumAccuracy: 98,
    text: "High Court stenographers must maintain exceptional accuracy when transcribing legal proceedings and judgments. The legal system depends on precise documentation of court proceedings. Every word matters in legal contexts where misinterpretation can have significant consequences. Professional stenographers combine speed with meticulous attention to detail. Court proceedings must be recorded verbatim to ensure the integrity of the judicial process. Stenographers work under immense pressure during complex legal hearings.",
    textHindi: "उच्च न्यायालय आशुलिपिक को कानूनी कार्यवाही और निर्णयों को प्रतिलेखन करते समय असाधारण सटीकता बनाए रखनी चाहिए। कानूनी प्रणाली अदालती कार्यवाही के सटीक दस्तावेजीकरण पर निर्भर करती है। कानूनी संदर्भों में प्रत्येक शब्द मायने रखता है जहां गलत व्याख्या के महत्वपूर्ण परिणाम हो सकते हैं।"
  },
  {
    name: "District Court Clerk",
    nameHindi: "जिला न्यायालय क्लर्क",
    category: "Court",
    categoryHindi: "न्यायालय",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 40,
    minimumAccuracy: 95,
    text: "Court clerks must possess excellent typing skills to accurately transcribe legal documents and proceedings. High accuracy is critical in legal environments where errors can have serious consequences. Speed combined with precision makes for an efficient court clerk. District courts handle a wide variety of cases and clerks must manage extensive documentation for each proceeding. The role demands consistent performance and the ability to work accurately under pressure throughout long court sessions.",
    textHindi: "कोर्ट क्लर्कों को कानूनी दस्तावेजों और कार्यवाही को सटीक रूप से प्रतिलेखन करने के लिए उत्कृष्ट टाइपिंग कौशल होना चाहिए। कानूनी वातावरण में उच्च सटीकता महत्वपूर्ण है जहां त्रुटियों के गंभीर परिणाम हो सकते हैं। सटीकता के साथ गति एक कुशल कोर्ट क्लर्क बनाती है।"
  },
  {
    name: "Supreme Court Junior Clerk",
    nameHindi: "सुप्रीम कोर्ट जूनियर क्लर्क",
    category: "Court",
    categoryHindi: "न्यायालय",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 95,
    text: "The Supreme Court of India is the highest judicial authority in the country and maintains the strictest standards for documentation accuracy. Junior clerks at the Supreme Court assist in maintaining case files, preparing court orders, and managing judicial correspondence. The typing test for Supreme Court positions evaluates candidates under stringent conditions with no room for error. Candidates must demonstrate exceptional typing skills and a thorough understanding of legal terminology and formatting conventions.",
    textHindi: "भारत का सर्वोच्च न्यायालय देश का सर्वोच्च न्यायिक प्राधिकरण है और दस्तावेज़ सटीकता के लिए सबसे कठोर मानकों को बनाए रखता है। सुप्रीम कोर्ट में जूनियर क्लर्क केस फाइलों को बनाए रखने, कोर्ट आदेश तैयार करने और न्यायिक पत्राचार का प्रबंधन करने में सहायता करते हैं।"
  },
  // ─── Defence ───
  {
    name: "CRPF Constable",
    nameHindi: "CRPF कांस्टेबल",
    category: "Defence",
    categoryHindi: "रक्षा",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 90,
    text: "Government examinations require candidates to demonstrate proficiency in typing. The ability to type quickly and accurately is essential for clerical and data entry positions. Practice regularly to improve your typing skills and increase your chances of success in competitive examinations. The Central Reserve Police Force is one of the largest paramilitary forces in India. Administrative positions within CRPF require personnel to maintain records and prepare reports efficiently.",
    textHindi: "सरकारी परीक्षाओं में उम्मीदवारों को टाइपिंग में प्रवीणता प्रदर्शित करने की आवश्यकता होती है। लिपिकीय और डेटा प्रविष्टि पदों के लिए तेजी से और सटीक रूप से टाइप करने की क्षमता आवश्यक है। अपने टाइपिंग कौशल में सुधार करने और प्रतियोगी परीक्षाओं में सफलता की संभावना बढ़ाने के लिए नियमित रूप से अभ्यास करें।"
  },
  {
    name: "BSF Head Constable",
    nameHindi: "BSF हेड कांस्टेबल",
    category: "Defence",
    categoryHindi: "रक्षा",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 90,
    text: "The Border Security Force requires Head Constables with ministerial duties to possess strong typing skills. These personnel handle official correspondence, maintain personnel records, and prepare administrative reports at border outposts and headquarters. The typing test for BSF positions evaluates both speed and accuracy under controlled conditions. Candidates must be able to type consistently while maintaining focus and precision in their work.",
    textHindi: "सीमा सुरक्षा बल को मंत्रिस्तरीय कर्तव्यों वाले हेड कांस्टेबलों को मजबूत टाइपिंग कौशल होना आवश्यक है। ये कर्मी सीमा चौकियों और मुख्यालय पर आधिकारिक पत्राचार, कार्मिक रिकॉर्ड और प्रशासनिक रिपोर्ट तैयार करते हैं।"
  },
  {
    name: "Army Clerk",
    nameHindi: "सेना क्लर्क",
    category: "Defence",
    categoryHindi: "रक्षा",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 92,
    text: "Indian Army clerks handle critical administrative functions including maintaining service records of personnel, processing pay and allowances, managing inventory, and preparing official correspondence. The typing proficiency test is a mandatory component of the selection process. Candidates must demonstrate the ability to type accurately under pressure. Military documentation requires the highest standards of precision as errors in records can have significant implications for service personnel.",
    textHindi: "भारतीय सेना के क्लर्क कर्मियों के सेवा रिकॉर्ड बनाए रखने, वेतन और भत्तों की प्रक्रिया, इन्वेंट्री प्रबंधन और आधिकारिक पत्राचार तैयार करने सहित महत्वपूर्ण प्रशासनिक कार्यों को संभालते हैं।"
  },
  // ─── State PSC ───
  {
    name: "State PSC Data Entry Operator",
    nameHindi: "राज्य PSC डेटा एंट्री ऑपरेटर",
    category: "State PSC",
    categoryHindi: "राज्य PSC",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 40,
    minimumAccuracy: 96,
    text: "State Public Service Commission data entry operators maintain government databases and records. Accuracy is paramount when handling sensitive government data and citizen information. Operators must demonstrate both speed and precision in their typing skills while maintaining data confidentiality and security standards. Government databases contain critical information that must be entered without errors. Data entry operators work across various departments including revenue, health, education and social welfare.",
    textHindi: "राज्य लोक सेवा आयोग डेटा एंट्री ऑपरेटर सरकारी डेटाबेस और रिकॉर्ड बनाए रखते हैं। संवेदनशील सरकारी डेटा और नागरिक जानकारी को संभालते समय सटीकता सर्वोपरि है। ऑपरेटरों को डेटा गोपनीयता और सुरक्षा मानकों को बनाए रखते हुए अपने टाइपिंग कौशल में गति और सटीकता दोनों का प्रदर्शन करना चाहिए।"
  },
  {
    name: "MPPSC Stenographer",
    nameHindi: "MPPSC आशुलिपिक",
    category: "State PSC",
    categoryHindi: "राज्य PSC",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 80,
    minimumAccuracy: 95,
    text: "The Madhya Pradesh Public Service Commission conducts recruitment for stenographic positions in state government departments. Candidates must demonstrate proficiency in shorthand and typing to qualify for these positions. The typing test evaluates candidates under strict time constraints with specific speed and accuracy requirements. State government stenographers assist senior officers in documentation and correspondence management throughout various administrative offices.",
    textHindi: "मध्य प्रदेश लोक सेवा आयोग राज्य सरकार के विभागों में आशुलिपिक पदों के लिए भर्ती आयोजित करता है। उम्मीदवारों को इन पदों के लिए अर्हता प्राप्त करने के लिए शॉर्टहैंड और टाइपिंग में दक्षता प्रदर्शित करनी होगी।"
  },
  {
    name: "UPPSC Lower Subordinate",
    nameHindi: "UPPSC निचला अधीनस्थ",
    category: "State PSC",
    categoryHindi: "राज्य PSC",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 25,
    minimumAccuracy: 90,
    text: "The Uttar Pradesh Public Service Commission recruits candidates for various lower subordinate posts that require basic typing proficiency. These positions involve clerical duties, record maintenance, and administrative support functions. Candidates must pass a typing test to demonstrate their computer literacy skills. The examination process ensures that selected candidates can efficiently handle the documentation requirements of their assigned departments.",
    textHindi: "उत्तर प्रदेश लोक सेवा आयोग विभिन्न निचले अधीनस्थ पदों के लिए उम्मीदवारों की भर्ती करता है जिनमें बुनियादी टाइपिंग दक्षता की आवश्यकता होती है। इन पदों में लिपिकीय कर्तव्य, रिकॉर्ड रखरखाव और प्रशासनिक सहायता कार्य शामिल हैं।"
  },
  // ─── CPCT ───
  {
    name: "MP CPCT (English)",
    nameHindi: "MP CPCT (अंग्रेज़ी)",
    category: "CPCT",
    categoryHindi: "CPCT",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "The Computer Proficiency Certification Test is conducted by the Government of Madhya Pradesh to certify candidates in computer skills and typing proficiency. This certification is mandatory for various government positions in the state. The test evaluates typing speed and accuracy in both English and Hindi languages. Candidates must achieve minimum benchmarks to obtain the certification which is valid for a specified period. CPCT certification has become an essential requirement for government job aspirants in Madhya Pradesh.",
    textHindi: "कंप्यूटर प्रवीणता प्रमाणन परीक्षा मध्य प्रदेश सरकार द्वारा कंप्यूटर कौशल और टाइपिंग दक्षता में उम्मीदवारों को प्रमाणित करने के लिए आयोजित की जाती है। यह प्रमाणन राज्य में विभिन्न सरकारी पदों के लिए अनिवार्य है।"
  },
  {
    name: "MP CPCT (Hindi)",
    nameHindi: "MP CPCT (हिंदी)",
    category: "CPCT",
    categoryHindi: "CPCT",
    duration: 900,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 90,
    text: "Hindi typing proficiency is essential for government positions in Hindi-speaking states. The CPCT Hindi typing test evaluates candidates on their ability to type in Hindi using standard keyboard layouts such as Remington and Inscript. Candidates must demonstrate consistent speed and accuracy throughout the test duration. Practice with Hindi text passages and familiarity with Hindi keyboard layouts are crucial for success in this examination.",
    textHindi: "हिंदी भाषी राज्यों में सरकारी पदों के लिए हिंदी टाइपिंग दक्षता आवश्यक है। सीपीसीटी हिंदी टाइपिंग परीक्षा रेमिंगटन और इनस्क्रिप्ट जैसे मानक कीबोर्ड लेआउट का उपयोग करके हिंदी में टाइप करने की उम्मीदवारों की क्षमता का मूल्यांकन करती है। उम्मीदवारों को परीक्षा अवधि के दौरान सुसंगत गति और सटीकता प्रदर्शित करनी होगी।"
  },
  // ─── Data Entry ───
  {
    name: "Data Entry Operator (DEO)",
    nameHindi: "डेटा एंट्री ऑपरेटर (DEO)",
    category: "Data Entry",
    categoryHindi: "डेटा एंट्री",
    duration: 300,
    allowBackspace: true,
    minimumWPM: 35,
    minimumAccuracy: 95,
    text: "Data entry operators process large volumes of information efficiently and accurately. The role requires sustained concentration and consistent typing performance. Organizations rely on data entry operators to maintain accurate records and databases. Speed and precision are equally important in data entry work. Modern data entry involves working with specialized software applications and database management systems. Operators must be familiar with various data formats and entry protocols.",
    textHindi: "डेटा एंट्री ऑपरेटर बड़ी मात्रा में जानकारी को कुशलता से और सटीक रूप से संसाधित करते हैं। भूमिका के लिए निरंतर एकाग्रता और सुसंगत टाइपिंग प्रदर्शन की आवश्यकता होती है। संगठन सटीक रिकॉर्ड और डेटाबेस बनाए रखने के लिए डेटा एंट्री ऑपरेटरों पर भरोसा करते हैं।"
  },
  {
    name: "KVS Data Entry Operator",
    nameHindi: "KVS डेटा एंट्री ऑपरेटर",
    category: "Data Entry",
    categoryHindi: "डेटा एंट्री",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "Kendriya Vidyalaya Sangathan employs data entry operators to manage student records, examination data, and administrative information across its network of schools. The typing test assesses the candidate's ability to handle educational data with accuracy and speed. KVS data entry operators play a crucial role in digitizing and maintaining the academic records of thousands of students studying in Kendriya Vidyalayas across the country.",
    textHindi: "केंद्रीय विद्यालय संगठन अपने स्कूलों के नेटवर्क में छात्र रिकॉर्ड, परीक्षा डेटा और प्रशासनिक जानकारी का प्रबंधन करने के लिए डेटा एंट्री ऑपरेटरों को नियुक्त करता है। टाइपिंग परीक्षा शैक्षिक डेटा को सटीकता और गति के साथ संभालने की उम्मीदवार की क्षमता का आकलन करती है।"
  },
  // ─── Police ───
  {
    name: "Police Constable (Computer Operator)",
    nameHindi: "पुलिस कांस्टेबल (कंप्यूटर ऑपरेटर)",
    category: "Police",
    categoryHindi: "पुलिस",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 30,
    minimumAccuracy: 90,
    text: "Police departments across India require computer operators who can efficiently manage crime records, FIR documentation, and departmental correspondence. The typing test for police computer operator positions evaluates both speed and accuracy. Officers must type quickly when entering time-sensitive information such as first information reports and criminal records. Accurate documentation is critical in law enforcement as it directly impacts investigations and legal proceedings.",
    textHindi: "भारत भर में पुलिस विभागों को कंप्यूटर ऑपरेटरों की आवश्यकता है जो अपराध रिकॉर्ड, एफआईआर दस्तावेज और विभागीय पत्राचार को कुशलतापूर्वक प्रबंधित कर सकें। पुलिस कंप्यूटर ऑपरेटर पदों के लिए टाइपिंग परीक्षा गति और सटीकता दोनों का मूल्यांकन करती है।"
  },
  {
    name: "UP Police Clerk",
    nameHindi: "UP पुलिस क्लर्क",
    category: "Police",
    categoryHindi: "पुलिस",
    duration: 600,
    allowBackspace: false,
    minimumWPM: 25,
    minimumAccuracy: 90,
    text: "Uttar Pradesh Police recruits clerks who assist in maintaining records at police stations and district headquarters. These clerks handle filing, correspondence, and data management for law enforcement activities. The typing test is designed to ensure candidates can efficiently process paperwork and digital documentation. Successful candidates contribute to the smooth administrative functioning of police stations across the state of Uttar Pradesh.",
    textHindi: "उत्तर प्रदेश पुलिस क्लर्कों की भर्ती करती है जो पुलिस स्टेशनों और जिला मुख्यालयों में रिकॉर्ड बनाए रखने में सहायता करते हैं। ये क्लर्क कानून प्रवर्तन गतिविधियों के लिए फाइलिंग, पत्राचार और डेटा प्रबंधन को संभालते हैं।"
  },
  // ─── Postal ───
  {
    name: "India Post Sorting Assistant",
    nameHindi: "भारतीय डाक छँटाई सहायक",
    category: "Postal",
    categoryHindi: "डाक",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 35,
    minimumAccuracy: 93,
    text: "Sorting assistants in the Department of Posts manage the processing and distribution of mail across postal circles. They must accurately enter tracking information, addresses, and delivery details into postal systems. The typing test evaluates their ability to handle high volumes of data entry work efficiently. India Post processes millions of articles daily and sorting assistants play a critical role in ensuring timely and accurate delivery of postal services to citizens.",
    textHindi: "डाक विभाग में छँटाई सहायक डाक मंडलों में मेल के प्रसंस्करण और वितरण का प्रबंधन करते हैं। उन्हें डाक प्रणालियों में ट्रैकिंग जानकारी, पते और वितरण विवरण सटीक रूप से दर्ज करना होगा।"
  },
  // ─── General ───
  {
    name: "General Typing Practice",
    nameHindi: "सामान्य टाइपिंग अभ्यास",
    category: "Practice",
    categoryHindi: "अभ्यास",
    duration: 300,
    allowBackspace: true,
    minimumWPM: 20,
    minimumAccuracy: 85,
    text: "Typing is one of the most fundamental skills in the digital age. Whether you are a student preparing for competitive examinations or a professional looking to improve productivity, typing practice is essential. The key to improving your typing speed is regular and consistent practice. Focus on accuracy first and speed will naturally follow as your muscle memory develops. Position your fingers on the home row keys and use all ten fingers for optimal typing efficiency.",
    textHindi: "टाइपिंग डिजिटल युग में सबसे बुनियादी कौशलों में से एक है। चाहे आप प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्र हों या उत्पादकता में सुधार करना चाहने वाले पेशेवर, टाइपिंग अभ्यास आवश्यक है। अपनी टाइपिंग गति में सुधार की कुंजी नियमित और सुसंगत अभ्यास है।"
  },
  {
    name: "Speed Building (Advanced)",
    nameHindi: "स्पीड बिल्डिंग (उन्नत)",
    category: "Practice",
    categoryHindi: "अभ्यास",
    duration: 600,
    allowBackspace: true,
    minimumWPM: 50,
    minimumAccuracy: 92,
    text: "Advanced typists push beyond average speeds by developing refined muscle memory patterns and reducing hesitation between keystrokes. Speed building requires deliberate practice with progressively challenging text passages. Focus on maintaining a steady rhythm rather than bursting speed followed by pauses. Professional typists often practice with complex vocabulary and technical terminology to prepare for real-world typing scenarios. Consistent daily practice even for short durations yields better results than occasional long sessions.",
    textHindi: "उन्नत टाइपिस्ट परिष्कृत मांसपेशी स्मृति पैटर्न विकसित करके और कीस्ट्रोक्स के बीच हिचकिचाहट को कम करके औसत गति से आगे बढ़ते हैं। स्पीड बिल्डिंग के लिए उत्तरोत्तर चुनौतीपूर्ण पाठ अंशों के साथ जानबूझकर अभ्यास की आवश्यकता होती है।"
  },
];

const categories = [...new Set(examConfigs.map(e => e.category))];

const ExamMode = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const { hindiKeyboardFont } = useFont();
  
  const examId = searchParams.get('examId');
  const exam = examConfigs.find(e => e.name === examId);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [userInput, setUserInput] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(exam?.duration || 600);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (started && !finished && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, finished, timeRemaining]);

  useEffect(() => {
    if (started && inputRef.current) {
      inputRef.current.focus();
    }
  }, [started]);

  // If no exam selected, show selection page
  if (!examId || !exam) {
    const filteredExams = examConfigs.filter(e => {
      const matchCategory = selectedCategory === "All" || e.category === selectedCategory;
      const matchSearch = searchQuery === "" || 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.nameHindi.includes(searchQuery);
      return matchCategory && matchSearch;
    });

    return (
      <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Typing Exam Mode — Government Typing Test Practice" description="Practice government typing exams with 25+ templates including SSC, CPCT, BSF and Court exams." keywords="typing exam practice, ssc typing test, cpct mock, govt typing exam" breadcrumbs={[{name:"Home",path:"/"},{name:"Exam Mode",path:"/exam"}]} />
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                {isHindi ? "परीक्षा मोड" : "Exam Mode"}
              </h1>
              <p className="text-muted-foreground">
                {isHindi ? "अपनी परीक्षा चुनें और अभ्यास शुरू करें" : "Choose your exam and start practicing"}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={isHindi ? "श्रेणी चुनें" : "Select Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{isHindi ? "सभी श्रेणियाँ" : "All Categories"}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isHindi ? "परीक्षा खोजें..." : "Search exams..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Exam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map(e => (
                <Card 
                  key={e.name}
                  className="p-4 cursor-pointer hover:border-primary/50 transition-colors group"
                  onClick={() => navigate(`/exam?examId=${encodeURIComponent(e.name)}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {isHindi ? e.nameHindi : e.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      {isHindi ? e.categoryHindi : e.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(e.duration / 60)} min
                    </span>
                    <span>WPM ≥ {e.minimumWPM}</span>
                    <span>Acc ≥ {e.minimumAccuracy}%</span>
                    {!e.allowBackspace && (
                      <span className="text-destructive font-medium">No ⌫</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                {isHindi ? "कोई परीक्षा नहीं मिली" : "No exams found"}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const targetText = isHindi ? exam.textHindi : exam.text;

  const calculateStats = () => {
    const correctChars = userInput.split("").filter((char, idx) => char === targetText[idx]).length;
    const totalChars = userInput.length;
    const errorCount = totalChars - correctChars;
    const acc = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    const elapsedMinutes = (exam.duration - timeRemaining) / 60;
    const words = correctChars / 5;
    const wpmCalc = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0;
    setErrors(errorCount);
    setAccuracy(acc);
    setWpm(wpmCalc);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!started) setStarted(true);
    const value = e.target.value;
    if (!exam.allowBackspace && value.length < userInput.length) return;
    if (value.length > targetText.length) return;
    setUserInput(value);
    calculateStats();
    if (value.length === targetText.length) {
      setFinished(true);
      saveTestRecord({ type: 'exam' as const, wpm, accuracy, duration: exam.duration - timeRemaining, title: exam.name });
      if (isPassed) setShowNameDialog(true);
    }
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return "text-muted-foreground";
    if (userInput[index] === targetText[index]) return "text-success";
    return "text-destructive bg-destructive/20";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPassed = wpm >= exam.minimumWPM && accuracy >= exam.minimumAccuracy;
  const progress = (userInput.length / targetText.length) * 100;

  const handleGenerateCertificate = () => {
    setShowNameDialog(false);
    setShowCertificate(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate('/exam')}>
            <ChevronLeft className="h-4 w-4" />
            {isHindi ? "वापस" : "Back to Exams"}
          </Button>

          {/* Exam Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{isHindi ? exam.nameHindi : exam.name}</h1>
                  <Badge variant="secondary">{isHindi ? exam.categoryHindi : exam.category}</Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {isHindi ? "परीक्षा मोड - नियमों का पालन करें" : "Exam Mode - Follow the rules"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Clock className={`h-6 w-6 ${timeRemaining < 60 ? 'text-destructive' : 'text-primary'}`} />
                <span className={timeRemaining < 60 ? 'text-destructive' : ''}>{formatTime(timeRemaining)}</span>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="font-semibold">{isHindi ? "परीक्षा नियम:" : "Exam Rules:"}</span>
              </div>
              <ul className="ml-6 space-y-1 text-sm">
                <li>• {isHindi ? `न्यूनतम गति: ${exam.minimumWPM} WPM` : `Minimum Speed: ${exam.minimumWPM} WPM`}</li>
                <li>• {isHindi ? `न्यूनतम सटीकता: ${exam.minimumAccuracy}%` : `Minimum Accuracy: ${exam.minimumAccuracy}%`}</li>
                <li>• {isHindi ? `समय: ${formatTime(exam.duration)}` : `Duration: ${formatTime(exam.duration)}`}</li>
                <li className={!exam.allowBackspace ? 'text-destructive font-semibold' : ''}>
                  • {isHindi 
                    ? (exam.allowBackspace ? "बैकस्पेस: अनुमत" : "बैकस्पेस: अनुमति नहीं ❌")
                    : (exam.allowBackspace ? "Backspace: Allowed" : "Backspace: Not Allowed ❌")}
                </li>
              </ul>
            </div>
          </Card>

          {/* Stats */}
          {started && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">WPM</p>
                <p className={`text-2xl font-bold ${wpm >= exam.minimumWPM ? 'text-success' : 'text-destructive'}`}>{wpm}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "सटीकता" : "Accuracy"}</p>
                <p className={`text-2xl font-bold ${accuracy >= exam.minimumAccuracy ? 'text-success' : 'text-destructive'}`}>{accuracy}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "गलतियां" : "Errors"}</p>
                <p className="text-2xl font-bold text-destructive">{errors}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{isHindi ? "प्रगति" : "Progress"}</p>
                <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
              </Card>
            </div>
          )}

          {/* Progress Bar */}
          {started && (
            <Card className="p-4 mb-6">
              <Progress value={progress} className="h-2" />
            </Card>
          )}

          {/* Typing Area */}
          <Card className="p-6">
            {!started ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">
                  {isHindi ? "परीक्षा शुरू करने के लिए तैयार हैं?" : "Ready to Start the Exam?"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {isHindi 
                    ? "जैसे ही आप टाइप करना शुरू करेंगे, टाइमर शुरू हो जाएगा"
                    : "The timer will start as soon as you begin typing"}
                </p>
                <Button onClick={() => setStarted(true)} size="lg">
                  {isHindi ? "परीक्षा शुरू करें" : "Start Exam"}
                </Button>
              </div>
            ) : (
              <>
                <div 
                  className="text-xl leading-relaxed font-mono mb-6 select-none break-words p-4 bg-muted/30 rounded-lg"
                  style={{ fontFamily: isHindi ? hindiKeyboardFont : undefined }}
                >
                  {targetText.split("").map((char, index) => (
                    <span key={index} className={getCharacterClass(index)}>{char}</span>
                  ))}
                </div>
                
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full p-4 text-xl font-mono border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none bg-background"
                  placeholder={isHindi ? "यहां टाइप करें..." : "Type here..."}
                  rows={5}
                  disabled={finished}
                  spellCheck={false}
                  style={{ fontFamily: isHindi ? hindiKeyboardFont : undefined }}
                />

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{userInput.length} / {targetText.length} {isHindi ? "अक्षर" : "characters"}</span>
                  {!exam.allowBackspace && (
                    <span className="text-destructive font-semibold">
                      ⚠️ {isHindi ? "बैकस्पेस निष्क्रिय" : "Backspace Disabled"}
                    </span>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Results */}
          {finished && (
            <Card className={`p-6 mt-6 ${isPassed ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
              <div className="text-center">
                {isPassed ? (
                  <>
                    <Trophy className="h-16 w-16 text-success mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-success mb-2">
                      {isHindi ? "बधाई हो! आप उत्तीर्ण हो गए! 🎉" : "Congratulations! You Passed! 🎉"}
                    </h3>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-destructive mb-2">
                      {isHindi ? "असफल - फिर से प्रयास करें" : "Failed - Try Again"}
                    </h3>
                  </>
                )}
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-6">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{isHindi ? "आपकी गति" : "Your Speed"}</p>
                    <p className={`text-2xl font-bold ${wpm >= exam.minimumWPM ? 'text-success' : 'text-destructive'}`}>{wpm} WPM</p>
                    <p className="text-xs text-muted-foreground">{isHindi ? `आवश्यक: ${exam.minimumWPM}` : `Required: ${exam.minimumWPM}`}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">{isHindi ? "आपकी सटीकता" : "Your Accuracy"}</p>
                    <p className={`text-2xl font-bold ${accuracy >= exam.minimumAccuracy ? 'text-success' : 'text-destructive'}`}>{accuracy}%</p>
                    <p className="text-xs text-muted-foreground">{isHindi ? `आवश्यक: ${exam.minimumAccuracy}%` : `Required: ${exam.minimumAccuracy}%`}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  {isPassed && (
                    <Button onClick={() => setShowNameDialog(true)} className="mr-2">
                      <Award className="h-4 w-4 mr-2" />
                      {isHindi ? "प्रमाणपत्र प्राप्त करें" : "Get Certificate"}
                    </Button>
                  )}
                  <Button onClick={() => window.location.reload()}>
                    {isHindi ? "फिर से प्रयास करें" : "Try Again"}
                  </Button>
                  <Button onClick={() => navigate('/exam')} variant="outline">
                    {isHindi ? "परीक्षा सूची" : "Back to Exams"}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isHindi ? "प्रमाणपत्र के लिए अपना नाम दर्ज करें" : "Enter Your Name for Certificate"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isHindi ? "यह नाम आपके प्रमाणपत्र पर दिखाई देगा" : "This name will appear on your certificate"}
              </p>
            </div>
            <div>
              <Label htmlFor="userName">{isHindi ? "आपका नाम" : "Your Name"}</Label>
              <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={isHindi ? "अपना नाम दर्ज करें" : "Enter your name"} className="mt-2" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNameDialog(false)}>{isHindi ? "रद्द करें" : "Cancel"}</Button>
              <Button onClick={handleGenerateCertificate} disabled={!userName.trim()}>{isHindi ? "प्रमाणपत्र बनाएं" : "Generate Certificate"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showCertificate && (
        <Certificate
          userName={userName}
          examName={isHindi ? exam.nameHindi : exam.name}
          wpm={wpm}
          accuracy={accuracy}
          date={new Date().toISOString()}
          duration={exam.duration - timeRemaining}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default ExamMode;
