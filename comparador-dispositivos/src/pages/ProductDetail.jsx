import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import dispositivosData from '../data/dispositivos.json';

function ProductDetail() {
  const { categoria, id } = useParams();
  const [imagenError, setImagenError] = useState(false);
  const [vistaActual, setVistaActual] = useState('resumen'); // resumen, specs, caracteristicas
  const producto = dispositivosData[categoria]?.find(p => p.id === parseInt(id));

  if (!producto) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Producto no encontrado
        </div>
        <Link to={`/categoria/${categoria}`} className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a la categoría
        </Link>
      </div>
    );
  }

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(precio);
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

  // Calcular puntuación
  const calcularPuntuacion = () => {
    let puntos = 50;
    if (producto.caracteristicas_especiales) {
      puntos += producto.caracteristicas_especiales.length * 3;
    }
    if (producto.precio > 20000) puntos += 10;
    else if (producto.precio > 10000) puntos += 5;
    return Math.min(100, puntos);
  };

  // Generar valoraciones para el gráfico de radar
  const generarValoraciones = () => {
    const valoraciones = [];
    
    // función para eliminar acentos
    const eliminarAcentos = (texto) => {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    
    // Para diferentes categorías
    if (categoria === 'celulares' || categoria === 'tablets') {
      valoraciones.push({ nombre: 'Pantalla', valor: producto.precio > 15000 ? 8.5 : 7 });
      valoraciones.push({ nombre: 'Rendimiento', valor: producto.precio > 20000 ? 9 : producto.precio > 10000 ? 7.5 : 6 });
      valoraciones.push({ nombre: 'Cámaras', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('camara')) ? 8.5 : 6.5 });
      valoraciones.push({ nombre: 'Batería', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bateria')) ? 8 : 6.5 });
      valoraciones.push({ nombre: 'Diseño', valor: producto.precio > 18000 ? 8.5 : 7 });
    } else if (categoria === 'monitores') {
      valoraciones.push({ nombre: 'Calidad imagen', valor: producto.precio > 8000 ? 8.5 : 7 });
      valoraciones.push({ nombre: 'Conectividad', valor: 7.5 });
      valoraciones.push({ nombre: 'Diseño', valor: producto.precio > 10000 ? 8 : 6.5 });
      valoraciones.push({ nombre: 'Ergonomía', valor: 7 });
      valoraciones.push({ nombre: 'Precio', valor: 10 - (producto.precio / 5000) });
    } else if (categoria === 'teclados' || categoria === 'ratones') {
      valoraciones.push({ nombre: 'Ergonomía', valor: producto.precio > 1500 ? 8 : 6.5 });
      valoraciones.push({ nombre: 'Durabilidad', valor: producto.marca === 'Logitech' || producto.marca === 'Razer' ? 8.5 : 7 });
      valoraciones.push({ nombre: 'Rendimiento', valor: producto.caracteristicas_especiales?.length > 3 ? 8 : 6.5 });
      valoraciones.push({ nombre: 'Diseño', valor: producto.precio > 2000 ? 8 : 6.5 });
      valoraciones.push({ nombre: 'Precio', valor: 10 - (producto.precio / 1000) });
    } else if (categoria === 'audifonos') {
      valoraciones.push({ nombre: 'Calidad audio', valor: producto.precio > 3000 ? 8.5 : 7 });
      valoraciones.push({ nombre: 'Comodidad', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('confort')) ? 8 : 7 });
      valoraciones.push({ nombre: 'Batería', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bateria')) ? 8 : 6 });
      valoraciones.push({ nombre: 'Conectividad', valor: producto.caracteristicas_especiales?.some(c => eliminarAcentos(c.toLowerCase()).includes('bluetooth')) ? 8.5 : 6 });
      valoraciones.push({ nombre: 'Diseño', valor: producto.precio > 4000 ? 8 : 6.5 });
    }
    
    return valoraciones;
  };

  // Generar comparaciones "mejor que"
  const generarComparaciones = () => {
    const comparaciones = [];
    const todosProductos = dispositivosData[categoria] || [];
    const promedios = {
      precio: todosProductos.reduce((sum, p) => sum + p.precio, 0) / todosProductos.length,
      caracteristicas: todosProductos.reduce((sum, p) => sum + (p.caracteristicas_especiales?.length || 0), 0) / todosProductos.length
    };

    // Comparar precio
    if (producto.precio < promedios.precio) {
      const diferencia = Math.round(((promedios.precio - producto.precio) / promedios.precio) * 100);
      comparaciones.push({
        mejor: true,
        texto: `${diferencia}% más económico que el promedio`,
        detalle: `$${Math.round(promedios.precio).toLocaleString()} vs ${formatPrecio(producto.precio)}`
      });
    }

    // Comparar características
    const numCaract = producto.caracteristicas_especiales?.length || 0;
    if (numCaract > promedios.caracteristicas) {
      const diferencia = numCaract - Math.round(promedios.caracteristicas);
      comparaciones.push({
        mejor: true,
        texto: `${diferencia} características especiales más que el promedio`,
        detalle: `${numCaract} vs ${Math.round(promedios.caracteristicas)} características`
      });
    }

    // Características destacadas específicas
    if (producto.caracteristicas_especiales) {
      const caracsEspeciales = producto.caracteristicas_especiales.slice(0, 4);
      caracsEspeciales.forEach(carac => {
        comparaciones.push({
          mejor: true,
          texto: carac,
          detalle: ''
        });
      });
    }

    return comparaciones;
  };

  const puntuacion = calcularPuntuacion();
  const valoraciones = generarValoraciones();
  const comparaciones = generarComparaciones();
  const promedioValoraciones = (valoraciones.reduce((sum, v) => sum + v.valor, 0) / valoraciones.length).toFixed(1);

  // Generar puntos del polígono para el gráfico radar que se repite en la comparación
  const generarPuntosRadar = (valores, size = 200, center = 100) => {
    const angle = (Math.PI * 2) / valores.length;
    const points = valores.map((valor, index) => {
      const value = (valor.valor / 10) * (size / 2);
      const x = center + value * Math.cos(angle * index - Math.PI / 2);
      const y = center + value * Math.sin(angle * index - Math.PI / 2);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  // Generar puntos de referencia (valores máximos)
  const generarPuntosMax = (numPuntos, size = 200, center = 100) => {
    const angle = (Math.PI * 2) / numPuntos;
    const points = [];
    for (let i = 0; i < numPuntos; i++) {
      const x = center + (size / 2) * Math.cos(angle * i - Math.PI / 2);
      const y = center + (size / 2) * Math.sin(angle * i - Math.PI / 2);
      points.push({ x, y });
    }
    return points;
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/categoria/${categoria}`}>{categoria}</Link>
          </li>
          <li className="breadcrumb-item active">{producto.nombre}</li>
        </ol>
      </nav>

      {/* Header con título y precio */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="mb-2">{producto.nombre}</h1>
              <h5 className="text-muted mb-0">
                <i className="bi bi-tag me-2"></i>
                {producto.marca}
              </h5>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-inline-block">
                <div className="text-muted small">Precio</div>
                <div className="display-6 text-primary fw-bold">
                  {formatPrecio(producto.precio)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas estilo Versus */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${vistaActual === 'resumen' ? 'active' : ''}`}
            onClick={() => setVistaActual('resumen')}
          >
            <i className="bi bi-card-list me-2"></i>
            RESUMEN
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${vistaActual === 'specs' ? 'active' : ''}`}
            onClick={() => setVistaActual('specs')}
          >
            <i className="bi bi-cpu me-2"></i>
            ESPECIFICACIONES
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${vistaActual === 'caracteristicas' ? 'active' : ''}`}
            onClick={() => setVistaActual('caracteristicas')}
          >
            <i className="bi bi-stars me-2"></i>
            CARACTERÍSTICAS
          </button>
        </li>
      </ul>

      <div className="row">
        {/* Columna izquierda: Imagen y puntuación */}
        <div className="col-lg-4 mb-4">
          {/* Imagen */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              {producto.imagen && !imagenError ? (
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="img-fluid rounded"
                  style={{ height: '350px', width: '100%', objectFit: 'contain', backgroundColor: '#f8f9fa', padding: '20px' }}
                  onError={() => setImagenError(true)}
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
                  <i className={`bi bi-${getCategoryIcon(categoria)} text-secondary`} style={{ fontSize: '96px' }}></i>
                </div>
              )}
            </div>
          </div>

          {/* Puntuación circular */}
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Puntuación General
              </h6>
              <div 
                className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '140px', height: '140px' }}
              >
                <div className="text-white">
                  <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1' }}>
                    {puntuacion}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    PUNTOS
                  </div>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Basado en especificaciones,<br />características y precio
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Contenido según pestaña */}
        <div className="col-lg-8">
          {vistaActual === 'resumen' && (
            <>
              {/* Gráfico de Radar estilo Versus */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-diagram-3 me-2"></i>
                    Análisis Visual
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      {/* SVG Radar Chart */}
                      <svg width="100%" height="250" viewBox="0 0 200 200" className="mx-auto d-block">
                        {/* Círculos de fondo */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                        <circle cx="100" cy="100" r="60" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                        <circle cx="100" cy="100" r="40" fill="none" stroke="#e0e0e0" strokeWidth="1" />
                        <circle cx="100" cy="100" r="20" fill="none" stroke="#e0e0e0" strokeWidth="1" />

                        {/* Líneas radiales */}
                        {generarPuntosMax(valoraciones.length).map((punto, idx) => (
                          <line
                            key={`line-${idx}`}
                            x1="100"
                            y1="100"
                            x2={punto.x}
                            y2={punto.y}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Polígono de datos */}
                        <polygon
                          points={generarPuntosRadar(valoraciones, 160, 100)}
                          fill="rgba(0, 123, 255, 0.3)"
                          stroke="#007bff"
                          strokeWidth="2"
                        />

                        {/* Puntos en los vértices */}
                        {generarPuntosMax(valoraciones.length, 160, 100).map((punto, idx) => {
                          const valor = valoraciones[idx].valor;
                          const size = (valor / 10) * 80;
                          const x = 100 + size * Math.cos((Math.PI * 2 * idx) / valoraciones.length - Math.PI / 2);
                          const y = 100 + size * Math.sin((Math.PI * 2 * idx) / valoraciones.length - Math.PI / 2);
                          return (
                            <circle
                              key={`point-${idx}`}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#007bff"
                            />
                          );
                        })}

                        {/* Etiquetas */}
                        {valoraciones.map((val, idx) => {
                          const angle = (Math.PI * 2 * idx) / valoraciones.length - Math.PI / 2;
                          const distance = 95;
                          const x = 100 + distance * Math.cos(angle);
                          const y = 100 + distance * Math.sin(angle);
                          return (
                            <text
                              key={`label-${idx}`}
                              x={x}
                              y={y}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#333"
                            >
                              {val.nombre.toUpperCase()}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '13px' }}>
                        Valoraciones detalladas
                      </h6>
                      {valoraciones.map((val, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="fw-bold">{val.nombre}</small>
                            <small className="text-primary fw-bold">{val.valor.toFixed(1)}/10</small>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${(val.valor / 10) * 100}%`,
                                backgroundColor: val.valor >= 8 ? '#28a745' : val.valor >= 6 ? '#007bff' : '#ffc107'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección "¿En qué es mejor?" estilo Versus */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-trophy me-2"></i>
                    ¿En qué es {producto.nombre} mejor que la media?
                  </h5>
                </div>
                <div className="card-body">
                  {comparaciones.length > 0 ? (
                    <div className="row g-3">
                      {comparaciones.map((comp, idx) => (
                        <div key={idx} className="col-md-6">
                          <div className="d-flex align-items-start">
                            <i className="bi bi-check-circle-fill text-success me-2 mt-1" style={{ fontSize: '19px' }}></i>
                            <div>
                              <div className="fw-bold mb-1">{comp.texto}</div>
                              {comp.detalle && (
                                <small className="text-muted">{comp.detalle}</small>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Este producto cumple con los estándares promedio de su categoría.
                    </p>
                  )}
                </div>
              </div>

              {/* Puntuación general (movida aquí) */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-star me-2"></i>
                    Puntuación General
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center">
                      <div 
                        className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-2"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <div className="text-white">
                          <div style={{ fontSize: '35px', fontWeight: 'bold', lineHeight: '1' }}>
                            {promedioValoraciones}
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.9 }}>
                            / 10
                          </div>
                        </div>
                      </div>
                      <div className="text-muted small">Puntuación promedio</div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="small">Relación calidad-precio</span>
                          <span className="small fw-bold text-primary">
                            {valoraciones.find(v => v.nombre.includes('económico') || v.nombre.includes('Precio'))?.valor.toFixed(1) || '7.5'}/10
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-success"
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        La puntuación general se calcula basándose en especificaciones técnicas, 
                        características especiales, precio y comparación con productos similares.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de características principales */}
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Características Destacadas
                  </h5>
                </div>
                <div className="card-body">
                  {producto.caracteristicas_especiales && producto.caracteristicas_especiales.length > 0 ? (
                    <div className="row g-2">
                      {producto.caracteristicas_especiales.map((caract, idx) => (
                        <div key={idx} className="col-md-6">
                          <div className="border rounded p-2 bg-light">
                            <i className="bi bi-check-lg text-success me-2"></i>
                            <span className="small">{caract}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No hay características destacadas disponibles.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {vistaActual === 'specs' && (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-cpu me-2"></i>
                  Especificaciones Técnicas
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Object.entries(producto).map(([key, value], index) => {
                    if (!['id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales'].includes(key) && typeof value !== 'object') {
                      return (
                        <div key={index} className="col-md-6">
                          <div className="card border-primary bg-light h-100">
                            <div className="card-body py-3">
                              <div className="text-primary text-uppercase fw-bold mb-1" style={{ fontSize: '11px' }}>
                                {key.replace(/_/g, ' ')}
                              </div>
                              <div className="text-dark fw-bold">
                                {value}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}

          {vistaActual === 'caracteristicas' && (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-stars me-2"></i>
                  Características Especiales
                </h5>
              </div>
              <div className="card-body">
                {producto.caracteristicas_especiales && producto.caracteristicas_especiales.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {producto.caracteristicas_especiales.map((caract, index) => (
                      <li key={index} className="list-group-item bg-light border-success mb-2 rounded">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span className="text-dark fw-bold">{caract}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Este producto no tiene características especiales registradas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-4">
            <div className="d-grid gap-2">
              <Link to={`/categoria/${categoria}`} className="btn btn-outline-primary btn-lg">
                <i className="bi bi-arrow-left me-2"></i>
                Volver a {categoria}
              </Link>
              <Link to="/comparar" className="btn btn-primary btn-lg">
                <i className="bi bi-arrow-left-right me-2"></i>
                Comparar con otros productos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Similares */}
      <div className="mt-5">
        <h3 className="mb-4">
          <i className="bi bi-grid me-2"></i>
          Productos Similares de {producto.marca}
        </h3>
        <div className="row">
          {dispositivosData[categoria]
            ?.filter(p => p.id !== producto.id && p.marca === producto.marca)
            .slice(0, 3)
            .map(p => (
              <div key={p.id} className="col-md-4 mb-3">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="card-title mb-3">{p.nombre}</h6>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-primary fw-bold fs-5">{formatPrecio(p.precio)}</span>
                      <span className="badge bg-light text-dark border">
                        {calcularPuntuacion()} pts
                      </span>
                    </div>
                    <Link 
                      to={`/producto/${categoria}/${p.id}`} 
                      className="btn btn-outline-primary w-100"
                    >
                      <i className="bi bi-eye me-2"></i>
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {dispositivosData[categoria]?.filter(p => p.id !== producto.id && p.marca === producto.marca).length === 0 && (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            No hay otros productos de esta marca disponibles en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
