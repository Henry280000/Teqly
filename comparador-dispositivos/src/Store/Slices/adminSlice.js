import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../Services/api';

// Obtener todos los productos (con filtros opcionales)
export const obtenerTodosAdmin = createAsyncThunk(
  'admin/obtenerTodos',
  async ({ categoria, marca, ordenarPor } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (marca) params.append('marca', marca);
      if (ordenarPor) params.append('ordenarPor', ordenarPor);
      const res = await api.get(`/productos?${params.toString()}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al obtener productos');
    }
  }
);

// Obtener estadísticas
export const obtenerEstadisticas = createAsyncThunk(
  'admin/estadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/productos/estadisticas');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al obtener estadísticas');
    }
  }
);

// Crear producto
export const crearProducto = createAsyncThunk(
  'admin/crear',
  async (datos, { rejectWithValue }) => {
    try {
      const res = await api.post('/productos', datos);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al crear producto');
    }
  }
);

// Actualizar producto
export const actualizarProducto = createAsyncThunk(
  'admin/actualizar',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/productos/${id}`, datos);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al actualizar producto');
    }
  }
);

// Eliminar producto
export const eliminarProducto = createAsyncThunk(
  'admin/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/productos/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al eliminar producto');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    productos: [],
    estadisticas: [],
    loading: false,
    operacionLoading: false,
    error: null,
    operacionError: null,
  },
  reducers: {
    limpiarErrorAdmin: (state) => {
      state.error = null;
      state.operacionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Obtener todos
      .addCase(obtenerTodosAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerTodosAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = action.payload;
      })
      .addCase(obtenerTodosAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Estadísticas
      .addCase(obtenerEstadisticas.pending, (state) => {
        state.loading = true;
      })
      .addCase(obtenerEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        state.estadisticas = action.payload;
      })
      .addCase(obtenerEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Crear
      .addCase(crearProducto.pending, (state) => {
        state.operacionLoading = true;
        state.operacionError = null;
      })
      .addCase(crearProducto.fulfilled, (state, action) => {
        state.operacionLoading = false;
        state.productos.unshift(action.payload);
      })
      .addCase(crearProducto.rejected, (state, action) => {
        state.operacionLoading = false;
        state.operacionError = action.payload;
      })
      // Actualizar
      .addCase(actualizarProducto.pending, (state) => {
        state.operacionLoading = true;
        state.operacionError = null;
      })
      .addCase(actualizarProducto.fulfilled, (state, action) => {
        state.operacionLoading = false;
        const idx = state.productos.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.productos[idx] = action.payload;
      })
      .addCase(actualizarProducto.rejected, (state, action) => {
        state.operacionLoading = false;
        state.operacionError = action.payload;
      })
      // Eliminar
      .addCase(eliminarProducto.pending, (state) => {
        state.operacionLoading = true;
        state.operacionError = null;
      })
      .addCase(eliminarProducto.fulfilled, (state, action) => {
        state.operacionLoading = false;
        state.productos = state.productos.filter(p => p._id !== action.payload);
      })
      .addCase(eliminarProducto.rejected, (state, action) => {
        state.operacionLoading = false;
        state.operacionError = action.payload;
      });
  },
});

export const { limpiarErrorAdmin } = adminSlice.actions;
export default adminSlice.reducer;
