import "./App.css";
import Shop from "./Components/Pages/Shop";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import Alimentacion from "./Components/Pages/Alimentacion";
import Decoracion from "./Components/Pages/Decoracion";
import Merchandising from "./Components/Pages/Merchandising";
import Moda from "./Components/Pages/Moda";
import Inciensos from "./Components/Pages/Inciensos";
import { CartProvider } from "./Components/Context/CartProvider.jsx";
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
import AdminDetalleCarritos from "./Components/Pages/admin/adminDetalleCarritos.jsx";
import AdminEnvios from "./Components/Pages/admin/AdminEnvios";
import Perfil from "./Components/Pages/Perfil.jsx";
import Contacto from "./Components/Pages/AtencionCliente";
import MisPedidos from "./Components/Pages/MisPedidos.jsx";
import AdminRoute from "./Components/Guards/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          <Nav />

          <CartDrawer />

          <Routes>

            <Route path="/" element={<Shop />} />
            <Route path="/Alimentacion" element={<Alimentacion />} />
            <Route path="/Decoracion" element={<Decoracion />} />
            <Route path="/Merchandising" element={<Merchandising />} />
            <Route path="/Moda" element={<Moda />} />
            <Route path="/Inciensos" element={<Inciensos />} />

            <Route path="/Auth" element={<Auth />} />
            <Route path="/Perfil" element={<Perfil />} />
            <Route path="/Soporte" element={<Contacto />} />
            <Route path="/pedidos" element={<MisPedidos />} />

            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
            <Route path="/admin/productos" element={<AdminRoute><AdminProductos /></AdminRoute>} />
            <Route path="/admin/categorias" element={<AdminRoute><AdminCategorias /></AdminRoute>} />
            <Route path="/admin/subcategorias" element={<AdminRoute><AdminSubcategorias /></AdminRoute>} />
            <Route path="/admin/pedidos" element={<AdminRoute><AdminPedidos /></AdminRoute>} />
            <Route path="/admin/detalle-pedidos" element={<AdminRoute><AdminDetallesPedidos /></AdminRoute>} />
            <Route path="/admin/carrito" element={<AdminRoute><AdminCarrito /></AdminRoute>} />
            <Route path="/admin/detalle-carritos" element={<AdminRoute><AdminDetalleCarritos /></AdminRoute>} />
            <Route path="/admin/envios" element={<AdminRoute><AdminEnvios /></AdminRoute>} />

          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;