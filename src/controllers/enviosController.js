const supabase = require('../config/supabaseClient');

const getEnvios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('envios')
      .select('id_envio, id_pedido, empresa, tracking, estado')
      .order('id_envio', { ascending: false });
    
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envíos', details: error.message });
  }
};

const getEnvioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('envios')
      .select('id_envio, id_pedido, empresa, tracking, estado')
      .eq('id_envio', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Envío no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envío', details: error.message });
  }
};

const getEnvioPorPedido = async (req, res) => {
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
      .from('envios')
      .select('id_envio, id_pedido, empresa, tracking, estado')
      .eq('id_pedido', id_pedido)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'No existe envío para este pedido' });
    }
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envío', details: error.message });
  }
};

const getEnviosPorUsuario = async (req, res) => {
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
      .from('envios')
      .select(`
        id_envio,
        id_pedido,
        empresa,
        tracking,
        estado,
        pedidos(id_pedido, fecha, total)
      `)
      .eq('pedidos.id_usuario', id_usuario)
      .order('id_envio', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envíos del usuario', details: error.message });
  }
};

const getEnvioPorTracking = async (req, res) => {
  try {
    const { tracking } = req.params;
    
    if (!tracking || tracking.trim().length === 0) {
      return res.status(400).json({ error: 'El número de tracking es requerido' });
    }

    const { data, error } = await supabase
      .from('envios')
      .select('id_envio, id_pedido, empresa, tracking, estado')
      .eq('tracking', tracking)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Envío con ese número de tracking no encontrado' });
    }
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envío', details: error.message });
  }
};

const createEnvio = async (req, res) => {
  try {
    const { id_pedido, empresa, tracking, estado = 'pendiente' } = req.body;

    if (!id_pedido || !empresa || !tracking) {
      return res.status(400).json({ 
        error: 'id_pedido, empresa y tracking son requeridos' 
      });
    }

    if (empresa.trim().length === 0 || tracking.trim().length === 0) {
      return res.status(400).json({ error: 'Los campos no pueden estar vacíos' });
    }

    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('id_pedido')
      .eq('id_pedido', id_pedido)
      .single();

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'El pedido especificado no existe' });
    }

    const { data: envioExistente } = await supabase
      .from('envios')
      .select('id_envio')
      .eq('id_pedido', id_pedido)
      .single();

    if (envioExistente) {
      return res.status(400).json({ error: 'Ya existe un envío para este pedido' });
    }

    const estadosValidos = ['pendiente', 'en_transito', 'entregado', 'cancelado', 'devuelto'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
      });
    }

    const { data, error } = await supabase
      .from('envios')
      .insert([{ 
        id_pedido,
        empresa: empresa.trim(),
        tracking: tracking.trim(),
        estado
      }])
      .select('id_envio, id_pedido, empresa, tracking, estado');

    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Envío creado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear envío', details: error.message });
  }
};

const updateEnvio = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresa, tracking, estado } = req.body;

    if (!empresa && !tracking && !estado) {
      return res.status(400).json({ 
        error: 'Al menos uno de estos campos debe ser proporcionado: empresa, tracking, estado' 
      });
    }

    if (empresa && empresa.trim().length === 0) {
      return res.status(400).json({ error: 'La empresa no puede estar vacía' });
    }

    if (tracking && tracking.trim().length === 0) {
      return res.status(400).json({ error: 'El tracking no puede estar vacío' });
    }

    if (estado) {
      const estadosValidos = ['pendiente', 'en_transito', 'entregado', 'cancelado', 'devuelto'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ')
        });
      }
    }

    const { data: envioExistente } = await supabase
      .from('envios')
      .select('id_envio')
      .eq('id_envio', id)
      .single();

    if (!envioExistente) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    const updateData = {};
    if (empresa) updateData.empresa = empresa.trim();
    if (tracking) updateData.tracking = tracking.trim();
    if (estado) updateData.estado = estado;

    const { data, error } = await supabase
      .from('envios')
      .update(updateData)
      .eq('id_envio', id)
      .select('id_envio, id_pedido, empresa, tracking, estado');

    if (error) throw error;

    res.status(200).json({ 
      message: 'Envío actualizado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar envío', details: error.message });
  }
};

const deleteEnvio = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('envios')
      .delete()
      .eq('id_envio', id)
      .select('id_envio, id_pedido, tracking');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    res.status(200).json({ 
      message: 'Envío eliminado exitosamente', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar envío', details: error.message });
  }
};

const getEnvioCompleto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('envios')
      .select(`
        id_envio,
        id_pedido,
        empresa,
        tracking,
        estado,
        pedidos(
          id_pedido,
          id_usuario,
          fecha,
          estado,
          total,
          usuarios(nombre, email, telefono, direccion, ciudad, cp, pais)
        )
      `)
      .eq('id_envio', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Envío no encontrado' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener envío', details: error.message });
  }
};

module.exports = {
  getEnvios,
  getEnvioById,
  getEnvioPorPedido,
  getEnviosPorUsuario,
  getEnvioPorTracking,
  createEnvio,
  updateEnvio,
  deleteEnvio,
  getEnvioCompleto
};