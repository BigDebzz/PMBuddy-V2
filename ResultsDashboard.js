import React, { useState, useEffect } from 'react';
import { analyzeProject } from '../data/analysis';
import { toolCategories, decisionMatrix } from '../data/tools';
import { isSupabaseConfigured, saveProject } from '../lib/supabase';

const TABS = [
  { id: 'feasibility', label: '⚡ Feasibility', shortLabel: 'Feasibility' },
  { id: 'methodology', label: '🧭 Methodology', shortLabel: 'Method' },
  { id: 'actionplan', label: '🗺️ Action Plan', shortLabel: 'Plan' },
  { id: 'gtm', label: '🚀 Go-to-Market', shortLabel: 'GTM' },
  { id: 'tools', label: '🧰 Build Tools', shortLabel: 'Tools' },
];

export default function ResultsDashboard({ answers, savedId, onReset }) {
  const [activeTab, setActiveTab] = useState('feasibility');
  const [analysis] = useState(() => analyzeProject(answers));
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [projectId, setProjectId] = useState(savedId || null);

  const { feasibility, methodology, actionPlan, gtm, risks } = analysis;

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase is not configured yet. See the README for setup instructions.\n\nYour answers are safe in this tab — you can screenshot or print this page.');
      return;
    }
    setSaveStatus('saving');
    try {
      const result = await saveProject({ id: projectId, answers, results: analysis });
      setProjectId(result.id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.projectBadge}>✨ {answers.projectName || 'Your Project'}</div>
          <h2 style={styles.headerTitle}>Validation Report</h2>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.saveBtn} onClick={handleSave}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}>
            {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✅ Saved!' : saveStatus === 'error' ? '❌ Error' : '💾 Save Project'}
          </button>
          <button style={styles.newBtn} onClick={onReset}>+ New Project</button>
        </div>
      </div>

      {/* Overall health bar */}
      <div style={styles.healthBar}>
        <div style={styles.healthScore}>
          <span style={styles.healthNum} className="gradient-text">{feasibility.score}</span>
          <span style={styles.healthLabel}>Feasibility Score</span>
        </div>
        <div style={styles.healthMeter}>
          <div style={styles.healthMeterBg}>
            <div style={{ ...styles.healthMeterFill, width: `${feasibility.score}%`, background: feasibility.color }} />
          </div>
          <span style={{ ...styles.healthVerdict, color: feasibility.color }}>
            {feasibility.emoji} {feasibility.verdict}
          </span>
        </div>
        <div style={styles.healthRight}>
          <span style={{ color: '#ef4444', fontSize: 13 }}>⚠️ {risks.length} risks identified</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <div style={styles.tabs}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
              <span className="tab-full">{tab.label}</span>
              <span className="tab-short" style={{ display: 'none' }}>{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={styles.tabContent} key={activeTab} className="fade-up">
        {activeTab === 'feasibility' && <FeasibilityTab feasibility={feasibility} risks={risks} />}
        {activeTab === 'methodology' && <MethodologyTab methodology={methodology} />}
        {activeTab === 'actionplan' && <ActionPlanTab actionPlan={actionPlan} />}
        {activeTab === 'gtm' && <GTMTab gtm={gtm} answers={answers} />}
        {activeTab === 'tools' && <ToolsTab answers={answers} />}
      </div>

      {/* Bottom nav */}
      <div style={styles.bottomNav}>
        {TABS.map((tab, i) => (
          <button key={tab.id} style={styles.bottomNavBtn} onClick={() => setActiveTab(tab.id)}
            disabled={activeTab === tab.id}>
            ← {i > 0 ? TABS[i - 1]?.shortLabel : ''}
          </button>
        )).filter((_, i) => false)}
        <div style={styles.navHint}>Use the tabs above to explore all sections of your report</div>
      </div>
    </div>
  );
}

