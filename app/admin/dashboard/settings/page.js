'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
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

  async function uploadImage(e, key) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(key);
    const supabase = createClient();
    const fileName = `${key}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) { alert('Грешка при качување: ' + error.message); setUploading(''); return; }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    update(key, urlData.publicUrl);
    setUploading('');
  }

  async function saveAll() {
    setSaving(true);
    const supabase = createClient();
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    await fetch('/api/revalidate', { method: 'POST' });
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

      {/* СЛИКИ ПО СЕКЦИЈА */}
      <div className="admin-card">
        <div className="admin-card-title">Слики по секција</div>

        {[
          { key: 'hero_image_url', label: 'Hero позадинска слика' },
          { key: 'about_image_url', label: 'За нас — слика' },
          { key: 'logo_url', label: 'Лого' },
        ].map(({ key, label }) => (
          <div key={key} style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label">{label}</label>
            {settings[key] && (
              <div style={{ marginBottom: '0.5rem' }}>
                <img src={settings[key]} alt={label} style={{ height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)', padding: 4, background: 'var(--bg-soft)' }} />
              </div>
            )}
            <label style={{ background: 'var(--black)', color: 'var(--white)', padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: uploading === key ? 'not-allowed' : 'pointer', opacity: uploading === key ? 0.6 : 1, display: 'inline-block' }}>
              {uploading === key ? 'Се качува...' : '📁 Избери слика'}
              <input type="file" accept="image/*" onChange={(e) => uploadImage(e, key)} disabled={!!uploading} style={{ display: 'none' }} />
            </label>
            {settings[key] && (
              <input className="admin-input" value={settings[key]} onChange={(e) => update(key, e.target.value)} style={{ marginTop: '0.5rem', fontSize: '0.75rem' }} placeholder="или внеси URL рачно" />
            )}
          </div>
        ))}
      </div>

      {/* ГОЛЕМИНА НА СЛИКИ */}
      <div className="admin-card">
        <div className="admin-card-title">Големина на слики по секција</div>

        <label className="admin-label">Hero слика ({settings.img_size_hero || '100'}%)</label>
        <input type="range" min="30" max="160" step="5"
          value={settings.img_size_hero || '100'}
          onChange={(e) => update('img_size_hero', e.target.value)}
          style={{ width: '100%', accentColor: 'var(--green)', margin: '0.25rem 0 1rem' }}
        />

        <label className="admin-label">Featured производ ({settings.img_size_featured || '100'}%)</label>
        <input type="range" min="30" max="160" step="5"
          value={settings.img_size_featured || '100'}
          onChange={(e) => update('img_size_featured', e.target.value)}
          style={{ width: '100%', accentColor: 'var(--green)', margin: '0.25rem 0 1rem' }}
        />

        <label className="admin-label">За нас ({settings.img_size_about || '100'}%)</label>
        <input type="range" min="30" max="160" step="5"
          value={settings.img_size_about || '100'}
          onChange={(e) => update('img_size_about', e.target.value)}
          style={{ width: '100%', accentColor: 'var(--green)', margin: '0.25rem 0 0.5rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gray-light)' }}>
          <span>Мало (30%)</span><span>Нормално (100%)</span><span>Голема (160%)</span>
        </div>
      </div>

      {/* КОНТАКТ */}
      <div className="admin-card">
        <div className="admin-card-title">Контакт информации</div>
        <label className="admin-label">Телефон</label>
        <input className="admin-input" value={settings.phone || ''} onChange={(e) => update('phone', e.target.value)} />
        <label className="admin-label">Email</label>
        <input className="admin-input" value={settings.email || ''} onChange={(e) => update('email', e.target.value)} />
      </div>

      {/* СОЦИЈАЛНИ МРЕЖИ */}
      <div className="admin-card">
        <div className="admin-card-title">Социјални мрежи</div>
        <label className="admin-label">Instagram URL</label>
        <input className="admin-input" value={settings.instagram_url || ''} onChange={(e) => update('instagram_url', e.target.value)} />
        <label className="admin-label">Facebook URL</label>
        <input className="admin-input" value={settings.facebook_url || ''} onChange={(e) => update('facebook_url', e.target.value)} />
      </div>

      {/* ДОСТАВА */}
      <div className="admin-card">
        <div className="admin-card-title">Достава</div>
        <label className="admin-label">Цена за достава (ден)</label>
        <input className="admin-input" type="number" value={settings.shipping_cost || ''} onChange={(e) => update('shipping_cost', e.target.value)} />
      </div>

      {/* СЕКЦИИ */}
      <div className="admin-card">
        <div className="admin-card-title">Секции на страната</div>
        <div className="admin-toggle-row">
          <span style={{ fontSize: '0.875rem' }}>Прикажи &quot;Coming Soon&quot; секција</span>
          <button className={`admin-toggle ${settings.show_coming_soon !== 'false' ? 'on' : ''}`} onClick={() => update('show_coming_soon', settings.show_coming_soon !== 'false' ? 'false' : 'true')}>
            <span className="admin-toggle-dot"></span>
          </button>
        </div>
        <div className="admin-toggle-row">
          <span style={{ fontSize: '0.875rem' }}>Прикажи &quot;За кого е&quot; секција</span>
          <button className={`admin-toggle ${settings.show_audience !== 'false' ? 'on' : ''}`} onClick={() => update('show_audience', settings.show_audience !== 'false' ? 'false' : 'true')}>
            <span className="admin-toggle-dot"></span>
          </button>
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  );
}
