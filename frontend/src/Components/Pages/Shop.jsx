import { useEffect, useState } from "react";
import '../../Styles/shop.css';
import ProductCard from "../Pages/ProductCard";
import TextToShow from "../Additionals/TextToShow";

function Shop({ categoriaId, searchQuery, subcategoriaIds }) {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (categoriaId) params.append('id_categoria', categoriaId);
                if (searchQuery) params.append('nombre', searchQuery);
                if (subcategoriaIds?.length) {
                    subcategoriaIds.forEach(id => params.append('id_subcategoria', id));
                }

                const url = `http://localhost:3000/api/productos${params.toString() ? '?' + params.toString() : ''}`;

                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error || "Error cargando productos");
                }

                setProducts(data);

            } catch (error) {
                console.error("Error fetching products:", error);
                setError("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoriaId, searchQuery, subcategoriaIds]);

    return (
        <section className="shop">

            {!searchQuery && categoriaId !== 1 && <TextToShow categoriaId={categoriaId} />}

            {searchQuery && (
                <p className="search-results-label">
                    Resultados para: <strong>"{searchQuery}"</strong>
                </p>
            )}

            {loading && <p className="shop-status">Cargando productos...</p>}

            {!loading && error && <p className="shop-status shop-error">{error}</p>}

            {!loading && !error && products.length === 0 && (
                <p className="shop-status">No se encontraron productos.</p>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="product-grid">
                    {products.map(producto => (
                        <ProductCard
                            key={producto.id_producto}
                            product={producto}
                        />
                    ))}
                </div>
            )}

        </section>
    );
}

export default Shop;