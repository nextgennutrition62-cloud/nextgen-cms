import { createServerSupabase } from './supabase-server';

// Претвора [{section,key,value}] во { hero: { title: '...', subtitle: '...' }, about: {...} }
export async function getAllContent() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('content').select('*');
  if (error || !data) return {};
  const grouped = {};
  for (const row of data) {
    if (!grouped[row.section]) grouped[row.section] = {};
    grouped[row.section][row.key] = row.value;
  }
  return grouped;
}

export async function getAllSettings() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('settings').select('*');
  if (error || !data) return {};
  const settings = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function getActiveProducts() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data;
}
