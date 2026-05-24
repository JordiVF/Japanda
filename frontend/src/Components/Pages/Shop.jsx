import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../Pages/ProductCard";

function Shop({ categoriaId, subcategoriaIds }) {

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

                if (categoriaId) {
                    params.append("id_categoria", categoriaId);
                }

                if (searchQuery) {
                    params.append("nombre", searchQuery);
                }

                if (subcategoriaIds?.length) {
                    params.append(
                        "subcategoriaIds",
                        subcategoriaIds.join(",")
                    );
                }

                const url = `http://localhost:3000/api/productos?${params.toString()}`;
                console.log("URL:", url);

                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) throw new Error(data?.error || "Error");

                setProducts(data);

            } catch (err) {
                setError("Error cargando productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, [categoriaId, searchQuery, subcategoriaIds]);

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