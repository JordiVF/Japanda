const supabase = require('../config/supabaseClient');

const getProductos = async (req, res) => {
  try {

    const { id_categoria } = req.query;

    let query = supabase
      .from('productos')
      .select('*');

    if (id_categoria) {
      query = query.eq('id_categoria', id_categoria);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener productos',
      details: error.message
    });
  }
};

const postProductos = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      id_categoria,
      id_subcategoria,
      nuevo_booleano
    } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .insert([
        {
          nombre,
          descripcion,
          precio,
          stock,
          imagen_url,
          activo,
          id_categoria,
          id_subcategoria,
          nuevo_booleano
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear producto',
      details: error.message
    });
  }
};

const putProductos = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No se enviaron campos para actualizar'
      });
    }

    const allowedFields = [
      'nombre',
      'descripcion',
      'precio',
      'stock',
      'imagen_url',
      'activo',
      'id_categoria',
      'id_subcategoria',
      'nuevo_booleano'
    ];

    const filteredUpdates = {};

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        error: 'Ningún campo válido para actualizar'
      });
    }

    if (filteredUpdates.precio && isNaN(filteredUpdates.precio)) {
      return res.status(400).json({
        error: 'El precio debe ser un número'
      });
    }

    if (filteredUpdates.stock && filteredUpdates.stock < 0) {
      return res.status(400).json({
        error: 'El stock no puede ser negativo'
      });
    }

    if (
      filteredUpdates.activo !== undefined &&
      typeof filteredUpdates.activo !== 'boolean'
    ) {
      return res.status(400).json({
        error: 'El campo activo debe ser booleano'
      });
    }

    const { data, error } = await supabase
      .from('productos')
      .update(filteredUpdates)
      .eq('id_producto', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar producto',
      details: error.message
    });
  }
};

const deleteProductos = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente', data });
  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar producto',
      details: error.message
    });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id_producto', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener producto',
      details: error.message
    });
  }
};

module.exports = {
  getProductos,
  postProductos,
  putProductos,
  deleteProductos,
  getProductoById
};