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

                {product.nuevo_booleano && (
                    <div className="product-badge-new">
                        <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="starGrad" cx="40%" cy="35%" r="60%">
                                    <stop offset="0%" stopColor="#ffb347" />
                                    <stop offset="50%" stopColor="#e34f1d" />
                                    <stop offset="100%" stopColor="#8b2500" />
                                </radialGradient>
                                <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#00000055" />
                                </filter>
                            </defs>
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill="url(#starGrad)"
                                filter="url(#starShadow)"
                                stroke="#7a1e00"
                                strokeWidth="0.4"
                            />
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77"
                                fill="rgba(255,255,255,0.08)"
                            />
                        </svg>
                    </div>
                )}

                <img src={product.imagen_url} alt={product.nombre} className="product-image" />

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