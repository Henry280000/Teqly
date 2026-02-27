import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// componente de comparación de productos lado a lado
function Compare({ compararList, setCompararList }) {
  // estado para rastrear errores de imagen de cada producto
  const [imagenesError, setImagenesError] = useState({});

  // formatea el precio a moneda mexicana
  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // elimina un producto de la lista de comparación
  const handleRemove = (id, categoria) => {
    setCompararList(compararList.filter(p => !(p.id === id && p.categoria === categoria)));
  };

  // limpia toda la lista de comparación
  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar toda la comparación?')) {
      setCompararList([]);
    }
  };

  // marca una imagen como error cuando no carga
  const handleImageError = (productoKey) => {
    setImagenesError(prev => ({ ...prev, [productoKey]: true }));
  };

  // retorna el ícono según la categoría
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

  // calcula puntuación de un producto (0-100)
  const calcularPuntuacion = (producto) => {
    let puntos = 50; // Base
    
    // Puntos por características especiales
    if (producto.caracteristicas_especiales) {
      puntos += producto.caracteristicas_especiales.length * 3;
    }
    
    // Ajuste por precio (productos más caros tienden a tener mejores specs)
    if (producto.precio > 20000) puntos += 10;
    else if (producto.precio > 10000) puntos += 5;
    
    // Normalizar entre 0-100
    return Math.min(100, puntos);
  };

  // extrae métricas clave para barras de progreso
  const extraerMetricas = (producto) => {
    const metricas = [];
    
    // Relación calidad-precio
    const calidadPrecio = producto.caracteristicas_especiales 
      ? Math.min(10, (producto.caracteristicas_especiales.length / (producto.precio / 5000)) * 10)
      : 5;
    metricas.push({ nombre: 'Relación calidad-precio', valor: calidadPrecio });
    
    // Características especiales
    const caracteristicas = producto.caracteristicas_especiales 
      ? Math.min(10, producto.caracteristicas_especiales.length)
      : 3;
    metricas.push({ nombre: 'Características', valor: caracteristicas });
    
    // Puntuación general
    metricas.push({ nombre: 'Puntuación general', valor: calcularPuntuacion(producto) / 10 });
    
    return metricas;
  };

  // genera pequeño gráfico de radar para cada producto
  const generarMiniRadar = (producto, size = 80, center = 40) => {
    const categoria = producto.categoria;
    let valoraciones = [];
    
    if (categoria === 'celulares' || categoria === 'tablets') {
      valoraciones = [
        { valor: producto.precio > 15000 ? 8.5 : 7 },
        { valor: producto.precio > 20000 ? 9 : 7 },
        { valor: producto.caracteristicas_especiales?.length > 3 ? 8.5 : 6.5 },
        { valor: producto.caracteristicas_especiales?.some(c => c.toLowerCase().includes('batería')) ? 8 : 6.5 },
        { valor: producto.precio > 18000 ? 8.5 : 7 }
      ];
    } else {
      valoraciones = [
        { valor: 7.5 },
        { valor: producto.precio > 5000 ? 8 : 6.5 },
        { valor: producto.caracteristicas_especiales?.length > 2 ? 8 : 6.5 },
        { valor: 7 },
        { valor: 10 - (producto.precio / 3000) }
      ];
    }
// Esto igual fue con Ai para los calculos de esto
    const angle = (Math.PI * 2) / valoraciones.length;
    const points = valoraciones.map((val, index) => {
      const value = (val.valor / 10) * (size / 2);
      const x = center + value * Math.cos(angle * index - Math.PI / 2);
      const y = center + value * Math.sin(angle * index - Math.PI / 2);
      return `${x},${y}`;
    });
    
    return points.join(' ');
  };

  // si no hay productos, muestra pantalla vacía
  if (compararList.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-arrow-left-right text-muted" style={{ fontSize: '80px' }}></i>
          </div>
          <h2 className="mb-3">Comparador de Productos</h2>
          <p className="text-muted lead mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Agrega hasta 4 productos a tu comparación para ver un análisis detallado con puntuaciones, 
            valoraciones y especificaciones técnicas lado a lado.
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-primary btn-lg">
              <i className="bi bi-house me-2"></i>
              Ir al inicio
            </Link>
            <Link to="/busqueda-inteligente" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-stars me-2"></i>
              Búsqueda inteligente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // obtiene todas las propiedades únicas de los productos
  const todasLasPropiedades = new Set();
  compararList.forEach(producto => {
    Object.keys(producto).forEach(key => {
      if (!['id', 'imagen', 'caracteristicas_especiales', 'categoria'].includes(key)) {
        todasLasPropiedades.add(key);
      }
    });
  });

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa' }}>
      {/* header con título y botones */}
      <div className="container mb-4">
        <div className="row align-items-center mb-3">
          <div className="col-md-8">
            <h1 className="mb-2">
              <i className="bi bi-arrow-left-right me-2 text-primary"></i>
              Comparación de Productos
            </h1>
            <p className="text-muted mb-0">
              Analiza y compara las especificaciones técnicas lado a lado
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <span className="badge bg-primary fs-6 me-2">
              <i className="bi bi-collection me-1"></i>
              {compararList.length} de 4 productos
            </span>
            {compararList.length > 0 && (
              <button className="btn btn-outline-danger" onClick={handleClearAll}>
                <i className="bi bi-trash me-2"></i>
                Limpiar todo
              </button>
            )}
          </div>
        </div>
        {compararList.length > 0 && (
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Analiza las <strong>puntuaciones</strong>, <strong>valoraciones</strong> y <strong>especificaciones</strong> para tomar la mejor decisión.
          </div>
        )}
      </div>

      {/* comparación estilo versus */}
      <div className="container">
        <div className="row g-4">
          {compararList.map((producto) => {
            const productoKey = `${producto.id}-${producto.categoria}`;
            const imagenError = imagenesError[productoKey];
            const puntuacion = calcularPuntuacion(producto);
            const metricas = extraerMetricas(producto);
            
            return (
              <div key={productoKey} className="col-md-6 col-lg-3">
                <div className="card h-100 shadow-sm border-0">
                  {/* imagen del producto */}
                  <div className="position-relative" style={{ backgroundColor: '#f8f9fa' }}>
                    {producto.imagen && !imagenError ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="card-img-top"
                        style={{
                          height: '200px',
                          objectFit: 'contain',
                          backgroundColor: '#fff',
                          padding: '15px'
                        }}
                        onError={() => handleImageError(productoKey)}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <i className={`bi bi-${getCategoryIcon(producto.categoria)} text-secondary`} style={{ fontSize: '64px' }}></i>
                      </div>
                    )}
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemove(producto.id, producto.categoria)}
                      title="Eliminar de comparación"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                    <span className="badge bg-info position-absolute top-0 start-0 m-2">
                      {producto.categoria}
                    </span>
                  </div>

                  {/* información principal del producto */}
                  <div className="card-body">
                    <h5 className="card-title mb-2" style={{ fontSize: '16px', minHeight: '40px' }}>
                      {producto.nombre}
                    </h5>
                    <p className="text-muted mb-1" style={{ fontSize: '14px' }}>
                      <i className="bi bi-tag me-1"></i>
                      {producto.marca}
                    </p>
                    <h4 className="text-primary mb-3">{formatPrecio(producto.precio)}</h4>

                    {/* puntuación estilo versus con círculo */}
                    <div className="text-center mb-3 p-3 bg-light rounded">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <div 
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <div className="text-white">
                            <div style={{ fontSize: '29px', fontWeight: 'bold', lineHeight: '1' }}>
                              {puntuacion}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                              PUNTOS
                            </div>
                          </div>
                        </div>
                      </div>
                      <small className="text-muted">Puntuación general</small>
                    </div>

                    {/* Mini gráfico de radar con ayuda de Ai porque no supe hacerlo yo y que quedara decente la verdad que inicia desde aqui*/}
                    <div className="text-center mb-3 p-2 bg-white border rounded">
                      <svg width="100%" height="90" viewBox="0 0 80 80" className="mx-auto d-block">
                        {/* Círculos de fondo */}
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                        <circle cx="40" cy="40" r="20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                        <circle cx="40" cy="40" r="10" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />

                        {/* Líneas radiales */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                          const x = 40 + 30 * Math.cos(angle);
                          const y = 40 + 30 * Math.sin(angle);
                          return (
                            <line
                              key={`line-${i}`}
                              x1="40"
                              y1="40"
                              x2={x}
                              y2={y}
                              stroke="#e0e0e0"
                              strokeWidth="0.5"
                            />
                          );
                        })}

                        {/* Polígono de datos */}
                        <polygon
                          points={generarMiniRadar(producto)}
                          fill="rgba(0, 123, 255, 0.4)"
                          stroke="#007bff"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <small className="text-muted" style={{ fontSize: '10px' }}>Análisis visual</small>
                    </div>

                    {/* métricas con barras de progreso */}
                    <div className="mb-3">
                      <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Valoraciones clave
                      </h6>
                      {metricas.map((metrica, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small style={{ fontSize: '12px' }}>{metrica.nombre}</small>
                            <small className="fw-bold" style={{ fontSize: '12px' }}>
                              {metrica.valor.toFixed(1)}/10
                            </small>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar"
                              style={{ 
                                width: `${(metrica.valor / 10) * 100}%`,
                                backgroundColor: metrica.valor >= 7 ? '#28a745' : metrica.valor >= 5 ? '#007bff' : '#ffc107'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Especificaciones clave hasta aqui llego a ayuda de la Ai*/}
                    <div className="mb-3">
                      <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Especificaciones
                      </h6>
                      {Array.from(todasLasPropiedades).slice(0, 4).map((propiedad, idx) => {
                        const valor = producto[propiedad];
                        if (valor && propiedad !== 'nombre' && propiedad !== 'marca' && propiedad !== 'precio') {
                          return (
                            <div key={idx} className="mb-2 pb-2 border-bottom">
                              <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                {propiedad.replace(/_/g, ' ')}
                              </small>
                              <div className="text-dark" style={{ fontSize: '14px', fontWeight: '500' }}>
                                {valor}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* características destacadas */}
                    {producto.caracteristicas_especiales && producto.caracteristicas_especiales.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          <i className="bi bi-check-circle-fill text-success me-1"></i>
                          Destacados
                        </h6>
                        {producto.caracteristicas_especiales.slice(0, 3).map((caract, idx) => (
                          <div key={idx} className="mb-1">
                            <small className="text-success" style={{ fontSize: '12px' }}>
                              <i className="bi bi-check-circle me-1"></i>
                              {caract}
                            </small>
                          </div>
                        ))}
                        {producto.caracteristicas_especiales.length > 3 && (
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            +{producto.caracteristicas_especiales.length - 3} más
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  {/* botón para ver detalles */}
                  <div className="card-footer bg-white border-top">
                    <Link
                      to={`/producto/${producto.categoria}/${producto.id}`}
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      <i className="bi bi-eye me-2"></i>
                      Ver detalles completos
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* espacios vacíos para completar hasta 4 productos */}
          {[...Array(4 - compararList.length)].map((_, index) => (
            <div key={`empty-${index}`} className="col-md-6 col-lg-3">
              <div className="card h-100 border-dashed" style={{ borderStyle: 'dashed', minHeight: '400px' }}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <i className="bi bi-plus-circle text-muted mb-3" style={{ fontSize: '48px' }}></i>
                  <h5 className="text-muted">Agregar producto</h5>
                  <p className="text-muted small mb-3">
                    Navega por las categorías y haz clic en &quot;Agregar a comparar&quot;
                  </p>
                  <Link to="/" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-grid me-2"></i>
                    Ver categorías
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* información adicional y consejos */}
      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="alert alert-light border">
              <h6 className="mb-2">
                <i className="bi bi-lightbulb text-warning me-2"></i>
                <strong>Cómo usar la comparación:</strong>
              </h6>
              <ul className="mb-0 ps-4" style={{ fontSize: '14px' }}>
                <li><strong>Puntuación:</strong> Valoración general basada en características y precio</li>
                <li><strong>Valoraciones:</strong> Métricas específicas de cada producto</li>
                <li><strong>Especificaciones:</strong> Datos técnicos detallados</li>
                <li><strong>Destacados:</strong> Características especiales más importantes</li>
              </ul>
            </div>
          </div>
          <div className="col-md-4">
            <div className="alert alert-primary border-primary">
              <h6 className="mb-2">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Consejo:</strong>
              </h6>
              <p className="mb-0" style={{ fontSize: '14px' }}>
                Puedes comparar hasta <strong>4 productos</strong> simultáneamente. 
                Haz clic en el botón <strong>X</strong> para eliminar productos individuales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// validación de props
Compare.propTypes = {
  compararList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCompararList: PropTypes.func.isRequired
};

export default Compare;
