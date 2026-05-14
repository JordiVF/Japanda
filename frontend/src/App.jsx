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

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;