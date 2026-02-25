const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.getProductos);
router.post('/', productosController.postProductos);

module.exports = router;