import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { TopBar } from "@/components/navigation/top-bar";
import { OfflineStatusBar } from "@/components/offline/offline-status-bar";
import { ConnectivityIndicator } from "@/components/offline/connectivity-indicator";
import { InstallPromptBar } from "@/components/layout/install-prompt-bar";
import { OfflineQueueStatus } from "@/components/offline/offline-queue-status";
import { ServiceWorkerRegistrar } from "@/components/layout/service-worker-registrar";
import { FontScaleProvider } from "@/components/layout/font-scale-provider";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return {
    title: {
      default: t.appName,
      template: `%s: ${t.appName}`,
    },
    description: t.meta.description,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: t.appName,
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="dark">
      <body>
        <LocaleProvider locale={locale}>
          <ServiceWorkerRegistrar />
          <FontScaleProvider />
          <div className="app-shell">
            <header>
              <TopBar />
              <OfflineStatusBar />
              <ConnectivityIndicator />
              <InstallPromptBar />
            </header>

            {/* Main scrollable content */}
            <main id="main-content" className="flex flex-col overflow-y-auto">
              {children}
            </main>

            <OfflineQueueStatus />
            <BottomNav />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
