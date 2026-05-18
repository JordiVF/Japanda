import { useState } from "react";
import { useAuth } from "../Additionals/AuthContext";
import "../../Styles/auth.css";

const API = "http://localhost:3000";

function Auth() {
    const { login } = useAuth();
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [registerForm, setRegisterForm] = useState({
        nombre: "",
        email: "",
        password: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        cp: "",
        pais: "",
    });

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
        setError("");
    };

    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const res = await fetch(`${API}/api/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();
            console.log(res, '☀️☀️☀️☀️🕶️🕶️🕶️☀️☀️☀️☀️');
            console.log(JSON.stringify(data, null, 2));
            if (!res.ok) {
                throw new Error(data.error || "Error al iniciar sesión");
            }
            
            login(data.data);


            // Guardar usuario en localStorage
            localStorage.setItem("usuario", JSON.stringify(data.data));
            localStorage.setItem("usuarioEmail", data.data.email);

            setSuccess(`¡Bienvenido de vuelta, ${data.data.nombre}!`);

            // Limpiar formulario
            setLoginForm({ email: "", password: "" });

            // Redirigir después de 1.5 segundos (opcional)
            setTimeout(() => {
                // Aquí puedes redirigir a la página principal o dashboard
                window.location.href = "/"; // Ajusta la ruta según tu aplicación
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Validaciones básicas del lado del cliente
        if (registerForm.password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/api/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerForm),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al registrarse");
            }

            setSuccess("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");

            // Limpiar formulario
            setRegisterForm({
                nombre: "",
                email: "",
                password: "",
                telefono: "",
                direccion: "",
                ciudad: "",
                cp: "",
                pais: "",
            });

            // Cambiar a pestaña de login después de 2 segundos
            setTimeout(() => {
                setMode("login");
                setSuccess("");
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (newMode) => {
        setMode(newMode);
        setError("");
        setSuccess("");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">
                        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                    </h1>
                    <p className="auth-subtitle">
                        {mode === "login"
                            ? "Accede a tu cuenta de Japanda"
                            : "Únete a la comunidad Japanda"}
                    </p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => handleTabChange("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => handleTabChange("register")}
                    >
                        Registro
                    </button>
                </div>

                {error && <div className="auth-alert auth-alert--error">{error}</div>}
                {success && <div className="auth-alert auth-alert--success">{success}</div>}

                {mode === "login" ? (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                placeholder="tu@email.com"
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Contraseña</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres"
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <div className="auth-field">
                            <label className="auth-label">Nombre *</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre"
                                value={registerForm.nombre}
                                onChange={handleRegisterChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Email *</label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                placeholder="tu@email.com"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Contraseña *</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-divider">
                            <span>Datos opcionales</span>
                        </div>

                        <div className="auth-grid">
                            <div className="auth-field">
                                <label className="auth-label">Teléfono</label>
                                <input
                                    className="auth-input"
                                    type="tel"
                                    name="telefono"
                                    placeholder="+34 600 000 000"
                                    value={registerForm.telefono}
                                    onChange={handleRegisterChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Ciudad</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="ciudad"
                                    placeholder="Madrid"
                                    value={registerForm.ciudad}
                                    onChange={handleRegisterChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Dirección</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="direccion"
                                placeholder="Calle, número, piso..."
                                value={registerForm.direccion}
                                onChange={handleRegisterChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-grid">
                            <div className="auth-field">
                                <label className="auth-label">Código Postal</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="cp"
                                    placeholder="28001"
                                    value={registerForm.cp}
                                    onChange={handleRegisterChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">País</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="pais"
                                    placeholder="España"
                                    value={registerForm.pais}
                                    onChange={handleRegisterChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Auth;