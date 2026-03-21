import Nav from "../Nav/Nav";
import Shop from "./Shop";
import Secciones from "../Additionals/Secciones";

function Alimentacion() {

            <Nav />
    return (
        <>
            <Secciones secciones = {['Snack', 'Bebidas', 'Salado', 'Dulce']} />
            <Shop categoriaId={1} />
        </>
    );
}

export default Alimentacion;