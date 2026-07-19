import { MetadataRoute } from "next";

// Web app manifests are single-locale: the browser fetches this once at
// install time, so it can't follow the user's in-app language choice. It
// ships in the default locale (en) — change these strings (and `lang`) per
// deployment if your audience is primarily one language.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Next.js PWA Template",
    short_name: "PWA Template",
    description: "Progressive Web App template with offline support",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      // PNG fallbacks — export from SVGs above for production
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New report",
        short_name: "Report",
        description: "Create a new report",
        url: "/reports/new",
        icons: [{ src: "/icons/shortcut-report.svg", sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
