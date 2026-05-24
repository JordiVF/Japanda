const supabase = require('../config/supabaseClient');

const getDetallesByCarrito = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);

    const { data: carritoExistente } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_carrito', id_carrito)
      .single();

    if (!carritoExistente) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const { data, error } = await supabase
      .from('detalle_carrito')
      .select(`
        id_carrito,
        id_producto,
        cantidad,
        precio_unitario,
        fecha_agregado,
        productos(nombre, imagen_url)
      `)
      .eq('id_carrito', id_carrito)
      .order('fecha_agregado', { ascending: false });

    if (error) throw error;

    const result = (data || []).map(item => ({
      id_carrito: item.id_carrito,
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      fecha_agregado: item.fecha_agregado,
      nombre: item.productos?.nombre ?? null,
      imagen_url: item.productos?.imagen_url ?? null,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles del carrito', details: error.message });
  }
};

const getDetallesConProductos = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);

    const { data: carritoExistente } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_carrito', id_carrito)
      .single();

    if (!carritoExistente) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const { data, error } = await supabase
      .from('detalle_carrito')
      .select(`
        id_carrito,
        id_producto,
        cantidad,
        precio_unitario,
        fecha_agregado,
        productos(id_producto, nombre, descripcion, precio, imagen_url, stock)
      `)
      .eq('id_carrito', id_carrito)
      .order('fecha_agregado', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles del carrito', details: error.message });
  }
};

const getDetalleItem = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);
    const id_producto = parseInt(req.params.id_producto);

    const { data, error } = await supabase
      .from('detalle_carrito')
      .select('id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado')
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle del carrito', details: error.message });
  }
};

const addDetalleItem = async (req, res) => {
  try {
    const { id_carrito, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_carrito || !id_producto || !cantidad || precio_unitario === undefined) {
      return res.status(400).json({
        error: 'id_carrito, id_producto, cantidad y precio_unitario son requeridos'
      });
    }

    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    if (typeof precio_unitario !== 'number' || precio_unitario <= 0) {
      return res.status(400).json({ error: 'El precio unitario debe ser un número positivo' });
    }

    const { data: carrito } = await supabase
      .from('carritos')
      .select('id_carrito, estado')
      .eq('id_carrito', id_carrito)
      .single();

    if (!carrito) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    if (carrito.estado !== 'activo') {
      return res.status(400).json({ error: 'No se pueden agregar productos a un carrito inactivo' });
    }

    const { data: producto } = await supabase
      .from('productos')
      .select('id_producto, stock')
      .eq('id_producto', id_producto)
      .single();

    if (!producto) {
      return res.status(404).json({ error: 'El producto especificado no existe' });
    }

    const { data: itemExistente } = await supabase
      .from('detalle_carrito')
      .select('id_carrito, cantidad')
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto)
      .single();

    let result;

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;

      if (producto.stock < nuevaCantidad) {
        return res.status(400).json({
          error: `Stock insuficiente. Disponibles: ${producto.stock}, solicitados: ${nuevaCantidad}`
        });
      }

      const { data, error } = await supabase
        .from('detalle_carrito')
        .update({ cantidad: nuevaCantidad, precio_unitario })
        .eq('id_carrito', id_carrito)
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
        .insert([{ id_carrito, id_producto, cantidad, precio_unitario }])
        .select('id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado');

      if (error) throw error;
      result = data[0];
    }

    res.status(201).json({
      message: 'Producto agregado al detalle del carrito exitosamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', details: error.message });
  }
};

const updateDetalleItem = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);
    const id_producto = parseInt(req.params.id_producto);
    const { cantidad, precio_unitario } = req.body;

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
      .from('detalle_carrito')
      .select('id_carrito')
      .eq('id_carrito', id_carrito)
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
      .from('detalle_carrito')
      .update(updateData)
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto)
      .select('id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado');

    if (error) throw error;

    res.status(200).json({
      message: 'Detalle del carrito actualizado exitosamente',
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar detalle del carrito', details: error.message });
  }
};

const deleteDetalleItem = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);
    const id_producto = parseInt(req.params.id_producto);

    const { data, error } = await supabase
      .from('detalle_carrito')
      .delete()
      .eq('id_carrito', id_carrito)
      .eq('id_producto', id_producto)
      .select('id_carrito, id_producto');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.status(200).json({
      message: 'Producto eliminado del carrito exitosamente',
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto del carrito', details: error.message });
  }
};

const deleteAllDetalles = async (req, res) => {
  try {
    const id_carrito = parseInt(req.params.id_carrito);

    const { data: carritoExistente } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_carrito', id_carrito)
      .single();

    if (!carritoExistente) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const { data: items } = await supabase
      .from('detalle_carrito')
      .select('id_producto')
      .eq('id_carrito', id_carrito);

    const itemCount = items ? items.length : 0;

    const { error } = await supabase
      .from('detalle_carrito')
      .delete()
      .eq('id_carrito', id_carrito);

    if (error) throw error;

    res.status(200).json({
      message: `Se eliminaron ${itemCount} productos del carrito.`,
      itemsEliminados: itemCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar el detalle del carrito', details: error.message });
  }
};

const getAllDetalles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('detalle_carrito')
      .select(`
        id_carrito,
        id_producto,
        cantidad,
        precio_unitario,
        fecha_agregado,
        productos(nombre, imagen_url),
        carritos(id_usuario, usuarios(nombre, email))
      `)
      .order('id_carrito', { ascending: true });

    if (error) throw error;

    const result = (data || []).map(item => ({
      id_carrito: item.id_carrito,
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      fecha_agregado: item.fecha_agregado,
      nombre_producto: item.productos?.nombre ?? null,
      imagen_url: item.productos?.imagen_url ?? null,
      nombre_usuario: item.carritos?.usuarios?.nombre ?? null,
      email_usuario: item.carritos?.usuarios?.email ?? null,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los detalles', details: error.message });
  }
};

module.exports = {
  getDetallesByCarrito,
  getDetallesConProductos,
  getDetalleItem,
  getAllDetalles,
  addDetalleItem,
  updateDetalleItem,
  deleteDetalleItem,
  deleteAllDetalles
};