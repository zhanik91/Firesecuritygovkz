import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerProfile } from '@/components/gamification/PlayerProfile';
import { GameSession } from '@/components/gamification/GameSession';
import { ArrowLeft, Trophy, Users, Target, Calendar, Star, Gamepad2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function GamificationPage() {
  const [, navigate] = useLocation();
  const [selectedScenario, setSelectedScenario] = useState<{scenario: string; difficulty: string} | null>(null);

  const scenarios = [
    {
      id: 'office',
      name: 'Офисное здание',
      description: 'Тушение пожара в многоэтажном офисном здании',
      icon: '🏢',
      difficulties: ['beginner', 'intermediate', 'expert']
    },
    {
      id: 'hospital',
      name: 'Больница',
      description: 'Эвакуация и тушение в медицинском учреждении',
      icon: '🏥',
      difficulties: ['beginner', 'intermediate', 'expert']
    },
    {
      id: 'factory',
      name: 'Промышленный объект',
      description: 'Работа с промышленными пожарами и химикатами',
      icon: '🏭',
      difficulties: ['intermediate', 'expert']
    },
    {
      id: 'residential',
      name: 'Жилой дом',
      description: 'Спасение жильцов и тушение в жилых помещениях',
      icon: '🏠',
      difficulties: ['beginner', 'intermediate']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Новичок';
      case 'intermediate': return 'Средний';
      case 'expert': return 'Эксперт';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-kz-blue/5 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к играм
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Система прогресса
            </h1>
            <p className="text-gray-600">Отслеживайте достижения и улучшайте навыки</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Тренировки
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <PlayerProfile />
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            {!selectedScenario ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Выберите тренировочный сценарий
                    </CardTitle>
                    <CardDescription>
                      Каждый сценарий развивает различные навыки пожарной безопасности
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scenarios.map((scenario) => (
                    <Card key={scenario.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{scenario.icon}</div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{scenario.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {scenario.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700">
                            Доступные уровни сложности:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scenario.difficulties.map((difficulty) => (
                              <Button
                                key={difficulty}
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedScenario({
                                  scenario: scenario.id,
                                  difficulty
                                })}
                                className={`${getDifficultyColor(difficulty)} border-0`}
                              >
                                {getDifficultyText(difficulty)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedScenario(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Выбрать другой сценарий
                </Button>
                
                <GameSession
                  scenario={selectedScenario.scenario}
                  difficulty={selectedScenario.difficulty}
                  onSessionEnd={() => {
                    // Можно добавить логику после завершения сессии
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Система достижений
                </CardTitle>
                <CardDescription>
                  Получайте награды за выполнение различных задач
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock achievements */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">🔥</div>
                      <div>
                        <div className="font-semibold">Первый огонь</div>
                        <div className="text-sm text-gray-600">Потушите свой первый пожар</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Получено</Badge>
                  </div>

                  <div className="p-4 border rounded-lg opacity-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">⚡</div>
                      <div>
                        <div className="font-semibold">Молниеносный</div>
                        <div className="text-sm text-gray-600">Завершите сценарий за 2 минуты</div>
                      </div>
                    </div>
                    <Badge variant="outline">Заблокировано</Badge>
                  </div>

                  <div className="p-4 border rounded-lg opacity-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <div className="font-semibold">Снайпер</div>
                        <div className="text-sm text-gray-600">100% точность в 5 играх подряд</div>
                      </div>
                    </div>
                    <Badge variant="outline">Заблокировано</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Таблица лидеров
                </CardTitle>
                <CardDescription>
                  Соревнуйтесь с другими игроками
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Глобальные рейтинги</h3>
                  <p className="text-gray-600">
                    Рейтинги будут доступны после того, как больше игроков присоединится к платформе
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}