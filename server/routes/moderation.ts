import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { ads, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";

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
      const pendingAds = await db.select()
        .from(ads)
        .where(eq(ads.moderationStatus, 'pending'));
      
      const approvedAds = await db.select()
        .from(ads)
        .where(eq(ads.moderationStatus, 'approved'));
      
      const rejectedAds = await db.select()
        .from(ads)
        .where(eq(ads.moderationStatus, 'rejected'));

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
      const pendingAds = await db.select({
        id: ads.id,
        title: ads.title,
        description: ads.description,
        categoryId: ads.categoryId,
        createdAt: ads.createdAt,
        status: ads.status,
        userId: ads.userId,
        companyName: users.companyName,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(ads)
      .leftJoin(users, eq(ads.userId, users.id))
      .where(eq(ads.moderationStatus, 'pending'))
      .orderBy(desc(ads.createdAt));

      const adsWithAuthor = pendingAds.map((ad: any) => ({
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
      await storage.approveAd(adId, req.adminUser.id);

      // Получить информацию об объявлении для уведомления
      const ad = await storage.getAdById(adId);

      if (ad) {
        // Создать уведомление автору
        await storage.createNotification({
          userId: ad.userId,
          title: "Объявление одобрено",
          message: `Ваше объявление "${ad.title}" прошло модерацию и опубликовано.`,
          type: "success",
          linkUrl: `/marketplace/ads/${ad.slug}`,
          isRead: false
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
      await storage.rejectAd(adId, req.adminUser.id, reason);

      // Получить информацию об объявлении для уведомления
      const ad = await storage.getAdById(adId);

      if (ad) {
        // Создать уведомление автору
        await storage.createNotification({
          userId: ad.userId,
          title: "Объявление отклонено",
          message: `Ваше объявление "${ad.title}" отклонено модератором. Причина: ${reason}`,
          type: "warning",
          linkUrl: `/marketplace/create`,
          isRead: false
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
