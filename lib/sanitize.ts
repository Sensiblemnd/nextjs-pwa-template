// Strip all HTML tags from user input before storing — prevents stored XSS
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

// Escape special HTML characters for use in raw HTML contexts
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
