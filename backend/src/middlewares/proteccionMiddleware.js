const supabase = require('../config/supabaseClient');

const verificarUsuarioPorEmail = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];

    if (!email) {
      return res.status(401).json({
        error: 'Falta autenticación: x-user-email header requerido'
      });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id_usuario, email, rol')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    req.user = usuario;

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Error al verificar usuario',
      details: error.message
    });
  }
};

const verificarPropietario = async (req, res, next) => {
  try {
    const usuarioActual = req.user;

    if (!usuarioActual) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const idDeLaURL = parseInt(req.params.id);

    const { data: usuarioObjetivo } = await supabase
      .from('usuarios')
      .select('email')
      .eq('id_usuario', idDeLaURL)
      .single();

    if (!usuarioObjetivo) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esAdmin = usuarioActual.rol === 'admin';
    const esPropietario = usuarioActual.email === usuarioObjetivo.email;

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({
        error: 'No tienes permiso para esta acción'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Error al verificar permisos',
      details: error.message
    });
  }
};

const verificarCarritoPropietario = async (req, res, next) => {
  try {
    const usuario = req.user;

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const idCarrito = parseInt(req.params.id_carrito);

    if (!idCarrito) {
      return res.status(400).json({ error: 'id_carrito inválido' });
    }

    // admin bypass
    if (usuario.rol === 'admin') {
      return next();
    }

    const { data: carrito } = await supabase
      .from('carritos')
      .select('id_usuario')
      .eq('id_carrito', idCarrito)
      .single();

    if (!carrito) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    if (carrito.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        error: 'No tienes permiso para este carrito'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Error al verificar carrito',
      details: error.message
    });
  }
};

module.exports = {
  verificarUsuarioPorEmail,
  verificarPropietario,
  verificarCarritoPropietario
};