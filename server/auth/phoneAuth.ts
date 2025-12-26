// Система аутентификации по телефону через SMS
import crypto from 'crypto';

interface VerificationCode {
  code: string;
  phone: string;
  expiresAt: Date;
  attempts: number;
}

// В продакшене использовать Redis или базу данных
const verificationCodes = new Map<string, VerificationCode>();

// Функция для отправки SMS (интеграция с SMS-провайдером)
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // В продакшене здесь должна быть интеграция с SMS-провайдером
  // Например: Twilio, MessageBird, или казахстанские провайдеры типа РКСС
  
  console.log(`SMS to ${phone}: ${message}`);
  
  // Симуляция отправки SMS
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}

// Генерация случайного 6-значного кода
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода подтверждения
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    // Нормализуем номер телефона
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!isValidPhoneNumber(normalizedPhone)) {
      return { success: false, message: 'Неверный формат номера телефона' };
    }

    // Проверяем ограничения по частоте отправки
    const existingCode = verificationCodes.get(normalizedPhone);
    if (existingCode && existingCode.expiresAt > new Date()) {
      const timeLeft = Math.ceil((existingCode.expiresAt.getTime() - Date.now()) / 1000);
      if (timeLeft > 240) { // Если осталось больше 4 минут
        return { success: false, message: `Повторная отправка доступна через ${timeLeft} секунд` };
      }
    }

    // Генерируем новый код
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Сохраняем код
    verificationCodes.set(normalizedPhone, {
      code,
      phone: normalizedPhone,
      expiresAt,
      attempts: 0
    });

    // Отправляем SMS
    const message = `Ваш код подтверждения FireSafety KZ: ${code}. Код действует 5 минут.`;
    const sent = await sendSMS(normalizedPhone, message);

    if (sent) {
      return { success: true, message: 'Код отправлен на ваш телефон' };
    } else {
      return { success: false, message: 'Ошибка отправки SMS. Попробуйте позже.' };
    }
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, message: 'Внутренняя ошибка сервера' };
  }
}

// Проверка кода подтверждения
export function verifyCode(phone: string, inputCode: string): { success: boolean; message: string } {
  const normalizedPhone = normalizePhoneNumber(phone);
  const storedCode = verificationCodes.get(normalizedPhone);

  if (!storedCode) {
    return { success: false, message: 'Код не найден. Запросите новый код.' };
  }

  if (storedCode.expiresAt < new Date()) {
    verificationCodes.delete(normalizedPhone);
    return { success: false, message: 'Код истек. Запросите новый код.' };
  }

  if (storedCode.attempts >= 3) {
    verificationCodes.delete(normalizedPhone);
    return { success: false, message: 'Превышено количество попыток. Запросите новый код.' };
  }

  storedCode.attempts++;

  if (storedCode.code !== inputCode) {
    return { success: false, message: 'Неверный код. Попробуйте еще раз.' };
  }

  // Успешная верификация
  verificationCodes.delete(normalizedPhone);
  return { success: true, message: 'Номер телефона подтвержден' };
}

// Нормализация номера телефона
export function normalizePhoneNumber(phone: string): string {
  // Удаляем все символы кроме цифр
  let cleaned = phone.replace(/\D/g, '');
  
  // Если номер начинается с 8, заменяем на 7
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    cleaned = '7' + cleaned.slice(1);
  }
  
  // Если номер не начинается с 7, добавляем 7
  if (!cleaned.startsWith('7') && cleaned.length === 10) {
    cleaned = '7' + cleaned;
  }
  
  return cleaned;
}

// Валидация номера телефона (казахстанские номера)
export function isValidPhoneNumber(phone: string): boolean {
  const kazakhPatterns = [
    /^7701\d{7}$/, // Kcell
    /^7702\d{7}$/, // Kcell
    /^7705\d{7}$/, // Kcell
    /^7707\d{7}$/, // Kcell
    /^7708\d{7}$/, // Kcell
    /^7771\d{7}$/, // Beeline
    /^7775\d{7}$/, // Beeline
    /^7776\d{7}$/, // Beeline
    /^7777\d{7}$/, // Beeline
    /^7778\d{7}$/, // Beeline
    /^7700\d{7}$/, // Altel
    /^7703\d{7}$/, // Altel
    /^7709\d{7}$/, // Altel
    /^7747\d{7}$/, // Altel
  ];
  
  return kazakhPatterns.some(pattern => pattern.test(phone));
}

// Очистка истекших кодов (запускать периодически)
export function cleanupExpiredCodes(): void {
  const now = new Date();
  for (const [phone, codeData] of Array.from(verificationCodes.entries())) {
    if (codeData.expiresAt < now) {
      verificationCodes.delete(phone);
    }
  }
}

// Запускаем очистку каждые 10 минут
setInterval(cleanupExpiredCodes, 10 * 60 * 1000);