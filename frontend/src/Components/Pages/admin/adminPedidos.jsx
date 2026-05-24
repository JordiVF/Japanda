/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import "../../../Styles/adminVista.css";

const ESTADOS = ["pendiente", "procesando", "enviado", "entregado", "cancelado"];

function AdminPedidos() {
    const [usuarios, setUsuarios] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);

    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);

    const [createForm, setCreateForm] = useState({
        id_usuario: "",
        fecha: "",
        estado: "pendiente",
        total: "",
    });

    const [editForm, setEditForm] = useState({
        estado: "pendiente",
        total: "",
    });

    const API = "http://localhost:3000/api/pedidos";
    const API_USUARIOS = "http://localhost:3000/api/usuarios";

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get(API_USUARIOS);
            setUsuarios(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
        fetchUsuarios();
    }, []);
    const handleDelete = async (id) => {
        const confirmado = window.confirm(
            `¿Seguro que quieres eliminar el pedido #${id}? Esta acción no se puede deshacer.`
        );
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id}`);
            if (editId === id) setEditId(null);
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

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateForm({ ...createForm, [name]: value });
    };


    const handleCreateSubmit = async () => {
        try {
            if (!createForm.id_usuario || !createForm.total) {
                alert("Usuario y total son obligatorios");
                return;
            }

            await axios.post(API, {
                id_usuario: Number(createForm.id_usuario),
                fecha: createForm.fecha
                    ? new Date(createForm.fecha).toLocaleString("sv-SE", { timeZone: "Europe/Madrid" }).replace(" ", "T") + ":00+02:00"
                    : new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" }).replace(" ", "T") + ":00+02:00",
                estado: createForm.estado,
                total: Number(createForm.total),
            });

            setCreateForm({
                id_usuario: "",
                fecha: "",
                estado: "pendiente",
                total: "",
            });

            fetchPedidos();
        } catch (err) {
            alert(err.response?.data?.error || "Error al crear pedido");
        }
    };
    const handleEdit = (pedido) => {
        setEditId(pedido.id_pedido);
        setEditForm({
            estado: pedido.estado || "pendiente",
            total: pedido.total || "",
        });

        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${API}/${editId}`, {
                estado: editForm.estado,
                total: Number(editForm.total),
            });

            setEditId(null);
            fetchPedidos();
        } catch (err) {
            alert(err.response?.data?.error || "Error al actualizar el pedido");
        }
    };

    const estadoColor = (estado) => {
        switch (estado) {
            case "pendiente":
                return { background: "#fff3cd", color: "#856404" };
            case "procesando":
                return { background: "#cfe2ff", color: "#084298" };
            case "enviado":
                return { background: "#d1ecf1", color: "#0c5460" };
            case "entregado":
                return { background: "#d4edda", color: "#155724" };
            case "cancelado":
                return { background: "#f8d7da", color: "#721c24" };
            default:
                return {};
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
                                <tr key={p.id_pedido}>
                                    <td>{p.id_pedido}</td>
                                    <td>{p.id_usuario}</td>
                                    <td>{new Date(p.fecha).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</td>

                                    <td>
                                        <span style={{ ...estadoColor(p.estado), padding: "3px 10px", borderRadius: "99px" }}>
                                            {p.estado}
                                        </span>
                                    </td>

                                    <td>{Number(p.total).toFixed(2)} €</td>

                                    <td>
                                        <div className="acciones">
                                            <button className="admin-btn admin-btn-edit" onClick={() => handleEdit(p)}>
                                                Editar
                                            </button>

                                            <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(p.id_pedido)}>
                                                Borrar
                                            </button>

                                            <button
                                                className="admin-btn admin-btn-secondary"
                                                onClick={() => navigate(`/admin/detalle-pedidos?pedido=${p.id_pedido}`)}
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

                {editId && (
                    <div className="admin-section" ref={formRef}>
                        <div className="admin-form">
                            <h3>Editar pedido #{editId}</h3>

                            <div className="admin-form-grid">
                                <select
                                    className="admin-input"
                                    name="estado"
                                    value={editForm.estado}
                                    onChange={handleEditChange}
                                >
                                    {ESTADOS.map((e) => (
                                        <option key={e} value={e}>
                                            {e}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    className="admin-input"
                                    name="total"
                                    type="number"
                                    value={editForm.total}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="admin-form-actions">
                                <button className="admin-btn admin-btn-primary" onClick={handleUpdate}>
                                    Actualizar
                                </button>

                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setEditId(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>


                )}
                {/* CREATE FORM */}
                {/* CREATE FORM */}
                <div className="admin-section" style={{ marginTop: "1.5rem" }}>
                    <div className="admin-form">
                        <h3>Crear pedido</h3>

                        <div className="admin-form-grid">

                            {/* USUARIO SELECT */}
                            <select
                                className="admin-input"
                                name="id_usuario"
                                value={createForm.id_usuario}
                                onChange={handleCreateChange}
                            >
                                <option value="">-- Selecciona usuario --</option>
                                {usuarios.map((u) => (
                                    <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.id_usuario} - {u.nombre || u.email || "Usuario"}
                                    </option>
                                ))}
                            </select>

                            {/* FECHA */}
                            <input
                                className="admin-input"
                                type="datetime-local"
                                name="fecha"
                                value={createForm.fecha}
                                onChange={handleCreateChange}
                            />

                            {/* TOTAL */}
                            <input
                                className="admin-input"
                                type="number"
                                name="total"
                                placeholder="Total (€)"
                                value={createForm.total}
                                onChange={handleCreateChange}
                            />

                            {/* ESTADO CON COLOR */}
                            <div
                                style={{
                                    ...estadoColor(createForm.estado),
                                    padding: "10px",
                                    borderRadius: "8px",
                                }}
                            >
                                <select
                                    name="estado"
                                    value={createForm.estado}
                                    onChange={handleCreateChange}
                                    style={{
                                        width: "100%",
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        color: "inherit",
                                        fontWeight: 600,
                                    }}
                                >
                                    {ESTADOS.map((e) => (
                                        <option key={e} value={e}>
                                            {e}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        <div className="admin-form-actions">
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleCreateSubmit}
                            >
                                Crear pedido
                            </button>

                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() =>
                                    setCreateForm({
                                        id_usuario: "",
                                        fecha: "",
                                        estado: "pendiente",
                                        total: "",
                                    })
                                }
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPedidos;