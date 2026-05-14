import "../../Styles/productCard.css";
import { useCart } from "../Context/useCart";
import { useState } from "react";
import ProductDetail from "./ProductDetail";

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [showDetail, setShowDetail] = useState(false);
 
    return (
        <>
            <article className="product-card" onClick={() => setShowDetail(true)}>
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
                    <button
                        className="product-button"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            addToCart(product);
                        }}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </article>
 
            {showDetail && (
                <ProductDetail
                    product={product}
                    onClose={() => setShowDetail(false)}
                />
            )}
        </>
    );
}

export default ProductCard;