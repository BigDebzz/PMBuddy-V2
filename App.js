import React, { useState } from 'react';
import StarField from './components/StarField';
import LandingScreen from './components/LandingScreen';
import DiscoveryWizard from './components/DiscoveryWizard';
import ResultsDashboard from './components/ResultsDashboard';
import SavedProjects from './components/SavedProjects';

const SCREENS = {
  LANDING: 'landing',
  DISCOVERY: 'discovery',
  RESULTS: 'results',
  SAVED: 'saved',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [answers, setAnswers] = useState({});
  const [savedProjectId, setSavedProjectId] = useState(null);

  const handleStart = () => { setAnswers({}); setSavedProjectId(null); setScreen(SCREENS.DISCOVERY); };
  const handleComplete = (a) => { setAnswers(a); setScreen(SCREENS.RESULTS); };
  const handleReset = () => { if (window.confirm('Start a new project? Your current session will be cleared.')) { setAnswers({}); setSavedProjectId(null); setScreen(SCREENS.LANDING); } };
  const handleLoadProject = (project) => { setAnswers(project.answers || {}); setSavedProjectId(project.id); setScreen(SCREENS.RESULTS); };

  return (
    <div style={styles.app}>
      <StarField count={120} />

      {/* Navigation header */}
      <header style={styles.header}>
        <button style={styles.logo} onClick={() => setScreen(SCREENS.LANDING)}>
          <span style={styles.logoGem}>◆</span>
          <span style={styles.logoText}>ValidatePro</span>
        </button>
        <div style={styles.headerRight}>
          {screen === SCREENS.RESULTS && (
            <button style={styles.headerBtn} onClick={() => setScreen(SCREENS.DISCOVERY)}>
              ← Edit Answers
            </button>
          )}
          {screen !== SCREENS.SAVED && (
            <button style={styles.headerBtn} onClick={() => setScreen(SCREENS.SAVED)}>
              💾 Saved Projects
            </button>
          )}
          {screen !== SCREENS.LANDING && screen !== SCREENS.SAVED && (
            <button style={{ ...styles.headerBtn, color: '#64748b' }} onClick={handleReset}>
              + New Project
            </button>
          )}
        </div>
      </header>

      {/* Screen content */}
      <main style={styles.main}>
        {screen === SCREENS.LANDING && (
          <LandingScreen
            onStart={handleStart}
            onLoadProject={() => setScreen(SCREENS.SAVED)}
            hasSaved={true}
          />
        )}
        {screen === SCREENS.DISCOVERY && (
          <DiscoveryWizard
            onComplete={handleComplete}
            initialAnswers={answers}
          />
        )}
        {screen === SCREENS.RESULTS && (
          <ResultsDashboard
            answers={answers}
            savedId={savedProjectId}
            onReset={handleReset}
          />
        )}
        {screen === SCREENS.SAVED && (
          <SavedProjects
            onLoad={handleLoadProject}
            onBack={() => setScreen(SCREENS.LANDING)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>ValidatePro · Built for African Entrepreneurs 🌍</span>
        <span style={{ color: '#1e293b' }}>·</span>
        <span>Free forever</span>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh', background: '#000',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 clamp(16px, 4vw, 40px)', height: 60,
    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0,
  },
  logoGem: {
    fontSize: 18, color: '#3b82f6',
    filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 800,
    fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.02em',
  },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  headerBtn: {
    padding: '7px 16px', borderRadius: 100,
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    paddingBottom: 60,
  },
  footer: {
    padding: '16px 24px', textAlign: 'center',
    fontSize: 13, color: '#1e293b',
    display: 'flex', justifyContent: 'center', gap: 12,
    borderTop: '1px solid rgba(255,255,255,0.03)',
  },
};
