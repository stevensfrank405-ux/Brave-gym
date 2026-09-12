import { SERVER_BASE_URL } from "../services/api";

export const FALLBACK_TRAINER_IMAGES = [
  "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg",
  "/media/mohamed-fareed-rbSNsoXk-3A-unsplash.jpg",
  "/media/hermes-rivera-qbf59TU077Q-unsplash.jpg",
  "/media/david-guliciuc-o2zrjlM5s5o-unsplash.jpg",
  "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg"
];

export const DEFAULT_ADMIN_AVATAR = "/media/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg";
export const DEFAULT_USER_AVATAR = "/media/chris-kendall-sJ6az6-T1u8-unsplash.jpg";

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
    if (SERVER_BASE_URL && typeof window !== "undefined" && !SERVER_BASE_URL.includes(window.location.host)) {
      return `${SERVER_BASE_URL.replace(/\/+$/, "")}${trimmed}`;
    }
    return trimmed;
  }

  // If already full http(s) or data URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If root-relative /media/...
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // If path is missing leading slash (e.g. "media/photo.jpg")
  return `/${trimmed}`;
}

/**
 * Safe onError event handler for trainer <img> elements.
 */
export function handleTrainerImageError(e, index = 0) {
  const fallback = FALLBACK_TRAINER_IMAGES[Math.abs(index) % FALLBACK_TRAINER_IMAGES.length];
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}

/**
 * Resolves an athlete or admin avatar URL safely.
 * Handles /uploads/..., base64 data URLs, root-relative paths, and role-based defaults.
 */
export function getUserAvatarUrl(avatar, role = "user") {
  const defaultAvatar = role === "admin" ? DEFAULT_ADMIN_AVATAR : DEFAULT_USER_AVATAR;
  if (!avatar || typeof avatar !== "string" || !avatar.trim() || avatar === "null" || avatar === "undefined") {
    return defaultAvatar;
  }

  const trimmed = avatar.trim();

  // If already data: URL (base64)
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If full http:// or https://
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If uploaded file on Express server
  if (trimmed.startsWith("/uploads/")) {
    if (SERVER_BASE_URL && typeof window !== "undefined" && !SERVER_BASE_URL.includes(window.location.host)) {
      return `${SERVER_BASE_URL.replace(/\/+$/, "")}${trimmed}`;
    }
    return trimmed;
  }

  // If root-relative path (e.g. /media/...)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Missing leading slash
  return `/${trimmed}`;
}

/**
 * Safe onError event handler for profile avatar <img> elements.
 * Never allows broken image icons to render on user or admin profiles.
 */
export function handleAvatarError(e, role = "user") {
  const fallback = role === "admin" ? DEFAULT_ADMIN_AVATAR : DEFAULT_USER_AVATAR;
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}
