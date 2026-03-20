import React, { useState, useEffect } from 'react';
import { loadProjects, deleteProject, isSupabaseConfigured } from '../lib/supabase';

export default function SavedProjects({ onLoad, onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    loadProjects()
      .then(data => { setProjects(data || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProject(id);
      setProjects(p => p.filter(x => x.id !== id));
    } catch (e) { alert('Could not delete project: ' + e.message); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 style={styles.title}>Saved Projects</h2>
      </div>

      {!isSupabaseConfigured() && (
        <div style={styles.notice}>
          <span style={styles.noticeIcon}>ℹ️</span>
          <div>
            <div style={styles.noticeTitle}>Supabase not configured yet</div>
            <p style={styles.noticeText}>To save and load projects, you need to connect Supabase. See the README for setup instructions. It takes about 10 minutes and is completely free.</p>
          </div>
        </div>
      )}

      {loading && <p style={styles.loading}>Loading your projects...</p>}
      {error && <p style={styles.errorText}>Error: {error}</p>}
      {!loading && projects.length === 0 && isSupabaseConfigured() && (
        <p style={styles.empty}>No saved projects yet. Complete the validation flow to save your first project.</p>
      )}

      <div style={styles.list}>
        {projects.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardName}>{p.project_name}</span>
              <span style={styles.cardDate}>{new Date(p.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            {p.answers?.problemStatement && (
              <p style={styles.cardPreview}>{p.answers.problemStatement.slice(0, 120)}...</p>
            )}
            <div style={styles.cardActions}>
              <button style={styles.loadBtn} onClick={() => onLoad(p)}>Load & Continue →</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(p.id, p.project_name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 680, margin: '0 auto', padding: '32px 16px', position: 'relative', zIndex: 1 },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 },
  backBtn: {
    padding: '8px 16px', borderRadius: 100,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9' },
  notice: {
    display: 'flex', gap: 14, background: 'rgba(37,99,235,0.08)',
    border: '1px solid rgba(37,99,235,0.2)', borderRadius: 16, padding: '18px',
    marginBottom: 24,
  },
  noticeIcon: { fontSize: 24, flexShrink: 0 },
  noticeTitle: { fontWeight: 700, color: '#60a5fa', marginBottom: 6 },
  noticeText: { fontSize: 14, color: '#64748b', lineHeight: 1.7 },
  loading: { color: '#475569', fontSize: 15 },
  errorText: { color: '#f87171', fontSize: 14 },
  empty: { color: '#475569', fontSize: 15, lineHeight: 1.7 },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: {
    background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '20px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardName: { fontSize: 18, fontWeight: 700, color: '#f1f5f9' },
  cardDate: { fontSize: 12, color: '#475569' },
  cardPreview: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 },
  cardActions: { display: 'flex', gap: 10 },
  loadBtn: {
    padding: '10px 20px', borderRadius: 100,
    background: 'linear-gradient(135deg, #0d1b4b, #2563eb)',
    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  deleteBtn: {
    padding: '10px 16px', borderRadius: 100,
    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
};
