const supabase = require('../config/supabaseClient');

const getPagos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('id_pago, id_pedido, metodo, estado, monto, referencia_externa, fecha')
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos', details: error.message });
  }
};

const getPagoById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const { data, error } = await supabase
      .from('pagos')
      .select('id_pago, id_pedido, metodo, estado, monto, referencia_externa, fecha')
      .eq('id_pago', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pago no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pago', details: error.message });
  }
};

const getPagoPorPedido = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);
    
    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const { data, error } = await supabase
      .from('pagos')
      .select('id_pago, id_pedido, metodo, estado, monto, referencia_externa, fecha')
      .eq('id_pedido', id_pedido)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'No existe pago para este pedido' });
    }
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pago', details: error.message });
  }
};

const getPagosPorUsuario = async (req, res) => {
  try {
    const id_usuario = parseInt(req.params.id_usuario);
    
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .single();

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { data, error } = await supabase
      .from('pagos')
      .select(`
        id_pago,
        id_pedido,
        metodo,
        estado,
        monto,
        referencia_externa,
        fecha,
        pedidos(id_pedido, fecha, total)
      `)
      .eq('pedidos.id_usuario', id_usuario)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos del usuario', details: error.message });
  }
};

const createPago = async (req, res) => {
  try {
    const { id_pedido, metodo, monto, estado = 'pendiente', referencia_externa } = req.body;

    if (!id_pedido || !metodo || monto === undefined) {
      return res.status(400).json({ 
        error: 'id_pedido, metodo y monto son requeridos' 
      });
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número positivo' });
    }

    if (metodo.trim().length === 0) {
      return res.status(400).json({ error: 'El método de pago no puede estar vacío' });
    }

    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido, total')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'El pedido especificado no existe' });
    }

    const estadosValidos = ['pendiente', 'completado', 'fallido', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
      });
    }

    const { data: pagoExistente } = await supabase
      .from('pagos')
      .select('id_pago')
      .eq('id_pedido', id_pedido)
      .eq('estado', 'completado')
      .single();

    if (pagoExistente) {
      return res.status(400).json({ error: 'Este pedido ya tiene un pago completado' });
    }

    const { data, error } = await supabase
      .from('pagos')
      .insert([{ 
        id_pedido,
        metodo: metodo.trim(),
        monto,
        estado,
        referencia_externa: referencia_externa ? referencia_externa.trim() : null
      }])
      .select('id_pago, id_pedido, metodo, estado, monto, referencia_externa, fecha');

    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Pago creado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pago', details: error.message });
  }
};

const updatePago = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { metodo, estado, monto, referencia_externa } = req.body;

    if (!metodo && !estado && monto === undefined && !referencia_externa) {
      return res.status(400).json({ 
        error: 'Al menos uno de estos campos debe ser proporcionado: metodo, estado, monto, referencia_externa' 
      });
    }

    if (metodo && metodo.trim().length === 0) {
      return res.status(400).json({ error: 'El método de pago no puede estar vacío' });
    }

    if (monto !== undefined && (typeof monto !== 'number' || monto <= 0)) {
      return res.status(400).json({ error: 'El monto debe ser un número positivo' });
    }

    if (estado) {
      const estadosValidos = ['pendiente', 'completado', 'fallido', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
        });
      }
    }

    const { data: pagoExistente } = await supabase
      .from('pagos')
      .select('id_pago')
      .eq('id_pago', id)
      .single();

    if (!pagoExistente) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const updateData = {};
    if (metodo) updateData.metodo = metodo.trim();
    if (estado) updateData.estado = estado;
    if (monto !== undefined) updateData.monto = monto;
    if (referencia_externa) updateData.referencia_externa = referencia_externa.trim();

    const { data, error } = await supabase
      .from('pagos')
      .update(updateData)
      .eq('id_pago', id)
      .select('id_pago, id_pedido, metodo, estado, monto, referencia_externa, fecha');

    if (error) throw error;

    res.status(200).json({ 
      message: 'Pago actualizado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar pago', details: error.message });
  }
};

const deletePago = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { data, error } = await supabase
      .from('pagos')
      .delete()
      .eq('id_pago', id)
      .select('id_pago, id_pedido, metodo');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.status(200).json({ 
      message: 'Pago eliminado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pago', details: error.message });
  }
};

const getPagoCompleto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        id_pago,
        id_pedido,
        metodo,
        estado,
        monto,
        referencia_externa,
        fecha,
        pedidos(
          id_pedido,
          id_usuario,
          fecha,
          estado,
          total,
          usuarios(nombre, email, telefono)
        )
      `)
      .eq('id_pago', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pago no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pago', details: error.message });
  }
};

const getEstadisticasPagos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('estado, monto');
    
    if (error) throw error;

    let totalCompletados = 0;
    let totalPendientes = 0;
    let totalFallidos = 0;
    let montoPagado = 0;

    data.forEach(pago => {
      if (pago.estado === 'completado') {
        totalCompletados++;
        montoPagado += pago.monto;
      } else if (pago.estado === 'pendiente') {
        totalPendientes++;
      } else if (pago.estado === 'fallido') {
        totalFallidos++;
      }
    });

    res.status(200).json({
      totalPagos: data.length,
      pagosCompletados: totalCompletados,
      pagosPendientes: totalPendientes,
      pagosFallidos: totalFallidos,
      montoPagado: parseFloat(montoPagado.toFixed(2)),
      promedioMonto: data.length > 0 ? parseFloat((montoPagado / data.length).toFixed(2)) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas', details: error.message });
  }
};

module.exports = {
  getPagos,
  getPagoById,
  getPagoPorPedido,
  getPagosPorUsuario,
  createPago,
  updatePago,
  deletePago,
  getPagoCompleto,
  getEstadisticasPagos
};