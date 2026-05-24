import "../../Styles/perfil.css";
import { useEffect, useState } from "react";
import { useAuth } from "../Additionals/AuthContext";

export default function Perfil() {

  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    cp: "",
    pais: ""
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [pedidos, setPedidos] = useState([]);

  const [sent, setSent] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        ciudad: user.ciudad || "",
        cp: user.cp || "",
        pais: user.pais || ""
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/pedidos/usuario/${user.id_usuario}`
        );

        const data = await res.json();

        console.log("PEDIDOS:", data);

        setPedidos(data);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      }
    };

    fetchPedidos();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${user.id_usuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al actualizar");

      setUser(data.data);

      setSent(true);
      setTimeout(() => setSent(false), 2000);

    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:3000/api/usuarios/${user.id_usuario}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(passwords)
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");

      setPasswordSent(true);
      setTimeout(() => setPasswordSent(false), 2000);

      setPasswords({
        currentPassword: "",
        newPassword: ""
      });

    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  if (!user) {
    return <div className="perfil-page">Debes iniciar sesión</div>;
  }

  return (
    <div className="perfil-page">

      <h1 className="perfil-title">Mis datos</h1>

      <form className="perfil-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" value={form.email} disabled />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input name="direccion" value={form.direccion} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Ciudad</label>
          <input name="ciudad" value={form.ciudad} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Código Postal</label>
          <input name="cp" value={form.cp} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>País</label>
          <input name="pais" value={form.pais} onChange={handleChange} />
        </div>

        <button type="submit">Guardar cambios</button>
      </form>

      <div className="perfil-password">
        <h2>Cambiar contraseña</h2>

        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            name="currentPassword"
            placeholder="Contraseña actual"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
          />

          <input
            type="password"
            name="newPassword"
            placeholder="Nueva contraseña"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
          />

          <button type="submit">Actualizar contraseña</button>
        </form>
      </div>

      <div className="perfil-pedidos">
        <h2>Mis pedidos</h2>

        {pedidos.length === 0 ? (
          <p>No tienes pedidos aún</p>
        ) : (
          <div className="pedidos-list">
            {pedidos.map((pedido) => (
              <div key={pedido.id_pedido} className="pedido-card">
                <p><strong>ID:</strong> {pedido.id_pedido}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Total:</strong> {pedido.total} €</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {sent && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="check-icon">✔</div>
            <h2>Datos actualizados</h2>
          </div>
        </div>
      )}

      {passwordSent && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="check-icon">🔒</div>
            <h2>Contraseña actualizada</h2>
          </div>
        </div>
      )}

    </div>
  );
}