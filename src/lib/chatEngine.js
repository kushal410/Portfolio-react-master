// Rule-based résumé chatbot engine — fully static, no LLM/API calls.
// All facts come from /resume.json; this file only holds the matching logic.

let resume = null;

export function setResume(data) {
  resume = data;
}

export function hasResume() {
  return resume !== null;
}

export function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function linkify(text) {
  return escapeHtml(text).replace(
    /https?:\/\/[^\s]+?(?=[.,;:)\]]*(\s|$))/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
}

// Whole-word matching only: plain substring checks would match "api" inside
// "capital" or "your" inside a project title full of common words.
const STOPWORDS = new Set([
  'the', 'and', 'with', 'from', 'your', 'have', 'what', 'about', 'this',
  'that', 'were', 'been', 'into', 'their', 'you', 'are', 'for', 'who',
  'how', 'can', 'ask', 'tell', 'me', 'a', 'an', 'of', 'is', 'in', 'on',
  'to', 'did', 'does', 'do', 'app', 'system', 'website', 'platform',
  'know', 'knows', 'knew', 'used', 'using', 'use',
]);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hasWord(text, word) {
  return new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text);
}

export function meaningfulWords(str, minLen) {
  return str
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= minLen && !STOPWORDS.has(w));
}

function firstName() {
  return resume.name.split(' ')[0];
}

function listExperience() {
  const lines = resume.experience.map(
    (e) => `${e.title} at ${e.company} (${e.dates})`
  );
  return `I've spent 3+ years across four companies: ${lines.join('; ')}. Ask me about any one of these by name and I'll go deeper.`;
}

function introduceSelf() {
  const current = resume.experience[0];
  return `Hi, I'm ${resume.name}, a ${resume.role}. I live in ${resume.location}. ${resume.summary} Right now I'm ${current.title} at ${current.company}. Ask me about my experience, skills, projects, or education for more.`;
}

function findCompany(text) {
  return resume.experience.find((e) =>
    meaningfulWords(e.company, 4).some((word) => hasWord(text, word))
  );
}

function describeCompany(e) {
  return `At ${e.company} (${e.dates}) I worked as ${e.title}. Highlights: ${e.highlights.join(' ')}`;
}

function listSkills() {
  const cats = Object.entries(resume.skills)
    .map(([cat, { level, tools }]) => `${cat} (self-rated ${level}: ${tools.join(', ')})`)
    .join('; ');
  return `Here's how I'd rate my own coverage: ${cats}. I also work with ${resume.languagesAndTools.join(', ')}.`;
}

function findSkillCategory(text) {
  return Object.entries(resume.skills).find(([, { tools }]) =>
    meaningfulWords(tools.join(' '), 4).some((word) => hasWord(text, word))
  );
}

function listProjects() {
  const lines = resume.projects.map((p) => `${p.title} (${p.company}) — ${p.description}`);
  return `A few projects I've worked on: ${lines.join(' | ')}`;
}

function findProject(text) {
  return resume.projects.find((p) =>
    meaningfulWords(p.title, 4).some((word) => hasWord(text, word))
  );
}

function describeEducation() {
  return resume.education
    .map((e) => `${e.degree} from ${e.school} (${e.detail})`)
    .join(' ');
}

function describeContact() {
  return `Best way to reach me: email at ${resume.email} or phone ${resume.phone}. I live in ${resume.location}. LinkedIn: ${resume.links.linkedin} · GitHub: ${resume.links.github} · Portfolio: ${resume.links.portfolio}`;
}

function describeRecommendation() {
  const r = resume.recommendation;
  return r ? `${r.name}, ${r.title}, has recommended me on ${r.via} — happy to point you to it.` : "I don't have a recommendation listed right now.";
}

