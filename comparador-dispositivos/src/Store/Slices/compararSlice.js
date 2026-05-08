import { createSlice } from '@reduxjs/toolkit';

// Leer lista guardada
const listaGuardada = JSON.parse(localStorage.getItem('comparar') || '[]');

const guardar = (lista) => localStorage.setItem('comparar', JSON.stringify(lista));

const compararSlice = createSlice({
  name: 'comparar',
  initialState: {
    lista: listaGuardada,
  },
  reducers: {
    agregarAComparar: (state, action) => {
      if (state.lista.length >= 4) return;
      const existe = state.lista.find(
        (p) => p._id === action.payload._id && p.categoria === action.payload.categoria
      );
      if (!existe) {
        state.lista.push(action.payload);
        guardar(state.lista);
      }
    },

    quitarDeComparar: (state, action) => {
      state.lista = state.lista.filter(
        (p) => !(p._id === action.payload._id && p.categoria === action.payload.categoria)
      );
      guardar(state.lista);
    },
    limpiarComparar: (state) => {
      state.lista = [];
      guardar([]);
    },
  },
});

export const { agregarAComparar, quitarDeComparar, limpiarComparar } = compararSlice.actions;
export default compararSlice.reducer;