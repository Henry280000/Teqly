import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-phone me-2"></i>
          Comparador Dispositivos
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>
                Inicio
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-grid me-1"></i>
                Categorías
              </a>
              <ul className="dropdown-menu dropdown-menu-dark">
                <li>
                  <Link className="dropdown-item" to="/categoria/celulares">
                    <i className="bi bi-phone me-2"></i>
                    Celulares
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categoria/tablets">
                    <i className="bi bi-tablet me-2"></i>
                    Tablets
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categoria/monitores">
                    <i className="bi bi-display me-2"></i>
                    Monitores
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categoria/teclados">
                    <i className="bi bi-keyboard me-2"></i>
                    Teclados
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categoria/ratones">
                    <i className="bi bi-mouse me-2"></i>
                    Ratones
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categoria/audifonos">
                    <i className="bi bi-headphones me-2"></i>
                    Audífonos
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/busqueda-inteligente">
                <i className="bi bi-stars me-1"></i>
                Búsqueda Inteligente
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/comparar">
                <i className="bi bi-arrow-left-right me-1"></i>
                Comparar
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
