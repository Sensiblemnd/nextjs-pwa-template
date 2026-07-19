"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import { useInstallDismissed, dismissInstallBar } from "@/lib/hooks/use-install-dismissed";
import { useI18n } from "@/lib/i18n/client";

export function InstallPromptBar() {
  const { installPrompt, install } = useInstallPrompt();
  const dismissed = useInstallDismissed();
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !isStandalone) setIsIOSPrompt(true);
  }, []);

  if (dismissed) return null;

  if (installPrompt) {
    return (
      <div className="install-bar">
        <span className="install-bar-text">{t.installBar.text}</span>
        <button onClick={install} className="install-bar-btn">
          <Download size={13} aria-hidden="true" />
          <span>{t.installBar.install}</span>
        </button>
        <button
          onClick={dismissInstallBar}
          className="install-bar-dismiss"
          aria-label={t.installBar.dismiss}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (isIOSPrompt) {
    return (
      <div className="install-bar">
        <span className="install-bar-text">{t.installBar.text}</span>
        <Link href="/install" className="install-bar-btn">
          {t.installBar.howTo}
        </Link>
        <button
          onClick={dismissInstallBar}
          className="install-bar-dismiss"
          aria-label={t.installBar.dismiss}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}
