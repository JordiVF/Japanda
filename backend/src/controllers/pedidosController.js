const supabase = require('../config/supabaseClient');

const getPedidos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_pedido, id_usuario, fecha, estado, total')
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos', details: error.message });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_pedido, id_usuario, fecha, estado, total')
      .eq('id_pedido', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedido', details: error.message });
  }
};

const getPedidosByUsuario = async (req, res) => {
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
      .from('pedidos')
      .select('id_pedido, id_usuario, fecha, estado, total')
      .eq('id_usuario', id_usuario)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos del usuario', details: error.message });
  }
};

const createPedido = async (req, res) => {
  try {
    const { id_usuario, estado = 'pendiente', total } = req.body;

    if (!id_usuario || total === undefined) {
      return res.status(400).json({ error: 'id_usuario y total son requeridos' });
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'El total debe ser un número positivo' });
    }

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'El usuario especificado no existe' });
    }

    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
      });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .insert([{ 
        id_usuario,
        estado,
        total,
        fecha: new Date().toISOString()
      }])
      .select('id_pedido, id_usuario, fecha, estado, total');

    if (error) throw error;
    
    res.status(201).json({ message: 'Pedido creado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido', details: error.message });
  }
};

const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, total } = req.body;

    if (!estado && total === undefined) {
      return res.status(400).json({ error: 'Al menos estado o total debe ser proporcionado' });
    }

    if (total !== undefined && (typeof total !== 'number' || total <= 0)) {
      return res.status(400).json({ error: 'El total debe ser un número positivo' });
    }

    if (estado) {
      const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
        });
      }
    }

    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const updateData = {};
    if (estado) updateData.estado = estado;
    if (total !== undefined) updateData.total = total;

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id_pedido', id)
      .select('id_pedido, id_usuario, fecha, estado, total');

    if (error) throw error;

    res.status(200).json({ message: 'Pedido actualizado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar pedido', details: error.message });
  }
};

const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: detalles } = await supabase
      .from('detalles_pedido')
      .select('id_detalle')
      .eq('id_pedido', id)
      .limit(1);

    if (detalles && detalles.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un pedido que tiene detalles asociados' });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id_pedido', id)
      .select('id_pedido, id_usuario, fecha');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({ message: 'Pedido eliminado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pedido', details: error.message });
  }
};

const getPedidoConDetalles = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .select('id_pedido, id_usuario, fecha, estado, total')
      .eq('id_pedido', id)
      .single();

    if (errorPedido || !pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalles_pedido')
      .select(`
        id_detalle,
        cantidad,
        precio_unitario,
        productos (
          id_producto,
          nombre,
          imagen_url,
          precio
        )
      `)
      .eq('id_pedido', id);

    if (errorDetalles) throw errorDetalles;

    res.status(200).json({
      ...pedido,
      productos: detalles
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener pedido con detalles',
      details: error.message
    });
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  getPedidosByUsuario,
  createPedido,
  updatePedido,
  deletePedido,
  getPedidoConDetalles
};