function buildIntents() {
  return [
    { test: (t) => /^(hi|hello|hey|sup|yo)\b/.test(t), answer: () => `Hey! Ask me about my experience, skills, projects, education, or how to reach me.` },
    { test: (t) => /(who are you|are you\s.*\b(a\s+)?(bot|real|ai)\b|\bhuman\b)/.test(t), answer: () => `I'm a small script on ${firstName()}'s portfolio that matches your question to answers pulled straight from his résumé — not a language model, just quick lookups. For anything I can't answer, email works best.` },
    { test: (t) => /(your name|what.*(are|is) you call|who.*(are|is) you named|what should i call you)/.test(t), answer: () => `My name is ${resume.name}.` },
    { test: (t) => /(what.*(do you do|you do).*(living|for a living)|what do you do\b|your profession|what.*you do for work|what.*your job)/.test(t), answer: () => `I'm a Software Engineer — specifically a ${resume.role}. My job is making sure the software actually meets what the client asked for, and that the quality is something people can trust and rely on, whether that's a chatbot, a mobile app, or an API. I do that through functional, API, integration, regression, and end-to-end testing, plus automation to keep every release reliable.` },
    { test: (t) => /(which country|what country|country.*live|where.*(you|do you).*(live|based|located)|where are you from|what country.*from)/.test(t), answer: () => `I live in Nepal — based in ${resume.location}.` },
    { test: (t) => /(hybrid|onsite|on-site|remote work|work from home|\bwfh\b|freelance|freelancer)/.test(t), answer: () => `Yes — I'm open to hybrid, onsite, or fully remote/work-from-home setups, and I'm available for freelance work too. Whatever arrangement works best for the team.` },
    { test: (t) => /(salary|compensation|negotiat|pay range|rate\b|expected pay)/.test(t), answer: () => `Salary is something I'm happy to discuss and negotiate based on the role and scope. Best way to reach out for that: email me at ${resume.email} or call/text ${resume.phone} — I'll get back to you quickly.` },
    { test: (t) => /(interest|hobby|hobbies|free time|outside of work|pastime|fun fact)/.test(t), answer: () => `Outside of coding and improving software quality, I like playing football in my free time, watching YouTube videos and learning new skills, swimming, listening to music, and traveling. But building new projects and leveling up software quality is still what I'm strongest and best at.` },
    { test: (t) => /(why.*(hire|should we|should i|pick|choose) you|why you)/.test(t), answer: () => `Honestly, just being myself: 3+ years of QA experience across four companies, growing from manual and web QA into mobile automation and now agentic AI, so I don't just find bugs — I understand how the product is actually built. I'm curious, I keep learning, I'm honest about what I know and don't, and I genuinely care about shipping quality software, not just passing tests. That combination — real experience plus who I am — is why I'd be a solid hire.` },
    { test: (t) => /(value.*(add|bring|contribut)|what.*(did you|have you) (add|bring|contribut))/.test(t), answer: () => `I added value beyond just testing — my strong communication skills meant I could bridge devs, product, and stakeholders, catching gaps early instead of after release. I raised clear, well-documented bugs, pushed for better test coverage and process, and was proactive about learning the product deeply so my feedback was actually useful. On the agentic AI side, that same clarity helped the team reason about prompts, guardrails, and edge cases that are easy to miss. Overall, I made quality everyone's responsibility, not just QA's.` },
    { test: (t) => /(strongest.*qa|qa.*(strongest|skill)|strongest.*skill)/.test(t), answer: () => `My strongest QA skills are core testing fundamentals — test case design, regression, and test strategy, which I'd rate myself around 92% on — backed by solid automation with Selenium, Appium, and Playwright (about 88%), and API testing with Postman/Newman (around 85%). Beyond the tools though, I think my biggest strength is thinking like a user and catching the edge cases other people miss.` },
    { test: (t) => /automation experience|experience.*automation|automation.*background/.test(t), answer: () => `I've built automation in Python using Selenium for web and Appium for mobile (iOS & Android), plus Playwright more recently. For example, I automated core user journeys — sign-up, login, rewards and redemption — for the Hotstone Loyalty App and ran them in CI with GitHub Actions. I also automate API checks with Postman/Newman. My approach is to automate the stable, high-value flows first and keep exploratory testing for the rest.` },
    { test: (t) => /(test.*(ai )?chatbot|chatbot.*test|test.*ai agent|ai agent.*test)/.test(t), answer: () => `At Palm Mind I lead QA for AI-powered chatbots and agentic products, so testing goes beyond the usual functional checks. I validate RAG pipeline accuracy — is it pulling the right context — NLP behavior across varied phrasing, whether prompts and guardrails actually hold, and how the conversation holds up across multiple turns. I also push on edge cases like ambiguous or adversarial input, so the bot fails gracefully instead of hallucinating.` },
    { test: (t) => /api testing|test.*api\b|api.*experience/.test(t), answer: () => `I test APIs mainly with Postman and Newman — validating request/response contracts, status codes, and payloads, plus negative and edge-case scenarios, not just the happy path. I run these in CI (GitHub Actions/Jenkins) so regressions get caught automatically, and I use SQL to cross-check that returned data actually matches what's in the database.` },
    { test: (t) => /mobile.*(test|application)|test.*mobile/.test(t), answer: () => `For mobile, I test across real device and OS combinations using Appium (Python) plus BrowserStack for cross-device coverage. I cover the full flow — onboarding, auth, core features, edge states — on both iOS and Android, since the two platforms tend to break differently. I automate the critical regression paths and run them every release, and do manual/exploratory testing for anything new or visually sensitive.` },
    { test: (t) => /(critical.*(bug|production)|production.*bug|handle.*bug)/.test(t), answer: () => `First I reproduce and confirm the issue, then assess real user impact and severity so the right people get alerted right away. I document clear reproduction steps, logs, and evidence so engineering can move fast, stay closely looped in during the fix, retest immediately once it's patched, and add a regression test so it can't quietly come back.` },
    { test: (t) => /test strategy/.test(t), answer: () => `I start with what matters most to the user and the business — the critical paths — and prioritize from there: functional, API, integration, regression, and end-to-end coverage layered on top. I decide what to automate vs. test manually based on stability and repetition, set up CI so regression runs automatically, and keep the strategy living, adjusting it as the product and risk areas change.` },
    { test: (t) => /(tools.*(worked|used)|what tools)/.test(t), answer: () => `Selenium and Appium (Python) for automation, Playwright more recently, Postman/Newman for API testing, GitHub Actions and Jenkins for CI/CD, JIRA and Trello for tracking, Git/GitHub for version control, BrowserStack for cross-device testing, and some exposure to JUnit/TestNG. I've also started using Lighthouse, Grafana k6, and OWASP ZAP for basic performance and security checks.` },
    { test: (t) => /(difficult|tricky|toughest|hardest).*(defect|bug)/.test(t), answer: () => `One that stands out was in a loyalty app's rewards and points logic — balances calculated correctly most of the time, but under specific timing, like redeeming right as a new offer activated, users could end up with an incorrect balance. It wasn't reproducible on the first few tries, so I had to dig into the sequence and timing of events rather than just the UI, document the exact conditions, and work with engineering to trace it to a race condition on the backend. It taught me to always think about timing and concurrency, not just individual steps.` },
    { test: (t) => /(senior.*qa|lead qa|makes you.*(senior|lead))/.test(t), answer: () => `For me it's less about the title and more about ownership. Leading QA for AI-powered chatbots at Palm Mind means I decide the test strategy, not just execute test cases — I connect testing to real business risk, work directly with product and engineering instead of waiting for handoffs, and I'm accountable for release quality overall, not just my own tickets.` },
    { test: (t) => /mentor/.test(t), answer: () => `I lead by example first — pairing on real test cases and automation scripts rather than just telling people what to do. I encourage juniors to ask why something is a bug, not just what is broken, give specific feedback on their test cases and defect reports, and give them room to make mistakes on lower-risk areas so they build judgment, not just checklist habits.` },
    { test: (t) => /(decide|choose).*automat|what.*automate/.test(t), answer: () => `I automate things that are repetitive, stable, and high-value — core regression paths, critical user journeys, API contracts — since those pay off every release cycle. New, frequently changing, or visually sensitive features I keep manual or exploratory at first, and only automate once they stabilize. High-risk but rarely-changing flows are strong automation candidates; still-evolving ones aren't worth the maintenance yet.` },
    { test: (t) => /validate.*(ai agent|agent)|ai agent.*valid/.test(t), answer: () => `I treat it like testing a person, not just a program — checking it retrieves the right context (RAG accuracy), responds appropriately across varied and unexpected phrasing, respects its guardrails, and stays consistent across multi-turn conversations. I also test how it fails: does it hallucinate, does it clearly say when it doesn't know something, does it stay safe under adversarial or off-topic prompts. It's a mix of scripted scenarios and exploratory "break it" testing.` },
    { test: (t) => /(jira|ci\/cd|ci cd|continuous integration)/.test(t), answer: () => `I use JIRA for tracking defects, test cases, and release status across teams, and I've built CI pipelines with GitHub Actions and Jenkins to run automated regression and API test suites (Postman/Newman) on every build, so issues get caught before they reach manual QA. That combination keeps releases predictable and gives the team fast feedback instead of finding problems late.` },
    { test: (t) => /(introduce yourself|tell me about yourself|about yourself|who is kushal|your background|elevator pitch)/.test(t), answer: introduceSelf },
    { test: (t) => /github/.test(t), answer: () => `My GitHub is ${resume.links.github}` },
    { test: (t) => /linkedin/.test(t), answer: () => `My LinkedIn is ${resume.links.linkedin}` },
    { test: (t) => /portfolio/.test(t), answer: () => `My portfolio website is ${resume.links.portfolio}` },
    { test: (t) => findCompany(t) !== undefined, answer: (t) => describeCompany(findCompany(t)) },
    { test: (t) => findProject(t) !== undefined, answer: (t) => {
        const p = findProject(t);
        return `${p.title} (${p.company}): ${p.description} ${p.note}.`;
      } },
    { test: (t) => findSkillCategory(t) !== undefined, answer: (t) => {
        const [cat, { level, tools }] = findSkillCategory(t);
        return `${cat} — self-rated ${level}. Tools: ${tools.join(', ')}.`;
      } },
    { test: (t) => /(experience|work history|career|companies|jobs|background)/.test(t), answer: listExperience },
    { test: (t) => /(skill|tool|tech stack|automation|framework)/.test(t), answer: listSkills },
    { test: (t) => /(project|portfolio work|case stud)/.test(t), answer: listProjects },
    { test: (t) => /(education|degree|university|college|study|studied)/.test(t), answer: describeEducation },
    { test: (t) => /(recommend|reference|testimonial)/.test(t), answer: describeRecommendation },
    { test: (t) => /(contact|email|phone|reach|hire|available|opportunit)/.test(t), answer: describeContact },
  ];
}

export function getOpeningMessage() {
  return `Hey, I'm ${firstName()}'s résumé bot. Ask me about my experience, skills, projects, education, or how to reach me.`;
}

export function answer(userText) {
  const t = userText.toLowerCase();
  const intents = buildIntents();
  for (const intent of intents) {
    if (intent.test(t)) return intent.answer(t);
  }
  return `I'm not trained on that yet. Try asking about my experience, skills, projects, or education — or email me directly at ${resume.email}.`;
}
