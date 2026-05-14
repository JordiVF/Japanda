const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');

router.get('/', pagosController.getPagos);
router.get('/estadisticas', pagosController.getEstadisticasPagos);
router.get('/:id', pagosController.getPagoById);
router.get('/detalle/:id', pagosController.getPagoCompleto);
router.get('/pedido/:id_pedido', pagosController.getPagoPorPedido);
router.get('/usuario/:id_usuario', pagosController.getPagosPorUsuario);
router.post('/', pagosController.createPago);
router.put('/:id', pagosController.updatePago);
router.delete('/:id', pagosController.deletePago);

module.exports = router;