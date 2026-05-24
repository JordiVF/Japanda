/* eslint-disable react-hooks/set-state-in-effect */
import "../../Styles/secciones.css";

function Secciones({ secciones, onSelect, activeSeccion }) {

    const handleClick = (e, seccion) => {
        e.preventDefault();

        if (activeSeccion === seccion) {
            onSelect?.(null);
        } else {
            onSelect?.(seccion);
        }
    };

    return (
        <div className="seccionesContainer">
            {secciones.map((seccion, index) => (
                <a
                    href="#"
                    className={`seccion ${activeSeccion === seccion ? "seccion--active" : ""}`}
                    key={index}
                    onClick={(e) => handleClick(e, seccion)}
                >
                    {seccion}
                </a>
            ))}
        </div>
    );
}

export default Secciones;