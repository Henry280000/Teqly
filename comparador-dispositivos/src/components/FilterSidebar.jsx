import { useState } from 'react';
import PropTypes from 'prop-types';

function FilterSidebar({ productos, onFilter }) {
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [filtrosEspecificos, setFiltrosEspecificos] = useState({});

  const marcas = [...new Set(productos.map(p => p.marca))].sort();

  const getAtributosEspecificos = () => {
    if (!productos?.length) return {};
    const attrs = {};
    Object.keys(productos[0]).forEach(key => {
      if (!['id', '_id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales', 'categoria', '__v', 'creadoPor', 'createdAt', 'updatedAt'].includes(key)) {
        const vals = [...new Set(productos.map(p => p[key]))].filter(v => v);
        if (vals.length > 1 && vals.length < 20) attrs[key] = vals;
      }
    });
    return attrs;
  };
  const atributosEspecificos = getAtributosEspecificos();

  const handleFiltrar = () => { onFilter({ precioMin: precioMin ? parseFloat(precioMin) : 0, precioMax: precioMax ? parseFloat(precioMax) : Infinity, marca: marcaSeleccionada, ordenamiento, filtrosEspecificos }); };
  const handleLimpiar = () => { setPrecioMin(''); setPrecioMax(''); setMarcaSeleccionada(''); setOrdenamiento('nombre'); setFiltrosEspecificos({}); onFilter({ precioMin: 0, precioMax: Infinity, marca: '', ordenamiento: 'nombre', filtrosEspecificos: {} }); };
  const handleFiltroEspecifico = (a, v) => { const n = { ...filtrosEspecificos }; if (v === '') delete n[a]; else n[a] = v; setFiltrosEspecificos(n); };

  return (
    <div className="card border-0 tq-card">
      <div className="card-header border-0 py-3 tq-card-header--gradient">
        <h5 className="mb-0 text-white"><i className="bi bi-funnel me-2"></i>Filtros</h5>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <label className="form-label tq-filter-label"><i className="bi bi-sort-down me-2"></i>Ordenar por</label>
          <select className="form-select tq-select" value={ordenamiento} onChange={e => setOrdenamiento(e.target.value)}>
            <option value="nombre">Nombre (A-Z)</option><option value="precio_asc">Precio (Menor a Mayor)</option><option value="precio_desc">Precio (Mayor a Menor)</option><option value="marca">Marca</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="form-label tq-filter-label"><i className="bi bi-currency-dollar me-2"></i>Rango de Precio</label>
          <div className="row g-2">
            <div className="col-6"><input type="number" className="form-control tq-input" placeholder="Mínimo" value={precioMin} onChange={e => setPrecioMin(e.target.value)} /></div>
            <div className="col-6"><input type="number" className="form-control tq-input" placeholder="Máximo" value={precioMax} onChange={e => setPrecioMax(e.target.value)} /></div>
          </div>
        </div>
        <div className="mb-4">
          <label className="form-label tq-filter-label"><i className="bi bi-tag me-2"></i>Marca</label>
          <select className="form-select tq-select" value={marcaSeleccionada} onChange={e => setMarcaSeleccionada(e.target.value)}>
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {Object.keys(atributosEspecificos).length > 0 && (
          <div className="mb-4">
            <label className="form-label tq-filter-label"><i className="bi bi-sliders me-2"></i>Filtros Específicos</label>
            {Object.entries(atributosEspecificos).map(([attr, vals]) => (
              <div key={attr} className="mb-3">
                <label className="form-label text-capitalize tq-filter-sublabel">{attr.replace(/_/g, ' ')}</label>
                <select className="form-select form-select-sm tq-select" value={filtrosEspecificos[attr] || ''} onChange={e => handleFiltroEspecifico(attr, e.target.value)}>
                  <option value="">Todos</option>
                  {vals.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
        <div className="d-grid gap-2">
          <button className="btn tq-btn-primary" onClick={handleFiltrar}><i className="bi bi-check-circle me-2"></i>Aplicar Filtros</button>
          <button className="btn tq-btn-outline-indigo" onClick={handleLimpiar}><i className="bi bi-x-circle me-2"></i>Limpiar Filtros</button>
        </div>
      </div>
    </div>
  );
}

FilterSidebar.propTypes = { productos: PropTypes.arrayOf(PropTypes.object).isRequired, onFilter: PropTypes.func.isRequired };
export default FilterSidebar;
