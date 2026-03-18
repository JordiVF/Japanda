const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');

const getUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, email, rol, telefono, direccion, ciudad, cp, pais');
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, email, rol, telefono, direccion, ciudad, cp, pais')
      .eq('id_usuario', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol = 'cliente', telefono, direccion, ciudad, cp, pais } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre,
        email,
        password_hash,
        rol,
        telefono: telefono || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        cp: cp || null,
        pais: pais || null
      }])
      .select('id_usuario, nombre, email, rol, telefono, direccion, ciudad, cp, pais');

    if (error) throw error;
    
    res.status(201).json({ message: 'Usuario creado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', details: error.message });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, ciudad, cp, pais, rol } = req.body;

    if (!nombre && !email && !telefono && !direccion && !ciudad && !cp && !pais && rol === undefined) {
      return res.status(400).json({ error: 'Al menos un campo debe ser actualizado' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', email)
        .neq('id_usuario', id)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (ciudad !== undefined) updateData.ciudad = ciudad;
    if (cp !== undefined) updateData.cp = cp;
    if (pais !== undefined) updateData.pais = pais;
    if (rol !== undefined) updateData.rol = rol;

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id_usuario', id)
      .select('id_usuario, nombre, email, rol, telefono, direccion, ciudad, cp, pais');

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword y newPassword son requeridos' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const { data: usuario, error: getUserError } = await supabase
      .from('usuarios')
      .select('password_hash')
      .eq('id_usuario', id)
      .single();

    if (getUserError || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, usuario.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .update({ password_hash: newPasswordHash })
      .eq('id_usuario', id)
      .select('id_usuario, nombre, email');

    if (error) throw error;

    res.status(200).json({ message: 'Contraseña actualizada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña', details: error.message });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', id)
      .select('id_usuario, nombre, email');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  changePassword,
  deleteUsuario
};