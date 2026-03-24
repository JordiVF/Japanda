import { useEffect, useState } from "react";
import '../../Styles/shop.css';
import ProductCard from "../Pages/ProductCard";
import { supabase } from "../../supabaseClient";
import TextToShow from "../Additionals/TextToShow";

function Shop({ categoriaId }) {

    const [products, setProducts] = useState([]);
    useEffect(() => {
        const fetchProducts = async () => {
            let query = supabase.from("productos").select("*");

            if (categoriaId) {
                query = query.eq("id_categoria", categoriaId);
            }

            const { data, error } = await query;

            if (error) {
                console.error(error);
            } else {
                setProducts(data);
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