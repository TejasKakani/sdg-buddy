// Minimal service worker to satisfy installability checks
// Keeps behavior simple: installs, activates, and does a basic network-first fetch

self.addEventListener('install', () => {
	// Activate immediately
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	// Take control of uncontrolled clients immediately
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	// Basic network-first strategy: try network, fall back to cache if implemented elsewhere
	event.respondWith(
		fetch(event.request).catch(() => {
			return caches.match(event.request);
		})
	);
});
