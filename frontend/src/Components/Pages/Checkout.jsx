import { useEffect, useState, useRef } from "react";
import { useAuth } from "../Additionals/AuthContext";
import { useCart } from "../Context/useCart";
import "../../Styles/checkout.css";

const API = "http://localhost:3000/api";

function Checkout({ onClose, onSuccess }) {
    const { user } = useAuth();
    const { cartItems, totalPrice, clearCart } = useCart();

    const [fase, setFase] = useState("procesando");
    const [error, setError] = useState("");
    const [totalPagado, setTotalPagado] = useState(0);
    const yaEjecutado = useRef(false);

    useEffect(() => {
        if (yaEjecutado.current) return;
        yaEjecutado.current = true;

        const itemsSnapshot = [...cartItems];
        const totalSnapshot = Number(totalPrice.toFixed(2));
        setTotalPagado(totalSnapshot);

        const procesarPedido = async () => {
            try {
                const resPedido = await fetch(`${API}/pedidos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_usuario: user.id_usuario,
                        estado: "procesando",
                        total: totalSnapshot,
                    }),
                });

                const dataPedido = await resPedido.json();
                if (!resPedido.ok) throw new Error(dataPedido.error || "Error al crear el pedido");

                const id_pedido = dataPedido.data.id_pedido;

                const detallesPromises = itemsSnapshot.map((item) =>
                    fetch(`${API}/detallespedidos`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id_pedido,
                            id_producto: item.id_producto,
                            cantidad: item.quantity,
                            precio_unitario: Number(item.precio),
                        }),
                    })
                );

                const resDetalles = await Promise.all(detallesPromises);
                const fallido = resDetalles.find((r) => !r.ok);
                if (fallido) {
                    const errData = await fallido.json();
                    throw new Error(errData.error || "Error al guardar detalles del pedido");
                }

                const stockPromises = itemsSnapshot.map(async (item) => {
                    const resProducto = await fetch(`${API}/productos/${item.id_producto}`);
                    const dataProducto = await resProducto.json();
                    const nuevoStock = Math.max(0, dataProducto.stock - item.quantity);

                    return fetch(`${API}/productos/${item.id_producto}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stock: nuevoStock }),
                    });
                });

                await Promise.all(stockPromises);

                clearCart();
                setTimeout(() => setFase("exito"), 3000);

            } catch (err) {
                setError(err.message);
                setFase("error");
            }
        };

        procesarPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        clearCart();
        onClose();
    };

    return (
        <>
            <div className="checkout-overlay" onClick={fase !== "procesando" ? handleClose : undefined} />

            <div className="checkout-sheet">
                <div className="checkout-handle" />

                {fase !== "procesando" && (
                    <button className="checkout-close" onClick={handleClose}>✕</button>
                )}

                {fase === "procesando" && (
                    <div className="checkout-content">
                        <div className="checkout-spinner" />
                        <h2 className="checkout-title">Procesando pago</h2>
                        <p className="checkout-subtitle">Por favor, no cierres esta ventana...</p>
                    </div>
                )}

                {fase === "exito" && (
                    <div className="checkout-content">
                        <div className="checkout-icon checkout-icon--success">✓</div>
                        <h2 className="checkout-title">¡Pedido confirmado!</h2>
                        <p className="checkout-subtitle">
                            Tu pedido ha sido procesado correctamente.<br />
                            Recibirás una confirmación pronto.
                        </p>
                        <p className="checkout-total">Total pagado: <strong>{totalPagado.toFixed(2)} €</strong></p>
                        <button className="checkout-btn" onClick={onSuccess}>
                            Volver a la tienda
                        </button>
                    </div>
                )}

                {fase === "error" && (
                    <div className="checkout-content">
                        <div className="checkout-icon checkout-icon--error">✕</div>
                        <h2 className="checkout-title">Error en el pago</h2>
                        <p className="checkout-subtitle">{error}</p>
                        <button className="checkout-btn" onClick={onClose}>
                            Volver al carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Checkout;