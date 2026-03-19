// src/data/analysis.js

export function analyzeProject(answers) {
  return {
    feasibility: scoreFeasibility(answers),
    methodology: recommendMethodology(answers),
    actionPlan: generateActionPlan(answers),
    gtm: analyzeGTM(answers),
    risks: identifyRisks(answers),
  };
}

// ─── FEASIBILITY SCORING ──────────────────────────────────────
function scoreFeasibility(answers) {
  let score = 0;
  let max = 100;
  let signals = [];
  let warnings = [];

  // Team
  if (answers.teamSize === 'small') { score += 20; signals.push({ text: 'Small focused team — ideal for early stage', type: 'green' }); }
  else if (answers.teamSize === 'medium') { score += 18; signals.push({ text: '4–8 person team gives you good coverage', type: 'green' }); }
  else if (answers.teamSize === 'solo') { score += 10; warnings.push('Solo founders move fast but face burnout — consider an advisor or co-founder'); }
  else if (answers.teamSize === 'large') { score += 12; warnings.push('Large teams early on can slow decisions — be deliberate about structure'); }

  // Tech capability
  if (answers.techCapability === 'advanced') { score += 25; signals.push({ text: 'Strong technical team — major execution advantage', type: 'green' }); }
  else if (answers.techCapability === 'intermediate') { score += 18; signals.push({ text: 'Moderate tech skills — use no-code to fill gaps', type: 'blue' }); }
  else if (answers.techCapability === 'basic') { score += 10; warnings.push('Basic tech skills: plan more time for build. No-code tools will be key.'); }
  else if (answers.techCapability === 'none') { score += 5; warnings.push('No technical skills: factor in hiring or agency costs. Start with no-code/low-code.'); }

  // Timeline
  if (answers.timeline === 'quarter') { score += 20; signals.push({ text: '1–3 month MVP timeline — realistic and focused', type: 'green' }); }
  else if (answers.timeline === 'month') { score += 15; signals.push({ text: '4-week timeline is tight — scope your MVP hard', type: 'blue' }); }
  else if (answers.timeline === 'halfyear') { score += 18; }
  else if (answers.timeline === 'now') { score += 8; warnings.push('Under 2 weeks is extremely tight — you need a pre-built template or no-code tool'); }
  else if (answers.timeline === 'year') { score += 14; warnings.push('12+ month timelines are high-risk without ongoing validation — build in quarterly checks'); }
  else if (answers.timeline === 'flexible') { score += 16; }

  // Budget
  if (answers.budget === 'funded') { score += 25; signals.push({ text: 'Well-funded — strong execution position', type: 'green' }); }
  else if (answers.budget === 'medium') { score += 20; signals.push({ text: 'Decent budget — can hire or use quality tools', type: 'green' }); }
  else if (answers.budget === 'small') { score += 14; signals.push({ text: 'Tight budget — lean execution required', type: 'blue' }); }
  else if (answers.budget === 'micro') { score += 8; warnings.push('Very limited budget — prioritise no-code tools and hustle distribution'); }
  else if (answers.budget === 'zero') { score += 4; warnings.push('Zero cash budget — everything must be time-based. Doable but risky.'); }

  // Competitor awareness
  if (answers.competitors && answers.competitors.length > 30) {
    score += 10;
    signals.push({ text: 'You know your competitors — shows market savvy', type: 'green' });
  } else {
    warnings.push("We couldn't find competitor research. Not knowing who's out there is a real risk.");
  }

  // Cap at 100
  score = Math.min(score, 100);

  let verdict, color, emoji;
  if (score >= 75) { verdict = 'Strong foundation'; color = '#10b981'; emoji = '🟢'; }
  else if (score >= 50) { verdict = 'Viable with risks'; color = '#f59e0b'; emoji = '🟡'; }
  else if (score >= 30) { verdict = 'Needs work before building'; color = '#f97316'; emoji = '🟠'; }
  else { verdict = 'High risk — reconsider scope'; color = '#ef4444'; emoji = '🔴'; }

  // Comparable examples
  const comparables = getComparables(answers);

  return { score, verdict, color, emoji, signals, warnings, comparables };
}

