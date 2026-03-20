import React, { useState, useRef, useEffect } from 'react';
import { questions, stages, totalQuestions } from '../data/questions';

export default function DiscoveryWizard({ onComplete, initialAnswers = {} }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef(null);

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / totalQuestions) * 100;
  const stage = stages.find(s => s.id === q.stage);
  const stageQs = questions.filter(x => x.stage === q.stage);
  const stageProgress = stageQs.indexOf(q) + 1;

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [currentIdx]);

  const handleChange = (val) => { setAnswers(p => ({ ...p, [q.id]: val })); setError(''); };

  const go = (dir) => {
    if (dir === 1 && q.required && !answers[q.id]) {
      setError('Please answer this before continuing.');
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      if (dir === 1 && currentIdx === questions.length - 1) {
        onComplete(answers);
      } else {
        setCurrentIdx(i => i + dir);
        setError('');
        setTransitioning(false);
      }
    }, 250);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && q.type !== 'textarea' && q.type !== 'select') go(1);
  };

  // Determine stage color
  const stageColor = stage?.color || '#3b82f6';
  const stageNumber = stages.findIndex(s => s.id === q.stage) + 1;

  return (
    <div style={styles.container}>
      {/* Stage strip at top */}
      <div style={styles.stageStrip}>
        {stages.map((s, i) => {
          const isActive = s.id === q.stage;
          const isPast = stages.findIndex(x => x.id === q.stage) > i;
          return (
            <div key={s.id} style={{ ...styles.stageItem, opacity: isPast ? 0.5 : isActive ? 1 : 0.3 }}>
              <div style={{
                ...styles.stageDot,
                background: isActive ? s.color : isPast ? '#334155' : 'transparent',
                border: `2px solid ${isPast ? '#334155' : isActive ? s.color : '#1e293b'}`,
                boxShadow: isActive ? `0 0 12px ${s.color}60` : 'none',
              }}>
                {isPast ? '✓' : s.icon}
              </div>
              <span style={{ ...styles.stageLabel, color: isActive ? s.color : '#475569' }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={styles.progressOuter}>
        <div style={{ ...styles.progressInner, width: `${progress}%`, background: `linear-gradient(90deg, #1e40af, ${stageColor})` }} />
      </div>

      {/* Question counter */}
      <div style={styles.counter}>
        <span style={{ color: stageColor, fontWeight: 700 }}>Stage {stageNumber}: {stage?.label}</span>
        <span style={{ color: '#475569' }}>Question {currentIdx + 1} of {totalQuestions}</span>
      </div>

      {/* Main card */}
      <div style={{
        ...styles.card,
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        borderTop: `2px solid ${stageColor}40`,
      }}>
        {/* Emoji + question */}
        <div style={styles.questionHeader}>
          <span style={styles.qEmoji}>{q.emoji}</span>
          <div style={styles.questionMeta}>
            <div style={styles.stageTag}>
              <span style={{ color: stageColor }}>●</span> {stage?.tagline}
            </div>
          </div>
          {/* Tooltip trigger */}
          <button
            style={styles.helpBtn}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(p => !p)}
            aria-label="What does this mean?"
          >
            ?
          </button>
        </div>

        {/* Tooltip popup */}
        {showTooltip && (
          <div style={styles.tooltipBox}>
            <div style={styles.tooltipHeader}>💡 Why we ask this</div>
            <p style={styles.tooltipText}>{q.tooltip}</p>
          </div>
        )}

        <h2 style={styles.questionText}>{q.question}</h2>
        <p style={styles.subtext}>{q.subtext}</p>

        {/* Hint bubble */}
        {q.hint && (
          <div style={styles.hintBubble}>
            <span style={styles.hintIcon}>{q.hint.icon}</span>
            <span style={styles.hintText}>{q.hint.text}</span>
          </div>
        )}

        {/* Input area */}
        <div style={styles.inputArea}>
          {q.type === 'text' && (
            <input
              ref={inputRef}
              style={styles.textInput}
              type="text"
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleKey}
              onFocus={e => e.target.style.borderColor = stageColor}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          )}
          {q.type === 'textarea' && (
            <textarea
              ref={inputRef}
              style={{ ...styles.textInput, minHeight: 140, resize: 'vertical', lineHeight: 1.7 }}
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={e => handleChange(e.target.value)}
              onFocus={e => e.target.style.borderColor = stageColor}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          )}
          {q.type === 'select' && (
            <div style={styles.optionGrid}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    style={{
                      ...styles.optionBtn,
                      borderColor: selected ? stageColor : 'rgba(255,255,255,0.08)',
                      background: selected ? `${stageColor}18` : 'rgba(255,255,255,0.02)',
                      boxShadow: selected ? `0 0 20px ${stageColor}25` : 'none',
                    }}
                    onClick={() => { handleChange(opt.value); setTimeout(() => go(1), 300); }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${stageColor}60`; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <div style={styles.optionLeft}>
                      <span style={styles.optionLabel}>{opt.label}</span>
                      {opt.desc && <span style={styles.optionDesc}>{opt.desc}</span>}
                    </div>
                    <span style={{
                      ...styles.optionCheck,
                      background: selected ? stageColor : 'transparent',
                      border: `2px solid ${selected ? stageColor : '#334155'}`,
                    }}>
                      {selected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {q.type === 'date' && (
            <input ref={inputRef} style={styles.textInput} type="date"
              value={answers[q.id] || ''}
              onChange={e => handleChange(e.target.value)} />
          )}
        </div>

        {error && <p style={styles.errorText}>⚠️ {error}</p>}

        {/* Navigation */}
        {q.type !== 'select' && (
          <div style={styles.navRow}>
            <button style={styles.backBtn} onClick={() => go(-1)} disabled={currentIdx === 0}>
              ← Back
            </button>
            <button
              style={{ ...styles.nextBtn, background: `linear-gradient(135deg, #0d1b4b, ${stageColor})` }}
              onClick={() => go(1)}
            >
              {currentIdx === questions.length - 1 ? '🚀 Generate My Report' : 'Continue →'}
            </button>
          </div>
        )}

        {/* Skip */}
        {!q.required && (
          <p style={styles.skipText} onClick={() => go(1)}>
            Skip this question →
          </p>
        )}
      </div>

      {/* Stage description */}
      <div style={styles.stageHint}>
        <span style={{ color: stageColor }}>{stage?.icon}</span>{' '}
        <span style={styles.stageHintText}>{stage?.description}</span>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 680, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 },
  stageStrip: {
    display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)',
    marginBottom: 24, flexWrap: 'wrap',
  },
  stageItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'opacity 0.3s' },
  stageDot: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, transition: 'all 0.3s',
  },
  stageLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.3s' },
  progressOuter: { height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' },
  progressInner: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  counter: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 20 },
  card: {
    background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24,
    padding: 'clamp(24px, 5vw, 40px)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
  },
  questionHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  qEmoji: { fontSize: 32, flexShrink: 0, lineHeight: 1 },
  questionMeta: { flex: 1 },
  stageTag: { fontSize: 12, color: '#475569', fontWeight: 600, letterSpacing: '0.04em' },
  helpBtn: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#64748b', fontSize: 13, fontWeight: 700, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  tooltipBox: {
    background: 'rgba(13,27,75,0.95)', border: '1px solid rgba(30,64,175,0.4)',
    borderRadius: 14, padding: '16px 18px', marginBottom: 16,
    boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.2s ease',
  },
  tooltipHeader: { fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  tooltipText: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7 },
  questionText: {
    fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 700,
    color: '#f1f5f9', marginBottom: 10, lineHeight: 1.3,
  },
  subtext: { fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 24 },
  hintBubble: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
    borderRadius: 10, padding: '10px 14px', marginBottom: 20,
  },
  hintIcon: { fontSize: 16, flexShrink: 0 },
  hintText: { fontSize: 13, color: '#64748b', lineHeight: 1.6 },
  inputArea: { marginBottom: 8 },
  textInput: {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, fontSize: 15, color: '#f1f5f9',
    transition: 'border-color 0.2s ease',
    fontFamily: "'Outfit', sans-serif",
  },
  optionGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  optionBtn: {
    width: '100%', padding: '14px 18px',
    border: '1px solid', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.15s ease', textAlign: 'left', cursor: 'pointer',
  },
  optionLeft: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1 },
  optionLabel: { fontSize: 15, color: '#e2e8f0', fontWeight: 500 },
  optionDesc: { fontSize: 12, color: '#475569' },
  optionCheck: {
    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#fff', fontWeight: 700, transition: 'all 0.15s',
  },
  errorText: { fontSize: 13, color: '#f87171', marginTop: 8, marginBottom: 0 },
  navRow: { display: 'flex', gap: 12, marginTop: 24 },
  backBtn: {
    padding: '13px 24px', borderRadius: 100,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748b', fontSize: 14, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
    opacity: 1,
  },
  nextBtn: {
    flex: 1, padding: '13px 24px', borderRadius: 100, border: 'none',
    color: '#fff', fontSize: 15, fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s ease',
  },
  skipText: {
    textAlign: 'center', fontSize: 13, color: '#475569',
    marginTop: 16, cursor: 'pointer', transition: 'color 0.2s',
  },
  stageHint: {
    textAlign: 'center', marginTop: 20, fontSize: 13,
    color: '#334155',
  },
  stageHintText: { color: '#475569' },
};
