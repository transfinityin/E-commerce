/** Shared bridge: Three Stories → Featured Product */
export const FEATURED_SELECT_EVENT = "transfinity:featured-select";

export type FeaturedSlug = "void" | "eternal" | "ascendant";

function scrollToFeatured(behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById("featured");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior });
}

export function selectFeaturedProduct(slug: FeaturedSlug) {
  if (typeof window === "undefined") return;

  const hash = `#featured-${slug}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }

  window.dispatchEvent(
    new CustomEvent(FEATURED_SELECT_EVENT, { detail: { slug } }),
  );

  // Instant jump first — sticky story pin cancels smooth scroll on first click
  scrollToFeatured("auto");
  requestAnimationFrame(() => scrollToFeatured("auto"));
  window.setTimeout(() => scrollToFeatured("auto"), 50);
}