function getComparables(answers) {
  const all = [
    {
      name: 'Paystack', stage: 'Worked', country: '🇳🇬 Nigeria',
      why: 'Solved a real, painful problem (online payments) for businesses that were already trying to collect money. Had technical founders and launched with a focused niche.',
      lesson: 'Start narrow, then expand. Paystack started with Nigerian developers before going mainstream.',
    },
    {
      name: 'Twiga Foods', stage: 'Worked', country: '🇰🇪 Kenya',
      why: 'Digitised informal food supply chain using mobile money. Met farmers and vendors where they were — on feature phones.',
      lesson: 'Meet users where they are. Don\'t ask them to change behaviour dramatically.',
    },
    {
      name: 'Gokada', stage: 'Struggled', country: '🇳🇬 Nigeria',
      why: 'Built a great product but regulatory risk wasn\'t managed. Lagos bike ban wiped out the core business.',
      lesson: 'Regulatory risk in African markets is real. Build contingency plans and lobbying strategies early.',
    },
    {
      name: 'Piggyvest', stage: 'Worked', country: '🇳🇬 Nigeria',
      why: 'Addressed a real savings behaviour among young Nigerians. Simple, trusted, and community-driven.',
      lesson: 'Community trust is a moat. Build relationships, not just features.',
    },
    {
      name: 'Jumia', stage: 'Mixed', country: '🌍 Pan-Africa',
      why: 'Scaled fast but struggled with unit economics and local logistics complexity.',
      lesson: 'Growth before profitability is riskier in emerging markets where infrastructure is unpredictable.',
    },
    {
      name: 'Flutterwave', stage: 'Worked', country: '🌍 Pan-Africa',
      why: 'B2B focus, clear problem (cross-border payments), strong technical team, and excellent distribution via partnerships.',
      lesson: 'B2B can get to revenue faster than B2C in emerging markets.',
    },
  ];

  // Return 2-3 most relevant
  return all.slice(0, 3);
}

// ─── METHODOLOGY RECOMMENDATION ──────────────────────────────
export function recommendMethodology(answers) {
  const { timeline, teamSize, techCapability, budget } = answers;

  let scores = { agile: 0, scrum: 0, kanban: 0, waterfall: 0 };

  if (timeline === 'now' || timeline === 'month') { scores.kanban += 3; scores.agile += 2; }
  else if (timeline === 'quarter') { scores.scrum += 3; scores.agile += 2; }
  else if (timeline === 'halfyear' || timeline === 'year') { scores.waterfall += 2; scores.scrum += 2; }
  else { scores.kanban += 2; }

  if (teamSize === 'solo') { scores.kanban += 3; }
  else if (teamSize === 'small') { scores.agile += 2; scores.scrum += 2; }
  else if (teamSize === 'medium') { scores.scrum += 3; }
  else if (teamSize === 'large') { scores.waterfall += 2; scores.scrum += 2; }

  if (techCapability === 'none' || techCapability === 'basic') { scores.kanban += 2; }
  else { scores.agile += 1; scores.scrum += 1; }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return methodologyData[top] ? { ...methodologyData[top], id: top, customInsight: buildInsight(top, answers) } : methodologyData.agile;
}

function buildInsight(method, answers) {
  const name = answers.projectName || 'your project';
  const timelineMap = { now: '2 weeks', month: '1 month', quarter: '3 months', halfyear: '6 months', year: '12 months', flexible: 'your timeline' };
  const t = timelineMap[answers.timeline] || 'your timeline';

  if (method === 'kanban') return `For ${name}, Kanban fits because you need to stay nimble within ${t}. Use a simple board — "To Do", "In Progress", "Done" — and review it every 2–3 days. Move cards based on priority, not schedule.`;
  if (method === 'scrum') return `For ${name} with a ${t} deadline, run 2-week sprints. Each sprint: pick 5–8 tasks, build them, review with a real user. Every 2 weeks you'll have something testable and learn fast.`;
  if (method === 'agile') return `For ${name}, adopt an Agile mindset: build a little, show users, learn, adjust. Don't plan 6 months ahead — plan 2 weeks ahead and adapt as you go. Every decision should be validated by user feedback.`;
  if (method === 'waterfall') return `For ${name} with well-defined requirements and a ${t} timeline, plan in phases: Requirements → Design → Build → Test → Launch. Get stakeholder sign-off at each phase before proceeding.`;
  return '';
}

