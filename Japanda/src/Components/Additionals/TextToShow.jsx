import "../../Styles/shop.css";
import Alimentacion from "../Pages/Alimentacion";

function TextToShow(categoriaId) {
    // let defaultText = "Tienda Online de Productos Japoneses";
    let text = ChangeText(categoriaId);

    return (
        <>
            <h2 className="shop-title">
                {text}
                <hr />
            </h2>
        </>
    );
}

function ChangeText(categoriaId) {
    switch (categoriaId) {
        case 1:
            return 'Alimentación'
        case 2:
            return 'Decoración'
        case 3:
            return 'Merchandising'
        case 4:
            return 'Moda'
        case 5:
            return 'Inciensos'
        default:
            return 'Tienda Online de Productos Japoneses'
    }
}



export default TextToShow;