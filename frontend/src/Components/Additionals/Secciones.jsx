/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import "../../Styles/secciones.css";

function Secciones({ secciones, onSelect, activeSeccion }) {
    const [active, setActive] = useState(null);

    useEffect(() => {
        if (activeSeccion !== undefined) setActive(activeSeccion);
    }, [activeSeccion]);

    const handleClick = (e, seccion) => {
        e.preventDefault();
        if (active === seccion) {
            setActive(null);
            onSelect?.(null);
        } else {
            setActive(seccion);
            onSelect?.(seccion);
        }
    };

    return (
        <div className="seccionesContainer">
            {secciones.map((seccion, index) => (
                <a
                    href="#"
                    className={`seccion ${active === seccion ? "seccion--active" : ""}`}
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