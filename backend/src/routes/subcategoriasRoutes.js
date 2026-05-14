const express = require('express');
const router = express.Router();
const subcategoriasController = require('../controllers/subcategoriasController');

router.get('/', subcategoriasController.getSubcategorias);
router.get('/:id', subcategoriasController.getSubcategoriaById);
router.get('/categoria/:id_categoria', subcategoriasController.getSubcategoriasByCategoria);
router.post('/', subcategoriasController.createSubcategoria);
router.put('/:id', subcategoriasController.updateSubcategoria);
router.delete('/:id', subcategoriasController.deleteSubcategoria);

module.exports = router;