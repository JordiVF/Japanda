/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API = "http://localhost:3000/api/carrito";

function AdminCarrito() {
    const navigate = useNavigate();
    const [carritos, setCarritos] = useState([]);
    const [busquedaUsuario, setBusquedaUsuario] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("usuario");
            if (stored) {
                const user = JSON.parse(stored);
                setAdminEmail(user.email);
            }
        } catch {
            console.error("Error cargando usuario admin");
        }
    }, []);

    const headers = { "x-user-email": adminEmail };

    const fetchCarrito = async (id_usuario) => {
        if (!id_usuario) return;
        try {
            const res = await axios.get(`${API}/${id_usuario}/productos`, { headers });
            setCarritos(res.data);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error al obtener el carrito");
        }
    };

    const handleSearch = () => {
        if (!busquedaUsuario.trim()) {
            alert("Introduce un ID de usuario");
            return;
        }
        fetchCarrito(busquedaUsuario);
    };

    const handleDelete = async (id_usuario, id_producto) => {
        const confirmado = window.confirm(`¿Eliminar producto #${id_producto} del carrito del usuario #${id_usuario}?`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id_usuario}/${id_producto}`, { headers });
            fetchCarrito(id_usuario);
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar");
        }
    };

    const handleVaciar = async (id_usuario) => {
        const confirmado = window.confirm(`¿Vaciar todo el carrito del usuario #${id_usuario}?`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id_usuario}`, { headers });
            setCarritos([]);
        } catch (err) {
            alert(err.response?.data?.error || "Error al vaciar el carrito");
        }
    };

    const totalCarrito = carritos.reduce(
        (sum, item) => sum + item.cantidad * item.precio_unitario, 0
    );

    return (
        <div className="admin-vista">
            <div className="admin-vista-wrapper">
                <div className="admin-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Volver
                    </button>
                </div>

                <h1 style={{ margin: "20px 0" }}>Carrito por usuario</h1>

                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="ID de usuario"
                        value={busquedaUsuario}
                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => { setCarritos([]); setBusquedaUsuario(""); }}
                    >
                        Reset
                    </button>
                    {carritos.length > 0 && (
                        <button
                            className="admin-btn admin-btn-delete"
                            onClick={() => handleVaciar(busquedaUsuario)}
                        >
                            Vaciar carrito
                        </button>
                    )}
                </div>

                {carritos.length > 0 && (
                    <div className="admin-section" style={{ padding: "1rem", marginBottom: "1rem" }}>
                        <span style={{ fontWeight: 700 }}>
                            {carritos.length} producto{carritos.length !== 1 ? "s" : ""} —
                            Total: <span style={{ color: "#e34f1d" }}>{totalCarrito.toFixed(2)} €</span>
                        </span>
                    </div>
                )}

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Carrito</th>
                                <th>ID Producto</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio unit.</th>
                                <th>Subtotal</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritos.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                                        Busca un usuario para ver su carrito
                                    </td>
                                </tr>
                            ) : (
                                carritos.map((item) => (
                                    <tr key={item.id_carrito}>
                                        <td>{item.id_carrito}</td>
                                        <td>{item.id_producto}</td>
                                        <td>{item.productos?.nombre || "-"}</td>
                                        <td>{item.cantidad}</td>
                                        <td>{Number(item.precio_unitario).toFixed(2)} €</td>
                                        <td>{(item.cantidad * item.precio_unitario).toFixed(2)} €</td>
                                        <td>{new Date(item.fecha_agregado).toLocaleDateString("es-ES", {
                                            day: "2-digit", month: "2-digit", year: "numeric"
                                        })}</td>
                                        <td>
                                            <div className="acciones">
                                                <button
                                                    className="admin-btn admin-btn-delete"
                                                    onClick={() => handleDelete(item.id_usuario, item.id_producto)}
                                                >
                                                    Borrar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default AdminCarrito;