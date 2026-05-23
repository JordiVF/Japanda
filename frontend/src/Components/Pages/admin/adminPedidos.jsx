/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const ESTADOS = ["pendiente", "procesando", "enviado", "entregado", "cancelado"];

function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ estado: "pendiente", total: "" });

    const API = "http://localhost:3000/api/pedidos";

    const fetchPedidos = async () => {
        try {
            const res = await axios.get(API);
            setPedidos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPedidos(); 
    }, []);

    const handleDelete = async (id) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar el pedido #${id}? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id}`);
            if (editId === id) {
                setEditId(null);
                setForm({ estado: "pendiente", total: "" });
            }
            fetchPedidos();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar el pedido");
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchPedidos();
        try {
            const res = await axios.get(`${API}/${busquedaId}`);
            setPedidos([res.data]);
        } catch (err) {
             alert(err.response?.data?.error || "Pedido no encontrado");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.estado) {
            alert("El estado es obligatorio");
            return;
        }
        if (!editId) {
            alert("Solo se pueden editar pedidos existentes");
            return;
        }

        try {
            await axios.put(`${API}/${editId}`, {
                estado: form.estado,
                ...(form.total !== "" && { total: Number(form.total) }),
            });
            setForm({ estado: "pendiente", total: "" });
            setEditId(null);
            fetchPedidos();
        } catch (err) {
            alert(err.response?.data?.error || "Error al actualizar el pedido");
        }
    };

    const handleEdit = (pedido) => {
        setEditId(pedido.id_pedido);
        setForm({
            estado: pedido.estado || "pendiente",
            total: pedido.total || "",
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const estadoColor = (estado) => {
        switch (estado) {
            case "pendiente":   return { background: "#fff3cd", color: "#856404" };
            case "procesando":  return { background: "#cfe2ff", color: "#084298" };
            case "enviado":     return { background: "#d1ecf1", color: "#0c5460" };
            case "entregado":   return { background: "#d4edda", color: "#155724" };
            case "cancelado":   return { background: "#f8d7da", color: "#721c24" };
            default:            return {};
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

                <h1 style={{ margin: "20px 0" }}>Pedidos</h1>

                {/* BUSCADOR */}
                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID de pedido"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchPedidos}>
                        Reset
                    </button>
                </div>

                {/* TABLA */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ID Usuario</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((p) => (
                                <tr
                                    key={p.id_pedido}
                                    style={
                                        editId === p.id_pedido
                                            ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                            : {}
                                    }
                                >
                                    <td>{p.id_pedido}</td>
                                    <td>{p.id_usuario}</td>
                                    <td>{new Date(p.fecha).toLocaleDateString("es-ES", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                    })}</td>
                                    <td>
                                        <span style={{
                                            ...estadoColor(p.estado),
                                            padding: "3px 10px",
                                            borderRadius: "99px",
                                            fontSize: "0.8em",
                                            fontWeight: 700,
                                        }}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td>{Number(p.total).toFixed(2)} €</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="admin-btn admin-btn-edit"
                                                onClick={() => handleEdit(p)}
                                                style={editId === p.id_pedido ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-delete"
                                                onClick={() => handleDelete(p.id_pedido)}
                                            >
                                                Borrar
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-secondary"
                                                onClick={() => navigate(`/admin/pedidos/${p.id_pedido}/detalles`)}
                                            >
                                                Detalles
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FORM EDICIÓN */}
                {editId && (
                    <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                        <div className="admin-form">
                            <h3>Editar pedido #{editId}</h3>

                            <div className="admin-form-grid">
                                <select
                                    className="admin-input"
                                    name="estado"
                                    value={form.estado}
                                    onChange={handleChange}
                                >
                                    {ESTADOS.map((e) => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>

                                <input
                                    className="admin-input"
                                    type="number"
                                    name="total"
                                    placeholder="Total (opcional)"
                                    value={form.total}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="admin-form-actions">
                                <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>
                                    Actualizar
                                </button>
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => { setEditId(null); setForm({ estado: "pendiente", total: "" }); }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default AdminPedidos;