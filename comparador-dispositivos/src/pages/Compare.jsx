import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { quitarDeComparar, limpiarComparar } from '../Store/Slices/compararSlice';
import { toast } from 'react-toastify';

function Compare() {
  const dispatch = useDispatch();
  const { lista: compararList } = useSelector((s) => s.comparar);
  const [imagenesError, setImagenesError] = useState({});

  const formatPrecio = (p) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(p);
  const handleRemove = (id, cat) => { dispatch(quitarDeComparar({ _id: id, categoria: cat })); toast.info('Producto eliminado'); };
  const handleClearAll = () => { if (window.confirm('¿Limpiar toda la comparación?')) { dispatch(limpiarComparar()); toast.info('Comparación limpiada'); } };
  const getCategoryIcon = (c) => ({ celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' }[c] || 'device');

  const calcularPuntuacion = (prod) => {
    let pts = 50;
    if (prod.caracteristicas_especiales) pts += prod.caracteristicas_especiales.length * 3;
    if (prod.precio > 20000) pts += 10; else if (prod.precio > 10000) pts += 5;
    return Math.min(100, pts);
  };

  const generarValoraciones = (prod) => {
    const pts = calcularPuntuacion(prod);
    const chars = prod.caracteristicas_especiales?.length || 0;
    const calidadPrecio = Math.min(10, (chars / (prod.precio / 10000) * 3 + 4)).toFixed(1);
    const caracScore = Math.min(10, (chars * 1.2 + 1)).toFixed(1);
    const general = (pts / 10).toFixed(1);
    return [
      { label: 'Relación calidad-precio', value: calidadPrecio, color: parseFloat(calidadPrecio) >= 7 ? 'green' : parseFloat(calidadPrecio) >= 5 ? 'indigo' : 'amber' },
      { label: 'Características', value: caracScore, color: parseFloat(caracScore) >= 7 ? 'green' : parseFloat(caracScore) >= 5 ? 'indigo' : 'amber' },
      { label: 'Puntuación general', value: general, color: parseFloat(general) >= 7 ? 'green' : parseFloat(general) >= 5 ? 'indigo' : 'amber' },
    ];
  };

  if (compararList.length === 0) return (
    <div className="tq-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center py-5">
        <i className="bi bi-arrow-left-right tq-empty-icon"></i>
        <h2 className="mt-4 mb-3 tq-text-primary">Comparador de Productos</h2>
        <p className="mb-4 tq-text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
          Agrega hasta 4 productos desde cualquier categoría para compararlos lado a lado.
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link to="/" className="btn btn-lg tq-btn-primary px-4"><i className="bi bi-house me-2"></i>Ir al inicio</Link>
          <Link to="/busqueda-inteligente" className="btn btn-lg tq-btn-outline-indigo px-4"><i className="bi bi-stars me-2"></i>Búsqueda inteligente</Link>
        </div>
      </div>
    </div>
  );

  const todasLasPropiedades = new Set();
  compararList.forEach(p => Object.keys(p).forEach(k => {
    if (!['_id', 'id', 'imagen', 'caracteristicas_especiales', 'categoria', '__v', 'creadoPor', 'createdAt', 'updatedAt', 'disponible', 'calificacion', 'descripcion'].includes(k)) todasLasPropiedades.add(k);
  }));

  return (
    <div className="tq-page">
      <div className="container py-5">
        {/* Encabezado */}
        <div className="row align-items-center mb-4">
          <div className="col-md-8">
            <h1 className="mb-1 tq-text-primary">
              <i className="bi bi-arrow-left-right me-2 tq-text-indigo"></i>Comparación
            </h1>
            <p className="mb-0 tq-text-muted">Analiza especificaciones lado a lado</p>
          </div>
          <div className="col-md-4 text-md-end">
            <span className="badge me-2 tq-badge-indigo" style={{ fontSize: '14px', padding: '8px 14px' }}>
              {compararList.length} de 4
            </span>
            <button className="btn tq-btn-outline-red" onClick={handleClearAll}>
              <i className="bi bi-trash me-2"></i>Limpiar
            </button>
          </div>
        </div>

        {/* Tarjetas de producto */}
        <div className="row g-4">
          {compararList.map((producto) => {
            const pk = `${producto._id}-${producto.categoria}`;
            const pts = calcularPuntuacion(producto);
            const valoraciones = generarValoraciones(producto);

            return (
              <div key={pk} className="col-md-6 col-lg-3">
                <div className="tq-card h-100" style={{ overflow: 'hidden' }}>

                  {/* Imagen */}
                  <div className="position-relative">
                    {producto.imagen && !imagenesError[pk] ? (
                      <img src={producto.imagen} alt={producto.nombre} className="w-100 tq-product-img"
                        onError={() => setImagenesError(prev => ({ ...prev, [pk]: true }))} />
                    ) : (
                      <div className="tq-product-img-placeholder d-flex align-items-center justify-content-center">
                        <i className={`bi bi-${getCategoryIcon(producto.categoria)}`} style={{ fontSize: '56px' }}></i>
                      </div>
                    )}
                    <button className="btn btn-sm tq-remove-btn position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemove(producto._id, producto.categoria)}>
                      <i className="bi bi-x-lg" style={{ fontSize: '12px' }}></i>
                    </button>
                    <span className="badge tq-badge-cyan-solid position-absolute top-0 start-0 m-2">
                      {producto.categoria}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="card-body p-4">

                    {/* Nombre, marca, precio */}
                    <h6 className="tq-text-primary mb-2" style={{ fontSize: '15px', lineHeight: 1.4 }}>{producto.nombre}</h6>
                    <p className="mb-1 tq-text-muted" style={{ fontSize: '13px' }}>
                      <i className="bi bi-tag me-1"></i>{producto.marca}
                    </p>
                    <h4 className="mb-4 tq-text-price">{formatPrecio(producto.precio)}</h4>

                    {/* Puntuación */}
                    <div className="text-center mb-4 p-3 tq-spec-card">
                      <div className="tq-score-circle tq-score-circle--md d-inline-flex mx-auto mb-2">
                        <div className="text-white text-center">
                          <div className="tq-score-value tq-score-value--md">{pts}</div>
                          <div className="tq-score-label">Puntos</div>
                        </div>
                      </div>
                      <div className="tq-text-muted" style={{ fontSize: '12px' }}>Puntuación general</div>
                    </div>

                    {/* Valoraciones */}
                    <div className="mb-4">
                      <h6 className="tq-text-label mb-3" style={{ fontSize: '12px' }}>Valoraciones clave</h6>
                      {valoraciones.map((v, i) => (
                        <div key={i} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="tq-text-secondary" style={{ fontSize: '12px' }}>{v.label}</small>
                            <small className="tq-text-secondary fw-bold" style={{ fontSize: '12px' }}>{v.value}/10</small>
                          </div>
                          <div className="tq-progress-track">
                            <div className={`tq-progress-bar tq-progress-bar--${v.color}`} style={{ width: `${v.value * 10}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Especificaciones */}
                    <div className="mb-4">
                      <h6 className="tq-text-label mb-3" style={{ fontSize: '12px' }}>Especificaciones</h6>
                      {Array.from(todasLasPropiedades)
                        .filter(p => !['nombre', 'marca', 'precio'].includes(p))
                        .slice(0, 5)
                        .map((prop, i) => {
                          const val = producto[prop];
                          if (!val || typeof val === 'object') return (
                            <div key={i} className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--tq-border-subtle)' }}>
                              <small className="tq-text-dim d-block" style={{ fontSize: '11px' }}>{prop.replace(/_/g, ' ')}</small>
                              <div className="tq-text-dim" style={{ fontSize: '13px' }}>—</div>
                            </div>
                          );
                          return (
                            <div key={i} className="mb-3 pb-2" style={{ borderBottom: '1px solid var(--tq-border-subtle)' }}>
                              <small className="tq-text-label d-block" style={{ fontSize: '11px' }}>{prop.replace(/_/g, ' ')}</small>
                              <div className="tq-text-primary fw-medium" style={{ fontSize: '13px' }}>{val}</div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Características */}
                    {producto.caracteristicas_especiales?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="tq-text-label mb-3" style={{ fontSize: '12px' }}>Destacados</h6>
                        {producto.caracteristicas_especiales.slice(0, 4).map((c, i) => (
                          <div key={i} className="mb-2 d-flex align-items-start gap-2">
                            <i className="bi bi-check-circle-fill tq-text-green" style={{ fontSize: '13px', marginTop: '2px' }}></i>
                            <small className="tq-text-secondary" style={{ fontSize: '12px', lineHeight: 1.4 }}>{c}</small>
                          </div>
                        ))}
                        {producto.caracteristicas_especiales.length > 4 && (
                          <small className="tq-text-muted">+{producto.caracteristicas_especiales.length - 4} más</small>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pie */}
                  <div className="card-footer border-0 p-3">
                    <Link to={`/producto/${producto.categoria}/${producto._id}`} className="btn w-100 tq-btn-primary">
                      <i className="bi bi-eye me-2"></i>Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Espacios vacíos */}
          {[...Array(4 - compararList.length)].map((_, i) => (
            <div key={`empty-${i}`} className="col-md-6 col-lg-3">
              <div className="tq-compare-empty text-center">
                <i className="bi bi-plus-circle mb-3" style={{ fontSize: '48px', color: 'var(--tq-text-faint)' }}></i>
                <h6 className="tq-text-muted mb-2">Agregar producto</h6>
                <p className="small mb-3 tq-text-dim">Navega por categorías y agrega</p>
                <Link to="/" className="btn btn-sm tq-btn-outline-indigo">
                  <i className="bi bi-grid me-2"></i>Ver categorías
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Compare;