const methodologyData = {
  kanban: {
    name: 'Kanban',
    emoji: '🗂️',
    color: '#06b6d4',
    tagline: 'Visual, flexible, and fast',
    explanation: 'Kanban is a visual system for managing work. You see every task on a board — what\'s waiting, what\'s in progress, what\'s done. No rigid schedules, no sprints. Just move tasks as you complete them. Perfect for solo builders and small teams that need to stay agile.',
    sprintLength: null,
    pros: ['Zero setup time', 'Adapts to daily changes', 'Great for solo founders', 'Visual and satisfying'],
    bestFor: 'Solo founders, ultra-short timelines, or teams doing ongoing work without fixed deadlines.',
    tools: ['Trello (free)', 'Notion', 'Linear (free tier)', 'Physical sticky notes'],
    weekOneSteps: ['Set up a board with 4 columns: Backlog, This Week, In Progress, Done', 'Write every task on a card and put them in Backlog', 'Move 3–5 cards to "This Week" — your focus', 'Update daily. Review every Friday.'],
  },
  scrum: {
    name: 'Scrum',
    emoji: '🏃',
    color: '#8b5cf6',
    tagline: '2-week bursts for team momentum',
    explanation: 'Scrum breaks your project into 2-week sprints. At the start of each sprint, your team picks tasks to complete. At the end, you review what\'s done and show it to a real user. Then plan the next sprint. It builds rhythm, accountability, and delivers real results every 2 weeks.',
    sprintLength: '2 weeks',
    pros: ['Regular momentum and accountability', 'Great for teams of 3–10', 'Forces prioritisation', 'Users see progress every 2 weeks'],
    bestFor: 'Teams of 3–10 people with a 2–6 month deadline and evolving requirements.',
    tools: ['Jira (free tier)', 'Linear', 'ClickUp', 'Notion with sprint template'],
    weekOneSteps: ['List every feature you want to build (your backlog)', 'Pick only the 5–8 most important for the first sprint', 'Assign tasks to team members with clear owners', 'Schedule a 15-min daily check-in and a 2-hour review on Day 14'],
  },
  agile: {
    name: 'Agile',
    emoji: '⚡',
    color: '#3b82f6',
    tagline: 'Build, learn, adjust — repeat',
    explanation: 'Agile is less a tool and more a mindset: don\'t try to plan everything upfront. Build something small, put it in front of users, learn from their reaction, and adjust. Keep doing this until you have something people love. The magic is that you can\'t predict what users want until they use it.',
    sprintLength: '1–2 weeks',
    pros: ['Handles uncertainty well', 'User feedback drives direction', 'Reduces risk of building wrong thing', 'Great for products in fuzzy markets'],
    bestFor: 'Small teams in markets with unclear user behaviour, or products that need frequent pivots.',
    tools: ['Trello', 'Notion', 'Basecamp', 'Even a WhatsApp group'],
    weekOneSteps: ['Define your riskiest assumption ("Users will pay for this because...")', 'Build the smallest thing that tests that assumption', 'Show it to 5 real users before building anything else', 'Write down what you learned. Adjust the plan.'],
  },
  waterfall: {
    name: 'Waterfall',
    emoji: '🌊',
    color: '#f59e0b',
    tagline: 'Plan first, execute precisely',
    explanation: 'Waterfall works when you know exactly what you\'re building and requirements won\'t change. Plan everything, then execute phase-by-phase: Requirements → Design → Build → Test → Launch. Each phase is completed before the next begins. Slower to start, but predictable when done right.',
    sprintLength: null,
    pros: ['Very clear structure', 'Easy to manage timelines and budget', 'Great for fixed-scope projects', 'Stakeholders know exactly what to expect'],
    bestFor: 'Projects with well-defined requirements, fixed budgets, government/NGO projects, or compliance-heavy products.',
    tools: ['Asana', 'MS Project', 'Smartsheet', 'Google Sheets + calendar'],
    weekOneSteps: ['Write a clear requirements document — every feature, every screen', 'Get sign-off from all stakeholders on the requirements', 'Create a Gantt chart with phases and deadlines', 'Only start building once design is fully approved'],
  },
};

