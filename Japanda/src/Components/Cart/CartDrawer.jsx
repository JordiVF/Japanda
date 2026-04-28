import { useCart } from "../Context/useCart";
import "../../Styles/CartDrawer.css";

function CartDrawer() {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <>
            {/* Overlay oscuro */}
            <div
                className={`cart-overlay ${isCartOpen ? "cart-overlay--visible" : ""}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <aside className={`cart-drawer ${isCartOpen ? "cart-drawer--open" : ""}`}>

                {/* Header */}
                <div className="cart-header">
                    <div className="cart-header__title">
                        <span className="cart-header__icon">🛒</span>
                        <h2>Tu carrito</h2>
                        {totalItems > 0 && (
                            <span className="cart-badge">{totalItems}</span>
                        )}
                    </div>
                    <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
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
                                        src={item.imagen_url}
                                        alt={item.nombre}
                                        className="cart-item__img"
                                    />
                                    <div className="cart-item__info">
                                        <p className="cart-item__name">{item.nombre}</p>
                                        <p className="cart-item__price">
                                            {(item.precio * item.quantity).toFixed(2)} €
                                        </p>
                                        <div className="cart-item__qty">
                                            <button onClick={() => updateQuantity(item.id_producto, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id_producto, +1)}>+</button>
                                        </div>
                                    </div>
                                    <button
                                        className="cart-item__remove"
                                        onClick={() => removeFromCart(item.id_producto)}
                                        title="Eliminar"
                                    >
                                        🗑
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <strong>{totalPrice.toFixed(2)} €</strong>
                        </div>
                        <button className="cart-checkout-btn">
                            Finalizar compra →
                        </button>

                        <button className="cart-clean-btn">
                            Limpiar carrito
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}

export default CartDrawer;