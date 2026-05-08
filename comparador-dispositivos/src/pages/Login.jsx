import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, limpiarError } from '../Store/Slices/authSlice';
import { toast } from 'react-toastify';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, usuario } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', contraseña: '' });

  useEffect(() => { if (usuario) navigate('/'); }, [usuario, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(limpiarError()); } }, [error, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(form)); };

  return (
    <div className="tq-page-centered py-5">
      <div className="tq-page-bg-glow tq-page-bg-glow--left"></div>
      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none"><h2 className="fw-bold tq-text-brand" style={{ fontSize: '2rem' }}>Teqly</h2></Link>
            </div>
            <div className="card border-0 tq-card--auth">
              <div className="card-body p-5">
                <h3 className="fw-bold mb-1 tq-text-primary">Bienvenido de vuelta</h3>
                <p className="mb-4 tq-text-muted">Inicia sesión en tu cuenta</p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold tq-text-secondary">Email</label>
                    <div className="input-group">
                      <span className="input-group-text tq-input-icon"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control tq-input" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold tq-text-secondary">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text tq-input-icon"><i className="bi bi-lock"></i></span>
                      <input type="password" className="form-control tq-input" name="contraseña" placeholder="Tu contraseña" value={form.contraseña} onChange={handleChange} required />
                    </div>
                  </div>
                  <button type="submit" className="btn w-100 py-2 fw-semibold tq-btn-primary" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...</>) : (<><i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</>)}
                  </button>
                </form>
                <hr className="my-4 tq-dropdown-divider" />
                <p className="text-center mb-0 tq-text-muted">¿No tienes cuenta? <Link to="/registro" className="fw-semibold text-decoration-none tq-text-indigo">Regístrate gratis</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;