"use client";

import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <WifiOff className="offline-page-icon" size={56} strokeWidth={1.5} aria-hidden="true" />
      <h1>Sin conexión</h1>
      <p>
        No hay conexión a internet o la señal es demasiado débil. Los reportes que hagas se
        guardarán localmente y se sincronizarán automáticamente al reconectarte.
      </p>
      <div className="offline-page-actions">
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          <RefreshCw size={18} aria-hidden="true" />
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
