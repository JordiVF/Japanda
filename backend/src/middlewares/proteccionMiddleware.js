const supabase = require('../config/supabaseClient');

const verificarUsuarioPorEmail = async (req, res, next) => {
  try {
    const email = req.body.email || req.headers['x-user-email'];

    if (!email) {
      return res.status(400).json({ error: 'Email del usuario requerido en body o header (x-user-email)' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id_usuario, email')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    req.usuarioAutenticado = usuario;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar usuario', details: error.message });
  }
};

const verificarPropietario = async (req, res, next) => {
  try {
    const emailDelUsuario = req.body.email || req.headers['x-user-email'];
    const idDeLaURL = parseInt(req.params.id);

    if (!emailDelUsuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { data: usuarioObjetivo } = await supabase
      .from('usuarios')
      .select('email')
      .eq('id_usuario', idDeLaURL)
      .single();

    if (!usuarioObjetivo) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data: usuarioActual } = await supabase
      .from('usuarios')
      .select('email, rol')
      .eq('email', emailDelUsuario)
      .single();

    if (!usuarioActual) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    const esAdmin = usuarioActual.rol === 'admin';
    const esPropietario = usuarioActual.email === usuarioObjetivo.email;

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    req.user = usuarioActual;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Error al verificar permisos', details: error.message });
  }
};

const verificarCarritoPropietario = async (req, res, next) => {
  try {
    const emailDelUsuario = req.body.email || req.headers['x-user-email'];
    const idEnURL = parseInt(req.params.id_usuario || req.params.id_carrito);

    if (!emailDelUsuario) {
      return res.status(400).json({ error: 'Email requerido en body o header (x-user-email)' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id_usuario, rol')
      .eq('email', emailDelUsuario)
      .single();

    if (error || !usuario) {
      return res.status(403).json({ error: 'Usuario no encontrado o no autorizado' });
    }

    if (usuario.rol === 'admin') {
      req.user = usuario;
      return next();
    }

    if (req.params.id_usuario !== undefined) {
      if (usuario.id_usuario !== idEnURL) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este carrito' });
      }
      req.user = usuario;
      return next();
    }

    if (req.params.id_carrito !== undefined) {
      const { data: carrito } = await supabase
        .from('carritos')
        .select('id_usuario')
        .eq('id_carrito', idEnURL)
        .single();

      if (!carrito || carrito.id_usuario !== usuario.id_usuario) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este carrito' });
      }
      req.user = usuario;
      return next();
    }

    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
  } catch (error) {
    res.status(403).json({ error: 'Error al verificar acceso', details: error.message });
  }
};

module.exports = {
  verificarUsuarioPorEmail,
  verificarPropietario,
  verificarCarritoPropietario
};