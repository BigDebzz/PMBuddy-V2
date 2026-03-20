import React, { useState, useEffect } from 'react';
import StarField from './StarField';

const words = ['entrepreneurs', 'hackathon teams', 'freelancers', 'small businesses', 'change-makers'];

export default function LandingScreen({ onStart, onLoadProject, hasSaved }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % words.length); setVisible(true); }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const features = [
    { icon: '🔍', label: 'Product Discovery', desc: 'Guided questions that feel like a conversation' },
    { icon: '⚡', label: 'Feasibility Check', desc: 'Honest assessment with real African startup examples' },
    { icon: '🧭', label: 'Custom Methodology', desc: 'Agile, Scrum, or Kanban — explained for your context' },
    { icon: '🗺️', label: '90-Day Roadmap', desc: 'Auto-generated action plan with milestones' },
    { icon: '🚀', label: 'Go-to-Market Plan', desc: 'First customer, channel, and traction strategy' },
    { icon: '💾', label: 'Save & Iterate', desc: 'Come back and refine your thinking over time' },
  ];

  return (
    <div style={styles.container}>
      <StarField count={100} />

      <div style={styles.content}>
        {/* Badge */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Free Tool — No Sign-Up to Start
        </div>

        {/* Headline */}
        <h1 style={styles.headline}>
          Built for{' '}
          <span style={{
            ...styles.rotating,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}>
            {words[wordIdx]}
          </span>
          <br />
          <span className="gradient-text">in emerging markets.</span>
        </h1>

        <p style={styles.sub}>
          Answer smart questions about your idea. Get a real validation report,
          methodology recommendation, and 90-day action plan — tailored for Nigeria
          and emerging markets.
        </p>

        {/* CTA Buttons */}
        <div style={styles.ctaRow}>
          <button style={styles.primaryBtn} onClick={onStart}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(37,99,235,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.3)'; }}>
            Validate My Idea →
          </button>
          {hasSaved && (
            <button style={styles.secondaryBtn} onClick={onLoadProject}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
              💾 Load Saved Project
            </button>
          )}
        </div>

        <p style={styles.timeEstimate}>⏱️ Takes 5–8 minutes · No jargon · No fluff</p>

        {/* Feature Grid */}
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={f.label} style={{ ...styles.featureCard, animationDelay: `${i * 0.1}s` }}
              className="fade-up"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; e.currentTarget.style.background = 'rgba(13,27,75,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(30,64,175,0.25)'; e.currentTarget.style.background = 'rgba(13,27,75,0.2)'; }}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureLabel}>{f.label}</span>
              <span style={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={styles.proof}>
          <span style={styles.proofText}>Designed for the realities of building in Nigeria 🇳🇬 and across Africa 🌍</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', padding: '40px 24px',
  },
  content: {
    position: 'relative', zIndex: 1, maxWidth: 860,
    width: '100%', textAlign: 'center',
    animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#34d399', fontSize: 12, fontWeight: 600, padding: '6px 16px',
    borderRadius: 100, letterSpacing: '0.05em', marginBottom: 32,
    textTransform: 'uppercase',
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: '50%', background: '#34d399',
    animation: 'breathe 2s ease-in-out infinite',
  },
  headline: {
    fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800,
    lineHeight: 1.1, marginBottom: 24, color: '#f8fafc',
    fontFamily: "'Outfit', sans-serif",
  },
  rotating: {
    display: 'inline-block', color: '#60a5fa',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  sub: {
    fontSize: 'clamp(15px, 2.5vw, 19px)', color: '#94a3b8',
    lineHeight: 1.8, marginBottom: 40, maxWidth: 640, margin: '0 auto 40px',
  },
  ctaRow: {
    display: 'flex', gap: 14, justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: 16,
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff', border: 'none', padding: '16px 40px',
    borderRadius: 100, fontSize: 17, fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 24px rgba(37,99,235,0.3)',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    background: 'transparent', color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '16px 32px', borderRadius: 100, fontSize: 15,
    fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s ease',
  },
  timeEstimate: { fontSize: 13, color: '#475569', marginBottom: 56 },
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14, maxWidth: 820, margin: '0 auto 40px',
  },
  featureCard: {
    background: 'rgba(13,27,75,0.2)', border: '1px solid rgba(30,64,175,0.25)',
    borderRadius: 16, padding: '20px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    transition: 'all 0.2s ease', cursor: 'default',
    opacity: 0,
  },
  featureIcon: { fontSize: 28 },
  featureLabel: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14,
    color: '#e2e8f0',
  },
  featureDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.5, textAlign: 'center' },
  proof: {
    padding: '16px 24px', background: 'rgba(13,27,75,0.3)',
    border: '1px solid rgba(30,64,175,0.2)', borderRadius: 12,
    display: 'inline-block',
  },
  proofText: { fontSize: 14, color: '#64748b' },
};
