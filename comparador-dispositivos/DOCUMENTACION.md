# Teqly — Documentación Técnica Completa

> Comparador de Dispositivos Electrónicos para México  
> Última actualización: 7 de mayo de 2026

---

## 1. Descripción General

**Teqly** es una plataforma web fullstack que permite a usuarios mexicanos explorar, filtrar, comparar y guardar como favoritos dispositivos electrónicos (celulares, tablets, monitores, teclados, ratones y audífonos) con precios en MXN.

| Capa | Tecnologías |
|------|------------|
| **Frontend** | React 18, Vite 5, Redux Toolkit, React Router v7, Bootstrap 5, React Toastify, Axios |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose, JWT |
| **Despliegue** | Backend en Render: `https://backend-teqly.onrender.com` |

---

## 2. Arquitectura de Archivos

```
comparador-dispositivos/
├── index.html                 # HTML de entrada + SEO + Bootstrap JS
├── vite.config.js             # Config Vite (puerto 5173 forzado)
├── .env                       # VITE_API_URL
├── .gitignore
├── eslint.config.js           # Config ESLint
├── DOCUMENTACION.md           # Este archivo
├── README.md
│
├── public/
│   ├── _redirects             # Redireccion SPA para Netlify
│   └── vite.svg               # Favicon
│
├── src/
│   ├── main.jsx               # Entrada React + Provider Redux
│   ├── App.jsx                # Router + Layout (Navbar/Footer)
│   ├── App.css                # Importa los 3 archivos CSS
│   │
│   ├── styles/
│   │   ├── teqly.css          # Base: tokens, dimensiones, tipografía (~970 líneas)
│   │   ├── teqly-dark.css     # Tema oscuro: solo colores/fondos/sombras
│   │   └── teqly-light.css    # Tema claro: solo colores/fondos/sombras
│   │
│   ├── hooks/
│   │   └── useTheme.js        # Hook para toggle dark/light
│   │
│   ├── Services/
│   │   └── api.js             # Cliente Axios con interceptores JWT
│   │
│   ├── Store/
│   │   ├── index.js           # configureStore con 4 reducers
│   │   └── Slices/
│   │       ├── authSlice.js       # Autenticación
│   │       ├── productosSlice.js  # Productos (API)
│   │       ├── compararSlice.js   # Comparador
│   │       └── favoritosSlice.js  # Favoritos
│   │
│   ├── components/
│   │   ├── Navbar.jsx         # Navegación + toggle de tema
│   │   ├── ProductCard.jsx    # Tarjeta de producto
│   │   └── FilterSidebar.jsx  # Sidebar de filtros
│   │
│   └── pages/
│       ├── Home.jsx           # Página de inicio
│       ├── ProductList.jsx    # Lista por categoría
│       ├── ProductDetail.jsx  # Detalle con radar chart
│       ├── Compare.jsx        # Comparador con valoraciones
│       ├── SmartSearch.jsx    # Búsqueda inteligente
│       ├── Favoritos.jsx      # Productos favoritos
│       ├── Login.jsx          # Inicio de sesión
│       └── Registro.jsx       # Registro de usuario
│
└── Backend de programacion web copy/  # Backend (desplegado en Render)
    ├── index.js               # Express server + CORS + rutas
    └── src/
        ├── config/            # database.js, environment.js
        ├── models/            # Producto.js (Mongoose schema)
        ├── controllers/       # productoController, smartSearchController, userController
        ├── middlewares/        # auth.js (JWT protect/admin), errorHandler.js
        └── routes/            # productoRoutes, smartSearchRoutes, userRoutes, phoneRoutes
```

---

## 3. Descripción Detallada por Archivo

### 3.1 Configuración

#### `vite.config.js`
- **`server.port: 5173`** — Puerto forzado para coincidir con CORS del backend
- **`server.strictPort: true`** — Evita que Vite use otro puerto si 5173 está ocupado
- **Plugin:** `@vitejs/plugin-react`

#### `.env`
```
VITE_API_URL=https://backend-teqly.onrender.com/api
```

