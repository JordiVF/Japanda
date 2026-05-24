import { Navigate } from "react-router-dom";
import { useAuth } from "../Additionals/AuthContext";

function AdminRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace state={{ error: "Debes iniciar sesión para acceder a esta sección" }} />;
    }

    if (user.rol !== "admin") {
        return <Navigate to="/" replace state={{ error: "Solo usuarios con rol admin pueden ver esta sección" }} />;
    }

    return children;
}

export default AdminRoute;