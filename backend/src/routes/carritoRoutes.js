const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { verificarUsuarioPorEmail, verificarCarritoPropietario } = require('../middlewares/proteccionMiddleware');

router.get('/', carritoController.getTodosLosCarritos);
router.get('/:id_usuario', verificarCarritoPropietario, carritoController.getCarritoUsuario);
router.get('/:id_usuario/productos', verificarCarritoPropietario, carritoController.getCarritoConProductos);
router.get('/:id_usuario/total', verificarCarritoPropietario, carritoController.getTotalCarrito);
router.post('/', verificarUsuarioPorEmail, carritoController.agregarAlCarrito);
router.delete('/:id_usuario', verificarCarritoPropietario, carritoController.vaciarCarrito);

module.exports = router;