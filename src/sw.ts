/// <reference lib="WebWorker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { ExpirationPlugin } from "workbox-expiration"
import { clientsClaim } from "workbox-core"
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies"

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null
    url: string
  }>
}

type PushPayload = {
  title?: string
  body?: string
  path?: string
  type?: string
}

clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()

registerRoute(
  /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
  new StaleWhileRevalidate({
    cacheName: "supabase-api-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

registerRoute(
  /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
  new CacheFirst({
    cacheName: "supabase-images-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

function parsePushPayload(event: PushEvent): PushPayload {
  if (!event.data) {
    return {}
  }

  try {
    return event.data.json() as PushPayload
  } catch {
    return {
      body: event.data.text(),
    }
  }
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event)
  const title = payload.title?.trim() || "Maria Badari"
  const body = payload.body?.trim() || "You have a new update."
  const path = payload.path?.startsWith("/") ? payload.path : "/"

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: {
        path,
        type: payload.type ?? "generic",
      },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const path =
    typeof event.notification.data?.path === "string" &&
    event.notification.data.path.startsWith("/")
      ? event.notification.data.path
      : "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        const clientUrl = new URL(client.url)

        if (clientUrl.origin === self.location.origin) {
          client.focus()
          if (clientUrl.pathname !== path) {
            client.navigate(path)
          }
          return
        }
      }

      return self.clients.openWindow(path)
    }),
  )
})
