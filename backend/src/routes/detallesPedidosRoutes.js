const express = require('express');
const router = express.Router();
const detallesPedidoController = require('../controllers/detallesPedidosController');

router.get('/pedido/:id_pedido', detallesPedidoController.getDetallesByPedido);
router.get('/pedido-productos/:id_pedido', detallesPedidoController.getDetallesPedidoConProductos);
router.get('/', detallesPedidoController.getDetallesPedidos);
router.get('/:id', detallesPedidoController.getDetallePedidoById);
router.post('/', detallesPedidoController.createDetallePedido);
router.put('/:id', detallesPedidoController.updateDetallePedido);
router.delete('/:id', detallesPedidoController.deleteDetallePedido);

module.exports = router;