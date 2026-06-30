export const metadata = {
  title: 'Блог | NEXT GEN Nutrition',
  description: 'Совети за исхрана, протеин и подобри навики од NEXT GEN Nutrition.',
};

const posts = [
  { title: 'Колку протеин навистина ти треба дневно?', tag: 'Исхрана', excerpt: 'Едноставен водич за пресметка на дневен внес на протеин според твоите цели.' },
  { title: 'Milk Protein наспроти Whey: која е разликата?', tag: 'Производи', excerpt: 'Зошто CLEANPRO го избра 100% Milk Protein и што значи тоа за твоето тело.' },
  { title: '5 мали навики кои го менуваат резултатот', tag: 'Навики', excerpt: 'Не треба драстична промена. Треба конзистентност во мали чекори.' },
];

export default function BlogPage() {
  return (
    <>
      <nav>
        <a href="/" className="nav-logo"><strong>NEXT GEN</strong></a>
        <ul className="nav-links">
          <li><a href="/#home">Дома</a></li>
          <li><a href="/#cleanpro">CLEANPRO</a></li>
          <li><a href="/#about">За нас</a></li>
          <li><a href="/blog">Блог</a></li>
          <li><a href="/#contact">Контакт</a></li>
        </ul>
        <a href="/#cleanpro" className="nav-cta">Нарачај сега</a>
      </nav>

      <section className="hero" style={{ minHeight: 'auto', padding: '9rem 3rem 3rem', textAlign: 'center', display: 'block' }}>
        <span className="eyebrow" style={{ display: 'block' }}>Блог</span>
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.2rem,4vw,3.4rem)' }}>Совети за подобри навики.</h1>
        <p className="hero-subtitle" style={{ margin: '0 auto' }}>Практични информации за протеин, исхрана и секојдневна дисциплина, без помодарство, само она што навистина работи.</p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 3rem 8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
        {posts.map((post) => (
          <div key={post.title} className="why-card" style={{ cursor: 'pointer' }}>
            <span className="eyebrow" style={{ marginBottom: '0.6rem' }}>{post.tag}</span>
            <div className="why-title">{post.title}</div>
            <div className="why-text">{post.excerpt}</div>
          </div>
        ))}
      </section>

      <footer>
        <div className="footer-bottom">
          <div>© 2025 NEXT GEN Nutrition. Сите права задржани.</div>
        </div>
      </footer>
    </>
  );
}
