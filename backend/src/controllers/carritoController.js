const supabase = require('../config/supabaseClient');

const _getCarritoActivo = async (id_usuario) => {
  const { data } = await supabase
    .from('carritos')
    .select('id_carrito, id_usuario, fecha_creacion, estado')
    .eq('id_usuario', id_usuario)
    .eq('estado', 'activo')
    .single();
  return data || null;
};


const _crearCarrito = async (id_usuario) => {
  const { data, error } = await supabase
    .from('carritos')
    .insert([{ id_usuario, estado: 'activo' }])
    .select('id_carrito, id_usuario, fecha_creacion, estado');
  if (error) throw error;
  return data[0];
};


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

    const carrito = await _getCarritoActivo(id_usuario);

    if (!carrito) {
      return res.status(200).json(null);
    }

    res.status(200).json(carrito);
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

    const carrito = await _getCarritoActivo(id_usuario);

    if (!carrito) {
      return res.status(200).json({ carrito: null, items: [] });
    }

    const { data: items, error } = await supabase
      .from('detalle_carrito')
      .select(`
        id_carrito,
        id_producto,
        cantidad,
        precio_unitario,
        fecha_agregado,
        productos(id_producto, nombre, descripcion, precio, imagen_url, stock)
      `)
      .eq('id_carrito', carrito.id_carrito)
      .order('fecha_agregado', { ascending: false });

    if (error) throw error;

    res.status(200).json({ carrito, items: items || [] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message });
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

    const carrito = await _getCarritoActivo(id_usuario);

    if (!carrito) {
      return res.status(200).json({ id_usuario, id_carrito: null, total: 0, cantidad_items: 0, items: [] });
    }

    const { data, error } = await supabase
      .from('detalle_carrito')
      .select('cantidad, precio_unitario')
      .eq('id_carrito', carrito.id_carrito);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(200).json({ id_usuario, id_carrito: carrito.id_carrito, total: 0, cantidad_items: 0, items: [] });
    }

    let total = 0;
    data.forEach(item => { total += item.cantidad * item.precio_unitario; });

    res.status(200).json({
      id_usuario,
      id_carrito: carrito.id_carrito,
      total: parseFloat(total.toFixed(2)),
      cantidad_items: data.length,
      items: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener total del carrito', details: error.message });
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

    const { data: producto } = await supabase
      .from('productos')
      .select('id_producto, stock')
      .eq('id_producto', id_producto)
      .single();

    if (!producto) {
      return res.status(404).json({ error: 'El producto especificado no existe' });
    }

    let carrito = await _getCarritoActivo(id_usuario);
    if (!carrito) {
      carrito = await _crearCarrito(id_usuario);
    }

    const { data: detalleExistente } = await supabase
      .from('detalle_carrito')
      .select('id_carrito, cantidad')
      .eq('id_carrito', carrito.id_carrito)
      .eq('id_producto', id_producto)
      .single();

    let result;

    if (detalleExistente) {
      const nuevaCantidad = detalleExistente.cantidad + cantidad;

      if (producto.stock < nuevaCantidad) {
        return res.status(400).json({
          error: `Stock insuficiente. Disponibles: ${producto.stock}, solicitados: ${nuevaCantidad}`
        });
      }

      const { data, error } = await supabase
        .from('detalle_carrito')
        .update({ cantidad: nuevaCantidad, precio_unitario })
        .eq('id_carrito', carrito.id_carrito)
        .eq('id_producto', id_producto)
        .select('id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado');

      if (error) throw error;
      result = data[0];
    } else {
      if (producto.stock < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente. Disponibles: ${producto.stock}, solicitados: ${cantidad}`
        });
      }

      const { data, error } = await supabase
        .from('detalle_carrito')
        .insert([{ id_carrito: carrito.id_carrito, id_producto, cantidad, precio_unitario }])
        .select('id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado');

      if (error) throw error;
      result = data[0];
    }

    res.status(201).json({
      message: 'Producto agregado al carrito exitosamente',
      carrito,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', details: error.message });
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

    const carrito = await _getCarritoActivo(id_usuario);

    if (!carrito) {
      return res.status(404).json({ error: 'No existe carrito activo para este usuario' });
    }

    const { data: items } = await supabase
      .from('detalle_carrito')
      .select('id_producto')
      .eq('id_carrito', carrito.id_carrito);

    const itemCount = items ? items.length : 0;

    const { error: errorDetalle } = await supabase
      .from('detalle_carrito')
      .delete()
      .eq('id_carrito', carrito.id_carrito);

    if (errorDetalle) throw errorDetalle;

    const { error: errorCarrito } = await supabase
      .from('carritos')
      .update({ estado: 'inactivo' })
      .eq('id_carrito', carrito.id_carrito);

    if (errorCarrito) throw errorCarrito;

    res.status(200).json({
      message: `Carrito vaciado exitosamente. Se eliminaron ${itemCount} productos.`,
      itemsEliminados: itemCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar carrito', details: error.message });
  }
};

module.exports = {
  getCarritoUsuario,
  getCarritoConProductos,
  getTotalCarrito,
  agregarAlCarrito,
  vaciarCarrito
};