import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          Comparador de Dispositivos
        </h1>
        <p className="lead text-muted mb-4">
          Encuentra y compara los mejores dispositivos electrónicos disponibles en México
        </p>
      </div>

      {/* Categorías visuales limpias */}
      <div className="text-center mb-5">
        <h2 className="mb-4">Explora por Categoría</h2>
        <div className="row g-3 justify-content-center">
          <div className="col-auto">
            <Link to="/categoria/celulares" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-phone" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Smartphones</span>
                </div>
              </button>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/categoria/tablets" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-tablet" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Tablets</span>
                </div>
              </button>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/categoria/monitores" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-display" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Monitores</span>
                </div>
              </button>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/categoria/teclados" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-keyboard" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Teclados</span>
                </div>
              </button>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/categoria/ratones" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-mouse" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Ratones</span>
                </div>
              </button>
            </Link>
          </div>
          <div className="col-auto">
            <Link to="/categoria/audifonos" className="text-decoration-none">
              <button className="btn btn-outline-secondary rounded-4 px-4 py-3" style={{ minWidth: '140px' }}>
                <div className="d-flex flex-column align-items-center">
                  <i className="bi bi-headphones" style={{ fontSize: '2rem' }}></i>
                  <span className="mt-2 fw-semibold" style={{ fontSize: '0.9rem' }}>Audífonos</span>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-primary">
            <div className="card-body text-center">
              <i className="bi bi-funnel text-primary" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Filtros Avanzados</h5>
              <p className="card-text text-muted">
                Filtra por precio, marca y características específicas
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-success">
            <div className="card-body text-center">
              <i className="bi bi-stars text-success" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Búsqueda Inteligente</h5>
              <p className="card-text text-muted">
                Encuentra el dispositivo perfecto con preguntas personalizadas
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-info">
            <div className="card-body text-center">
              <i className="bi bi-arrows-angle-expand text-info" style={{ fontSize: '3rem' }}></i>
              <h5 className="card-title mt-3">Comparación Múltiple</h5>
              <p className="card-text text-muted">
                Compara hasta 4 dispositivos lado a lado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="card bg-primary text-white mt-5">
        <div className="card-body text-center py-5">
          <h3 className="mb-3">¿No sabes qué dispositivo elegir?</h3>
          <p className="mb-4">
            Usa nuestra búsqueda inteligente para encontrar el producto perfecto según tus necesidades
          </p>
          <Link to="/busqueda-inteligente" className="btn btn-light btn-lg">
            <i className="bi bi-magic me-2"></i>
            Comenzar Búsqueda Inteligente
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
