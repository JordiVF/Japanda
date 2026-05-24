const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const subcategoriasRoutes = require('./routes/subcategoriasRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const detallesPedidosRoutes = require('./routes/detallesPedidosRoutes');
const enviosRoutes = require('./routes/enviosRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const pagosRoutes = require('./routes/pagosRoutes');
const carritoDetalleRoutes = require('./routes/carritoDetalleRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// esto es para ver la categoria del producto, a lo mejor lo quitamos
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/subcategorias', subcategoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/detallespedidos', detallesPedidosRoutes);
app.use('/api/envios', enviosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/carrito-detalle', carritoDetalleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});