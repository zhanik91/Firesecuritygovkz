
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react';

interface Question {
  text: string;
  image: string;
  options: string[];
  correctAnswer: number;
  hint: string;
}

interface GameData {
  [key: string]: {
    questions: Question[];
  };
}

const gameData: GameData = {
  children: {
    questions: [
      {
        text: "Что это за машина?",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE4MCIgaGVpZ2h0PSI2MCIgeD0iMTAiIHk9IjIwIiBmaWxsPSIjZGMzNjI2IiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7Qn9C+0LbQsNGA0L3QsNGPPC90ZXh0Pjwvc3ZnPg==",
        options: ["Пожарная машина", "Скорая помощь", "Полицейская машина"],
        correctAnswer: 0,
        hint: "Эта машина красного цвета и используется для тушения пожаров."
      },
      {
        text: "Что это за предмет?",
        image: "🧯",
        options: ["Огнетушитель", "Пылесос", "Баллон с водой"],
        correctAnswer: 0,
        hint: "Этот предмет используется для тушения небольших пожаров."
      },
      {
        text: "Кто это?",
        image: "👨‍🚒",
        options: ["Пожарный", "Полицейский", "Врач"],
        correctAnswer: 0,
        hint: "Этот человек спасает людей из горящих зданий."
      },
      {
        text: "Что это за знак?",
        image: "🚪",
        options: ["Знак 'Выход'", "Знак 'Вход'", "Знак 'Стоп'"],
        correctAnswer: 0,
        hint: "Этот знак показывает, куда нужно идти, чтобы выйти из здания в случае пожара."
      },
      {
        text: "Что это за номер телефона для вызова пожарных?",
        image: "📞",
        options: ["01 (101, 112)", "02 (102)", "03 (103)"],
        correctAnswer: 0,
        hint: "По этому номеру вызывают пожарных в случае пожара."
      },
      {
        text: "Что это за предмет?",
        image: "🔥",
        options: ["Пожарный рукав", "Садовый шланг", "Веревка"],
        correctAnswer: 0,
        hint: "Через этот предмет пожарные подают воду для тушения пожара."
      },
      {
        text: "Что это за устройство на потолке?",
        image: "🔔",
        options: ["Датчик дыма", "Лампочка", "Вентилятор"],
        correctAnswer: 0,
        hint: "Это устройство издает громкий звук, когда в комнате появляется дым."
      }
    ]
  },
  school: {
    questions: [
      {
        text: "Какой знак пожарной безопасности изображен?",
        image: "⚠️",
        options: ["Знак 'Огнетушитель'", "Знак 'Пожарный кран'", "Знак 'Выход'"],
        correctAnswer: 0,
        hint: "Этот знак указывает на место расположения огнетушителя."
      },
      {
        text: "Какой класс пожара обозначен на маркировке?",
        image: "🔥",
        options: ["Класс A (твердые горючие вещества)", "Класс B (горючие жидкости)", "Класс C (горючие газы)"],
        correctAnswer: 0,
        hint: "Этот класс пожара относится к горению твердых веществ, таких как дерево, бумага, ткань."
      },
      {
        text: "Что изображено на картинке?",
        image: "🗺️",
        options: ["План эвакуации при пожаре", "Карта города", "Схема метро"],
        correctAnswer: 0,
        hint: "Этот план показывает, как безопасно покинуть здание в случае пожара."
      },
      {
        text: "Какой метод самоспасения показан?",
        image: "🤸",
        options: ["Остановись, упади, катайся", "Беги и прыгай", "Стой и кричи"],
        correctAnswer: 0,
        hint: "Этот метод помогает потушить горящую на человеке одежду."
      },
      {
        text: "Что это за инструкция?",
        image: "📋",
        options: ["Инструкция по использованию огнетушителя", "Инструкция по сборке мебели", "Правила дорожного движения"],
        correctAnswer: 0,
        hint: "Эта инструкция показывает, как правильно использовать огнетушитель при пожаре."
      },
      {
        text: "Что это за кнопка?",
        image: "🔴",
        options: ["Кнопка пожарной сигнализации", "Кнопка вызова лифта", "Кнопка звонка"],
        correctAnswer: 0,
        hint: "Эту кнопку нажимают для активации пожарной тревоги в здании."
      },
      {
        text: "Что это за предмет?",
        image: "🛡️",
        options: ["Противопожарное одеяло", "Обычное одеяло", "Коврик для йоги"],
        correctAnswer: 0,
        hint: "Этим предметом можно накрыть небольшой пожар, чтобы перекрыть доступ кислорода."
      }
    ]
  },
  responsible: {
    questions: [
      {
        text: "Какой тип огнетушителя изображен?",
        image: "🧯",
        options: ["Порошковый огнетушитель", "Углекислотный огнетушитель", "Водный огнетушитель"],
        correctAnswer: 0,
        hint: "Этот тип огнетушителя содержит сухой химический порошок и подходит для тушения пожаров классов A, B и C."
      },
      {
        text: "Какой элемент системы пожарной сигнализации?",
        image: "🎛️",
        options: ["Контрольная панель", "Датчик движения", "Камера видеонаблюдения"],
        correctAnswer: 0,
        hint: "Этот элемент является центральным устройством управления системой пожарной сигнализации."
      },
      {
        text: "Что изображено на картинке?",
        image: "🗺️",
        options: ["План эвакуации при пожаре", "План размещения мебели", "Архитектурный план здания"],
        correctAnswer: 0,
        hint: "Этот план показывает пути эвакуации и расположение противопожарного оборудования в здании."
      },
      {
        text: "Какой элемент противопожарной защиты?",
        image: "🚪",
        options: ["Противопожарная дверь", "Обычная межкомнатная дверь", "Входная дверь"],
        correctAnswer: 0,
        hint: "Этот элемент предназначен для предотвращения распространения огня и дыма между помещениями."
      },
      {
        text: "Какой тип пожарного рукава?",
        image: "🔗",
        options: ["Прорезиненный пожарный рукав", "Напорно-всасывающий рукав", "Рукав для бытового использования"],
        correctAnswer: 0,
        hint: "Этот тип рукава имеет резиновое покрытие и используется для подачи воды под давлением."
      },
      {
        text: "Какой элемент системы пожаротушения?",
        image: "💧",
        options: ["Спринклерная головка", "Датчик дыма", "Вентиляционная решетка"],
        correctAnswer: 0,
        hint: "Этот элемент автоматически распыляет воду при достижении определенной температуры."
      },
      {
        text: "Что изображено?",
        image: "🔧",
        options: ["Пожарный гидрант", "Водопроводный кран", "Газовый клапан"],
        correctAnswer: 0,
        hint: "Это устройство обеспечивает доступ к водопроводной системе для пожарных машин."
      }
    ]
  },
  professional: {
    questions: [
      {
        text: "Какой тип системы пожаротушения?",
        image: "🏭",
        options: ["Спринклерная система", "Дренчерная система", "Система газового пожаротушения"],
        correctAnswer: 0,
        hint: "Эта система использует термочувствительные элементы для автоматического срабатывания отдельных оросителей."
      },
      {
        text: "Какой класс пожара НЕ может тушить углекислотный огнетушитель?",
        image: "⚡",
        options: ["Класс A (твердые горючие вещества)", "Класс E (электрооборудование)", "Класс D (металлы)"],
        correctAnswer: 0,
        hint: "Углекислотные огнетушители неэффективны для тушения пожаров твердых материалов."
      },
      {
        text: "Какой тип противопожарной двери?",
        image: "🛡️",
        options: ["Дверь с пределом огнестойкости EI60", "Дымонепроницаемая дверь", "Противопожарная дверь с остеклением"],
        correctAnswer: 0,
        hint: "Маркировка EI60 означает 60 минут огнестойкости."
      },
      {
        text: "Какой компонент отсутствует в системе?",
        image: "📢",
        options: ["Звуковой оповещатель", "Ручной извещатель", "Дымовой извещатель"],
        correctAnswer: 0,
        hint: "Отсутствуют устройства звукового оповещения."
      },
      {
        text: "Максимальный радиус обслуживания пожарного гидранта?",
        image: "📏",
        options: ["150 метров", "200 метров", "100 метров"],
        correctAnswer: 0,
        hint: "Согласно СП 8.13130, радиус не должен превышать 150 метров."
      },
      {
        text: "Какой рукав имеет наибольшее рабочее давление?",
        image: "💪",
        options: ["Напорный рукав повышенной прочности", "Прорезиненный напорный рукав", "Напорно-всасывающий рукав"],
        correctAnswer: 0,
        hint: "Рукава повышенной прочности рассчитаны на давление до 3,0 МПа."
      },
      {
        text: "Минимальный предел огнестойкости несущих конструкций I степени?",
        image: "🏗️",
        options: ["R 120", "R 90", "R 60"],
        correctAnswer: 0,
        hint: "Согласно ФЗ №123, предел должен быть не менее R 120."
      }
    ]
  }
};

