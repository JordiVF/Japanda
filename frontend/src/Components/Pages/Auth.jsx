import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { sha256 } from "js-sha256";
import "../../Styles/auth.css";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        identifier: "",
        email: "",
        password: "",
        nombre: "",
        telefono: ""
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        const passwordHash = sha256(formData.password);

        const { data, error: fetchError } = await supabase
            .from("usuarios")
            .select("*")
            .or(`email.eq.${formData.identifier},telefono.eq.${formData.identifier}`)
            .eq("password_hash", passwordHash)
            .single();

        if (fetchError || !data) {
            setError("Credenciales incorrectas. Revisa tu email/teléfono o contraseña.");
        } else {
            console.log("Sesión iniciada:", data);
            localStorage.setItem("userRole", data.rol);
            window.location.href = data.rol === "admin" ? "/admin" : "/";
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        const passwordHash = sha256(formData.password);

        const { data, error: regError } = await supabase
            .from("usuarios")
            .insert([
                {
                    nombre: formData.nombre,
                    email: formData.email,
                    password_hash: passwordHash,
                    telefono: formData.telefono,
                    rol: "cliente" 
                }
            ]);

        if (regError) {
            setError("Error en el registro: " + regError.message);
        } else {
            alert("Cuenta creada con éxito");
            setIsLogin(true);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">{isLogin ? "Bienvenido" : "Crear Cuenta"}</h1>
                
                <div className="auth-toggle">
                    <button 
                        className={isLogin ? "active" : ""} 
                        onClick={() => setIsLogin(true)}
                    >Login</button>
                    <button 
                        className={!isLogin ? "active" : ""} 
                        onClick={() => setIsLogin(false)}
                    >Registro</button>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
                    {error && <p className="auth-error">{error}</p>}

                    {!isLogin && (
                        <div className="input-group">
                            <label>Nombre Completo</label>
                            <input type="text" name="nombre" onChange={handleChange} />
                        </div>
                    )}

                    {isLogin ? (
                        <div className="input-group">
                            <label>Email o Teléfono</label>
                            <input 
                                type="text" 
                                name="identifier" 
                                required 
                                onChange={handleChange} 
                                placeholder="ejemplo@mail.com o 600000000"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" name="email" required onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Teléfono</label>
                                <input type="text" name="telefono" onChange={handleChange} />
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" required onChange={handleChange} />
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        {isLogin ? "Entrar" : "Registrarse"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Auth;