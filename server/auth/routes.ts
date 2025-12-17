import { Express, RequestHandler } from 'express';
import passport from './strategies';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { storage } from '../storage';
import { sendVerificationCode, verifyCode, normalizePhoneNumber } from './phoneAuth';
import { z } from 'zod';

// Схемы валидации
const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  firstName: z.string().min(1, 'Укажите имя'),
  lastName: z.string().min(1, 'Укажите фамилию'),
  phone: z.string().optional()
});

const phoneAuthSchema = z.object({
  phone: z.string().min(10, 'Неверный формат номера телефона'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const verifyCodeSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'Код должен содержать 6 цифр')
});

// Middleware для проверки аутентификации
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  if (req.session && (req.session as any).user) {
    (req as any).user = (req.session as any).user;
    return next();
  }
  res.status(401).json({ message: 'Не авторизован' });
};

export function setupAuthRoutes(app: Express) {
  // Инициализация Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Локальная регистрация
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Проверяем, существует ли пользователь
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Создаем пользователя
      const user = await storage.upsertUser({
        id: crypto.randomUUID(),
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        authProvider: 'local',
        isVerified: false // Требуется подтверждение email
      });

      // Автоматически входим
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка входа после регистрации' });
        }
        res.json({ 
          message: 'Регистрация успешна',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Ошибка валидации',
          errors: error.errors 
        });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Ошибка регистрации' });
    }
  });

  // Локальный вход
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ 
      message: 'Успешный вход',
      user: req.user 
    });
  });

  // Вход через телефон - отправка SMS
  app.post('/api/auth/phone/send-code', async (req, res) => {
    try {
      const validatedData = phoneAuthSchema.parse(req.body);
      const result = await sendVerificationCode(validatedData.phone);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Ошибка валидации',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Ошибка отправки кода' });
    }
  });

  // Подтверждение SMS кода и вход
  app.post('/api/auth/phone/verify', async (req, res) => {
    try {
      const validatedData = verifyCodeSchema.parse(req.body);
      const result = verifyCode(validatedData.phone, validatedData.code);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Ищем пользователя по телефону или создаем нового
      const normalizedPhone = normalizePhoneNumber(validatedData.phone);
      let user = await storage.getUserByPhone(normalizedPhone);
      
      if (!user) {
        // Создаем нового пользователя
        user = await storage.upsertUser({
          id: crypto.randomUUID(),
          phone: normalizedPhone,
          authProvider: 'phone',
          isVerified: true,
          firstName: req.body.firstName || '',
          lastName: req.body.lastName || ''
        });
      }

      // Входим
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка входа' });
        }
        res.json({ 
          message: 'Успешный вход',
          user: {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Ошибка валидации',
          errors: error.errors 
        });
      }
      console.error('Phone verification error:', error);
      res.status(500).json({ message: 'Ошибка подтверждения кода' });
    }
  });

  // Google OAuth
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth?error=google' }),
    (req, res) => {
      res.redirect('/?success=google');
    }
  );

  // GitHub OAuth
  app.get('/api/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth?error=github' }),
    (req, res) => {
      res.redirect('/?success=github');
    }
  );

  // Получение текущего пользователя
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Не авторизован' });
    }
  });

  // Выход
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка выхода' });
      }
      res.json({ message: 'Успешный выход' });
    });
  });

  // Смена пароля
  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user as any;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Укажите текущий и новый пароль' });
      }

      // Проверяем текущий пароль
      const isValidPassword = await bcrypt.compare(currentPassword, user.password || '');
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Неверный текущий пароль' });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Обновляем пароль
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Ошибка смены пароля' });
    }
  });

  // Удаление аккаунта
  app.delete('/api/auth/account', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Удаляем пользователя и все связанные данные
      await storage.deleteUser(user.id);
      
      // Выходим из системы
      req.logout((err) => {
        if (err) {
          console.error('Logout error after account deletion:', err);
        }
        res.json({ message: 'Аккаунт успешно удален' });
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Ошибка удаления аккаунта' });
    }
  });
}