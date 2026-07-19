"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/", icon: Home, label: t.nav.home },
    { href: "/reports", icon: ClipboardList, label: t.nav.reports },
  ];

  return (
    <nav className="bottom-nav" aria-label={t.nav.main}>
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-item"
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
