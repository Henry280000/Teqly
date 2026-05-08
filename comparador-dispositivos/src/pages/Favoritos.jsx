import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { quitarFavorito, limpiarFavoritos } from '../Store/Slices/favoritosSlice';
import { agregarAComparar } from '../Store/Slices/compararSlice';
import { toast } from 'react-toastify';
import { useState } from 'react';

function Favoritos() {
  const dispatch = useDispatch();
  const { lista: favoritos } = useSelector((s) => s.favoritos);
  const { lista: comparar } = useSelector((s) => s.comparar);
  const { usuario } = useSelector((s) => s.auth);
  const [imagenesError, setImagenesError] = useState({});

  const formatPrecio = (p) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p);
  const getCategoryIcon = (c) => ({ celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' }[c] || 'device');

  const handleQuitar = (id) => { dispatch(quitarFavorito(id)); toast.info('Eliminado de favoritos'); };
  const handleLimpiar = () => { if (window.confirm('¿Quieres eliminar todos tus favoritos?')) { dispatch(limpiarFavoritos()); toast.info('Favoritos eliminados'); } };
  const handleAgregarAComparar = (producto) => {
    if (comparar.length >= 4) { toast.warning('Máximo 4 productos'); return; }
    if (comparar.find(p => p._id === producto._id)) { toast.info('Ya está en comparación'); return; }
    dispatch(agregarAComparar(producto)); toast.success('Agregado a comparación');
  };

  if (!usuario) return (
    <div className="tq-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center py-5">
        <i className="bi bi-heart tq-empty-icon"></i>
        <h2 className="mt-4 mb-3 tq-text-primary">Inicia sesión para ver tus favoritos</h2>
        <p className="mb-4 tq-text-muted">Guarda tus productos favoritos y accede a ellos cuando quieras.</p>
        <div className="d-flex gap-2 justify-content-center">
          <Link to="/login" className="btn btn-lg tq-btn-primary px-4"><i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</Link>
          <Link to="/registro" className="btn btn-lg tq-btn-outline-indigo px-4"><i className="bi bi-person-plus me-2"></i>Registrarse</Link>
        </div>
      </div>
    </div>
  );

  if (favoritos.length === 0) return (
    <div className="tq-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center py-5">
        <i className="bi bi-heart tq-empty-icon"></i>
        <h2 className="mt-4 mb-3 tq-text-primary">No tienes favoritos aún</h2>
        <p className="mb-4 tq-text-muted">Explora productos y agrégalos con el botón de corazón</p>
        <Link to="/" className="btn btn-lg tq-btn-primary px-4"><i className="bi bi-grid me-2"></i>Explorar productos</Link>
      </div>
    </div>
  );

  return (
    <div className="tq-page">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1 tq-text-primary">Mis Favoritos</h1>
            <p className="mb-0 tq-text-muted">{favoritos.length} producto(s) guardado(s)</p>
          </div>
          <button className="btn tq-btn-outline-red" onClick={handleLimpiar}>
            <i className="bi bi-trash me-2"></i>Limpiar todo
          </button>
        </div>

        <div className="row g-4">
          {favoritos.map((producto) => (
            <div key={producto._id} className="col-md-6 col-lg-4">
              <div className="tq-card tq-card--hover h-100" style={{ overflow: 'hidden' }}>
                <div className="position-relative">
                  {producto.imagen && !imagenesError[producto._id] ? (
                    <img src={producto.imagen} alt={producto.nombre} className="card-img-top tq-product-img"
                      onError={() => setImagenesError(prev => ({ ...prev, [producto._id]: true }))} />
                  ) : (
                    <div className="tq-product-img-placeholder d-flex align-items-center justify-content-center">
                      <i className={`bi bi-${getCategoryIcon(producto.categoria)}`}></i>
                    </div>
                  )}
                  <button className="btn btn-sm position-absolute top-0 end-0 m-2 tq-fav-btn tq-fav-btn--active"
                    onClick={() => handleQuitar(producto._id)}><i className="bi bi-heart-fill"></i></button>
                  <span className="badge position-absolute top-0 start-0 m-2 tq-badge-indigo-solid">{producto.categoria}</span>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0 tq-text-primary" style={{ fontSize: '15px', lineHeight: 1.4 }}>{producto.nombre}</h5>
                    <span className="badge ms-2 tq-badge-indigo">{producto.marca}</span>
                  </div>
                  <h4 className="mb-3 tq-text-price">{formatPrecio(producto.precio)}</h4>
                  {producto.caracteristicas_especiales?.length > 0 && (
                    <div className="mb-3 flex-grow-1">
                      <div className="d-flex flex-wrap gap-1">
                        {producto.caracteristicas_especiales.slice(0, 3).map((c, i) => (
                          <span key={i} className="badge tq-badge-green">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer border-0 p-3">
                  <div className="d-grid gap-2">
                    <Link to={`/producto/${producto.categoria}/${producto._id}`} className="btn tq-btn-primary"><i className="bi bi-eye me-2"></i>Ver detalles</Link>
                    <button className="btn tq-btn-outline-cyan" onClick={() => handleAgregarAComparar(producto)}><i className="bi bi-plus-circle me-2"></i>Comparar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favoritos;