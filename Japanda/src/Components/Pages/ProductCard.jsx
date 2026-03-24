import "../../Styles/ProductCard.css";

function ProductCard({ product }) {
    return (
        <article className="product-card">
            <img
                src={product.imagen_url}
                alt={product.nombre}
                className="product-image"
            />

            <div className="product-info">
                <h3 className="product-name">{product.nombre}</h3>
                <div>
                    <hr />
                    <p className="product-price">{product.precio.toFixed(2)} €</p>
                </div>
            </div>

            <div className="product-controllers">

                <button className="product-button">
                    Añadir al carrito
                </button>


            </div>

        </article>
    );
}

export default ProductCard;