#### `index.html`
- Title: "Teqly — Comparador de Dispositivos"
- Meta description para SEO
- Imports: Bootstrap 5 CSS/JS, Bootstrap Icons

---

### 3.2 Servicios — `src/Services/api.js`

Cliente HTTP centralizado con Axios.

| Elemento | Descripción |
|----------|-------------|
| `baseURL` | Lee `VITE_API_URL` del `.env`, fallback a `localhost:8000/api` |
| **Request interceptor** | Lee `token` de localStorage y lo adjunta como `Authorization: Bearer {token}` en cada petición |
| **Response interceptor** | Si recibe HTTP 401, limpia token y usuario de localStorage y redirige a `/login` |

---

### 3.3 Estado Global (Redux) — `src/Store/`

#### `index.js` — Store Configuration
Combina 4 reducers: `auth`, `productos`, `favoritos`, `comparar`.

#### `authSlice.js` — Autenticación

| Thunk/Reducer | Tipo | Descripción |
|---------------|------|-------------|
| `registro(datos)` | AsyncThunk | `POST /api/usuarios/registro` → guarda token y usuario en localStorage + Redux |
| `login(datos)` | AsyncThunk | `POST /api/usuarios/login` → guarda token y usuario en localStorage + Redux |
| `logout()` | Reducer | Limpia `usuario` y `token` de Redux y localStorage |
| `limpiarError()` | Reducer | Resetea `state.error` a null |

**Estado inicial:** Lee `usuario` y `token` de localStorage para persistencia de sesión.

**Flujo de error:** Si el thunk falla, guarda el mensaje en `state.error` → el componente lo muestra con `toast.error()` y llama `limpiarError()`.

#### `productosSlice.js` — Productos

| Thunk/Reducer | Tipo | Endpoint | Descripción |
|---------------|------|----------|-------------|
| `obtenerProductosPorCategoria(cat)` | AsyncThunk | `GET /api/productos/categoria/{cat}` | Carga todos los productos de una categoría |
| `obtenerProductoPorId(id)` | AsyncThunk | `GET /api/productos/{id}` | Carga un producto individual |
| `buscarProductos(query)` | AsyncThunk | `GET /api/productos/buscar?q={query}` | Búsqueda por texto libre |
| `limpiarProductos()` | Reducer | — | Limpia lista y categoría |
| `limpiarBusqueda()` | Reducer | — | Limpia resultados de búsqueda |

**Estado:** `{ lista[], productoActual, resultadosBusqueda[], categoria, loading, error }`

**Manejo de error en categoría:** Si falla, limpia `lista` a [] y muestra mensaje descriptivo de conexión.

#### `compararSlice.js` — Comparador

| Reducer | Descripción |
|---------|-------------|
| `agregarAComparar(producto)` | Agrega producto si no existe y hay <4 en la lista |
| `quitarDeComparar({_id, categoria})` | Remueve por ID + categoría |
| `limpiarComparar()` | Vacía toda la lista |

**Validaciones:** Máximo 4 productos. No permite duplicados (por `_id` + `categoria`).

**Nota:** No persiste en localStorage (se pierde al recargar). Es intencional: la comparación es efímera.

#### `favoritosSlice.js` — Favoritos

| Reducer | Descripción |
|---------|-------------|
| `agregarFavorito(producto)` | Agrega si no existe, guarda en localStorage |
| `quitarFavorito(id)` | Remueve por `_id`, actualiza localStorage |
| `limpiarFavoritos()` | Vacía lista y remueve de localStorage |

**Persistencia:** Se guarda en `localStorage.favoritos` como JSON. Se hidrata al iniciar la app.

**Nota:** Aunque persiste localmente, la UI requiere sesión activa para acceder a la página de favoritos.

---

### 3.4 Componentes — `src/components/`

