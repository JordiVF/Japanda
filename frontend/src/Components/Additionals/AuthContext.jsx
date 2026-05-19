import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext();

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos en ms

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem("usuario");
        return stored ? JSON.parse(stored) : null;
    });

    const timerRef = useRef(null);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem("usuario");
        clearTimeout(timerRef.current);
    }, []);

    const resetTimer = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            logout();
        }, INACTIVITY_LIMIT);
    }, [logout]);

    const login = (data) => {
        setUser(data);
        sessionStorage.setItem("usuario", JSON.stringify(data));
        resetTimer();
    };

    // Escuchar eventos de actividad del usuario
    useEffect(() => {
        if (!user) return;

        const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        eventos.forEach(ev => window.addEventListener(ev, resetTimer));
        resetTimer(); // Arranca el timer al hacer login

        return () => {
            eventos.forEach(ev => window.removeEventListener(ev, resetTimer));
            clearTimeout(timerRef.current);
        };
    }, [user, resetTimer]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);