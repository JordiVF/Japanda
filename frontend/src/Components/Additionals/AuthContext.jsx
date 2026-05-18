import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("usuario");
        return stored ? JSON.parse(stored) : null;
    });

    const login = (data) => {
        setUser(data);
        localStorage.setItem("usuario", JSON.stringify(data));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("usuario");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);