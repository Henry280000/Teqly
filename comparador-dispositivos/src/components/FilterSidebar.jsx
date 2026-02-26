import { useState } from 'react';
import PropTypes from 'prop-types';

function FilterSidebar({ productos, onFilter }) {
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [filtrosEspecificos, setFiltrosEspecificos] = useState({});

  // Obtener marcas únicas
  const marcas = [...new Set(productos.map(p => p.marca))].sort();

  // Obtener atributos específicos según categoría
  const getAtributosEspecificos = () => {
    if (!productos || productos.length === 0) return {};
    
    const primerProducto = productos[0];
    const atributosEspecificos = {};
    
    Object.keys(primerProducto).forEach(key => {
      if (!['id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales'].includes(key)) {
        const valores = [...new Set(productos.map(p => p[key]))].filter(v => v);
        if (valores.length > 1 && valores.length < 20) {
          atributosEspecificos[key] = valores;
        }
      }
    });
    
    return atributosEspecificos;
  };

  const atributosEspecificos = getAtributosEspecificos();

  const handleFiltrar = () => {
    onFilter({
      precioMin: precioMin ? parseFloat(precioMin) : 0,
      precioMax: precioMax ? parseFloat(precioMax) : Infinity,
      marca: marcaSeleccionada,
      ordenamiento,
      filtrosEspecificos
    });
  };

  const handleLimpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    setMarcaSeleccionada('');
    setOrdenamiento('nombre');
    setFiltrosEspecificos({});
    onFilter({
      precioMin: 0,
      precioMax: Infinity,
      marca: '',
      ordenamiento: 'nombre',
      filtrosEspecificos: {}
    });
  };

  const handleFiltroEspecifico = (atributo, valor) => {
    const nuevosFiltros = { ...filtrosEspecificos };
    if (valor === '') {
      delete nuevosFiltros[atributo];
    } else {
      nuevosFiltros[atributo] = valor;
    }
    setFiltrosEspecificos(nuevosFiltros);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filtros
        </h5>
      </div>
      <div className="card-body">
        {/* Ordenamiento */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <i className="bi bi-sort-down me-2"></i>
            Ordenar por
          </label>
          <select 
            className="form-select"
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
          >
            <option value="nombre">Nombre (A-Z)</option>
            <option value="precio_asc">Precio (Menor a Mayor)</option>
            <option value="precio_desc">Precio (Mayor a Menor)</option>
            <option value="marca">Marca</option>
          </select>
        </div>

        {/* Rango de Precio */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <i className="bi bi-currency-dollar me-2"></i>
            Rango de Precio
          </label>
          <div className="row g-2">
            <div className="col-6">
              <input
                type="number"
                className="form-control"
                placeholder="Mínimo"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
              />
            </div>
            <div className="col-6">
              <input
                type="number"
                className="form-control"
                placeholder="Máximo"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Marca */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <i className="bi bi-tag me-2"></i>
            Marca
          </label>
          <select 
            className="form-select"
            value={marcaSeleccionada}
            onChange={(e) => setMarcaSeleccionada(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {marcas.map(marca => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>
        </div>

        {/* Filtros Específicos */}
        {Object.keys(atributosEspecificos).length > 0 && (
          <div className="mb-4">
            <label className="form-label fw-bold">
              <i className="bi bi-sliders me-2"></i>
              Filtros Específicos
            </label>
            {Object.entries(atributosEspecificos).map(([atributo, valores]) => (
              <div key={atributo} className="mb-3">
                <label className="form-label text-capitalize" style={{ fontSize: '0.9rem' }}>
                  {atributo.replace(/_/g, ' ')}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filtrosEspecificos[atributo] || ''}
                  onChange={(e) => handleFiltroEspecifico(atributo, e.target.value)}
                >
                  <option value="">Todos</option>
                  {valores.map(valor => (
                    <option key={valor} value={valor}>{valor}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary"
            onClick={handleFiltrar}
          >
            <i className="bi bi-check-circle me-2"></i>
            Aplicar Filtros
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={handleLimpiarFiltros}
          >
            <i className="bi bi-x-circle me-2"></i>
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

FilterSidebar.propTypes = {
  productos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onFilter: PropTypes.func.isRequired
};

export default FilterSidebar;