// ─── ACTION PLAN ─────────────────────────────────────────────
function generateActionPlan(answers) {
  const name = answers.projectName || 'Your Project';
  const hasMoney = ['medium', 'funded', 'small'].includes(answers.budget);
  const hasTech = ['advanced', 'intermediate'].includes(answers.techCapability);

  const mvp = defineMVP(answers);
  const milestones = generate90DayMilestones(answers);
  const decisions = keyDecisions(answers);
  const metrics = successMetrics(answers);

  return { name, mvp, milestones, decisions, metrics };
}

function defineMVP(answers) {
  const hasTech = ['advanced', 'intermediate'].includes(answers.techCapability);
  const noMoney = ['zero', 'micro'].includes(answers.budget);

  let approach, description, scope;

  if (!hasTech && noMoney) {
    approach = 'Manual MVP (Concierge)';
    description = 'Do the job manually before building software. This proves the idea with zero tech cost.';
    scope = [
      'Use WhatsApp, Google Forms, or spreadsheets to deliver the service manually',
      'Serve your first 10 users yourself — this is how you learn what to build',
      'Document every manual step: these become your future features',
      'Don\'t write a line of code until you\'ve served 10 users manually',
    ];
  } else if (!hasTech) {
    approach = 'No-Code MVP';
    description = 'Build a working product using no-code tools — no developer needed.';
    scope = [
      'Use Bubble, Glide, or Webflow to build the core interface',
      'Use Paystack or Flutterwave for payments (no custom code needed)',
      'Use Typeform or Tally for forms and onboarding',
      'Aim for a working prototype in 3–4 weeks',
    ];
  } else {
    approach = 'Coded MVP';
    description = 'Build a minimal but real product with your technical team.';
    scope = [
      'Pick ONE core feature — the thing without which the product doesn\'t work',
      'Build only that feature first. Nothing else.',
      'Use existing services for everything non-core (Supabase for DB, Paystack for payments)',
      'Target: working in users\' hands in under 6 weeks',
    ];
  }

  return { approach, description, scope };
}

function generate90DayMilestones(answers) {
  const timelineMap = {
    now: 'days', month: 'weeks', quarter: 'months',
    halfyear: 'months', year: 'months', flexible: 'months',
  };

  return [
    {
      week: 'Week 1–2',
      title: 'Validate Before Building',
      icon: '🔍',
      color: '#3b82f6',
      tasks: [
        'Talk to 10 potential users — in person or by phone',
        'Ask: "How do you currently deal with this?" — listen, don\'t pitch',
        'Find out if they\'ve paid for a solution before',
        'Decide on your MVP approach based on what you hear',
      ],
    },
    {
      week: 'Week 3–5',
      title: 'Build the First Version',
      icon: '🔨',
      color: '#8b5cf6',
      tasks: [
        'Build only the core feature — resist adding extras',
        'Set up your basic stack (no-code or code)',
        'Create a basic landing page explaining the product',
        'Set up a way to collect feedback from early users',
      ],
    },
    {
      week: 'Week 6–8',
      title: 'Launch to First Users',
      icon: '🚀',
      color: '#10b981',
      tasks: [
        'Share with your first 10–20 handpicked users',
        'Sit with them as they use it — watch where they get stuck',
        'Fix the top 3 issues before expanding',
        'Get your first testimonial or case study',
      ],
    },
    {
      week: 'Week 9–12',
      title: 'Iterate and Grow',
      icon: '📈',
      color: '#f59e0b',
      tasks: [
        'Add the next most requested feature',
        'Expand to 50–100 users through your chosen channel',
        'Track your North Star metric weekly',
        'Decide: double down, pivot, or stop — based on data',
      ],
    },
  ];
}

