"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Download, HelpCircle, Languages } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import { useI18n, setLocaleCookie } from "@/lib/i18n/client";
import { DICTIONARIES } from "@/lib/i18n";

type LinkItem = { label: string; href: string; icon: React.ElementType };
type ActionItem = { label: string; onClick: () => void; icon: React.ElementType };
type MenuItem = LinkItem | ActionItem;

export function TopBar() {
  const [open, setOpen] = useState(false);
  const { installPrompt, isInstalled, install } = useInstallPrompt();
  const { locale, t } = useI18n();
  const router = useRouter();

  const close = () => setOpen(false);

  const installAction: ActionItem | null =
    !isInstalled && installPrompt
      ? {
          label: t.menu.installApp,
          icon: Download,
          onClick: () => {
            install();
            close();
          },
        }
      : null;

  // Labelled with the target language's own name ("Español" / "English") so
  // it's readable even when the current locale isn't yours
  const otherLocale = locale === "es" ? "en" : "es";
  const languageAction: ActionItem = {
    label: DICTIONARIES[otherLocale].languageName,
    icon: Languages,
    onClick: () => {
      setLocaleCookie(otherLocale);
      close();
      router.refresh();
    },
  };

  const menuItems: MenuItem[] = [
    ...(installAction ? [installAction] : []),
    { label: t.menu.howToInstall, href: "/install", icon: HelpCircle },
    languageAction,
  ];

  return (
    <>
      <div className="top-bar">
        <span className="top-bar-title">{t.appName}</span>
        <button
          onClick={() => setOpen(true)}
          className="top-bar-menu-btn"
          aria-label={t.menu.open}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Menu size={22} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {open && <div className="menu-drawer-backdrop" onClick={close} aria-hidden="true" />}

      <nav
        className="menu-drawer"
        data-open={open ? "true" : "false"}
        aria-label={t.menu.title}
        aria-hidden={!open}
      >
        <div className="menu-drawer-header">
          <span className="menu-drawer-title">{t.menu.title}</span>
          <button onClick={close} className="menu-drawer-close" aria-label={t.menu.close}>
            <X size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <ul className="menu-drawer-list" role="list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const key = "href" in item ? item.href : item.label;
            return (
              <li key={key}>
                {"href" in item ? (
                  <Link href={item.href} className="menu-drawer-item" onClick={close}>
                    <Icon size={20} strokeWidth={2} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button className="menu-drawer-item" onClick={item.onClick}>
                    <Icon size={20} strokeWidth={2} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
