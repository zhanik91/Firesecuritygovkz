import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { setupAuthRoutes, requireAuth } from "./auth/routes";
import { setupSimpleAuth } from "./auth/simpleAuth";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { insertPostSchema, insertDocumentSchema, insertAdSchema, insertBidSchema, insertSectionSchema, insertSubsectionSchema, insertNotificationSchema } from "@shared/schema";
import { cacheMiddleware, invalidateCache } from "./middleware/cache";
import { apiLimiter, createLimiter, authLimiter } from "./middleware/rateLimiter";
import { setupModerationRoutes } from "./routes/moderation";
import { registerChatRoutes } from "./routes/chat";
import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import { wsManager } from "./websocket";

// Create cache instance
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const OAUTH = {
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  authUrl: process.env.OAUTH_AUTH_URL!,
  tokenUrl: process.env.OAUTH_TOKEN_URL!,
  redirectUri: process.env.OAUTH_REDIRECT_URI!,
  scope: process.env.OAUTH_SCOPE || "read:user user:email",
};


// Role-based middleware система
const requireRole = (allowedRoles: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Требуется авторизация" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user || !allowedRoles.includes(user.role || 'user')) {
        return res.status(403).json({ 
          message: "Недостаточно прав доступа",
          required: allowedRoles,
          current: user?.role || 'none'
        });
      }

      req.currentUser = user;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({ message: "Ошибка проверки прав" });
    }
  };
};