function keyDecisions(answers) {
  const decisions = [
    {
      question: 'Should you build or buy the core technology?',
      context: 'Building takes longer but gives you control. Buying (no-code, APIs) is faster but may limit you later.',
      recommendation: ['none', 'basic'].includes(answers.techCapability)
        ? 'Buy/use no-code first. Validate the idea before investing in custom development.'
        : 'Build the differentiating parts, buy everything else.',
    },
    {
      question: 'Should you charge from day one?',
      context: 'Free users give feedback but don\'t validate that you\'ve solved a real problem. Paying users do.',
      recommendation: 'Try to charge from user #1 — even a small amount. "Free for beta testers" hides real signal.',
    },
    {
      question: 'When should you bring in a co-founder or team member?',
      context: answers.teamSize === 'solo' ? 'You\'re solo right now — that\'s fine for validation, but limiting for growth.' : 'You have a team — great. Make sure roles are clear.',
      recommendation: answers.teamSize === 'solo'
        ? 'Get to 10 paying users first. Then recruit someone who covers your biggest skill gap.'
        : 'Define who owns product, who owns users, and who owns revenue — now, not later.',
    },
  ];
  return decisions;
}

function successMetrics(answers) {
  const userMetric = answers.successMetric || '50 active users in 90 days';
  return [
    { label: 'Your North Star', value: userMetric, icon: '⭐', desc: 'The one number that tells you it\'s working' },
    { label: 'Activation', value: '60% of signups complete core action', icon: '🎯', desc: 'Users who experience the product\'s value' },
    { label: 'Retention', value: '40% return within 7 days', icon: '🔄', desc: 'Users who come back — the real test of value' },
    { label: 'Revenue Signal', value: 'First paid transaction within 30 days', icon: '💰', desc: 'Proof someone values this enough to pay' },
  ];
}

// ─── GTM ANALYSIS ─────────────────────────────────────────────
function analyzeGTM(answers) {
  const channelInsights = {
    personal: { strength: 'High conversion, high trust', weakness: 'Hard to scale', tip: 'Personal network gets you to ~50 users. You\'ll need a second channel for growth.' },
    community: { strength: 'Targeted, fast feedback loop', weakness: 'Can feel spammy if done wrong', tip: 'Become a valued member of the community before pitching. Give value first.' },
    social: { strength: 'Scalable and measurable', weakness: 'Takes 3–6 months to build traction organically', tip: 'Pick ONE platform where your user already spends time. Go deep, not wide.' },
    partnerships: { strength: 'Fast access to existing customers', weakness: 'Longer sales cycles, dependency risk', tip: 'Find a partner who serves your users and doesn\'t compete with you. Offer them a revenue share.' },
    events: { strength: 'High trust, direct feedback', weakness: 'Hard to scale, expensive in time', tip: 'Events work great in Nigerian market where face-to-face trust matters. Use QR codes to capture leads.' },
    seo: { strength: 'Compounding returns, low cost', weakness: '6–12 months to see significant traffic', tip: 'Not for early stage. Build your content strategy now but don\'t rely on it for first 100 users.' },
    agents: { strength: 'Works in low-digital markets', weakness: 'High operational cost and management complexity', tip: 'Agent models work in Nigeria (think OPay). Budget for training, incentives, and monitoring.' },
  };

  const channel = channelInsights[answers.acquisitionChannel] || channelInsights.personal;

  const revenueInsights = {
    subscription: { viability: 'High if retention is strong', challenge: 'Nigerians prefer to pay for what they use, not upfront subscriptions. Consider monthly with easy cancel.', tip: 'Start with monthly. Annual comes after trust is built.' },
    transaction: { viability: 'Great for marketplaces', challenge: 'Need volume to matter. You need many transactions per user.', tip: 'Keep your take rate under 5% to start. Volume > margin early on.' },
    freemium: { viability: 'Works with large user base', challenge: 'Conversion from free to paid is typically 2–5%. You need lots of free users.', tip: 'The free tier must be genuinely useful. The paid tier must be obviously worth it.' },
    one_time: { viability: 'Simple and trusted', challenge: 'No recurring revenue makes forecasting hard.', tip: 'Good for software tools, templates, or training. Build in an upgrade path.' },
    ads: { viability: 'Needs large audience', challenge: 'Nigerian CPMs are low. You need millions of users to generate meaningful revenue.', tip: 'Ads are almost never viable as a primary model at early stage in Africa.' },
    b2b: { viability: 'Higher ACV, faster revenue', challenge: 'Longer sales cycles, more complex product requirements', tip: 'Enterprise in Nigeria often pays via purchase orders. Build relationships with the economic buyer, not just the user.' },
    grant: { viability: 'Good for social impact', challenge: 'Grants run out. Build a path to sustainability from day one.', tip: 'Use grants to buy time for validation. Build a revenue model even if you don\'t need it yet.' },
    unsure: { viability: 'Unknown', challenge: 'Unclear business model is a high-risk signal', tip: 'Talk to 5 potential customers this week and ask what they currently pay for this type of problem.' },
  };

  const revenue = revenueInsights[answers.revenueModel] || revenueInsights.unsure;

  // Traction probability
  let tractionScore = 0;
  if (answers.firstCustomer && answers.firstCustomer.length > 20) tractionScore += 30;
  if (answers.acquisitionChannel && answers.acquisitionChannel !== 'seo') tractionScore += 20;
  if (['subscription', 'transaction', 'b2b'].includes(answers.revenueModel)) tractionScore += 20;
  if (answers.differentiation && answers.differentiation.length > 30) tractionScore += 15;
  if (answers.teamSize !== 'solo') tractionScore += 15;
  tractionScore = Math.min(tractionScore, 100);

  return { channel, revenue, tractionScore };
}

