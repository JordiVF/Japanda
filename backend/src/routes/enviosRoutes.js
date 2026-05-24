const express = require('express');
const router = express.Router();
const enviosController = require('../controllers/enviosController');

router.get('/detalle/:id', enviosController.getEnvioCompleto);
router.get('/pedido/:id_pedido', enviosController.getEnvioPorPedido);
router.get('/tracking/:tracking', enviosController.getEnvioPorTracking);
router.get('/usuario/:id_usuario', enviosController.getEnviosPorUsuario);
router.get('/', enviosController.getEnvios);
router.get('/:id', enviosController.getEnvioById);
router.post('/', enviosController.createEnvio);
router.put('/:id', enviosController.updateEnvio);
router.delete('/:id', enviosController.deleteEnvio);

module.exports = router;