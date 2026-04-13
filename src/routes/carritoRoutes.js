const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.post('/', carritoController.agregarAlCarrito);
router.get('/:id_usuario/total', carritoController.getTotalCarrito);
router.get('/:id_usuario/productos', carritoController.getCarritoConProductos);
router.put('/:id_usuario/:id_producto', carritoController.actualizarCarrito);
router.delete('/:id_usuario/:id_producto', carritoController.eliminarDelCarrito);
router.get('/:id_usuario', carritoController.getCarritoUsuario);
router.delete('/:id_usuario', carritoController.vaciarCarrito);

module.exports = router;