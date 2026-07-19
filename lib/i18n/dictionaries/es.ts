import type { Dictionary } from "./en";

export const es: Dictionary = {
  languageName: "Español",
  appName: "PWA Template",
  meta: {
    description: "Plantilla de aplicación web progresiva (PWA) con Next.js, Serwist e IndexedDB",
  },
  nav: {
    main: "Navegación principal",
    home: "Inicio",
    reports: "Reportes",
  },
  menu: {
    title: "Menú",
    open: "Abrir menú",
    close: "Cerrar menú",
    installApp: "Instalar la app",
    howToInstall: "Cómo instalar la app",
  },
  home: {
    title: "Next.js PWA Template",
    subtitle:
      "Plantilla offline-first con Next.js, Serwist e IndexedDB. Explora el ejemplo de reportes para ver la cola de sincronización en acción.",
    features: {
      offline: {
        title: "Funciona sin conexión",
        description:
          "Service worker con Serwist: precache del shell, cache de páginas y datos, y página de respaldo sin conexión.",
      },
      sync: {
        title: "Cola de sincronización",
        description:
          "Los reportes se guardan en IndexedDB y se sincronizan automáticamente al reconectar (Background Sync + Web Locks).",
      },
      install: {
        title: "Instalable",
        description:
          "Manifest, iconos y barra de instalación con soporte para el aviso nativo de Android y las instrucciones de iOS.",
      },
    },
    cta: "Ver ejemplo de reportes",
  },
  reports: {
    title: "Reportes",
    newAria: "Crear nuevo reporte",
    newTitle: "Nuevo reporte",
    back: "Volver",
    empty: "No hay reportes",
    create: "Crear reporte",
  },
  form: {
    type: "Tipo",
    severity: "Gravedad",
    severities: { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" },
    description: "Descripción",
    descriptionPlaceholder: "¿Qué está pasando?",
    descriptionRequired: "La descripción es obligatoria",
    descriptionMax: "Máximo 500 caracteres",
    address: "Dirección",
    addressPlaceholder: "Calle, referencia...",
    locate: "Mi ubicación",
    locating: "Obteniendo ubicación...",
    geoPermission: "Ubicación no disponible: verifica los permisos de ubicación",
    geoUnsupported: "Ubicación no disponible en este dispositivo",
    geoTimeout: "Tiempo agotado: intenta de nuevo",
    geoFailed: "No se pudo obtener la ubicación",
    cancel: "Cancelar",
    submit: "Enviar reporte",
    submitting: "Guardando...",
    saved: "Reporte guardado",
  },
  card: {
    noLocation: "Sin ubicación",
  },
  time: {
    justNow: "ahora mismo",
    minutesAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n}h`,
    daysAgo: (n: number) => `hace ${n}d`,
  },
  connectivity: {
    online: "En línea",
    offline: "Sin conexión",
    statusLabel: (online: boolean) => `Estado: ${online ? "en línea" : "sin conexión"}`,
    pending: (n: number) => (n === 1 ? "1 pendiente" : `${n} pendientes`),
  },
  queue: {
    syncing: "Sincronizando...",
    pending: (n: number) => (n === 1 ? "1 reporte pendiente" : `${n} reportes pendientes`),
    syncNow: "Sincronizar",
  },
  statusBar: {
    restored: "Conexión restaurada: sincronizando reportes",
    offline: "Sin conexión: los reportes se guardarán localmente",
  },
  installBar: {
    text: "Instala la app para acceso rápido",
    install: "Instalar",
    howTo: "Cómo instalar",
    dismiss: "Cerrar aviso de instalación",
  },
  installPage: {
    metaTitle: "Cómo instalar",
    title: "Cómo instalar la app",
    subtitle:
      "Instala la aplicación en tu pantalla de inicio para acceso rápido y uso sin conexión.",
    androidTitle: "Android (Chrome)",
    androidDesc:
      "Toca el menú ⋮ del navegador y elige «Instalar aplicación» o «Agregar a la pantalla principal».",
    iosTitle: "iPhone / iPad (Safari)",
    iosDesc: "Toca el botón Compartir y elige «Agregar a la pantalla de inicio».",
  },
  offlinePage: {
    title: "Sin conexión",
    body: "No hay conexión a internet o la señal es demasiado débil. Los reportes que hagas se guardarán localmente y se sincronizarán automáticamente al reconectarte.",
    retry: "Reintentar",
    goHome: "Ir al inicio",
  },
  errorPage: {
    title: "Algo salió mal",
    body: "Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.",
    bodyShort: "Ocurrió un error inesperado. Puedes intentar de nuevo.",
    retry: "Intentar de nuevo",
  },
  swUpdate: {
    newVersion: "Nueva versión disponible",
    refresh: "Actualizar",
  },
  notifications: {
    defaultBody: "Tienes una nueva notificación",
    view: "Ver",
    dismiss: "Cerrar",
  },
};
