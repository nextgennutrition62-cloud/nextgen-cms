'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
  }

  function reject() {
    localStorage.setItem('cookie_consent', 'rejected');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
    // Ова е местото каде во иднина ќе се блокираат analytics/marketing скрипти
    // ако се додадат (Google Analytics, Facebook Pixel итн.)
  }

  if (!visible) return null;
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-inner">
        <div className="cookie-banner-text">
          <strong>Користиме колачиња (cookies)</strong>
          <p>
            Оваа веб страница користи неопходни колачиња за основно функционирање (кошничка, најава во админ панел).
            Не користиме колачиња за реклами или следење без твоја согласност.{' '}
            <a href="/privacy">Прочитај ја нашата Политика за приватност</a>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button onClick={reject} className="cookie-btn cookie-btn-reject">Одбиј</button>
          <button onClick={accept} className="cookie-btn cookie-btn-accept">Прифати</button>
        </div>
      </div>
    </div>
  );
}
