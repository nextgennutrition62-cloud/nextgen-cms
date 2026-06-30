'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase-client';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ products: 0, newOrders: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ count: products }, { count: newOrders }, { count: totalOrders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ products: products || 0, newOrders: newOrders || 0, totalOrders: totalOrders || 0 });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Преглед</h1>
      </div>
      <div className="admin-grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Производи</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{loading ? '...' : stats.products}</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Нови нарачки</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green)' }}>{loading ? '...' : stats.newOrders}</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Вкупно нарачки</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{loading ? '...' : stats.totalOrders}</div>
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card-title">Брзи акции</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/dashboard/products"><button className="admin-btn">Управувај производи</button></Link>
          <Link href="/admin/dashboard/content"><button className="admin-btn-ghost admin-btn">Уреди содржина</button></Link>
          <Link href="/admin/dashboard/orders"><button className="admin-btn-ghost admin-btn">Погледни нарачки</button></Link>
          <a href="/" target="_blank"><button className="admin-btn-ghost admin-btn">Отвори ја страната ↗</button></a>
        </div>
      </div>
    </>
  );
}
