'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('settings').select('*');
      const map = {};
      (data || []).forEach((row) => { map[row.key] = row.value; });
      setSettings(map);
      setLoading(false);
    }
    load();
  }, []);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    const supabase = createClient();
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    setToast('Поставките се зачувани!');
    setTimeout(() => setToast(''), 2500);
  }

  if (loading) return <div className="admin-empty">Се вчитува...</div>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Поставки</h1>
        <button className="admin-btn" onClick={saveAll} disabled={saving}>
          {saving ? 'Се зачувува...' : 'Зачувај сè'}
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Контакт информации</div>
        <label className="admin-label">Телефон</label>
        <input className="admin-input" value={settings.phone || ''} onChange={(e) => update('phone', e.target.value)} />
        <label className="admin-label">Email</label>
        <input className="admin-input" value={settings.email || ''} onChange={(e) => update('email', e.target.value)} />
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Социјални мрежи</div>
        <label className="admin-label">Instagram URL</label>
        <input className="admin-input" value={settings.instagram_url || ''} onChange={(e) => update('instagram_url', e.target.value)} />
        <label className="admin-label">Facebook URL</label>
        <input className="admin-input" value={settings.facebook_url || ''} onChange={(e) => update('facebook_url', e.target.value)} />
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Достава</div>
        <label className="admin-label">Цена за достава (ден)</label>
        <input className="admin-input" type="number" value={settings.shipping_cost || ''} onChange={(e) => update('shipping_cost', e.target.value)} />
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Секции на страната</div>
        <div className="admin-toggle-row">
          <span style={{ fontSize: '0.875rem' }}>Прикажи &quot;Coming Soon&quot; секција</span>
          <button className={`admin-toggle ${settings.show_coming_soon !== 'false' ? 'on' : ''}`} onClick={() => update('show_coming_soon', settings.show_coming_soon !== 'false' ? 'false' : 'true')}>
            <span className="admin-toggle-dot"></span>
          </button>
        </div>
        <div className="admin-toggle-row">
          <span style={{ fontSize: '0.875rem' }}>Прикажи &quot;Target Audience&quot; секција</span>
          <button className={`admin-toggle ${settings.show_audience !== 'false' ? 'on' : ''}`} onClick={() => update('show_audience', settings.show_audience !== 'false' ? 'false' : 'true')}>
            <span className="admin-toggle-dot"></span>
          </button>
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  );
}
