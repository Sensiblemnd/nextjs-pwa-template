import Link from "next/link";
import { WifiOff, Download, RefreshCw, ClipboardList } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n/server";

const FEATURE_ICONS = { offline: WifiOff, sync: RefreshCw, install: Download } as const;

export default async function HomePage() {
  const t = await getServerDictionary();
  const features = (["offline", "sync", "install"] as const).map((key) => ({
    icon: FEATURE_ICONS[key],
    ...t.home.features[key],
  }));

  return (
    <div className="home-page">
      <h1 className="home-title">{t.home.title}</h1>
      <p className="home-subtitle">{t.home.subtitle}</p>

      <ul className="home-feature-list" role="list">
        {features.map((feature) => {
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
        {t.home.cta}
      </Link>
    </div>
  );
}
