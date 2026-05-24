const express = require('express');
const router = express.Router();
const carritoDetalleController = require('../controllers/carritoDetalleController');
const { verificarCarritoPropietario } = require('../middlewares/proteccionMiddleware');

router.get('/:id_carrito',           verificarCarritoPropietario, carritoDetalleController.getDetallesByCarrito);
router.get('/:id_carrito/productos', verificarCarritoPropietario, carritoDetalleController.getDetallesConProductos);
router.get('/:id_carrito/:id_producto', verificarCarritoPropietario, carritoDetalleController.getDetalleItem);
router.post('/',carritoDetalleController.addDetalleItem);
router.put('/:id_carrito/:id_producto',  verificarCarritoPropietario, carritoDetalleController.updateDetalleItem);
router.delete('/:id_carrito/:id_producto', verificarCarritoPropietario, carritoDetalleController.deleteDetalleItem);
router.delete('/:id_carrito',              verificarCarritoPropietario, carritoDetalleController.deleteAllDetalles);

module.exports = router;