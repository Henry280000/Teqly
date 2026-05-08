import { createSlice } from '@reduxjs/toolkit';

const favoritosSlice = createSlice({
  name: 'favoritos',
  initialState: {
    lista: JSON.parse(localStorage.getItem('favoritos')) || [],
  },
  reducers: {
    agregarFavorito: (state, action) => {
      const existe = state.lista.find(
        (p) => p._id === action.payload._id
      );
      if (!existe) {
        state.lista.push(action.payload);
        localStorage.setItem('favoritos', JSON.stringify(state.lista));
      }
    },
    quitarFavorito: (state, action) => {
      state.lista = state.lista.filter((p) => p._id !== action.payload);
      localStorage.setItem('favoritos', JSON.stringify(state.lista));
    },
    limpiarFavoritos: (state) => {
      state.lista = [];
      localStorage.removeItem('favoritos');
    },
  },
});

export const { agregarFavorito, quitarFavorito, limpiarFavoritos } = favoritosSlice.actions;
export default favoritosSlice.reducer;