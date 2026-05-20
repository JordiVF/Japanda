import { useEffect, useState } from "react";
import '../../Styles/shop.css';
import ProductCard from "../Pages/ProductCard";
import TextToShow from "../Additionals/TextToShow";

function Shop({ categoriaId }) {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        const fetchProducts = async () => {
            try {

                let url = "http://localhost:3000/api/productos";

                if (categoriaId) {
                    url += `?id_categoria=${categoriaId}`;
                }
                console.log(categoriaId, 'categoriaId')
                 
                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error || "Error cargando productos");
                }

                setProducts(data);

            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();

    }, [categoriaId]);

    return (
        <section className="shop">

            {categoriaId !== 1 && <TextToShow categoriaId={categoriaId} />}

            <div className="product-grid">
                {products.map(producto => (
                    <ProductCard
                        key={producto.id_producto}
                        product={producto}
                    />
                ))}
            </div>

        </section>
    );
}

export default Shop;