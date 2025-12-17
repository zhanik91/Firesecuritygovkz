import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum - упрощенная система ролей
export const userRoleEnum = pgEnum('user_role', ['user', 'supplier', 'moderator', 'admin']);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('user'),
  companyName: varchar("company_name"),
  phone: varchar("phone").unique(),
  password: varchar("password"), // для local авторизации
  authProvider: varchar("auth_provider").default('local'), // 'local', 'google', 'telegram'
  telegramId: varchar("telegram_id").unique(), // для Telegram авторизации
  city: varchar("city"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  isVerified: boolean("is_verified").default(false),
  bio: text("bio"),
  specializations: jsonb("specializations"), // массив специализаций
  workExperience: integer("work_experience"), // лет опыта
  serviceArea: jsonb("service_area"), // области обслуживания
  documents: jsonb("documents"), // загруженные документы/сертификаты
  isOnline: boolean("is_online").default(false),
  lastActiveAt: timestamp("last_active_at"),
  portfolioItems: jsonb("portfolio_items"), // портфолио работ
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Индексы для поиска поставщиков
  index("IDX_users_role").on(table.role),
  index("IDX_users_city").on(table.city),
  index("IDX_users_rating").on(table.rating),
  index("IDX_users_online").on(table.isOnline),
  index("IDX_users_active").on(table.isActive),
]);

// Main sections (8 main navigation items)
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subsections (3-5 per section)
export const subsections = pgTable("subsections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content types enum
export const contentTypeEnum = pgEnum('content_type', ['post', 'document', 'photo', 'video', 'presentation']);

// Ad types enum
export const adTypeEnum = pgEnum('ad_type', ['sell', 'buy', 'service', 'other']);

// Posts and articles
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsectionId: varchar("subsection_id").notNull().references(() => subsections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  contentType: contentTypeEnum("content_type").default('post'),
  authorId: varchar("author_id").references(() => users.id),
  featuredImageUrl: varchar("featured_image_url"),
  tags: text("tags").array(),
  views: integer("views").default(0),
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsectionId: varchar("subsection_id").notNull().references(() => subsections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type"),
  authorId: varchar("author_id").references(() => users.id),
  tags: text("tags").array(),
  downloads: integer("downloads").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Photo albums
export const photoAlbums = pgTable("photo_albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsectionId: varchar("subsection_id").notNull().references(() => subsections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  authorId: varchar("author_id").references(() => users.id),
  tags: text("tags").array(),
  views: integer("views").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual photos in albums
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => photoAlbums.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video items
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsectionId: varchar("subsection_id").notNull().references(() => subsections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // in seconds
  authorId: varchar("author_id").references(() => users.id),
  tags: text("tags").array(),
  views: integer("views").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Presentations
export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subsectionId: varchar("subsection_id").notNull().references(() => subsections.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  slideCount: integer("slide_count"),
  authorId: varchar("author_id").references(() => users.id),
  tags: text("tags").array(),
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace categories
export const adCategories = pgTable("ad_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace job ads
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => adCategories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetCurrency: varchar("budget_currency", { length: 3 }).default('KZT'),
  deadline: timestamp("deadline"),
  city: varchar("city"),
  region: varchar("region"), // область/регион
  type: adTypeEnum("type").default('service'), // тип объявления
  validUntil: timestamp("valid_until").default(sql`CURRENT_TIMESTAMP + INTERVAL '30 days'`), // актуально до
  isUrgent: boolean("is_urgent").default(false),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false), // для модерации
  moderationStatus: varchar("moderation_status").default('pending'), // pending, approved, rejected
  moderatedAt: timestamp("moderated_at"),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderationReason: text("moderation_reason"),
  status: varchar("status").default('open'), // open, in_progress, completed, cancelled, closed
  selectedBidId: varchar("selected_bid_id"), // выбранная заявка - без FK пока
  views: integer("views").default(0),
  bidCount: integer("bid_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Индексы для оптимизации поиска
  index("IDX_ads_category").on(table.categoryId),
  index("IDX_ads_city").on(table.city),
  index("IDX_ads_active_approved").on(table.isActive, table.isApproved),
  index("IDX_ads_status").on(table.status),
  index("IDX_ads_created_at").on(table.createdAt),
  index("IDX_ads_user_id").on(table.userId),
]);

// Bids on ads
export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").notNull().references(() => ads.id, { onDelete: 'cascade' }),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('KZT'),
  proposedDeadline: timestamp("proposed_deadline"),
  message: text("message"),
  attachments: text("attachments").array(),
  status: varchar("status").default('pending'), // pending, accepted, rejected, withdrawn
  isSelected: boolean("is_selected").default(false),
  portfolioItems: jsonb("portfolio_items"), // примеры работ в заявке
  guaranteeOffered: text("guarantee_offered"), // предлагаемые гарантии
  experienceDescription: text("experience_description"), // описание опыта
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Индексы для оптимизации запросов откликов
  index("IDX_bids_ad_id").on(table.adId),
  index("IDX_bids_supplier_id").on(table.supplierId),
  index("IDX_bids_status").on(table.status),
  index("IDX_bids_created_at").on(table.createdAt),
]);

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").references(() => ads.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  serviceQuality: integer("service_quality"), // 1-5
  communication: integer("communication"), // 1-5
  punctuality: integer("punctuality"), // 1-5
  valueForMoney: integer("value_for_money"), // 1-5
  wouldRecommend: boolean("would_recommend").default(true),
  isPublic: boolean("is_public").default(true),
  response: text("response"), // ответ на отзыв
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Индексы для оптимизации поиска отзывов
  index("IDX_reviews_reviewee_id").on(table.revieweeId),
  index("IDX_reviews_reviewer_id").on(table.reviewerId),
  index("IDX_reviews_ad_id").on(table.adId),
  index("IDX_reviews_rating").on(table.rating),
  index("IDX_reviews_public").on(table.isPublic),
]);

// Chat messages between users
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").references(() => ads.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default('text'), // text, image, file, system
  attachments: jsonb("attachments"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio items for suppliers
export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => adCategories.id),
  images: jsonb("images"), // массив URL изображений
  completionDate: timestamp("completion_date"),
  clientType: varchar("client_type"), // individual, business, government
  budget: decimal("budget", { precision: 12, scale: 2 }),
  duration: integer("duration"), // длительность в днях
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  documents: many(documents),
  photoAlbums: many(photoAlbums),
  videos: many(videos),
  presentations: many(presentations),
  ads: many(ads),
  bids: many(bids),
  notifications: many(notifications),
  chatSessions: many(chatSessions),
  portfolioItems: many(portfolioItems),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
  clientConversations: many(chatConversations, { relationName: "client" }),
  supplierConversations: many(chatConversations, { relationName: "supplier" }),
  sentMessages: many(chatMessages, { relationName: "sender" }),
}));

