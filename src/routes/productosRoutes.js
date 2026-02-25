const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.getProductos);
router.post('/', productosController.postProductos);
router.put('/:id', productosController.putProductos);
router.delete('/:id', productosController.deleteProductos);

module.exports = router;