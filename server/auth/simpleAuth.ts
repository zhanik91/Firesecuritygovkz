import { Express } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { z } from 'zod';

// Простые схемы валидации
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

const phoneAuthSchema = z.object({
  phone: z.string().min(10),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const verifyCodeSchema = z.object({
  phone: z.string(),
  code: z.string().length(6)
});

// Простая система верификации кодов (в продакшене использовать SMS API)
const phoneCodes = new Map<string, { code: string, expires: number, userInfo?: any }>();

// Middleware для проверки аутентификации
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Не авторизован" });
  }
  
  // Добавляем пользователя в req для совместимости
  req.user = {
    claims: {
      sub: req.session.userId
    },
    ...req.session.user
  };
  
  next();
};

export function setupSimpleAuth(app: Express) {
  // Регистрация
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Проверяем существующего пользователя
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
      }
      
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(data.password, 12);
      
      // Создаем пользователя
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        authProvider: 'local',
        isVerified: true // Для простоты сразу верифицируем
      });
      
      // Устанавливаем сессию
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      res.json({ 
        message: 'Регистрация успешна',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({ message: error.message || 'Ошибка регистрации' });
    }
  });

  // Вход
  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || !user.password) {
        return res.status(400).json({ message: 'Неверные данные' });
      }
      
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Неверные данные' });
      }
      
      // Устанавливаем сессию
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      res.json({ 
        message: 'Вход выполнен',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Ошибка входа' });
    }
  });

  // Отправка SMS кода (имитация)
  app.post('/api/auth/phone/send-code', async (req, res) => {
    try {
      const data = phoneAuthSchema.parse(req.body);
      
      // Генерируем 6-значный код
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Сохраняем код (в продакшене отправляем SMS)
      phoneCodes.set(data.phone, {
        code,
        expires: Date.now() + 5 * 60 * 1000, // 5 минут
        userInfo: {
          firstName: data.firstName,
          lastName: data.lastName
        }
      });
      
      console.log(`SMS код для ${data.phone}: ${code}`); // В продакшене убрать!
      
      res.json({ 
        message: 'Код отправлен',
        // В продакшене убрать code из ответа!
        debug_code: code // Только для разработки
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      res.status(400).json({ message: error.message || 'Ошибка отправки кода' });
    }
  });

  // Верификация SMS кода
  app.post('/api/auth/phone/verify-code', async (req, res) => {
    try {
      const data = verifyCodeSchema.parse(req.body);
      
      const phoneData = phoneCodes.get(data.phone);
      if (!phoneData) {
        return res.status(400).json({ message: 'Код не найден' });
      }
      
      if (Date.now() > phoneData.expires) {
        phoneCodes.delete(data.phone);
        return res.status(400).json({ message: 'Код истек' });
      }
      
      if (phoneData.code !== data.code) {
        return res.status(400).json({ message: 'Неверный код' });
      }
      
      // Код верный, удаляем его
      phoneCodes.delete(data.phone);
      
      // Ищем или создаем пользователя
      let user = await storage.getUserByPhone(data.phone);
      
      if (!user) {
        user = await storage.createUser({
          phone: data.phone,
          firstName: phoneData.userInfo?.firstName || 'Пользователь',
          lastName: phoneData.userInfo?.lastName || '',
          authProvider: 'phone',
          isVerified: true
        });
      }
      
      // Устанавливаем сессию
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      res.json({ 
        message: 'Вход выполнен',
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      console.error('Verify code error:', error);
      res.status(400).json({ message: error.message || 'Ошибка верификации' });
    }
  });

  // Выход
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка выхода' });
      }
      res.json({ message: 'Выход выполнен' });
    });
  });

  // Получение текущего пользователя
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Не авторизован' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authProvider: user.authProvider
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Ошибка получения пользователя' });
    }
  });

  // Middleware для проверки авторизации
  app.use('/api/auth/protected', (req, res, next) => {
    if (!(req as any).session?.userId) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }
    next();
  });
}