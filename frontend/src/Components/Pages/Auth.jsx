import { useState } from "react";
import { useAuth } from "../Additionals/AuthContext";
import "../../Styles/auth.css";
import titulo from '../../icons/titulo_web.png';

const API = "http://localhost:3000";

const VALIDATORS = {
    nombre: (v) => {
        if (!v.trim()) return "El nombre es obligatorio";
        if (v.trim().length < 2) return "Mínimo 2 caracteres";
        if (v.trim().length > 60) return "Máximo 60 caracteres";
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(v.trim()))
            return "Solo letras, espacios, guiones y apóstrofes";
        return "";
    },
    email: (v) => {
        if (!v.trim()) return "El email es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
            return "Formato de email inválido";
        return "";
    },
    password: (v) => {
        if (!v) return "La contraseña es obligatoria";
        if (v.length < 8) return "Mínimo 8 caracteres";
        if (v.length > 72) return "Máximo 72 caracteres";
        if (!/[A-Z]/.test(v)) return "Debe incluir al menos una mayúscula";
        if (!/[0-9]/.test(v)) return "Debe incluir al menos un número";
        return "";
    },
    confirmPassword: (v, form) => {
        if (!v) return "Confirma tu contraseña";
        if (v !== form.password) return "Las contraseñas no coinciden";
        return "";
    },
    telefono: (v) => {
        if (!v) return ""; 
        const digits = v.replace(/[\s\-().+]/g, "");
        if (!/^\d+$/.test(digits)) return "Solo números, espacios y +/-().";
        if (digits.length < 7 || digits.length > 15)
            return "Entre 7 y 15 dígitos";
        return "";
    },
    ciudad: (v) => {
        if (!v) return ""; 
        if (v.trim().length < 2) return "Mínimo 2 caracteres";
        if (v.trim().length > 50) return "Máximo 50 caracteres";
        return "";
    },
    direccion: (v) => {
        if (!v) return "";
        if (v.trim().length < 5) return "Mínimo 5 caracteres";
        if (v.trim().length > 120) return "Máximo 120 caracteres";
        return "";
    },
    cp: (v) => {
        if (!v) return ""; 
        if (!/^\d{4,10}$/.test(v.trim())) return "Entre 4 y 10 dígitos";
        return "";
    },
    pais: (v) => {
        if (!v) return ""; 
        if (v.trim().length < 2) return "Mínimo 2 caracteres";
        if (v.trim().length > 56) return "Máximo 56 caracteres";
        return "";
    },
};

function passwordStrength(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
}

const STRENGTH_LABEL = ["", "Débil", "Regular", "Buena", "Fuerte"];
const STRENGTH_COLOR = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

