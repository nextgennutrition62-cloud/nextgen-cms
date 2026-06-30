'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase-client';

const STATUS_LABELS = {
  new: 'Нова',
  confirmed: 'Потврдена',
  shipped: 'Испратена',
  delivered: 'Доставена',
  cancelled: 'Откажана',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  async function loadOrders() {
    const supabase = createClient();
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, status) {
    const supabase = createClient();
    await supabase.from('orders').update({ status }).eq('id', id);
    loadOrders();
  }

  if (loading) return <div className="admin-empty">Се вчитува...</div>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Нарачки</h1>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <div className="admin-empty">Сè уште нема нарачки.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Купувач</th>
                <th>Контакт</th>
                <th>Вкупно</th>
                <th>Статус</th>
                <th>Датум</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td>{o.first_name} {o.last_name}</td>
                    <td>{o.phone}</td>
                    <td>{Number(o.total).toLocaleString('mk-MK')} ден</td>
                    <td><span className={`admin-badge ${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString('mk-MK')}</td>
                    <td>{expanded === o.id ? '▲' : '▼'}</td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={6} style={{ background: 'var(--bg-soft)', padding: '1.25rem' }}>
                        <div className="admin-grid-2">
                          <div>
                            <p style={{ fontSize: '0.82rem', marginBottom: '0.4rem' }}><strong>Email:</strong> {o.email}</p>
                            <p style={{ fontSize: '0.82rem', marginBottom: '0.4rem' }}><strong>Адреса:</strong> {o.address}</p>
                            <p style={{ fontSize: '0.82rem', marginBottom: '0.4rem' }}><strong>Производи:</strong></p>
                            <ul style={{ fontSize: '0.82rem', paddingLeft: '1.25rem' }}>
                              {(o.items || []).map((item, idx) => (
                                <li key={idx}>{item.name} × {item.qty} — {Number(item.price * item.qty).toLocaleString('mk-MK')} ден</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <label className="admin-label">Смени статус</label>
                            <select className="admin-select" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
