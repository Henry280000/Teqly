import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import SmartSearch from './pages/SmartSearch';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Favoritos from './pages/Favoritos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:categoria" element={<ProductList />} />
            <Route path="/producto/:categoria/:id" element={<ProductDetail />} />
            <Route path="/comparar" element={<Compare />} />
            <Route path="/busqueda-inteligente" element={<SmartSearch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/favoritos" element={<Favoritos />} />
          </Routes>
        </main>
        <footer className="tq-footer">
          <div className="container">
            <div className="row">
              <div className="col-md-4 mb-4">
                <h5 className="fw-bold mb-3 tq-footer-brand">Teqly</h5>
                <p className="tq-text-muted" style={{ lineHeight: 1.7 }}>La mejor herramienta para comparar dispositivos electrónicos en México</p>
              </div>
              <div className="col-md-4 mb-4">
                <h6 className="fw-bold mb-3 tq-footer-heading">Categorías</h6>
                <ul className="list-unstyled">
                  {['celulares', 'tablets', 'monitores', 'teclados', 'ratones', 'audifonos'].map(cat => (
                    <li key={cat} className="mb-2"><a href={`/categoria/${cat}`} className="tq-footer-link">{cat.charAt(0).toUpperCase() + cat.slice(1)}</a></li>
                  ))}
                </ul>
              </div>
              <div className="col-md-4 mb-4">
                <h6 className="fw-bold mb-3 tq-footer-heading">Herramientas</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/busqueda-inteligente" className="tq-footer-link">Búsqueda Inteligente</a></li>
                  <li className="mb-2"><a href="/comparar" className="tq-footer-link">Comparador</a></li>
                </ul>
              </div>
            </div>
            <hr />
            <div className="text-center"><small className="tq-footer-copy">© 2026 Teqly. Todos los derechos reservados.</small></div>
          </div>
        </footer>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </Router>
  );
}

export default App;