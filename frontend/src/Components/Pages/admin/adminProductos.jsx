/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

function AdminProductos() {
    const [productos, setProductos] = useState([]);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const [busquedaId, setBusquedaId] = useState("");
    

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        imagen_url: "",
        activo: true,
        id_categoria: "",
        id_subcategoria: "",
        nuevo_booleano: false,
    });

    const [editId, setEditId] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);

    const API = "http://localhost:3000/api/productos";
    const API_CATEGORIAS = "http://localhost:3000/api/categorias";
    const API_SUBCATEGORIAS = "http://localhost:3000/api/subcategorias";
    const fetchProductos = async () => {
        try {
            const res = await axios.get(API);
            setProductos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategorias = async () => {
        try {
            const res = await axios.get(API_CATEGORIAS);
            setCategorias(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubcategoriasByCategoria = async (id_categoria) => {
        if (!id_categoria) {
            setSubcategorias([]);
            return;
        }
        try {
            const res = await axios.get(`${API_SUBCATEGORIAS}/categoria/${id_categoria}`);
            setSubcategorias(res.data);
        } catch (err) {
            console.error(err);
            setSubcategorias([]);
        }
    };

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    const handleDelete = async (id) => {
    const confirmado = window.confirm(`¿Seguro que quieres eliminar el producto #${id}? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
        await axios.delete(`${API}/${id}`);
        if (editId === id) {
            setEditId(null);
            setForm({
                nombre: "", descripcion: "", precio: "", stock: "",
                imagen_url: "", activo: true, id_categoria: "",
                id_subcategoria: "", nuevo_booleano: false,
            });
        }
        fetchProductos();
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Error al eliminar el producto");
    }
};
    const handleSearch = async () => {
        if (!busquedaId) return fetchProductos();

        try {
            const res = await axios.get(`${API}/${busquedaId}`);
            setProductos([res.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        const newValue = type === "checkbox" ? checked : value;

        setForm({
            ...form,
            [name]: newValue,
            ...(name === "id_categoria" ? { id_subcategoria: "" } : {}),
        });

        if (name === "id_categoria") {
            fetchSubcategoriasByCategoria(value);
        }
    };
    const handleSubmit = async () => {
        try {
            if (!form.nombre || !form.precio) {
                alert("Nombre y precio son obligatorios");
                return;
            }

            if (Number(form.precio) < 0) {
                alert("El precio no puede ser negativo");
                return;
            }

            if (editId) {
                await axios.put(`${API}/${editId}`, {
                    ...form,
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    id_categoria: form.id_categoria !== "" ? Number(form.id_categoria) : null,
                    id_subcategoria: Number(form.id_subcategoria),
                });

                console.log("Producto actualizado");
            } else {
                await axios.post(API, {
                    ...form,
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    id_categoria: form.id_categoria !== "" ? Number(form.id_categoria) : null,
                    id_subcategoria: Number(form.id_subcategoria),
                });

                console.log("Producto creado");
            }

            setForm({
                nombre: "",
                descripcion: "",
                precio: "",
                stock: "",
                imagen_url: "",
                activo: true,
                id_categoria: "",
                id_subcategoria: "",
                nuevo_booleano: false,
            });

            setEditId(null);

            fetchProductos();

        } catch (err) {
            console.error(err.response?.data || err.message);
            alert(err.response?.data?.error || "Error");
        }
    };

    // EDIT
    const handleEdit = (producto) => {
        setEditId(producto.id_producto);

        setForm({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio || "",
            stock: producto.stock || "",
            imagen_url: producto.imagen_url || "",
            activo: producto.activo || false,
            id_categoria: producto.id_categoria || "",
            id_subcategoria: producto.id_subcategoria || "",
            nuevo_booleano: producto.nuevo_booleano || false,
        });

        // Cargar subcategorías de la categoría del producto
        if (producto.id_categoria) {
            fetchSubcategoriasByCategoria(producto.id_categoria);
        } else {
            setSubcategorias([]);
        }

        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
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

                </div>
                <h1 style={{ margin: '20px 0' }}>Productos</h1>


                {/* BUSCADOR */}
                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                    />

                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleSearch}
                    >
                        Buscar
                    </button>

                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={fetchProductos}
                    >
                        Reset
                    </button>
                </div>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Activo</th>
                                <th>Nuevo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {productos.slice(0, visibleCount).map((p) => (
                                <tr key={p.id_producto} style={
                                    editId === p.id_producto
                                        ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                        : {}
                                }>


                                    <td>{p.id_producto}</td>

                                    <td>
                                        {p.imagen_url ? (
                                            <img
                                                src={p.imagen_url}
                                                alt={p.nombre}
                                                style={{
                                                    width: "45px",
                                                    height: "45px",
                                                    borderRadius: "6px",
                                                    objectFit: "cover",
                                                    border: "1px solid #ddd",
                                                }}
                                                onError={(e) => {
                                                    e.target.src =
                                                        "https://placehold.co/45x45?text=No+img";
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "#999" }}>
                                                Sin imagen
                                            </span>
                                        )}
                                    </td>

                                    <td>{p.nombre}</td>

                                    <td>{p.precio}€</td>
                                    <td>{p.stock}</td>
                                    <td>{p.activo ? "Sí" : "No"}</td>
                                    <td>{p.nuevo_booleano ? "Sí" : "No"}</td>

                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="admin-btn admin-btn-edit"
                                                onClick={() => handleEdit(p)}
                                                style={editId === p.id_producto
                                                    ? { opacity: 0.4, cursor: "not-allowed" }
                                                    : {}
                                                }
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="admin-btn admin-btn-delete"
                                                onClick={() => handleDelete(p.id_producto)}
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visibleCount < productos.length && (
                        <div className="btn-wrapper-addprods">
                            <button
                                className="admin-btn-prods"
                                onClick={() => setVisibleCount(prev => prev + 10)}
                            >
                                Cargar 10 más
                            </button>
                        </div>
                    )}
                </div>

                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">

                        <h3>
                            {editId ? "Editar producto" : "Crear producto"}
                        </h3>

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
                                name="descripcion"
                                placeholder="Descripción"
                                value={form.descripcion}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                type="number"
                                name="precio"
                                placeholder="Precio"
                                value={form.precio}
                                onChange={handleChange}
                            />

                            <input
                                className="admin-input"
                                type="number"
                                name="stock"
                                placeholder="Stock"
                                value={form.stock}
                                onChange={handleChange}
                            />

                            <div className="admin-image-field">

                                <div className="admin-image-preview">
                                    {form.imagen_url ? (
                                        <img
                                            src={form.imagen_url}
                                            alt="Preview"
                                            className="admin-preview-img"
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://placehold.co/100x100?text=Sin+imagen";
                                            }}
                                        />
                                    ) : (
                                        <div className="admin-no-image">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                            </div>

                            <select
                                className="admin-input-cat"
                                name="id_categoria"
                                value={form.id_categoria}
                                onChange={handleChange}
                            >
                                <option value="">-- Selecciona una categoría --</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="admin-input"
                                name="imagen_url"
                                placeholder="URL de la imagen"
                                value={form.imagen_url}
                                onChange={handleChange}

                            />

                            <select
                                className="admin-input"
                                name="id_subcategoria"
                                value={form.id_subcategoria}
                                onChange={handleChange}
                                disabled={!form.id_categoria}
                            >
                                <option value="">
                                    {form.id_categoria
                                        ? subcategorias.length > 0
                                            ? "-- Selecciona una subcategoría --"
                                            : "Sin subcategorías disponibles"
                                        : "-- Primero selecciona una categoría --"}
                                </option>
                                {subcategorias.map((sub) => (
                                    <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                                        {sub.nombre}
                                    </option>
                                ))}
                            </select>

                            <label>
                                Activo
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={form.activo}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Nuevo
                                <input
                                    type="checkbox"
                                    name="nuevo_booleano"
                                    checked={form.nuevo_booleano}
                                    onChange={handleChange}
                                />
                            </label>

                        </div>

                        <div className="admin-form-actions">

                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleSubmit}
                            >
                                {editId ? "Actualizar" : "Añadir"}
                            </button>

                            {editId && (
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => {
                                        setEditId(null);
                                        setSubcategorias([]);
                                        setForm({
                                            nombre: "",
                                            descripcion: "",
                                            precio: "",
                                            stock: "",
                                            imagen_url: "",
                                            activo: true,
                                            id_categoria: "",
                                            id_subcategoria: "",
                                            nuevo_booleano: false,
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

export default AdminProductos;