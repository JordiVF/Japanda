const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.getTodosLosCarritos);
router.get('/usuario/:id_usuario', autenticarPorIdUsuario, carritoController.getCarritoUsuario);
router.get('/:id', carritoController.getCarritoById);
router.post('/', carritoController.createCarrito);
router.put('/:id_usuario/:id', carritoController.updateCarrito);
router.delete('/:id_usuario/:id', carritoController.deleteCarrito);

module.exports = router;