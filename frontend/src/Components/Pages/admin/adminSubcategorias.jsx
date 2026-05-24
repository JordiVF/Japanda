/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

function AdminSubcategorias() {
    const [subcategorias, setSubcategorias] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nombre: "", id_categoria: "" });

    const API = "http://localhost:3000/api/subcategorias";

    const fetchSubcategorias = async () => {
        try {
            const res = await axios.get(API);
            setSubcategorias(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubcategorias();
    }, []);

    const handleDelete = async (id) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar la subcategoría #${id}? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        try {
            await axios.delete(`${API}/${id}`);
            if (editId === id) {
                setEditId(null);
                setForm({ nombre: "", id_categoria: "" });
            }
            fetchSubcategorias();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error al eliminar la subcategoría");
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchSubcategorias();
        try {
            const res = await axios.get(`${API}/${busquedaId}`);
            setSubcategorias([res.data]);
        } catch (err) {
            console.error(err);
            alert("Subcategoría no encontrada");
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
        if (!form.id_categoria) {
            alert("El ID de categoría es obligatorio");
            return;
        }

        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, {
                    nombre: form.nombre,
                    id_categoria: Number(form.id_categoria),
                });
            } else {
                await axios.post(API, {
                    nombre: form.nombre,
                    id_categoria: Number(form.id_categoria),
                });
            }

            setForm({ nombre: "", id_categoria: "" });
            setEditId(null);
            fetchSubcategorias();
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert(err.response?.data?.error || "Error");
        }
    };

    const handleEdit = (subcategoria) => {
        setEditId(subcategoria.id_subcategoria);
        setForm({
            nombre: subcategoria.nombre || "",
            id_categoria: subcategoria.id_categoria || "",
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

                <h1 style={{ margin: "20px 0" }}>Subcategorías</h1>

                {/* BUSCADOR */}
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
                    <button className="admin-btn admin-btn-secondary" onClick={fetchSubcategorias}>
                        Reset
                    </button>
                </div>

                {/* TABLA */}
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ID Categoría</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategorias.map((s) => (
                                <tr
                                    key={s.id_subcategoria}
                                    style={
                                        editId === s.id_subcategoria
                                            ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                            : {}
                                    }
                                >
                                    <td>{s.id_subcategoria}</td>
                                    <td>{s.id_categoria}</td>
                                    <td>{s.nombre}</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="admin-btn admin-btn-edit"
                                                onClick={() => handleEdit(s)}
                                                style={
                                                    editId === s.id_subcategoria
                                                        ? { opacity: 0.4, cursor: "not-allowed" }
                                                        : {}
                                                }
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-delete"
                                                onClick={() => handleDelete(s.id_subcategoria)}
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

                {/* FORM */}
                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">
                        <h3>{editId ? "Editar subcategoría" : "Crear subcategoría"}</h3>

                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                name="nombre"
                                placeholder="Nombre de la subcategoría"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
                                type="number"
                                name="id_categoria"
                                placeholder="ID Categoría"
                                value={form.id_categoria}
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
                                        setForm({ nombre: "", id_categoria: "" });
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

export default AdminSubcategorias;