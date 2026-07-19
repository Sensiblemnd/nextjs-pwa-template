import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo instalar",
};

export default function InstallPage() {
  return (
    <div className="home-page">
      <h1 className="home-title">Cómo instalar la app</h1>
      <p className="home-subtitle">
        Instala la aplicación en tu pantalla de inicio para acceso rápido y uso sin conexión.
      </p>

      <section className="home-feature">
        <div>
          <p className="home-feature-title">Android (Chrome)</p>
          <p className="home-feature-desc">
            Toca el menú ⋮ del navegador y elige «Instalar aplicación» o «Agregar a la pantalla
            principal».
          </p>
        </div>
      </section>

      <section className="home-feature">
        <div>
          <p className="home-feature-title">iPhone / iPad (Safari)</p>
          <p className="home-feature-desc">
            Toca el botón Compartir y elige «Agregar a la pantalla de inicio».
          </p>
        </div>
      </section>
    </div>
  );
}
