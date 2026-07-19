// Canonical public URL — the single place the production domain is written.
// Override with NEXT_PUBLIC_SITE_URL (hosting env) when the domain changes;
// no trailing slash so consumers can append paths.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-app.example.com";