// ─── FEASIBILITY TAB ──────────────────────────────────────────
function FeasibilityTab({ feasibility, risks }) {
  return (
    <div style={styles.tabInner}>
      <SectionTitle icon="⚡" title="Feasibility Assessment" subtitle="An honest look at whether you can pull this off." />

      {/* Signals */}
      <div style={styles.signalsGrid}>
        <div style={styles.signalCol}>
          <h4 style={styles.colTitle}>✅ Strengths</h4>
          {feasibility.signals.length > 0 ? feasibility.signals.map((s, i) => (
            <div key={i} style={{ ...styles.signalCard, borderColor: `${s.type === 'green' ? '#10b981' : '#3b82f6'}30`, background: `${s.type === 'green' ? '#10b981' : '#3b82f6'}08` }}>
              <span style={{ color: s.type === 'green' ? '#34d399' : '#60a5fa', marginRight: 8 }}>●</span>
              {s.text}
            </div>
          )) : <p style={styles.empty}>No clear strengths identified yet.</p>}
        </div>
        <div style={styles.signalCol}>
          <h4 style={styles.colTitle}>⚠️ Warnings</h4>
          {feasibility.warnings.map((w, i) => (
            <div key={i} style={{ ...styles.signalCard, borderColor: '#f59e0b30', background: '#f59e0b08' }}>
              <span style={{ color: '#fcd34d', marginRight: 8 }}>●</span>{w}
            </div>
          ))}
        </div>
      </div>

      {/* Comparable examples */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>📚 Learn from those who've been here</h4>
        <div style={styles.comparablesGrid}>
          {feasibility.comparables.map((c, i) => (
            <div key={i} style={styles.comparableCard}>
              <div style={styles.compHeader}>
                <span style={styles.compName}>{c.name}</span>
                <span style={{
                  ...styles.compBadge,
                  background: c.stage === 'Worked' ? '#10b98120' : c.stage === 'Struggled' ? '#ef444420' : '#f59e0b20',
                  color: c.stage === 'Worked' ? '#34d399' : c.stage === 'Struggled' ? '#f87171' : '#fcd34d',
                }}>
                  {c.stage === 'Worked' ? '✓ Succeeded' : c.stage === 'Struggled' ? '✗ Struggled' : '◑ Mixed'}
                </span>
                <span style={styles.compCountry}>{c.country}</span>
              </div>
              <p style={styles.compWhy}>{c.why}</p>
              <div style={styles.compLesson}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>Key lesson: </span>{c.lesson}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>🔴 Risks to Address Now</h4>
        {risks.length === 0 ? (
          <p style={styles.empty}>No critical risks detected. Keep asking yourself hard questions.</p>
        ) : risks.map((r, i) => (
          <div key={i} style={{
            ...styles.riskCard,
            borderColor: r.level === 'high' ? '#ef444430' : '#f59e0b30',
          }}>
            <div style={styles.riskHeader}>
              <span style={{
                ...styles.riskLevel,
                background: r.level === 'high' ? '#ef444420' : '#f59e0b20',
                color: r.level === 'high' ? '#f87171' : '#fcd34d',
              }}>
                {r.level === 'high' ? '🔴 HIGH' : '🟡 MEDIUM'}
              </span>
              <span style={styles.riskCategory}>{r.category}</span>
            </div>
            <h5 style={styles.riskTitle}>{r.title}</h5>
            <p style={styles.riskDesc}>{r.description}</p>
            <div style={styles.riskAction}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>→ Action: </span>{r.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── METHODOLOGY TAB ──────────────────────────────────────────
function MethodologyTab({ methodology: m }) {
  return (
    <div style={styles.tabInner}>
      <SectionTitle icon="🧭" title="Your Recommended Methodology" subtitle="Not just a name — here's exactly how to apply it to your project." />

      <div style={{ ...styles.methodCard, borderTop: `3px solid ${m.color}` }}>
        <div style={styles.methodHeader}>
          <span style={styles.methodEmoji}>{m.emoji}</span>
          <div>
            <h3 style={{ ...styles.methodName, color: m.color }}>{m.name}</h3>
            <p style={styles.methodTagline}>{m.tagline}</p>
          </div>
          {m.sprintLength && (
            <div style={{ ...styles.sprintBadge, background: `${m.color}20`, color: m.color }}>
              🔄 {m.sprintLength} sprints
            </div>
          )}
        </div>

        <p style={styles.methodExplanation}>{m.explanation}</p>

        {/* Custom insight */}
        {m.customInsight && (
          <div style={styles.insightBox}>
            <div style={styles.insightLabel}>📌 Applied to YOUR project</div>
            <p style={styles.insightText}>{m.customInsight}</p>
          </div>
        )}

        <div style={styles.methodGrid}>
          <div>
            <h5 style={styles.methodSubtitle}>Why it fits you</h5>
            {m.pros.map((p, i) => (
              <div key={i} style={styles.proItem}>
                <span style={{ color: m.color }}>✓</span> {p}
              </div>
            ))}
          </div>
          <div>
            <h5 style={styles.methodSubtitle}>Best for</h5>
            <p style={styles.bestFor}>{m.bestFor}</p>
            <h5 style={{ ...styles.methodSubtitle, marginTop: 20 }}>Free tools</h5>
            <div style={styles.toolChips}>
              {m.tools.map(t => (
                <span key={t} style={{ ...styles.toolChip, borderColor: `${m.color}40`, color: m.color }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Week 1 steps */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>📅 Your Week 1 Steps</h4>
        {m.weekOneSteps.map((step, i) => (
          <div key={i} style={styles.stepItem}>
            <div style={{ ...styles.stepNum, background: m.color }}>{i + 1}</div>
            <p style={styles.stepText}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ACTION PLAN TAB ──────────────────────────────────────────
function ActionPlanTab({ actionPlan }) {
  const { mvp, milestones, decisions, metrics } = actionPlan;

  return (
    <div style={styles.tabInner}>
      <SectionTitle icon="🗺️" title="Your 90-Day Action Plan" subtitle="Specific steps tailored to your project, team, and resources." />

      {/* MVP Definition */}
      <div style={styles.mvpCard}>
        <div style={styles.mvpHeader}>
          <span style={styles.mvpIcon}>🔨</span>
          <div>
            <h4 style={styles.mvpApproach}>{mvp.approach}</h4>
            <p style={styles.mvpDesc}>{mvp.description}</p>
          </div>
        </div>
        <div style={styles.mvpScope}>
          <h5 style={styles.scopeTitle}>Your MVP scope:</h5>
          {mvp.scope.map((item, i) => (
            <div key={i} style={styles.scopeItem}>
              <span style={{ color: '#3b82f6', flexShrink: 0 }}>→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>📍 90-Day Milestones</h4>
        <div style={styles.milestoneList}>
          {milestones.map((m, i) => (
            <div key={i} style={{ ...styles.milestoneCard, borderLeft: `3px solid ${m.color}` }}>
              <div style={styles.mileHeader}>
                <span style={{ ...styles.mileIcon, background: `${m.color}20`, color: m.color }}>{m.icon}</span>
                <div>
                  <div style={styles.mileWeek}>{m.week}</div>
                  <div style={styles.mileTitle}>{m.title}</div>
                </div>
              </div>
              <ul style={styles.mileList}>
                {m.tasks.map((t, j) => (
                  <li key={j} style={styles.mileTask}>
                    <span style={{ color: m.color, marginRight: 8 }}>·</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Decisions */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>🤔 Key Decisions You Need to Make</h4>
        {decisions.map((d, i) => (
          <div key={i} style={styles.decisionCard}>
            <h5 style={styles.decisionQ}>{d.question}</h5>
            <p style={styles.decisionContext}>{d.context}</p>
            <div style={styles.decisionRec}>
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>Our take: </span>{d.recommendation}
            </div>
          </div>
        ))}
      </div>

      {/* Success Metrics */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>📊 How You'll Know It's Working</h4>
        <div style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <div key={i} style={styles.metricCard}>
              <span style={styles.metricIcon}>{m.icon}</span>
              <div style={styles.metricLabel}>{m.label}</div>
              <div style={styles.metricValue}>{m.value}</div>
              <div style={styles.metricDesc}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GTM TAB ──────────────────────────────────────────────────
function GTMTab({ gtm, answers }) {
  const { channel, revenue, tractionScore } = gtm;

  const getColor = v => v >= 70 ? '#10b981' : v >= 40 ? '#f59e0b' : '#ef4444';
  const getLabel = v => v >= 70 ? 'Strong' : v >= 40 ? 'Moderate' : 'Needs Work';

  return (
    <div style={styles.tabInner}>
      <SectionTitle icon="🚀" title="Go-to-Market Strategy" subtitle="How you'll find your first customers and turn them into revenue." />

      {/* Traction probability */}
      <div style={styles.tractionCard}>
        <div>
          <h4 style={styles.tractionTitle}>Traction Probability</h4>
          <p style={styles.tractionSub}>Based on your distribution strategy and business model clarity</p>
        </div>
        <div style={styles.tractionScore}>
          <span style={{ ...styles.tractionNum, color: getColor(tractionScore) }}>{tractionScore}%</span>
          <span style={{ color: getColor(tractionScore), fontSize: 13, fontWeight: 700 }}>{getLabel(tractionScore)}</span>
        </div>
      </div>

      {/* First customer */}
      {answers.firstCustomer && (
        <div style={styles.section}>
          <h4 style={styles.sectionHeading}>🎯 Your First Customer</h4>
          <div style={styles.firstCustCard}>
            <p style={styles.firstCustText}>"{answers.firstCustomer}"</p>
            <div style={styles.firstCustTip}>
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>💡 Mentor says: </span>
              This is your most important relationship right now. Before building anything else, have a real conversation with this person. Don't pitch — ask questions. Listen. Build for what they tell you, not what you assume.
            </div>
          </div>
        </div>
      )}

      {/* Channel analysis */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>📣 Your Acquisition Channel Analysis</h4>
        <div style={styles.channelCard}>
          <div style={styles.channelRow}>
            <div style={styles.channelStat}>
              <span style={styles.channelStatLabel}>Strength</span>
              <span style={{ ...styles.channelStatVal, color: '#34d399' }}>{channel.strength}</span>
            </div>
            <div style={styles.channelStat}>
              <span style={styles.channelStatLabel}>Weakness</span>
              <span style={{ ...styles.channelStatVal, color: '#f87171' }}>{channel.weakness}</span>
            </div>
          </div>
          <div style={styles.channelTip}>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>Strategy tip: </span>{channel.tip}
          </div>
        </div>
      </div>

      {/* Revenue model */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>💸 Revenue Model Assessment</h4>
        <div style={styles.revCard}>
          <div style={styles.revViability}>
            <span style={styles.revLabel}>Viability</span>
            <span style={styles.revVal}>{revenue.viability}</span>
          </div>
          <div style={styles.revChallenge}>
            <span style={{ color: '#f87171', fontWeight: 700 }}>Challenge: </span>{revenue.challenge}
          </div>
          <div style={styles.revTip}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>💡 Tip: </span>{revenue.tip}
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div style={styles.pricingNote}>
        <span style={styles.pricingNoteIcon}>💬</span>
        <div>
          <div style={styles.pricingNoteTitle}>On pricing in Nigeria</div>
          <p style={styles.pricingNoteText}>Nigerians are price-sensitive but not cheap — they'll pay for things that clearly work and save them real time or money. Anchor your price against what they currently spend (time + money) to solve this problem manually. That's your true competition.</p>
        </div>
      </div>

      {/* North Star metric */}
      {answers.successMetric && (
        <div style={styles.section}>
          <h4 style={styles.sectionHeading}>⭐ Your North Star Metric</h4>
          <div style={styles.northStarCard}>
            <p style={styles.northStarText}>"{answers.successMetric}"</p>
            <p style={styles.northStarHint}>Track this weekly. Put it somewhere you see every day. Every decision should be filtered through: "Does this move this number?"</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOOLS TAB ────────────────────────────────────────────────
function ToolsTab({ answers }) {
  const [activeCategory, setActiveCategory] = useState('nocode');
  const cat = toolCategories.find(c => c.id === activeCategory);

  return (
    <div style={styles.tabInner}>
      <SectionTitle icon="🧰" title="Build Tools Guide" subtitle="No-code, low-code, and essential tools for the Nigerian startup stack." />

      {/* Decision matrix */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>🤔 Which tools should I use?</h4>
        <div style={styles.matrixGrid}>
          {decisionMatrix.map((d, i) => (
            <div key={i} style={styles.matrixCard}>
              <div style={styles.matrixScenario}>"{d.scenario}"</div>
              <div style={styles.matrixRec}>{d.recommendation}</div>
              <div style={styles.matrixChips}>
                {d.tools.map(t => <span key={t} style={styles.matrixChip}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div style={styles.section}>
        <h4 style={styles.sectionHeading}>🛠️ Tool Directory</h4>
        <div style={styles.catTabs}>
          {toolCategories.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              style={{
                ...styles.catTab,
                borderColor: activeCategory === c.id ? c.color : 'rgba(255,255,255,0.08)',
                color: activeCategory === c.id ? c.color : '#64748b',
                background: activeCategory === c.id ? `${c.color}12` : 'transparent',
              }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {cat && (
          <div style={styles.catContent} className="fade-in">
            <p style={styles.catDesc}>{cat.description}</p>
            <div style={styles.toolsList}>
              {cat.tools.map((tool, i) => (
                <div key={i} style={styles.toolCard}>
                  <div style={styles.toolHeader}>
                    <span style={styles.toolIcon}>{tool.icon}</span>
                    <div style={styles.toolMeta}>
                      <span style={styles.toolName}>{tool.name}</span>
                      <span style={styles.toolCategory}>{tool.category}</span>
                    </div>
                    <div style={styles.toolRating}>
                      {'★'.repeat(tool.rating)}{'☆'.repeat(5 - tool.rating)}
                    </div>
                  </div>
                  <div style={styles.toolBody}>
                    <div style={styles.toolRow}>
                      <span style={styles.toolRowLabel}>✅ Use for</span>
                      <span style={styles.toolRowVal}>{tool.useFor}</span>
                    </div>
                    <div style={styles.toolRow}>
                      <span style={styles.toolRowLabel}>❌ Not for</span>
                      <span style={styles.toolRowVal}>{tool.notFor}</span>
                    </div>
                    <div style={styles.toolRow}>
                      <span style={styles.toolRowLabel}>💰 Cost</span>
                      <span style={styles.toolRowVal}>{tool.cost}</span>
                    </div>
                    <div style={{ ...styles.toolRow, background: 'rgba(16,185,129,0.06)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <span style={{ ...styles.toolRowLabel, color: '#34d399' }}>🇳🇬 Nigeria note</span>
                      <span style={styles.toolRowVal}>{tool.nigeriaNote}</span>
                    </div>
                  </div>
                  <a href={tool.link} target="_blank" rel="noopener noreferrer" style={styles.toolLink}>
                    Visit {tool.name} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────
function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={styles.sectionTitle}>
      <span style={styles.sectionTitleIcon}>{icon}</span>
      <div>
        <h3 style={styles.sectionTitleText}>{title}</h3>
        <p style={styles.sectionTitleSub}>{subtitle}</p>
      </div>
    </div>
  );
}

const styles = {
  container: { position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  headerLeft: {},
  projectBadge: {
    fontSize: 12, fontWeight: 700, color: '#60a5fa',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: 800, color: '#f1f5f9' },
  headerActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  saveBtn: {
    padding: '10px 20px', borderRadius: 100,
    background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
    color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'Outfit', sans-serif",
  },
  newBtn: {
    padding: '10px 20px', borderRadius: 100,
    background: 'rgba(13,27,75,0.6)', border: '1px solid rgba(30,64,175,0.4)',
    color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  healthBar: {
    background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: '20px 24px', display: 'flex',
    alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap',
  },
  healthScore: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 },
  healthNum: { fontSize: 42, fontWeight: 800, lineHeight: 1 },
  healthLabel: { fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' },
  healthMeter: { flex: 1, minWidth: 200 },
  healthMeterBg: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  healthMeterFill: { height: '100%', borderRadius: 4, transition: 'width 1s ease' },
  healthVerdict: { fontSize: 16, fontWeight: 700 },
  healthRight: {},
  tabsWrapper: { marginBottom: 24, overflowX: 'auto' },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0, minWidth: 'max-content' },
  tab: {
    padding: '12px 18px', border: 'none', background: 'transparent',
    fontSize: 14, color: '#475569', cursor: 'pointer', borderRadius: '10px 10px 0 0',
    fontFamily: "'Outfit', sans-serif", fontWeight: 600, transition: 'all 0.2s',
    borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabActive: { color: '#60a5fa', borderBottomColor: '#3b82f6', background: 'rgba(59,130,246,0.06)' },
  tabContent: { minHeight: 400 },
  bottomNav: { marginTop: 40, textAlign: 'center' },
  bottomNavBtn: {},
  navHint: { fontSize: 13, color: '#334155', padding: '12px 0' },
  tabInner: {},

  // Section layout
  section: { marginTop: 32 },
  sectionTitle: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    marginBottom: 28, padding: '20px 24px',
    background: 'rgba(13,27,75,0.3)', borderRadius: 16,
    border: '1px solid rgba(30,64,175,0.2)',
  },
  sectionTitleIcon: { fontSize: 32, flexShrink: 0 },
  sectionTitleText: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 },
  sectionTitleSub: { fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  sectionHeading: {
    fontSize: 16, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
  },
  empty: { color: '#475569', fontSize: 14 },

  // Feasibility
  signalsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  signalCol: {},
  colTitle: { fontSize: 14, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  signalCard: {
    padding: '12px 14px', borderRadius: 10, border: '1px solid',
    fontSize: 14, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6,
  },
  comparablesGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  comparableCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '20px',
  },
  compHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  compName: { fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#f1f5f9' },
  compBadge: { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100 },
  compCountry: { fontSize: 13, color: '#475569', marginLeft: 'auto' },
  compWhy: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 10 },
  compLesson: { fontSize: 14, color: '#64748b', lineHeight: 1.6, background: 'rgba(59,130,246,0.06)', padding: '10px 14px', borderRadius: 10 },
  riskCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid',
    borderRadius: 14, padding: '18px', marginBottom: 12,
  },
  riskHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  riskLevel: { fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.05em' },
  riskCategory: { fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase' },
  riskTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 },
  riskDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 10 },
  riskAction: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, background: 'rgba(16,185,129,0.06)', padding: '10px 14px', borderRadius: 10 },

  // Methodology
  methodCard: {
    background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: '28px',
  },
  methodHeader: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' },
  methodEmoji: { fontSize: 40, flexShrink: 0 },
  methodName: { fontSize: 28, fontWeight: 800 },
  methodTagline: { color: '#64748b', fontSize: 15 },
  sprintBadge: { padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginLeft: 'auto' },
  methodExplanation: { fontSize: 15, color: '#94a3b8', lineHeight: 1.8, marginBottom: 24 },
  insightBox: {
    background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)',
    borderRadius: 14, padding: '18px', marginBottom: 24,
  },
  insightLabel: { fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  insightText: { fontSize: 15, color: '#94a3b8', lineHeight: 1.7 },
  methodGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  methodSubtitle: { fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  proItem: { fontSize: 14, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 },
  bestFor: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7 },
  toolChips: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  toolChip: { padding: '5px 12px', borderRadius: 100, border: '1px solid', fontSize: 12, fontWeight: 600 },
  stepItem: { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  stepNum: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 },
  stepText: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, paddingTop: 4 },

  // Action Plan
  mvpCard: {
    background: 'rgba(13,27,75,0.3)', border: '1px solid rgba(30,64,175,0.3)',
    borderRadius: 20, padding: '24px',
  },
  mvpHeader: { display: 'flex', gap: 16, marginBottom: 20 },
  mvpIcon: { fontSize: 36, flexShrink: 0 },
  mvpApproach: { fontSize: 20, fontWeight: 800, color: '#60a5fa', marginBottom: 4 },
  mvpDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  mvpScope: {},
  scopeTitle: { fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  scopeItem: { display: 'flex', gap: 10, fontSize: 14, color: '#94a3b8', marginBottom: 10, lineHeight: 1.6 },
  milestoneList: { display: 'flex', flexDirection: 'column', gap: 14 },
  milestoneCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderLeft: '3px solid',
    borderRadius: '0 14px 14px 0', padding: '18px 20px',
  },
  mileHeader: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
  mileIcon: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  mileWeek: { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 },
  mileTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0' },
  mileList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  mileTask: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start' },
  decisionCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '18px', marginBottom: 12,
  },
  decisionQ: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 },
  decisionContext: { fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 10 },
  decisionRec: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, background: 'rgba(37,99,235,0.06)', padding: '10px 14px', borderRadius: 10 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  metricCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '18px', textAlign: 'center',
  },
  metricIcon: { fontSize: 24, display: 'block', marginBottom: 8 },
  metricLabel: { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  metricValue: { fontSize: 15, fontWeight: 700, color: '#60a5fa', marginBottom: 6, lineHeight: 1.4 },
  metricDesc: { fontSize: 12, color: '#475569', lineHeight: 1.5 },

  // GTM
  tractionCard: {
    background: 'rgba(13,27,75,0.3)', border: '1px solid rgba(30,64,175,0.3)',
    borderRadius: 20, padding: '24px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
  },
  tractionTitle: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 },
  tractionSub: { fontSize: 14, color: '#64748b' },
  tractionScore: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  tractionNum: { fontSize: 48, fontWeight: 800, lineHeight: 1 },
  firstCustCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '20px',
  },
  firstCustText: { fontSize: 16, color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 14 },
  firstCustTip: { fontSize: 14, color: '#64748b', lineHeight: 1.7, background: 'rgba(37,99,235,0.06)', padding: '12px 16px', borderRadius: 10 },
  channelCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '20px',
  },
  channelRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 },
  channelStat: { display: 'flex', flexDirection: 'column', gap: 4 },
  channelStatLabel: { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  channelStatVal: { fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  channelTip: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7, background: 'rgba(37,99,235,0.06)', padding: '10px 14px', borderRadius: 10 },
  revCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
  },
  revViability: { display: 'flex', gap: 12, alignItems: 'center' },
  revLabel: { fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', width: 70 },
  revVal: { fontSize: 15, fontWeight: 600, color: '#34d399' },
  revChallenge: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7 },
  revTip: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7, background: 'rgba(16,185,129,0.06)', padding: '10px 14px', borderRadius: 10 },
  pricingNote: {
    display: 'flex', gap: 14, background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 18px',
    marginTop: 24,
  },
  pricingNoteIcon: { fontSize: 24, flexShrink: 0 },
  pricingNoteTitle: { fontWeight: 700, color: '#fcd34d', marginBottom: 6, fontSize: 15 },
  pricingNoteText: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7 },
  northStarCard: {
    background: 'rgba(13,27,75,0.4)', border: '1px solid rgba(30,64,175,0.3)',
    borderRadius: 14, padding: '20px',
  },
  northStarText: { fontSize: 17, color: '#60a5fa', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.6 },
  northStarHint: { fontSize: 14, color: '#475569', lineHeight: 1.7 },

  // Tools
  matrixGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  matrixCard: {
    background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '16px',
  },
  matrixScenario: { fontSize: 13, color: '#60a5fa', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.5 },
  matrixRec: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 },
  matrixChips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  matrixChip: { fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontWeight: 600 },
  catTabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  catTab: { padding: '8px 16px', borderRadius: 100, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s' },
  catContent: {},
  catDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 20, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 },
  toolsList: { display: 'flex', flexDirection: 'column', gap: 14 },
  toolCard: {
    background: 'rgba(10,10,20,0.7)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '20px',
  },
  toolHeader: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 },
  toolIcon: { fontSize: 28, flexShrink: 0 },
  toolMeta: { flex: 1 },
  toolName: { display: 'block', fontSize: 17, fontWeight: 700, color: '#e2e8f0' },
  toolCategory: { fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  toolRating: { color: '#f59e0b', fontSize: 14 },
  toolBody: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 },
  toolRow: { display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'start' },
  toolRowLabel: { fontSize: 12, fontWeight: 700, color: '#475569' },
  toolRowVal: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },
  toolLink: {
    display: 'inline-block', fontSize: 13, color: '#60a5fa',
    textDecoration: 'none', fontWeight: 600, padding: '8px 16px',
    background: 'rgba(37,99,235,0.1)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)',
  },
};