// Специальные middleware для каждой роли
const requireSupplier = requireRole(['supplier', 'moderator', 'admin']);
const requireModerator = requireRole(['moderator', 'admin']);
const requireAdmin = requireRole(['admin']);

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|mp4|avi|mov|wmv|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Статическая раздача игровых файлов
  app.use('/games', express.static('games', {
    maxAge: '1d', // Кэширование на 1 день
    etag: true,
    lastModified: true
  }));

  // Session setup for simple auth
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: 7 * 24 * 60 * 60 * 1000, // 1 week
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  // Setup simple auth routes (новая система)
  setupSimpleAuth(app);

  // Import gamification routes
  const gamificationRoutes = await import('./routes/gamification');
  app.use('/api/gamification', gamificationRoutes.default);
  // --- GitHub OAuth ---
  app.get("/auth/github", (_req, res) => {
    const params = new URLSearchParams({
      client_id: OAUTH.clientId,
      redirect_uri: OAUTH.redirectUri,
      scope: OAUTH.scope,
      allow_signup: "true",
    });
    res.redirect(`${OAUTH.authUrl}?${params.toString()}`);
  });

  app.get("/auth/github/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    if (!code) return res.status(400).send("No code from GitHub");

    const resp = await fetch(OAUTH.tokenUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: OAUTH.clientId,
        client_secret: OAUTH.clientSecret,
        code,
        redirect_uri: OAUTH.redirectUri,
      }),
    });

    const token = await resp.json(); // { access_token, token_type, scope, ... }
    return res.send(`<pre>${JSON.stringify(token, null, 2)}</pre>`);
  });
  // --- /GitHub OAuth ---


  // Применяем rate limiting ко всем API роутам
  app.use('/api', apiLimiter);
  app.use('/api/auth', authLimiter);

  // Note: /api/auth/user route is now handled in setupSimpleAuth

  // Admin routes
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin stats endpoint
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const posts = await storage.getAllPosts();
      const ads = await storage.getAllAds();
      const documents = await storage.getAllDocuments();

      const stats = {
        users: {
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          suppliers: users.filter(u => u.role === 'supplier').length,
          regular: users.filter(u => u.role === 'user').length
        },
        content: {
          posts: posts.length,
          publishedPosts: posts.filter(p => p.isPublished).length,
          draftPosts: posts.filter(p => !p.isPublished).length,
          documents: documents.length
        },
        marketplace: {
          ads: ads.length,
          activeAds: ads.filter(a => a.status === 'active').length,
          pendingAds: ads.filter(a => a.status === 'pending').length
        },
        views: {
          totalPostViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
          totalAdViews: ads.reduce((sum, a) => sum + (a.views || 0), 0)
        }
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const posts = await storage.getAllPosts();
      const ads = await storage.getAllAds();

      const analytics = {
        users: {
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          suppliers: users.filter(u => u.role === 'supplier').length,
          regular: users.filter(u => u.role === 'user').length
        },
        content: {
          posts: posts.length,
          publishedPosts: posts.filter(p => p.isPublished).length,
          draftPosts: posts.filter(p => !p.isPublished).length,
          documents: 0 // TODO: add documents count
        },
        marketplace: {
          ads: ads.length,
          activeAds: ads.filter(a => a.status === 'active').length
        },
        views: {
          totalPostViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
          totalAdViews: ads.reduce((sum, a) => sum + (a.views || 0), 0)
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin posts endpoint  
  app.get('/api/admin/posts', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Admin marketplace endpoint
  app.get('/api/admin/marketplace', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching admin marketplace:", error);
      res.status(500).json({ message: "Failed to fetch marketplace data" });
    }
  });

  // Admin media endpoint
  app.get('/api/admin/media', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      // TODO: implement media management
      res.json([]);
    } catch (error) {
      console.error("Error fetching admin media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Admin AI tasks endpoint
  app.get('/api/admin/ai/tasks', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      // TODO: implement AI tasks management
      const mockTasks = [
        { id: '1', title: 'Автомодерация объявлений', status: 'completed', priority: 'high' },
        { id: '2', title: 'Анализ пользовательского контента', status: 'in_progress', priority: 'medium' },
        { id: '3', title: 'Генерация SEO тегов', status: 'pending', priority: 'low' }
      ];
      res.json(mockTasks);
    } catch (error) {
      console.error("Error fetching AI tasks:", error);
      res.status(500).json({ message: "Failed to fetch AI tasks" });
    }
  });

  // Admin AI chat endpoint
  app.post('/api/admin/ai/chat', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { message } = req.body;
      // TODO: integrate with OpenAI
      res.json({ message: `AI ответ на: ${message}` });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  // Admin settings endpoint
  app.get('/api/admin/settings', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = {
        siteName: "NewsFire KZ",
        adminEmail: "admin@newsfire.kz",
        siteDescription: "Портал пожарной безопасности Казахстана",
        maintenanceMode: false,
        registrationEnabled: true,
        moderationRequired: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
        systemVersion: "1.0.0",
        lastBackup: new Date().toISOString(),
        backupFrequency: "daily"
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Sections routes (с кэшированием)
  app.get('/api/sections', cacheMiddleware(300), async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get('/api/sections/:slug', async (req, res) => {
    try {
      const section = await storage.getSection(req.params.slug);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      console.error("Error fetching section:", error);
      res.status(500).json({ message: "Failed to fetch section" });
    }
  });

  // Subsections routes (с кэшированием)
  app.get('/api/subsections', cacheMiddleware(300), async (req, res) => {
    try {
      const sectionId = req.query.sectionId as string;
      const subsections = await storage.getSubsections(sectionId);
      res.json(subsections);
    } catch (error) {
      console.error("Error fetching subsections:", error);
      res.status(500).json({ message: "Failed to fetch subsections" });
    }
  });

  app.get('/api/subsections/:slug', async (req, res) => {
    try {
      const subsection = await storage.getSubsection(req.params.slug);
      if (!subsection) {
        return res.status(404).json({ message: "Subsection not found" });
      }
      res.json(subsection);
    } catch (error) {
      console.error("Error fetching subsection:", error);
      res.status(500).json({ message: "Failed to fetch subsection" });
    }
  });

  // Posts routes (с кэшированием)
  app.get('/api/posts', cacheMiddleware(180), async (req, res) => {
    try {
      const subsectionId = req.query.subsectionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(subsectionId, limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/featured', cacheMiddleware(600), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const posts = await storage.getFeaturedPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ message: "Failed to fetch featured posts" });
    }
  });

  app.get('/api/posts/popular', cacheMiddleware(300), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const posts = await storage.getPopularPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      res.status(500).json({ message: "Failed to fetch popular posts" });
    }
  });

  app.get('/api/posts/:slug', async (req, res) => {
    try {
      const post = await storage.getPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Increment views
      await storage.incrementPostViews(post.id);

      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', requireAuth, createLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const postData = insertPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createPost(postData);

      // Инвалидируем кэш постов
      invalidateCache('/api/posts');

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Search routes
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const posts = await storage.searchPosts(query, limit);
      res.json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  // Documents routes
  app.get('/api/documents', async (req, res) => {
    try {
      const subsectionId = req.query.subsectionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const documents = await storage.getDocuments(subsectionId, limit);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/documents/:slug', async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.slug);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post('/api/documents/:id/download', async (req, res) => {
    try {
      await storage.incrementDocumentDownloads(req.params.id);
      res.json({ message: "Download count incremented" });
    } catch (error) {
      console.error("Error incrementing download count:", error);
      res.status(500).json({ message: "Failed to increment download count" });
    }
  });

  // Photo albums routes
  app.get('/api/photo-albums', async (req, res) => {
    try {
      const subsectionId = req.query.subsectionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const albums = await storage.getPhotoAlbums(subsectionId, limit);
      res.json(albums);
    } catch (error) {
      console.error("Error fetching photo albums:", error);
      res.status(500).json({ message: "Failed to fetch photo albums" });
    }
  });

  app.get('/api/photo-albums/:slug', async (req, res) => {
    try {
      const album = await storage.getPhotoAlbum(req.params.slug);
      if (!album) {
        return res.status(404).json({ message: "Photo album not found" });
      }

      const photos = await storage.getPhotosInAlbum(album.id);
      res.json({ ...album, photos });
    } catch (error) {
      console.error("Error fetching photo album:", error);
      res.status(500).json({ message: "Failed to fetch photo album" });
    }
  });

  // Videos routes
  app.get('/api/videos', async (req, res) => {
    try {
      const subsectionId = req.query.subsectionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const videos = await storage.getVideos(subsectionId, limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:slug', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.slug);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Increment views
      await storage.incrementVideoViews(video.id);

      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Presentations routes
  app.get('/api/presentations', async (req, res) => {
    try {
      const subsectionId = req.query.subsectionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const presentations = await storage.getPresentations(subsectionId, limit);
      res.json(presentations);
    } catch (error) {
      console.error("Error fetching presentations:", error);
      res.status(500).json({ message: "Failed to fetch presentations" });
    }
  });

  app.get('/api/presentations/:slug', async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.slug);
      if (!presentation) {
        return res.status(404).json({ message: "Presentation not found" });
      }

      // Increment views
      await storage.incrementPresentationViews(presentation.id);

      res.json(presentation);
    } catch (error) {
      console.error("Error fetching presentation:", error);
      res.status(500).json({ message: "Failed to fetch presentation" });
    }
  });

  // Marketplace routes (с кэшированием)
  app.get('/api/marketplace/categories', cacheMiddleware(600), async (req, res) => {
    try {
      const categories = await storage.getAdCategories();
      console.log(`Fetched ${categories.length} ad categories:`, categories.map(c => c.title));
      res.json(categories);
    } catch (error) {
      console.error("Error fetching ad categories:", error);
      res.status(500).json({ message: "Failed to fetch ad categories" });
    }
  });

  app.get('/api/marketplace/ads', cacheMiddleware(120), async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const city = req.query.city as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const ads = await storage.getAds(categoryId, city, limit, offset);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get('/api/marketplace/ads/:slug', async (req, res) => {
    try {
      const ad = await storage.getAd(req.params.slug);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      // Increment views
      await storage.incrementAdViews(ad.id);

      // Get bids for this ad
      const bids = await storage.getBids(ad.id);

      res.json({ ...ad, bids });
    } catch (error) {
      console.error("Error fetching ad:", error);
      res.status(500).json({ message: "Failed to fetch ad" });
    }
  });

  app.post('/api/marketplace/ads', requireAuth, createLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const adData = insertAdSchema.parse({ ...req.body, userId });
      const ad = await storage.createAd(adData);

      // Инвалидируем кэш объявлений
      invalidateCache('/api/marketplace/ads');

      res.status(201).json(ad);
    } catch (error) {
      console.error("Error creating ad:", error);
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  // User dashboard routes
  app.get('/api/dashboard/ads', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ads = await storage.getUserAds(userId);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching user ads:", error);
      res.status(500).json({ message: "Failed to fetch user ads" });
    }
  });

  app.get('/api/dashboard/bids', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bids = await storage.getUserBids(userId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching user bids:", error);
      res.status(500).json({ message: "Failed to fetch user bids" });
    }
  });

  // Bid routes
  app.post('/api/marketplace/ads/:adId/bids', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const adId = req.params.adId;
      const bidData = insertBidSchema.parse({ ...req.body, adId, supplierId: userId });
      const bid = await storage.createBid(bidData);

      // Создаем уведомление для автора объявления
      const ad = await storage.getAdById(adId);
      if (ad) {
        await storage.createNotification({
          userId: ad.userId,
          title: 'Новая заявка на ваше объявление',
          message: `Получена заявка на объявление "${ad.title}"`,
          type: 'info',
          linkUrl: `/marketplace/ads/${ad.slug}`,
          adId: adId,
          bidId: bid.id
        });
      }

      res.status(201).json(bid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  app.get('/api/marketplace/ads/:adId/bids', async (req, res) => {
    try {
      const bids = await storage.getBids(req.params.adId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Accept/Reject bid routes
  app.put('/api/marketplace/bids/:bidId/accept', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bidId = req.params.bidId;

      const bid = await storage.getBidById(bidId);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const ad = await storage.getAdById(bid.adId);
      if (!ad || ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Принимаем заявку и закрываем объявление
      await storage.acceptBid(bidId, ad.id);

      // Уведомляем победителя
      await storage.createNotification({
        userId: bid.supplierId,
        title: 'Ваше предложение принято!',
        message: `Ваше предложение по объявлению "${ad.title}" было принято`,
        type: 'success',
        linkUrl: `/marketplace/ads/${ad.slug}`,
        adId: ad.id,
        bidId: bidId
      });

      // Уведомляем остальных участников
      const allBids = await storage.getBids(ad.id);
      for (const otherBid of allBids) {
        if (otherBid.id !== bidId) {
          await storage.createNotification({
            userId: otherBid.supplierId,
            title: 'Ваше предложение не выбрано',
            message: `По объявлению "${ad.title}" выбрано другое предложение`,
            type: 'info',
            linkUrl: `/marketplace/ads/${ad.slug}`,
            adId: ad.id,
            bidId: otherBid.id
          });
        }
      }

      res.json({ message: "Bid accepted successfully" });
    } catch (error) {
      console.error("Error accepting bid:", error);
      res.status(500).json({ message: "Failed to accept bid" });
    }
  });

  app.put('/api/marketplace/bids/:bidId/reject', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bidId = req.params.bidId;

      const bid = await storage.getBidById(bidId);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const ad = await storage.getAdById(bid.adId);
      if (!ad || ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Отклоняем заявку
      await storage.rejectBid(bidId);

      // Уведомляем поставщика
      await storage.createNotification({
        userId: bid.supplierId,
        title: 'Ваше предложение отклонено',
        message: `Ваше предложение по объявлению "${ad.title}" было отклонено`,
        type: 'warning',
        linkUrl: `/marketplace/ads/${ad.slug}`,
        adId: ad.id,
        bidId: bidId
      });

      res.json({ message: "Bid rejected successfully" });
    } catch (error) {
      console.error("Error rejecting bid:", error);
      res.status(500).json({ message: "Failed to reject bid" });
    }
  });

  // Close ad without selecting winner
  app.put('/api/marketplace/ads/:adId/close', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const adId = req.params.adId;

      const ad = await storage.getAdById(adId);
      if (!ad || ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Закрываем объявление
      await storage.closeAd(adId);

      // Уведомляем всех участников
      const bids = await storage.getBids(adId);
      for (const bid of bids) {
        await storage.createNotification({
          userId: bid.supplierId,
          title: 'Объявление закрыто',
          message: `Объявление "${ad.title}" было закрыто без выбора исполнителя`,
          type: 'info',
          linkUrl: `/marketplace/ads/${ad.slug}`,
          adId: adId,
          bidId: bid.id
        });
      }

      res.json({ message: "Ad closed successfully" });
    } catch (error) {
      console.error("Error closing ad:", error);
      res.status(500).json({ message: "Failed to close ad" });
    }
  });

  // Notifications routes
  app.get('/api/notifications/:userId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId;

      // Проверяем доступ
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:notificationId/read', requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // ===== ADMIN ROUTES (Protected) =====

  // Admin Users Management
  app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin Sections Management
  app.post('/api/admin/sections', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  app.put('/api/admin/sections/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const section = await storage.updateSection(req.params.id, req.body);
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.delete('/api/admin/sections/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deleteSection(req.params.id);
      res.json({ message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Admin Subsections Management
  app.post('/api/admin/subsections', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const subsectionData = insertSubsectionSchema.parse(req.body);
      const subsection = await storage.createSubsection(subsectionData);
      res.status(201).json(subsection);
    } catch (error) {
      console.error("Error creating subsection:", error);
      res.status(500).json({ message: "Failed to create subsection" });
    }
  });

  app.put('/api/admin/subsections/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const subsection = await storage.updateSubsection(req.params.id, req.body);
      res.json(subsection);
    } catch (error) {
      console.error("Error updating subsection:", error);
      res.status(500).json({ message: "Failed to update subsection" });
    }
  });

  app.delete('/api/admin/subsections/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deleteSubsection(req.params.id);
      res.json({ message: "Subsection deleted successfully" });
    } catch (error) {
      console.error("Error deleting subsection:", error);
      res.status(500).json({ message: "Failed to delete subsection" });
    }
  });

  // Admin Posts Management
  app.post('/api/admin/posts', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const postData = insertPostSchema.parse({ ...req.body, authorId: req.adminUser.id });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put('/api/admin/posts/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const post = await storage.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete('/api/admin/posts/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Admin Documents Management
  app.post('/api/admin/documents', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const documentData = insertDocumentSchema.parse({ ...req.body, authorId: req.adminUser.id });
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put('/api/admin/documents/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const document = await storage.updateDocument(req.params.id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/admin/documents/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Admin Media Library
  app.post('/api/admin/media/upload', requireAuth, requireAdmin, upload.array('files', 10), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadedFiles = [];

      for (const file of files) {
        const mediaData = {
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          fileSize: file.size,
          fileType: file.mimetype,
          uploadedBy: req.adminUser.id
        };
        const media = await storage.createMedia(mediaData);
        uploadedFiles.push(media);
      }

      res.status(201).json(uploadedFiles);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  app.delete('/api/admin/media/:id', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await storage.deleteMedia(req.params.id);
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Admin Marketplace Management
  app.put('/api/admin/marketplace/:id/status', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const ad = await storage.updateAd(req.params.id, { status });
      res.json(ad);
    } catch (error) {
      console.error("Error updating ad status:", error);
      res.status(500).json({ message: "Failed to update ad status" });
    }
  });

  // Admin AI Assistant endpoints (mock for now)
  app.post('/api/admin/ai/generate', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { type, prompt } = req.body;
      // Mock content generation
      const generatedContent = {
        type,
        content: `Сгенерированный контент для "${prompt}". В реальной версии здесь будет AI-генерация контента.`,
        timestamp: new Date().toISOString()
      };
      res.json(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Global Search API
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const results = await storage.globalSearch(query);
      res.json(results);
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Enhanced Notifications API
  app.get('/api/notifications/:userId?', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId || req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Marketplace bid management routes
  app.put('/api/marketplace/bids/:id/accept', requireAuth, async (req: any, res) => {
    try {
      const bidId = req.params.id;
      const userId = req.user.id;

      const bid = await storage.getBidById(bidId);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const ad = await storage.getAdById(bid.adId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to manage this ad" });
      }

      await storage.acceptBid(bidId, ad.id);

      // Create notification for accepted supplier
      await storage.createNotification({
        userId: bid.supplierId,
        title: "Ваша заявка принята!",
        message: `Ваша заявка на "${ad.title}" была принята заказчиком.`,
        type: "success",
        linkUrl: `/marketplace/ads/${ad.slug}`
      });

      res.json({ message: "Bid accepted successfully" });
    } catch (error) {
      console.error("Error accepting bid:", error);
      res.status(500).json({ message: "Failed to accept bid" });
    }
  });

  app.put('/api/marketplace/bids/:id/reject', requireAuth, async (req: any, res) => {
    try {
      const bidId = req.params.id;
      const userId = req.user.id;

      const bid = await storage.getBidById(bidId);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const ad = await storage.getAdById(bid.adId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to manage this ad" });
      }

      await storage.rejectBid(bidId);

      // Create notification for rejected supplier
      await storage.createNotification({
        userId: bid.supplierId,
        title: "Заявка отклонена",
        message: `Ваша заявка на "${ad.title}" была отклонена заказчиком.`,
        type: "warning",
        linkUrl: `/marketplace/ads/${ad.slug}`
      });

      res.json({ message: "Bid rejected successfully" });
    } catch (error) {
      console.error("Error rejecting bid:", error);
      res.status(500).json({ message: "Failed to reject bid" });
    }
  });

  app.put('/api/marketplace/ads/:id/close', requireAuth, async (req: any, res) => {
    try {
      const adId = req.params.id;
      const userId = req.user.id;

      const ad = await storage.getAdById(adId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to manage this ad" });
      }

      await storage.closeAd(adId);

      // Create notifications for all bidders
      const bids = await storage.getBids(adId);
      for (const bid of bids) {
        if (bid.status === 'pending') {
          await storage.createNotification({
            userId: bid.supplierId,
            title: "Заказ закрыт",
            message: `Заказ "${ad.title}" был закрыт заказчиком без выбора исполнителя.`,
            type: "info",
            linkUrl: `/marketplace/ads/${ad.slug}`
          });
        }
      }

      res.json({ message: "Ad closed successfully" });
    } catch (error) {
      console.error("Error closing ad:", error);
      res.status(500).json({ message: "Failed to close ad" });
    }
  });



  app.post('/api/notifications', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.post('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id, req.user.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.post('/api/notifications/mark-all-read', requireAuth, async (req: any, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all as read" });
    }
  });

  app.delete('/api/notifications/:id', requireAuth, async (req: any, res) => {
    try {
      await storage.deleteNotification(req.params.id, req.user.id);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // ===== REVIEWS API =====

  // Create review
  app.post('/api/reviews', requireAuth, async (req: any, res) => {
    try {
      const reviewData = {
        ...req.body,
        reviewerId: req.user.id,
        createdAt: new Date().toISOString()
      };

      const review = await storage.createReview(reviewData);
      
      // Update supplier rating
      await storage.updateUserRating(reviewData.revieweeId);

      // Send WebSocket notification to the reviewed user
      const notification = {
        title: 'Новый отзыв',
        message: `Вы получили новый отзыв с оценкой ${reviewData.rating} звезд`,
        type: 'info'
      };
      wsManager.sendUserNotification(reviewData.revieweeId, notification);

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get reviews for supplier
  app.get('/api/reviews/supplier/:supplierId', async (req, res) => {
    try {
      const reviews = await storage.getSupplierReviews(req.params.supplierId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching supplier reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get reviews for ad
  app.get('/api/reviews/ad/:adId', async (req, res) => {
    try {
      const reviews = await storage.getAdReviews(req.params.adId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching ad reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Respond to review (suppliers can respond to reviews)
  app.put('/api/reviews/:reviewId/respond', requireAuth, async (req: any, res) => {
    try {
      const { response } = req.body;
      const review = await storage.respondToReview(req.params.reviewId, response, req.user.id);
      res.json(review);
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ message: "Failed to respond to review" });
    }
  });

  // ===== ADVANCED SEARCH API =====

  // Full-text search for marketplace ads
  app.get('/api/marketplace/search', async (req, res) => {
    try {
      const {
        q: query = '',
        category = 'all',
        city = 'all',
        minBudget = 0,
        maxBudget = 1000000,
        currency = 'KZT',
        tags = '',
        minRating = 0,
        isUrgent = false,
        dateRange = 'all',
        sortBy = 'newest',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        query: query as string,
        category: category as string,
        city: city as string,
        minBudget: parseInt(minBudget as string),
        maxBudget: parseInt(maxBudget as string),
        currency: currency as string,
        tags: tags ? (tags as string).split(',').map(t => t.trim()) : [],
        minRating: parseFloat(minRating as string),
        isUrgent: isUrgent === 'true',
        dateRange: dateRange as string,
        sortBy: sortBy as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const results = await storage.searchAds(filters);
      res.json(results);
    } catch (error) {
      console.error("Error searching ads:", error);
      res.status(500).json({ message: "Failed to search ads" });
    }
  });

  // Search suppliers
  app.get('/api/suppliers/search', async (req, res) => {
    try {
      const {
        q: query = '',
        city = 'all',
        skills = '',
        minRating = 0,
        minExperience = 0,
        isOnline = false,
        verified = false,
        hasPortfolio = false,
        sortBy = 'rating',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        query: query as string,
        city: city as string,
        skills: skills ? (skills as string).split(',').map(s => s.trim()) : [],
        minRating: parseFloat(minRating as string),
        minExperience: parseInt(minExperience as string),
        isOnline: isOnline === 'true',
        verified: verified === 'true',
        hasPortfolio: hasPortfolio === 'true',
        sortBy: sortBy as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const results = await storage.searchSuppliers(filters);
      res.json(results);
    } catch (error) {
      console.error("Error searching suppliers:", error);
      res.status(500).json({ message: "Failed to search suppliers" });
    }
  });

  // Get popular search terms
  app.get('/api/search/popular', cacheMiddleware(3600), async (req, res) => {
    try {
      const popularTerms = await storage.getPopularSearchTerms();
      res.json(popularTerms);
    } catch (error) {
      console.error("Error fetching popular search terms:", error);
      res.status(500).json({ message: "Failed to fetch popular search terms" });
    }
  });

  // Save search query for analytics
  app.post('/api/search/track', async (req, res) => {
    try {
      const { query, category, resultsCount } = req.body;
      await storage.trackSearchQuery(query, category, resultsCount);
      res.json({ message: "Search tracked" });
    } catch (error) {
      console.error("Error tracking search:", error);
      res.status(500).json({ message: "Failed to track search" });
    }
  });

  // Add moderation routes
  setupModerationRoutes(app);

  // Register AI Chat routes
  await registerChatRoutes(app);

  // Enhanced Marketplace API Routes
  app.get('/api/marketplace/ads', async (req, res) => {
    try {
      const { q, category, city, sortBy = 'newest' } = req.query;

      const cacheKey = `/api/marketplace/ads/${category || 'all'}/${city || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for ${cacheKey}`);
        return res.status(304).json(cached);
      }

      let whereConditions: any = { isActive: true, isApproved: true };

      if (category && category !== 'all') {
        whereConditions.categoryId = category as string;
      }

      if (city && city !== 'all') {
        whereConditions.city = city as string;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'budget_high') {
        orderBy = { budget: 'desc' };
      } else if (sortBy === 'budget_low') {
        orderBy = { budget: 'asc' };
      } else if (sortBy === 'popular') {
        orderBy = { views: 'desc' };
      }

      const ads = await storage.getMarketplaceAds({ 
        where: whereConditions, 
        orderBy,
        search: q as string,
        limit: 50
      });

      cache.set(cacheKey, ads, 300); // 5 минут кеш
      res.json(ads);
    } catch (error) {
      console.error('Error fetching marketplace ads:', error);
      res.status(500).json({ message: 'Failed to fetch ads' });
    }
  });

  app.get('/api/marketplace/suppliers', async (req, res) => {
    try {
      const { q, city, specialization } = req.query;

      const cacheKey = `/api/marketplace/suppliers/${city || 'all'}/${specialization || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.status(304).json(cached);
      }

      const suppliers = await storage.getMarketplaceSuppliers({
        search: q as string,
        city: city as string,
        specialization: specialization as string,
        limit: 50
      });

      cache.set(cacheKey, suppliers, 300);
      res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ message: 'Failed to fetch suppliers' });
    }
  });

  // Marketplace categories route - ADDED
  app.get('/api/marketplace/categories', async (req, res) => {
    try {
      const cacheKey = '/api/marketplace/categories';
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.status(304).json(cached);
      }

      const categories = await storage.getAdCategories();
      console.log(`Fetched ${categories.length} ad categories:`, categories.map(c => c.title));

      cache.set(cacheKey, categories, 600); // 10 минут кеш
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // API для создания задач - только для пользователей и выше
  app.post('/api/marketplace/ads', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const adData = { ...req.body, userId };

      const newAd = await storage.createAd(adData);

      // Очищаем кеш
      cache.flushAll();

      res.status(201).json(newAd);
    } catch (error) {
      console.error('Error creating ad:', error);
      res.status(500).json({ message: 'Failed to create ad' });
    }
  });

  // API для откликов/заявок - только для поставщиков и выше  
  app.post('/api/marketplace/bids', requireSupplier, async (req: any, res) => {
    try {
      const supplierId = req.user?.id;
      const bidData = { ...req.body, supplierId };

      const newBid = await storage.createBid(bidData);

      // Увеличиваем счетчик откликов в объявлении
      await storage.incrementAdBidCount(bidData.adId);

      // Очищаем кеш
      cache.flushAll();

      res.status(201).json(newBid);
    } catch (error) {
      console.error('Error creating bid:', error);
      res.status(500).json({ message: 'Failed to create bid' });
    }
  });

  // API для поставщиков
  app.get('/api/marketplace/suppliers', async (req, res) => {
    try {
      const { q, city, category, sortBy = 'rating' } = req.query;

      const cacheKey = `/api/marketplace/suppliers/${city || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for ${cacheKey}`);
        return res.json(cached);
      }

      let whereConditions: any = { 
        role: 'supplier',
        isActive: true 
      };

      if (city && city !== 'all') {
        whereConditions.city = city as string;
      }

      let orderBy: any = { rating: 'desc' };
      if (sortBy === 'experience') {
        orderBy = { workExperience: 'desc' };
      } else if (sortBy === 'reviews') {
        orderBy = { reviewCount: 'desc' };
      }

      const suppliers = await storage.getSuppliers({ 
        where: whereConditions, 
        orderBy,
        search: q as string,
        limit: 50
      });

      cache.set(cacheKey, suppliers, 300);
      res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ message: 'Failed to fetch suppliers' });
    }
  });

  // API для отзывов
  app.post('/api/marketplace/reviews', requireAuth, async (req: any, res) => {
    try {
      const reviewerId = req.user?.id;
      const reviewData = { ...req.body, reviewerId };

      const newReview = await storage.createReview(reviewData);

      // Пересчитываем рейтинг пользователя
      await storage.updateUserRating(reviewData.revieweeId);

      res.status(201).json(newReview);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  // === МОДЕРАЦИЯ РОУТЫ === //
  // Получить список объявлений на модерацию (модераторы и админы)
  app.get('/api/moderation/ads', requireModerator, async (req: any, res) => {
    try {
      const ads = await storage.getAdsForModeration();
      res.json(ads);
    } catch (error) {
      console.error('Error getting ads for moderation:', error);
      res.status(500).json({ message: 'Failed to get ads for moderation' });
    }
  });

  // Одобрить объявление (модераторы и админы)
  app.post('/api/moderation/ads/:id/approve', requireModerator, async (req: any, res) => {
    try {
      const { id } = req.params;
      const moderatorId = req.user?.id;

      await storage.approveAd(id, moderatorId);
      cache.flushAll();

      res.json({ message: 'Объявление одобрено' });
    } catch (error) {
      console.error('Error approving ad:', error);
      res.status(500).json({ message: 'Failed to approve ad' });
    }
  });

  // Отклонить объявление (модераторы и админы)
  app.post('/api/moderation/ads/:id/reject', requireModerator, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const moderatorId = req.user?.id;

      await storage.rejectAd(id, moderatorId, reason);
      cache.flushAll();

      res.json({ message: 'Объявление отклонено' });
    } catch (error) {
      console.error('Error rejecting ad:', error);
      res.status(500).json({ message: 'Failed to reject ad' });
    }
  });

  // Управление пользователями (только админы)
  app.put('/api/admin/users/:id/role', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'supplier', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Недопустимая роль' });
      }

      await storage.updateUserRole(id, role);
      cache.flushAll();

      res.json({ message: 'Роль пользователя обновлена' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  // Блокировать/разблокировать пользователя (модераторы и админы)
  app.put('/api/moderation/users/:id/toggle-active', requireModerator, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      await storage.updateUserActiveStatus(id, isActive);
      cache.flushAll();

      res.json({ message: isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован' });
    } catch (error) {
      console.error('Error updating user active status:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  });

  const httpServer = createServer(app);
  
  // Инициализируем WebSocket сервер
  wsManager.initialize(httpServer);
  
  return httpServer;
}