import { useEffect } from "react";
import { useCart } from "../Context/useCart";
import "../../Styles/productDetail.css";

function ProductDetail({ product, onClose }) {
    const { addToCart } = useCart();

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    if (!product) return null;

    const handleAddToCart = () => {
        addToCart(product);
        onClose();
    };

    return (
        <>
            <div className="pd-overlay" onClick={onClose} />

            <div className="pd-sheet">
                <div className="pd-handle" />
                <button className="pd-close" onClick={onClose}>✕</button>

                <div className="pd-content">

                    {/* esto hay que modificarlo un poco no me gusta mucho como ha quedado */}
                    <div className="pd-image-wrap">
                        <div className="pd-image-frame">
                            <img
                                src={product.imagen_url}
                                alt={product.nombre}
                                className="pd-image"
                            />
                        </div>
                        {product.nuevo_booleano && (
                            <div className="pd-nuevo-tag">
                                <span className="pd-nuevo-star">★</span>
                                Nuevo
                                <span className="pd-nuevo-star">★</span>
                            </div>
                        )}
                    </div>

                    <div className="pd-info">
                        <div className="pd-info-top">

                            <div className="pd-title-row">
                                <h2 className="pd-name">{product.nombre}</h2>
                                {product.nuevo_booleano && (
                                    <span className="pd-badge-inline">✦ Nuevo</span>
                                )}
                            </div>

                            <div className="pd-price-row">
                                <span className="pd-price">{product.precio.toFixed(2)} €</span>
                                <div className="pd-stock">
                                    <span className={`pd-stock-dot ${product.stock > 0 ? "pd-stock-dot--in" : "pd-stock-dot--out"}`} />
                                    <span>{product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}</span>
                                </div>
                            </div>

                            <div className="pd-divider" />

                            <p className="pd-description">
                                {product.descripcion || "Sin descripción disponible."}
                            </p>
                        </div>

                        <div className="pd-info-bottom">
                            <button
                                className="pd-add-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? "Sin stock" : "🛒 Añadir al carrito"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductDetail;