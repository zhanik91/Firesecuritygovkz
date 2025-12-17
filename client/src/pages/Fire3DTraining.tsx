import React, { useState } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Fire3DGame from '@/components/games/3D/Fire3DGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Hospital, 
  Factory, 
  Home,
  Star,
  Clock,
  Users,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface GameStats {
  score: number;
  timeRemaining: number;
  firesExtinguished: number;
  accuracy: number;
  safetyViolations: number;
}

type Scenario = 'office' | 'hospital' | 'factory' | 'residential';
type Difficulty = 'beginner' | 'intermediate' | 'expert';

export default function Fire3DTraining() {
  const { t } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);

  const scenarios = [
    {
      id: 'office' as Scenario,
      title: 'Офисное здание',
      description: 'Пожар в современном офисном здании с электрооборудованием и серверами',
      icon: Building2,
      color: 'bg-blue-500',
      difficulty: 'Средняя сложность',
      duration: '5-8 минут',
      features: ['Электрооборудование', 'Многоэтажность', 'Офисная мебель']
    },
    {
      id: 'hospital' as Scenario,
      title: 'Больница',
      description: 'Критическая ситуация в медицинском учреждении с пациентами',
      icon: Hospital,
      color: 'bg-green-500',
      difficulty: 'Высокая сложность',
      duration: '7-10 минут',
      features: ['Медицинское оборудование', 'Кислородные баллоны', 'Пациенты']
    },
    {
      id: 'factory' as Scenario,
      title: 'Промышленное предприятие',
      description: 'Пожар на производстве с химическими веществами и оборудованием',
      icon: Factory,
      color: 'bg-orange-500',
      difficulty: 'Очень высокая',
      duration: '10-15 минут',
      features: ['Химические вещества', 'Промышленное оборудование', 'Высокое давление']
    },
    {
      id: 'residential' as Scenario,
      title: 'Жилой дом',
      description: 'Бытовой пожар в жилом помещении с семьями',
      icon: Home,
      color: 'bg-purple-500',
      difficulty: 'Низкая сложность',
      duration: '3-5 минут',
      features: ['Бытовая техника', 'Мебель', 'Жильцы']
    }
  ];

  const difficulties = [
    {
      id: 'beginner' as Difficulty,
      title: 'Новичок',
      description: 'Базовые навыки тушения пожара',
      color: 'bg-green-100 text-green-800',
      features: ['1-2 очага возгорания', 'Простые материалы', 'Подсказки']
    },
    {
      id: 'intermediate' as Difficulty,
      title: 'Средний уровень',
      description: 'Продвинутые техники пожаротушения',
      color: 'bg-yellow-100 text-yellow-800',
      features: ['2-3 очага возгорания', 'Смешанные материалы', 'Ограниченные подсказки']
    },
    {
      id: 'expert' as Difficulty,
      title: 'Эксперт',
      description: 'Профессиональный уровень сложности',
      color: 'bg-red-100 text-red-800',
      features: ['3+ очагов возгорания', 'Сложные условия', 'Без подсказок']
    }
  ];

  const handleGameComplete = (stats: GameStats) => {
    setLastGameStats(stats);
    setGameCompleted(true);
  };

  const startNewGame = () => {
    setSelectedScenario(null);
    setGameCompleted(false);
    setLastGameStats(null);
  };

  const getPerformanceRating = (stats: GameStats) => {
    const totalScore = stats.score + (stats.accuracy * 10) + (stats.firesExtinguished * 50);
    if (totalScore >= 800) return { rating: 'Отлично', color: 'text-green-600', stars: 5 };
    if (totalScore >= 600) return { rating: 'Хорошо', color: 'text-blue-600', stars: 4 };
    if (totalScore >= 400) return { rating: 'Удовлетворительно', color: 'text-yellow-600', stars: 3 };
    if (totalScore >= 200) return { rating: 'Требует улучшения', color: 'text-orange-600', stars: 2 };
    return { rating: 'Неудовлетворительно', color: 'text-red-600', stars: 1 };
  };

  if (gameCompleted && lastGameStats) {
    const performance = getPerformanceRating(lastGameStats);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-4xl font-bold mb-2">Тренировка завершена!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Сценарий: {scenarios.find(s => s.id === selectedScenario)?.title} | 
              Уровень: {difficulties.find(d => d.id === selectedDifficulty)?.title}
            </p>
          </div>

          {/* Performance Rating */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader className="text-center">
              <CardTitle className={`text-2xl ${performance.color}`}>
                {performance.rating}
              </CardTitle>
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < performance.stars
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-kz-blue" />
                <div className="text-3xl font-bold text-kz-blue mb-1">
                  {lastGameStats.score}
                </div>
                <div className="text-sm text-gray-600">Финальный счет</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {lastGameStats.firesExtinguished}
                </div>
                <div className="text-sm text-gray-600">Потушено пожаров</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-3xl font-bold text-purple-500 mb-1">
                  {lastGameStats.accuracy}%
                </div>
                <div className="text-sm text-gray-600">Точность действий</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {Math.floor((300 - lastGameStats.timeRemaining) / 60)}:
                  {((300 - lastGameStats.timeRemaining) % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600">Время прохождения</div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="max-w-4xl mx-auto mb-8">
            <CardHeader>
              <CardTitle>Рекомендации для улучшения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Сильные стороны:</h4>
                  <ul className="space-y-2 text-sm">
                    {lastGameStats.accuracy >= 80 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Высокая точность действий
                      </li>
                    )}
                    {lastGameStats.firesExtinguished >= 2 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Эффективное тушение пожаров
                      </li>
                    )}
                    {lastGameStats.timeRemaining > 60 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Быстрая реакция в критической ситуации
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-orange-600">Области для улучшения:</h4>
                  <ul className="space-y-2 text-sm">
                    {lastGameStats.accuracy < 70 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Улучшить точность выбора огнетушителя
                      </li>
                    )}
                    {lastGameStats.firesExtinguished < 2 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Повысить эффективность тушения
                      </li>
                    )}
                    {lastGameStats.timeRemaining < 30 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Ускорить принятие решений
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <Button onClick={startNewGame} className="bg-kz-blue hover:bg-kz-blue/90">
              Новая тренировка
            </Button>
            <Button variant="outline" asChild>
              <Link href="/games">
                К списку игр
              </Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (selectedScenario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button
              onClick={() => setSelectedScenario(null)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к выбору сценария
            </Button>
          </div>

          <Fire3DGame
            scenario={selectedScenario}
            difficulty={selectedDifficulty}
            onGameComplete={handleGameComplete}
          />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-kz-blue to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            3D IMMERSIVE TRAINING
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-kz-blue to-purple-600 bg-clip-text text-transparent">
            Реалистичные 3D тренажеры
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Современная платформа для изучения пожарной безопасности с реалистичной 
            физикой огня, трехмерным окружением и интерактивными сценариями
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Реалистичная физика</h3>
              <p className="text-sm text-gray-600">
                Точная симуляция поведения огня, дыма и распространения пожара
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Первое лицо</h3>
              <p className="text-sm text-gray-600">
                Погружение от первого лица с WASD управлением и мышиным осмотром
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Система оценки</h3>
              <p className="text-sm text-gray-600">
                Детальная аналитика действий и рекомендации по улучшению
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Выберите сценарий тренировки</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {scenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <Card
                  key={scenario.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${scenario.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {scenario.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {scenario.duration}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {scenario.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">Уровень сложности</h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {difficulties.map((difficulty) => (
              <Card
                key={difficulty.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedDifficulty === difficulty.id
                    ? 'ring-2 ring-kz-blue shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedDifficulty(difficulty.id)}
              >
                <CardContent className="p-4 text-center">
                  <Badge className={`mb-2 ${difficulty.color}`}>
                    {difficulty.title}
                  </Badge>
                  <h4 className="font-medium mb-2">{difficulty.description}</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {difficulty.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Системные требования</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Минимальные:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Chrome 90+ / Firefox 88+</li>
                  <li>• 4 ГБ ОЗУ</li>
                  <li>• WebGL 2.0</li>
                  <li>• Стабильное интернет-соединение</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Рекомендуемые:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Chrome 100+ / Firefox 100+</li>
                  <li>• 8 ГБ ОЗУ</li>
                  <li>• Дискретная видеокарта</li>
                  <li>• Игровая мышь и клавиатура</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}