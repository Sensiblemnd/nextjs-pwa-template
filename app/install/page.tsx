import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.installPage.metaTitle };
}

export default async function InstallPage() {
  const t = await getServerDictionary();
  return (
    <div className="home-page">
      <h1 className="home-title">{t.installPage.title}</h1>
      <p className="home-subtitle">{t.installPage.subtitle}</p>

      <section className="home-feature">
        <div>
          <p className="home-feature-title">{t.installPage.androidTitle}</p>
          <p className="home-feature-desc">{t.installPage.androidDesc}</p>
        </div>
      </section>

      <section className="home-feature">
        <div>
          <p className="home-feature-title">{t.installPage.iosTitle}</p>
          <p className="home-feature-desc">{t.installPage.iosDesc}</p>
        </div>
      </section>
    </div>
  );
}
