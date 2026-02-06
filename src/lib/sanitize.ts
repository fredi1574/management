import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a JSDOM instance for server-side DOMPurify
const window = new JSDOM("").window as unknown as Window & typeof globalThis;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize user input strings
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }
  // Remove leading/trailing whitespace and sanitize HTML
  return sanitizeHtml(input.trim());
}

/**
 * Sanitize object keys and values (recursively)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeInput(item) : item
      );
    }
  }
  
  return sanitized;
}
