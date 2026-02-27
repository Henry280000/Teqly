import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState } from 'react';

// componente de tarjeta para mostrar un producto individual
function ProductCard({ producto, categoria, onAddToCompare }) {
  // estado para detectar si la imagen del producto no carga
  const [imagenError, setImagenError] = useState(false);

  // formatea el precio a moneda mexicana (ej: 15999 → $15,999.00 MXN)
  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  };

  // retorna el ícono de bootstrap según la categoría
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

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        {/* imagen del producto o ícono si falla */}
        {producto.imagen && !imagenError ? (
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'contain', backgroundColor: '#f8f9fa', padding: '10px' }}
            onError={() => setImagenError(true)}
          />
        ) : (
          <div 
            className="card-img-top bg-light d-flex align-items-center justify-content-center" 
            style={{ height: '200px' }}
          >
            <i className={`bi bi-${getCategoryIcon(categoria)} text-secondary`} style={{ fontSize: '64px' }}></i>
          </div>
        )}
        {/* información del producto */}
        <div className="card-body">
          {/* título y marca */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{producto.nombre}</h5>
            <span className="badge bg-info">{producto.marca}</span>
          </div>
          {/* precio formateado */}
          <h4 className="text-primary mb-3">{formatPrecio(producto.precio)}</h4>
          
          {/* especificaciones principales */}
          <div className="mb-3">
            {Object.entries(producto).slice(3, 7).map(([key, value], index) => {
              if (key !== 'imagen' && key !== 'caracteristicas_especiales' && typeof value !== 'object') {
                return (
                  <div key={index} className="mb-1">
                    <small className="text-muted">
                      <strong>{key.replace(/_/g, ' ')}: </strong>
                      {value}
                    </small>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* características especiales en badges */}
          {producto.caracteristicas_especiales && (
            <div className="mb-3">
              <small className="text-muted d-block mb-1"><strong>Características:</strong></small>
              <div className="d-flex flex-wrap gap-1">
                {producto.caracteristicas_especiales.slice(0, 3).map((caract, index) => (
                  <span key={index} className="badge bg-secondary" style={{ fontSize: '11px' }}>
                    {caract}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* botones de acción */}
        <div className="card-footer bg-transparent border-top-0">
          <div className="d-grid gap-2">
            <Link 
              to={`/producto/${categoria}/${producto.id}`}
              className="btn btn-primary btn-sm"
            >
              <i className="bi bi-eye me-2"></i>
              Ver detalles
            </Link>
            <button 
              className="btn btn-outline-info btn-sm"
              onClick={() => onAddToCompare(producto, categoria)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar a comparar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// validación de props
ProductCard.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    marca: PropTypes.string.isRequired,
    precio: PropTypes.number.isRequired,
    imagen: PropTypes.string,
    caracteristicas_especiales: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  categoria: PropTypes.string.isRequired,
  onAddToCompare: PropTypes.func.isRequired
};

export default ProductCard;
