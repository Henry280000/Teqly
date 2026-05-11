import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice';
import productosReducer from './Slices/productosSlice';
import favoritosReducer from './Slices/favoritosSlice';
import compararReducer from './Slices/compararSlice';
import adminReducer from './Slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    productos: productosReducer,
    favoritos: favoritosReducer,
    comparar: compararReducer,
    admin: adminReducer,
  },
});

export default store;