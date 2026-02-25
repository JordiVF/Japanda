const supabase = require('../config/supabaseClient');

const getProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
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

module.exports = {
  getProductos,
  postProductos
};