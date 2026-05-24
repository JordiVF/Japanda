import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

const API = "http://localhost:3000/api/carrito-detalle";

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem("cart", JSON.stringify(items));
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const getUser = () => {
        const u = sessionStorage.getItem("usuario");
        return u ? JSON.parse(u) : null;
    };

    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    const addToCart = async (product) => {
        const user = getUser();
        if (!user) return;

        setCartItems(prev => {
            const exists = prev.find(i => i.id_producto === product.id_producto);

            if (exists) {
                return prev.map(i =>
                    i.id_producto === product.id_producto
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });

        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_carrito: user.id_carrito,   // IMPORTANTE
                id_producto: product.id_producto,
                cantidad: 1,
                precio_unitario: Number(product.precio)
            })
        });
    };

    const updateQuantity = async (id_producto, delta) => {
        const user = getUser();
        if (!user) return;

        setCartItems(prev => {
            const updated = prev
                .map(i =>
                    i.id_producto === id_producto
                        ? { ...i, quantity: i.quantity + delta }
                        : i
                )
                .filter(i => i.quantity > 0);

            const item = updated.find(i => i.id_producto === id_producto);

            if (item) {
                fetch(`${API}/${user.id_carrito}/${id_producto}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cantidad: item.quantity
                    })
                });
            } else {
                fetch(`${API}/${user.id_carrito}/${id_producto}`, {
                    method: "DELETE"
                });
            }

            return updated;
        });
    };

    const removeFromCart = async (id_producto) => {
        const user = getUser();
        if (!user) return;

        setCartItems(prev =>
            prev.filter(i => i.id_producto !== id_producto)
        );

        await fetch(`${API}/${user.id_carrito}/${id_producto}`, {
            method: "DELETE"
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((a, b) => a + b.quantity, 0);

    const totalPrice = cartItems.reduce(
        (a, b) => a + b.precio * b.quantity,
        0
    );

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}