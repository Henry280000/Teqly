import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import SmartSearch from './pages/SmartSearch';
import './App.css';

function App() {
  const [compararList, setCompararList] = useState([]);

  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/categoria/:categoria" 
              element={
                <ProductList 
                  compararList={compararList}
                  setCompararList={setCompararList}
                />
              } 
            />
            <Route path="/producto/:categoria/:id" element={<ProductDetail />} />
            <Route 
              path="/comparar" 
              element={
                <Compare 
                  compararList={compararList}
                  setCompararList={setCompararList}
                />
              } 
            />
            <Route 
              path="/busqueda-inteligente" 
              element={
                <SmartSearch 
                  compararList={compararList}
                  setCompararList={setCompararList}
                />
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container">
            <div className="row">
              <div className="col-md-4 mb-3">
                <h5>
                  <i className="bi bi-phone me-2"></i>
                  Comparador Dispositivos
                </h5>
                <p>
                  La mejor herramienta para comparar dispositivos electrónicos en México
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <h6>Categorías</h6>
                <ul className="list-unstyled">
                  <li><a href="/categoria/celulares">Celulares</a></li>
                  <li><a href="/categoria/tablets">Tablets</a></li>
                  <li><a href="/categoria/monitores">Monitores</a></li>
                  <li><a href="/categoria/teclados">Teclados</a></li>
                  <li><a href="/categoria/ratones">Ratones</a></li>
                  <li><a href="/categoria/audifonos">Audífonos</a></li>
                </ul>
              </div>
              <div className="col-md-4 mb-3">
                <h6>Herramientas</h6>
                <ul className="list-unstyled">
                  <li><a href="/busqueda-inteligente">Búsqueda Inteligente</a></li>
                  <li><a href="/comparar">Comparador</a></li>
                </ul>
              </div>
            </div>
            <hr />
            <div className="footer-copyright">
              <small>© 2026 Comparador Dispositivos. Todos los derechos reservados.</small>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
