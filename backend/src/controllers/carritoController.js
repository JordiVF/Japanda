const supabase = require('../config/supabaseClient');

const getCarritoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data, error } = await supabase
      .from('carrito')
      .select('id_carrito, id_usuario, id_producto, cantidad, precio_unitario, fecha_agregado')
      .eq('id_usuario', id_usuario)
      .order('fecha_agregado', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message });
  }
};

const getCarritoConProductos = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data, error } = await supabase
      .from('carrito')
      .select(`
        id_carrito,
        id_usuario,
        id_producto,
        cantidad,
        precio_unitario,
        fecha_agregado,
        productos(id_producto, nombre, descripcion, precio, imagen_url, stock)
      `)
      .eq('id_usuario', id_usuario)
      .order('fecha_agregado', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message });
  }
};

const agregarAlCarrito = async (req, res) => {
  try {
    const { id_usuario, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_usuario || !id_producto || !cantidad || precio_unitario === undefined) {
      return res.status(400).json({ 
        error: 'id_usuario, id_producto, cantidad y precio_unitario son requeridos' 
      });
    }

    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    if (typeof precio_unitario !== 'number' || precio_unitario <= 0) {
      return res.status(400).json({ error: 'El precio unitario debe ser un número positivo' });
    }

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'El usuario especificado no existe' });
    }

    const { data: productoExistente } = await supabase
      .from('productos')
      .select('id_producto, stock')
      .eq('id_producto', id_producto)
      .single();

    if (!productoExistente) {
      return res.status(404).json({ error: 'El producto especificado no existe' });
    }

    if (productoExistente.stock < cantidad) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Disponibles: ${productoExistente.stock}, solicitados: ${cantidad}` 
      });
    }

    const { data: itemExistente } = await supabase
      .from('carrito')
      .select('id_carrito, cantidad')
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto)
      .single();

    let result;

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      
      if (productoExistente.stock < nuevaCantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente. Disponibles: ${productoExistente.stock}, solicitados: ${nuevaCantidad}` 
        });
      }

      const { data, error } = await supabase
        .from('carrito')
        .update({ cantidad: nuevaCantidad, precio_unitario })
        .eq('id_usuario', id_usuario)
        .eq('id_producto', id_producto)
        .select('id_carrito, id_usuario, id_producto, cantidad, precio_unitario, fecha_agregado');

      if (error) throw error;
      result = data[0];
    } else {
      const { data, error } = await supabase
        .from('carrito')
        .insert([{
          id_usuario,
          id_producto,
          cantidad,
          precio_unitario
        }])
        .select('id_carrito, id_usuario, id_producto, cantidad, precio_unitario, fecha_agregado');

      if (error) throw error;
      result = data[0];
    }
    
    res.status(201).json({ 
      message: 'Producto agregado al carrito exitosamente', 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', details: error.message });
  }
};

const actualizarCarrito = async (req, res) => {
  try {
    const { id_usuario: id_usuario_str, id_producto: id_producto_str } = req.params;
    const { cantidad, precio_unitario } = req.body;

    const id_usuario = parseInt(id_usuario_str);
    const id_producto = parseInt(id_producto_str);

    if (cantidad === undefined && precio_unitario === undefined) {
      return res.status(400).json({ 
        error: 'Al menos cantidad o precio_unitario debe ser proporcionado' 
      });
    }

    if (cantidad !== undefined && (typeof cantidad !== 'number' || cantidad <= 0)) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    if (precio_unitario !== undefined && (typeof precio_unitario !== 'number' || precio_unitario <= 0)) {
      return res.status(400).json({ error: 'El precio unitario debe ser un número positivo' });
    }

    const { data: itemExistente } = await supabase
      .from('carrito')
      .select('id_producto')
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto)
      .single();

    if (!itemExistente) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    if (cantidad !== undefined) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto', id_producto)
        .single();

      if (producto && producto.stock < cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente. Disponibles: ${producto.stock}, solicitados: ${cantidad}` 
        });
      }
    }

    const updateData = {};
    if (cantidad !== undefined) updateData.cantidad = cantidad;
    if (precio_unitario !== undefined) updateData.precio_unitario = precio_unitario;

    const { data, error } = await supabase
      .from('carrito')
      .update(updateData)
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto)
      .select('id_carrito, id_usuario, id_producto, cantidad, precio_unitario, fecha_agregado');

    if (error) throw error;

    res.status(200).json({ 
      message: 'Carrito actualizado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar carrito', details: error.message });
  }
};

const eliminarDelCarrito = async (req, res) => {
  try {
    const { id_usuario: id_usuario_str, id_producto: id_producto_str } = req.params;

    const id_usuario = parseInt(id_usuario_str);
    const id_producto = parseInt(id_producto_str);

    const { data, error } = await supabase
      .from('carrito')
      .delete()
      .eq('id_usuario', id_usuario)
      .eq('id_producto', id_producto)
      .select('id_usuario, id_producto');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.status(200).json({ 
      message: 'Producto eliminado del carrito exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar del carrito', details: error.message });
  }
};

const vaciarCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data: carritoItems } = await supabase
      .from('carrito')
      .select('id_producto')
      .eq('id_usuario', id_usuario);

    const itemCount = carritoItems ? carritoItems.length : 0;

    const { error } = await supabase
      .from('carrito')
      .delete()
      .eq('id_usuario', id_usuario);

    if (error) throw error;

    res.status(200).json({ 
      message: `Carrito vaciado exitosamente. Se eliminaron ${itemCount} productos.`,
      itemsEliminados: itemCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar carrito', details: error.message });
  }
};

const getTotalCarrito = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data, error } = await supabase
      .from('carrito')
      .select('cantidad, precio_unitario')
      .eq('id_usuario', id_usuario);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(200).json({
        id_usuario,
        total: 0,
        cantidad_items: 0,
        items: []
      });
    }

    let total = 0;
    data.forEach(item => {
      total += (item.cantidad * item.precio_unitario);
    });

    res.status(200).json({
      id_usuario,
      total: parseFloat(total.toFixed(2)),
      cantidad_items: data.length,
      items: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener total del carrito', details: error.message });
  }
};

module.exports = {
  getCarritoUsuario,
  getCarritoConProductos,
  agregarAlCarrito,
  actualizarCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  getTotalCarrito
};