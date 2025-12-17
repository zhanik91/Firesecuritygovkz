import {
  users,
  sections,
  subsections,
  posts,
  documents,
  photoAlbums,
  photos,
  videos,
  presentations,
  adCategories,
  ads,
  bids,
  reviews,
  notifications,
  chatSessions,
  chatMessages,
  chatDocuments,
  type User,
  type UpsertUser,
  type Section,
  type Subsection,
  type Post,
  type Document,
  type PhotoAlbum,
  type Photo,
  type Video,
  type Presentation,
  type AdCategory,
  type Ad,
  type Bid,
  type Review,
  type InsertSection,
  type InsertSubsection,
  type InsertPost,
  type InsertDocument,
  type InsertPhotoAlbum,
  type InsertPhoto,
  type InsertVideo,
  type InsertPresentation,
  type InsertAdCategory,
  type InsertAd,
  type InsertBid,
  type InsertReview,
  type Notification,
  type InsertNotification,
  type ChatSession,
  type ChatMessage,
  type ChatDocument,
  type InsertChatSession,
  type InsertChatMessage,
  type InsertChatDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, like, ilike, count, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Section operations
  getSections(): Promise<Section[]>;
  getSection(slug: string): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: string, section: Partial<InsertSection>): Promise<Section>;
  deleteSection(id: string): Promise<void>;

  // Subsection operations
  getSubsections(sectionId?: string): Promise<Subsection[]>;
  getSubsection(slug: string): Promise<Subsection | undefined>;
  createSubsection(subsection: InsertSubsection): Promise<Subsection>;
  updateSubsection(id: string, subsection: Partial<InsertSubsection>): Promise<Subsection>;
  deleteSubsection(id: string): Promise<void>;

  // Post operations
  getPosts(subsectionId?: string, limit?: number, offset?: number): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  getFeaturedPosts(limit?: number): Promise<Post[]>;
  getPopularPosts(limit?: number): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  incrementPostViews(id: string): Promise<void>;
  searchPosts(query: string, limit?: number): Promise<Post[]>;

  // Document operations
  getDocuments(subsectionId?: string, limit?: number): Promise<Document[]>;
  getDocument(slug: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  incrementDocumentDownloads(id: string): Promise<void>;

  // Photo album operations
  getPhotoAlbums(subsectionId?: string, limit?: number): Promise<PhotoAlbum[]>;
  getPhotoAlbum(slug: string): Promise<PhotoAlbum | undefined>;
  getPhotosInAlbum(albumId: string): Promise<Photo[]>;
  createPhotoAlbum(album: InsertPhotoAlbum): Promise<PhotoAlbum>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoAlbum(id: string, album: Partial<InsertPhotoAlbum>): Promise<PhotoAlbum>;
  deletePhotoAlbum(id: string): Promise<void>;

  // Video operations
  getVideos(subsectionId?: string, limit?: number): Promise<Video[]>;
  getVideo(slug: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  incrementVideoViews(id: string): Promise<void>;

  // Presentation operations
  getPresentations(subsectionId?: string, limit?: number): Promise<Presentation[]>;
  getPresentation(slug: string): Promise<Presentation | undefined>;
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  updatePresentation(id: string, presentation: Partial<InsertPresentation>): Promise<Presentation>;
  deletePresentation(id: string): Promise<void>;
  incrementPresentationViews(id: string): Promise<void>;

  // Marketplace operations
  getAdCategories(): Promise<AdCategory[]>;
  getAdCategoryById(id: string): Promise<AdCategory | undefined>;
  createAdCategory(category: InsertAdCategory): Promise<AdCategory>;
  updateAdCategory(id: string, category: Partial<InsertAdCategory>): Promise<AdCategory>;
  deleteAdCategory(id: string): Promise<void>;
  getAds(categoryId?: string, city?: string, limit?: number, offset?: number): Promise<Ad[]>;
  getAd(slug: string): Promise<Ad | undefined>;
  getAdById(id: string): Promise<Ad | undefined>;
  getUserAds(userId: string): Promise<Ad[]>;
  getAllAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad>;
  deleteAd(id: string): Promise<void>;
  incrementAdViews(id: string): Promise<void>;
  closeAd(id: string): Promise<void>;

  // Bid operations
  getBids(adId: string): Promise<Bid[]>;
  getBidById(id: string): Promise<Bid | undefined>;
  getUserBids(userId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: string, bid: Partial<InsertBid>): Promise<Bid>;
  deleteBid(id: string): Promise<void>;
  acceptBid(bidId: string, adId: string): Promise<void>;
  rejectBid(bidId: string): Promise<void>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;

  // Media operations
  getAllMedia(): Promise<any[]>;
  createMedia(media: any): Promise<any>;
  deleteMedia(id: string): Promise<void>;

  // Analytics operations
  getAnalytics(): Promise<any>;

  // System settings
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settings: any): Promise<any>;

  // Search operations
  globalSearch(query: string): Promise<any[]>;

  // Enhanced notification operations
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<void>;

  // AI Chat operations
  getChatSessions(userId?: string): Promise<ChatSession[]>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession>;
  deleteChatSession(id: string): Promise<void>;

  // Enhanced Marketplace operations
  getMarketplaceAds(options: any): Promise<any[]>;
  getSuppliers(options: any): Promise<any[]>;
  incrementAdBidCount(adId: string): Promise<void>;
  createReview(reviewData: any): Promise<any>;
  updateUserRating(userId: string): Promise<void>;

  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessage(id: string): Promise<void>;

  getChatDocuments(sessionId: string): Promise<ChatDocument[]>;
  createChatDocument(document: InsertChatDocument): Promise<ChatDocument>;
  deleteChatDocument(id: string): Promise<void>;

  // Admin operations
  getAdminStats(): Promise<{
    users: number;
    posts: number;
    ads: number;
    bids: number;
  }>;

  // Moderation operations
  getAdsForModeration(): Promise<Ad[]>;
  approveAd(id: string, moderatorId: string): Promise<void>;
  rejectAd(id: string, moderatorId: string, reason?: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateUserActiveStatus(id: string, isActive: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [newUser] = await db.insert(users).values({
      id: userData.id || sql`gen_random_uuid()`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      password: userData.password,
      authProvider: userData.authProvider || 'local',
      isVerified: userData.isVerified || false,
      telegramId: userData.telegramId,
      role: userData.role || 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Упрощенный метод без сложных условий where
    try {
      const [newUser] = await db.insert(users).values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: 'user',
        isActive: true,
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        }
      }).returning();

      return newUser;
    } catch (error) {
      console.error('Error in upsertUser:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(userId: string, updateData: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Section operations
  async getSections(): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.isActive, true)).orderBy(sections.order);
  }

  async getSection(slug: string): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(and(eq(sections.slug, slug), eq(sections.isActive, true)));
    return section;
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db.insert(sections).values(section).returning();
    return newSection;
  }

  async updateSection(id: string, section: Partial<InsertSection>): Promise<Section> {
    const [updatedSection] = await db
      .update(sections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }

  // Subsection operations
  async getSubsections(sectionId?: string): Promise<Subsection[]> {
    if (sectionId) {
      return await db
        .select()
        .from(subsections)
        .where(and(eq(subsections.sectionId, sectionId), eq(subsections.isActive, true)))
        .orderBy(subsections.order);
    }
    return await db
      .select()
      .from(subsections)
      .where(eq(subsections.isActive, true))
      .orderBy(subsections.order);
  }

  async getSubsection(slug: string): Promise<Subsection | undefined> {
    const [subsection] = await db.select().from(subsections).where(and(eq(subsections.slug, slug), eq(subsections.isActive, true)));
    return subsection;
  }

  async createSubsection(subsection: InsertSubsection): Promise<Subsection> {
    const [newSubsection] = await db.insert(subsections).values(subsection).returning();
    return newSubsection;
  }

  async updateSubsection(id: string, subsection: Partial<InsertSubsection>): Promise<Subsection> {
    const [updatedSubsection] = await db
      .update(subsections)
      .set({ ...subsection, updatedAt: new Date() })
      .where(eq(subsections.id, id))
      .returning();
    return updatedSubsection;
  }

  async deleteSubsection(id: string): Promise<void> {
    await db.delete(subsections).where(eq(subsections.id, id));
  }

  // Post operations
  async getPosts(subsectionId?: string, limit = 20, offset = 0): Promise<Post[]> {
    if (subsectionId) {
      return await db
        .select()
        .from(posts)
        .where(and(eq(posts.subsectionId, subsectionId), eq(posts.isPublished, true)))
        .orderBy(desc(posts.publishedAt))
        .limit(limit)
        .offset(offset);
    }
    return await db
      .select()
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getPost(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.isPublished, true)));
    return post;
  }

  async getFeaturedPosts(limit = 5): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(eq(posts.isFeatured, true), eq(posts.isPublished, true)))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  }

  async getPopularPosts(limit = 5): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.views))
      .limit(limit);
  }

  async getAllPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async incrementPostViews(id: string): Promise<void> {
    await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.isPublished, true),
          sql`(${posts.title} ILIKE ${'%' + query + '%'} OR ${posts.content} ILIKE ${'%' + query + '%'})`
        )
      )
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  }

  // Document operations
  async getDocuments(subsectionId?: string, limit = 20): Promise<Document[]> {
    if (subsectionId) {
      return await db
        .select()
        .from(documents)
        .where(and(eq(documents.subsectionId, subsectionId), eq(documents.isPublished, true)))
        .orderBy(desc(documents.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(documents)
      .where(eq(documents.isPublished, true))
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }

  async getDocument(slug: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(and(eq(documents.slug, slug), eq(documents.isPublished, true)));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Enhanced Marketplace Methods
  async getMarketplaceAds(options: {
    where?: any;
    orderBy?: any;
    search?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = db.select()
        .from(ads)
        .leftJoin(adCategories, eq(ads.categoryId, adCategories.id))
        .leftJoin(users, eq(ads.userId, users.id));

      const conditions: any[] = [eq(ads.isActive, true)];

      if (options.where) {
        conditions.push(...Object.entries(options.where).map(([key, value]) =>
          eq((ads as any)[key], value)
        ));
      }

      if (options.search) {
        conditions.push(or(
          ilike(ads.title, `%${options.search}%`),
          ilike(ads.description, `%${options.search}%`)
        ));
      }

      if (options.orderBy) {
        query = query.orderBy(options.orderBy);
      }

      query = query.where(and(...conditions));

      const results = await query.limit(options.limit || 50);

      return results;
    } catch (error) {
      console.error('Error fetching marketplace ads:', error);
      return [];
    }
  }

  async getSuppliers(options: {
    where?: any;
    orderBy?: any;
    search?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      let query = db
        .select()
        .from(users)
        .where(and(
          eq(users.role, 'supplier'),
          eq(users.isActive, true),
          options.where?.city ? eq(users.city, options.where.city) : undefined
        ))
        .limit(options.limit || 50);

      if (options.orderBy?.rating) {
        query = query.orderBy(options.orderBy.rating === 'desc' ? desc(users.rating) : asc(users.rating));
      } else if (options.orderBy?.workExperience) {
        query = query.orderBy(options.orderBy.workExperience === 'desc' ? desc(users.workExperience) : asc(users.workExperience));
      } else if (options.orderBy?.reviewCount) {
        query = query.orderBy(options.orderBy.reviewCount === 'desc' ? desc(users.reviewCount) : asc(users.reviewCount));
      } else {
        query = query.orderBy(desc(users.createdAt));
      }

      const results = await query;

      if (options.search) {
        return results.filter(supplier =>
          supplier.firstName?.toLowerCase().includes(options.search.toLowerCase()) ||
          supplier.lastName?.toLowerCase().includes(options.search.toLowerCase()) ||
          supplier.companyName?.toLowerCase().includes(options.search.toLowerCase()) ||
          supplier.specializations?.some((spec: string) =>
            spec.toLowerCase().includes(options.search.toLowerCase())
          )
        );
      }

      return results;
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw error;
    }
  }

  async incrementAdBidCount(adId: string): Promise<void> {
    await db.update(ads)
      .set({ bidCount: sql`${ads.bidCount} + 1` })
      .where(eq(ads.id, adId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async updateUserRating(userId: string): Promise<void> {
    // Пересчитываем средний рейтинг пользователя
    const result = await db.select({
      avgRating: sql<number>`AVG(${reviews.rating})`,
      reviewCount: count(reviews.id)
    })
      .from(reviews)
      .where(eq(reviews.revieweeId, userId));

    if (result[0]) {
      await db.update(users)
        .set({
          rating: result[0].avgRating ? result[0].avgRating.toFixed(2) : "0.00",
          reviewCount: result[0].reviewCount
        })
        .where(eq(users.id, userId));
    }
  }

  async incrementDocumentDownloads(id: string): Promise<void> {
    await db.update(documents).set({ downloads: sql`${documents.downloads} + 1` }).where(eq(documents.id, id));
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));
  }

  // Photo album operations
  async getPhotoAlbums(subsectionId?: string, limit = 20): Promise<PhotoAlbum[]> {
    if (subsectionId) {
      return await db
        .select()
        .from(photoAlbums)
        .where(and(eq(photoAlbums.subsectionId, subsectionId), eq(photoAlbums.isPublished, true)))
        .orderBy(desc(photoAlbums.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(photoAlbums)
      .where(eq(photoAlbums.isPublished, true))
      .orderBy(desc(photoAlbums.createdAt))
      .limit(limit);
  }

  async getPhotoAlbum(slug: string): Promise<PhotoAlbum | undefined> {
    const [album] = await db.select().from(photoAlbums).where(and(eq(photoAlbums.slug, slug), eq(photoAlbums.isPublished, true)));
    return album;
  }

  async getPhotosInAlbum(albumId: string): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.albumId, albumId)).orderBy(photos.order);
  }

  async createPhotoAlbum(album: InsertPhotoAlbum): Promise<PhotoAlbum> {
    const [newAlbum] = await db.insert(photoAlbums).values(album).returning();
    return newAlbum;
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async updatePhotoAlbum(id: string, album: Partial<InsertPhotoAlbum>): Promise<PhotoAlbum> {
    const [updatedAlbum] = await db
      .update(photoAlbums)
      .set({ ...album, updatedAt: new Date() })
      .where(eq(photoAlbums.id, id))
      .returning();
    return updatedAlbum;
  }

  async deletePhotoAlbum(id: string): Promise<void> {
    await db.delete(photoAlbums).where(eq(photoAlbums.id, id));
  }

  // Video operations
  async getVideos(subsectionId?: string, limit = 20): Promise<Video[]> {
    if (subsectionId) {
      return await db
        .select()
        .from(videos)
        .where(and(eq(videos.subsectionId, subsectionId), eq(videos.isPublished, true)))
        .orderBy(desc(videos.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }

  async getVideo(slug: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(and(eq(videos.slug, slug), eq(videos.isPublished, true)));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async incrementVideoViews(id: string): Promise<void> {
    await db.update(videos).set({ views: sql`${videos.views} + 1` }).where(eq(videos.id, id));
  }

  // Presentation operations
  async getPresentations(subsectionId?: string, limit = 20): Promise<Presentation[]> {
    if (subsectionId) {
      return await db
        .select()
        .from(presentations)
        .where(and(eq(presentations.subsectionId, subsectionId), eq(presentations.isPublished, true)))
        .orderBy(desc(presentations.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(presentations)
      .where(eq(presentations.isPublished, true))
      .orderBy(desc(presentations.createdAt))
      .limit(limit);
  }

  async getPresentation(slug: string): Promise<Presentation | undefined> {
    const [presentation] = await db.select().from(presentations).where(and(eq(presentations.slug, slug), eq(presentations.isPublished, true)));
    return presentation;
  }

  async createPresentation(presentation: InsertPresentation): Promise<Presentation> {
    const [newPresentation] = await db.insert(presentations).values(presentation).returning();
    return newPresentation;
  }

  async updatePresentation(id: string, presentation: Partial<InsertPresentation>): Promise<Presentation> {
    const [updatedPresentation] = await db
      .update(presentations)
      .set({ ...presentation, updatedAt: new Date() })
      .where(eq(presentations.id, id))
      .returning();
    return updatedPresentation;
  }

  async deletePresentation(id: string): Promise<void> {
    await db.delete(presentations).where(eq(presentations.id, id));
  }

  async incrementPresentationViews(id: string): Promise<void> {
    await db.update(presentations).set({ views: sql`${presentations.views} + 1` }).where(eq(presentations.id, id));
  }

  // Marketplace operations
  async getAdCategories(): Promise<AdCategory[]> {
    return await db.select().from(adCategories).where(eq(adCategories.isActive, true)).orderBy(adCategories.order);
  }

  async getAdCategoryById(id: string): Promise<AdCategory | undefined> {
    const [category] = await db.select().from(adCategories).where(eq(adCategories.id, id));
    return category;
  }

  async createAdCategory(category: InsertAdCategory): Promise<AdCategory> {
    const [newCategory] = await db.insert(adCategories).values(category).returning();
    return newCategory;
  }

  async updateAdCategory(id: string, category: Partial<InsertAdCategory>): Promise<AdCategory> {
    const [updatedCategory] = await db
      .update(adCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(adCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteAdCategory(id: string): Promise<void> {
    await db.delete(adCategories).where(eq(adCategories.id, id));
  }

  async getAds(categoryId?: string, city?: string, limit = 20, offset = 0): Promise<Ad[]> {
    let conditions = [eq(ads.isActive, true)];

    if (categoryId) {
      conditions.push(eq(ads.categoryId, categoryId));
    }

    if (city) {
      conditions.push(eq(ads.city, city));
    }

    return await db
      .select()
      .from(ads)
      .where(and(...conditions))
      .orderBy(desc(ads.isUrgent), desc(ads.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAd(slug: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(and(eq(ads.slug, slug), eq(ads.isActive, true)));
    return ad;
  }

  async getUserAds(userId: string): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.userId, userId)).orderBy(desc(ads.createdAt));
  }

  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const [newAd] = await db.insert(ads).values(ad).returning();
    return newAd;
  }

  async updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad> {
    const [updatedAd] = await db
      .update(ads)
      .set({ ...ad, updatedAt: new Date() })
      .where(eq(ads.id, id))
      .returning();
    return updatedAd;
  }

  async deleteAd(id: string): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  async incrementAdViews(id: string): Promise<void> {
    await db.update(ads).set({ views: sql`${ads.views} + 1` }).where(eq(ads.id, id));
  }

  async getAdById(id: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async closeAd(id: string): Promise<void> {
    await db.update(ads).set({ status: 'closed' }).where(eq(ads.id, id));
  }

  // Bid operations
  async getBids(adId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.adId, adId)).orderBy(bids.amount);
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.supplierId, userId)).orderBy(desc(bids.createdAt));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();

    // Update bid count on ad
    await db.update(ads).set({ bidCount: sql`${ads.bidCount} + 1` }).where(eq(ads.id, bid.adId));

    return newBid;
  }

  async updateBid(id: string, bid: Partial<InsertBid>): Promise<Bid> {
    const [updatedBid] = await db
      .update(bids)
      .set({ ...bid, updatedAt: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async deleteBid(id: string): Promise<void> {
    // Get the bid to update ad bid count
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    if (bid) {
      await db.update(ads).set({ bidCount: sql`${ads.bidCount} - 1` }).where(eq(ads.id, bid.adId));
    }

    await db.delete(bids).where(eq(bids.id, id));
  }

  async getBidById(id: string): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async acceptBid(bidId: string, adId: string): Promise<void> {
    // Принимаем заявку
    await db.update(bids).set({ status: 'accepted', isSelected: true }).where(eq(bids.id, bidId));

    // Закрываем объявление и устанавливаем выбранную заявку
    await db.update(ads).set({
      status: 'completed',
      selectedBidId: bidId
    }).where(eq(ads.id, adId));

    // Отклоняем остальные заявки
    await db.update(bids).set({ status: 'rejected' }).where(
      and(eq(bids.adId, adId), sql`${bids.id} != ${bidId}`)
    );
  }

  async rejectBid(bidId: string): Promise<void> {
    await db.update(bids).set({ status: 'rejected' }).where(eq(bids.id, bidId));
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Media operations
  async getAllMedia(): Promise<any[]> {
    // Mock implementation for now - в реальной версии будет таблица media
    return [
      {
        id: '1',
        fileName: 'demo-image.jpg',
        fileUrl: '/uploads/demo-image.jpg',
        fileSize: 1024000,
        fileType: 'image/jpeg',
        uploadedBy: 'admin',
        createdAt: new Date()
      }
    ];
  }

  async createMedia(media: any): Promise<any> {
    // Mock implementation for now - в реальной версии будет таблица media
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...media,
      createdAt: new Date()
    };
  }

  async deleteMedia(id: string): Promise<void> {
    // Mock implementation for now - в реальной версии будет таблица media
    console.log(`Mock: Deleting media with id ${id}`);
  }

  // Analytics operations
  async getAnalytics(): Promise<any> {
    // Get real stats from database
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [postsCount] = await db.select({ count: count() }).from(posts);
    const [documentsCount] = await db.select({ count: count() }).from(documents);
    const [adsCount] = await db.select({ count: count() }).from(ads);
    const [bidsCount] = await db.select({ count: count() }).from(bids);

    return {
      users: {
        total: usersCount.count,
        admins: await db.select({ count: count() }).from(users).where(eq(users.role, 'admin')).then(r => r[0].count),
        suppliers: await db.select({ count: count() }).from(users).where(eq(users.role, 'supplier')).then(r => r[0].count),
        regular: await db.select({ count: count() }).from(users).where(eq(users.role, 'user')).then(r => r[0].count)
      },
      content: {
        posts: postsCount.count,
        documents: documentsCount.count,
        publishedPosts: await db.select({ count: count() }).from(posts).where(eq(posts.isPublished, true)).then(r => r[0].count),
        draftPosts: await db.select({ count: count() }).from(posts).where(eq(posts.isPublished, false)).then(r => r[0].count)
      },
      marketplace: {
        ads: adsCount.count,
        bids: bidsCount.count,
        activeAds: await db.select({ count: count() }).from(ads).where(eq(ads.isActive, true)).then(r => r[0].count),
        urgentAds: await db.select({ count: count() }).from(ads).where(eq(ads.isUrgent, true)).then(r => r[0].count)
      },
      views: {
        totalPostViews: await db.select({ sum: sql`sum(${posts.views})` }).from(posts).then(r => r[0].sum || 0),
        totalAdViews: await db.select({ sum: sql`sum(${ads.views})` }).from(ads).then(r => r[0].sum || 0)
      }
    };
  }

  // System settings
  async getSystemSettings(): Promise<any> {
    // Mock implementation for now - в реальной версии будет таблица settings
    return {
      siteName: 'Fire SafetyKZ',
      siteDescription: 'Казахстанский портал пожарной безопасности',
      adminEmail: 'admin@firesafety.kz',
      maintenanceMode: false,
      registrationEnabled: true,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      moderationRequired: true,
      autoPublish: false,
      backupFrequency: 'daily',
      systemVersion: '1.0.0',
      lastBackup: new Date().toISOString()
    };
  }

  async updateSystemSettings(settings: any): Promise<any> {
    // Mock implementation for now - в реальной версии будет таблица settings
    console.log('Mock: Updating system settings', settings);
    return {
      ...await this.getSystemSettings(),
      ...settings,
      updatedAt: new Date().toISOString()
    };
  }

  // Search operations
  async globalSearch(query: string): Promise<any[]> {
    const searchTerm = `%${query}%`;

    // Search in posts
    const postResults = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.content,
        type: sql`'post'`,
        url: sql`'/posts/' || ${posts.slug}`
      })
      .from(posts)
      .where(
        and(
          eq(posts.isPublished, true),
          sql`(${posts.title} ILIKE ${searchTerm} OR ${posts.content} ILIKE ${searchTerm})`
        )
      )
      .limit(5);

    // Search in documents
    const documentResults = await db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        type: sql`'document'`,
        url: sql`'/documents/' || ${documents.slug}`
      })
      .from(documents)
      .where(
        and(
          eq(documents.isPublished, true),
          sql`(${documents.title} ILIKE ${searchTerm} OR ${documents.description} ILIKE ${searchTerm})`
        )
      )
      .limit(5);

    // Search in ads
    const adResults = await db
      .select({
        id: ads.id,
        title: ads.title,
        description: ads.description,
        type: sql`'ad'`,
        url: sql`'/marketplace/' || ${ads.slug}`
      })
      .from(ads)
      .where(
        and(
          eq(ads.isActive, true),
          sql`(${ads.title} ILIKE ${searchTerm} OR ${ads.description} ILIKE ${searchTerm})`
        )
      )
      .limit(5);

    // Search in sections
    const sectionResults = await db
      .select({
        id: sections.id,
        title: sections.title,
        description: sections.description,
        type: sql`'section'`,
        url: sql`'/sections/' || ${sections.slug}`
      })
      .from(sections)
      .where(
        and(
          eq(sections.isActive, true),
          sql`(${sections.title} ILIKE ${searchTerm} OR ${sections.description} ILIKE ${searchTerm})`
        )
      )
      .limit(3);

    return [...postResults, ...documentResults, ...adResults, ...sectionResults];
  }

  // Enhanced notification operations  
  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // AI Chat operations
  async getChatSessions(userId?: string): Promise<ChatSession[]> {
    if (userId) {
      return await db
        .select()
        .from(chatSessions)
        .where(and(eq(chatSessions.userId, userId), eq(chatSessions.isActive, true)))
        .orderBy(desc(chatSessions.updatedAt));
    }
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.isActive, true))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.isActive, true)));
    return session;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set({ ...session, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteChatSession(id: string): Promise<void> {
    await db.update(chatSessions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(chatSessions.id, id));
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async deleteChatMessage(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  async getChatDocuments(sessionId: string): Promise<ChatDocument[]> {
    return await db
      .select()
      .from(chatDocuments)
      .where(eq(chatDocuments.sessionId, sessionId))
      .orderBy(desc(chatDocuments.uploadedAt));
  }

  async createChatDocument(document: InsertChatDocument): Promise<ChatDocument> {
    const [newDocument] = await db.insert(chatDocuments).values(document).returning();
    return newDocument;
  }

  async deleteChatDocument(id: string): Promise<void> {
    await db.delete(chatDocuments).where(eq(chatDocuments.id, id));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    users: number;
    posts: number;
    ads: number;
    bids: number;
  }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [postsCount] = await db.select({ count: count() }).from(posts);
    const [adsCount] = await db.select({ count: count() }).from(ads);
    const [bidsCount] = await db.select({ count: count() }).from(bids);

    return {
      users: usersCount.count,
      posts: postsCount.count,
      ads: adsCount.count,
      bids: bidsCount.count,
    };
  }

  // Moderation operations
  async getAdsForModeration(): Promise<Ad[]> {
    return await db
      .select()
      .from(ads)
      .where(eq(ads.moderationStatus, 'pending'))
      .orderBy(desc(ads.createdAt));
  }

  async approveAd(id: string, moderatorId: string): Promise<void> {
    await db
      .update(ads)
      .set({
        moderationStatus: 'approved',
        moderatedAt: new Date(),
        moderatedBy: moderatorId,
        updatedAt: new Date()
      })
      .where(eq(ads.id, id));
  }

  async rejectAd(id: string, moderatorId: string, reason?: string): Promise<void> {
    await db
      .update(ads)
      .set({
        moderationStatus: 'rejected',
        moderatedAt: new Date(),
        moderatedBy: moderatorId,
        moderationReason: reason,
        updatedAt: new Date()
      })
      .where(eq(ads.id, id));
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserActiveStatus(id: string, isActive: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();