#### `Navbar.jsx`
- Logo "Teqly" con gradiente indigo→cyan
- Links: Inicio, Categorías (dropdown con 6 categorías), Búsqueda Inteligente, Comparar, Favoritos
- **Badge de conteo** en Comparar y Favoritos
- **Toggle dark/light** — Botón sol/luna que llama `toggleTheme()` del hook `useTheme`
- **Reinicialización de dropdowns** — `useEffect` que re-instancia `bootstrap.Dropdown` después de cada render React
- **Dropdown de usuario** (logueado): nombre, email, favoritos, admin, cerrar sesión
- **Botones auth** (sin sesión): Iniciar sesión (outline), Registrarse (primary)
- Usa clases `tq-navbar`, `tq-dropdown-menu`, `tq-navbar-avatar`

#### `ProductCard.jsx`
- **Props:** `producto`, `categoria`, `onAddToCompare`, `onToggleFavorito`, `esFavorito`
- Muestra imagen con fallback a ícono de categoría si falla la carga
- Badge de categoría (esquina superior izquierda)
- Botón corazón flotante (esquina superior derecha)
- Nombre, marca (badge), precio formateado en MXN
- Hasta 4 especificaciones dinámicas (filtra campos de metadata)
- Hasta 2 características especiales (badges verdes) + contador "+N más"
- Botones: "Ver detalles" (link a ProductDetail), "Agregar a comparar"
- Efecto hover: translateY(-4px) + sombra

#### `FilterSidebar.jsx`
- **Props:** `productos[]`, `onFilter(filtros)`
- **Filtros disponibles:**
  - Ordenamiento: nombre, precio asc/desc, marca
  - Rango de precio: inputs numéricos min/max
  - Marca: select dinámico (marcas únicas de productos cargados)
  - Filtros específicos: detecta automáticamente atributos de la categoría con <20 valores únicos y los muestra como selects
- Botones: Aplicar filtros, Limpiar filtros

---

### 3.5 Páginas — `src/pages/`

#### `Home.jsx`
**Secciones:**
1. **Hero** — Gradiente oscuro con badge "Plataforma #1 en México", título con gradiente, subtítulo, CTAs (Búsqueda Inteligente + Crear cuenta), ícono decorativo con floating badges
2. **Categorías** — Grid de 6 tarjetas (fondo blanco) con ícono, nombre y descripción. Hover con sombra del color de la categoría
3. **¿Por qué Teqly?** — 3 feature cards (Filtros Avanzados, Búsqueda Inteligente, Comparación Múltiple)
4. **CTA** — Sección dark con llamada a la Búsqueda Inteligente

#### `ProductList.jsx`
- **Ruta:** `/categoria/:categoria`
- **useEffect:** Al cambiar categoría, despacha `obtenerProductosPorCategoria`
- **Layout:** Sidebar (col-3) + contenido (col-9)
- **Funciones:**
  - `handleAddToCompare(p)` — Valida máx 4 y no duplicados, agrega al store
  - `handleToggleFav(p)` — Valida sesión activa, alterna favorito
  - **Filtrado local:** Aplica precio min/max, marca, filtros específicos, búsqueda por nombre/marca (normaliza acentos), ordenamiento
- **Estados de UI:** Loading (spinner), Error (alert), Vacío (ícono + mensaje), Lista (grid de ProductCards)
- **Barra de comparación:** Si hay productos en comparar, muestra banner con conteo y link

#### `ProductDetail.jsx`
- **Ruta:** `/producto/:categoria/:id`
- **useEffect:** Carga producto por ID + productos de la misma categoría (para similares)
- **Layout:** Sidebar (col-4: imagen, botones, score) + contenido (col-8: tabs)
- **Tabs:** Resumen, Especificaciones, Características
- **Funciones principales:**
  - `calcularPuntuacion(prod)` — Puntuación base 50 + 3pts por característica + bonus por precio
  - `generarValoraciones()` — Genera 5 métricas dinámicas según la categoría (ej: celulares → Pantalla, Rendimiento, Cámaras, Batería, Diseño)
  - `generarPuntosRadar()` — Calcula coordenadas SVG para polígono del gráfico radar
  - `generarPuntosMax()` — Calcula puntos del borde del radar
  - `handleToggleFavorito()` — Con validación de sesión
  - `handleAgregarComparar()` — Con validación de máximo 4
