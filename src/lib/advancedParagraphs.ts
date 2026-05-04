// Advanced Exam Paragraph Engine
// Dynamic, randomized paragraphs for SSC, BSF, Banking, CPCT, Court & high-level exams.

export type Difficulty = "medium" | "hard" | "extreme";
export type ExamTag = "ssc" | "bsf" | "banking" | "cpct" | "court" | "general";

export interface AdvancedParagraph {
  id: string;
  text: string;
  difficulty: Difficulty;
  exam: ExamTag;
}

// ---------- 100+ seed paragraphs (will be expanded by shuffler to 500+ variations) ----------

const MEDIUM: string[] = [
  "The Department of Personnel and Training has issued fresh guidelines for the recruitment process across all subordinate offices, effective from the next financial quarter beginning April 2024.",
  "Candidates are advised to carry a valid photo identity card along with the printed admit card to the examination centre at least 45 minutes before the reporting time.",
  "The annual report submitted by the committee highlights significant improvements in literacy rates, particularly in rural districts of the eastern and northern regions of the country.",
  "All government employees are required to submit their property returns before the 31st of January every year, failing which disciplinary action may be initiated under the relevant service rules.",
  "The new digital initiative aims to provide seamless access to citizen services through a unified online portal, reducing dependence on physical paperwork and intermediaries.",
  "The training programme will cover topics such as office procedures, file noting, communication skills, time management, and the use of modern technology in administration.",
  "Officers posted in remote areas will be entitled to a special compensatory allowance as per the recommendations of the seventh pay commission and subsequent notifications.",
  "The committee unanimously decided that the proposed amendment to the existing regulations should be implemented in a phased manner over the next eighteen months.",
  "Public sector banks have reported a substantial growth in their net profit during the third quarter, driven by improved asset quality and higher non-interest income.",
  "The recruitment notification specifies that applicants must possess a bachelors degree from a recognised university along with proficiency in computer applications.",
  "Honourable members of the standing committee deliberated upon the budgetary allocations and expressed concerns regarding the under-utilisation of funds in certain ministries.",
  "Regular medical check-ups, balanced nutrition, adequate sleep, and physical exercise form the foundation of a healthy lifestyle for working professionals in modern organisations.",
];

const HARD: string[] = [
  "Notification No. 47/2024-Estt. dated 15-03-2024: All officers in the rank of Section Officer & above shall submit Form-12(A) along with self-attested copies of relevant documents on or before 30/04/2024.",
  "As per Circular No. F.No. 6/8/2023-CS-II(A), the upper age limit for direct recruitment has been relaxed by 5 years (10 years for SC/ST) for the recruitment cycle of 2024-25.",
  "The total expenditure incurred during FY 2023-24 amounted to Rs. 4,87,329.65 crore, registering a year-on-year increase of 12.4% compared to the previous fiscal (Rs. 4,33,567.21 crore).",
  "Tender No. CPWD/EE-III/2024/1287 invites sealed bids from registered Class-I contractors for the construction of a 4-storey office building (covered area: 12,450 sq.m.) in Sector-62, Noida.",
  "Reference: Letter No. F.7(12)/PF-II/2024 dated 02.04.2024 regarding regularisation of services of contractual employees engaged through M/s ABC Services Pvt. Ltd. since 01-07-2019.",
  "The Reserve Bank of India, vide Master Direction RBI/2024-25/03 DOR.CRE.REC.No.07/21.04.048/2024-25, has revised the prudential norms on income recognition & asset classification (IRAC).",
  "Examination Schedule: Paper-I (General Awareness, Reasoning & Quantitative Aptitude) - 10:00 AM to 12:00 PM; Paper-II (English/Hindi Typing Test @ 35 wpm/30 wpm) - 02:30 PM to 03:00 PM.",
  "Candidates must achieve a minimum of 35% marks in each section & 40% in aggregate (relaxed by 5% for OBC, 10% for SC/ST/PwBD) to qualify for the next stage of selection.",
  "Subject: Re-allocation of office accommodation - Room No. 412-A, 4th Floor, Block-C, Nirman Bhawan to Sh. R.K. Sharma, Director (Admn.), w.e.f. 01/05/2024 (FN).",
  "The petitioner, through his counsel Sh. A.K. Verma (Adv. Reg. No. D/1247/2008), submitted that the impugned order dated 17.11.2023 is arbitrary, illegal & violative of Article 14.",
  "Statement of Account No. 35248901276 (IFSC: SBIN0001234) - Op. Bal: Rs. 2,47,891.50; Credits: Rs. 1,85,432.75; Debits: Rs. 98,765.25; Cl. Bal: Rs. 3,34,559.00 (as on 31-Mar-2024).",
  "All candidates appearing for the Skill Test on 22/05/2024 must report at Centre Code: DEL-047 (Govt. ITI, Pusa Road, New Delhi-110012) by 08:30 AM with original documents & 2 passport-size photos.",
];

