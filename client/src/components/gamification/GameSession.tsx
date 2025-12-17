import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Clock, Target, Zap, Star, CheckCircle, XCircle } from 'lucide-react';

interface GameSessionProps {
  scenario: string;
  difficulty: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (results: any) => void;
}

interface SessionRewards {
  xpEarned: number;
  newAchievements?: any[];
  leveledUp?: boolean;
  oldLevel?: number;
  newLevel?: number;
}

export function GameSession({ scenario, difficulty, onSessionStart, onSessionEnd }: GameSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [gameStats, setGameStats] = useState({
    firesExtinguished: 0,
    accuracy: 0,
    timeSpent: 0,
    completed: false,
  });
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  const queryClient = useQueryClient();

  const startSessionMutation = useMutation({
    mutationFn: async (data: { scenario: string; difficulty: string }) => {
      return await apiRequest('/api/gamification/session/start', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setIsActive(true);
      setStartTime(new Date());
      if (onSessionStart) {
        onSessionStart(data.id);
      }
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      firesExtinguished: number;
      accuracy: number;
      timeSpent: number;
      completed: boolean;
    }) => {
      return await apiRequest(`/api/gamification/session/${data.sessionId}/end`, {
        method: 'POST',
        body: JSON.stringify({
          firesExtinguished: data.firesExtinguished,
          accuracy: data.accuracy,
          timeSpent: data.timeSpent,
          completed: data.completed,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      setSessionResults(data);
      setShowResults(true);
      setIsActive(false);
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/stats'] });
      if (onSessionEnd) {
        onSessionEnd(data);
      }
    },
  });

  const startSession = () => {
    startSessionMutation.mutate({ scenario, difficulty });
  };

  const endSession = (stats: typeof gameStats) => {
    if (!sessionId || !startTime) return;

    const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);
    endSessionMutation.mutate({
      sessionId,
      ...stats,
      timeSpent,
    });
  };

  // Auto-update time spent
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setGameStats(prev => ({ ...prev, timeSpent: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner': return 'Новичок';
      case 'intermediate': return 'Средний';
      case 'expert': return 'Эксперт';
      default: return diff;
    }
  };

  const getScenarioText = (sc: string) => {
    switch (sc.toLowerCase()) {
      case 'office': return 'Офисное здание';
      case 'hospital': return 'Больница';
      case 'factory': return 'Промышленный объект';
      case 'residential': return 'Жилой дом';
      default: return sc;
    }
  };

  if (!isActive && !sessionId) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {getScenarioText(scenario)}
              </CardTitle>
              <CardDescription>
                Тренировочная сессия по пожаротушению
              </CardDescription>
            </div>
            <Badge className={getDifficultyColor(difficulty)}>
              {getDifficultyText(difficulty)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-sm font-medium">XP награда</div>
                <div className="text-xs text-gray-600">50-200 XP</div>
              </div>
              <div>
                <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <div className="text-sm font-medium">Время</div>
                <div className="text-xs text-gray-600">5-20 мин</div>
              </div>
              <div>
                <Target className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <div className="text-sm font-medium">Цель</div>
                <div className="text-xs text-gray-600">Потушить огонь</div>
              </div>
            </div>
            
            <Button 
              onClick={startSession} 
              disabled={startSessionMutation.isPending}
              className="w-full"
              size="lg"
            >
              {startSessionMutation.isPending ? 'Запуск...' : 'Начать тренировку'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isActive) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Активная сессия: {getScenarioText(scenario)}
          </CardTitle>
          <CardDescription className="text-green-700">
            Сложность: {getDifficultyText(difficulty)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="font-mono text-lg">{formatTime(gameStats.timeSpent)}</div>
                <div className="text-xs text-gray-600">Время</div>
              </div>
              <div className="text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <div className="text-lg font-semibold">{gameStats.firesExtinguished}</div>
                <div className="text-xs text-gray-600">Потушено</div>
              </div>
              <div className="text-center">
                <Zap className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <div className="text-lg font-semibold">{Math.round(gameStats.accuracy)}%</div>
                <div className="text-xs text-gray-600">Точность</div>
              </div>
              <div className="text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-lg font-semibold">~{Math.round(gameStats.accuracy * 2 + gameStats.firesExtinguished * 100)}</div>
                <div className="text-xs text-gray-600">Очки</div>
              </div>
            </div>

            {/* Test buttons for demo */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGameStats(prev => ({
                  ...prev,
                  firesExtinguished: prev.firesExtinguished + 1,
                  accuracy: Math.min(100, prev.accuracy + 5)
                }))}
              >
                +1 Пожар потушен
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGameStats(prev => ({
                  ...prev,
                  accuracy: Math.max(0, prev.accuracy - 10)
                }))}
              >
                Ошибка (-10% точность)
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => endSession({ ...gameStats, completed: true })}
                disabled={endSessionMutation.isPending}
                className="flex-1"
              >
                Завершить успешно
              </Button>
              <Button 
                variant="outline"
                onClick={() => endSession({ ...gameStats, completed: false })}
                disabled={endSessionMutation.isPending}
                className="flex-1"
              >
                Прервать
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Сессия завершена!</h3>
          <p className="text-gray-600">Результаты обрабатываются...</p>
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Результаты тренировки
            </DialogTitle>
            <DialogDescription>
              {getScenarioText(scenario)} • {getDifficultyText(difficulty)}
            </DialogDescription>
          </DialogHeader>

          {sessionResults && (
            <div className="space-y-4">
              {/* XP Earned */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Star className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-700">
                  +{sessionResults.xpEarned} XP
                </div>
                <div className="text-sm text-green-600">Опыт получен</div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{sessionResults.session?.firesExtinguished || 0}</div>
                  <div className="text-xs text-gray-600">Пожаров потушено</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{Math.round(Number(sessionResults.session?.accuracy) || 0)}%</div>
                  <div className="text-xs text-gray-600">Точность</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{formatTime(sessionResults.session?.timeSpent || 0)}</div>
                  <div className="text-xs text-gray-600">Время</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">{sessionResults.session?.score || 0}</div>
                  <div className="text-xs text-gray-600">Очки</div>
                </div>
              </div>

              <Button 
                onClick={() => setShowResults(false)} 
                className="w-full"
              >
                Продолжить
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}