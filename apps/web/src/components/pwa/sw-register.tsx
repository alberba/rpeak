"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Un worker de una ejecución `next start` anterior también controla
      // localhost durante `next dev` y puede servir chunks obsoletos.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => void registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith("rpeak-")).forEach((key) => void caches.delete(key));
        });
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalación no crítica: la app sigue funcionando sin PWA offline.
    });
  }, []);

  return null;
}
