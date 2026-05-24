/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

const API = "http://localhost:3000/api/carrito-detalle";
const CART_KEY = "japanda_cart";

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getUser() {
    try {
        return JSON.parse(sessionStorage.getItem("usuario"));
    } catch {
        return null;
    }
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    const addToCart = async (product) => {
        const user = getUser();

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

        setIsCartOpen(true);

        if (!user?.id_carrito) return;

        try {
            await axios.post(API, {
                id_carrito: user.id_carrito,
                id_producto: product.id_producto,
                cantidad: 1,
                precio_unitario: Number(product.precio)
            });
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const updateQuantity = async (id_producto, delta) => {
        const user = getUser();

        setCartItems(prev => {
            const updated = prev
                .map(i =>
                    i.id_producto === id_producto
                        ? { ...i, quantity: i.quantity + delta }
                        : i
                )
                .filter(i => i.quantity > 0);

            const item = updated.find(i => i.id_producto === id_producto);

            if (user && item) {
                axios.put(`${API}/${user.id_carrito}/${id_producto}`, {
                    cantidad: item.quantity
                });
            }

            if (user && !item) {
                axios.delete(`${API}/${user.id_carrito}/${id_producto}`);
            }

            return updated;
        });
    };

    const removeFromCart = async (id_producto) => {
        const user = getUser();

        setCartItems(prev => prev.filter(i => i.id_producto !== id_producto));

        if (user) {
            await axios.delete(`${API}/${user.id_carrito}/${id_producto}`);
        }
    };

    const clearCart = async () => {
        const user = getUser();

        setCartItems([]);

        if (user) {
            await axios.delete(`${API}/${user.id_carrito}`);
        }
    };

    const totalItems = cartItems.reduce((a, b) => a + b.quantity, 0);
    const totalPrice = cartItems.reduce((a, b) => a + b.precio * b.quantity, 0);

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

export function useCart() {
    return useContext(CartContext);
}