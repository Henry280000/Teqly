import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../Services/api';

// Registro
export const registro = createAsyncThunk('auth/registro', async (datos, { rejectWithValue }) => {
  try {
    const res = await api.post('/usuarios/registro', datos);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.mensaje || 'Error al registrarse');
  }
});

// Login
export const login = createAsyncThunk('auth/login', async (datos, { rejectWithValue }) => {
  try {
    const res = await api.post('/usuarios/login', datos);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.mensaje || 'Error al iniciar sesión');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    },
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registro.fulfilled, (state, action) => {
        state.loading = false;
        state.usuario = action.payload.usuario;
        state.token = action.payload.token;
      })
      .addCase(registro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.usuario = action.payload.usuario;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, limpiarError } = authSlice.actions;
export default authSlice.reducer;