- **Radar chart SVG:** Círculos concéntricos, líneas radiales, polígono de datos, puntos, labels
- **Progress bars:** Barras de 6px con colores según valor (≥8 verde, ≥6 indigo, <6 amber)
- **Productos similares:** Filtra por misma marca, hasta 3, excluye el actual

#### `Compare.jsx`
- **Ruta:** `/comparar`
- **Layout:** Grid de 4 columnas (productos + slots vacíos)
- **Funciones:**
  - `handleRemove(id, cat)` — Quita un producto
  - `handleClearAll()` — Pide confirmación y limpia todo
  - `calcularPuntuacion(prod)` — Puntuación base 50 + bonus
  - `generarValoraciones(prod)` — 3 barras: calidad-precio, características, general
- **Secciones por tarjeta:** Imagen, nombre/marca/precio, círculo de puntuación (md), 3 barras de progreso con colores, 5 especificaciones, hasta 4 características con iconos check, botón "Ver detalles"
- **Slots vacíos:** Borde dashed, ícono "+", link a categorías
- **Empty state:** Ícono, descripción y links

#### `SmartSearch.jsx`
- **Ruta:** `/busqueda-inteligente`
- **Dos vistas:** Formulario (default) y Resultados (después de buscar)
- **Formulario:**
  - Step 1: Selector visual de categoría (6 íconos clickeables en grid)
  - Step 2: Presupuesto min/max con input groups
  - Step 3: Marca (select dinámico, solo aparece cuando hay categoría seleccionada, carga marcas con `GET /api/smart/marcas/:cat`)
  - Step 4: Palabras clave con tags sugeridos (gaming, fotografía, batería, USB-C, inalámbrico, profesional) que hacen toggle
- **Función `buscar()`:** Construye URLSearchParams, llama `GET /api/smart/buscar`, guarda resultados
- **Vista de resultados:**
  - Top 1: Card full-width con imagen grande (200px), 6 specs, todas las características
  - Posiciones 2-5: Grid 2 columnas, imagen compacta (140px), 3 specs
  - Medallas: Trofeo (oro), Award (plata), Gem (bronce), Estrella (4-5)
  - Labels: "Mejor opción", "2do lugar", etc.
  - Barra de acento coloreada en top de cada card
  - Score del algoritmo visible
  - Acciones: Ver detalles, Comparar, Favorito

**Algoritmo de scoring del backend:**
```
score = num_caracteristicas / (precio / 1000)
si busqueda → score *= (1 + coincidencias_en_características * 2)
resultado = top 5 ordenados por score desc
```

#### `Login.jsx`
- **Ruta:** `/login`
- Formulario: email + contraseña
- Despacha `login(form)` al submit
- **useEffect:** Si `usuario` existe, redirige a `/`
- **useEffect:** Si hay error, muestra toast y limpia error
- Link a registro

#### `Registro.jsx`
- **Ruta:** `/registro`
- Formulario: nombre, email, contraseña, confirmar contraseña
- **Validaciones cliente:**
  - Contraseñas coinciden
  - Mínimo 6 caracteres
- Despacha `registro(datos)` al submit
- **useEffect:** Si se registra exitosamente, muestra bienvenida y redirige
- Link a login

#### `Favoritos.jsx`
- **Ruta:** `/favoritos`
- **3 estados de UI:**
  1. Sin sesión → Mensaje + links a login/registro
  2. Lista vacía → Mensaje + link a explorar
  3. Con favoritos → Grid de cards (col-md-6 col-lg-4)
- **Funciones:**
  - `handleQuitar(id)` — Quita de favoritos
  - `handleLimpiar()` — Pide confirmación, limpia todo
  - `handleAgregarAComparar(producto)` — Agrega a comparar
- **Tarjetas:** Imagen, nombre+marca, precio, badges de características (max 3), botones "Ver detalles" + "Comparar"
- Todos los estilos usan clases `tq-*` para responder al tema dark/light

---

### 3.6 Estilos — `src/styles/`

Arquitectura de 3 archivos con separación base/temas.

#### `teqly.css` — Base (~970 líneas)
Contiene **todo** lo estructural: tokens, tipografía, dimensiones, resets. Los temas lo heredan.

