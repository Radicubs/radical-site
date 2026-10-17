// Run in <head> before the browser can jump to its saved reload position.
export const reloadScrollScript = `(() => {
  try {
    const key = "radicubs-reload-scroll-v1";
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation?.type === "reload" && saved?.url === location.href && Number.isFinite(saved.y) && saved.y > 0) {
      window.__radicubsReloadScroll = { url: saved.url, y: saved.y, previous: history.scrollRestoration };
      history.scrollRestoration = "manual";
      document.documentElement.setAttribute("data-reload-scroll-top", "");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      // Keep the browser's first layout restoration out of the first visible frame.
      const revealTop = () => {
        if (!document.body) { requestAnimationFrame(revealTop); return; }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.removeAttribute("data-reload-scroll-top");
        });
      };
      requestAnimationFrame(revealTop);
      // Some browsers apply a saved offset again as streamed HTML grows.
      const holdAtTop = () => {
        const pending = window.__radicubsReloadScroll;
        if (!pending || pending.started) {
          window.removeEventListener("scroll", holdAtTop);
          window.removeEventListener("pageshow", holdAtTop);
          return;
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      };
      window.addEventListener("scroll", holdAtTop, { passive: true });
      window.addEventListener("pageshow", holdAtTop);
    }
    window.addEventListener("pagehide", () => {
      try { sessionStorage.setItem(key, JSON.stringify({ url: location.href, y: window.scrollY })); } catch {}
    });
  } catch {}
})();`;
