import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerProductosPorCategoria } from '../Store/Slices/productosSlice';
import { agregarAComparar } from '../Store/Slices/compararSlice';
import { agregarFavorito, quitarFavorito } from '../Store/Slices/favoritosSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { toast } from 'react-toastify';

function ProductList() {
  const { categoria } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista, loading, error } = useSelector((s) => s.productos);
  const { lista: compararLista } = useSelector((s) => s.comparar);
  const { lista: favoritos } = useSelector((s) => s.favoritos);
  const { usuario } = useSelector((s) => s.auth);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({ precioMin: 0, precioMax: Infinity, marca: '', ordenamiento: 'nombre', filtrosEspecificos: {} });

  useEffect(() => { if (categoria) { dispatch(obtenerProductosPorCategoria(categoria)); setBusqueda(''); } }, [categoria, dispatch]);

  useEffect(() => {
    if (!lista.length) return;
    let r = [...lista];
    r = r.filter(p => p.precio >= filtros.precioMin && p.precio <= filtros.precioMax);
    if (filtros.marca) r = r.filter(p => p.marca === filtros.marca);
    if (filtros.filtrosEspecificos) Object.entries(filtros.filtrosEspecificos).forEach(([a, v]) => { r = r.filter(p => p[a] === v); });
    if (busqueda) { const s = busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); r = r.filter(p => p.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(s) || p.marca.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(s)); }
    switch (filtros.ordenamiento) { case 'precio_asc': r.sort((a, b) => a.precio - b.precio); break; case 'precio_desc': r.sort((a, b) => b.precio - a.precio); break; case 'marca': r.sort((a, b) => a.marca.localeCompare(b.marca)); break; default: r.sort((a, b) => a.nombre.localeCompare(b.nombre)); }
    setProductosFiltrados(r);
  }, [busqueda, lista, filtros]);

  const handleAddToCompare = (p) => {
    if (compararLista.length >= 4) { toast.warning('Solo puedes comparar hasta 4 productos'); return; }
    if (compararLista.find(x => x._id === p._id && x.categoria === categoria)) { toast.info('Ya está en la comparación'); return; }
    dispatch(agregarAComparar({ ...p, categoria })); toast.success('Agregado a comparación');
  };
  const handleToggleFav = (p) => {
    if (!usuario) { toast.warning('Inicia sesión para guardar favoritos'); navigate('/login'); return; }
    const fav = favoritos.find(x => x._id === p._id);
    if (fav) { dispatch(quitarFavorito(p._id)); toast.info('Eliminado de favoritos'); } else { dispatch(agregarFavorito({ ...p, categoria })); toast.success('Agregado a favoritos'); }
  };

  const titles = { celulares: 'Celulares', tablets: 'Tablets', monitores: 'Monitores', teclados: 'Teclados', ratones: 'Ratones', audifonos: 'Audífonos' };
  const icons = { celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' };

  if (loading) return (<div className="tq-page-centered"><div className="text-center"><div className="spinner-border tq-spinner"></div><p className="mt-3 tq-text-muted">Cargando productos...</p></div></div>);
  if (error) return (<div className="container py-5"><div className="alert tq-alert-error"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div></div>);

  return (
    <div className="tq-page">
      <div className="container-fluid py-4 px-4">
        <div className="row">
          <div className="col-lg-3 mb-4"><FilterSidebar productos={lista} onFilter={setFiltros} /></div>
          <div className="col-lg-9">
            <div className="card border-0 mb-4 tq-card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h2 className="mb-0 tq-text-primary"><i className={`bi bi-${icons[categoria] || 'grid'} me-2 tq-text-indigo`}></i>{titles[categoria] || categoria}</h2>
                    <p className="mb-0 tq-text-muted">{productosFiltrados.length} productos encontrados</p>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group">
                      <input type="text" className="form-control tq-search-input" placeholder="Buscar por nombre o marca..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                      {busqueda && (<button className="btn tq-search-clear" onClick={() => setBusqueda('')}><i className="bi bi-x-lg"></i></button>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {compararLista.length > 0 && (
              <div className="mb-4 d-flex align-items-center p-3 tq-compare-bar">
                <i className="bi bi-arrow-left-right me-2 tq-text-indigo"></i>
                <span className="tq-text-indigo" style={{ color: '#c7d2fe' }}>{compararLista.length} producto(s) en comparación</span>
                <a href="/comparar" className="btn btn-sm ms-auto tq-btn-primary">Ver comparación</a>
              </div>
            )}
            {productosFiltrados.length > 0 ? (
              <div className="row">{productosFiltrados.map(p => (<ProductCard key={p._id} producto={p} categoria={categoria} onAddToCompare={handleAddToCompare} onToggleFavorito={handleToggleFav} esFavorito={!!favoritos.find(x => x._id === p._id)} />))}</div>
            ) : (
              <div className="text-center py-5"><i className="bi bi-search tq-empty-icon" style={{ fontSize: '48px' }}></i><p className="mt-3 tq-text-muted">No se encontraron productos con los filtros seleccionados</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;