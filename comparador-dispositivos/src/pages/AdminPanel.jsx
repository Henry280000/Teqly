import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerTodosAdmin, obtenerEstadisticas, crearProducto, actualizarProducto, eliminarProducto } from '../Store/Slices/adminSlice';
import { toast } from 'react-toastify';

const CATEGORIAS = ['celulares', 'tablets', 'monitores', 'teclados', 'ratones', 'audifonos'];

const CAMPOS_POR_CATEGORIA = {
  celulares: ['sistema_operativo', 'procesador', 'ram', 'almacenamiento', 'pantalla', 'camara', 'bateria'],
  tablets: ['sistema_operativo', 'procesador', 'ram', 'almacenamiento', 'pantalla', 'camara', 'bateria'],
  monitores: ['resolucion', 'tamaño_pantalla', 'panel_type', 'tasa_refresco', 'tiempo_respuesta'],
  teclados: ['tipo', 'conexion', 'iluminacion', 'idioma'],
  ratones: ['sensor', 'dpi', 'conexion', 'ergonomia', 'botones'],
  audifonos: ['tipo', 'conexion', 'conductores', 'impedancia', 'rango_frecuencia', 'noise_cancellation'],
};

const LABELS = {
  sistema_operativo: 'Sistema Operativo', procesador: 'Procesador', ram: 'RAM',
  almacenamiento: 'Almacenamiento', pantalla: 'Pantalla', camara: 'Cámara',
  bateria: 'Batería', resolucion: 'Resolución', tamaño_pantalla: 'Tamaño Pantalla',
  panel_type: 'Tipo de Panel', tasa_refresco: 'Tasa de Refresco', tiempo_respuesta: 'Tiempo de Respuesta',
  tipo: 'Tipo', conexion: 'Conexión', iluminacion: 'Iluminación', idioma: 'Idioma',
  sensor: 'Sensor', dpi: 'DPI', ergonomia: 'Ergonomía', botones: 'Botones',
  conductores: 'Conductores', impedancia: 'Impedancia', rango_frecuencia: 'Rango de Frecuencia',
  noise_cancellation: 'Cancelación de Ruido',
};

const FORM_VACIO = {
  categoria: 'celulares', nombre: '', marca: '', precio: '', imagen: '', descripcion: '',
  calificacion: '', caracteristicas_especiales: '',
};

function AdminPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { usuario } = useSelector((s) => s.auth);
  const { productos, estadisticas, loading, operacionLoading } = useSelector((s) => s.admin);

  const [vista, setVista] = useState('dashboard');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'admin') {
      navigate('/');
      toast.error('Acceso denegado');
      return;
    }
    dispatch(obtenerEstadisticas());
    dispatch(obtenerTodosAdmin({}));
  }, [dispatch, usuario, navigate]);

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    const coincideBusqueda = !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.marca?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm({ ...FORM_VACIO });
    setModalAbierto(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto._id);
    setForm({
      categoria: producto.categoria || 'celulares',
      nombre: producto.nombre || '',
      marca: producto.marca || '',
      precio: producto.precio || '',
      imagen: producto.imagen || '',
      descripcion: producto.descripcion || '',
      calificacion: producto.calificacion || '',
      caracteristicas_especiales: (producto.caracteristicas_especiales || []).join(', '),
      ...Object.fromEntries(
        (CAMPOS_POR_CATEGORIA[producto.categoria] || []).map((c) => [c, producto[c] || ''])
      ),
    });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = { ...form, precio: Number(form.precio), calificacion: Number(form.calificacion) || 0 };
    if (form.caracteristicas_especiales) {
      datos.caracteristicas_especiales = form.caracteristicas_especiales.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      datos.caracteristicas_especiales = [];
    }
    // Limpiar campos vacíos
    Object.keys(datos).forEach((k) => { if (datos[k] === '') delete datos[k]; });

    try {
      if (editando) {
        await dispatch(actualizarProducto({ id: editando, datos })).unwrap();
        toast.success('Producto actualizado');
      } else {
        await dispatch(crearProducto(datos)).unwrap();
        toast.success('Producto creado');
      }
      setModalAbierto(false);
      dispatch(obtenerEstadisticas());
    } catch (err) {
      toast.error(err || 'Error en la operación');
    }
  };

  const handleEliminar = async (id) => {
    try {
      await dispatch(eliminarProducto(id)).unwrap();
      toast.success('Producto eliminado');
      setConfirmarEliminar(null);
      dispatch(obtenerEstadisticas());
    } catch (err) {
      toast.error(err || 'Error al eliminar');
    }
  };

  const totalProductos = estadisticas.reduce((a, s) => a + s.total, 0);

  const camposCategoria = CAMPOS_POR_CATEGORIA[form.categoria] || [];

  return (
    <div className="tq-page" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--tq-text-primary)' }}>
              <i className="bi bi-gear-fill me-2" style={{ color: 'var(--tq-indigo)' }}></i>
              Panel de Administración
            </h2>
            <p className="mb-0" style={{ color: 'var(--tq-text-muted)', fontSize: '14px' }}>
              Gestiona los productos del catálogo de Teqly
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className={`btn btn-sm ${vista === 'dashboard' ? 'tq-btn-primary' : 'tq-btn-outline-indigo'}`} onClick={() => setVista('dashboard')}>
              <i className="bi bi-grid-1x2 me-1"></i>Dashboard
            </button>
            <button className={`btn btn-sm ${vista === 'productos' ? 'tq-btn-primary' : 'tq-btn-outline-indigo'}`} onClick={() => setVista('productos')}>
              <i className="bi bi-box-seam me-1"></i>Productos
            </button>
          </div>
        </div>

        {/* Dashboard */}
        {vista === 'dashboard' && (
          <div>
            {/* Stats cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="tq-card p-3 text-center">
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--tq-indigo-light)' }}>{totalProductos}</div>
                  <div style={{ color: 'var(--tq-text-muted)', fontSize: '13px' }}>Total Productos</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tq-card p-3 text-center">
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--tq-cyan)' }}>{estadisticas.length}</div>
                  <div style={{ color: 'var(--tq-text-muted)', fontSize: '13px' }}>Categorías Activas</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tq-card p-3 text-center">
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--tq-green)' }}>
                    ${estadisticas.length > 0 ? Math.round(estadisticas.reduce((a, s) => a + s.precioPromedio, 0) / estadisticas.length).toLocaleString() : 0}
                  </div>
                  <div style={{ color: 'var(--tq-text-muted)', fontSize: '13px' }}>Precio Promedio</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tq-card p-3 text-center">
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--tq-amber)' }}>
                    ${estadisticas.length > 0 ? Math.max(...estadisticas.map(s => s.precioMax)).toLocaleString() : 0}
                  </div>
                  <div style={{ color: 'var(--tq-text-muted)', fontSize: '13px' }}>Precio Máximo</div>
                </div>
              </div>
            </div>

            {/* Stats por categoría */}
            <h5 className="fw-bold mb-3" style={{ color: 'var(--tq-text-primary)' }}>Productos por Categoría</h5>
            <div className="row g-3">
              {estadisticas.map((stat) => (
                <div key={stat._id} className="col-md-4">
                  <div className="tq-card p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-capitalize" style={{ color: 'var(--tq-text-primary)' }}>{stat._id}</span>
                      <span className="badge tq-badge-indigo">{stat.total}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '12px', color: 'var(--tq-text-muted)' }}>
                      <span>Min: ${stat.precioMin?.toLocaleString()}</span>
                      <span>Prom: ${Math.round(stat.precioPromedio).toLocaleString()}</span>
                      <span>Max: ${stat.precioMax?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos */}
        {vista === 'productos' && (
          <div>
            {/* Toolbar */}
            <div className="tq-card p-3 mb-4">
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <input type="text" className="form-control form-control-sm tq-input" placeholder="Buscar por nombre o marca..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ maxWidth: '280px' }} />
                <select className="form-select form-select-sm tq-input" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ maxWidth: '180px' }}>
                  <option value="">Todas las categorías</option>
                  {CATEGORIAS.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
                </select>
                <div className="ms-auto">
                  <button className="btn btn-sm tq-btn-primary" onClick={abrirCrear}>
                    <i className="bi bi-plus-lg me-1"></i>Nuevo Producto
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla */}
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--tq-indigo)' }}></div></div>
            ) : (
              <div className="tq-card" style={{ overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ color: 'var(--tq-text-secondary)' }}>
                    <thead>
                      <tr style={{ background: 'var(--tq-bg-base)', borderBottom: '1px solid var(--tq-border-accent)' }}>
                        <th style={{ color: 'var(--tq-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px 16px' }}>Producto</th>
                        <th style={{ color: 'var(--tq-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px 16px' }}>Categoría</th>
                        <th style={{ color: 'var(--tq-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px 16px' }}>Marca</th>
                        <th style={{ color: 'var(--tq-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px 16px' }}>Precio</th>
                        <th style={{ color: 'var(--tq-text-muted)', fontSize: '11px', textTransform: 'uppercase', padding: '12px 16px', width: '120px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid var(--tq-border-subtle)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="d-flex align-items-center gap-2">
                              {p.imagen ? (
                                <img src={p.imagen} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: 'var(--tq-bg-base)' }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--tq-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bi bi-image" style={{ color: 'var(--tq-text-faint)', fontSize: 14 }}></i>
                                </div>
                              )}
                              <span className="fw-semibold" style={{ color: 'var(--tq-text-primary)', fontSize: '13px' }}>{p.nombre}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge tq-badge-indigo text-capitalize">{p.categoria}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.marca}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--tq-green)', fontWeight: 600 }}>${p.precio?.toLocaleString()} MXN</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm tq-btn-outline-indigo" onClick={() => abrirEditar(p)} style={{ padding: '4px 8px', fontSize: '12px' }} title="Editar">
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm" onClick={() => setConfirmarEliminar(p._id)} style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--tq-red-light)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--tq-radius-sm)' }} title="Eliminar">
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {productosFiltrados.length === 0 && (
                  <div className="text-center py-5" style={{ color: 'var(--tq-text-muted)' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '48px', color: 'var(--tq-text-faint)' }}></i>
                    <p className="mt-2">No se encontraron productos</p>
                  </div>
                )}
                <div className="px-3 py-2" style={{ borderTop: '1px solid var(--tq-border-subtle)', fontSize: '12px', color: 'var(--tq-text-muted)' }}>
                  {productosFiltrados.length} de {productos.length} productos
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setModalAbierto(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}></div>
          <div className="tq-card" style={{ position: 'relative', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', padding: '24px', boxShadow: 'var(--tq-shadow-modal)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--tq-text-primary)' }}>
                <i className={`bi bi-${editando ? 'pencil-square' : 'plus-circle'} me-2`} style={{ color: 'var(--tq-indigo)' }}></i>
                {editando ? 'Editar Producto' : 'Nuevo Producto'}
              </h5>
              <button className="btn btn-sm" onClick={() => setModalAbierto(false)} style={{ color: 'var(--tq-text-muted)' }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Campos base */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Categoría *</label>
                  <select className="form-select form-select-sm tq-input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                    {CATEGORIAS.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Marca *</label>
                  <input type="text" className="form-control form-control-sm tq-input" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} required placeholder="Ej: Samsung" />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Nombre *</label>
                  <input type="text" className="form-control form-control-sm tq-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: Galaxy S24 Ultra" />
                </div>
                <div className="col-md-4">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Precio (MXN) *</label>
                  <input type="number" className="form-control form-control-sm tq-input" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required placeholder="0" />
                </div>
                <div className="col-md-4">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Calificación (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" className="form-control form-control-sm tq-input" value={form.calificacion} onChange={(e) => setForm({ ...form, calificacion: e.target.value })} placeholder="4.5" />
                </div>
                <div className="col-md-4">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>URL Imagen</label>
                  <input type="text" className="form-control form-control-sm tq-input" value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="https://..." />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Descripción</label>
                  <textarea className="form-control form-control-sm tq-input" rows="2" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del producto..."></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>Características especiales (separadas por coma)</label>
                  <input type="text" className="form-control form-control-sm tq-input" value={form.caracteristicas_especiales} onChange={(e) => setForm({ ...form, caracteristicas_especiales: e.target.value })} placeholder="5G, NFC, IP68, ..." />
                </div>
              </div>

              {/* Campos específicos por categoría */}
              {camposCategoria.length > 0 && (
                <>
                  <hr style={{ borderColor: 'var(--tq-border-subtle)' }} />
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--tq-text-secondary)', fontSize: '13px' }}>
                    <i className="bi bi-sliders me-1"></i>Especificaciones — {form.categoria}
                  </h6>
                  <div className="row g-3">
                    {camposCategoria.map((campo) => (
                      <div className="col-md-6" key={campo}>
                        <label className="form-label" style={{ color: 'var(--tq-text-muted)', fontSize: '12px' }}>{LABELS[campo] || campo}</label>
                        <input type="text" className="form-control form-control-sm tq-input" value={form[campo] || ''} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} placeholder={LABELS[campo] || campo} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Botones */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-sm tq-btn-outline-indigo" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-sm tq-btn-primary" disabled={operacionLoading}>
                  {operacionLoading ? (<><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>) : (<><i className={`bi bi-${editando ? 'check-lg' : 'plus-lg'} me-1`}></i>{editando ? 'Actualizar' : 'Crear Producto'}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {confirmarEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmarEliminar(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}></div>
          <div className="tq-card" style={{ position: 'relative', width: '90%', maxWidth: '400px', padding: '24px', boxShadow: 'var(--tq-shadow-modal)', textAlign: 'center' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '48px', color: 'var(--tq-amber)' }}></i>
            <h5 className="fw-bold mt-3" style={{ color: 'var(--tq-text-primary)' }}>¿Eliminar producto?</h5>
            <p style={{ color: 'var(--tq-text-muted)', fontSize: '14px' }}>Esta acción no se puede deshacer.</p>
            <div className="d-flex gap-2 justify-content-center mt-3">
              <button className="btn btn-sm tq-btn-outline-indigo" onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
              <button className="btn btn-sm" onClick={() => handleEliminar(confirmarEliminar)} disabled={operacionLoading} style={{ background: 'var(--tq-red)', color: 'white', border: 'none', borderRadius: 'var(--tq-radius-md)', padding: '6px 16px' }}>
                {operacionLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
