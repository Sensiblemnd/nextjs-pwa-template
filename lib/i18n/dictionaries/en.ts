// Source of truth for the dictionary shape: `Dictionary` is derived from this
// object, so `es.ts` (and any future locale) gets a type error when a key is
// missing or its shape drifts. Plural/interpolated strings are functions.
export const en = {
  languageName: "English",
  appName: "PWA Template",
  meta: {
    description: "Progressive Web App template with Next.js, Serwist, and IndexedDB",
  },
  nav: {
    main: "Main navigation",
    home: "Home",
    reports: "Reports",
  },
  menu: {
    title: "Menu",
    open: "Open menu",
    close: "Close menu",
    installApp: "Install the app",
    howToInstall: "How to install the app",
  },
  home: {
    title: "Next.js PWA Template",
    subtitle:
      "Offline-first template with Next.js, Serwist, and IndexedDB. Explore the reports example to see the sync queue in action.",
    features: {
      offline: {
        title: "Works offline",
        description:
          "Serwist service worker: app-shell precache, page and data caching, and an offline fallback page.",
      },
      sync: {
        title: "Sync queue",
        description:
          "Reports are saved to IndexedDB and synced automatically on reconnect (Background Sync + Web Locks).",
      },
      install: {
        title: "Installable",
        description:
          "Manifest, icons, and an install bar supporting Android's native prompt and iOS instructions.",
      },
    },
    cta: "View reports example",
  },
  reports: {
    title: "Reports",
    newAria: "Create new report",
    newTitle: "New report",
    back: "Back",
    empty: "No reports",
    create: "Create report",
  },
  form: {
    type: "Type",
    severity: "Severity",
    severities: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },
    description: "Description",
    descriptionPlaceholder: "What's happening?",
    descriptionRequired: "Description is required",
    descriptionMax: "500 characters maximum",
    address: "Address",
    addressPlaceholder: "Street, landmark...",
    locate: "My location",
    locating: "Getting location...",
    geoPermission: "Location unavailable: check location permissions",
    geoUnsupported: "Location not available on this device",
    geoTimeout: "Timed out: try again",
    geoFailed: "Could not get your location",
    cancel: "Cancel",
    submit: "Submit report",
    submitting: "Saving...",
    saved: "Report saved",
  },
  card: {
    noLocation: "No location",
  },
  time: {
    justNow: "just now",
    minutesAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
  },
  connectivity: {
    online: "Online",
    offline: "Offline",
    statusLabel: (online: boolean) => `Status: ${online ? "online" : "offline"}`,
    pending: (n: number) => (n === 1 ? "1 pending" : `${n} pending`),
  },
  queue: {
    syncing: "Syncing...",
    pending: (n: number) => (n === 1 ? "1 report pending" : `${n} reports pending`),
    syncNow: "Sync",
  },
  statusBar: {
    restored: "Back online: syncing reports",
    offline: "Offline: reports will be saved locally",
  },
  installBar: {
    text: "Install the app for quick access",
    install: "Install",
    howTo: "How to install",
    dismiss: "Dismiss install prompt",
  },
  installPage: {
    metaTitle: "How to install",
    title: "How to install the app",
    subtitle: "Install the app on your home screen for quick access and offline use.",
    androidTitle: "Android (Chrome)",
    androidDesc: "Tap the browser's ⋮ menu and choose “Install app” or “Add to Home screen”.",
    iosTitle: "iPhone / iPad (Safari)",
    iosDesc: "Tap the Share button and choose “Add to Home Screen”.",
  },
  offlinePage: {
    title: "You're offline",
    body: "No internet connection, or the signal is too weak. Reports you create will be saved locally and synced automatically when you reconnect.",
    retry: "Retry",
    goHome: "Go home",
  },
  errorPage: {
    title: "Something went wrong",
    body: "An unexpected error occurred. You can try again or go back home.",
    bodyShort: "An unexpected error occurred. You can try again.",
    retry: "Try again",
  },
  swUpdate: {
    newVersion: "New version available",
    refresh: "Update",
  },
  notifications: {
    defaultBody: "You have a new notification",
    view: "View",
    dismiss: "Dismiss",
  },
};

export type Dictionary = typeof en;
