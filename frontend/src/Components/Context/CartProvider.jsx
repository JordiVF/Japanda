/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import axios from "axios";

const API = "http://localhost:3000/api/carrito-detalle";
const CART_KEY = "japanda_cart";

function getUser() {
    try {
        return JSON.parse(sessionStorage.getItem("usuario"));
    } catch {
        return null;
    }
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const loadCartFromDB = async (id_usuario) => {
        const res = await axios.get(
            `http://localhost:3000/api/carrito/usuario/${id_usuario}`
        );

        const carrito = res.data;
        if (!carrito?.id_carrito) return [];

        const detalles = await axios.get(
            `http://localhost:3000/api/carrito-detalle/${carrito.id_carrito}`
        );

        return detalles.data.map(item => ({
            id_producto: item.id_producto,
            nombre: item.nombre,
            precio: item.precio_unitario,
            quantity: item.cantidad
        }));
    };

    const syncCart = async () => {
        setLoadingCart(true);

        const u = getUser();

        if (u?.id_usuario) {
            const dbCart = await loadCartFromDB(u.id_usuario);
            setCartItems(dbCart);
        } else {
            const local = localStorage.getItem(CART_KEY);
            setCartItems(local ? JSON.parse(local) : []);
        }

        setLoadingCart(false);
    };

    useEffect(() => {
        const local = localStorage.getItem(CART_KEY);
        const u = getUser();

        if (u?.id_usuario) {
            syncCart();
        } else {
            setCartItems(local ? JSON.parse(local) : []);
            setLoadingCart(false);
        }
    }, []);

    useEffect(() => {
        const handler = () => {
            syncCart();
        };

        window.addEventListener("auth-change", handler);
        return () => window.removeEventListener("auth-change", handler);
    }, []);

    useEffect(() => {
        const u = getUser();

        if (!u?.id_usuario && !loadingCart) {
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, loadingCart]);

    const addToCart = async (product) => {
        const u = getUser();

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

        if (!u?.id_usuario) return;

        const carritoRes = await axios.get(
            `http://localhost:3000/api/carrito/usuario/${u.id_usuario}`
        );

        const carrito = carritoRes.data;
        if (!carrito?.id_carrito) return;

        await axios.post(API, {
            id_carrito: carrito.id_carrito,
            id_producto: product.id_producto,
            cantidad: 1,
            precio_unitario: Number(product.precio)
        });
    };

    const updateQuantity = async (id_producto, delta) => {
        const u = getUser();

        setCartItems(prev =>
            prev
                .map(i =>
                    i.id_producto === id_producto
                        ? { ...i, quantity: i.quantity + delta }
                        : i
                )
                .filter(i => i.quantity > 0)
        );

        if (!u?.id_usuario) return;

        const carritoRes = await axios.get(
            `http://localhost:3000/api/carrito/usuario/${u.id_usuario}`
        );

        const carrito = carritoRes.data;
        if (!carrito?.id_carrito) return;

        await axios.put(`${API}/${carrito.id_carrito}/${id_producto}`, {
            cantidad: delta
        });
    };

    const removeFromCart = async (id_producto) => {
        const u = getUser();

        setCartItems(prev => prev.filter(i => i.id_producto !== id_producto));

        if (!u?.id_usuario) return;

        const carritoRes = await axios.get(
            `http://localhost:3000/api/carrito/usuario/${u.id_usuario}`
        );

        const carrito = carritoRes.data;
        if (!carrito?.id_carrito) return;

        await axios.delete(`${API}/${carrito.id_carrito}/${id_producto}`);
    };

    const clearCart = async () => {
        const u = getUser();

        setCartItems([]);

        if (!u?.id_usuario) return;

        const carritoRes = await axios.get(
            `http://localhost:3000/api/carrito/usuario/${u.id_usuario}`
        );

        const carrito = carritoRes.data;
        if (!carrito?.id_carrito) return;

        await axios.delete(`${API}/${carrito.id_carrito}`);
    };

    const totalItems = cartItems.reduce((a, b) => a + b.quantity, 0);
    const totalPrice = cartItems.reduce((a, b) => a + b.precio * b.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loadingCart,
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