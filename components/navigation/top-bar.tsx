"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Download, HelpCircle } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";

type LinkItem = { label: string; href: string; icon: React.ElementType };
type ActionItem = { label: string; onClick: () => void; icon: React.ElementType };
type MenuItem = LinkItem | ActionItem;

const ALWAYS_ITEMS: LinkItem[] = [
  { label: "Cómo instalar la app", href: "/install", icon: HelpCircle },
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const { installPrompt, isInstalled, install } = useInstallPrompt();

  const close = () => setOpen(false);

  const installAction: ActionItem | null =
    !isInstalled && installPrompt
      ? {
          label: "Instalar la app",
          icon: Download,
          onClick: () => {
            install();
            close();
          },
        }
      : null;

  const menuItems: MenuItem[] = [...(installAction ? [installAction] : []), ...ALWAYS_ITEMS];

  return (
    <>
      <div className="top-bar">
        <span className="top-bar-title">PWA Template</span>
        <button
          onClick={() => setOpen(true)}
          className="top-bar-menu-btn"
          aria-label="Abrir menú"
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
        aria-label="Menú principal"
        aria-hidden={!open}
      >
        <div className="menu-drawer-header">
          <span className="menu-drawer-title">Menú</span>
          <button onClick={close} className="menu-drawer-close" aria-label="Cerrar menú">
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
