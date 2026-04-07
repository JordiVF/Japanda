const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./routes/productosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const subcategoriasRoutes = require('./routes/subcategoriasRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/subcategorias', subcategoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});