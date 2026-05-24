/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Shop from "./Shop";
import Secciones from "../Additionals/Secciones";
import TextToShow from "../Additionals/TextToShow";

const SECCIONES_MAP = {
    Snack:   [2, 4, 17, 18, 19, 20, 21],
    Dulce:   [4, 19, 18, 20],
    Salado:  [2, 8, 7, 17, 21, 10],
    Bebidas: [5, 6],
    Ramen:   [7, 9],
};

function Alimentacion() {
    const [searchParams] = useSearchParams();
    const [subcategoriaIds, setSubcategoriaIds]   = useState(null);
    const [seccionActiva,   setSeccionActiva]      = useState(null);

    // Si viene ?seccion=Snack desde el nav, activar automáticamente
    useEffect(() => {
        const seccion = searchParams.get("seccion");
        if (seccion && SECCIONES_MAP[seccion]) {
            setSeccionActiva(seccion);
            setSubcategoriaIds(SECCIONES_MAP[seccion]);
        }
    }, [searchParams]);

    const handleSeccion = (seccion) => {
        if (!seccion) {
            setSeccionActiva(null);
            setSubcategoriaIds(null);
            return;
        }
        setSeccionActiva(seccion);
        setSubcategoriaIds(SECCIONES_MAP[seccion] || null);
    };

    return (
        <>
            <TextToShow categoriaId={1} />
            <Secciones
                secciones={Object.keys(SECCIONES_MAP)}
                activeSeccion={seccionActiva}
                onSelect={handleSeccion}
            />
            <Shop categoriaId={1} subcategoriaIds={subcategoriaIds} />
        </>
    );
}

export default Alimentacion;