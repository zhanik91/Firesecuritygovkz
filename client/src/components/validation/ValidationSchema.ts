import { z } from 'zod';

// Унифицированные схемы валидации для всего приложения

// Базовые валидаторы
export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Некорректный формат email')
  .max(255, 'Email слишком длинный');

export const phoneSchema = z
  .string()
  .regex(/^(\+7|8)[0-9]{10}$/, 'Номер телефона должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX')
  .optional()
  .or(z.literal(''));

export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя слишком длинное')
  .regex(/^[а-яёА-ЯЁa-zA-Z\s-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .max(128, 'Пароль слишком длинный')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Пароль должен содержать минимум: 1 строчную букву, 1 заглавную букву, 1 цифру и 1 специальный символ');

export const companyNameSchema = z
  .string()
  .min(2, 'Название компании должно содержать минимум 2 символа')
  .max(200, 'Название компании слишком длинное')
  .optional()
  .or(z.literal(''));

export const binIinSchema = z
  .string()
  .regex(/^[0-9]{12}$/, 'БИН/ИИН должен содержать 12 цифр')
  .optional()
  .or(z.literal(''));

export const priceSchema = z
  .number()
  .min(0, 'Цена не может быть отрицательной')
  .max(999999999, 'Цена слишком высокая')
  .or(z.string().transform((val) => {
    const num = parseFloat(val.replace(/[^\d.]/g, ''));
    if (isNaN(num)) throw new Error('Некорректный формат цены');
    return num;
  }));

// Схемы для пользователя
export const userProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companyNameSchema,
  position: z.string().max(100, 'Должность слишком длинная').optional(),
  bio: z.string().max(500, 'Описание слишком длинное').optional(),
  location: z.string().max(100, 'Адрес слишком длинный').optional()
});

export const userRegistrationSchema = userProfileSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

// Схемы для объявлений
export const adSchema = z.object({
  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200, 'Заголовок слишком длинный'),
  description: z
    .string()
    .min(20, 'Описание должно содержать минимум 20 символов')
    .max(2000, 'Описание слишком длинное'),
  type: z.enum(['offer', 'request'], {
    errorMap: () => ({ message: 'Выберите тип объявления' })
  }),
  category: z
    .string()
    .min(1, 'Выберите категорию'),
  subcategory: z
    .string()
    .optional(),
  budget: priceSchema.optional(),
  currency: z.enum(['KZT', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Выберите валюту' })
  }).default('KZT'),
  region: z
    .string()
    .min(1, 'Выберите регион'),
  city: z
    .string()
    .min(1, 'Укажите город'),
  validUntil: z
    .date()
    .min(new Date(), 'Дата не может быть в прошлом')
    .optional(),
  contactPhone: phoneSchema,
  contactEmail: emailSchema.optional(),
  urgent: z.boolean().default(false),
  tags: z.array(z.string()).max(10, 'Максимум 10 тегов').optional()
});

// Схемы для заявок
export const bidSchema = z.object({
  price: priceSchema,
  currency: z.enum(['KZT', 'USD', 'EUR']).default('KZT'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(1000, 'Описание слишком длинное'),
  deliveryTime: z
    .number()
    .min(1, 'Срок выполнения должен быть минимум 1 день')
    .max(365, 'Срок выполнения не может превышать 365 дней'),
  experience: z
    .string()
    .max(500, 'Описание опыта слишком длинное')
    .optional(),
  portfolio: z
    .string()
    .url('Некорректный URL портфолио')
    .optional()
    .or(z.literal(''))
});

// Схемы для контента
export const postSchema = z.object({
  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200, 'Заголовок слишком длинный'),
  content: z
    .string()
    .min(50, 'Содержание должно содержать минимум 50 символов')
    .max(50000, 'Содержание слишком длинное'),
  excerpt: z
    .string()
    .max(500, 'Аннотация слишком длинная')
    .optional(),
  tags: z.array(z.string()).max(10, 'Максимум 10 тегов').optional(),
  published: z.boolean().default(false)
});

// Схемы для комментариев
export const commentSchema = z.object({
  content: z
    .string()
    .min(3, 'Комментарий должен содержать минимум 3 символа')
    .max(1000, 'Комментарий слишком длинный'),
  parentId: z.string().optional()
});

// Схемы для калькуляторов
export const fireExtinguisherCalcSchema = z.object({
  area: z
    .number()
    .min(1, 'Площадь должна быть больше 0')
    .max(100000, 'Площадь слишком большая'),
  category: z.enum(['A', 'Б', 'В', 'Г', 'Д'], {
    errorMap: () => ({ message: 'Выберите категорию помещения' })
  }),
  floors: z
    .number()
    .min(1, 'Количество этажей должно быть минимум 1')
    .max(100, 'Количество этажей слишком большое'),
  hasAutoSystem: z.boolean().default(false),
  hasInternalHydrant: z.boolean().default(false)
});

export const evacuationCalcSchema = z.object({
  peopleCount: z
    .number()
    .min(1, 'Количество людей должно быть больше 0')
    .max(10000, 'Количество людей слишком большое'),
  exitWidth: z
    .number()
    .min(0.8, 'Ширина выхода должна быть минимум 0.8 м')
    .max(10, 'Ширина выхода слишком большая'),
  distance: z
    .number()
    .min(1, 'Расстояние должно быть больше 0')
    .max(500, 'Расстояние слишком большое'),
  buildingType: z.enum(['office', 'residential', 'school', 'hospital', 'retail', 'industrial'], {
    errorMap: () => ({ message: 'Выберите тип здания' })
  })
});

// Схемы для модерации
export const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'warn'], {
    errorMap: () => ({ message: 'Выберите действие' })
  }),
  reason: z
    .string()
    .min(5, 'Причина должна содержать минимум 5 символов')
    .max(500, 'Причина слишком длинная')
    .optional(),
  notifyUser: z.boolean().default(true)
});

// Схемы для поиска
export const searchSchema = z.object({
  query: z
    .string()
    .min(2, 'Поисковый запрос должен содержать минимум 2 символа')
    .max(200, 'Поисковый запрос слишком длинный'),
  category: z.string().optional(),
  region: z.string().optional(),
  priceFrom: priceSchema.optional(),
  priceTo: priceSchema.optional()
});

// Типы для TypeScript
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type Ad = z.infer<typeof adSchema>;
export type Bid = z.infer<typeof bidSchema>;
export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type FireExtinguisherCalc = z.infer<typeof fireExtinguisherCalcSchema>;
export type EvacuationCalc = z.infer<typeof evacuationCalcSchema>;
export type ModerationAction = z.infer<typeof moderationActionSchema>;
export type Search = z.infer<typeof searchSchema>;

// Сообщения об ошибках на русском языке
export const validationMessages = {
  required: 'Это поле обязательно для заполнения',
  email: 'Введите корректный email адрес',
  phone: 'Введите корректный номер телефона в формате +7XXXXXXXXXX',
  minLength: (min: number) => `Минимум ${min} символов`,
  maxLength: (max: number) => `Максимум ${max} символов`,
  numeric: 'Введите числовое значение',
  positive: 'Значение должно быть положительным',
  url: 'Введите корректный URL адрес',
  date: 'Введите корректную дату',
  futureDate: 'Дата должна быть в будущем',
  fileSize: 'Размер файла слишком большой',
  fileType: 'Неподдерживаемый тип файла'
};