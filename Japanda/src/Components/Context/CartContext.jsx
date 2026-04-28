import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

const CART_KEY = "japanda_cart";

function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id_producto === product.id_producto);
            if (existing) {
                return prev.map(item =>
                    item.id_producto === product.id_producto
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id_producto !== id));
    };

    const updateQuantity = (id, delta) => {
        setCartItems(prev =>
            prev
                .map(item =>
                    item.id_producto === id
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}