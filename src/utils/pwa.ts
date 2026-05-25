export async function registerPwaServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  await navigator.serviceWorker.register("/sw.js");
  return true;
}

export function isAppInstalled() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
