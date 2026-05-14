const supabase = require('../config/supabaseClient');

const getSubcategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id_subcategoria, id_categoria, nombre')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategorías', details: error.message });
  }
};

const getSubcategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id_subcategoria, id_categoria, nombre')
      .eq('id_subcategoria', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Subcategoría no encontrada' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategoría', details: error.message });
  }
};

const getSubcategoriasByCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    
    const { data, error } = await supabase
      .from('subcategorias')
      .select('id_subcategoria, id_categoria, nombre')
      .eq('id_categoria', id_categoria)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No hay subcategorías para esta categoría' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategorías', details: error.message });
  }
};

const createSubcategoria = async (req, res) => {
  try {
    const { id_categoria, nombre } = req.body;

    if (!id_categoria || !nombre) {
      return res.status(400).json({ error: 'id_categoria y nombre son requeridos' });
    }

    if (nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    const { data: categoriaExistente } = await supabase
      .from('categorias')
      .select('id_categoria')
      .eq('id_categoria', id_categoria)
      .single();

    if (!categoriaExistente) {
      return res.status(404).json({ error: 'La categoría especificada no existe' });
    }

    const { data: existingSubcategoria } = await supabase
      .from('subcategorias')
      .select('id_subcategoria')
      .eq('id_categoria', id_categoria)
      .eq('nombre', nombre)
      .single();

    if (existingSubcategoria) {
      return res.status(400).json({ error: 'La subcategoría ya existe en esta categoría' });
    }

    const { data, error } = await supabase
      .from('subcategorias')
      .insert([{ 
        id_categoria,
        nombre: nombre.trim()
      }])
      .select('id_subcategoria, id_categoria, nombre');

    if (error) throw error;
    
    res.status(201).json({ message: 'Subcategoría creada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subcategoría', details: error.message });
  }
};

const updateSubcategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_categoria } = req.body;

    if (!nombre && !id_categoria) {
      return res.status(400).json({ error: 'Al menos nombre o id_categoria debe ser proporcionado' });
    }

    if (nombre && nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    const { data: subcategoriaExistente } = await supabase
      .from('subcategorias')
      .select('id_categoria, nombre')
      .eq('id_subcategoria', id)
      .single();

    if (!subcategoriaExistente) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    if (id_categoria) {
      const { data: categoriaExistente } = await supabase
        .from('categorias')
        .select('id_categoria')
        .eq('id_categoria', id_categoria)
        .single();

      if (!categoriaExistente) {
        return res.status(404).json({ error: 'La categoría especificada no existe' });
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre.trim();
    if (id_categoria) updateData.id_categoria = id_categoria;

    const { data, error } = await supabase
      .from('subcategorias')
      .update(updateData)
      .eq('id_subcategoria', id)
      .select('id_subcategoria, id_categoria, nombre');

    if (error) throw error;

    res.status(200).json({ message: 'Subcategoría actualizada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar subcategoría', details: error.message });
  }
};

const deleteSubcategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: productos } = await supabase
      .from('productos')
      .select('id_producto')
      .eq('id_subcategoria', id)
      .limit(1);

    if (productos && productos.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una subcategoría que tiene productos asociados' });
    }

    const { data, error } = await supabase
      .from('subcategorias')
      .delete()
      .eq('id_subcategoria', id)
      .select('id_subcategoria, nombre');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    res.status(200).json({ message: 'Subcategoría eliminada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar subcategoría', details: error.message });
  }
};

module.exports = {
  getSubcategorias,
  getSubcategoriaById,
  getSubcategoriasByCategoria,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria
};