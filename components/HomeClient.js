'use client';
import { useState } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgywnvy';

function formatPrice(n) {
  return n.toLocaleString('mk-MK') + ' ден';
}

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

  const showComingSoon = settings.show_coming_soon !== 'false';
  const showAudience = settings.show_audience !== 'false';
  const shippingCost = Number(settings.shipping_cost || 150);

  const featured = products.find((p) => p.is_featured) || products[0];

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: `${product.name} — ${product.flavor}`, price: product.price, image_url: product.image_url, qty: 1 }];
    });
    setOrderDone(null);
    setCheckoutOpen(true);
  }

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (cart.length > 0 ? shippingCost : 0);

  async function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    const itemsList = cart.map((i) => `${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`).join('\n');
    const payload = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      address: form.address,
      items: itemsList,
      total: formatPrice(total),
      _subject: `Нова нарачка од ${form.firstName} ${form.lastName} — ${formatPrice(total)}`,
    };
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('formspree error');

      // Зачувај ја нарачката и во Supabase за да се гледа во admin панелот
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          items: cart,
          subtotal,
          shipping: shippingCost,
          total,
        }),
      });

      setOrderDone({ ...form, total });
      setCart([]);
    } catch (err) {
      alert('Се случи грешка при испраќање на нарачката. Те молиме обиди се повторно.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
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
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <button
            onClick={() => { setOrderDone(null); setCheckoutOpen(true); }}
            aria-label="Кошничка"
            style={{position:'relative',background:'none',border:'1.5px solid var(--border)',borderRadius:'100px',padding:'0.55rem 1rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',fontWeight:600,color:'var(--ink)',transition:'all 0.2s'}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Кошничка
            {cart.length > 0 && (
              <span style={{background:'var(--green)',color:'#fff',borderRadius:'100px',fontSize:'0.65rem',fontWeight:700,padding:'1px 7px',marginLeft:'2px'}}>
                {cart.reduce((s,i)=>s+i.qty,0)}
              </span>
            )}
          </button>
          <a href="#cleanpro" className="nav-cta">Нарачај сега</a>
        </div>
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Мени">
          <span></span><span></span><span></span>
        </button>
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
        <div className="hero-glass">
          <span className="hero-eyebrow">{hero.eyebrow}</span>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-actions">
            <a href="#cleanpro" className="btn-dark">Откријте го CLEANPRO</a>
            <a href="#about" className="btn-ghost">Запознај го брендот</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{featured?.protein_g}g</div>
              <div className="hero-stat-label">Протеин</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">{featured?.sugar_g}g</div>
              <div className="hero-stat-label">Шеќер</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">{featured?.servings}</div>
              <div className="hero-stat-label">Оброци</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-label">Природно</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div>
            <span className="eyebrow">ЗА НАС</span>
            <h2 className="section-title">{about.title}</h2>
            <p className="section-text">{about.text}</p>
          </div>
          <div className="about-img">
            {featured?.image_url && <img src={featured.image_url} alt={featured.name} />}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="philosophy">
        <div className="philosophy-inner">
          <span className="philosophy-eyebrow">WHY WE EXIST</span>
          <h2 className="philosophy-title">{philosophy.title}</h2>
          <p className="philosophy-text">{philosophy.text}</p>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="featured" id="cleanpro">
        <div className="featured-inner">
          <div className="featured-visual">
            {featured?.image_url && <img src={featured.image_url} alt={featured.name} />}
          </div>
          <div>
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

      {/* ALL PRODUCTS GRID */}
      {products.length > 1 && (
        <section className="why">
          <div className="why-inner">
            <div className="why-head">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>ВКУСОВИ</span>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Избери го твојот.</h2>
            </div>
            <div className="why-grid" style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)` }}>
              {products.map((p) => (
                <div key={p.id} className="why-card">
                  <div className="why-title">{p.flavor}</div>
                  <div className="why-text">{p.description}</div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{formatPrice(p.price)}</strong>
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
              <div className="audience-item"><div className="audience-icon">↓</div><div className="audience-text">Подобра форма</div></div>
              <div className="audience-item"><div className="audience-icon">P</div><div className="audience-text">Повеќе протеин</div></div>
              <div className="audience-item"><div className="audience-icon">⚡</div><div className="audience-text">Активен животен стил</div></div>
              <div className="audience-item"><div className="audience-icon">⏱</div><div className="audience-text">Зафатено секојдневие</div></div>
              <div className="audience-item"><div className="audience-icon">★</div><div className="audience-text">Почетници</div></div>
              <div className="audience-item"><div className="audience-icon">●</div><div className="audience-text">Спортисти</div></div>
            </div>
          </div>
        </section>
      )}

      {/* MISSION */}
      <section className="mission">
        <div className="mission-inner">
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
              <div className="coming-card"><div className="coming-icon-box">⬢</div><div className="coming-name">Creatine</div><div className="coming-badge">Наскоро</div></div>
              <div className="coming-card"><div className="coming-icon-box">◐</div><div className="coming-name">Magnesium</div><div className="coming-badge">Наскоро</div></div>
              <div className="coming-card"><div className="coming-icon-box">◆</div><div className="coming-name">Brain Booster</div><div className="coming-badge">Наскоро</div></div>
              <div className="coming-card"><div className="coming-icon-box">▲</div><div className="coming-name">BCAA</div><div className="coming-badge">Наскоро</div></div>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-inner">
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
      <div className={`modal-overlay ${checkoutOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setCheckoutOpen(false)}>
        <div className="modal-box">
          <button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Затвори">&times;</button>

          {orderDone ? (
            <div className="checkout-success">
              <div className="success-icon">✓</div>
              <h3 className="checkout-title">Нарачката е примена!</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 1.5rem' }}>
                Благодариме, {orderDone.firstName}! Твојата нарачка за <strong>{formatPrice(orderDone.total)}</strong> ќе биде доставена на адреса <strong>{orderDone.address}</strong>. Потврда е испратена на <strong>{orderDone.email}</strong>.
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
                    {cart.map((item) => (
                      <div className="cart-line" key={item.id}>
                        {item.image_url && <img src={item.image_url} alt={item.name} />}
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
                        <div className="cart-line-price">{formatPrice(item.price * item.qty)}</div>
                      </div>
                    ))}
                    <div className="cart-totals">
                      <div className="cart-total-row"><span>Подзбир</span><span>{formatPrice(subtotal)}</span></div>
                      <div className="cart-total-row"><span>Достава</span><span>{formatPrice(shippingCost)}</span></div>
                      <div className="cart-total-row final"><span>Вкупно</span><span>{formatPrice(total)}</span></div>
                    </div>
                  </>
                )}
              </div>
              <div className="checkout-form-side">
                <span className="checkout-step">Чекор 2 од 2</span>
                <h3 className="checkout-title">Податоци за достава</h3>
                <form onSubmit={submitOrder}>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Име</label>
                      <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div className="form-field">
                      <label>Презиме</label>
                      <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Адреса за достава</label>
                    <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Телефонски број</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Е-пошта</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <button type="submit" className="checkout-submit" disabled={submitting || cart.length === 0}>
                    {submitting ? 'Се испраќа...' : 'Потврди нарачка'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('scroll', function() {
              var nav = document.querySelector('nav');
              if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
            });
          `,
        }}
      />
    </>
  );
}