function Auth({ onClose }) {
    const { login } = useAuth();
    const [mode, setMode] = useState("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loginForm, setLoginForm] = useState({ email: "", password: "" });

    const emptyRegister = {
        nombre: "", email: "", password: "", confirmPassword: "",
        telefono: "", direccion: "", ciudad: "", cp: "", pais: "",
    };
    const [registerForm, setRegisterForm] = useState(emptyRegister);
    const [touched, setTouched] = useState({});

    const getError = (field) => {
        if (!touched[field]) return "";
        const fn = VALIDATORS[field];
        return fn ? fn(registerForm[field], registerForm) : "";
    };

    const allRegisterErrors = () =>
        Object.keys(VALIDATORS).reduce((acc, k) => {
            const fn = VALIDATORS[k];
            acc[k] = fn ? fn(registerForm[k], registerForm) : "";
            return acc;
        }, {});

    const isRegisterValid = () =>
        Object.values(allRegisterErrors()).every((e) => e === "");

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
        setError("");
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        setError("");
    };

    const handleBlur = (e) => {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
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
            if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

            const user = data.data;

            const carritoRes = await fetch(
                `${API}/api/carrito/usuario/${user.id_usuario}`
            );

            let carrito = await carritoRes.json();

            if (!carrito?.id_carrito) {
                const createRes = await fetch(`${API}/api/carrito`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_usuario: user.id_usuario, estado: "activo" }),
                });
                const created = await createRes.json();
                carrito = created.data;
            }

            const userSession = { ...user, id_carrito: carrito.id_carrito };
            sessionStorage.setItem("usuario", JSON.stringify(userSession));
            login(userSession);

            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new Event("storage"));

            setSuccess(`¡Bienvenido de vuelta, ${data.data.nombre}!`);
            window.location.reload();
            setLoginForm({ email: "", password: "" });
            setTimeout(() => onClose?.(), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const allFields = Object.keys(emptyRegister);
        setTouched(allFields.reduce((acc, k) => ({ ...acc, [k]: true }), {}));

        if (!isRegisterValid()) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const {  ...payload } = registerForm;

            const res = await fetch(`${API}/api/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al registrarse");

            setSuccess("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
            setRegisterForm(emptyRegister);
            setTouched({});

            setTimeout(() => {
                window.dispatchEvent(new Event("storage"));
                window.location.reload();
            }, 1500);

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

    const handleOverlayClick = () => onClose?.();
    const handleSheetClick = (e) => e.stopPropagation();

    const strength = passwordStrength(registerForm.password);

    return (
        <>
            <div className="auth-overlay" onClick={handleOverlayClick} />

            <div className="auth-sheet" onClick={handleSheetClick}>
                <div className="auth-handle" />
                <button className="auth-close" onClick={onClose} aria-label="Cerrar">
                    ✕
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                    <img src={titulo} alt="Japanda" style={{ height: '6em', width: 'auto' }} />
                </div>

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
                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                ) : (
                    <form className="auth-form" onSubmit={handleRegister} noValidate>

                        <Field
                            label="Nombre *"
                            name="nombre"
                            type="text"
                            placeholder="Tu nombre completo"
                            value={registerForm.nombre}
                            onChange={handleRegisterChange}
                            onBlur={handleBlur}
                            error={getError("nombre")}
                            disabled={loading}
                        />

                        <Field
                            label="Email *"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            onBlur={handleBlur}
                            error={getError("email")}
                            disabled={loading}
                        />

                        <div className="auth-field">
                            <label className="auth-label">Contraseña *</label>
                            <input
                                className={`auth-input ${touched.password && getError("password") ? "auth-input--error" : touched.password && !getError("password") ? "auth-input--ok" : ""}`}
                                type="password"
                                name="password"
                                placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                onBlur={handleBlur}
                                disabled={loading}
                            />
                            {registerForm.password && (
                                <div className="auth-strength">
                                    <div className="auth-strength__bar">
                                        {[1, 2, 3, 4].map((i) => (
                                            <span
                                                key={i}
                                                className="auth-strength__segment"
                                                style={{
                                                    backgroundColor:
                                                        i <= strength ? STRENGTH_COLOR[strength] : undefined,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span
                                        className="auth-strength__label"
                                        style={{ color: STRENGTH_COLOR[strength] }}
                                    >
                                        {STRENGTH_LABEL[strength]}
                                    </span>
                                </div>
                            )}
                            {touched.password && getError("password") && (
                                <span className="auth-error">{getError("password")}</span>
                            )}
                        </div>

                        <Field
                            label="Confirmar contraseña *"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={registerForm.confirmPassword}
                            onChange={handleRegisterChange}
                            onBlur={handleBlur}
                            error={getError("confirmPassword")}
                            disabled={loading}
                        />

                        <div className="auth-divider"><span>Datos opcionales</span></div>

                        <div className="auth-grid">
                            <Field
                                label="Teléfono"
                                name="telefono"
                                type="tel"
                                placeholder="+34 600 000 000"
                                value={registerForm.telefono}
                                onChange={handleRegisterChange}
                                onBlur={handleBlur}
                                error={getError("telefono")}
                                disabled={loading}
                            />
                            <Field
                                label="Ciudad"
                                name="ciudad"
                                type="text"
                                placeholder="Madrid"
                                value={registerForm.ciudad}
                                onChange={handleRegisterChange}
                                onBlur={handleBlur}
                                error={getError("ciudad")}
                                disabled={loading}
                            />
                        </div>

                        <Field
                            label="Dirección"
                            name="direccion"
                            type="text"
                            placeholder="Calle, número, piso..."
                            value={registerForm.direccion}
                            onChange={handleRegisterChange}
                            onBlur={handleBlur}
                            error={getError("direccion")}
                            disabled={loading}
                        />

                        <div className="auth-grid">
                            <Field
                                label="Código Postal"
                                name="cp"
                                type="text"
                                placeholder="28001"
                                value={registerForm.cp}
                                onChange={handleRegisterChange}
                                onBlur={handleBlur}
                                error={getError("cp")}
                                disabled={loading}
                            />
                            <Field
                                label="País"
                                name="pais"
                                type="text"
                                placeholder="España"
                                value={registerForm.pais}
                                onChange={handleRegisterChange}
                                onBlur={handleBlur}
                                error={getError("pais")}
                                disabled={loading}
                            />
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
        </>
    );
}

function Field({ label, name, type, placeholder, value, onChange, onBlur, error, disabled }) {
    const hasError = Boolean(error);
    const isOk = !hasError && value.length > 0;

    return (
        <div className="auth-field">
            <label className="auth-label">{label}</label>
            <input
                className={`auth-input ${hasError ? "auth-input--error" : isOk ? "auth-input--ok" : ""}`}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
            />
            {hasError && <span className="auth-error">{error}</span>}
        </div>
    );
}

export default Auth;