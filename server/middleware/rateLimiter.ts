import rateLimit from 'express-rate-limit';

// Базовый лимитер для API
export const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 минут
  max: 100, // максимум 100 запросов за 10 минут
  message: {
    error: 'Слишком много запросов, попробуйте позже'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем аутентификацию
    return req.path.startsWith('/api/auth');
  }
});

// Более строгий лимитер для создания контента
export const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 минут
  max: 20, // максимум 20 создающих операций за 10 минут
  message: {
    error: 'Слишком много операций создания, подождите немного'
  }
});

// Лимитер для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за 15 минут
  message: {
    error: 'Слишком много попыток входа, попробуйте позже'
  }
});