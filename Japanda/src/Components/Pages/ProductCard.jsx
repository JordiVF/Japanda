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
            <button className="product-button">
                Añadir al carrito
            </button>
        </article>
    );
}

export default ProductCard;