const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { autenticarPorIdUsuario, verificarCarritoPropietario } = require('../middlewares/proteccionMiddleware');

router.get('/', carritoController.getTodosLosCarritos);
router.get('/usuario/:id_usuario', autenticarPorIdUsuario, carritoController.getCarritoUsuario);
router.get('/:id', carritoController.getCarritoById);
router.post('/', autenticarPorIdUsuario, carritoController.createCarrito);
router.put('/:id', autenticarPorIdUsuario, carritoController.updateCarrito);
router.delete('/:id', autenticarPorIdUsuario, carritoController.deleteCarrito);

module.exports = router;