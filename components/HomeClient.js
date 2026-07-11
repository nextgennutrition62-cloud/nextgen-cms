'use client';
import { useState, useEffect } from 'react';

const FORMSPREE = 'https://formspree.io/f/mlgywnvy';
const EMAILJS_SERVICE = 'service_ziyrgw4';
const EMAILJS_TEMPLATE = 'template_gqqcmel';
const EMAILJS_PUBLIC_KEY = '7wqEQ9CArSgbUe5Yr';

function fmt(n) { return Number(n).toLocaleString('mk-MK') + ' ден'; }

export default function HomeClient({ content, settings, products }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '', street: '', streetNum: '', city: '', phone: '', email: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [slide, setSlide] = useState(0);

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

      // Испрати потврда до купувачот преку EmailJS
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE,
            template_id: EMAILJS_TEMPLATE,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: form.email,
              email: form.email,
              name: `${form.firstName} ${form.lastName}`,
              customer_name: `${form.firstName} ${form.lastName}`,
              items: cart.map(i => `${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`).join(', '),
              total: fmt(total),
              address: form.address,
              phone: form.phone,
              message: `Нарачка: ${cart.map(i => `${i.name} x${i.qty}`).join(', ')} | Вкупно: ${fmt(total)} | Адреса: ${form.address}`,
            }
          })
        });
      } catch (emailErr) {
        console.log('EmailJS error (non-critical):', emailErr);
      }

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

      {/* FEATURED PRODUCT SLIDESHOW */}
      <section className="featured" id="cleanpro">
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="featured-tag">OUR FIRST PRODUCT</span>
          </div>

          {products.length > 0 && (() => {
            const p = products[Math.min(slide, products.length - 1)];
            return (
              <div>
                <div className="featured-inner">
                  <div className="featured-visual">
                    {p?.image_url && <img src={p.image_url} alt={p.name} style={{ maxWidth: `${imgSizeFeatured}%`, width: '100%' }} />}
                  </div>
                  <div>
                    <h2 className="featured-title">{p?.name}</h2>
                    <p className="featured-desc">{p?.description}</p>
                    <div className="featured-stats">
                      <div><div className="fstat-num">{p?.protein_g}g</div><div className="fstat-label">Протеин</div></div>
                      <div><div className="fstat-num">{p?.sugar_g}g</div><div className="fstat-label">Шеќер</div></div>
                      <div><div className="fstat-num">{p?.servings}</div><div className="fstat-label">Оброци</div></div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      {p?.sale_price ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#E03A3A' }}>{fmt(p.sale_price)}</span>
                            <span style={{ fontSize: '1.1rem', color: 'var(--gray-light)', textDecoration: 'line-through' }}>{fmt(p.price)}</span>
                          </div>
                          <span style={{ background: '#E03A3A', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', display: 'inline-block', marginTop: '0.4rem' }}>
                            -{Math.round((1 - p.sale_price / p.price) * 100)}% ПОПУСТ
                          </span>
                        </div>
                      ) : p?.price ? (
                        <span style={{ fontSize: '2rem', fontWeight: 700 }}>{fmt(p.price)}</span>
                      ) : null}
                    </div>
                    <div className="featured-actions">
                      <button className="btn-dark" onClick={() => p && addToCart(p)}>Нарачај сега</button>
                      <a href="#about" className="btn-ghost">Прочитај повеќе</a>
                    </div>
                  </div>
                </div>
                {products.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                    <button onClick={() => setSlide(s => (s - 1 + products.length) % products.length)}
                      style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                    {products.map((_, i) => (
                      <button key={i} onClick={() => setSlide(i)}
                        style={{ width: i === slide ? 28 : 10, height: 10, borderRadius: '100px', border: 'none', background: i === slide ? 'var(--green)' : 'var(--border)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                    ))}
                    <button onClick={() => setSlide(s => (s + 1) % products.length)}
                      style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ALL PRODUCTS */}
      {products.length > 0 && (
        <section className="why" style={{ background: 'var(--bg-soft)' }}>
          <div className="why-inner">
            <div className="why-head anim-fade-up">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>CLEANPRO PROTEIN</span>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Одбери го твојот CLEANPRO.</h2>
              <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.95rem', marginTop: '0.75rem' }}>100% Milk Protein · No Sugar · High Performance</p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3rem' }}>
              {products.map(p => (
                <div key={p.id} className="product-card-clickable" onClick={() => setSelectedProduct(p)}
                  style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 18, overflow: 'hidden', width: 280, flexShrink: 0, cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ background: 'var(--white)', padding: '1.75rem 1.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                    {p.image_url && <img src={p.image_url} alt={p.flavor} style={{ maxWidth: '100%', maxHeight: 190, objectFit: 'contain', transition: 'transform 0.4s ease' }} />}
                  </div>
                  <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.3rem' }}>{p.flavor}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '1rem', lineHeight: 1.5 }}>{p.servings} оброци · {p.protein_g}g протеин</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        {p.sale_price ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#E03A3A' }}>{fmt(p.sale_price)}</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--gray-light)', textDecoration: 'line-through' }}>{fmt(p.price)}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--black)' }}>{fmt(p.price)}</span>
                        )}
                        {p.sale_price && (
                          <span style={{ background: '#E03A3A', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', display: 'inline-block', marginTop: '0.3rem' }}>
                            -{Math.round((1 - p.sale_price / p.price) * 100)}% ПОПУСТ
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>Погледни →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setSelectedProduct(null)}>
          <div className="modal-box" style={{ maxWidth: 780 }}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 420 }}>
              <div style={{ background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', borderRadius: '20px 0 0 20px' }}>
                {selectedProduct.image_url && <img src={selectedProduct.image_url} alt={selectedProduct.flavor} style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />}
              </div>
              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.5rem', display: 'block' }}>{selectedProduct.flavor}</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>{selectedProduct.name}</h2>
                <p style={{ color: 'var(--gray)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>{selectedProduct.description}</p>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{selectedProduct.protein_g}g</div><div style={{ fontSize: '0.65rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Протеин</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{selectedProduct.sugar_g}g</div><div style={{ fontSize: '0.65rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Шеќер</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{selectedProduct.servings}</div><div style={{ fontSize: '0.65rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Оброци</div></div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  {selectedProduct.sale_price ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#E03A3A' }}>{fmt(selectedProduct.sale_price)}</span>
                        <span style={{ fontSize: '1.1rem', color: 'var(--gray-light)', textDecoration: 'line-through' }}>{fmt(selectedProduct.price)}</span>
                      </div>
                      <span style={{ background: '#E03A3A', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', display: 'inline-block', marginTop: '0.4rem' }}>
                        -{Math.round((1 - selectedProduct.sale_price / selectedProduct.price) * 100)}% ПОПУСТ
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 700 }}>{fmt(selectedProduct.price)}</span>
                  )}
                </div>
                <button className="btn-dark" style={{ width: '100%', textAlign: 'center', padding: '1rem' }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  Додади во кошничка
                </button>
              </div>
            </div>
          </div>
        </div>
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
                  <div className="form-field"><label>Улица</label><input type="text" required value={form.street || ''} placeholder="пр. Пролетерска" onChange={e => setForm({ ...form, street: e.target.value, address: `${e.target.value} ${form.streetNum || ''}, ${form.city || ''}` })} /></div>
                  <div className="form-row-2">
                    <div className="form-field"><label>Број</label><input type="text" required value={form.streetNum || ''} placeholder="пр. 22" pattern=".*[0-9].*" title="Внеси број на улица" onChange={e => setForm({ ...form, streetNum: e.target.value, address: `${form.street || ''} ${e.target.value}, ${form.city || ''}` })} /></div>
                    <div className="form-field"><label>Град</label><input type="text" required value={form.city || ''} placeholder="пр. Штип" minLength={2} onChange={e => setForm({ ...form, city: e.target.value, address: `${form.street || ''} ${form.streetNum || ''}, ${e.target.value}` })} /></div>
                  </div>
                  <div className="form-field"><label>Телефон</label><input type="tel" required value={form.phone} pattern="^(\+?389|0)7[0-9]\s?[0-9]{3}\s?[0-9]{3}$" title="Внеси валиден македонски телефон (пр. 078 123 456)" placeholder="078 123 456" onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
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
