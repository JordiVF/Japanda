// const supabase = require('../config/supabaseClient');

// const autenticarPorIdUsuario = async (req, res, next) => {
//   try {
//     const id_usuario = req.body.id_usuario || req.params.id_usuario;

//     if (!id_usuario) {
//       return res.status(400).json({ error: 'id_usuario requerido' });
//     }

//     const { data: usuario, error } = await supabase
//       .from('usuarios')
//       .select('id_usuario, email, rol')
//       .eq('id_usuario', id_usuario)
//       .single();

//     if (error || !usuario) {
//       return res.status(404).json({ error: 'Usuario no encontrado' });
//     }

//     req.user = usuario;
//     next();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const verificarCarritoPropietario = async (req, res, next) => {
//   try {
//     const usuario = req.user;
//     const idCarrito = parseInt(req.params.id);

//     if (!usuario) {
//       return res.status(401).json({ error: 'No autenticado' });
//     }

//     if (usuario.rol === 'admin') {
//       return next();
//     }

//     const { data: carrito } = await supabase
//       .from('carritos')
//       .select('id_usuario')
//       .eq('id_carrito', idCarrito)
//       .single();

//     if (!carrito || carrito.id_usuario !== usuario.id_usuario) {
//       return res.status(403).json({ error: 'No autorizado' });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   autenticarPorIdUsuario,
//   verificarCarritoPropietario
// }; 