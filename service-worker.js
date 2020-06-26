self.addEventListener('install', event => {
    console.log('Service worker installing...');
    // Add a call to skipWaiting here
    event.waitUntil(
        caches.open('v1').then(function(cache) {
          return cache.addAll([
            '/',
            '/index.html',
            '/tetris.js',
            '/lego-4.png',
            '/pixeboy.ttf',
            '/ka1.ttf',
            '/background.jpg',
          ]);
        })
      );
});

self.addEventListener('activate', event => {
    console.log('Service worker activating...');
});

self.addEventListener('fetch', function(event) { 
    console.log(event.request)
    console.log(caches.match(event.request))
    event.respondWith(
        caches.match(event.request)
    );
});