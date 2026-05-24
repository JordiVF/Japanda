import "../../Styles/contacto.css";
import { useState } from "react";

export default function Contacto() {

  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 2500);
  };

  return (
    <div className="contacto-page">

      <section className="contacto-hero">
        <h1>Atención al cliente</h1>
        <p>Estamos aquí para ayudarte con cualquier duda sobre tu pedido</p>
      </section>

      <section className="contacto-grid">

        <div className="contacto-card">
          <h2>📩 Email</h2>
          <p>Respuesta en menos de 24h</p>
          <a href="mailto:soporte@japanda.com">soporte@japanda.com</a>
        </div>

        <div className="contacto-card">
          <h2>📞 Teléfono</h2>
          <p>Lunes a viernes de 9:00 a 18:00</p>
          <a href="tel:+34123456789">+34 123 456 789</a>
        </div>

      </section>

      <div className="politica-wrapper">

        <h1 className="politica-title">
          Política de empresa y atención al cliente
        </h1>

        <section className="politica-section">
          <h2>1. Compromiso de Japanda con el cliente</h2>
          <p>
            En Japanda trabajamos para ofrecer una experiencia de compra segura, transparente y satisfactoria.
            Nuestro objetivo es garantizar productos de calidad, un servicio de atención eficaz y envíos fiables.
          </p>
        </section>

        <section className="politica-section">
          <h2>2. Derechos del cliente</h2>
          <ul>
            <li>Información clara y veraz sobre los productos.</li>
            <li>Seguimiento del estado del pedido.</li>
            <li>Entrega en los plazos estimados.</li>
            <li>Devoluciones según política vigente.</li>
            <li>Atención al cliente eficiente.</li>
            <li>Trato respetuoso y profesional.</li>
          </ul>
        </section>

        <section className="politica-section">
          <h2>3. Obligaciones del cliente</h2>
          <ul>
            <li>Datos reales y actualizados.</li>
            <li>Uso adecuado de la plataforma.</li>
            <li>Aceptación de tiempos de envío.</li>
            <li>No realizar pedidos fraudulentos.</li>
          </ul>
        </section>

        <section className="politica-section">
          <h2>4. Derechos de Japanda</h2>
          <ul>
            <li>Modificar precios o stock sin previo aviso.</li>
            <li>Cancelar pedidos sospechosos o erróneos.</li>
            <li>Rechazar usos indebidos del sistema.</li>
            <li>Actualizar la plataforma cuando sea necesario.</li>
          </ul>
        </section>

        <div className="politica-divider" />

        <section className="politica-section">
          <h2>5. Envíos y entregas</h2>
          <p>
            Los plazos de entrega son estimados y pueden variar por logística o transporte externo.
          </p>
        </section>

        <section className="politica-section">
          <h2>6. Productos</h2>
          <p>
            Las imágenes son orientativas. Puede haber pequeñas variaciones en el producto final.
          </p>
        </section>

        <section className="politica-section">
          <h2>7. Atención al cliente</h2>
          <p>
            Nuestro equipo está disponible para resolver cualquier incidencia relacionada con pedidos o productos.
          </p>
        </section>

        <section className="politica-section">
          <h2>8. Modificaciones</h2>
          <p>
            Japanda puede actualizar esta política en cualquier momento para mejorar el servicio o adaptarse a la normativa.
          </p>
        </section>

      </div>

      <section className="contacto-form-section">

        <h2>Envíanos un mensaje</h2>

        <form className="contacto-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Asunto" required />
          <textarea placeholder="Escribe tu mensaje..." rows="6" required />

          <button type="submit">Enviar mensaje</button>
        </form>

      </section>

      {sent && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="check-icon">✔</div>
            <h2>Mensaje enviado</h2>
            <p>Te responderemos lo antes posible.</p>
          </div>
        </div>
      )}

    </div>
  );
}