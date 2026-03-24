import Shop from "./Shop";
import Secciones from "../Additionals/Secciones";
import TextToShow from "../Additionals/TextToShow";

function Alimentacion() {


    return (
        <>
            <TextToShow categoriaId={1} />

            <Secciones secciones={['Snack', 'Bebidas', 'Salado', 'Dulce']} />

            <Shop categoriaId={1} />
        </>
    );
}

export default Alimentacion;