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

export const metadata: Metadata = {
  title: {
    default: "PWA Template",
    template: "%s: PWA Template",
  },
  description: "Plantilla de aplicación web progresiva (PWA) con Next.js, Serwist e IndexedDB",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PWA Template",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
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
      </body>
    </html>
  );
}
