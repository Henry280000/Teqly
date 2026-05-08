import { Link } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';

function ProductCard({ producto, categoria, onAddToCompare, onToggleFavorito, esFavorito }) {
  const [imagenError, setImagenError] = useState(false);
  const formatPrecio = (p) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p);
  const getCategoryIcon = (c) => ({ celulares: 'phone', tablets: 'tablet', monitores: 'display', teclados: 'keyboard', ratones: 'mouse', audifonos: 'headphones' }[c] || 'device');

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0 tq-card tq-card--hover">
        <div className="position-relative">
          {producto.imagen && !imagenError ? (
            <img src={producto.imagen} alt={producto.nombre} className="card-img-top tq-product-img" onError={() => setImagenError(true)} />
          ) : (
            <div className="tq-product-img-placeholder"><i className={`bi bi-${getCategoryIcon(categoria)}`}></i></div>
          )}
          <button className={`btn btn-sm position-absolute top-0 end-0 m-2 ${esFavorito ? 'tq-fav-btn--active' : ''} tq-fav-btn`}
            onClick={() => onToggleFavorito(producto)} title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
            <i className={`bi bi-heart${esFavorito ? '-fill' : ''}`}></i>
          </button>
          <span className="position-absolute top-0 start-0 m-2 badge tq-badge-indigo-solid">{categoria}</span>
        </div>
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0 tq-text-primary" style={{ fontSize: '15px' }}>{producto.nombre}</h5>
            <span className="badge ms-2 tq-badge-indigo">{producto.marca}</span>
          </div>
          <h4 className="mb-3 tq-text-indigo" style={{ fontWeight: 700 }}>{formatPrecio(producto.precio)}</h4>
          <div className="mb-3 flex-grow-1">
            {Object.entries(producto)
              .filter(([k]) => !['_id', 'id', 'nombre', 'marca', 'precio', 'imagen', 'caracteristicas_especiales', 'categoria', '__v', 'creadoPor', 'createdAt', 'updatedAt'].includes(k))
              .slice(0, 4).map(([k, v], i) => typeof v !== 'object' && (
                <div key={i} className="mb-1"><small className="tq-text-muted"><strong className="text-capitalize tq-text-secondary">{k.replace(/_/g, ' ')}: </strong>{v}</small></div>
              ))}
          </div>
          {producto.caracteristicas_especiales?.length > 0 && (
            <div className="mb-3"><div className="d-flex flex-wrap gap-1">
              {producto.caracteristicas_especiales.slice(0, 2).map((c, i) => (<span key={i} className="badge tq-badge-green">{c}</span>))}
              {producto.caracteristicas_especiales.length > 2 && (<span className="badge tq-badge-indigo" style={{ fontSize: '10px' }}>+{producto.caracteristicas_especiales.length - 2} más</span>)}
            </div></div>
          )}
        </div>
        <div className="card-footer border-0 pb-3 px-3" style={{ background: 'transparent' }}>
          <div className="d-grid gap-2">
            <Link to={`/producto/${categoria}/${producto._id}`} className="btn btn-sm tq-btn-primary"><i className="bi bi-eye me-2"></i>Ver detalles</Link>
            <button className="btn btn-sm tq-btn-outline-cyan" onClick={() => onAddToCompare(producto)}><i className="bi bi-plus-circle me-2"></i>Agregar a comparar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = { producto: PropTypes.object.isRequired, categoria: PropTypes.string.isRequired, onAddToCompare: PropTypes.func.isRequired, onToggleFavorito: PropTypes.func.isRequired, esFavorito: PropTypes.bool.isRequired };
export default ProductCard;