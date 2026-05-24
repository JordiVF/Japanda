/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API_DETALLES = "http://localhost:3000/api/detalle_carrito";
const API_PRODUCTOS = "http://localhost:3000/api/productos";

function AdminDetalleCarritos() {
    const navigate = useNavigate();
    const formRef = useRef(null);

    const [detalles, setDetalles] = useState([]);
    const [productos, setProductos] = useState([]);

    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        id_carrito: "",
        id_producto: "",
        cantidad: 1,
        precio_unitario: "",
    });

    const fetchDetalles = async () => {
        try {
            const res = await axios.get(API_DETALLES);
            setDetalles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProductos = async () => {
        try {
            const res = await axios.get(API_PRODUCTOS);
            setProductos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDetalles();
        fetchProductos();
    }, []);

    const handleSearch = async () => {
        if (!busquedaId) return fetchDetalles();

        try {
            const res = await axios.get(`${API_DETALLES}?id_carrito=${busquedaId}`);
            setDetalles(res.data);
        } catch (err) {
            alert(err.response?.data?.error || "No encontrado");
        }
    };

    const handleDelete = async (id_carrito, id_producto) => {
        const confirmado = window.confirm("¿Eliminar producto del carrito?");
        if (!confirmado) return;

        try {
            await axios.delete(`${API_DETALLES}/${id_carrito}/${id_producto}`);
            fetchDetalles();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
                        cantidad: form.cantidad,
                        precio_unitario: form.precio_unitario,
                    }
                );
            } else {
                await axios.post(API_DETALLES, {
                    id_carrito: Number(form.id_carrito),
                    id_producto: Number(form.id_producto),
                    cantidad: Number(form.cantidad),
                    precio_unitario: form.precio_unitario,
                });
            }

            setForm({
                id_carrito: "",
                id_producto: "",
                cantidad: 1,
                precio_unitario: "",
            });

            setEditId(null);
            fetchDetalles();
        } catch (err) {
            alert(err.response?.data?.error || "Error en operación");
        }
    };

    const handleEdit = (d) => {
        setEditId(`${d.id_carrito}-${d.id_producto}`);

        setForm({
            id_carrito: d.id_carrito,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
        });

        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
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
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchDetalles}>
                        Reset
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Carrito</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {detalles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                                        No hay productos en carritos
                                    </td>
                                </tr>
                            ) : (
                                detalles.map((d) => (
                                    <tr key={`${d.id_carrito}-${d.id_producto}`}>

                                        <td>{d.id_carrito}</td>

                                        <td>
                                            {productos.find(p => p.id_producto === d.id_producto)?.nombre || d.id_producto}
                                        </td>

                                        <td>{d.cantidad}</td>
                                        <td>{d.precio_unitario} €</td>

                                        <td>
                                            <div className="acciones">

                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => handleEdit(d)}
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

                        <h3>
                            {editId ? "Editar producto en carrito" : "Añadir producto a carrito"}
                        </h3>

                        <div className="admin-form-grid">

                            <input
                                className="admin-input"
                                type="number"
                                name="id_carrito"
                                placeholder="ID Carrito"
                                value={form.id_carrito}
                                onChange={handleChange}
                                disabled={!!editId}
                            />

                            <select
                                className="admin-input"
                                name="id_producto"
                                value={form.id_producto}
                                onChange={handleChange}
                                disabled={!!editId}
                            >
                                <option value="">Selecciona producto</option>
                                {productos.map((p) => (
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
                                value={form.cantidad}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                type="number"
                                name="precio_unitario"
                                placeholder="Precio unitario"
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
                                        setForm({
                                            id_carrito: "",
                                            id_producto: "",
                                            cantidad: 1,
                                            precio_unitario: "",
                                        });
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