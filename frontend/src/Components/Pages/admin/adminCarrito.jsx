/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API = "http://localhost:3000/api/carrito";
const ESTADOS = ["activo", "inactivo", "abandonado", "convertido"];

function AdminCarrito() {
    const navigate = useNavigate();
    const formRef = useRef(null);

    const [carritos, setCarritos] = useState([]);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ id_usuario: "", estado: "activo" });

    const fetchCarritos = async () => {
        try {
            const res = await axios.get(API);
            setCarritos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCarritos();
    }, []);

    const handleSearch = () => {
        if (!busquedaId.trim()) {
            fetchCarritos();
            return;
        }
        setCarritos(prev =>
            prev.filter(c => String(c.id_carrito) === busquedaId.trim())
        );
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEdit = (c) => {
        setEditId(c.id_carrito);
        setForm({ id_usuario: c.id_usuario, estado: c.estado });
        setTimeout(() =>
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50
        );
    };

    const handleDelete = async (id) => {
        const confirmado = window.confirm(`¿Eliminar el carrito #${id}?`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id}`, {
                data: { id_usuario: Number(form.id_usuario) }
            });
            fetchCarritos();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar");
        }
    };

    const handleSubmit = async () => {
        if (!form.id_usuario) {
            alert("El ID de usuario es obligatorio");
            return;
        }

        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, {
                    id_usuario: Number(form.id_usuario),
                    estado: form.estado,
                });
            } else {
                await axios.post(API, {
                    id_usuario: Number(form.id_usuario),
                    estado: form.estado,
                });
            }

            setEditId(null);
            setForm({ id_usuario: "", estado: "activo" });
            fetchCarritos();
        } catch (err) {
            alert(err.response?.data?.error || "Error en la operación");
        }
    };

    const estadoColor = (estado) => {
        switch (estado) {
            case "activo": return { background: "#d4edda", color: "#155724" };
            case "inactivo": return { background: "#f8d7da", color: "#721c24" };
            case "abandonado": return { background: "#fff3cd", color: "#856404" };
            case "convertido": return { background: "#cfe2ff", color: "#084298" };
            default: return {};
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

                <h1 style={{ margin: "20px 0" }}>Carritos</h1>

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
                        onClick={() => {
                            setBusquedaId("");
                            fetchCarritos();
                        }}
                    >
                        Reset
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Carrito</th>
                                <th>ID Usuario</th>
                                <th>Fecha creación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {carritos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                                        No hay carritos registrados
                                    </td>
                                </tr>
                            ) : (
                                carritos.map((c) => (
                                    <tr
                                        key={c.id_carrito}
                                        style={
                                            editId === c.id_carrito
                                                ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                                : {}
                                        }
                                    >
                                        <td>{c.id_carrito}</td>
                                        <td>{c.id_usuario}</td>
                                        <td>
                                            {c.fecha_creacion
                                                ? new Date(c.fecha_creacion).toLocaleDateString("es-ES", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    ...estadoColor(c.estado),
                                                    padding: "3px 10px",
                                                    borderRadius: "99px",
                                                    fontSize: "0.8em",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones">
                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => handleEdit(c)}
                                                    style={
                                                        editId === c.id_carrito
                                                            ? { opacity: 0.4, cursor: "not-allowed" }
                                                            : {}
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className="admin-btn admin-btn-delete"
                                                    onClick={() => handleDelete(c.id_carrito)}
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
                        <h3>{editId ? `Editar carrito #${editId}` : "Crear carrito"}</h3>

                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                type="number"
                                name="id_usuario"
                                placeholder="ID Usuario"
                                value={form.id_usuario}
                                onChange={handleChange}
                                disabled={!!editId}
                            />

                            <select
                                className="admin-input"
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                            >
                                {ESTADOS.map(e => (
                                    <option key={e} value={e}>
                                        {e}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>
                                {editId ? "Actualizar" : "Crear carrito"}
                            </button>

                            {editId && (
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => {
                                        setEditId(null);
                                        setForm({ id_usuario: "", estado: "activo" });
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

export default AdminCarrito;