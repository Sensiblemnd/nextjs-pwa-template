import Link from "next/link";
import { WifiOff, Download, RefreshCw, ClipboardList } from "lucide-react";

const FEATURES = [
  {
    icon: WifiOff,
    title: "Funciona sin conexión",
    description:
      "Service worker con Serwist: precache del shell, cache de páginas y datos, y página de respaldo sin conexión.",
  },
  {
    icon: RefreshCw,
    title: "Cola de sincronización",
    description:
      "Los reportes se guardan en IndexedDB y se sincronizan automáticamente al reconectar (Background Sync + Web Locks).",
  },
  {
    icon: Download,
    title: "Instalable",
    description:
      "Manifest, iconos y barra de instalación con soporte para el aviso nativo de Android y las instrucciones de iOS.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="home-page">
      <h1 className="home-title">Next.js PWA Template</h1>
      <p className="home-subtitle">
        Plantilla offline-first con Next.js, Serwist e IndexedDB. Explora el ejemplo de reportes
        para ver la cola de sincronización en acción.
      </p>

      <ul className="home-feature-list" role="list">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="home-feature">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
              <div>
                <p className="home-feature-title">{feature.title}</p>
                <p className="home-feature-desc">{feature.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <Link href="/reports" className="btn-primary home-cta">
        <ClipboardList size={18} aria-hidden="true" />
        Ver ejemplo de reportes
      </Link>
    </div>
  );
}
