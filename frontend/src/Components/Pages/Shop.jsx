import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../Pages/ProductCard";
import TextToShow from "../Additionals/TextToShow";

function Shop({ categoriaId }) {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    useEffect(() => {

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();

                if (categoriaId) params.append("id_categoria", categoriaId);
                if (searchQuery) params.append("nombre", searchQuery);

                const url = `http://localhost:3000/api/productos${params.toString() ? "?" + params.toString() : ""}`;

                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) throw new Error(data?.error);

                setProducts(data);

            } catch (err) {
                setError("Error cargando productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, [categoriaId, searchQuery]);

    return (
        <section className="shop">

            {searchQuery && (
                <p>Resultados para: <b>{searchQuery}</b></p>
            )}

            {loading && <p>Cargando...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && products.length === 0 && (
                <p>No hay productos</p>
            )}

            <div className="product-grid">
                {products.map(p => (
                    <ProductCard key={p.id_producto} product={p} />
                ))}
            </div>

        </section>
    );
}

export default Shop;