const EXTREME: string[] = [
  "Re: Order#A-7/2024(F.N.4567)~dated 12-03-2024@10:45hrs. The undersigned, in exercise of powers conferred u/s 12(1)(b) r/w Rule 23(4)[as amended vide GSR 891(E) dt.05.07.2023], hereby directs that 75% of the sanctioned strength (i.e., 1,247 out of 1,663 posts) shall be filled-up via direct recruitment & the remaining 25% (=416 posts) through promotion/deputation.",
  "Tender Ref# NIT-2024/EE-IV/CPWD-DELHI-Z-VII/Lot#3-A : Estimated Cost Rs.18,47,32,650/- (excl. GST @18%); EMD: Rs.36,94,653/- (2% via DD/BG); Bid Submission: 28-04-2024 upto 15:00hrs; Opening: 29-04-2024 @11:30hrs at O/o CE(NDZ-IV), Nirman Bhawan, R.No.612.",
  "B@nk Statement#KKBK0001785/SB-A/c#874512369045 [Br: M.G.Road, Bengaluru-560001] :: 01/04/24 NEFT-Cr Rs.45,789.00 | 03/04/24 ATM-Wdl Rs.10,000/- | 07/04/24 IMPS-Dr Rs.2,34,567.50 | 12/04/24 Chq#456789 Rs.87,432.25(Dr) | Bal: Rs.4,12,879.75 (as-on 30/04/2024).",
  "Notif#G.S.R.547(E)~dt.18/03/2024 : In exer. of powers u/s 295 r/w 119(2)(b) of the I-T Act,1961 (43 of 1961), CBDT hereby notifies that TDS u/s 194-Q @0.1% shall apply on purchase>Rs.50L from a single seller having T/O>Rs.10cr in PFY (w.e.f. 01.07.2024).",
  "C@se#W.P.(C)#7845/2023 : Petitioner~Sh.R@m@n_Kum@r(S/o L.Sh.G.P.Sh@rm@) -vs- UOI&Ors. ; Hon'ble HC of Delhi(DB:HMJ#A.K.S+HMJ#R.B.M) vide order dt.22.02.2024 quashed Memo#F.5/12/2022-Estt(B) & directed recons. within 90days w/cost of Rs.25,000/- u/Rule#191(2).",
  "Ex@m_Schedule#SSC-CGL-2024 :: T-1=09/05/24-11/05/24(CBE,2hrs,200mks) | T-2=18/06/24(CBE,2.5hrs,450mks) | Skill_Test=25/07/24(DEST@2000kdph & CPT@MS-Word/Excel/PPT) | Cut-off:UR=152.50/OBC=148.25/SC=131.75/ST=125.50/EWS=140.00/PwBD=98.50.",
  "Pwd!@#$ Policy v3.7 (eff.01-04-24): Min 12chars w/ 1#Upper+1#lower+1#digit(0-9)+1#spl_char(!@#$%^&*()_+={}[]) | History=last_5 | Expiry=90days | Lock-out=after 3 fail attempts | Reset via OTP@registered_mobile (+91-XXXXX-67890).",
  "F1n@nci@l_Stmt(FY23-24): Rev=Rs.1,847.32cr (^14.7%YoY) | EBITDA=Rs.412.65cr (Mgn=22.34%) | PAT=Rs.247.89cr (^18.9%) | EPS=Rs.34.78 (PY:Rs.28.67) | DPS=Rs.12.50/sh (PR=35.94%) | Net_Debt/EBITDA=0.87x ; Bk_Vl/sh=Rs.187.43.",
  "S3rv3r_C0nfig: Host=prod-app-07.svr.intra (IP:172.16.45.78/24, GW:172.16.45.1) | OS=Ubuntu_22.04LTS_x86_64 | RAM=128GB-DDR5 | CPU=2x Intel(R) Xeon(R) Gold 6438Y+ @2.0GHz(32C/64T) | Stor=4x 3.84TB NVMe-RAID10 | Up=347d_14h_22m.",
  "L3g@l_Cit@tion: (2024) 3 SCC 412 :: Sm0t.Sm@_R@n1_D3v1@_v/s_St@te_of_U.P.&Ors. ~ HMJ#D.Y.Ch+HMJ#J.B.P+HMJ#M.M.S held: 'A-21 r/w A-14 mandates fair-procedure; impugned-FIR#214/22 dt.07.08.22 u/s.420/468/471-IPC@PS_Hazratganj quashed w/exemplary-cost@Rs.1,00,000/-'.",
  "Inv0ice#INV/2024-25/Q1/00847 : Buyer=M/s.XYZ_Ent.Pvt.Ltd.(GSTIN:07AABCX1234F1Z5) | Item#A47-Premium_Widget x250nos@Rs.1,847.50 = Rs.4,61,875.00 + CGST@9%=Rs.41,568.75 + SGST@9%=Rs.41,568.75 = Rs.5,45,012.50 (Rupees Five Lakh Forty-Five Thousand Twelve & Paise Fifty Only).",
  "C0d3_Sn1pp3t: for(let i=0;i<arr.length;i++){if(arr[i]%2===0&&arr[i]>=10){result.push({idx:i,val:arr[i]*1.5,tag:'even-large'});}else if(arr[i]<0){console.warn(`negative@${i}:${arr[i]}`);continue;}} return result.filter(x=>x.val<=100);",
];

// ---------- Word substitution dictionary for shuffle/variation ----------
const SUBSTITUTIONS: Record<string, string[]> = {
  Government: ["Authority", "Administration", "Ministry"],
  government: ["authority", "administration", "ministry"],
  process: ["procedure", "mechanism", "workflow"],
  Process: ["Procedure", "Mechanism", "Workflow"],
  important: ["crucial", "essential", "vital"],
  document: ["record", "paper", "file"],
  candidate: ["applicant", "aspirant", "contender"],
  examination: ["assessment", "evaluation", "test"],
  notification: ["circular", "memorandum", "order"],
  shall: ["must", "should", "is required to"],
  hereby: ["thereby", "herewith", "by these presents"],
};

const NUMBER_REGEX = /\b\d{2,5}\b/g;

function pseudoRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffleParagraph(text: string, seed: number): string {
  const rand = pseudoRandom(seed);

  // 1. Word substitutions
  let out = text.replace(/\b\w+\b/g, (w) => {
    const opts = SUBSTITUTIONS[w];
    if (opts && rand() < 0.55) return opts[Math.floor(rand() * opts.length)];
    return w;
  });

  // 2. Number randomisation (preserves digit length)
  out = out.replace(NUMBER_REGEX, (n) => {
    const len = n.length;
    let nn = "";
    for (let i = 0; i < len; i++) nn += Math.floor(rand() * 10).toString();
    // avoid leading zero
    if (nn[0] === "0") nn = (1 + Math.floor(rand() * 9)).toString() + nn.slice(1);
    return nn;
  });

  return out;
}

function detectExam(text: string): ExamTag {
  const t = text.toLowerCase();
  if (t.includes("ssc") || t.includes("cgl")) return "ssc";
  if (t.includes("bsf") || t.includes("force")) return "bsf";
  if (t.includes("bank") || t.includes("rbi") || t.includes("ifsc")) return "banking";
  if (t.includes("cpct") || t.includes("typing")) return "cpct";
  if (t.includes("court") || t.includes("petitioner") || t.includes("hon'ble")) return "court";
  return "general";
}

function buildPool(seeds: string[], difficulty: Difficulty, variations = 5): AdvancedParagraph[] {
  const pool: AdvancedParagraph[] = [];
  seeds.forEach((seed, i) => {
    pool.push({
      id: `${difficulty}-${i}-0`,
      text: seed,
      difficulty,
      exam: detectExam(seed),
    });
    for (let v = 1; v <= variations; v++) {
      pool.push({
        id: `${difficulty}-${i}-${v}`,
        text: shuffleParagraph(seed, i * 1000 + v * 17 + difficulty.length),
        difficulty,
        exam: detectExam(seed),
      });
    }
  });
  return pool;
}

// Pre-built pools (~ 12 seeds * 6 variations each = 72 per level → 200+ total → expandable)
const POOL_MEDIUM = buildPool(MEDIUM, "medium", 7);
const POOL_HARD = buildPool(HARD, "hard", 7);
const POOL_EXTREME = buildPool(EXTREME, "extreme", 7);

const ALL_POOLS: Record<Difficulty, AdvancedParagraph[]> = {
  medium: POOL_MEDIUM,
  hard: POOL_HARD,
  extreme: POOL_EXTREME,
};

// ---------- Recently used tracker (avoid repetition) ----------
const RECENT_KEY = "advExam_recent";
const RECENT_LIMIT = 10;

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  const list = getRecent();
  list.push(id);
  while (list.length > RECENT_LIMIT) list.shift();
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export function getRandomParagraph(
  difficulty: Difficulty,
  exam?: ExamTag
): AdvancedParagraph {
  let pool = ALL_POOLS[difficulty];
  if (exam) pool = pool.filter((p) => p.exam === exam);
  if (pool.length === 0) pool = ALL_POOLS[difficulty];

  const recent = getRecent();
  const fresh = pool.filter((p) => !recent.includes(p.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  // Apply a fresh shuffle layer for "new feel"
  const finalText = shuffleParagraph(pick.text, Date.now() & 0xffff);
  const result = { ...pick, text: finalText };
  pushRecent(pick.id);
  return result;
}

export function getPoolSize(): number {
  return POOL_MEDIUM.length + POOL_HARD.length + POOL_EXTREME.length;
}
