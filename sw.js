const CACHE_NAME = 'soundboard-v1';

// Liste de tous les fichiers à sauvegarder pour le hors-ligne
const assets = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './sons/Bonjour.mp3',
    './sons/Bruuuuh.mp3',
    './icones/icone-512.png'
];

// Installation : on met tout en cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

// Lecture : on va chercher dans le cache en priorité
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});