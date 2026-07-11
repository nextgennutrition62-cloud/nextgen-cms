'use client';
import { useState, useEffect } from 'react';

const FORMSPREE = 'https://formspree.io/f/mlgywnvy';

function fmt(n) { return Number(n).toLocaleString('mk-MK') + ' ден'; }

export default function HomeClient({ content, settings, products }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '', phone: '', email: '' });

  const hero = content.hero || {};
  const about = content.about || {};
  const philosophy = content.philosophy || {};
  const mission = content.mission || {};
  const featured = products.find(p => p.is_featured) || products[0];

  const showComingSoon = settings.show_coming_soon !== 'false';
  const showAudience = settings.show_audience !== 'false';
  const shippingCost = Number(settings.shipping_cost || 150);
  const aboutImageUrl = settings.about_image_url || featured?.image_url || '';
  const imgSizeFeatured = Number(settings.img_size_featured || 100);
  const imgSizeAbout = Number(settings.img_size_about || 100);

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('anim-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.anim-fade-up,.anim-fade-in,.anim-slide-left,.anim-slide-right,.anim-scale').forEach(el => observer.observe(el));

    // Nav scroll effect
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: `${product.name} — ${product.flavor}`, price: product.price, image_url: product.image_url, qty: 1 }];
    });
    setOrderDone(null);
    setCheckoutOpen(true);
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (cart.length > 0 ? shippingCost : 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  async function submitOrder(e) {
    e.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    const payload = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email, phone: form.phone, address: form.address,
      items: cart.map(i => `${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`).join('\n'),
      total: fmt(total),
      _subject: `Нова нарачка од ${form.firstName} ${form.lastName} — ${fmt(total)}`,
    };
    try {
      const res = await fetch(FORMSPREE, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.phone, address: form.address, items: cart, subtotal, shipping: shippingCost, total }) });
      setOrderDone({ ...form, total });
      setCart([]);
    } catch { alert('Грешка при испраќање. Обиди се повторно.'); }
    setSubmitting(false);
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#home" className="nav-logo">
          {settings.logo_url ? <img src={settings.logo_url} alt="NEXT GEN Nutrition" /> : <strong>NEXT GEN</strong>}
        </a>
        <ul className="nav-links">
          <li><a href="#home">Дома</a></li>
          <li><a href="#cleanpro">CLEANPRO</a></li>
          <li><a href="#about">За нас</a></li>
          <li><a href="/blog">Блог</a></li>
          <li><a href="#contact">Контакт</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => { setOrderDone(null); setCheckoutOpen(true); }} style={{ position: 'relative', background: 'none', border: '1.5px solid var(--border)', borderRadius: '100px', padding: '0.55rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
            🛒 Кошничка
            {cartCount > 0 && <span style={{ background: 'var(--green)', color: '#fff', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px' }}>{cartCount}</span>}
          </button>
          <a href="#cleanpro" className="nav-cta">Нарачај сега</a>
        </div>
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}><span></span><span></span><span></span></button>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a href="#home" onClick={() => setMobileOpen(false)}>Дома</a>
        <a href="#cleanpro" onClick={() => setMobileOpen(false)}>CLEANPRO</a>
        <a href="#about" onClick={() => setMobileOpen(false)}>За нас</a>
        <a href="/blog" onClick={() => setMobileOpen(false)}>Блог</a>
        <a href="#contact" onClick={() => setMobileOpen(false)}>Контакт</a>
      </div>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-orb hero-orb1"></div>
        <div className="hero-orb hero-orb2"></div>
        <div className="hero-orb hero-orb3"></div>
        <div className="hero-inner-split">
          <div className="hero-glass hero-glass-left">
            <span className="hero-eyebrow">{hero.eyebrow}</span>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-subtitle">{hero.subtitle}</p>
            <div className="hero-actions">
              <a href="#cleanpro" className="btn-dark">Откријте го CLEANPRO</a>
              <a href="#about" className="btn-ghost">Запознај го брендот</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-num">{featured?.protein_g}g</div><div className="hero-stat-label">Протеин</div></div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat"><div className="hero-stat-num">{featured?.sugar_g}g</div><div className="hero-stat-label">Шеќер</div></div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat"><div className="hero-stat-num">{featured?.servings}</div><div className="hero-stat-label">Оброци</div></div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat"><div className="hero-stat-num">100%</div><div className="hero-stat-label">Природно</div></div>
            </div>
          </div>
          <div className="hero-image-right">
            {settings.hero_image_url
              ? <img src={settings.hero_image_url} alt="CLEANPRO производ" className="hero-product-img" />
              : featured?.image_url
                ? <img src={featured.image_url} alt="CLEANPRO производ" className="hero-product-img" />
                : null
            }
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="anim-slide-right">
            <span className="eyebrow">ЗА НАС</span>
            <h2 className="section-title">{about.title}</h2>
            <p className="section-text">{about.text}</p>
          </div>
          <div className="about-img anim-slide-left">
            {aboutImageUrl && <img src={aboutImageUrl} alt="За нас" style={{ maxWidth: `${imgSizeAbout}%`, width: '100%' }} />}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="philosophy">
        <div className="philosophy-inner anim-fade-up">
          <span className="philosophy-eyebrow">WHY WE EXIST</span>
          <h2 className="philosophy-title">{philosophy.title}</h2>
          <p className="philosophy-text">{philosophy.text}</p>
        </div>
      </section>

      {/* FEATURED PRODUCT */}
      <section className="featured" id="cleanpro">
        <div className="featured-inner">
          <div className="featured-visual anim-slide-right">
            {featured?.image_url && <img src={featured.image_url} alt={featured.name} style={{ maxWidth: `${imgSizeFeatured}%`, width: '100%' }} />}
          </div>
          <div className="anim-slide-left">
            <span className="featured-tag">OUR FIRST PRODUCT</span>
            <h2 className="featured-title">CLEANPRO</h2>
            <p className="featured-desc">{featured?.description}</p>
            <div className="featured-stats">
              <div><div className="fstat-num">{featured?.protein_g}g</div><div className="fstat-label">Протеин</div></div>
              <div><div className="fstat-num">{featured?.sugar_g}g</div><div className="fstat-label">Шеќер</div></div>
              <div><div className="fstat-num">{featured?.servings}</div><div className="fstat-label">Оброци</div></div>
            </div>
            <div className="featured-actions">
              <button className="btn-dark" onClick={() => featured && addToCart(featured)}>Нарачај сега</button>
              <a href="#about" className="btn-ghost">Прочитај повеќе</a>
            </div>
          </div>
        </div>
      </section>

      {/* ALL PRODUCTS */}
      {products.length > 1 && (
        <section className="why">
          <div className="why-inner">
            <div className="why-head">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>ВКУСОВИ</span>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Избери го твојот.</h2>
            </div>
            <div className="why-grid" style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)` }}>
              {products.map(p => (
                <div key={p.id} className="why-card">
                  {p.image_url && <img src={p.image_url} alt={p.flavor} style={{ width: '100%', borderRadius: 10, marginBottom: '0.75rem', objectFit: 'contain', maxHeight: 140 }} />}
                  <div className="why-title">{p.flavor}</div>
                  <div className="why-text">{p.description}</div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{fmt(p.price)}</strong>
                    <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }} onClick={() => addToCart(p)}>Купи</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AUDIENCE */}
      {showAudience && (
        <section className="audience">
          <div className="audience-inner">
            <div className="audience-head">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>WHO IS IT FOR</span>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Создаден за реалниот живот.</h2>
            </div>
            <div className="audience-grid">
              {[['↓','Подобра форма'],['P','Повеќе протеин'],['⚡','Активен животен стил'],['⏱','Зафатено секојдневие'],['★','Почетници'],['●','Спортисти']].map(([icon, text]) => (
                <div key={text} className="audience-item"><div className="audience-icon">{icon}</div><div className="audience-text">{text}</div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MISSION */}
      <section className="mission">
        <div className="mission-inner anim-scale">
          <p className="mission-text">{mission.text}</p>
        </div>
      </section>

      {/* COMING SOON */}
      {showComingSoon && (
        <section className="coming">
          <div className="coming-inner">
            <div className="coming-head">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>NEXT GEN ECOSYSTEM</span>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Ова е само почеток.</h2>
            </div>
            <div className="coming-grid">
              {[['⬢','Creatine'],['◐','Magnesium'],['◆','Brain Booster'],['▲','BCAA']].map(([icon, name]) => (
                <div key={name} className="coming-card"><div className="coming-icon-box">{icon}</div><div className="coming-name">{name}</div><div className="coming-badge">Наскоро</div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-inner anim-fade-up">
          <h2 className="final-cta-title">Не чекај понеделник.<br />Започни денес.</h2>
          <p className="final-cta-sub">Подобрите навики не започнуваат во иднина. Започнуваат сега.</p>
          <button className="btn-light" onClick={() => featured && addToCart(featured)}>Започни со CLEANPRO</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-inner">
          <div>
            <a href="#home" className="footer-logo">
              {settings.logo_url ? <img src={settings.logo_url} alt="NEXT GEN Nutrition" /> : <strong>NEXT GEN</strong>}
            </a>
            <p className="footer-slogan">Better Habits. Better Results.</p>
          </div>
          <div>
            <div className="footer-col-title">Навигација</div>
            <ul className="footer-links">
              <li><a href="#home">Дома</a></li>
              <li><a href="#cleanpro">CLEANPRO</a></li>
              <li><a href="#about">За нас</a></li>
              <li><a href="/blog">Блог</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Контакт</div>
            <ul className="footer-links">
              <li>{settings.email}</li>
              <li>{settings.phone}</li>
              <li>Македонија</li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Следи нè</div>
            <div className="social-row">
              {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener" className="social-link">IG</a>}
              {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener" className="social-link">FB</a>}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2025 NEXT GEN Nutrition. Сите права задржани.</div>
          <div>Дизајниран за подобри навики.</div>
        </div>
      </footer>

      {/* CHECKOUT MODAL */}
      <div className={`modal-overlay ${checkoutOpen ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setCheckoutOpen(false)}>
        <div className="modal-box">
          <button className="modal-close" onClick={() => setCheckoutOpen(false)}>&times;</button>
          {orderDone ? (
            <div className="checkout-success">
              <div className="success-icon">✓</div>
              <h3 className="checkout-title">Нарачката е примена!</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 1.5rem' }}>
                Благодариме, {orderDone.firstName}! Нарачката за <strong>{fmt(orderDone.total)}</strong> ќе биде доставена на <strong>{orderDone.address}</strong>. Потврда испратена на <strong>{orderDone.email}</strong>.
              </p>
              <button className="btn-dark" onClick={() => setCheckoutOpen(false)}>Затвори</button>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="checkout-summary">
                <span className="checkout-step">Чекор 1 од 2</span>
                <h3 className="checkout-title">Твојата кошничка</h3>
                {cart.length === 0 ? (
                  <div className="empty-cart">Кошничката е празна.</div>
                ) : (
                  <>
                    {cart.map(item => (
                      <div className="cart-line" key={item.id}>
                        {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: 64, height: 64, objectFit: 'contain', background: 'var(--white)', borderRadius: 10, padding: '0.4rem', flexShrink: 0 }} />}
                        <div>
                          <div className="cart-line-name">{item.name}</div>
                          <div className="cart-line-meta">
                            <span className="qty-control">
                              <button type="button" onClick={() => changeQty(item.id, -1)}>−</button>
                              <span>{item.qty}</span>
                              <button type="button" onClick={() => changeQty(item.id, 1)}>+</button>
                            </span>
                          </div>
                        </div>
                        <div className="cart-line-price">{fmt(item.price * item.qty)}</div>
                      </div>
                    ))}
                    <div className="cart-totals">
                      <div className="cart-total-row"><span>Подзбир</span><span>{fmt(subtotal)}</span></div>
                      <div className="cart-total-row"><span>Достава</span><span>{fmt(shippingCost)}</span></div>
                      <div className="cart-total-row final"><span>Вкупно</span><span>{fmt(total)}</span></div>
                    </div>
                  </>
                )}
              </div>
              <div className="checkout-form-side">
                <span className="checkout-step">Чекор 2 од 2</span>
                <h3 className="checkout-title">Податоци за достава</h3>
                <form onSubmit={submitOrder}>
                  <div className="form-row-2">
                    <div className="form-field"><label>Име</label><input type="text" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                    <div className="form-field"><label>Презиме</label><input type="text" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                  </div>
                  <div className="form-field"><label>Адреса</label><input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                  <div className="form-field"><label>Телефон</label><input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="form-field"><label>Е-пошта</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <button type="submit" className="checkout-submit" disabled={submitting || !cart.length}>
                    {submitting ? 'Се испраќа...' : 'Потврди нарачка'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
