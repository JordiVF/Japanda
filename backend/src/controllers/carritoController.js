const supabase = require('../config/supabaseClient');

const getTodosLosCarritos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('carritos')
      .select('id_carrito, id_usuario, fecha_creacion, estado')
      .order('id_carrito', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carritos', details: error.message });
  }
};

const getCarritoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('carritos')
      .select('id_carrito, id_usuario, fecha_creacion, estado')
      .eq('id_carrito', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message });
  }
};

const getCarritoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
      .from('carritos')
      .select('id_carrito, id_usuario, fecha_creacion, estado')
      .eq('id_usuario', id_usuario)
      .eq('estado', 'activo')
      .single();

    if (error || !data) {
      return res.status(200).json(null);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message });
  }
};

const createCarrito = async (req, res) => {
  try {
    const { id_usuario, estado = 'activo' } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: 'id_usuario es requerido' });
    }

    const estadosValidos = ['activo', 'inactivo', 'abandonado', 'convertido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { data: carritoActivo } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_usuario', id_usuario)
      .eq('estado', 'activo')
      .single();

    if (carritoActivo) {
      return res.status(409).json({
        error: 'El usuario ya tiene un carrito activo'
      });
    }

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'El usuario especificado no existe' });
    }

    const { data, error } = await supabase
      .from('carritos')
      .insert([{ id_usuario, estado }])
      .select('id_carrito, id_usuario, fecha_creacion, estado');

    if (error) throw error;

    res.status(201).json({
      message: 'Carrito creado exitosamente',
      data: data[0]
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al crear carrito',
      details: error.message
    });
  }
};

const updateCarrito = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, estado } = req.body;

    if (!id_usuario && !estado) {
      return res.status(400).json({ error: 'Al menos id_usuario o estado son requeridos' });
    }

    if (estado) {
      const estadosValidos = ['activo', 'inactivo', 'abandonado', 'convertido'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ') });
      }
    }

    const updateData = {};
    if (id_usuario) updateData.id_usuario = Number(id_usuario);
    if (estado) updateData.estado = estado;

    const { data, error } = await supabase
      .from('carritos')
      .update(updateData)
      .eq('id_carrito', id)
      .select('id_carrito, id_usuario, fecha_creacion, estado');

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.status(200).json({ message: 'Carrito actualizado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar carrito', details: error.message });
  }
};

const deleteCarrito = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('carritos')
      .delete()
      .eq('id_carrito', id)
      .select('id_carrito, id_usuario');

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.status(200).json({ message: 'Carrito eliminado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar carrito', details: error.message });
  }
};

module.exports = {
  getTodosLosCarritos,
  getCarritoById,
  getCarritoUsuario,
  createCarrito,
  updateCarrito,
  deleteCarrito,
};