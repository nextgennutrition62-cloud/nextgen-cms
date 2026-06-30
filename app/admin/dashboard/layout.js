'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

const navItems = [
  { href: '/admin/dashboard', label: 'Преглед' },
  { href: '/admin/dashboard/content', label: 'Содржина' },
  { href: '/admin/dashboard/products', label: 'Производи' },
  { href: '/admin/dashboard/orders', label: 'Нарачки' },
  { href: '/admin/dashboard/settings', label: 'Поставки' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">NEXT GEN <span>Admin</span></div>
        <ul className="admin-nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={pathname === item.href ? 'active' : ''}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#B0B0B0', fontSize: '0.85rem', cursor: 'pointer', padding: '0.7rem 0.875rem' }}
          >
            Одјави се
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
