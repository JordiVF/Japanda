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
      return res.status(403).json({
        error: 'No tienes permiso para realizar esta acción'
      });
    }

    req.user = usuarioActual; // opcional pero recomendado
    next();

  } catch (error) {
    res.status(403).json({
      error: 'Error al verificar permisos',
      details: error.message
    });
  }
};

const verificarCarritoPropietario = async (req, res, next) => {
  try {
    const emailDelUsuario = req.body.email || req.headers['x-user-email'];
    const idDelCarritoEnURL = parseInt(req.params.id_usuario);

    if (!emailDelUsuario) {
      return res.status(400).json({ error: 'Email requerido en body o header (x-user-email)' });
    }

    const { data: usuario } = require('../config/supabaseClient')
      .from('usuarios')
      .select('id_usuario')
      .eq('email', emailDelUsuario)
      .single();

    if (!usuario || usuario.id_usuario !== idDelCarritoEnURL) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este carrito' });
    }

    next();
  } catch (error) {
    res.status(403).json({ error: 'Error al verificar acceso', details: error.message });
  }
};

module.exports = {
  verificarUsuarioPorEmail,
  verificarPropietario,
  verificarCarritoPropietario
};