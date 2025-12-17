import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import crypto from 'crypto';

// Настройка локальной стратегии (email/password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Пользователь не найден' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return done(null, false, { message: 'Неверный пароль' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Настройка Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Проверяем, существует ли пользователь
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Создаем нового пользователя
        user = await storage.upsertUser({
          id: `google_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value || '',
          authProvider: 'google',
          isVerified: true
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Настройка GitHub OAuth
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Проверяем, существует ли пользователь
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Создаем нового пользователя
        user = await storage.upsertUser({
          id: `github_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          firstName: profile.displayName?.split(' ')[0] || '',
          lastName: profile.displayName?.split(' ')[1] || '',
          profileImageUrl: profile.photos?.[0]?.value || '',
          authProvider: 'github',
          isVerified: true
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Сериализация пользователя
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Десериализация пользователя
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;