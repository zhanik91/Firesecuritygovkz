import { z } from 'zod';

// Achievement System
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.enum(['beginner', 'intermediate', 'expert', 'special']),
  requirements: z.object({
    firesExtinguished: z.number().optional(),
    accuracyRate: z.number().optional(),
    timeCompleted: z.number().optional(),
    scenariosCompleted: z.array(z.string()).optional(),
    streakDays: z.number().optional(),
    specificTools: z.array(z.string()).optional(),
  }),
  reward: z.object({
    xp: z.number(),
    badge: z.string(),
    unlocks: z.array(z.string()).optional(),
  }),
  unlockedAt: z.date().optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;

// Player Profile System
export const playerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  level: z.number().default(1),
  xp: z.number().default(0),
  title: z.string().default('Новичок'),
  avatar: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  stats: z.object({
    totalGamesPlayed: z.number().default(0),
    totalFiresExtinguished: z.number().default(0),
    averageAccuracy: z.number().default(0),
    totalTimeSpent: z.number().default(0),
    favoriteScenario: z.string().optional(),
    currentStreak: z.number().default(0),
    longestStreak: z.number().default(0),
    lastPlayDate: z.date().optional(),
  }),
  achievements: z.array(z.string()).default([]),
  certificates: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type PlayerProfile = z.infer<typeof playerProfileSchema>;

// Game Session System
export const gameSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  scenario: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']),
  startTime: z.date(),
  endTime: z.date().optional(),
  score: z.number().default(0),
  firesExtinguished: z.number().default(0),
  accuracy: z.number().default(0),
  timeSpent: z.number().default(0),
  toolsUsed: z.array(z.string()).default([]),
  safetyViolations: z.number().default(0),
  completed: z.boolean().default(false),
  xpEarned: z.number().default(0),
  achievementsUnlocked: z.array(z.string()).default([]),
});

export type GameSession = z.infer<typeof gameSessionSchema>;

// Daily Challenge System
export const dailyChallengeSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  description: z.string(),
  scenario: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  requirements: z.object({
    maxTime: z.number().optional(),
    minAccuracy: z.number().optional(),
    specificTool: z.string().optional(),
    maxViolations: z.number().optional(),
  }),
  rewards: z.object({
    xp: z.number(),
    bonusAchievement: z.string().optional(),
  }),
  active: z.boolean().default(true),
});

export type DailyChallenge = z.infer<typeof dailyChallengeSchema>;

