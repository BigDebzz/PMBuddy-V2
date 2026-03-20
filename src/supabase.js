// src/lib/supabase.js
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values from supabase.com
// Instructions: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;
  
  // Dynamic import to avoid crashing if keys aren't set
  try {
    const { createClient } = require('@supabase/supabase-js');
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch(e) {
    console.warn('Supabase not configured:', e.message);
  }
  return supabase;
}

export const isSupabaseConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Save project to Supabase
export async function saveProject(projectData) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  
  const payload = {
    project_name: projectData.answers?.projectName || 'Untitled Project',
    answers: projectData.answers || {},
    results: projectData.results || {},
    updated_at: new Date().toISOString(),
  };

  if (projectData.id) {
    const { data, error } = await sb
      .from('projects')
      .update(payload)
      .eq('id', projectData.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await sb
      .from('projects')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// Load all projects
export async function loadProjects() {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Load single project
export async function loadProject(id) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Delete project
export async function deleteProject(id) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  const { error } = await sb.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// SQL to create the table (run in Supabase SQL Editor):
/*
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON projects FOR ALL USING (true);
*/
