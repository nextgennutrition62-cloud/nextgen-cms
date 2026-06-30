'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const SECTIONS = [
  { section: 'hero', title: 'Hero секција', fields: [
    { key: 'eyebrow', label: 'Мал текст над насловот', type: 'input' },
    { key: 'title', label: 'Главен наслов', type: 'textarea' },
    { key: 'subtitle', label: 'Поднаслов', type: 'textarea' },
  ]},
  { section: 'about', title: 'За нас', fields: [
    { key: 'title', label: 'Наслов', type: 'input' },
    { key: 'text', label: 'Текст', type: 'textarea' },
  ]},
  { section: 'philosophy', title: 'Филозофија (темна секција)', fields: [
    { key: 'title', label: 'Наслов', type: 'input' },
    { key: 'text', label: 'Текст', type: 'textarea' },
  ]},
  { section: 'mission', title: 'Мисија (full-width)', fields: [
    { key: 'text', label: 'Текст', type: 'textarea' },
  ]},
];

export default function ContentPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('content').select('*');
      const grouped = {};
      (data || []).forEach((row) => {
        grouped[`${row.section}.${row.key}`] = row.value;
      });
      setValues(grouped);
      setLoading(false);
    }
    load();
  }, []);

  function update(section, key, val) {
    setValues((prev) => ({ ...prev, [`${section}.${key}`]: val }));
  }

  async function saveAll() {
    setSaving(true);
    const supabase = createClient();
    const rows = [];
    SECTIONS.forEach((s) => {
      s.fields.forEach((f) => {
        rows.push({ section: s.section, key: f.key, value: values[`${s.section}.${f.key}`] || '' });
      });
    });
    for (const row of rows) {
      await supabase.from('content').upsert(row, { onConflict: 'section,key' });
    }
    setSaving(false);
    setToast('Содржината е зачувана!');
    setTimeout(() => setToast(''), 2500);
  }

  if (loading) return <div className="admin-empty">Се вчитува...</div>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Содржина</h1>
        <button className="admin-btn" onClick={saveAll} disabled={saving}>
          {saving ? 'Се зачувува...' : 'Зачувај сè'}
        </button>
      </div>

      {SECTIONS.map((s) => (
        <div className="admin-card" key={s.section}>
          <div className="admin-card-title">{s.title}</div>
          {s.fields.map((f) => (
            <div key={f.key}>
              <label className="admin-label">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  className="admin-textarea"
                  value={values[`${s.section}.${f.key}`] || ''}
                  onChange={(e) => update(s.section, f.key, e.target.value)}
                />
              ) : (
                <input
                  className="admin-input"
                  value={values[`${s.section}.${f.key}`] || ''}
                  onChange={(e) => update(s.section, f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  );
}
