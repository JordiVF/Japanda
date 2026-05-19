import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/admin.css";

function Admin() {
    const navigate = useNavigate();

    const sections = [
        { name: "Productos", path: "/admin/productos" },
        { name: "Categorías", path: "/admin/categorias" },
        { name: "Subcategorías", path: "/admin/subcategorias" },
        { name: "Usuarios", path: "/admin/usuarios" },
        { name: "Detalle de pedidos", path: "/admin/detalle-pedidos" },
        { name: "Pagos", path: "/admin/pagos" },
        { name: "Envíos", path: "/admin/envios" },
        { name: "Carrito", path: "/admin/carrito" },
    ];

    return (
        <div className="admin-container">
            <h1 className="admin-title">Panel de Administración</h1>

            <div className="admin-grid">
                {sections.map((section, index) => (
                    <button
                        key={index}
                        className="admin-card"
                        onClick={() => navigate(section.path)}
                    >
                        {section.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Admin;