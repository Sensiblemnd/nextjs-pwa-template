"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <p className="error-page-icon" aria-hidden="true">
        ⚠️
      </p>
      <h2>Algo salió mal</h2>
      <p className="error-page-text">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <button onClick={reset} className="btn-primary">
        Intentar de nuevo
      </button>
    </div>
  );
}
