"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import { useInstallDismissed, dismissInstallBar } from "@/lib/hooks/use-install-dismissed";

export function InstallPromptBar() {
  const { installPrompt, install } = useInstallPrompt();
  const dismissed = useInstallDismissed();
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !isStandalone) setIsIOSPrompt(true);
  }, []);

  if (dismissed) return null;

  if (installPrompt) {
    return (
      <div className="install-bar">
        <span className="install-bar-text">Instala la app para acceso rápido</span>
        <button onClick={install} className="install-bar-btn">
          <Download size={13} aria-hidden="true" />
          <span>Instalar</span>
        </button>
        <button
          onClick={dismissInstallBar}
          className="install-bar-dismiss"
          aria-label="Cerrar aviso de instalación"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (isIOSPrompt) {
    return (
      <div className="install-bar">
        <span className="install-bar-text">Instala la app para acceso rápido</span>
        <Link href="/install" className="install-bar-btn">
          Cómo instalar
        </Link>
        <button
          onClick={dismissInstallBar}
          className="install-bar-dismiss"
          aria-label="Cerrar aviso de instalación"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}
