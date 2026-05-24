import "./App.css";
import Shop from "./Components/Pages/Shop";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import Alimentacion from "./Components/Pages/Alimentacion";
import Decoracion from "./Components/Pages/Decoracion";
import Merchandising from "./Components/Pages/Merchandising";
import Moda from "./Components/Pages/Moda";
import Inciensos from "./Components/Pages/Inciensos";
import { CartProvider } from "./Components/Context/CartContext.jsx";
import CartDrawer from "./Components/Cart/CartDrawer";
import Auth from "./Components/Pages/Auth.jsx";
import Admin from "./Components/Pages/Admin";
import AdminUsuarios from "./Components/Pages/admin/adminUsuarios.jsx";
import { AuthProvider } from "./Components/Additionals/AuthContext";
import AdminProductos from "./Components/Pages/admin/AdminProductos";
import AdminCategorias from "./Components/Pages/admin/AdminCategorias";
import AdminSubcategorias from "./Components/Pages/admin/AdminSubcategorias";
import AdminPedidos from "./Components/Pages/admin/adminPedidos.jsx";
import AdminDetallesPedidos from "./Components/Pages/admin/adminDetallePedidos.jsx";
import AdminCarrito from "./Components/Pages/admin/AdminCarrito";


import { useState } from "react";


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          <Nav onSearch={setSearchQuery} />
          <CartDrawer />

          <Routes>
            <Route path="/" element={<Shop searchQuery={searchQuery} />} />
            <Route path="/Alimentacion" element={<Alimentacion />} />
            <Route path="/Decoracion" element={<Decoracion />} />
            <Route path="/Merchandising" element={<Merchandising />} />
            <Route path="/Moda" element={<Moda />} />
            <Route path="/Inciensos" element={<Inciensos />} />
            <Route path="/Auth" element={<Auth />} />

            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
            <Route path="/admin/categorias" element={<AdminCategorias />} />
            <Route path="/admin/subcategorias" element={<AdminSubcategorias />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/detalle-pedidos" element={<AdminDetallesPedidos />} />
            <Route path="/admin/carrito" element={<AdminCarrito />} />


          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;