/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../../Styles/adminVista.css";

const API_DETALLES  = "http://localhost:3000/api/detallespedidos";
const API_PRODUCTOS = "http://localhost:3000/api/productos";

function AdminDetallesPedidos() {
    const navigate      = useNavigate();
    const formRef       = useRef(null);
    const [searchParams] = useSearchParams();

    const [detalles,  setDetalles]  = useState([]);
    const [productos, setProductos] = useState([]);
    const [busquedaId, setBusquedaId] = useState("");
    const [editId,     setEditId]     = useState(null);

    const [form, setForm] = useState({
        id_pedido:       "",
        id_producto:     "",
        cantidad:        "",
        precio_unitario: ""
    });

    const fetchData = async () => {
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
        fetchProductos();
        const pedidoParam = searchParams.get("pedido");
        if (pedidoParam) {
            setBusquedaId(pedidoParam);
            axios.get(`${API_DETALLES}/pedido/${pedidoParam}`)
                .then(res => setDetalles(Array.isArray(res.data) ? res.data : [res.data]))
                .catch(err => console.error(err));
        } else {
            fetchData();
        }
    }, []);

    const handleDelete = async (id_detalle) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el detalle #${id_detalle}?`)) return;
        try {
            await axios.delete(`${API_DETALLES}/${id_detalle}`);
            if (editId === id_detalle) {
                setEditId(null);
                setForm({ id_pedido: "", id_producto: "", cantidad: "", precio_unitario: "" });
            }
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Error al eliminar el detalle");
        }
    };

    const handleSearch = async () => {
        if (!busquedaId) return fetchData();
        try {
            const res = await axios.get(`${API_DETALLES}/pedido/${busquedaId}`);
            setDetalles(Array.isArray(res.data) ? res.data : [res.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "id_producto") {
            const producto = productos.find(p => String(p.id_producto) === String(value));
            setForm(prev => ({
                ...prev,
                id_producto:     value,
                precio_unitario: producto ? producto.precio : "",
            }));
            return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (d) => {
        setEditId(d.id_detalle);
        setForm({
            id_pedido:       d.id_pedido,
            id_producto:     d.id_producto,
            cantidad:        d.cantidad,
            precio_unitario: d.precio_unitario
        });
        setTimeout(() =>
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50
        );
    };

    const handleSubmit = async () => {
        if (!form.id_pedido || !form.id_producto || !form.cantidad || !form.precio_unitario) {
            alert("Todos los campos son obligatorios");
            return;
        }

        const payload = {
            id_pedido:       Number(form.id_pedido),
            id_producto:     Number(form.id_producto),
            cantidad:        Number(form.cantidad),
            precio_unitario: Number(form.precio_unitario)
        };

        try {
            if (editId) {
                await axios.put(`${API_DETALLES}/${editId}`, payload);
            } else {
                await axios.post(API_DETALLES, payload);
            }

            setForm({ id_pedido: "", id_producto: "", cantidad: "", precio_unitario: "" });
            setEditId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Error en la operación");
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

                <h1 style={{ margin: "20px 0" }}>Detalles de pedidos</h1>

                {/* BUSCADOR */}
                <div className="admin-section admin-buscador">
                    <input
                        className="admin-input"
                        placeholder="Buscar por ID pedido"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={() => { setBusquedaId(""); fetchData(); }}>
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
                                <th>Producto</th>
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
                                    <tr
                                        key={d.id_detalle}
                                        style={
                                            editId === d.id_detalle
                                                ? { backgroundColor: "#cfe3f5", transition: "background 0.3s" }
                                                : {}
                                        }
                                    >
                                        <td>{d.id_detalle}</td>
                                        <td>{d.id_pedido}</td>
                                        <td>
                                            {productos.find(p => p.id_producto === d.id_producto)?.nombre || d.id_producto}
                                        </td>
                                        <td>{d.cantidad}</td>
                                        <td>{Number(d.precio_unitario).toFixed(2)} €</td>
                                        <td>{(d.cantidad * d.precio_unitario).toFixed(2)} €</td>
                                        <td>
                                            <div className="acciones">
                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => handleEdit(d)}
                                                    style={
                                                        editId === d.id_detalle
                                                            ? { opacity: 0.4, cursor: "not-allowed" }
                                                            : {}
                                                    }
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
                <div className="admin-section" style={{ marginTop: "1.5rem" }} ref={formRef}>
                    <div className="admin-form">
                        <h3>{editId ? "Editar detalle" : "Crear detalle"}</h3>

                        <div className="admin-form-grid">
                            <input
                                className="admin-input"
                                name="id_pedido"
                                placeholder="ID Pedido"
                                value={form.id_pedido}
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
                                <option value="">-- Selecciona producto --</option>
                                {productos.map(p => (
                                    <option key={p.id_producto} value={p.id_producto}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="admin-input"
                                name="cantidad"
                                placeholder="Cantidad"
                                type="number"
                                min={1}
                                value={form.cantidad}
                                onChange={handleChange}
                            />
                            <input
                                className="admin-input"
                                name="precio_unitario"
                                placeholder="Precio unitario"
                                type="number"
                                step="0.01"
                                min={0}
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
                                        setForm({ id_pedido: "", id_producto: "", cantidad: "", precio_unitario: "" });
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