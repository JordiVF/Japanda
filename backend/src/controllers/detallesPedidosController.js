const supabase = require('../config/supabaseClient');

const getDetallesPedidos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('detalles_pedido')
      .select('id_detalle, id_pedido, id_producto, cantidad, precio_unitario')
      .order('id_detalle', { ascending: true });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles de pedidos', details: error.message });
  }
};

const getDetallePedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('detalles_pedido')
      .select('id_detalle, id_pedido, id_producto, cantidad, precio_unitario')
      .eq('id_detalle', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Detalle de pedido no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle de pedido', details: error.message });
  }
};

const getDetallesByPedido = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    
    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const { data, error } = await supabase
      .from('detalles_pedido')
      .select('id_detalle, id_pedido, id_producto, cantidad, precio_unitario')
      .eq('id_pedido', id_pedido)
      .order('id_detalle', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles del pedido', details: error.message });
  }
};

const createDetallePedido = async (req, res) => {
  try {
    const { id_pedido, id_producto, cantidad, precio_unitario } = req.body;

    if (!id_pedido || !id_producto || !cantidad || !precio_unitario) {
      return res.status(400).json({ 
        error: 'id_pedido, id_producto, cantidad y precio_unitario son requeridos' 
      });
    }

    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    if (typeof precio_unitario !== 'number' || precio_unitario <= 0) {
      return res.status(400).json({ error: 'El precio unitario debe ser un número positivo' });
    }

    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'El pedido especificado no existe' });
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

    const { data, error } = await supabase
      .from('detalles_pedido')
      .insert([{ 
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario
      }])
      .select('id_detalle, id_pedido, id_producto, cantidad, precio_unitario');

    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Detalle de pedido creado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear detalle de pedido', details: error.message });
  }
};

const updateDetallePedido = async (req, res) => {
  try {
    const { id } = req.params;
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

    const { data: detalleExistente } = await supabase
      .from('detalles_pedido')
      .select('id_producto')
      .eq('id_detalle', id)
      .single();

    if (!detalleExistente) {
      return res.status(404).json({ error: 'Detalle de pedido no encontrado' });
    }

    if (cantidad !== undefined) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto', detalleExistente.id_producto)
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
      .from('detalles_pedido')
      .update(updateData)
      .eq('id_detalle', id)
      .select('id_detalle, id_pedido, id_producto, cantidad, precio_unitario');

    if (error) throw error;

    res.status(200).json({ 
      message: 'Detalle de pedido actualizado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar detalle de pedido', details: error.message });
  }
};

const deleteDetallePedido = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('detalles_pedido')
      .delete()
      .eq('id_detalle', id)
      .select('id_detalle, id_pedido, id_producto');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Detalle de pedido no encontrado' });
    }

    res.status(200).json({ 
      message: 'Detalle de pedido eliminado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar detalle de pedido', details: error.message });
  }
};

const getDetallesPedidoConProductos = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    
    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const { data, error } = await supabase
      .from('detalles_pedido')
      .select(`
        id_detalle,
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario,
        productos(id_producto, nombre, descripcion, imagen_url)
      `)
      .eq('id_pedido', id_pedido);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalles del pedido', details: error.message });
  }
};

module.exports = {
  getDetallesPedidos,
  getDetallePedidoById,
  getDetallesByPedido,
  createDetallePedido,
  updateDetallePedido,
  deleteDetallePedido,
  getDetallesPedidoConProductos
};