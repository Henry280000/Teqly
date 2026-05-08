import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const categorias = [
  { to: '/categoria/celulares', icon: 'phone', label: 'Smartphones', color: '#6366f1', desc: 'Los mejores celulares del mercado' },
  { to: '/categoria/tablets', icon: 'tablet', label: 'Tablets', color: '#8b5cf6', desc: 'Productividad y entretenimiento' },
  { to: '/categoria/monitores', icon: 'display', label: 'Monitores', color: '#06b6d4', desc: 'Gaming y profesional' },
  { to: '/categoria/teclados', icon: 'keyboard', label: 'Teclados', color: '#10b981', desc: 'Mecánicos y membrana' },
  { to: '/categoria/ratones', icon: 'mouse', label: 'Ratones', color: '#f59e0b', desc: 'Precisión y ergonomía' },
  { to: '/categoria/audifonos', icon: 'headphones', label: 'Audífonos', color: '#ef4444', desc: 'Audio premium' },
];

const features = [
  { icon: 'funnel', title: 'Filtros Avanzados', desc: 'Filtra por precio, marca y características específicas para encontrar exactamente lo que buscas.', color: '#6366f1' },
  { icon: 'stars', title: 'Búsqueda Inteligente', desc: 'Nuestro algoritmo analiza la relación calidad-precio y te recomienda las 5 mejores opciones.', color: '#10b981' },
  { icon: 'arrows-angle-expand', title: 'Comparación Múltiple', desc: 'Compara hasta 4 dispositivos lado a lado con gráficos radar y métricas detalladas.', color: '#06b6d4' },
];

function Home() {
  const { usuario } = useSelector((state) => state.auth);

  return (
    <div>
      {/* Hero */}
      <section className="tq-hero">
        <div className="tq-page-bg-glow tq-page-bg-glow--hero"></div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="mb-3"><span className="badge tq-hero-badge"><i className="bi bi-lightning-charge-fill me-1"></i>Plataforma #1 en México</span></div>
              <h1 className="fw-bold mb-3 tq-hero-title">Compara dispositivos<br /><span className="tq-text-brand">toma mejores decisiones</span></h1>
              <p className="mb-4 tq-hero-subtitle">Explora, filtra y compara celulares, tablets, monitores, teclados, ratones y audífonos con especificaciones técnicas detalladas y precios en MXN.</p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/busqueda-inteligente" className="btn btn-lg px-4 py-2 tq-btn-primary"><i className="bi bi-stars me-2"></i>Búsqueda Inteligente</Link>
                {!usuario && (<Link to="/registro" className="btn btn-lg btn-outline-light px-4 py-2" style={{ borderRadius: '10px', borderColor: 'rgba(255,255,255,0.2)' }}><i className="bi bi-person-plus me-2"></i>Crear cuenta gratis</Link>)}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <div style={{ position: 'relative' }}>
                <div className="tq-hero-circle"><i className="bi bi-phone" style={{ fontSize: '120px', color: '#818cf8', opacity: 0.8 }}></i></div>
                <div className="tq-hero-float tq-hero-float--green"><i className="bi bi-arrow-left-right me-2 tq-text-green"></i><span className="tq-text-green" style={{ color: '#a7f3d0' }}>Hasta 4 productos</span></div>
                <div className="tq-hero-float tq-hero-float--indigo"><i className="bi bi-graph-up me-2 tq-text-indigo"></i><span style={{ color: '#c7d2fe' }}>Análisis detallado</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Explora por Categoría</h2>
            <p className="tq-text-muted">Selecciona una categoría para ver todos los productos disponibles</p>
          </div>
          <div className="row g-4 justify-content-center">
            {categorias.map((cat) => (
              <div key={cat.to} className="col-6 col-md-4 col-lg-2">
                <Link to={cat.to} className="text-decoration-none">
                  <div className="card border-0 h-100 text-center tq-cat-card"
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
                    <div className="card-body py-4">
                      <div className="tq-cat-icon mb-3 mx-auto" style={{ background: `${cat.color}12`, color: cat.color }}><i className={`bi bi-${cat.icon}`}></i></div>
                      <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{cat.label}</h6>
                      <small className="tq-text-muted" style={{ fontSize: '12px' }}>{cat.desc}</small>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{ color: '#0f172a' }}>¿Por qué Teqly?</h2>
            <p className="tq-text-muted">Herramientas diseñadas para ayudarte a tomar la mejor decisión</p>
          </div>
          <div className="row g-4">
            {features.map((f, idx) => (
              <div key={idx} className="col-md-4">
                <div className="card border-0 h-100" style={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div className="card-body p-4">
                    <div className="tq-feature-icon mb-3" style={{ background: `${f.color}15`, color: f.color }}><i className={`bi bi-${f.icon}`}></i></div>
                    <h5 className="fw-bold mb-2" style={{ color: '#1e293b' }}>{f.title}</h5>
                    <p className="tq-text-muted mb-0" style={{ lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5">
        <div className="container">
          <div className="card border-0 tq-cta">
            <div className="tq-cta-glow"></div>
            <div className="card-body text-center py-5 position-relative" style={{ zIndex: 1 }}>
              <h3 className="fw-bold mb-3 tq-text-primary" style={{ fontSize: '1.8rem' }}>¿No sabes qué dispositivo elegir?</h3>
              <p className="mb-4 tq-text-secondary" style={{ maxWidth: '500px', margin: '0 auto' }}>Nuestra búsqueda inteligente analiza la relación calidad-precio y te muestra las 5 mejores opciones para tu presupuesto.</p>
              <Link to="/busqueda-inteligente" className="btn btn-lg px-5 py-2 tq-btn-primary" style={{ borderRadius: '12px' }}><i className="bi bi-magic me-2"></i>Comenzar Búsqueda Inteligente</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
