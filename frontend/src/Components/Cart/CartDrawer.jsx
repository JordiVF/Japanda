import { useState } from "react";
import { useCart } from "../Context/useCart";
import { useAuth } from "../Additionals/AuthContext";
import Checkout from "../Pages/Checkout";
import "../../Styles/CartDrawer.css";

function CartDrawer() {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems
    } = useCart();

    const { user } = useAuth();

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    const handleClearCart = () => {
        clearCart();
        setShowConfirm(false);
    };

    const handleFinalizarCompra = () => {
        if (!user) {
            alert("Debes iniciar sesión para finalizar la compra.");
            return;
        }

        if (!cartItems.length) {
            alert("Tu carrito está vacío.");
            return;
        }

        setIsCartOpen(false);
        setShowCheckout(true);
    };

    return (
        <>
            {showCheckout && (
                <Checkout
                    onClose={() => setShowCheckout(false)}
                    onSuccess={() => {
                        clearCart();
                        setShowCheckout(false);
                    }}
                />
            )}

            <div
                className={`cart-overlay ${isCartOpen ? "cart-overlay--visible" : ""}`}
                onClick={() => {
                    setIsCartOpen(false);
                    setShowConfirm(false);
                }}
            />

            <aside className={`cart-drawer ${isCartOpen ? "cart-drawer--open" : ""}`}>

                <div className="cart-header">
                    <div className="cart-header__title">
                        <span className="cart-header__icon">🛒</span>
                        <h2>Tu carrito</h2>

                        {totalItems > 0 && (
                            <span className="cart-badge">{totalItems}</span>
                        )}
                    </div>

                    <button
                        className="cart-close-btn"
                        onClick={() => {
                            setIsCartOpen(false);
                            setShowConfirm(false);
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div className="cart-body">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <span className="cart-empty__icon">🛍️</span>
                            <p>Tu carrito está vacío</p>
                            <small>Añade productos para empezar</small>
                        </div>
                    ) : (
                        <ul className="cart-list">
                            {cartItems.map(item => (
                                <li key={item.id_producto} className="cart-item">

                                    <img
                                        src={item.imagen_url || "/placeholder.png"}
                                        alt={item.nombre || "Producto"}
                                        className="cart-item__img"
                                    />

                                    <div className="cart-item__info">
                                        <p className="cart-item__name">
                                            {item.nombre || "Producto"}
                                        </p>

                                        <p className="cart-item__price">
                                            {(
                                                (item.precio || 0) * item.quantity
                                            ).toFixed(2)} €
                                        </p>

                                        <div className="cart-item__qty">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id_producto, -1)
                                                }
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id_producto, 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="cart-item__remove"
                                        onClick={() =>
                                            removeFromCart(item.id_producto)
                                        }
                                    >
                                        🗑
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">

                        <div className="cart-total">
                            <span>Total</span>
                            <strong>{totalPrice.toFixed(2)} €</strong>
                        </div>

                        <button
                            className="cart-checkout-btn"
                            onClick={handleFinalizarCompra}
                        >
                            Finalizar compra →
                        </button>

                        {showConfirm ? (
                            <div className="cart-confirm">
                                <p>¿Vaciar carrito?</p>

                                <div className="cart-confirm__btns">
                                    <button className="cart-confirm__yes" onClick={handleClearCart}>Sí</button>
                                    <button className="cart-confirm__no" onClick={() => setShowConfirm(false)}>No</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="cart-clean-btn"
                                onClick={() => setShowConfirm(true)}
                            >
                                Vaciar carrito
                            </button>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
}

export default CartDrawer;