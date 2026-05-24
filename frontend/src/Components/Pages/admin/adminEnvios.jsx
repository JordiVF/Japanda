/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API_ENVIOS = "http://localhost:3000/api/envios";
const API_PEDIDOS = "http://localhost:3000/api/pedidos";

const EMPRESAS = ["Correos", "SEUR", "DHL Express", "MRW", "UPS"];
const ESTADOS_ENVIO = ["pendiente", "en_transito", "entregado", "cancelado", "devuelto"];

const generarTracking = async () => {
    const { data } = await axios.get(API_ENVIOS);
    const trackingsExistentes = data.map((e) => e.tracking);

    let tracking;
    do {
        const resto = Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, "0");
        tracking = `02${resto}`;
    } while (trackingsExistentes.includes(tracking));

    return tracking;
};

function AdminEnvios() {
    const navigate = useNavigate();
    const formRef = useRef(null);

    const [envios, setEnvios] = useState([]);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        id_pedido: "",
        empresa: "Correos",
        tracking: generarTracking(),
        estado: "pendiente",
    });

    const fetchEnvios = async () => {
        try {
            const res = await axios.get(API_ENVIOS);
            setEnvios(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchEnvios();
            const tracking = await generarTracking();
            setForm(prev => ({ ...prev, tracking }));
        };
        init();
    }, []);

    const handleSearch = async () => {
        if (!busquedaId) return fetchEnvios();
        try {
            const res = await axios.get(`${API_ENVIOS}/${busquedaId}`);
            setEnvios([res.data]);
        } catch (err) {
            alert(err.response?.data?.error || "Envio no encontrado");
        }
    };

    const handleDelete = async (id) => {
        const confirmado = window.confirm(`¿Eliminar el envío #${id}? Esta acción no se puede deshacer.`);
        if (!confirmado) return;
        try {
            await axios.delete(`${API_ENVIOS}/${id}`);
            if (editId === id) {
                setEditId(null);
                setForm({ id_pedido: "", empresa: "Correos", tracking: generarTracking(), estado: "pendiente" });
            }
            fetchEnvios();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar el envío");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.id_pedido) {
            alert("El ID de pedido es obligatorio");
            return;
        }
        if (!form.empresa || !form.tracking) {
            alert("Empresa y tracking son obligatorios");
            return;
        }

        try {
            if (editId) {
                // Editar: solo empresa, tracking y estado
                await axios.put(`${API_ENVIOS}/${editId}`, {
                    empresa: form.empresa,
                    tracking: form.tracking,
                    estado: form.estado,
                });
            } else {
                // Crear envío
                await axios.post(API_ENVIOS, {
                    id_pedido: Number(form.id_pedido),
                    empresa: form.empresa,
                    tracking: form.tracking,
                    estado: form.estado,
                });

                // Cambiar estado del pedido a "enviado"
                await axios.put(`${API_PEDIDOS}/${form.id_pedido}`, {
                    estado: "enviado",
                });
            }
            const nuevoTracking = await generarTracking();
            setForm({ id_pedido: "", empresa: "Correos", tracking: nuevoTracking, estado: "pendiente" });
            setEditId(null);
            fetchEnvios();
        } catch (err) {
            alert(err.response?.data?.error || "Error en la operación");
        }
    };

    const handleEdit = (envio) => {
        setEditId(envio.id_envio);
        setForm({
            id_pedido: envio.id_pedido,
            empresa: envio.empresa,
            tracking: envio.tracking,
            estado: envio.estado,
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const estadoColor = (estado) => {
        switch (estado) {
            case "pendiente": return { background: "#fff3cd", color: "#856404" };
            case "en_transito": return { background: "#cfe2ff", color: "#084298" };
            case "entregado": return { background: "#d4edda", color: "#155724" };
            case "cancelado": return { background: "#f8d7da", color: "#721c24" };
            case "devuelto": return { background: "#e2d9f3", color: "#6f42c1" };
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

                <h1 style={{ margin: "20px 0" }}>Envíos</h1>

                {/* BUSCADOR */}
                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID envío"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchEnvios}>
                        Reset
                    </button>
                </div>

                {/* TABLA */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ID Pedido</th>
                                <th>Empresa</th>
                                <th>Tracking</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {envios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                                        No hay envíos registrados
                                    </td>
                                </tr>
                            ) : (
                                envios.map((e) => (
                                    <tr
                                        key={e.id_envio}
                                        style={
                                            editId === e.id_envio
                                                ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                                : {}
                                        }
                                    >
                                        <td>{e.id_envio}</td>
                                        <td>{e.id_pedido}</td>
                                        <td>{e.empresa}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.9em" }}>{e.tracking}</td>
                                        <td>
                                            <span style={{
                                                ...estadoColor(e.estado),
                                                padding: "3px 10px",
                                                borderRadius: "99px",
                                                fontSize: "0.8em",
                                                fontWeight: 700,
                                            }}>
                                                {e.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones">
                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => handleEdit(e)}
                                                    style={editId === e.id_envio ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-delete"
                                                    onClick={() => handleDelete(e.id_envio)}
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
                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">
                        <h3>{editId ? `Editar envío #${editId}` : "Crear envío"}</h3>

                        <div className="admin-form-grid">

                            <input
                                className="admin-input"
                                type="number"
                                name="id_pedido"
                                placeholder="ID Pedido"
                                value={form.id_pedido}
                                onChange={handleChange}
                                disabled={!!editId}
                            />

                            <select
                                className="admin-input"
                                name="empresa"
                                value={form.empresa}
                                onChange={handleChange}
                            >
                                {EMPRESAS.map((emp) => (
                                    <option key={emp} value={emp}>{emp}</option>
                                ))}
                            </select>

                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <input
                                    className="admin-input"
                                    name="tracking"
                                    value={form.tracking}
                                    readOnly
                                    style={{ fontFamily: "monospace", flex: 1, backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                                />
                            </div>

                            <select
                                className="admin-input"
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                            >
                                {ESTADOS_ENVIO.map((est) => (
                                    <option key={est} value={est}>{est}</option>
                                ))}
                            </select>

                        </div>

                        {!editId && (
                            <p style={{ fontSize: "0.82em", color: "#777", marginTop: "0.5rem" }}>
                                Al crear el envío, el estado del pedido cambiará automáticamente a <strong>enviado</strong>.
                            </p>
                        )}

                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>
                                {editId ? "Actualizar" : "Crear envío"}
                            </button>
                            {editId && (
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={async () => {
                                        setEditId(null);
                                        const nuevoTracking = await generarTracking();
                                        setForm({ id_pedido: "", empresa: "Correos", tracking: nuevoTracking, estado: "pendiente" });
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

export default AdminEnvios;