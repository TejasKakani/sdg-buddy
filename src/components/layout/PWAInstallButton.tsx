"use client";

import type { PWAInstallElement } from "@khmyznikov/pwa-install";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isAppInstalled, registerPwaServiceWorker } from "@/utils/pwa";

interface CustomWindow extends Window {
  MSStream?: unknown;
  opera?: unknown;
}

type InstallPromptHolder = Window & {
  __sdgBuddyInstallPrompt?: { prompt?: () => Promise<void> } | null;
};

export default function PWAInstallButton() {
  const pwaInstallRef = useRef<PWAInstallElement | null>(null);
  const [deferredPromptEvent, setDeferredPromptEvent] = useState<Event | null>(null);
  const [isInstalled] = useState<boolean>(() => isAppInstalled());
  const isProduction = process.env.NODE_ENV === "production";

  // Fix: Initialize state lazily with SSR protection to completely bypass the eslint hook error
  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    
    const win = window as CustomWindow;
    const userAgent = navigator.userAgent || navigator.vendor || String(win.opera || "");
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const hasMSStream = !!win.MSStream;

    return isIOSDevice && !hasMSStream;
  });

  useEffect(() => {
    if (isProduction) {
      void import("@khmyznikov/pwa-install");

      const windowWithInstallPrompt = window as Window & {
        __sdgBuddyInstallPrompt?: Event | null;
      };

      const syncPromptEvent = () => {
        const promptEvent = windowWithInstallPrompt.__sdgBuddyInstallPrompt ?? null;
        setDeferredPromptEvent(promptEvent);

        if (pwaInstallRef.current && promptEvent) {
          pwaInstallRef.current.externalPromptEvent = promptEvent as never;
        }
      };

      syncPromptEvent();

      const handlePromptReady = () => {
        syncPromptEvent();
      };

      const handleBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        windowWithInstallPrompt.__sdgBuddyInstallPrompt = event;
        syncPromptEvent();
      };

      window.addEventListener("sdg-buddy-install-prompt-ready", handlePromptReady);
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      void registerPwaServiceWorker().catch((error) => {
        console.error("Failed to register service worker:", error);
      });

      return () => {
        window.removeEventListener("sdg-buddy-install-prompt-ready", handlePromptReady);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    // In development, capture the browser's beforeinstallprompt so the dev mock can use it.
    const devWindow = window as InstallPromptHolder;
    const devHandleBeforeInstallPrompt = (event: Event) => {
      try {
        event.preventDefault();
      } catch {}
      devWindow.__sdgBuddyInstallPrompt = event as unknown as { prompt?: () => Promise<void> };
    };

    window.addEventListener("beforeinstallprompt", devHandleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", devHandleBeforeInstallPrompt as EventListener);
    };
  }, [isProduction]);

  const handleInstallClick = () => {
    const installElement = pwaInstallRef.current;

    if (!installElement) {
      return;
    }

    // iOS doesn't use standard prompt events. Force the component to show its built-in tooltip/modal instructions
    if (isIOS) {
      if (typeof installElement.showDialog === "function") {
        installElement.showDialog();
      }
      return;
    }

    if (deferredPromptEvent) {
      installElement.externalPromptEvent = deferredPromptEvent as never;
    }

    if (typeof installElement.showDialog === "function") {
      installElement.showDialog();
      return;
    }

    if (typeof installElement.install === "function") {
      installElement.install();
    }
  };

  if (isInstalled) {
    return null;
  }

  if (!isProduction) {
    const handleDevInstall = async () => {
      const wnd = window as InstallPromptHolder;
      const promptEvent = wnd.__sdgBuddyInstallPrompt;

      if (promptEvent && typeof promptEvent.prompt === "function") {
        try {
          await promptEvent.prompt();
          wnd.__sdgBuddyInstallPrompt = null;
          return;
        } catch (e) {
          console.error("Error showing install prompt:", e);
        }
      }

      try {
        await registerPwaServiceWorker();
      } catch (e) {
        console.error(e);
      }

      alert(
        "Install prompt not available in development. Build production or set NODE_ENV=production to test the real install flow."
      );
    };

    return (
      <button
        type="button"
        onClick={handleDevInstall}
        className="inline-flex items-center gap-2 rounded-md border border-emerald-600 px-4 py-2 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
      >
        <Download className="h-4 w-4" />
        Install app
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 rounded-md border border-emerald-600 px-4 py-2 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
      >
        <Download className="h-4 w-4" />
        Install app
      </button>

      <pwa-install
        ref={pwaInstallRef}
        manualApple
        manualChrome
        useLocalStorage
        manifestUrl="/manifest.json"
        name="SDG Buddy"
        description="Track sustainable actions and install SDG Buddy as an app on your device."
        icon="/icon-192.png"
        styles={{ "--tint-color": "#059669" }}
      />
    </>
  );
}