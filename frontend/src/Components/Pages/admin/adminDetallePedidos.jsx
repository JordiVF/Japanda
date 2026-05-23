/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

function AdminDetallesPedidos() {
    const navigate = useNavigate();
    const [detalles, setDetalles] = useState([]);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        id_pedido: "",
        id_producto: "",
        cantidad: "",
        precio_unitario: ""
    });

    const payload = {
    id_pedido: Number(form.id_pedido),
    id_producto: Number(form.id_producto),
    cantidad: Number(form.cantidad),
    precio_unitario: Number(form.precio_unitario)
};

    const API_DETALLES = "http://localhost:3000/api/detallespedidos";

    const fetchData = async () => {
        try {
            const res = await axios.get(API_DETALLES);
            setDetalles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id_detalle) => {
        const confirmado = window.confirm(
            `¿Seguro que quieres eliminar el detalle #${id_detalle}?`
        );

        if (!confirmado) return;

        try {
            await axios.delete(`${API_DETALLES}/${id_detalle}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar el detalle");
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchData();
        try {
            const res = await axios.get(`${API_DETALLES}/${busquedaId}`);
            setDetalles([res.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    
    const handleSubmit = async () => {
        try {
            if (
                !form.id_pedido ||
                !form.id_producto ||
                !form.cantidad ||
                !form.precio_unitario
            ) {
                alert("Todos los campos son obligatorios");
                return;
            }

            if (!editId) {
                await axios.post(API_DETALLES, payload);
            } else {
                await axios.put(`${API_DETALLES}/${editId}`, payload);
            }

            setForm({
                id_pedido: "",
                id_producto: "",
                cantidad: "",
                precio_unitario: ""
            });

            setEditId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Error en la operación");
        }
    };

    const handleEdit = (d) => {
        setEditId(d.id_detalle);
        setForm({
            id_pedido: d.id_pedido,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario
        });
    };

    return (
        <div className="admin-vista">
            <div className="admin-vista-wrapper">

                <div className="admin-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Volver
                    </button>
                </div>

                <h1 style={{ margin: "20px 0" }}>
                    Detalles de pedidos
                </h1>

                {/* BUSCADOR */}
                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID detalle"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchData}>
                        Reset
                    </button>
                </div>

                {/* TABLA */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Detalle</th>
                                <th>ID Pedido</th>
                                <th>ID Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {detalles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                                        No hay detalles de pedidos
                                    </td>
                                </tr>
                            ) : (
                                detalles.map((d) => (
                                    <tr key={d.id_detalle}>
                                        <td>{d.id_detalle}</td>
                                        <td>{d.id_pedido}</td>
                                        <td>{d.id_producto}</td>
                                        <td>{d.cantidad}</td>
                                        <td>{Number(d.precio_unitario).toFixed(2)} €</td>
                                        <td>
                                            {(d.cantidad * d.precio_unitario).toFixed(2)} €
                                        </td>
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
                                                    onClick={() => handleDelete(d.id_detalle)}
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

                {/* FORM */}
                <div className="admin-section" style={{ marginTop: "1.5rem" }}>
                    <div className="admin-form">
                        <h3>{editId ? "Editar detalle" : "Crear detalle"}</h3>

                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                name="id_pedido"
                                placeholder="ID Pedido"
                                value={form.id_pedido}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
                                name="id_producto"
                                placeholder="ID Producto"
                                value={form.id_producto}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
                                name="cantidad"
                                placeholder="Cantidad"
                                value={form.cantidad}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
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
                                            id_pedido: "",
                                            id_producto: "",
                                            cantidad: "",
                                            precio_unitario: ""
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

export default AdminDetallesPedidos;