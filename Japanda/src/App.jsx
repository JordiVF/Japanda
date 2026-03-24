import "./App.css";
import Shop from "./Components/Pages/Shop";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Nav from "./Components/Nav/Nav";
import Alimentacion from "./Components/Pages/Alimentacion";
import Decoracion from "./Components/Pages/Decoracion";


function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/Alimentacion" element={<Alimentacion />} />
        <Route path="/Decoracion" element={<Decoracion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
