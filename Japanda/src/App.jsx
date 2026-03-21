import "./App.css";
import Shop from "./Components/Pages/Shop";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Nav from "./Components/Nav/Nav";
import Alimentacion from "./Components/Pages/Alimentacion";


function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/Alimentacion" element={<Alimentacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
