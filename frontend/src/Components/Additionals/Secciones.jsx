import "../../Styles/secciones.css";

function Secciones({ secciones }) {
    return (
        <>
            <div className="seccionesContainer">
                {secciones.map((seccion, index) => (
                    <a href="#" className="seccion" key={index}>
                        {seccion}
                    </a>
                ))}
            </div>

        </>
    );
}

export default Secciones;