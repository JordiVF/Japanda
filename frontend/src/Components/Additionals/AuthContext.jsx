/* eslint-disable react-refresh/only-export-components */

// eslint-disable-next-line no-unused-vars
import titulo from '../../icons/titulo_web.png'
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext();

const INACTIVITY_LIMIT = 15 * 60 * 1000;

export function AuthProvider({ children }) {

    const [user, setUserState] = useState(() => {
        const stored = sessionStorage.getItem("usuario");
        return stored ? JSON.parse(stored) : null;
    });

    const timerRef = useRef(null);

    const logout = useCallback(() => {
        setUserState(null);
        sessionStorage.removeItem("usuario");
        clearTimeout(timerRef.current);
    }, []);

    const setUser = useCallback((newUser) => {
        setUserState(newUser);

        if (newUser) {
            sessionStorage.setItem("usuario", JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem("usuario");
        }
    }, []);

    const resetTimer = useCallback(() => {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setUserState(null);
            sessionStorage.removeItem("usuario");
        }, INACTIVITY_LIMIT);
    }, []);

    const login = (data) => {
        setUser(data);
    };

    useEffect(() => {
        if (!user) return;

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        events.forEach(ev => window.addEventListener(ev, resetTimer));

        resetTimer();

        return () => {
            events.forEach(ev => window.removeEventListener(ev, resetTimer));
            clearTimeout(timerRef.current);
        };
    }, [user, resetTimer]);

    useEffect(() => {
        const syncUser = (e) => {
            if (e.key === "usuario") {
                setUserState(e.newValue ? JSON.parse(e.newValue) : null);
            }
        };

        window.addEventListener("storage", syncUser);

        return () => window.removeEventListener("storage", syncUser);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);