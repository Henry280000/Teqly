import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../Services/api'

// Obtener productos por categoría
export const obtenerProductosPorCategoria = createAsyncThunk(
  'productos/porCategoria',
  async (categoria, { rejectWithValue }) => {
    try {
      const res = await api.get(`/productos/categoria/${categoria}`);
      return { categoria, productos: res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al obtener productos');
    }
  }
);

// Obtener producto por ID
export const obtenerProductoPorId = createAsyncThunk(
  'productos/porId',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/productos/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al obtener producto');
    }
  }
);

// Buscar productos
export const buscarProductos = createAsyncThunk(
  'productos/buscar',
  async (query, { rejectWithValue }) => {
    try {
      const res = await api.get(`/productos/buscar?q=${query}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.mensaje || 'Error al buscar productos');
    }
  }
);

const productosSlice = createSlice({
  name: 'productos',
  initialState: {
    lista: [],
    productoActual: null,
    resultadosBusqueda: [],
    categoria: null,
    loading: false,
    error: null,
  },
  reducers: {
    limpiarProductos: (state) => {
      state.lista = [];
      state.categoria = null;
    },
    limpiarBusqueda: (state) => {
      state.resultadosBusqueda = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerProductosPorCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProductosPorCategoria.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload.productos;
        state.categoria = action.payload.categoria;
      })
      .addCase(obtenerProductosPorCategoria.rejected, (state, action) => {
        state.loading = false;
        state.lista = [];
        state.error = action.payload || 'Error de conexión con el servidor. Verifica tu conexión a internet.';
      })
      .addCase(obtenerProductoPorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerProductoPorId.fulfilled, (state, action) => {
        state.loading = false;
        state.productoActual = action.payload;
      })
      .addCase(obtenerProductoPorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(buscarProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buscarProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.resultadosBusqueda = action.payload;
      })
      .addCase(buscarProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarProductos, limpiarBusqueda } = productosSlice.actions;
export default productosSlice.reducer;