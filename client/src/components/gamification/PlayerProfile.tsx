import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Calendar, Users, Star, TrendingUp } from 'lucide-react';

interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  title: string;
  avatar?: string;
  totalGamesPlayed: number;
  totalFiresExtinguished: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
}

export function PlayerProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/gamification/profile'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/gamification/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Создайте профиль игрока</h3>
          <p className="text-gray-600 mb-4">Начните играть, чтобы создать профиль и отслеживать прогресс</p>
          <Button>Начать игру</Button>
        </CardContent>
      </Card>
    );
  }

  const xpToNext = (profile.level * 1000) - profile.xp;
  const progressPercent = ((profile.xp % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="bg-gradient-to-r from-kz-blue to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-kz-blue">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription className="text-blue-100">
                {profile.title} • Уровень {profile.level}
              </CardDescription>
              <Badge variant="secondary" className="mt-2">
                {profile.xp.toLocaleString()} XP
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс к уровню {profile.level + 1}</span>
              <span>{xpToNext} XP осталось</span>
            </div>
            <Progress value={progressPercent} className="bg-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{profile.totalGamesPlayed}</div>
            <div className="text-sm text-gray-600">Игр сыграно</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Target className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{profile.totalFiresExtinguished}</div>
            <div className="text-sm text-gray-600">Пожаров потушено</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{Math.round(profile.averageAccuracy)}%</div>
            <div className="text-sm text-gray-600">Средняя точность</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{profile.currentStreak}</div>
            <div className="text-sm text-gray-600">Текущая серия</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Достижения
          </CardTitle>
          <CardDescription>
            Получено {profile.achievements.length} из множества достижений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.achievements.slice(0, 8).map((achievement, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                🏆 {achievement}
              </Badge>
            ))}
            {profile.achievements.length > 8 && (
              <Badge variant="secondary" className="px-3 py-1">
                +{profile.achievements.length - 8} ещё
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Последние игры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium capitalize">{session.scenario}</div>
                    <div className="text-sm text-gray-600">
                      {session.difficulty} • {Math.round(Number(session.accuracy))}% точность
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+{session.xpEarned} XP</div>
                    <div className="text-sm text-gray-600">{session.score} очков</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}