export const sectionsRelations = relations(sections, ({ many }) => ({
  subsections: many(subsections),
}));

export const subsectionsRelations = relations(subsections, ({ one, many }) => ({
  section: one(sections, {
    fields: [subsections.sectionId],
    references: [sections.id],
  }),
  posts: many(posts),
  documents: many(documents),
  photoAlbums: many(photoAlbums),
  videos: many(videos),
  presentations: many(presentations),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  subsection: one(subsections, {
    fields: [posts.subsectionId],
    references: [subsections.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  subsection: one(subsections, {
    fields: [documents.subsectionId],
    references: [subsections.id],
  }),
  author: one(users, {
    fields: [documents.authorId],
    references: [users.id],
  }),
}));

export const photoAlbumsRelations = relations(photoAlbums, ({ one, many }) => ({
  subsection: one(subsections, {
    fields: [photoAlbums.subsectionId],
    references: [subsections.id],
  }),
  author: one(users, {
    fields: [photoAlbums.authorId],
    references: [users.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  album: one(photoAlbums, {
    fields: [photos.albumId],
    references: [photoAlbums.id],
  }),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  subsection: one(subsections, {
    fields: [videos.subsectionId],
    references: [subsections.id],
  }),
  author: one(users, {
    fields: [videos.authorId],
    references: [users.id],
  }),
}));

export const presentationsRelations = relations(presentations, ({ one }) => ({
  subsection: one(subsections, {
    fields: [presentations.subsectionId],
    references: [subsections.id],
  }),
  author: one(users, {
    fields: [presentations.authorId],
    references: [users.id],
  }),
}));

export const adCategoriesRelations = relations(adCategories, ({ many }) => ({
  ads: many(ads),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  category: one(adCategories, {
    fields: [ads.categoryId],
    references: [adCategories.id],
  }),
  user: one(users, {
    fields: [ads.userId],
    references: [users.id],
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  ad: one(ads, {
    fields: [bids.adId],
    references: [ads.id],
  }),
  supplier: one(users, {
    fields: [bids.supplierId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  ad: one(ads, {
    fields: [reviews.adId],
    references: [ads.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  ad: one(ads, {
    fields: [chatConversations.adId],
    references: [ads.id],
  }),
  client: one(users, {
    fields: [chatConversations.clientId],
    references: [users.id],
    relationName: "client",
  }),
  supplier: one(users, {
    fields: [chatConversations.supplierId],
    references: [users.id],
    relationName: "supplier",
  }),
  messages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [conversationMessages.conversationId],
    references: [chatConversations.id],
  }),
  sender: one(users, {
    fields: [conversationMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  user: one(users, {
    fields: [portfolioItems.userId],
    references: [users.id],
  }),
  category: one(adCategories, {
    fields: [portfolioItems.categoryId],
    references: [adCategories.id],
  }),
}));

// Gamification Tables
export const playerProfiles = pgTable('player_profiles', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  title: varchar('title', { length: 100 }).default('Новичок').notNull(),
  avatar: varchar('avatar', { length: 255 }),
  specializations: text('specializations').array().default(sql`ARRAY[]::text[]`).notNull(),
  totalGamesPlayed: integer('total_games_played').default(0).notNull(),
  totalFiresExtinguished: integer('total_fires_extinguished').default(0).notNull(),
  averageAccuracy: decimal('average_accuracy', { precision: 5, scale: 2 }).default('0').notNull(),
  totalTimeSpent: integer('total_time_spent').default(0).notNull(),
  favoriteScenario: varchar('favorite_scenario', { length: 100 }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastPlayDate: timestamp('last_play_date'),
  achievements: text('achievements').array().default(sql`ARRAY[]::text[]`).notNull(),
  certificates: text('certificates').array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gameSessions = pgTable('game_sessions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scenario: varchar('scenario', { length: 100 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  score: integer('score').default(0).notNull(),
  firesExtinguished: integer('fires_extinguished').default(0).notNull(),
  accuracy: decimal('accuracy', { precision: 5, scale: 2 }).default('0').notNull(),
  timeSpent: integer('time_spent').default(0).notNull(),
  toolsUsed: text('tools_used').array().default(sql`ARRAY[]::text[]`).notNull(),
  safetyViolations: integer('safety_violations').default(0).notNull(),
  completed: boolean('completed').default(false).notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  achievementsUnlocked: text('achievements_unlocked').array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyChallenges = pgTable('daily_challenges', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  date: varchar('date', { length: 10 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  scenario: varchar('scenario', { length: 100 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  requirements: jsonb('requirements').notNull(),
  rewards: jsonb('rewards').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Gamification Relations
export const playerProfilesRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
  sessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  profile: one(playerProfiles, {
    fields: [gameSessions.userId],
    references: [playerProfiles.userId],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubsectionSchema = createInsertSchema(subsections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhotoAlbumSchema = createInsertSchema(photoAlbums).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPresentationSchema = createInsertSchema(presentations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdCategorySchema = createInsertSchema(adCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  deadline: z.string().optional().transform(val => val ? new Date(val) : undefined),
  validUntil: z.string().optional().transform(val => val ? new Date(val) : undefined),
  budget: z.union([z.string(), z.number()]).transform(String),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  proposedDeadline: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Notifications table  
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type").default('info'), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  linkUrl: varchar("link_url"), // ссылка для перехода
  adId: varchar("ad_id"), // связь с объявлением
  bidId: varchar("bid_id"), // связь с заявкой
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// AI Chat System Tables
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).default('Новый чат'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing additional data like document references
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatDocuments = pgTable("chat_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path").notNull(),
  extractedText: text("extracted_text"),
  summary: text("summary"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Chat Relations
export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
  documents: many(chatDocuments),
}));

export const aiChatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const chatDocumentsRelations = relations(chatDocuments, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatDocuments.sessionId],
    references: [chatSessions.id],
  }),
}));

// Chat Insert Schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatDocumentSchema = createInsertSchema(chatDocuments).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Subsection = typeof subsections.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatDocument = typeof chatDocuments.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type InsertChatDocument = typeof chatDocuments.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type PhotoAlbum = typeof photoAlbums.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Presentation = typeof presentations.$inferSelect;
export type AdCategory = typeof adCategories.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type InsertSubsection = z.infer<typeof insertSubsectionSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertPhotoAlbum = z.infer<typeof insertPhotoAlbumSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type InsertAdCategory = z.infer<typeof insertAdCategorySchema>;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Gamification schemas
export const insertPlayerProfileSchema = createInsertSchema(playerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlayerProfile = z.infer<typeof insertPlayerProfileSchema>;
export type SelectPlayerProfile = typeof playerProfiles.$inferSelect;

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({ id: true, createdAt: true });
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type SelectGameSession = typeof gameSessions.$inferSelect;

