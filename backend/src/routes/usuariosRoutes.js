const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarUsuarioPorEmail, verificarPropietario } = require('../middlewares/proteccionMiddleware');

router.get('/', usuariosController.getUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/', usuariosController.createUsuario);
router.post('/login', usuariosController.loginUsuario);
router.put('/:id', verificarPropietario, usuariosController.updateUsuario);
router.post('/:id/change-password', verificarPropietario, usuariosController.changePassword);
router.delete('/:id', verificarPropietario, usuariosController.deleteUsuario);

module.exports = router;