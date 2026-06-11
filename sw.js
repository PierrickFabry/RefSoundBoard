const LAUNCH_TIME = '1781165726';
importScripts('sounds-config.js');

const CACHE_NAME = 'soundboard-' + LAUNCH_TIME;

const assets = [
    './',
    './index.html',
    './app.js',
    './sounds-config.js',
    './manifest.json',
    './Icones/icone-512.png'
];

// On fusionne les fichiers de base avec la liste des sons générée par le robot
const allAssets = assets.concat(SOUNDS_LIST.map(son => encodeURI('./Sons/' + son)));

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(allAssets);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Nettoyage automatique des anciens sons pour ne pas saturer le stockage
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
});