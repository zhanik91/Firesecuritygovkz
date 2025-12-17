import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Play, Award, Clock, Users, Gamepad2 } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Новичок' | 'Средний' | 'Эксперт';
  duration: string;
  features: string[];
  isComingSoon?: boolean;
}

const GameCard = ({
  id,
  title,
  description,
  icon,
  difficulty,
  duration,
  features,
  isComingSoon = false
}: GameCardProps) => {
  const difficultyColors = {
    'Новичок': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Средний': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Эксперт': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const [, navigate] = useLocation();

  const openGame = () => {
    if (id === 'guess-image') {
      navigate('/games/guess-image');
    } else if (id === '3d-training') {
      navigate('/games/3d-training');
    } else {
      const gameUrl = `/games/demo.html?game=${id}`;
      window.open(gameUrl, '_blank', 'width=1000,height=700');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${isComingSoon ? 'opacity-70' : 'hover:transform hover:scale-105'}`}>
      <div className="h-48 bg-gradient-to-br from-kz-red to-red-700 flex items-center justify-center text-6xl text-white relative">
        {icon}
        {isComingSoon && (
          <div className="absolute top-4 right-4 bg-kz-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
            Скоро
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Длительность: {duration}
          </div>

          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <Button
          onClick={openGame}
          disabled={isComingSoon}
          className="w-full bg-kz-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Play className="w-4 h-4 mr-2" />
          {isComingSoon ? 'Скоро будет доступно' : 'Играть (Демо)'}
        </Button>
      </div>
    </div>
  );
};

export default function GamesPage() {
  const [location, navigate] = useLocation();

  // Удаляем автоматический редирект

  const games: GameCardProps[] = [
    {
      id: '3d-training',
      title: '🎮 3D Immersive Training',
      description: 'НОВИНКА! Революционный 3D тренажер с реалистичной физикой огня, первое лицо и интерактивными сценариями. Полное погружение!',
      icon: '🔥',
      difficulty: 'Средний',
      duration: '10-20 минут',
      features: ['Реалистичная 3D физика', 'Первое лицо (WASD)', 'Разные сценарии', 'VR-готов', 'Казахстанские здания']
    },
    {
      id: 'guess-image',
      title: 'Угадай картинку',
      description: 'Проверьте свои знания пожарной безопасности с помощью интерактивной игры "Угадай картинку". Вопросы для всех уровней подготовки.',
      icon: '🖼️',
      difficulty: 'Новичок',
      duration: '5-10 минут',
      features: ['4 уровня сложности', 'Система подсказок', 'Интерактивные вопросы']
    },
    {
      id: 'pass-method',
      title: 'PASS Метод',
      description: 'Изучите правильную технику использования огнетушителя: Pull-Aim-Squeeze-Sweep. Интерактивная симуляция с пошаговыми инструкциями.',
      icon: '🧯',
      difficulty: 'Новичок',
      duration: '5-7 минут',
      features: ['Пошаговое обучение', 'Система очков', 'Интерактивная симуляция']
    },
    {
      id: 'evacuation-plan',
      title: 'План Эвакуации',
      description: 'Создайте правильный план эвакуации для различных типов зданий. Учитывайте расположение выходов, пути эвакуации и места сбора.',
      icon: '🚪',
      difficulty: 'Средний',
      duration: '10-15 минут',
      features: ['Разные типы зданий', 'Проверка знаний', 'Построение маршрутов']
    },
    {
      id: 'inspector-violations',
      title: 'Инспектор: Найди Нарушение',
      description: 'Проведите инспекцию объектов и найдите нарушения пожарной безопасности. Реалистичные сценарии с подробными пояснениями.',
      icon: '🔍',
      difficulty: 'Эксперт',
      duration: '15-20 минут',
      features: ['Детальная инспекция', 'База знаний НПА', 'Реальные сценарии']
    },
    {
      id: 'fire-systems',
      title: 'Системы Пожаротушения',
      description: 'Изучите принципы работы различных систем пожаротушения: спринклерные, дренчерные, газовые, порошковые системы.',
      icon: '🚰',
      difficulty: 'Средний',
      duration: '8-12 минут',
      features: ['Разные системы', 'Техническая симуляция', 'Принципы работы'],
      isComingSoon: true
    },
    {
      id: 'first-aid',
      title: 'Первая Помощь при Пожаре',
      description: 'Научитесь оказывать первую помощь пострадавшим при пожаре: ожоги, отравление дымом, эвакуация пострадавших.',
      icon: '🚑',
      difficulty: 'Новичок',
      duration: '6-10 минут',
      features: ['Медицинская помощь', 'Практические навыки', 'Алгоритмы действий'],
      isComingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-kz-blue to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          {/* Background particles effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-20 w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
            <div className="absolute bottom-10 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Главная
            </Button>
            <ExternalLink className="w-5 h-5" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Интерактивные Игры</h1>
          <p className="text-xl mb-6 opacity-90">
            Обучающие тренажеры по пожарной безопасности для практической подготовки
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center bg-white/10 rounded-lg p-4">
              <Award className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold">Система достижений</div>
                <div className="text-sm opacity-80">Отслеживайте прогресс</div>
              </div>
            </div>
            <div className="flex items-center bg-white/10 rounded-lg p-4">
              <Users className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold">Для всех уровней</div>
                <div className="text-sm opacity-80">От новичка до эксперта</div>
              </div>
            </div>
            <div className="flex items-center bg-white/10 rounded-lg p-4">
              <Clock className="w-8 h-8 mr-3" />
              <div>
                <div className="font-semibold">Быстрое обучение</div>
                <div className="text-sm opacity-80">5-20 минут на игру</div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-center">О Тренажерах</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Обучающие цели:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Практическое применение теоретических знаний</li>
                <li>• Отработка навыков в безопасной среде</li>
                <li>• Подготовка к реальным чрезвычайным ситуациям</li>
                <li>• Изучение нормативных требований в интерактивной форме</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Особенности:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Реалистичные сценарии и ситуации</li>
                <li>• Система оценки и обратная связь</li>
                <li>• Подробные пояснения и инструкции</li>
                <li>• Возможность повторного прохождения</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}