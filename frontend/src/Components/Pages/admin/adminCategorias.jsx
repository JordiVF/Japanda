import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

function AdminCategorias() {
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nombre: "" });

    const API = "http://localhost:3000/api/categorias";

    const fetchCategorias = async () => {
        try {
            const res = await axios.get(API);
            setCategorias(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCategorias();
    }, []);

    const handleDelete = async (id) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar la categoría #${id}? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id}`);
            if (editId === id) {
                setEditId(null);
                setForm({ nombre: "" });
            }
            fetchCategorias();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error al eliminar la categoría");
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchCategorias();
        try {
            const res = await axios.get(`${API}/${busquedaId}`);
            setCategorias([res.data]);
        } catch (err) {
            console.error(err);
            alert("Categoría no encontrada");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, form);
            } else {
                await axios.post(API, form);
            }

            setForm({ nombre: "" });
            setEditId(null);
            fetchCategorias();
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert(err.response?.data?.error || "Error");
        }
    };

    const handleEdit = (categoria) => {
        setEditId(categoria.id_categoria);
        setForm({ nombre: categoria.nombre || "" });

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

                <h1 style={{ margin: "20px 0" }}>Categorías</h1>

                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={fetchCategorias}>
                        Reset
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.map((c) => (
                                <tr
                                    key={c.id_categoria}
                                    style={
                                        editId === c.id_categoria
                                            ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                            : {}
                                    }
                                >
                                    <td>{c.id_categoria}</td>
                                    <td>{c.nombre}</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="admin-btn admin-btn-edit"
                                                onClick={() => handleEdit(c)}
                                                style={
                                                    editId === c.id_categoria
                                                        ? { opacity: 0.4, cursor: "not-allowed" }
                                                        : {}
                                                }
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-delete"
                                                onClick={() => handleDelete(c.id_categoria)}
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">
                        <h3>{editId ? "Editar categoría" : "Crear categoría"}</h3>

                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                name="nombre"
                                placeholder="Nombre de la categoría"
                                value={form.nombre}
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
                                        setForm({ nombre: "" });
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

export default AdminCategorias;