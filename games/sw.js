
const CACHE_NAME = 'fire-safety-games-v2';
const CACHE_URLS = [
  '/games/',
  '/games/index.html',
  '/games/demo/index.html',
  '/games/css/games-main.css',
  '/games/css/demo-game.css',
  '/games/js/games-main.js',
  '/games/js/demo-game.js',
  '/games/manifest.webmanifest'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching game files');
        return cache.addAll(CACHE_URLS);
      })
      .catch(error => {
        console.error('[SW] Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', event => {
  // Только для игровых ресурсов
  if (!event.request.url.includes('/games/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша если есть
        if (response) {
          console.log('[SW] Cache HIT for', event.request.url);
          return response;
        }
        
        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Проверяем что ответ валидный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ для кэша
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('[SW] Cache SET for', event.request.url);
              });
            
            return response;
          })
          .catch(() => {
            // Офлайн режим - показываем заглушку
            if (event.request.destination === 'document') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Fire Safety KZ - Офлайн</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { font-family: Arial, sans-serif; padding: 2rem; text-align: center; background: #f3f4f6; }
                      .container { max-width: 400px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                      .icon { font-size: 4rem; margin-bottom: 1rem; }
                      h1 { color: #dc2626; margin-bottom: 1rem; }
                      p { color: #6b7280; line-height: 1.6; }
                      .btn { background: #dc2626; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
                      .btn:hover { background: #b91c1c; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="icon">🔥</div>
                      <h1>Fire Safety KZ</h1>
                      <p>Игры недоступны в офлайн режиме</p>
                      <p>Подключитесь к интернету для загрузки игр</p>
                      <button class="btn" onclick="window.location.reload()">Попробовать снова</button>
                    </div>
                  </body>
                </html>`,
                { 
                  headers: { 
                    'Content-Type': 'text/html; charset=utf-8' 
                  } 
                }
              );
            }
          });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
