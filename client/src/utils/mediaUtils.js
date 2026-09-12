import { SERVER_BASE_URL } from "../services/api";

export const FALLBACK_TRAINER_IMAGES = [
  "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
  "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
  "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
  "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
  "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg"
];

/**
 * Resolves a trainer image URL safely.
 * Handles relative paths, backend uploaded paths, and fallback to verified gym media.
 */
export function getTrainerImageUrl(image, index = 0) {
  const fallback = FALLBACK_TRAINER_IMAGES[Math.abs(index) % FALLBACK_TRAINER_IMAGES.length];
  if (!image || typeof image !== "string" || image.trim() === "" || image === "undefined" || image === "null") {
    return fallback;
  }

  const trimmed = image.trim();

  // Known invalid / missing seed filenames fallback immediately
  if (
    trimmed.includes("victor-freitas") ||
    trimmed.includes("anastase-maragos") ||
    trimmed.includes("logan-weaver")
  ) {
    return fallback;
  }

  // Handle uploaded images from Express (/uploads/...)
  if (trimmed.startsWith("/uploads/")) {
    // If running in development with Vite proxy, /uploads works directly,
    // but if SERVER_BASE_URL is remote or distinct, prepend when needed
    if (typeof window !== "undefined" && window.location.port === "5173" && SERVER_BASE_URL) {
      return `${SERVER_BASE_URL}${trimmed}`;
    }
    return trimmed;
  }

  // If already full http(s) or valid root-relative path
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // If path is missing leading slash (e.g. "media/photo.jpg")
  return `/${trimmed}`;
}

/**
 * Safe onError event handler for <img> elements.
 * Prevents infinite loop and replaces failed image with a guaranteed fallback.
 */
export function handleTrainerImageError(e, index = 0) {
  const fallback = FALLBACK_TRAINER_IMAGES[Math.abs(index) % FALLBACK_TRAINER_IMAGES.length];
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}
