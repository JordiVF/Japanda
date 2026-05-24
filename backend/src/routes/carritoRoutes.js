const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { verificarUsuarioPorEmail, verificarCarritoPropietario } = require('../middlewares/proteccionMiddleware');

router.get('/', carritoController.getTodosLosCarritos);
router.get('/usuario/:id_usuario', verificarCarritoPropietario, carritoController.getCarritoUsuario);
router.get('/:id', carritoController.getCarritoById);
router.post('/', verificarUsuarioPorEmail, carritoController.createCarrito);
router.put('/:id', carritoController.updateCarrito);
router.delete('/:id', carritoController.deleteCarrito);

module.exports = router;