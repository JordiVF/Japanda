/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API_DETALLES = "http://localhost:3000/api/carrito-detalle";
const API_PRODUCTOS = "http://localhost:3000/api/productos";
const API_CARRITOS = "http://localhost:3000/api/carrito";

function AdminDetalleCarritos() {
    const navigate = useNavigate();
    const formRef = useRef(null);

    const estadoColor = (estado) => {
        switch (estado) {
            case "activo": return { background: "#d4edda", color: "#155724" };
            case "inactivo": return { background: "#f8d7da", color: "#721c24" };
            case "abandonado": return { background: "#fff3cd", color: "#856404" };
            case "convertido": return { background: "#cfe2ff", color: "#084298" };
            default: return { background: "#fff", color: "#333" };
        }
    };

    const [detalles, setDetalles] = useState([]);
    const [productos, setProductos] = useState([]);
    const [carritos, setCarritos] = useState([]);

    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        id_carrito: "",
        id_producto: "",
        cantidad: 1,
        precio_unitario: "",
    });

    const fetchDetalles = async () => {
        try { const res = await axios.get(API_DETALLES); setDetalles(res.data); } catch (err) { console.error(err); }
    };
    const fetchProductos = async () => {
        try { const res = await axios.get(API_PRODUCTOS); setProductos(res.data); } catch (err) { console.error(err); }
    };
    const fetchCarritos = async () => {
        try { const res = await axios.get(API_CARRITOS); setCarritos(res.data); } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchDetalles();
        fetchProductos();
        fetchCarritos();
    }, []);

    const handleSearch = () => {
        if (!busquedaId.trim()) { fetchDetalles(); return; }
        setDetalles(prev => prev.filter(d => String(d.id_carrito) === busquedaId.trim()));
    };

    const handleDelete = async (id_carrito, id_producto) => {
        if (!window.confirm("¿Eliminar producto del carrito?")) return;
        try {
            await axios.delete(`${API_DETALLES}/${id_carrito}/${id_producto}`);
            if (editId === `${id_carrito}-${id_producto}`) {
                setEditId(null);
                setForm({ id_carrito: "", id_producto: "", cantidad: 1, precio_unitario: "" });
            }
            fetchDetalles();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "id_producto") {
            const producto = productos.find(p => String(p.id_producto) === String(value));
            setForm(prev => ({
                ...prev,
                id_producto: value,
                precio_unitario: producto ? producto.precio : "",
            }));
            return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (d) => {
        setEditId(`${d.id_carrito}-${d.id_producto}`);
        setForm({
            id_carrito: d.id_carrito,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
        });
        setTimeout(() =>
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50
        );
    };

    const handleSubmit = async () => {
        if (!form.id_carrito || !form.id_producto) {
            alert("Carrito y producto son obligatorios");
            return;
        }

        try {
            if (editId) {
                await axios.put(
                    `${API_DETALLES}/${form.id_carrito}/${form.id_producto}`,
                    {
                        cantidad: Number(form.cantidad),
                        precio_unitario: Number(form.precio_unitario),
                    }

                );
                window.location.reload();
            } else {
                await axios.post(API_DETALLES, {
                    id_carrito: Number(form.id_carrito),
                    id_producto: Number(form.id_producto),
                    cantidad: Number(form.cantidad),
                    precio_unitario: Number(form.precio_unitario),
                }

                ); 
                window.location.reload();
            }

            setForm({ id_carrito: "", id_producto: "", cantidad: 1, precio_unitario: "" });
            setEditId(null);
            fetchDetalles();
        } catch (err) {
            alert(err.response?.data?.error || "Error en operación");
        }
    };

    return (
        <div className="admin-vista">
            <div className="admin-vista-wrapper">

                <div className="admin-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Volver
                    </button>
                </div>

                <h1 style={{ margin: "20px 0" }}>Detalle Carritos</h1>

                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID carrito"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => { setBusquedaId(""); fetchDetalles(); }}
                    >
                        Reset
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Carrito</th>
                                <th>Usuario</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Fecha agregado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {detalles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                                        No hay productos en carritos
                                    </td>
                                </tr>
                            ) : (
                                detalles.map((d) => (
                                    <tr
                                        key={`${d.id_carrito}-${d.id_producto}`}
                                        style={
                                            editId === `${d.id_carrito}-${d.id_producto}`
                                                ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                                : {}
                                        }
                                    >
                                        <td>{d.id_carrito}</td>

                                        <td>
                                            {d.nombre_usuario
                                                ? `${d.nombre_usuario} (${d.email_usuario})`
                                                : d.email_usuario ?? "-"}
                                        </td>

                                        <td>{d.nombre_producto ?? d.id_producto}</td>
                                        <td>{d.cantidad}</td>
                                        <td>{Number(d.precio_unitario).toFixed(2)} €</td>

                                        <td>
                                            {d.fecha_agregado
                                                ? new Date(d.fecha_agregado).toLocaleDateString("es-ES")
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="acciones">
                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => handleEdit(d)}
                                                    style={
                                                        editId === `${d.id_carrito}-${d.id_producto}`
                                                            ? { opacity: 0.4, cursor: "not-allowed" }
                                                            : {}
                                                    }
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-delete"
                                                    onClick={() => handleDelete(d.id_carrito, d.id_producto)}
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

                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">

                        <h3>{editId ? "Editar producto en carrito" : "Añadir producto a carrito"}</h3>

                        <div className="admin-form-grid">

                            <select
                                className="admin-input"
                                name="id_carrito"
                                value={form.id_carrito}
                                onChange={handleChange}
                                disabled={!!editId}
                                style={
                                    form.id_carrito
                                        ? estadoColor(carritos.find(c => String(c.id_carrito) === String(form.id_carrito))?.estado)
                                        : {}
                                }
                            >
                                <option value="">-- Selecciona carrito --</option>
                                {carritos.map(c => (
                                    <option
                                        key={c.id_carrito}
                                        value={c.id_carrito}
                                        style={estadoColor(c.estado)}
                                    >
                                        #{c.id_carrito} — {c.estado}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="admin-input"
                                name="id_producto"
                                value={form.id_producto}
                                onChange={handleChange}
                                disabled={!!editId}
                            >
                                <option value="">-- Selecciona producto --</option>
                                {productos.map(p => (
                                    <option key={p.id_producto} value={p.id_producto}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="admin-input"
                                type="number"
                                name="cantidad"
                                placeholder="Cantidad"
                                min={1}
                                value={form.cantidad}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                type="number"
                                name="precio_unitario"
                                placeholder="Precio unitario"
                                step="0.01"
                                min={0}
                                value={form.precio_unitario}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>

                                {editId ? "Actualizar" : "Añadir"}
                            </button>

                            {editId && (
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => {
                                        setEditId(null);
                                        setForm({ id_carrito: "", id_producto: "", cantidad: 1, precio_unitario: "" });
                                        window.location.reload();
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDetalleCarritos;