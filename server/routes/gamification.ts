import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { playerProfiles, gameSessions } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../auth/routes';

const router = Router();

// Get or create player profile
router.get('/profile', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    let profile = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    
    if (profile.length === 0) {
      // Create new profile
      const newProfile = await db.insert(playerProfiles).values({
        userId: userId,
        name: req.user.firstName || req.user.name || 'Пользователь',
      }).returning();
      
      profile = newProfile;
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Start game session
router.post('/session/start', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const sessionSchema = z.object({
      scenario: z.string().min(1),
      difficulty: z.string().min(1),
    });

    const sessionData = sessionSchema.parse(req.body);

    const newSession = await db.insert(gameSessions).values({
      userId: userId,
      scenario: sessionData.scenario,
      difficulty: sessionData.difficulty,
      startTime: new Date(),
    }).returning();

    res.json(newSession[0]);
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End game session
router.post('/session/:sessionId/end', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { sessionId } = req.params;
    
    const endSessionSchema = z.object({
      firesExtinguished: z.number().min(0).default(0),
      accuracy: z.number().min(0).max(100).default(0),
      timeSpent: z.number().min(0).default(0),
      completed: z.boolean().default(false),
    });

    const sessionData = endSessionSchema.parse(req.body);

    // Calculate score and XP
    let score = sessionData.firesExtinguished * 100;
    score += Math.round(sessionData.accuracy * 10);
    score = Math.max(0, score);

    let xpEarned = Math.round(score * 0.1);
    if (sessionData.completed) xpEarned += 50;
    if (sessionData.accuracy >= 90) xpEarned += 30;

    // Update session
    const updatedSession = await db
      .update(gameSessions)
      .set({
        endTime: new Date(),
        score,
        firesExtinguished: sessionData.firesExtinguished,
        accuracy: sessionData.accuracy.toString(),
        timeSpent: sessionData.timeSpent,
        completed: sessionData.completed,
        xpEarned,
      })
      .where(eq(gameSessions.id, sessionId))
      .returning();

    // Update profile XP and stats
    const currentProfile = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    
    if (currentProfile.length > 0) {
      const profile = currentProfile[0];
      const newXP = profile.xp + xpEarned;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newGamesPlayed = profile.totalGamesPlayed + 1;
      const newFiresExtinguished = profile.totalFiresExtinguished + sessionData.firesExtinguished;

      await db
        .update(playerProfiles)
        .set({
          xp: newXP,
          level: newLevel,
          totalGamesPlayed: newGamesPlayed,
          totalFiresExtinguished: newFiresExtinguished,
          totalTimeSpent: profile.totalTimeSpent + sessionData.timeSpent,
          updatedAt: new Date(),
        })
        .where(eq(playerProfiles.userId, userId));
    }

    res.json({
      session: updatedSession[0],
      xpEarned: xpEarned,
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get player statistics
router.get('/stats', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const profile = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    
    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const recentSessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.createdAt))
      .limit(10);

    res.json({
      profile: profile[0],
      recentSessions,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;