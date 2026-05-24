import { useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContext";

const CART_KEY = "japanda_cart";
const API = "http://localhost:3000/api/carrito";

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

    // Obtener usuario del sessionStorage
    const getUser = () => {
        try {
            const stored = sessionStorage.getItem("usuario");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };

    const getHeaders = (user) => ({
        "Content-Type": "application/json",
        "x-user-email": user.email,
    });

    // Sincronizar carrito local → BD al hacer login
    const syncCartToDB = useCallback(async (user, items) => {
        if (!user || items.length === 0) return;
        try {
            for (const item of items) {
                await fetch(API, {
                    method: "POST",
                    headers: getHeaders(user),
                    body: JSON.stringify({
                        id_usuario: user.id_usuario,
                        id_producto: item.id_producto,
                        cantidad: item.quantity,
                        precio_unitario: Number(item.precio),
                        email: user.email,
                    }),
                });
            }
        } catch (err) {
            console.error("Error sincronizando carrito:", err);
        }
    }, []);

    // Cargar carrito desde BD al iniciar si hay usuario
    useEffect(() => {
        const user = getUser();
        if (!user) return;

        const loadFromDB = async () => {
            try {
                const res = await fetch(`${API}/${user.id_usuario}/productos`, {
                    headers: getHeaders(user),
                });
                if (!res.ok) return;
                const data = await res.json();

                if (data.length > 0) {
                    // BD tiene datos → usarlos
                    const items = data.map((item) => ({
                        id_producto: item.id_producto,
                        nombre: item.productos?.nombre || "",
                        precio: item.precio_unitario,
                        imagen_url: item.productos?.imagen_url || "",
                        quantity: item.cantidad,
                    }));
                    setCartItems(items);
                    saveCart(items);
                } else {
                    // BD vacía → sincronizar local si hay algo
                    const localItems = loadCart();
                    if (localItems.length > 0) {
                        await syncCartToDB(user, localItems);
                    }
                }
            } catch (err) {
                console.error("Error cargando carrito desde BD:", err);
            }
        };

        loadFromDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Guardar en localStorage siempre
    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    const addToCart = async (product) => {
        const user = getUser();

        setCartItems((prev) => {
            const existing = prev.find((item) => item.id_producto === product.id_producto);
            if (existing) {
                return prev.map((item) =>
                    item.id_producto === product.id_producto
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        setIsCartOpen(true);

        // Sincronizar con BD si está loggeado
        if (user) {
            try {
                await fetch(API, {
                    method: "POST",
                    headers: getHeaders(user),
                    body: JSON.stringify({
                        id_usuario: user.id_usuario,
                        id_producto: product.id_producto,
                        cantidad: 1,
                        precio_unitario: Number(product.precio),
                        email: user.email,
                    }),
                });
            } catch (err) {
                console.error("Error añadiendo al carrito BD:", err);
            }
        }
    };

    const removeFromCart = async (id) => {
        const user = getUser();
        setCartItems((prev) => prev.filter((item) => item.id_producto !== id));

        if (user) {
            try {
                await fetch(`${API}/${user.id_usuario}/${id}`, {
                    method: "DELETE",
                    headers: getHeaders(user),
                });
            } catch (err) {
                console.error("Error eliminando del carrito BD:", err);
            }
        }
    };

    const updateQuantity = async (id, delta) => {
        const user = getUser();

        setCartItems((prev) => {
            const updated = prev
                .map((item) =>
                    item.id_producto === id
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter((item) => item.quantity > 0);

            // Sincronizar con BD
            if (user) {
                const item = updated.find((i) => i.id_producto === id);
                if (item) {
                    fetch(`${API}/${user.id_usuario}/${id}`, {
                        method: "PUT",
                        headers: getHeaders(user),
                        body: JSON.stringify({
                            cantidad: item.quantity,
                            precio_unitario: Number(item.precio),
                        }),
                    }).catch((err) => console.error("Error actualizando carrito BD:", err));
                } else {
                    // quantity llegó a 0 → eliminar de BD
                    fetch(`${API}/${user.id_usuario}/${id}`, {
                        method: "DELETE",
                        headers: getHeaders(user),
                    }).catch((err) => console.error("Error eliminando carrito BD:", err));
                }
            }

            return updated;
        });
    };

    const clearCart = async () => {
        const user = getUser();
        setCartItems([]);

        if (user) {
            try {
                await fetch(`${API}/${user.id_usuario}`, {
                    method: "DELETE",
                    headers: getHeaders(user),
                });
            } catch (err) {
                console.error("Error vaciando carrito BD:", err);
            }
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}