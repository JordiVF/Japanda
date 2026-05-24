const express = require('express');
const router = express.Router();
const carritoDetalleController = require('../controllers/carritoDetalleController');

router.get('/', carritoDetalleController.getAllDetalles);
router.get('/:id_carrito', carritoDetalleController.getDetallesByCarrito);
router.get('/:id_carrito/productos', carritoDetalleController.getDetallesConProductos);
router.get('/:id_carrito/:id_producto', carritoDetalleController.getDetalleItem);
router.post('/',carritoDetalleController.addDetalleItem);
router.put('/:id_carrito/:id_producto',  carritoDetalleController.updateDetalleItem);
router.delete('/:id_carrito/:id_producto', carritoDetalleController.deleteDetalleItem);
router.delete('/:id_carrito', carritoDetalleController.deleteAllDetalles);

module.exports = router;