- **Reset de Bootswatch Lux:** `text-transform: none !important` en headings, botones, badges, etc.
- **Tipografía fija:** `Inter` para UI, `JetBrains Mono` para precios/labels
- **Tamaños de heading fijos:** h1=2.2rem → h6=0.875rem (no cambian entre temas)

**Design Tokens (CSS Custom Properties):**

| Categoría | Tokens principales |
|-----------|-------------------|
| Fondos | `--tq-bg-base`, `--tq-bg-card`, `--tq-bg-input` |
| Bordes | `--tq-border-subtle`, `--tq-border-accent`, `--tq-border-input`, `--tq-border-strong` |
| Colores | `--tq-indigo`, `--tq-cyan`, `--tq-green`, `--tq-red`, `--tq-amber` (+ variantes light/pale) |
| Texto | `--tq-text-primary`, `--tq-text-secondary`, `--tq-text-muted`, `--tq-text-dim`, `--tq-text-faint` |
| Gradientes | `--tq-gradient-indigo`, `--tq-gradient-brand`, `--tq-gradient-dark`, `--tq-gradient-hero` |
| Radios | `--tq-radius-sm` (8px) → `--tq-radius-2xl` (20px) |
| Sombras | `--tq-shadow-card`, `--tq-shadow-hover`, `--tq-shadow-modal` |

**Clases por sección:**

| Sección | Clases |
|---------|--------|
| Páginas | `tq-page`, `tq-page-centered`, `tq-page-bg-glow` |
| Tarjetas | `tq-card`, `tq-card--auth`, `tq-card--hover`, `tq-card-header` |
| Botones | `tq-btn-primary`, `tq-btn-outline-indigo`, `tq-btn-outline-cyan`, `tq-btn-outline-red`, `tq-btn-ghost` |
| Insignias | `tq-badge-indigo`, `tq-badge-green`, `tq-badge-cyan`, `tq-badge-amber`, `tq-badge-count` |
| Texto | `tq-text-primary`, `tq-text-brand`, `tq-text-price`, `tq-text-label` |
| Inputs | `tq-input`, `tq-input-icon`, `tq-select`, `tq-search-input` |
| Navbar | `tq-navbar`, `tq-navbar-brand`, `tq-dropdown-menu`, `tq-navbar-avatar` |
| Footer | `tq-footer`, `tq-footer-brand`, `tq-footer-link` |
| Radar | `tq-radar-grid`, `tq-radar-polygon`, `tq-radar-point`, `tq-radar-label` |
| Puntuación | `tq-score-circle` (sm/md/lg), `tq-score-value`, `tq-score-label` |
| Progreso | `tq-progress-track`, `tq-progress-bar--green/indigo/amber` |
| Producto | `tq-product-img`, `tq-product-img-placeholder`, `tq-fav-btn`, `tq-remove-btn` |
| Comparar | `tq-compare-empty`, `tq-compare-bar` |
| Hero | `tq-hero`, `tq-hero-title`, `tq-hero-float`, `tq-cat-card`, `tq-cat-icon` |
| Vacíos | `tq-empty-icon`, `tq-empty-title`, `tq-empty-desc` |

#### `teqly-dark.css` — Tema oscuro (Quantum Pulse)
- Solo sobrescribe **colores, fondos, bordes y sombras** vía `[data-theme="dark"]`
- Glassmorphism en tarjetas (`backdrop-filter: blur`)
- Gradiente de 3 colores en botones/score: indigo→violeta→cyan
- Sombras con glow de indigo en hover

