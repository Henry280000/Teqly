import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registro, limpiarError } from '../Store/Slices/authSlice';
import { toast } from 'react-toastify';

function Registro() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, usuario } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ nombre: '', email: '', contraseña: '', confirmarContraseña: '' });

  useEffect(() => { if (usuario) { toast.success(`¡Bienvenido, ${usuario.nombre}!`); navigate('/'); } }, [usuario, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(limpiarError()); } }, [error, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.contraseña !== form.confirmarContraseña) { toast.error('Las contraseñas no coinciden'); return; }
    if (form.contraseña.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    dispatch(registro({ nombre: form.nombre, email: form.email, contraseña: form.contraseña }));
  };

  return (
    <div className="tq-page-centered py-5">
      <div className="tq-page-bg-glow tq-page-bg-glow--right"></div>
      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none"><h2 className="fw-bold tq-text-brand" style={{ fontSize: '2rem' }}>Teqly</h2></Link>
            </div>
            <div className="card border-0 tq-card--auth">
              <div className="card-body p-5">
                <h3 className="fw-bold mb-1 tq-text-primary">Crear cuenta</h3>
                <p className="mb-4 tq-text-muted">Regístrate gratis en Teqly</p>
                <form onSubmit={handleSubmit}>
                  {[
                    { label: 'Nombre', icon: 'person', name: 'nombre', type: 'text', placeholder: 'Tu nombre completo' },
                    { label: 'Email', icon: 'envelope', name: 'email', type: 'email', placeholder: 'tu@email.com' },
                    { label: 'Contraseña', icon: 'lock', name: 'contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres' },
                    { label: 'Confirmar contraseña', icon: 'lock-fill', name: 'confirmarContraseña', type: 'password', placeholder: 'Repite tu contraseña' },
                  ].map((field, idx) => (
                    <div key={idx} className={idx === 3 ? 'mb-4' : 'mb-3'}>
                      <label className="form-label fw-semibold tq-text-secondary">{field.label}</label>
                      <div className="input-group">
                        <span className="input-group-text tq-input-icon"><i className={`bi bi-${field.icon}`}></i></span>
                        <input type={field.type} className="form-control tq-input" name={field.name} placeholder={field.placeholder}
                          value={form[field.name]} onChange={handleChange} required />
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn w-100 py-2 fw-semibold tq-btn-primary" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Creando cuenta...</>) : (<><i className="bi bi-person-plus me-2"></i>Crear cuenta</>)}
                  </button>
                </form>
                <hr className="my-4 tq-dropdown-divider" />
                <p className="text-center mb-0 tq-text-muted">¿Ya tienes cuenta? <Link to="/login" className="fw-semibold text-decoration-none tq-text-indigo">Inicia sesión</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;