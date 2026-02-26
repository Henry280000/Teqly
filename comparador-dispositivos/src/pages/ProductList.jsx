import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import dispositivosData from '../data/dispositivos.json';

function ProductList({ compararList, setCompararList }) {
  const { categoria } = useParams();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrosActuales, setFiltrosActuales] = useState({
    precioMin: 0,
    precioMax: Infinity,
    marca: '',
    ordenamiento: 'nombre',
    filtrosEspecificos: {}
  });

  useEffect(() => {
    if (categoria && dispositivosData[categoria]) {
      setProductos(dispositivosData[categoria]);
      setProductosFiltrados(dispositivosData[categoria]);
      setBusqueda(''); // Limpiar búsqueda al cambiar categoría
    }
  }, [categoria]);

  // Aplicar filtros automáticamente cuando cambie la búsqueda o los filtros
  useEffect(() => {
    if (productos.length === 0) return;

    let resultado = [...productos];

    // Filtrar por precio
    resultado = resultado.filter(p => 
      p.precio >= filtrosActuales.precioMin && p.precio <= filtrosActuales.precioMax
    );

    // Filtrar por marca
    if (filtrosActuales.marca) {
      resultado = resultado.filter(p => p.marca === filtrosActuales.marca);
    }

    // Filtrar por atributos específicos
    if (filtrosActuales.filtrosEspecificos) {
      Object.entries(filtrosActuales.filtrosEspecificos).forEach(([atributo, valor]) => {
        resultado = resultado.filter(p => p[atributo] === valor);
      });
    }

    // Filtrar por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Ordenar
    switch (filtrosActuales.ordenamiento) {
      case 'precio_asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
      case 'marca':
        resultado.sort((a, b) => a.marca.localeCompare(b.marca));
        break;
      default:
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    setProductosFiltrados(resultado);
  }, [busqueda, productos, filtrosActuales]);

  const handleFilter = (filtros) => {
    setFiltrosActuales(filtros);
  };

  const handleAddToCompare = (producto, cat) => {
    if (compararList.length >= 4) {
      alert('Solo puedes comparar hasta 4 productos a la vez');
      return;
    }
    
    const existe = compararList.find(p => p.id === producto.id && p.categoria === cat);
    if (existe) {
      alert('Este producto ya está en la lista de comparación');
      return;
    }

    setCompararList([...compararList, { ...producto, categoria: cat }]);
  };

  const getCategoriaTitle = (cat) => {
    const titles = {
      celulares: 'Celulares',
      tablets: 'Tablets',
      monitores: 'Monitores',
      teclados: 'Teclados',
      ratones: 'Ratones',
      audifonos: 'Audífonos'
    };
    return titles[cat] || cat;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar de Filtros */}
        <div className="col-lg-3 mb-4">
          <FilterSidebar 
            productos={productos}
            onFilter={handleFilter}
          />
        </div>

        {/* Lista de Productos */}
        <div className="col-lg-9">
          {/* Header con búsqueda */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0">
                    <i className={`bi bi-${categoria === 'celulares' ? 'phone' : categoria === 'tablets' ? 'tablet' : categoria === 'monitores' ? 'display' : categoria === 'teclados' ? 'keyboard' : categoria === 'ratones' ? 'mouse' : 'headphones'} me-2`}></i>
                    {getCategoriaTitle(categoria)}
                  </h2>
                  <p className="text-muted mb-0">
                    {productosFiltrados.length} productos encontrados
                  </p>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre o marca..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => setBusqueda('')}
                        type="button"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                  {busqueda && (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Búsqueda en tiempo real activada
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Productos */}
          {productosFiltrados.length > 0 ? (
            <div className="row">
              {productosFiltrados.map(producto => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  categoria={categoria}
                  onAddToCompare={handleAddToCompare}
                />
              ))}
            </div>
          ) : (
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron productos con los filtros seleccionados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProductList.propTypes = {
  compararList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCompararList: PropTypes.func.isRequired
};

export default ProductList;