export default function GuessImageGame() {
  const [location, navigate] = useLocation();
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const categoryNames = {
    children: 'Для детей (5-8 лет)',
    school: 'Для школьников (9-14 лет)',
    responsible: 'Для ответственных за пожарную безопасность',
    professional: 'Для профессиональных пожарных'
  };

  const startTimer = () => {
    setTimeLeft(30);
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          // Автоматически переходим к следующему вопросу
          setTimeout(() => {
            if (currentQuestionIndex < gameData[currentCategory!].questions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
              setSelectedAnswer(null);
              setShowHint(false);
              startTimer();
            } else {
              setGameFinished(true);
            }
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const selectCategory = (category: string) => {
    setCurrentCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setHintsLeft(3);
    setCorrectAnswers(0);
    setShowHint(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameFinished(false);
    setStreak(0);
    setAchievements([]);
    startTimer();
  };

  const checkAnswer = (selectedIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(selectedIndex);
    
    const question = gameData[currentCategory!].questions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswer;
    
    if (isCorrect) {
      const baseScore = 10;
      const bonusScore = showHint ? 0 : 5; // Бонус за ответ без подсказки
      setScore(prev => prev + baseScore + bonusScore);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Проверяем достижения
      checkAchievements();
    } else {
      setStreak(0);
    }
    
    if (timerId) {
      clearInterval(timerId);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < gameData[currentCategory!].questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowHint(false);
        startTimer();
      } else {
        setGameFinished(true);
      }
    }, 1500);
  };

  const checkAchievements = () => {
    const newAchievements = [...achievements];
    
    if (streak >= 3 && !achievements.includes('streak3')) {
      newAchievements.push('streak3');
    }
    if (streak >= 5 && !achievements.includes('streak5')) {
      newAchievements.push('streak5');
    }
    if (correctAnswers === 1 && !achievements.includes('first_correct')) {
      newAchievements.push('first_correct');
    }
    if (!showHint && !achievements.includes('no_hints')) {
      newAchievements.push('no_hints');
    }
    
    setAchievements(newAchievements);
  };

  const restartGame = () => {
    setCurrentCategory(null);
    setGameFinished(false);
    setStreak(0);
    setAchievements([]);
  };

  const currentQuestion = currentCategory ? gameData[currentCategory].questions[currentQuestionIndex] : null;
  const totalQuestions = currentCategory ? gameData[currentCategory].questions.length : 0;
  const progressPercentage = currentCategory ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/games')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к играм
            </Button>
            
            <h1 className="text-4xl font-bold text-kz-red mb-4">
              Угадай картинку: Пожарная безопасность
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Выберите категорию, соответствующую вашему уровню знаний:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(categoryNames).map(([key, name]) => (
              <Button
                key={key}
                onClick={() => selectCategory(key)}
                className="h-auto p-8 text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-kz-red hover:text-white transition-all duration-300"
                variant="outline"
              >
                <div className="text-lg font-semibold">{name}</div>
              </Button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-kz-red mb-6">Результаты</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-xl">
                Вы ответили правильно на <span className="font-bold text-green-600">{correctAnswers}</span> из {totalQuestions} вопросов.
              </p>
              <p className="text-2xl font-bold">
                Ваш итоговый счет: <span className="text-kz-red">{score}</span>
              </p>
              
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {correctAnswers === totalQuestions && "🎉 Отличный результат!"}
                {correctAnswers >= totalQuestions * 0.8 && correctAnswers < totalQuestions && "👏 Очень хорошо!"}
                {correctAnswers >= totalQuestions * 0.6 && correctAnswers < totalQuestions * 0.8 && "👍 Хороший результат!"}
                {correctAnswers < totalQuestions * 0.6 && "📚 Стоит повторить материал"}
              </div>
              
              {achievements.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">🏆 Достижения:</h3>
                  <div className="space-y-1">
                    {achievements.includes('streak3') && <p>🔥 Серия из 3 правильных ответов</p>}
                    {achievements.includes('streak5') && <p>⚡ Серия из 5 правильных ответов</p>}
                    {achievements.includes('first_correct') && <p>🎯 Первый правильный ответ</p>}
                    {achievements.includes('no_hints') && <p>🧠 Ответ без подсказки</p>}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-x-4">
              <Button onClick={restartGame} className="bg-kz-red hover:bg-red-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Начать заново
              </Button>
              <Button variant="outline" onClick={() => navigate('/games')}>
                Вернуться к играм
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Вопрос {currentQuestionIndex + 1} из {totalQuestions}
            </span>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
                ⏰ {timeLeft}с
              </span>
              <span className="text-sm font-medium">
                Счет: {score}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-kz-red h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {currentQuestion?.text}
          </h2>
          
          {/* Image */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 bg-gradient-to-br from-kz-red to-red-700 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105">
              {currentQuestion?.image.startsWith('data:') ? (
                <img 
                  src={currentQuestion.image} 
                  alt="Вопрос" 
                  className="w-40 h-32 object-contain"
                />
              ) : (
                <span className="text-8xl">{currentQuestion?.image}</span>
              )}
            </div>
          </div>
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => checkAnswer(index)}
                disabled={selectedAnswer !== null}
                variant="outline"
                className={`w-full p-4 text-left h-auto ${
                  selectedAnswer === index
                    ? selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : selectedAnswer !== null && index === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
          
          {/* Hint */}
          <div className="text-center">
            <Button
              onClick={() => {
                setShowHint(true);
                setHintsLeft(prev => prev - 1);
              }}
              disabled={hintsLeft === 0 || showHint}
              variant="outline"
              className="mb-4"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Подсказка (осталось: {hintsLeft})
            </Button>
            
            {showHint && (
              <div className="text-gray-600 dark:text-gray-400 italic p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                {currentQuestion?.hint}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
