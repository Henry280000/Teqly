import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { agregarAComparar } from '../Store/Slices/compararSlice';
import { agregarFavorito, quitarFavorito } from '../Store/Slices/favoritosSlice';
import { toast } from 'react-toastify';
import api from '../Services/api';

function SmartSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista: comparar } = useSelector((s) => s.comparar);
  const { lista: favoritos } = useSelector((s) => s.favoritos);
  const { usuario } = useSelector((s) => s.auth);

  const [filtros, setFiltros] = useState({ categoria: '', presupuestoMin: '', presupuestoMax: '', marca: '', busqueda: '' });
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (filtros.categoria) api.get(`/smart/marcas/${filtros.categoria}`).then(r => setMarcasDisponibles(r.data.data)).catch(() => setMarcasDisponibles([]));
    else setMarcasDisponibles([]);
  }, [filtros.categoria]);

  const handleChange = (e) => setFiltros(p => ({ ...p, [e.target.name]: e.target.value }));

  const buscar = async (e) => {
    e.preventDefault();
    if (!filtros.categoria) { toast.warning('Selecciona una categoría'); return; }
    setLoading(true);
    setImgErrors({});
    try {
      const params = new URLSearchParams();
      params.append('categoria', filtros.categoria);
      if (filtros.presupuestoMin) params.append('presupuestoMin', filtros.presupuestoMin);
      if (filtros.presupuestoMax) params.append('presupuestoMax', filtros.presupuestoMax);
      if (filtros.marca) params.append('marca', filtros.marca);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      const res = await api.get(`/smart/buscar?${params.toString()}`);
      setResultados(res.data.data);
      setMostrarResultados(true);
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al buscar'); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setFiltros({ categoria: '', presupuestoMin: '', presupuestoMax: '', marca: '', busqueda: '' }); setResultados([]); setMostrarResultados(false); setMarcasDisponibles([]); setImgErrors({}); };

  const handleAgregarComparar = (producto) => {
    if (comparar.length >= 4) { toast.warning('Máximo 4 productos'); return; }
    if (comparar.find(p => p._id === producto._id && p.categoria === filtros.categoria)) { toast.info('Ya está en comparación'); return; }
    dispatch(agregarAComparar({ ...producto, categoria: filtros.categoria }));
    toast.success('Agregado a comparación');
  };

  const handleToggleFavorito = (producto) => {
    if (!usuario) { toast.warning('Inicia sesión para guardar favoritos'); navigate('/login'); return; }
    const esFav = favoritos.find(p => p._id === producto._id);
    if (esFav) { dispatch(quitarFavorito(producto._id)); toast.info('Eliminado de favoritos'); }
    else { dispatch(agregarFavorito({ ...producto, categoria: filtros.categoria })); toast.success('Agregado a favoritos'); }
  };

  const getCategoryIcon = (c) => ({ celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' }[c] || 'device');
  const formatPrecio = (p) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(p);

  const categoriasInfo = [
    { value: 'celulares', icon: 'phone', label: 'Celulares' },
    { value: 'tablets', icon: 'tablet', label: 'Tablets' },
    { value: 'monitores', icon: 'display', label: 'Monitores' },
    { value: 'teclados', icon: 'keyboard', label: 'Teclados' },
    { value: 'ratones', icon: 'mouse', label: 'Ratones' },
    { value: 'audifonos', icon: 'headphones', label: 'Audífonos' },
  ];

  const rankMedals = ['bi-trophy-fill', 'bi-award-fill', 'bi-gem', 'bi-star-fill', 'bi-star-fill'];
  const rankLabels = ['Mejor opción', '2do lugar', '3er lugar', '4to lugar', '5to lugar'];
  const rankAccents = ['#f59e0b', '#94a3b8', '#cd7f32', '#6366f1', '#6366f1'];

  // ---- Vista de resultados ----
  if (mostrarResultados) {
    return (
      <div className="tq-page">
        <div className="container py-5">
          {/* Encabezado */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1 tq-text-primary">
                <i className="bi bi-stars me-2 tq-text-indigo"></i>Top {resultados.length} Recomendaciones
              </h2>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <span className="badge tq-badge-indigo">{filtros.categoria}</span>
                {filtros.presupuestoMin && <span className="badge tq-badge-cyan">Desde {formatPrecio(filtros.presupuestoMin)}</span>}
                {filtros.presupuestoMax && <span className="badge tq-badge-cyan">Hasta {formatPrecio(filtros.presupuestoMax)}</span>}
                {filtros.marca && <span className="badge tq-badge-indigo">{filtros.marca}</span>}
                {filtros.busqueda && <span className="badge tq-badge-amber">{filtros.busqueda}</span>}
              </div>
            </div>
            <button className="btn tq-btn-outline-indigo" onClick={handleReset}>
              <i className="bi bi-arrow-clockwise me-2"></i>Nueva búsqueda
            </button>
          </div>

          {resultados.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search tq-empty-icon"></i>
              <h3 className="mt-4 tq-text-primary">Sin resultados</h3>
              <p className="tq-text-muted">No se encontraron productos con esos criterios. Intenta ajustar los filtros.</p>
              <button className="btn tq-btn-primary btn-lg mt-2" onClick={handleReset}><i className="bi bi-arrow-clockwise me-2"></i>Intentar de nuevo</button>
            </div>
          ) : (
            <div className="row g-4">
              {resultados.map((producto, index) => {
                const esFav = !!favoritos.find(p => p._id === producto._id);
                const isTop = index === 0;
                const accentColor = rankAccents[index] || '#6366f1';

                return (
                  <div key={producto._id} className={isTop ? 'col-12' : 'col-12 col-lg-6'}>
                    <div className="card border-0 tq-card tq-card--hover h-100" style={{ overflow: 'hidden' }}>
                      {/* Franja de rango */}
                      <div style={{ height: '4px', background: `linear-gradient(90deg, ${accentColor}, transparent)` }}></div>

                      <div className="card-body p-4">
                        <div className={isTop ? 'row g-4 align-items-center' : ''}>
                          {/* Imagen */}
                          <div className={isTop ? 'col-md-3 text-center' : 'text-center mb-3'}>
                            <div className="position-relative d-inline-block">
                              {/* Insignia de rango */}
                              <div className="position-absolute d-flex align-items-center justify-content-center"
                                style={{ top: -8, left: -8, width: 40, height: 40, borderRadius: '50%', background: accentColor, zIndex: 2, boxShadow: `0 0 12px ${accentColor}50` }}>
                                <i className={`bi ${rankMedals[index]} text-white`} style={{ fontSize: '18px' }}></i>
                              </div>
                              {producto.imagen && !imgErrors[producto._id] ? (
                                <img src={producto.imagen} alt={producto.nombre} className="rounded-3"
                                  style={{ height: isTop ? '200px' : '140px', width: isTop ? '200px' : '140px', objectFit: 'contain', background: 'var(--tq-bg-base)', padding: '12px' }}
                                  onError={() => setImgErrors(p => ({ ...p, [producto._id]: true }))} />
                              ) : (
                                <div className="rounded-3 d-flex align-items-center justify-content-center"
                                  style={{ height: isTop ? '200px' : '140px', width: isTop ? '200px' : '140px', background: 'var(--tq-bg-base)' }}>
                                  <i className={`bi bi-${getCategoryIcon(filtros.categoria)} tq-text-faint`} style={{ fontSize: isTop ? '64px' : '48px' }}></i>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className={isTop ? 'col-md-9' : ''}>
                            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                              <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className="fw-bold" style={{ color: accentColor, fontSize: '13px' }}>{rankLabels[index]}</span>
                                  {isTop && <span className="badge tq-badge-green" style={{ fontSize: '10px' }}>RECOMENDADO</span>}
                                </div>
                                <h5 className={`fw-bold mb-1 tq-text-primary ${isTop ? 'fs-4' : ''}`}>{producto.nombre}</h5>
                                <span className="badge tq-badge-indigo">{producto.marca}</span>
                              </div>
                              <div className="text-end">
                                <div className="tq-text-muted" style={{ fontSize: '11px' }}>PRECIO</div>
                                <div className={`tq-text-indigo fw-bold ${isTop ? 'fs-4' : 'fs-5'}`}>{formatPrecio(producto.precio)}</div>
                                {producto.score > 0 && (
                                  <div className="tq-text-muted mt-1" style={{ fontSize: '11px' }}>
                                    Score: <strong className="tq-text-indigo">{producto.score.toFixed(1)}</strong>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Especificaciones */}
                            <div className={`row g-2 mb-3 ${isTop ? '' : 'mt-2'}`}>
                              {Object.entries(producto)
                                .filter(([k, v]) => !['_id', 'id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales', 'categoria', '__v', 'creadoPor', 'createdAt', 'updatedAt', 'score', 'id_original', 'calificacion', 'disponible', 'descripcion'].includes(k) && typeof v === 'string')
                                .slice(0, isTop ? 6 : 3)
                                .map(([k, v], i) => (
                                  <div key={i} className={isTop ? 'col-md-4 col-6' : 'col-6'}>
                                    <div className="tq-spec-card p-2">
                                      <div className="tq-text-label" style={{ fontSize: '10px' }}>{k.replace(/_/g, ' ')}</div>
                                      <div className="tq-text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>{v}</div>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Características */}
                            {producto.caracteristicas_especiales?.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mb-3">
                                {producto.caracteristicas_especiales.slice(0, isTop ? 6 : 3).map((c, i) => (
                                  <span key={i} className="badge tq-badge-green"><i className="bi bi-check2 me-1"></i>{c}</span>
                                ))}
                                {producto.caracteristicas_especiales.length > (isTop ? 6 : 3) && (
                                  <span className="badge tq-badge-indigo" style={{ fontSize: '10px' }}>+{producto.caracteristicas_especiales.length - (isTop ? 6 : 3)}</span>
                                )}
                              </div>
                            )}

                            {/* Acciones */}
                            <div className="d-flex gap-2 flex-wrap">
                              <Link to={`/producto/${filtros.categoria}/${producto._id}`} className={`btn ${isTop ? '' : 'btn-sm'} tq-btn-primary`}>
                                <i className="bi bi-eye me-2"></i>Ver detalles
                              </Link>
                              <button className={`btn ${isTop ? '' : 'btn-sm'} tq-btn-outline-cyan`} onClick={() => handleAgregarComparar(producto)}>
                                <i className="bi bi-plus-circle me-2"></i>Comparar
                              </button>
                              <button className={`btn ${isTop ? '' : 'btn-sm'}`} onClick={() => handleToggleFavorito(producto)}
                                style={{ background: esFav ? 'var(--tq-red)' : 'rgba(239,68,68,0.1)', color: esFav ? 'white' : 'var(--tq-red-light)', border: esFav ? 'none' : '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--tq-radius-sm)' }}>
                                <i className={`bi bi-heart${esFav ? '-fill' : ''} me-2`}></i>{esFav ? 'Guardado' : 'Favorito'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-5">
            <button className="btn btn-lg tq-btn-outline-indigo" onClick={handleReset}>
              <i className="bi bi-arrow-clockwise me-2"></i>Nueva búsqueda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Vista del formulario ----
  return (
    <div className="tq-page">
      {/* Encabezado hero */}
      <div className="tq-hero" style={{ padding: '50px 0 40px' }}>
        <div className="tq-page-bg-glow tq-page-bg-glow--hero"></div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="text-center">
            <div className="mb-3">
              <div className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 72, height: 72, borderRadius: '20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <i className="bi bi-stars tq-text-indigo" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
            <h1 className="fw-bold mb-2 tq-hero-title" style={{ fontSize: '2.4rem' }}>Búsqueda Inteligente</h1>
            <p className="tq-hero-subtitle mx-auto text-center" style={{ maxWidth: '600px' }}>
              Nuestro algoritmo analiza precio, especificaciones y características para encontrar las <strong className="tq-text-indigo">5 mejores opciones</strong> según tus necesidades.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-30px', position: 'relative', zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 tq-card--auth" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4 p-md-5">
                <form onSubmit={buscar}>
                  {/* Paso 1 — Categoría */}
                  <div className="mb-4">
                    <label className="form-label fw-bold tq-text-secondary mb-3">
                      <span className="badge me-2 tq-badge-count" style={{ fontSize: '11px' }}>1</span>
                      Tipo de dispositivo <span className="tq-text-red">*</span>
                    </label>
                    <div className="row g-2">
                      {categoriasInfo.map(cat => (
                        <div key={cat.value} className="col-4 col-md-2">
                          <div className={`text-center p-3 rounded-3 cursor-pointer`}
                            style={{
                              background: filtros.categoria === cat.value ? 'rgba(99,102,241,0.2)' : 'var(--tq-bg-base)',
                              border: filtros.categoria === cat.value ? '2px solid var(--tq-indigo)' : '1px solid var(--tq-border-input)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              borderRadius: '12px',
                            }}
                            onClick={() => setFiltros(p => ({ ...p, categoria: cat.value, marca: '' }))}>
                            <i className={`bi bi-${cat.icon} d-block mb-1`}
                              style={{ fontSize: '24px', color: filtros.categoria === cat.value ? 'var(--tq-indigo-light)' : 'var(--tq-text-faint)' }}></i>
                            <small style={{
                              fontSize: '11px', fontWeight: 600,
                              color: filtros.categoria === cat.value ? 'var(--tq-indigo-light)' : 'var(--tq-text-muted)'
                            }}>{cat.label}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Paso 2 — Presupuesto */}
                  <div className="mb-4">
                    <label className="form-label fw-bold tq-text-secondary">
                      <span className="badge me-2 tq-badge-count" style={{ fontSize: '11px' }}>2</span>
                      Presupuesto <span className="tq-text-muted fw-normal">(opcional)</span>
                    </label>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="input-group">
                          <span className="input-group-text tq-input-icon">$</span>
                          <input type="number" className="form-control tq-input" name="presupuestoMin" placeholder="Mínimo" value={filtros.presupuestoMin} onChange={handleChange} min="0" />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="input-group">
                          <span className="input-group-text tq-input-icon">$</span>
                          <input type="number" className="form-control tq-input" name="presupuestoMax" placeholder="Máximo" value={filtros.presupuestoMax} onChange={handleChange} min="0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paso 3 — Marca */}
                  {filtros.categoria && marcasDisponibles.length > 0 && (
                    <div className="mb-4">
                      <label className="form-label fw-bold tq-text-secondary">
                        <span className="badge me-2 tq-badge-count" style={{ fontSize: '11px' }}>3</span>
                        Marca preferida <span className="tq-text-muted fw-normal">(opcional)</span>
                      </label>
                      <select className="form-select tq-select" name="marca" value={filtros.marca} onChange={handleChange}>
                        <option value="">Todas las marcas</option>
                        {marcasDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Paso 4 — Palabras clave */}
                  <div className="mb-4">
                    <label className="form-label fw-bold tq-text-secondary">
                      <span className="badge me-2 tq-badge-count" style={{ fontSize: '11px' }}>4</span>
                      Palabras clave <span className="tq-text-muted fw-normal">(opcional)</span>
                    </label>
                    <input type="text" className="form-control tq-input" name="busqueda" placeholder="Ej: gaming, batería, cámara..." value={filtros.busqueda} onChange={handleChange} />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {['gaming', 'fotografía', 'batería', 'USB-C', 'inalámbrico', 'profesional'].map(tag => (
                        <span key={tag} className={`badge ${filtros.busqueda === tag ? 'tq-badge-count' : 'tq-badge-tag'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setFiltros(p => ({ ...p, busqueda: p.busqueda === tag ? '' : tag }))}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="tq-dropdown-divider my-4" />

                  {/* Enviar */}
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-lg tq-btn-primary py-3" disabled={loading || !filtros.categoria}>
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Analizando productos...</>
                      ) : (
                        <><i className="bi bi-stars me-2"></i>Encontrar las 5 mejores opciones</>
                      )}
                    </button>
                    {(filtros.categoria || filtros.presupuestoMin || filtros.presupuestoMax || filtros.marca || filtros.busqueda) && (
                      <button type="button" className="btn tq-btn-outline-indigo" onClick={handleReset}>
                        <i className="bi bi-x-circle me-2"></i>Limpiar todo
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador */}
      <div style={{ height: '60px' }}></div>
    </div>
  );
}

export default SmartSearch;