// Leaderboard Entry
export const leaderboardEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  playerName: z.string(),
  category: z.enum(['overall', 'speed', 'accuracy', 'fires', 'streak']),
  value: z.number(),
  rank: z.number(),
  lastUpdated: z.date(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// Predefined Achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Beginner Achievements
  {
    id: 'first-fire',
    title: 'Первый огонь',
    description: 'Потушите свой первый пожар',
    icon: '🔥',
    category: 'beginner',
    requirements: { firesExtinguished: 1 },
    reward: { xp: 100, badge: 'fire-starter' }
  },
  {
    id: 'quick-learner',
    title: 'Быстрый ученик',
    description: 'Завершите первую игру за 5 минут',
    icon: '⚡',
    category: 'beginner',
    requirements: { timeCompleted: 300 },
    reward: { xp: 150, badge: 'lightning' }
  },
  {
    id: 'accuracy-master',
    title: 'Мастер точности',
    description: 'Достигните 90% точности',
    icon: '🎯',
    category: 'beginner',
    requirements: { accuracyRate: 90 },
    reward: { xp: 200, badge: 'bullseye' }
  },

  // Intermediate Achievements
  {
    id: 'fire-fighter',
    title: 'Пожарный',
    description: 'Потушите 10 пожаров',
    icon: '👨‍🚒',
    category: 'intermediate',
    requirements: { firesExtinguished: 10 },
    reward: { xp: 300, badge: 'firefighter' }
  },
  {
    id: 'scenario-explorer',
    title: 'Исследователь',
    description: 'Завершите все базовые сценарии',
    icon: '🗺️',
    category: 'intermediate',
    requirements: { scenariosCompleted: ['office', 'hospital', 'factory', 'residential'] },
    reward: { xp: 500, badge: 'explorer', unlocks: ['advanced-scenarios'] }
  },
  {
    id: 'speed-demon',
    title: 'Демон скорости',
    description: 'Завершите любой сценарий за 2 минуты',
    icon: '💨',
    category: 'intermediate',
    requirements: { timeCompleted: 120 },
    reward: { xp: 400, badge: 'speed' }
  },

  // Expert Achievements
  {
    id: 'fire-marshal',
    title: 'Маршал пожарной охраны',
    description: 'Потушите 50 пожаров с точностью 95%+',
    icon: '🏆',
    category: 'expert',
    requirements: { firesExtinguished: 50, accuracyRate: 95 },
    reward: { xp: 1000, badge: 'marshal' }
  },
  {
    id: 'perfect-week',
    title: 'Идеальная неделя',
    description: 'Играйте 7 дней подряд',
    icon: '📅',
    category: 'expert',
    requirements: { streakDays: 7 },
    reward: { xp: 750, badge: 'dedication' }
  },
  {
    id: 'tool-master',
    title: 'Мастер инструментов',
    description: 'Используйте все типы огнетушителей эффективно',
    icon: '🧰',
    category: 'expert',
    requirements: { specificTools: ['water', 'foam', 'co2', 'powder'] },
    reward: { xp: 600, badge: 'tools' }
  },

  // Special Kazakhstan Achievements
  {
    id: 'kz-defender',
    title: 'Защитник Казахстана',
    description: 'Завершите все казахстанские сценарии на эксперте',
    icon: '🇰🇿',
    category: 'special',
    requirements: { scenariosCompleted: ['almaty-office', 'astana-hospital', 'shymkent-factory'] },
    reward: { xp: 1500, badge: 'kz-hero' }
  },
  {
    id: 'safety-inspector',
    title: 'Инспектор безопасности',
    description: 'Найдите все нарушения в инспекторской игре',
    icon: '🔍',
    category: 'special',
    requirements: { scenariosCompleted: ['inspector-violations'] },
    reward: { xp: 800, badge: 'inspector' }
  }
];

// Level System
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Новичок' },
  { level: 5, xp: 500, title: 'Ученик' },
  { level: 10, xp: 1500, title: 'Практикант' },
  { level: 15, xp: 3000, title: 'Пожарный' },
  { level: 20, xp: 5000, title: 'Старший пожарный' },
  { level: 25, xp: 8000, title: 'Инспектор' },
  { level: 30, xp: 12000, title: 'Старший инспектор' },
  { level: 40, xp: 18000, title: 'Эксперт' },
  { level: 50, xp: 25000, title: 'Мастер безопасности' },
  { level: 75, xp: 40000, title: 'Гранд мастер' },
  { level: 100, xp: 60000, title: 'Легенда' }
];

export function calculateLevel(xp: number): { level: number; title: string; nextLevelXP: number } {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp && xp < LEVEL_THRESHOLDS[i + 1].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1];
      break;
    }
  }

  if (xp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp) {
    currentLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    nextLevel = { level: 101, xp: Infinity, title: 'Max Level' };
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelXP: nextLevel.xp
  };
}

export function checkAchievements(
  profile: PlayerProfile,
  session: GameSession
): string[] {
  const newAchievements: string[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (profile.achievements.includes(achievement.id)) return;

    let qualified = true;

    // Check requirements
    if (achievement.requirements.firesExtinguished) {
      if (profile.stats.totalFiresExtinguished < achievement.requirements.firesExtinguished) {
        qualified = false;
      }
    }

    if (achievement.requirements.accuracyRate) {
      if (profile.stats.averageAccuracy < achievement.requirements.accuracyRate) {
        qualified = false;
      }
    }

    if (achievement.requirements.timeCompleted) {
      if (session.timeSpent > achievement.requirements.timeCompleted) {
        qualified = false;
      }
    }

    if (achievement.requirements.streakDays) {
      if (profile.stats.currentStreak < achievement.requirements.streakDays) {
        qualified = false;
      }
    }

    if (achievement.requirements.scenariosCompleted) {
      const completedScenarios = profile.specializations;
      const requiredScenarios = achievement.requirements.scenariosCompleted;
      if (!requiredScenarios.every(scenario => completedScenarios.includes(scenario))) {
        qualified = false;
      }
    }

    if (qualified) {
      newAchievements.push(achievement.id);
    }
  });

  return newAchievements;
}