import "../../Styles/shop.css";

function TextToShow({ categoriaId }) {
    let text = ChangeText(categoriaId);

    return (
        <>
            <h2 className="shop-title">
                {text}
                <hr className="hrTienda"/>
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