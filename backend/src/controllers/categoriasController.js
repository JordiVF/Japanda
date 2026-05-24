const supabase = require('../config/supabaseClient');

const getCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria, nombre')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías', details: error.message });
  }
};

const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria, nombre')
      .eq('id_categoria', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Categoría no encontrada' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría', details: error.message });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    const { data: existingCategoria } = await supabase
      .from('categorias')
      .select('id_categoria')
      .eq('nombre', nombre)
      .single();

    if (existingCategoria) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre: nombre.trim() }])
      .select('id_categoria, nombre');

    if (error) throw error;
    
    res.status(201).json({ message: 'Categoría creada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría', details: error.message });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    const { data: categoriaExistente } = await supabase
      .from('categorias')
      .select('id_categoria')
      .eq('id_categoria', id)
      .single();

    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const { data: nombreDuplicado } = await supabase
      .from('categorias')
      .select('id_categoria')
      .eq('nombre', nombre)
      .neq('id_categoria', id)
      .single();

    if (nombreDuplicado) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre: nombre.trim() })
      .eq('id_categoria', id)
      .select('id_categoria, nombre');

    if (error) throw error;

    res.status(200).json({ message: 'Categoría actualizada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría', details: error.message });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: subcategorias } = await supabase
      .from('subcategorias')
      .select('id_subcategoria')
      .eq('id_categoria', id)
      .limit(1);

    if (subcategorias && subcategorias.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una categoría que tiene subcategorías asociadas' });
    }

    const { data, error } = await supabase
      .from('categorias')
      .delete()
      .eq('id_categoria', id)
      .select('id_categoria, nombre');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría eliminada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', details: error.message });
  }
};

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};