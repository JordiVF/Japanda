import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

function AdminUsuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [busquedaId, setBusquedaId] = useState("");
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "cliente",
        telefono: "",
        direccion: "",
        ciudad: "",
        cp: "",
        pais: "",
        random_image: "",
    });
    const [editId, setEditId] = useState(null);
    const API = "http://localhost:3000/api/usuarios";

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get(API);
            setUsuarios(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsuarios();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/${id}`);
            fetchUsuarios();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchUsuarios();
        try {
            const res = await axios.get(`${API}/${busquedaId}`);
            setUsuarios([res.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (!editId) {
                if (!form.password || form.password.length < 8) {
                    alert("La contraseña debe tener al menos 8 caracteres");
                    return;
                }

                if (!form.nombre || !form.email) {
                    alert("Nombre y email son obligatorios");
                    return;
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (form.email && !emailRegex.test(form.email)) {
                alert("Email inválido");
                return;
            }

            if (!editId) {
                const res = await axios.post(API, {
                    nombre: form.nombre,
                    email: form.email,
                    password: form.password,
                    rol: form.rol,
                    telefono: form.telefono || null,
                    direccion: form.direccion || null,
                    ciudad: form.ciudad || null,
                    cp: form.cp || null,
                    pais: form.pais || null,
                    random_image: form.random_image || null,
                });

                console.log("Usuario creado:", res.data);
            }

            else {
                const { password: _password, ...updateData } = form;

                const res = await axios.put(`${API}/${editId}`, {
                    ...updateData,
                });

                console.log("Usuario actualizado:", res.data);
            }

            setForm({
                nombre: "",
                email: "",
                password: "",
                rol: "cliente",
                telefono: "",
                direccion: "",
                ciudad: "",
                cp: "",
                pais: "",
                random_image: "",
            });

            setEditId(null);

            fetchUsuarios();

        } catch (err) {
            console.error("ERROR COMPLETO:", err.response?.data || err.message);
            alert(err.response?.data?.error || "Error en la operación");
        }
    };
    const handleEdit = (usuario) => {
        setEditId(usuario.id_usuario);
        setForm({
            nombre: usuario.nombre,
            email: usuario.email,
            password: "",
            rol: usuario.rol,
            telefono: usuario.telefono || "",
            direccion: usuario.direccion || "",
            ciudad: usuario.ciudad || "",
            cp: usuario.cp || "",
            pais: usuario.pais || "",
            random_image: usuario.random_image || "",
        });
    };

    return (
        <div className="admin-vista">
            <div className="admin-vista-wrapper">
                <div className="admin-header">
                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Volver
                    </button>

                    <h1 style={{margin:'20px 0'}}>Usuarios</h1>
                </div>



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
                    <button className="admin-btn admin-btn-secondary" onClick={fetchUsuarios}>
                        Reset
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.id_usuario}>
                                    <td>{u.id_usuario}</td>
                                    <td>{u.nombre}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`admin-rol-badge ${u.rol}`}>{u.rol}</span>
                                    </td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="admin-btn admin-btn-edit"
                                                onClick={() => handleEdit(u)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-delete"
                                                onClick={() => handleDelete(u.id_usuario)}
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

                <div className="admin-section" style={{ marginTop: "1.5rem" }}>
                    <div className="admin-form">
                        <h3>{editId ? "Editar usuario" : "Crear usuario"}</h3>
                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                name="nombre"
                                placeholder="Nombre"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {!editId && (
                                <input
                                    className="admin-input"
                                    name="password"
                                    placeholder="Contraseña"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            )}
                            <select
                                className="admin-select"
                                name="rol"
                                value={form.rol}
                                onChange={handleChange}
                            >
                                <option value="cliente">Cliente</option>
                                <option value="admin">Admin</option>
                            </select>
                            <input
                                className="admin-input"
                                name="telefono"
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                name="direccion"
                                placeholder="Dirección"
                                value={form.direccion}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                name="ciudad"
                                placeholder="Ciudad"
                                value={form.ciudad}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                name="cp"
                                placeholder="Código Postal"
                                value={form.cp}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                name="pais"
                                placeholder="País"
                                value={form.pais}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                name="random_image"
                                placeholder="Imagen (URL)"
                                value={form.random_image}
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
                                        setForm({ nombre: "", email: "", password: "", rol: "cliente" });
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

export default AdminUsuarios;