#### `teqly-light.css` — Tema claro
- Solo sobrescribe **colores, fondos, bordes y sombras** vía `[data-theme="light"]`
- Fondos blancos, bordes sutiles, sombras suaves
- Footer y CTA se mantienen oscuros
- Override de legibilidad en textos (`tq-text-indigo` → #4338ca en vez de #818cf8)

#### `useTheme.js` — Hook de tema
- Lee el tema guardado de `localStorage('teqly-theme')`, default: `'dark'`
- Aplica `data-theme` al `<html>` con `useEffect`
- Exporta `{ theme, toggleTheme }`
- Se usa en `Navbar.jsx` para el botón sol/luna

---

## 4. API del Backend

### Endpoints de Productos (`/api/productos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | No | Todos los productos (query: categoria, marca, ordenarPor) |
| GET | `/estadisticas` | No | Agregaciones por categoría (total, precio promedio/min/max) |
| GET | `/categoria/:cat` | No | Productos filtrados por categoría |
| GET | `/buscar?q=` | No | Búsqueda por texto en nombre, marca, descripción |
| GET | `/:id` | No | Producto individual por MongoDB ID |
| POST | `/` | Admin | Crear producto |
| PUT | `/:id` | Admin | Actualizar producto |
| DELETE | `/:id` | Admin | Eliminar producto |

### Endpoints Smart Search (`/api/smart`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/buscar?categoria&presupuestoMin&presupuestoMax&marca&busqueda` | Búsqueda inteligente con scoring, retorna top 5 |
| GET | `/marcas/:categoria` | Marcas distintas disponibles por categoría (solo productos disponibles) |

### Endpoints Usuarios (`/api/usuarios`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/registro` | No | Crear cuenta (nombre, email, contraseña) → retorna JWT |
| POST | `/login` | No | Autenticación → retorna JWT |
| GET | `/miPerfil` | JWT | Datos del usuario autenticado |
| GET | `/` | Admin | Listar todos los usuarios |
| PUT | `/:id` | JWT | Actualizar perfil |
| DELETE | `/:id` | JWT | Eliminar cuenta |

### Modelo Producto (MongoDB)

```
categoria: enum [celulares, tablets, monitores, teclados, ratones, audifonos]
nombre, marca, precio (requeridos)
imagen, descripcion (opcionales)
--- Celulares/Tablets ---
sistema_operativo, procesador, ram, almacenamiento, pantalla, camara, bateria
--- Monitores ---
resolucion, tamaño_pantalla, panel_type, tasa_refresco, tiempo_respuesta
--- Teclados ---
tipo, conexion, iluminacion, idioma
--- Ratones ---
sensor, dpi, ergonomia, botones
--- Audífonos ---
conductores, impedancia, rango_frecuencia, noise_cancellation
--- Comunes ---
caracteristicas_especiales: [String]
calificacion: 0-5, disponible: Boolean
```

---

## 5. Flujos de Usuario

### 5.1 Explorar productos
`Home → Click categoría → ProductList (carga desde API) → Aplicar filtros → Click producto → ProductDetail`

### 5.2 Búsqueda inteligente
`Home/Navbar → SmartSearch → Seleccionar categoría + filtros → Buscar → Ver Top 5 → Click detalles/comparar/favorito`

### 5.3 Comparar productos
`ProductList/Detail/SmartSearch → "Agregar a comparar" → Navbar "Comparar" → Compare (hasta 4 lado a lado)`

### 5.4 Favoritos
`Login → ProductList/Detail/SmartSearch → "Favorito" → Navbar "Favoritos" → Favoritos (grid)`

### 5.5 Autenticación
`Navbar → Login → POST /api/usuarios/login → JWT en localStorage → Navbar muestra avatar → Logout limpia todo`

---

## 6. Registro de Cambios

| # | Cambio | Archivo(s) |
|---|--------|-----------|
| 1 | Fix import case-sensitivity | SmartSearch.jsx |
| 2 | Fix rutas login/registro lowercase | Navbar.jsx |
| 3 | Fix links del footer | App.jsx |
| 4 | Eliminada dependencia de dispositivos.json | ProductDetail.jsx |
| 5 | Eliminada carpeta src/data/ | — |
| 6-14 | Rediseño visual dark premium (9 archivos) | Todas las páginas y componentes |
| 15 | Fix CORS: strictPort 5173 | vite.config.js |
| 16 | Mejorado error handling rejected | productosSlice.js |
| 17 | Eliminados emojis de selects | SmartSearch.jsx |
| 18 | Creado sistema de diseño centralizado | styles/teqly.css |
| 19 | Extraídos inline styles a clases CSS | 8 componentes |
| 20 | SEO meta tags | index.html |
| 21 | Rediseño completo SmartSearch | SmartSearch.jsx |
| 22 | Documentación técnica | DOCUMENTACION.md |
| 23 | Sistema de temas dark/light con CSS variables | teqly-dark.css, teqly-light.css, useTheme.js |
| 24 | Toggle de tema en Navbar (sol/luna) | Navbar.jsx |
| 25 | Fix dropdowns: Bootstrap JS antes de React + useEffect reinicialización | index.html, Navbar.jsx |
| 26 | Neutralización de Bootswatch Lux (text-transform, letter-spacing) | teqly.css |
| 27 | Compare: secciones visuales (score, valoraciones, specs, características) | Compare.jsx |
| 28 | Favoritos: migración de inline styles a clases tq-* | Favoritos.jsx |
| 29 | Card body/footer usan variable de tema | teqly.css |
| 30 | Limpieza: eliminados dist/, react.svg, .DS_Store | — |
| 31 | Comentarios en español mínimo en todos los archivos | Todos |

---

## 7. Sugerencias de Mejora

### Prioridad Alta
1. **Route Guards** — Crear un componente `<ProtectedRoute>` que verifique JWT antes de mostrar `/favoritos` y `/admin`. Actualmente solo valida en la UI.
2. **Panel Admin** — Implementar CRUD de productos en `/admin` (el backend ya soporta crear, actualizar, eliminar con middleware `protect` + `admin`).
3. **Favoritos en backend** — Migrar favoritos de localStorage a MongoDB para sincronización entre dispositivos. Agregar un modelo `Favorito { usuario, producto }` en el backend.
4. **Imágenes reales** — Muchos productos tienen URLs placeholder (`ejemplo.com/img/...`). Subir imágenes reales a un CDN o usar URLs de Amazon/fabricantes.

### Prioridad Media
5. **Paginación** — Cuando haya >50 productos por categoría, agregar paginación en el backend (`?page=1&limit=20`) y en el frontend con botones prev/next.
6. **Buscador global** — Agregar un input de búsqueda en el Navbar que use `buscarProductos()` del slice (ya existe el thunk, solo falta la UI).
7. **Comparar: tabla de specs** — Agregar una vista de tabla al comparador donde las filas son especificaciones y las columnas son productos, para facilitar la comparación visual.
8. **Perfil de usuario** — Implementar `/perfil` para editar nombre/email/contraseña (el endpoint `PUT /api/usuarios/:id` ya existe en el backend).
9. **Validación de formularios** — Agregar validación visual en tiempo real (bordes rojos, mensajes inline) además de los toasts.

### Prioridad Baja
10. **PWA** — Convertir a Progressive Web App con service worker para funcionar offline y como app instalable en móviles.
11. ~~**Dark/Light mode toggle**~~ — ✅ Implementado con `useTheme.js` + `teqly-dark.css` + `teqly-light.css`.
12. **Internacionalización (i18n)** — Preparar para inglés/español con react-intl o similar.
13. **Analytics** — Integrar Google Analytics o Plausible para medir uso de categorías, búsquedas y conversiones.
14. **Tests** — Agregar tests unitarios con Vitest para los slices y tests de integración con React Testing Library para las páginas.
15. **Calificaciones/Reseñas** — Permitir a usuarios calificados dejar reseñas (el campo `calificacion` ya existe en el modelo).
16. **Notificaciones de precio** — Alertar al usuario si un producto favorito baja de precio.
17. **Historial de comparaciones** — Guardar comparaciones pasadas del usuario para referencia futura.
18. **Sistema de correo** — SMTP para: verificación de email, recuperación de contraseña, notificaciones.

---

## 8. Cómo Ejecutar

```bash
cd comparador-dispositivos
npm install
npm run dev          # → http://localhost:5173
npm run build        # Build para producción (dist/)
npm run preview      # Preview del build
```

### Requisitos
- Node.js 18+
- npm 9+
- El backend en Render debe estar activo (primera petición puede tardar ~30s si está dormido)

### Variables de Entorno
```env
VITE_API_URL=https://backend-teqly.onrender.com/api
```
