import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { eq, desc } from "drizzle-orm";

const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.user.claims.sub);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export function setupModerationRoutes(app: Express) {
  // Получить статистику модерации
  app.get('/api/admin/moderation/stats', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const pendingAds = await storage.db.select()
        .from(storage.schema.ads)
        .where(eq(storage.schema.ads.status, 'pending'));
      
      const approvedAds = await storage.db.select()
        .from(storage.schema.ads)
        .where(eq(storage.schema.ads.status, 'active'));
      
      const rejectedAds = await storage.db.select()
        .from(storage.schema.ads)
        .where(eq(storage.schema.ads.status, 'rejected'));

      const stats = {
        pending: pendingAds.length,
        approved: approvedAds.length,
        rejected: rejectedAds.length,
        reports: 0 // TODO: добавить таблицу жалоб
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Получить объявления на модерации
  app.get('/api/admin/ads/pending', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const pendingAds = await storage.db.select({
        id: storage.schema.ads.id,
        title: storage.schema.ads.title,
        description: storage.schema.ads.description,
        category: storage.schema.ads.category,
        createdAt: storage.schema.ads.createdAt,
        status: storage.schema.ads.status,
        userId: storage.schema.ads.userId,
        companyName: storage.schema.users.companyName,
        firstName: storage.schema.users.firstName,
        lastName: storage.schema.users.lastName
      })
      .from(storage.schema.ads)
      .leftJoin(storage.schema.users, eq(storage.schema.ads.userId, storage.schema.users.id))
      .where(eq(storage.schema.ads.status, 'pending'))
      .orderBy(desc(storage.schema.ads.createdAt));

      const adsWithAuthor = pendingAds.map(ad => ({
        ...ad,
        author: ad.companyName || `${ad.firstName} ${ad.lastName}`
      }));

      res.json(adsWithAuthor);
    } catch (error) {
      console.error("Error fetching pending ads:", error);
      res.status(500).json({ message: "Failed to fetch pending ads" });
    }
  });

  // Одобрить объявление
  app.post('/api/admin/ads/:id/approve', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adId = req.params.id;
      
      // Обновить статус объявления
      await storage.db.update(storage.schema.ads)
        .set({ 
          status: 'active'
        })
        .where(eq(storage.schema.ads.id, adId));

      // Получить информацию об объявлении для уведомления
      const ad = await storage.db.select()
        .from(storage.schema.ads)
        .where(eq(storage.schema.ads.id, adId))
        .limit(1);

      if (ad.length > 0) {
        // Создать уведомление автору
        await storage.createNotification({
          userId: ad[0].userId,
          title: "Объявление одобрено",
          message: `Ваше объявление "${ad[0].title}" прошло модерацию и опубликовано.`,
          type: "success",
          linkUrl: `/marketplace/ads/${ad[0].slug}`
        });
      }

      res.json({ message: "Ad approved successfully" });
    } catch (error) {
      console.error("Error approving ad:", error);
      res.status(500).json({ message: "Failed to approve ad" });
    }
  });

  // Отклонить объявление
  app.post('/api/admin/ads/:id/reject', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adId = req.params.id;
      const { reason } = req.body;
      
      // Обновить статус объявления
      await storage.db.update(storage.schema.ads)
        .set({ 
          status: 'rejected'
        })
        .where(eq(storage.schema.ads.id, adId));

      // Получить информацию об объявлении для уведомления
      const ad = await storage.db.select()
        .from(storage.schema.ads)
        .where(eq(storage.schema.ads.id, adId))
        .limit(1);

      if (ad.length > 0) {
        // Создать уведомление автору
        await storage.createNotification({
          userId: ad[0].userId,
          title: "Объявление отклонено",
          message: `Ваше объявление "${ad[0].title}" отклонено модератором. Причина: ${reason}`,
          type: "warning",
          linkUrl: `/marketplace/create`
        });
      }

      res.json({ message: "Ad rejected successfully" });
    } catch (error) {
      console.error("Error rejecting ad:", error);
      res.status(500).json({ message: "Failed to reject ad" });
    }
  });

  // Получить все жалобы
  app.get('/api/admin/reports', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      // TODO: реализовать после создания таблицы reports
      res.json([]);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
}