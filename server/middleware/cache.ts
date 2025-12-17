import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Создаем LRU кэш с TTL 60 секунд
const cache = new NodeCache({ 
  stdTTL: 60, 
  checkperiod: 120,
  maxKeys: 1000 
});

// Middleware для кэширования GET запросов
export function cacheMiddleware(ttl: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Кэшируем только GET запросы
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`Cache HIT for ${key}`);
      return res.json(cachedResponse);
    }

    // Перехватываем res.json для сохранения в кэш
    const originalJson = res.json;
    res.json = function(body) {
      cache.set(key, body, ttl);
      console.log(`Cache SET for ${key}`);
      return originalJson.call(this, body);
    };

    next();
  };
}

// Функция для инвалидации кэша по паттерну
export function invalidateCache(pattern: string) {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => {
    cache.del(key);
  });
  
  console.log(`Cache invalidated for pattern: ${pattern}, keys: ${matchingKeys.length}`);
}

// Экспорт кэша для прямого использования
export { cache };