import { useEffect, useState } from "react";
import '../../Styles/shop.css'
import ProductCard from "../Pages/ProductCard";
import { supabase } from "../../supabaseClient";

function Shop() {
    const [products, setProducts] = useState([]);
    console.log(products);
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from("productos")
                .select("*");

            if (error) {
                console.error(error);
            } else {
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section className="shop">
            <h2 className="shop-title">
                Tienda Online de Productos Japoneses
            </h2>

            <div className="product-grid">
                {products.map(producto => (
                    <ProductCard key={producto.id_producto} product={producto} />
                ))}
            </div>
        </section>
    );
}

export default Shop;