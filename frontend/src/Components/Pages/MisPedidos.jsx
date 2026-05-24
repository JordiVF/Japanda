import { useEffect, useState } from "react";
import { useAuth } from "../Additionals/AuthContext";
import "../../Styles/mispedidos.css";

export default function MisPedidos() {
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      try {
        setLoading(true);

        const userId = user.id_usuario || user.id;

        const res = await fetch(
          `http://localhost:3000/api/pedidos/usuario/${userId}`
        );

        const data = await res.json();

        setPedidos(data);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  const verDetalles = async (id_pedido) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/pedidos/${id_pedido}/detalles`
      );

      const data = await res.json();

      setPedidoSeleccionado(data);
    } catch (err) {
      console.error("Error al cargar detalles:", err);
    }
  };

  if (!user) {
    return <div className="mispedidos-page">Debes iniciar sesión</div>;
  }

  return (
    <div className="mispedidos-page">

      <h1>Mis pedidos</h1>

      {/* LISTA PEDIDOS */}
      {loading ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>No tienes pedidos aún</p>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="pedido-card">

              <h3>Pedido #{pedido.id_pedido}</h3>

              <p>Estado: {pedido.estado}</p>
              <p>Total: {pedido.total}€</p>

              <button
                className="btn-detalles"
                onClick={() => verDetalles(pedido.id_pedido)}
              >
                Ver detalles
              </button>

            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLES */}
      {pedidoSeleccionado && (
        <div
          className="modal-overlay"
          onClick={() => setPedidoSeleccionado(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>Pedido #{pedidoSeleccionado.id_pedido}</h2>

            <p><b>Estado:</b> {pedidoSeleccionado.estado}</p>
            <p><b>Total:</b> {pedidoSeleccionado.total}€</p>

            <h3>Productos</h3>

            {pedidoSeleccionado.productos?.length === 0 ? (
              <p>No hay productos en este pedido</p>
            ) : (
              pedidoSeleccionado.productos.map((item) => (
                <div key={item.id_detalle} className="producto-item">

                  <img
                    src={item.productos?.imagen_url}
                    alt={item.productos?.nombre}
                  />

                  <div>
                    <h4>{item.productos?.nombre}</h4>
                    <p>Cantidad: {item.cantidad}</p>
                    <p>Precio: {item.precio_unitario}€</p>
                  </div>

                </div>
              ))
            )}

            <button
              className="btn-cerrar"
              onClick={() => setPedidoSeleccionado(null)}
            >
              Cerrar
            </button>

          </div>
        </div>
      )}

    </div>
  );
}