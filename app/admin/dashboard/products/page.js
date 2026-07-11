'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const emptyProduct = {
  name: 'CLEANPRO Whey',
  flavor: '',
  description: '',
  price: 2490,
  image_url: '',
  protein_g: 30,
  sugar_g: 0,
  servings: 33,
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = затворено, {} = ново, {...} = уредување
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').order('sort_order');
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) {
      alert('Грешка при качување слика: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setEditing((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  }

  async function saveProduct() {
    const supabase = createClient();
    if (editing.id) {
      await supabase.from('products').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(editing);
    }
    await fetch('/api/revalidate', { method: 'POST' });
    setEditing(null);
    setToast('Производот е зачуван!');
    setTimeout(() => setToast(''), 2500);
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm('Дали си сигурен дека сакаш да го избришеш овој производ?')) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  async function toggleActive(product) {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    loadProducts();
  }

  if (loading) return <div className="admin-empty">Се вчитува...</div>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Производи</h1>
        <button className="admin-btn" onClick={() => setEditing({ ...emptyProduct })}>+ Нов производ</button>
      </div>

      {!editing && (
        <div className="admin-card">
          {products.length === 0 && <div className="admin-empty">Сè уште нема производи.</div>}
          {products.map((p) => (
            <div className="admin-product-card" key={p.id}>
              <div className="admin-product-img">
                {p.image_url && <img src={p.image_url} alt={p.flavor} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.name} — {p.flavor}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{p.price.toLocaleString('mk-MK')} ден · {p.protein_g}g протеин {p.is_featured ? '· ⭐ Featured' : ''}</div>
              </div>
              <button className="admin-toggle-row" style={{ border: 'none', background: 'none', padding: 0 }}>
                <button className={`admin-toggle ${p.is_active ? 'on' : ''}`} onClick={() => toggleActive(p)}>
                  <span className="admin-toggle-dot"></span>
                </button>
              </button>
              <button className="admin-btn-ghost admin-btn" onClick={() => setEditing(p)}>Уреди</button>
              <button className="admin-btn-danger admin-btn" onClick={() => deleteProduct(p.id)}>Избриши</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="admin-card">
          <div className="admin-card-title">{editing.id ? 'Уреди производ' : 'Нов производ'}</div>

          <label className="admin-label">Слика на производот</label>
          <div className="admin-img-preview">
            {editing.image_url ? <img src={editing.image_url} alt="" /> : <span style={{ color: 'var(--gray-light)', fontSize: '0.8rem' }}>Нема слика</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <label style={{ background: 'var(--black)', color: 'var(--white)', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Се качува...' : '📁 Избери слика'}
              <input
                key={editing.id || 'new'}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {editing.image_url && (
              <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>✓ Сликата е поставена</span>
            )}
          </div>

          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Ime на производ</label>
              <input className="admin-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Вкус</label>
              <input className="admin-input" value={editing.flavor} onChange={(e) => setEditing({ ...editing, flavor: e.target.value })} />
            </div>
          </div>

          <label className="admin-label">Опис</label>
          <textarea className="admin-textarea" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />

          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Редовна цена (ден)</label>
              <input className="admin-input" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Акциска цена (ден) — остави празно ако нема акција</label>
              <input className="admin-input" type="number" value={editing.sale_price || ''} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value ? Number(e.target.value) : null })} placeholder="пр. 3590" />
            </div>
          </div>

          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Број на оброци</label>
              <input className="admin-input" type="number" value={editing.servings} onChange={(e) => setEditing({ ...editing, servings: Number(e.target.value) })} />
            </div>
            <div></div>
          </div>

          <div className="admin-grid-2">
            <div>
              <label className="admin-label">Протеин (g)</label>
              <input className="admin-input" type="number" value={editing.protein_g} onChange={(e) => setEditing({ ...editing, protein_g: Number(e.target.value) })} />
            </div>
            <div>
              <label className="admin-label">Шеќер (g)</label>
              <input className="admin-input" type="number" value={editing.sugar_g} onChange={(e) => setEditing({ ...editing, sugar_g: Number(e.target.value) })} />
            </div>
          </div>

          <div className="admin-toggle-row">
            <span style={{ fontSize: '0.875rem' }}>Главен производ (Featured)</span>
            <button className={`admin-toggle ${editing.is_featured ? 'on' : ''}`} onClick={() => setEditing({ ...editing, is_featured: !editing.is_featured })}>
              <span className="admin-toggle-dot"></span>
            </button>
          </div>
          <div className="admin-toggle-row">
            <span style={{ fontSize: '0.875rem' }}>Активен (видлив на страната)</span>
            <button className={`admin-toggle ${editing.is_active ? 'on' : ''}`} onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}>
              <span className="admin-toggle-dot"></span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="admin-btn" onClick={saveProduct}>Зачувај</button>
            <button className="admin-btn-ghost admin-btn" onClick={() => setEditing(null)}>Откажи</button>
          </div>
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  );
}
