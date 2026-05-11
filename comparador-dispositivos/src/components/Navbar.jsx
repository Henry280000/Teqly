import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/Slices/authSlice';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'react-toastify';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { usuario } = useSelector((state) => state.auth);
  const { lista: favoritos } = useSelector((state) => state.favoritos);
  const { lista: comparar } = useSelector((state) => state.comparar);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Sesión cerrada');
    navigate('/');
  };

  // Reinicializar dropdowns después de cada render
  useEffect(() => {
    if (window.bootstrap) {
      document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
        new window.bootstrap.Dropdown(el);
      });
    }
  });

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark' : 'navbar-light'} tq-navbar`}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 tq-navbar-brand" to="/">Teqly</Link>

        {/* Toggle tema + hamburger (siempre visibles) */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <button className="btn btn-sm tq-btn-outline-indigo" onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            style={{ width: '34px', height: '34px', padding: 0, borderRadius: '50%' }}>
            <i className={`bi bi-${theme === 'dark' ? 'sun-fill' : 'moon-fill'}`}></i>
          </button>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"><i className="bi bi-grid me-1"></i>Categorías</a>
              <ul className="dropdown-menu tq-dropdown-menu">
                {[
                  { to: '/categoria/celulares', icon: 'phone', label: 'Celulares' },
                  { to: '/categoria/tablets', icon: 'tablet', label: 'Tablets' },
                  { to: '/categoria/monitores', icon: 'display', label: 'Monitores' },
                  { to: '/categoria/teclados', icon: 'keyboard', label: 'Teclados' },
                  { to: '/categoria/ratones', icon: 'mouse', label: 'Ratones' },
                  { to: '/categoria/audifonos', icon: 'headphones', label: 'Audífonos' },
                ].map(({ to, icon, label }) => (
                  <li key={to}><Link className="dropdown-item tq-dropdown-item" to={to}><i className={`bi bi-${icon} me-2`}></i>{label}</Link></li>
                ))}
              </ul>
            </li>
            <li className="nav-item"><Link className="nav-link" to="/busqueda-inteligente"><i className="bi bi-stars me-1"></i>Búsqueda Inteligente</Link></li>
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/comparar">
                <i className="bi bi-arrow-left-right me-1"></i>Comparar
                {comparar.length > 0 && (<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill tq-badge-count">{comparar.length}</span>)}
              </Link>
            </li>
            {usuario && (
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/favoritos">
                  <i className="bi bi-heart me-1"></i>Favoritos
                  {favoritos.length > 0 && (<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>{favoritos.length}</span>)}
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {/* Toggle tema (solo desktop) */}
            <li className="nav-item me-2 d-none d-lg-block">
              <button className="btn btn-sm tq-btn-outline-indigo" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}>
                <i className={`bi bi-${theme === 'dark' ? 'sun-fill' : 'moon-fill'}`}></i>
              </button>
            </li>
            {usuario ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center gap-2 tq-text-indigo" href="#" role="button" data-bs-toggle="dropdown">
                  <div className="tq-navbar-avatar"><i className="bi bi-person-fill"></i></div>
                  <span>{usuario.nombre}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end tq-dropdown-menu">
                  <li><span className="dropdown-item-text small tq-text-muted">{usuario.email}</span></li>
                  <li><hr className="dropdown-divider tq-dropdown-divider" /></li>
                  <li><Link className="dropdown-item tq-dropdown-item" to="/favoritos"><i className="bi bi-heart me-2"></i>Mis Favoritos</Link></li>
                  {usuario.rol === 'admin' && (<li><Link className="dropdown-item tq-dropdown-item" to="/admin"><i className="bi bi-gear me-2"></i>Admin</Link></li>)}
                  <li><hr className="dropdown-divider tq-dropdown-divider" /></li>
                  <li><button className="dropdown-item tq-text-red" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
                </ul>
              </li>
            ) : (
              <div className="d-flex gap-2 mt-2 mt-lg-0">
                <Link to="/login" className="btn btn-sm px-3 tq-btn-nav-login"><i className="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión</Link>
                <Link to="/registro" className="btn btn-sm px-3 tq-btn-primary"><i className="bi bi-person-plus me-1"></i>Registrarse</Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;