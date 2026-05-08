import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerProductoPorId, obtenerProductosPorCategoria } from '../Store/Slices/productosSlice';
import { agregarFavorito, quitarFavorito } from '../Store/Slices/favoritosSlice';
import { agregarAComparar } from '../Store/Slices/compararSlice';
import { toast } from 'react-toastify';

function ProductDetail() {
  const { categoria, id } = useParams();
  const dispatch = useDispatch();
  const { productoActual: producto, lista, loading, error } = useSelector((s) => s.productos);
  const { lista: favoritos } = useSelector((s) => s.favoritos);
  const { lista: compararLista } = useSelector((s) => s.comparar);
  const { usuario } = useSelector((s) => s.auth);
  const [imagenError, setImagenError] = useState(false);
  const [vistaActual, setVistaActual] = useState('resumen');

  useEffect(() => { dispatch(obtenerProductoPorId(id)); dispatch(obtenerProductosPorCategoria(categoria)); }, [id, categoria, dispatch]);

  const esFavorito = producto ? !!favoritos.find(p => p._id === producto._id) : false;

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0f172a' }}>
      <div className="text-center">
        <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#6366f1' }}></div>
        <p className="mt-3" style={{ color: '#64748b' }}>Cargando producto...</p>
      </div>
    </div>
  );

  if (error || !producto) return (
    <div className="container py-5">
      <div className="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '12px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error || 'Producto no encontrado'}
      </div>
      <Link to={`/categoria/${categoria}`} className="btn" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '10px' }}>
        <i className="bi bi-arrow-left me-2"></i>Volver
      </Link>
    </div>
  );

  const formatPrecio = (p) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(p);
  const getCategoryIcon = (c) => ({ celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' }[c] || 'device');
  const eliminarAcentos = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const calcularPuntuacion = (prod) => {
    let pts = 50;
    if (prod?.caracteristicas_especiales) pts += prod.caracteristicas_especiales.length * 3;
    if (prod?.precio > 20000) pts += 10; else if (prod?.precio > 10000) pts += 5;
    return Math.min(100, pts);
  };

  const generarValoraciones = () => {
    const v = [];
    if (categoria === 'celulares' || categoria === 'tablets') {
      v.push({ nombre: 'Pantalla', valor: producto.precio > 15000 ? 8.5 : 7 });
      v.push({ nombre: 'Rendimiento', valor: producto.precio > 20000 ? 9 : producto.precio > 10000 ? 7.5 : 6 });
      v.push({ nombre: 'Cámaras', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('camara')) ? 8.5 : 6.5 });
      v.push({ nombre: 'Batería', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bateria')) ? 8 : 6.5 });
      v.push({ nombre: 'Diseño', valor: producto.precio > 18000 ? 8.5 : 7 });
    } else if (categoria === 'monitores') {
      v.push({ nombre: 'Calidad imagen', valor: producto.precio > 8000 ? 8.5 : 7 }, { nombre: 'Conectividad', valor: 7.5 }, { nombre: 'Diseño', valor: producto.precio > 10000 ? 8 : 6.5 }, { nombre: 'Ergonomía', valor: 7 }, { nombre: 'Precio', valor: Math.max(2, 10 - (producto.precio / 5000)) });
    } else if (categoria === 'teclados' || categoria === 'ratones') {
      v.push({ nombre: 'Ergonomía', valor: producto.precio > 1500 ? 8 : 6.5 }, { nombre: 'Durabilidad', valor: producto.marca === 'Logitech' || producto.marca === 'Razer' ? 8.5 : 7 }, { nombre: 'Rendimiento', valor: producto.caracteristicas_especiales?.length > 3 ? 8 : 6.5 }, { nombre: 'Diseño', valor: producto.precio > 2000 ? 8 : 6.5 }, { nombre: 'Precio', valor: Math.max(2, 10 - (producto.precio / 1000)) });
    } else if (categoria === 'audifonos') {
      v.push({ nombre: 'Calidad audio', valor: producto.precio > 3000 ? 8.5 : 7 }, { nombre: 'Comodidad', valor: 7 }, { nombre: 'Batería', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bateria')) ? 8 : 6 }, { nombre: 'Conectividad', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bluetooth')) ? 8.5 : 6 }, { nombre: 'Diseño', valor: producto.precio > 4000 ? 8 : 6.5 });
    }
    return v;
  };

  const puntuacion = calcularPuntuacion(producto);
  const valoraciones = generarValoraciones();
  const promedio = valoraciones.length > 0 ? (valoraciones.reduce((s, v) => s + v.valor, 0) / valoraciones.length).toFixed(1) : '0';

  const generarPuntosRadar = (vals, size = 200, center = 100) => {
    const angle = (Math.PI * 2) / vals.length;
    return vals.map((v, i) => { const val = (v.valor / 10) * (size / 2); return `${center + val * Math.cos(angle * i - Math.PI / 2)},${center + val * Math.sin(angle * i - Math.PI / 2)}`; }).join(' ');
  };
  const generarPuntosMax = (n, size = 200, center = 100) => { const a = (Math.PI * 2) / n; return Array.from({ length: n }, (_, i) => ({ x: center + (size / 2) * Math.cos(a * i - Math.PI / 2), y: center + (size / 2) * Math.sin(a * i - Math.PI / 2) })); };

  const handleToggleFavorito = () => {
    if (!usuario) { toast.warning('Inicia sesión para guardar favoritos'); return; }
    if (esFavorito) { dispatch(quitarFavorito(producto._id)); toast.info('Eliminado de favoritos'); }
    else { dispatch(agregarFavorito({ ...producto, categoria })); toast.success('Agregado a favoritos'); }
  };
  const handleAgregarComparar = () => {
    if (compararLista.length >= 4) { toast.warning('Máximo 4 productos'); return; }
    if (compararLista.find(p => p._id === producto._id)) { toast.info('Ya está en comparación'); return; }
    dispatch(agregarAComparar({ ...producto, categoria })); toast.success('Agregado a comparación');
  };

  const similares = lista.filter(p => p._id !== producto._id && p.marca === producto.marca).slice(0, 3);
  const cardStyle = { borderRadius: '16px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.1)' };
  const headerStyle = { background: 'rgba(99,102,241,0.08)', border: 'none', borderRadius: '16px 16px 0 0' };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav className="mb-4"><ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Inicio</Link></li>
          <li className="breadcrumb-item"><Link to={`/categoria/${categoria}`} style={{ color: '#64748b', textDecoration: 'none' }}>{categoria}</Link></li>
          <li className="breadcrumb-item" style={{ color: '#94a3b8' }}>{producto.nombre}</li>
        </ol></nav>

        {/* Encabezado */}
        <div className="card border-0 mb-4" style={cardStyle}>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="mb-2" style={{ color: 'white', fontSize: '1.8rem' }}>{producto.nombre}</h1>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '13px' }}><i className="bi bi-tag me-1"></i>{producto.marca}</span>
              </div>
              <div className="col-md-4 text-md-end">
                <div style={{ color: '#64748b', fontSize: '13px' }}>Precio</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatPrecio(producto.precio)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[{ k: 'resumen', icon: 'card-list', label: 'RESUMEN' }, { k: 'specs', icon: 'cpu', label: 'ESPECIFICACIONES' }, { k: 'caracteristicas', icon: 'stars', label: 'CARACTERÍSTICAS' }].map(t => (
            <button key={t.k} className="btn" onClick={() => setVistaActual(t.k)}
              style={{ background: vistaActual === t.k ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.08)', color: vistaActual === t.k ? 'white' : '#818cf8', border: vistaActual === t.k ? 'none' : '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', fontWeight: 600, fontSize: '13px' }}>
              <i className={`bi bi-${t.icon} me-2`}></i>{t.label}
            </button>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card border-0 mb-4" style={cardStyle}>
              <div className="card-body p-0">
                {producto.imagen && !imagenError ? (
                  <img src={producto.imagen} alt={producto.nombre} className="img-fluid" style={{ height: '320px', width: '100%', objectFit: 'contain', background: '#0f172a', padding: '20px', borderRadius: '16px' }} onError={() => setImagenError(true)} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '320px', background: '#0f172a', borderRadius: '16px' }}>
                    <i className={`bi bi-${getCategoryIcon(categoria)}`} style={{ fontSize: '96px', color: '#334155' }}></i>
                  </div>
                )}
              </div>
            </div>
            <div className="d-grid gap-2 mb-4">
              <button className="btn" onClick={handleToggleFavorito} style={{ background: esFavorito ? '#ef4444' : 'rgba(239,68,68,0.1)', color: esFavorito ? 'white' : '#f87171', border: esFavorito ? 'none' : '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                <i className={`bi bi-heart${esFavorito ? '-fill' : ''} me-2`}></i>{esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </button>
              <button className="btn" onClick={handleAgregarComparar} style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '10px' }}>
                <i className="bi bi-plus-circle me-2"></i>Agregar a comparar
              </button>
            </div>
            <div className="card border-0" style={cardStyle}>
              <div className="card-body text-center py-4">
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>Puntuación General</div>
                <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <div className="text-white text-center"><div style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>{puntuacion}</div><div style={{ fontSize: '12px', opacity: 0.8 }}>PUNTOS</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {vistaActual === 'resumen' && valoraciones.length > 0 && (
              <>
                <div className="card border-0 mb-4" style={cardStyle}>
                  <div className="card-header border-0" style={headerStyle}><h5 className="mb-0" style={{ color: 'white' }}><i className="bi bi-diagram-3 me-2" style={{ color: '#818cf8' }}></i>Análisis Visual</h5></div>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <svg width="100%" height="250" viewBox="0 0 200 200" className="mx-auto d-block">
                          {[80, 60, 40, 20].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />)}
                          {generarPuntosMax(valoraciones.length).map((p, i) => <line key={i} x1="100" y1="100" x2={p.x} y2={p.y} stroke="rgba(99,102,241,0.15)" strokeWidth="1" />)}
                          <polygon points={generarPuntosRadar(valoraciones, 160, 100)} fill="rgba(99,102,241,0.25)" stroke="#6366f1" strokeWidth="2" />
                          {valoraciones.map((v, i) => { const a = (Math.PI * 2 * i) / valoraciones.length - Math.PI / 2; const s = (v.valor / 10) * 80; return <circle key={i} cx={100 + s * Math.cos(a)} cy={100 + s * Math.sin(a)} r="4" fill="#818cf8" />; })}
                          {valoraciones.map((v, i) => { const a = (Math.PI * 2 * i) / valoraciones.length - Math.PI / 2; return <text key={i} x={100 + 95 * Math.cos(a)} y={100 + 95 * Math.sin(a)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8">{v.nombre.toUpperCase()}</text>; })}
                        </svg>
                      </div>
                      <div className="col-md-6">
                        {valoraciones.map((v, i) => (
                          <div key={i} className="mb-3">
                            <div className="d-flex justify-content-between mb-1"><small style={{ color: '#94a3b8', fontWeight: 600 }}>{v.nombre}</small><small style={{ color: '#818cf8', fontWeight: 700 }}>{v.valor.toFixed(1)}/10</small></div>
                            <div style={{ height: '6px', background: 'rgba(99,102,241,0.1)', borderRadius: '3px' }}><div style={{ height: '100%', width: `${(v.valor / 10) * 100}%`, borderRadius: '3px', background: v.valor >= 8 ? 'linear-gradient(135deg, #10b981, #34d399)' : v.valor >= 6 ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 mb-4" style={cardStyle}>
                  <div className="card-header border-0" style={headerStyle}><h5 className="mb-0" style={{ color: 'white' }}><i className="bi bi-star me-2" style={{ color: '#f59e0b' }}></i>Puntuación: {promedio}/10</h5></div>
                  <div className="card-body">
                    <p style={{ color: '#64748b', fontSize: '14px' }}><i className="bi bi-info-circle me-1"></i>Calculada con base en especificaciones técnicas, características y precio.</p>
                  </div>
                </div>

                {producto.caracteristicas_especiales?.length > 0 && (
                  <div className="card border-0" style={cardStyle}>
                    <div className="card-header border-0" style={headerStyle}><h5 className="mb-0" style={{ color: 'white' }}><i className="bi bi-check-circle me-2" style={{ color: '#10b981' }}></i>Características Destacadas</h5></div>
                    <div className="card-body"><div className="row g-2">
                      {producto.caracteristicas_especiales.map((c, i) => (
                        <div key={i} className="col-md-6"><div className="p-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px' }}><i className="bi bi-check-lg me-2" style={{ color: '#34d399' }}></i><span style={{ color: '#94a3b8', fontSize: '14px' }}>{c}</span></div></div>
                      ))}
                    </div></div>
                  </div>
                )}
              </>
            )}

            {vistaActual === 'specs' && (
              <div className="card border-0" style={cardStyle}>
                <div className="card-header border-0" style={headerStyle}><h5 className="mb-0" style={{ color: 'white' }}><i className="bi bi-cpu me-2" style={{ color: '#818cf8' }}></i>Especificaciones Técnicas</h5></div>
                <div className="card-body"><div className="row g-3">
                  {Object.entries(producto).filter(([k, v]) => !['_id', 'id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales', 'categoria', '__v', 'creadoPor', 'createdAt', 'updatedAt'].includes(k) && typeof v !== 'object').map(([k, v], i) => (
                    <div key={i} className="col-md-6"><div className="p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px' }}>
                      <div style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{k.replace(/_/g, ' ')}</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{v}</div>
                    </div></div>
                  ))}
                </div></div>
              </div>
            )}

            {vistaActual === 'caracteristicas' && (
              <div className="card border-0" style={cardStyle}>
                <div className="card-header border-0" style={headerStyle}><h5 className="mb-0" style={{ color: 'white' }}><i className="bi bi-stars me-2" style={{ color: '#f59e0b' }}></i>Características Especiales</h5></div>
                <div className="card-body">
                  {producto.caracteristicas_especiales?.length > 0 ? producto.caracteristicas_especiales.map((c, i) => (
                    <div key={i} className="p-3 mb-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '10px' }}>
                      <i className="bi bi-check-circle-fill me-2" style={{ color: '#34d399' }}></i><span style={{ color: 'white', fontWeight: 600 }}>{c}</span>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>Sin características especiales registradas.</p>}
                </div>
              </div>
            )}

            <div className="mt-4 d-grid gap-2">
              <Link to={`/categoria/${categoria}`} className="btn btn-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                <i className="bi bi-arrow-left me-2"></i>Volver a {categoria}
              </Link>
              <Link to="/comparar" className="btn btn-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '12px', border: 'none' }}>
                <i className="bi bi-arrow-left-right me-2"></i>Comparar con otros
              </Link>
            </div>
          </div>
        </div>

        {/* Similares */}
        {similares.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-4" style={{ color: 'white' }}><i className="bi bi-grid me-2" style={{ color: '#818cf8' }}></i>Productos Similares de {producto.marca}</h3>
            <div className="row">
              {similares.map(p => (
                <div key={p._id} className="col-md-4 mb-3">
                  <div className="card border-0" style={cardStyle}>
                    <div className="card-body">
                      <h6 style={{ color: 'white' }} className="mb-3">{p.nombre}</h6>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrecio(p.precio)}</span>
                        <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{calcularPuntuacion(p)} pts</span>
                      </div>
                      <Link to={`/producto/${categoria}/${p._id}`} className="btn btn-sm w-100" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px' }}>
                        <i className="bi bi-eye me-2"></i>Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