// ─── RISK IDENTIFICATION ──────────────────────────────────────
function identifyRisks(answers) {
  const risks = [];

  if (!answers.competitors || answers.competitors.length < 20) {
    risks.push({ level: 'high', category: 'Market Risk', title: 'No competitor research done', description: 'Not knowing who else is solving this problem means you might be reinventing the wheel or entering a market with a dominant player you\'re unaware of.', action: 'Spend 2 hours on Google, App Store, and ProductHunt before building anything.' });
  }

  if (answers.teamSize === 'solo' && ['funded', 'medium'].includes(answers.budget)) {
    risks.push({ level: 'medium', category: 'Execution Risk', title: 'Solo founder with significant resources', description: 'Solo founders burn out faster and make more unchecked decisions. Having a thought partner or advisor is critical.', action: 'Find a weekly accountability partner — even someone outside your field.' });
  }

  if (answers.techCapability === 'none' && answers.timeline === 'now') {
    risks.push({ level: 'high', category: 'Build Risk', title: 'No technical skills + urgent deadline', description: 'Under 2 weeks with no technical skills means you cannot build custom software. You need a no-code approach or a technical partner immediately.', action: 'Pivot to a manual or no-code MVP. List of tools included in the Tools section.' });
  }

  if (answers.revenueModel === 'ads' && answers.marketSize !== 'global') {
    risks.push({ level: 'high', category: 'Business Model Risk', title: 'Ad model without global scale', description: 'Advertising revenue requires massive scale to be meaningful in Nigerian/African markets. CPMs are very low.', action: 'Consider adding a subscription or transaction model alongside ads.' });
  }

  if (answers.budget === 'zero' && answers.timeline === 'year') {
    risks.push({ level: 'medium', category: 'Sustainability Risk', title: 'Zero budget over a long timeline', description: 'A year-long project with no budget requires extreme discipline. Most stall at 3–4 months when motivation fades without external pressure.', action: 'Create external accountability: join a startup programme, enter a competition, or set public commitments.' });
  }

  if (!answers.firstCustomer || answers.firstCustomer.length < 20) {
    risks.push({ level: 'high', category: 'Distribution Risk', title: 'No specific first customer identified', description: 'Building without a specific person in mind almost always leads to building features nobody needs.', action: 'Don\'t write a single line of code until you can name a real person who will use this.' });
  }

  if (answers.whyNow === 'other' || !answers.whyNow) {
    risks.push({ level: 'medium', category: 'Timing Risk', title: 'Unclear "Why Now" thesis', description: 'Without a clear reason why this is the right moment, you may be too early or solving a problem that isn\'t urgent enough for users to change behaviour.', action: 'Talk to 5 potential users and ask them: "If this product existed, how quickly would you switch from what you do today?"' });
  }

  // Sort by severity
  const levels = { high: 3, medium: 2, low: 1 };
  return risks.sort((a, b) => levels[b.level] - levels[a.level]);
}
