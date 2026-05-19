import Nav from "./Components/Nav/Nav";
import CartDrawer from "./Components/Cart/CartDrawer";
import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <>
            <Nav />
            <CartDrawer />
            <Outlet />
        </>
    );
}

export default MainLayout;