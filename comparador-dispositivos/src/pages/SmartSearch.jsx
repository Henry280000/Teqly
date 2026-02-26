import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dispositivosData from '../data/dispositivos.json';

function SmartSearch({ compararList, setCompararList }) {
  const [filtros, setFiltros] = useState({
    categoria: '',
    presupuestoMin: '',
    presupuestoMax: '',
    marca: '',
    busqueda: '',
    caracteristicasDeseadas: []
  });
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const buscarProductos = (e) => {
    e.preventDefault();
    
    if (!filtros.categoria) {
      alert('Por favor selecciona una categoría');
      return;
    }

    let productos = [...(dispositivosData[filtros.categoria] || [])];

    // Filtrar por presupuesto
    if (filtros.presupuestoMin && filtros.presupuestoMin !== '') {
      const min = parseFloat(filtros.presupuestoMin);
      productos = productos.filter(p => p.precio >= min);
    }
    if (filtros.presupuestoMax && filtros.presupuestoMax !== '') {
      const max = parseFloat(filtros.presupuestoMax);
      productos = productos.filter(p => p.precio <= max);
    }

    // Filtrar por marca
    if (filtros.marca && filtros.marca !== '') {
      productos = productos.filter(p => p.marca === filtros.marca);
    }

    // Buscar por texto en todas las propiedades incluyendo arrays
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const busquedaLower = filtros.busqueda.toLowerCase().trim();
      productos = productos.filter(p => {
        // Buscar en propiedades básicas
        const enPropiedades = 
          p.nombre?.toLowerCase().includes(busquedaLower) ||
          p.marca?.toLowerCase().includes(busquedaLower) ||
          Object.values(p).some(val => 
            typeof val === 'string' && val.toLowerCase().includes(busquedaLower)
          );
        
        // Buscar en características especiales
        const enCaracteristicas = p.caracteristicas_especiales?.some(
          caract => caract.toLowerCase().includes(busquedaLower)
        );
        
        return enPropiedades || enCaracteristicas;
      });
    }

    // Ordenar por mejor relación calidad-precio
    productos.sort((a, b) => {
      const numCaractA = a.caracteristicas_especiales?.length || 0;
      const numCaractB = b.caracteristicas_especiales?.length || 0;
      
      // Evitar división por cero y dar peso al precio y características
      const scoreA = numCaractA > 0 ? (numCaractA / (a.precio / 1000)) : 0;
      const scoreB = numCaractB > 0 ? (numCaractB / (b.precio / 1000)) : 0;
      
      return scoreB - scoreA;
    });

    // Mostrar solo las mejores 5 opciones
    const top5 = productos.slice(0, 5);
    console.log('Resultados de búsqueda:', top5); // Para debugging
    setResultados(top5);
    setMostrarResultados(true);
  };

  const handleReset = () => {
    setFiltros({
      categoria: '',
      presupuestoMin: '',
      presupuestoMax: '',
      marca: '',
      busqueda: '',
      caracteristicasDeseadas: []
    });
    setResultados([]);
    setMostrarResultados(false);
  };

  const handleAddToCompare = (producto, categoria) => {
    if (compararList.length >= 4) {
      alert('Solo puedes comparar hasta 4 productos a la vez');
      return;
    }
    
    const existe = compararList.find(p => p.id === producto.id && p.categoria === categoria);
    if (existe) {
      alert('Este producto ya está en la lista de comparación');
      return;
    }

    setCompararList([...compararList, { ...producto, categoria }]);
    alert('Producto agregado a comparación');
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      celulares: 'phone',
      tablets: 'tablet',
      monitores: 'display',
      teclados: 'keyboard',
      ratones: 'mouse',
      audifonos: 'headphones'
    };
    return icons[cat] || 'device';
  };

  const getMarcasDisponibles = () => {
    if (!filtros.categoria) return [];
    const productos = dispositivosData[filtros.categoria] || [];
    return [...new Set(productos.map(p => p.marca))].sort();
  };


  if (mostrarResultados) {
    return (
      <div className="container py-5">
        <div className="card shadow-lg mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-1">
                  <i className="bi bi-stars me-2"></i>
                  Las 5 Mejores Opciones para Ti
                </h3>
                <small>En {filtros.categoria}</small>
              </div>
              <button className="btn btn-light" onClick={handleReset}>
                <i className="bi bi-arrow-left me-2"></i>
                Nueva búsqueda
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <h6 className="text-muted mb-2">
                <i className="bi bi-funnel me-2"></i>
                Filtros aplicados:
              </h6>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-primary">
                  Categoría: {filtros.categoria}
                </span>
                {filtros.presupuestoMin && (
                  <span className="badge bg-info">
                    Precio mín: ${parseInt(filtros.presupuestoMin).toLocaleString()}
                  </span>
                )}
                {filtros.presupuestoMax && (
                  <span className="badge bg-info">
                    Precio máx: ${parseInt(filtros.presupuestoMax).toLocaleString()}
                  </span>
                )}
                {filtros.marca && (
                  <span className="badge bg-secondary">
                    Marca: {filtros.marca}
                  </span>
                )}
                {filtros.busqueda && (
                  <span className="badge bg-warning text-dark">
                    Búsqueda: &quot;{filtros.busqueda}&quot;
                  </span>
                )}
              </div>
            </div>
            {resultados.length > 0 ? (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                Encontramos <strong>{resultados.length}</strong> opciones ordenadas por mejor relación calidad-precio.
              </div>
            ) : (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                No se encontraron productos con esos criterios. Intenta ajustar los filtros.
              </div>
            )}
          </div>
        </div>

        {resultados.length > 0 ? (
          <div className="row g-4">
            {resultados.map((producto, index) => {
              // Calcular score para mostrar
              const score = ((producto.caracteristicas_especiales?.length || 0) / (producto.precio / 1000)).toFixed(2);
              
              return (
                <div key={`${producto.id}-${index}`} className="col-12">
                  <div className="card shadow-lg border-0">
                    {/* Header con ranking */}
                    <div className="card-header py-3" style={{ 
                      background: `linear-gradient(135deg, ${
                        index === 0 ? '#ffd700, #ffed4e' : // Oro para #1
                        index === 1 ? '#c0c0c0, #e8e8e8' : // Plata para #2
                        index === 2 ? '#cd7f32, #e5a869' : // Bronce para #3
                        '#007bff, #0056b3' // Azul para el resto
                      })`
                    }}>
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <h3 className="mb-0 text-white">
                            {index === 0 && <i className="bi bi-trophy-fill me-2"></i>}
                            {index === 1 && <i className="bi bi-award-fill me-2"></i>}
                            {index === 2 && <i className="bi bi-gem me-2"></i>}
                            {index > 2 && <i className="bi bi-star-fill me-2"></i>}
                            Opción #{index + 1}
                            {index === 0 && (
                              <span className="badge bg-white text-warning ms-3">
                                ¡RECOMENDADO!
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <div className="text-white">
                            <small className="d-block" style={{ opacity: 0.9 }}>Score calidad-precio</small>
                            <strong className="fs-5">{score}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo del producto */}
                    <div className="card-body p-4">
                      <div className="row g-4">
                        {/* Imagen */}
                        <div className="col-md-4">
                          <div className="position-relative">
                            {producto.imagen ? (
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre}
                                className="img-fluid rounded shadow-sm"
                                style={{ 
                                  width: '100%',
                                  height: '250px', 
                                  objectFit: 'contain', 
                                  backgroundColor: '#f8f9fa',
                                  padding: '15px'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="bg-light rounded shadow-sm d-none align-items-center justify-content-center" 
                              style={{ height: '250px' }}
                            >
                              <i className={`bi bi-${getCategoryIcon(filtros.categoria)} text-secondary`} style={{ fontSize: '4rem' }}></i>
                            </div>
                          </div>
                        </div>

                        {/* Información */}
                        <div className="col-md-8">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h4 className="mb-2">{producto.nombre}</h4>
                              <h6 className="text-muted mb-0">
                                <i className="bi bi-tag me-2"></i>
                                {producto.marca}
                              </h6>
                            </div>
                            <div className="text-end">
                              <div className="text-muted small">Precio</div>
                              <h3 className="text-primary mb-0">
                                {new Intl.NumberFormat('es-MX', {
                                  style: 'currency',
                                  currency: 'MXN',
                                  minimumFractionDigits: 0
                                }).format(producto.precio)}
                              </h3>
                            </div>
                          </div>

                          {/* Especificaciones */}
                          <div className="row g-2 mb-3">
                            {Object.entries(producto)
                              .filter(([key]) => !['id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales'].includes(key))
                              .slice(0, 6)
                              .map(([key, value], idx) => (
                                <div key={idx} className="col-md-6">
                                  <div className="card border bg-light">
                                    <div className="card-body py-2 px-3">
                                      <small className="text-muted text-uppercase d-block" style={{ fontSize: '0.7rem' }}>
                                        {key.replace(/_/g, ' ')}
                                      </small>
                                      <strong className="text-dark" style={{ fontSize: '0.85rem' }}>
                                        {value}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>

                          {/* Características especiales */}
                          {producto.caracteristicas_especiales && producto.caracteristicas_especiales.length > 0 && (
                            <div className="mb-3">
                              <h6 className="mb-2">
                                <i className="bi bi-star-fill text-warning me-2"></i>
                                Características especiales:
                              </h6>
                              <div className="d-flex flex-wrap gap-2">
                                {producto.caracteristicas_especiales.map((caract, idx) => (
                                  <span key={idx} className="badge bg-success" style={{ fontSize: '0.8rem' }}>
                                    <i className="bi bi-check-circle me-1"></i>
                                    {caract}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Botones de acción */}
                          <div className="d-flex gap-2 mt-3">
                            <Link 
                              to={`/producto/${filtros.categoria}/${producto.id}`}
                              className="btn btn-primary"
                            >
                              <i className="bi bi-eye me-2"></i>
                              Ver detalles completos
                            </Link>
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleAddToCompare(producto, filtros.categoria)}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Agregar a comparar
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
        ) : null}

        <div className="text-center mt-4">
          <button className="btn btn-outline-primary btn-lg" onClick={handleReset}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Hacer otra búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="display-5 fw-bold mb-3">
              <i className="bi bi-stars text-primary me-2"></i>
              Búsqueda Inteligente
            </h1>
            <p className="lead text-muted">
              Encuentra los <strong>5 mejores productos</strong> según tus necesidades y presupuesto
            </p>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-search fs-4 me-2"></i>
                <div>
                  <h4 className="mb-0">Configura tu búsqueda</h4>
                  <small>Todos los campos son opcionales excepto la categoría</small>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={buscarProductos}>
                {/* Categoría */}
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5">
                    <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>
                    1. ¿Qué tipo de dispositivo buscas? 
                    <span className="text-danger ms-1">*</span>
                  </label>
                  <select 
                    className="form-select form-select-lg shadow-sm"
                    name="categoria"
                    value={filtros.categoria}
                    onChange={handleChange}
                    required
                    style={{ borderWidth: '2px' }}
                  >
                    <option value="">-- Selecciona una categoría --</option>
                    <option value="celulares">📱 Celulares</option>
                    <option value="tablets">📱 Tablets</option>
                    <option value="monitores">🖥️ Monitores</option>
                    <option value="teclados">⌨️ Teclados</option>
                    <option value="ratones">🖱️ Ratones</option>
                    <option value="audifonos">🎧 Audífonos</option>
                  </select>
                </div>

                <hr className="my-4" />

                {/* Presupuesto */}
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5">
                    <i className="bi bi-currency-dollar me-2 text-success"></i>
                    2. ¿Cuál es tu presupuesto?
                  </label>
                  <p className="text-muted small mb-3">
                    <i className="bi bi-info-circle me-1"></i>
                    Define tu rango de precio en pesos mexicanos (MXN)
                  </p>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control shadow-sm"
                          name="presupuestoMin"
                          placeholder="Precio mínimo"
                          value={filtros.presupuestoMin}
                          onChange={handleChange}
                          min="0"
                          step="100"
                        />
                      </div>
                      <small className="text-muted">Ejemplo: 5000</small>
                    </div>
                    <div className="col-md-6">
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control shadow-sm"
                          name="presupuestoMax"
                          placeholder="Precio máximo"
                          value={filtros.presupuestoMax}
                          onChange={handleChange}
                          min="0"
                          step="100"
                        />
                      </div>
                      <small className="text-muted">Ejemplo: 15000</small>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Marca */}
                {filtros.categoria ? (
                  <>
                    <div className="mb-4">
                      <label className="form-label fw-bold fs-5">
                        <i className="bi bi-tag me-2 text-info"></i>
                        3. ¿Prefieres alguna marca específica?
                      </label>
                      <p className="text-muted small mb-3">
                        <i className="bi bi-info-circle me-1"></i>
                        Filtra por tu marca favorita o deja &quot;Todas las marcas&quot;
                      </p>
                      <select 
                        className="form-select form-select-lg shadow-sm"
                        name="marca"
                        value={filtros.marca}
                        onChange={handleChange}
                      >
                        <option value="">✨ Todas las marcas</option>
                        {getMarcasDisponibles().map(marca => (
                          <option key={marca} value={marca}>🏷️ {marca}</option>
                        ))}
                      </select>
                    </div>

                    <hr className="my-4" />
                  </>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Selecciona una categoría primero para ver las marcas disponibles
                  </div>
                )}

                {/* Búsqueda por texto */}
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5">
                    <i className="bi bi-search me-2 text-warning"></i>
                    4. ¿Qué características buscas?
                  </label>
                  <p className="text-muted small mb-3">
                    <i className="bi bi-info-circle me-1"></i>
                    Escribe palabras clave de lo que necesitas (ej: gaming, batería, cámara, etc.)
                  </p>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control shadow-sm"
                      name="busqueda"
                      placeholder="Ej: 'gaming', 'fotografía', 'batería larga', 'pantalla grande'..."
                      value={filtros.busqueda}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Ejemplos:</strong>
                    </small>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <span className="badge bg-light text-dark border">gaming</span>
                      <span className="badge bg-light text-dark border">fotografía</span>
                      <span className="badge bg-light text-dark border">batería</span>
                      <span className="badge bg-light text-dark border">USB-C</span>
                      <span className="badge bg-light text-dark border">inalámbrico</span>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Botones */}
                <div className="d-grid gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg shadow-sm"
                    style={{ fontSize: '1.1rem', padding: '1rem' }}
                  >
                    <i className="bi bi-stars me-2"></i>
                    Buscar las Mejores 5 Opciones
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={handleReset}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Limpiar todos los filtros
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SmartSearch.propTypes = {
  compararList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCompararList: PropTypes.func.isRequired
};

export default SmartSearch;
