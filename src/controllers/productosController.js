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

module.exports = {
  getProductos
};