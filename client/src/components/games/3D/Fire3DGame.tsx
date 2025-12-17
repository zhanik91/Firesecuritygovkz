import React, { useEffect, useRef, useState } from 'react';
import { FirePhysicsEngine } from './FirePhysicsEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Droplets, 
  Wind, 
  Flame,
  Shield,
  Timer,
  Target,
  Award
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import * as THREE from 'three';

interface GameStats {
  score: number;
  timeRemaining: number;
  firesExtinguished: number;
  accuracy: number;
  safetyViolations: number;
}

interface Fire3DGameProps {
  scenario: 'office' | 'hospital' | 'factory' | 'residential';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  onGameComplete?: (stats: GameStats) => void;
}

export default function Fire3DGame({ 
  scenario, 
  difficulty, 
  onGameComplete 
}: Fire3DGameProps) {
  const { t } = useLanguage();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FirePhysicsEngine | null>(null);
  
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'completed'>('loading');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    timeRemaining: 300, // 5 minutes
    firesExtinguished: 0,
    accuracy: 100,
    safetyViolations: 0
  });
  
  const [selectedTool, setSelectedTool] = useState<'water' | 'foam' | 'co2' | 'powder'>('water');
  const [activeInstructions, setActiveInstructions] = useState<string[]>([]);
  const [fires, setFires] = useState<any[]>([]);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Initialize 3D engine
    const engine = new FirePhysicsEngine(gameContainerRef.current);
    engineRef.current = engine;

    // Create building based on scenario
    const building = engine.createBuilding(scenario);
    engine.getScene().add(building);

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d23 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    engine.getScene().add(ground);

    // Setup scenario-specific fires
    setupScenario();
    
    setGameState('ready');

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [scenario]);

  const setupScenario = () => {
    if (!engineRef.current) return;

    const engine = engineRef.current;
    const newFires: any[] = [];

    // Different fire setups based on scenario and difficulty
    const fireConfigs = {
      office: {
        beginner: [
          { position: new THREE.Vector3(-5, 0, -8), intensity: 0.8 },
          { position: new THREE.Vector3(3, 0, 5), intensity: 0.6 }
        ],
        intermediate: [
          { position: new THREE.Vector3(-5, 0, -8), intensity: 1.0 },
          { position: new THREE.Vector3(3, 0, 5), intensity: 0.8 },
          { position: new THREE.Vector3(-8, 0, 10), intensity: 0.7 }
        ],
        expert: [
          { position: new THREE.Vector3(-5, 0, -8), intensity: 1.2 },
          { position: new THREE.Vector3(3, 0, 5), intensity: 1.0 },
          { position: new THREE.Vector3(-8, 0, 10), intensity: 0.9 },
          { position: new THREE.Vector3(6, 0, -12), intensity: 1.1 }
        ]
      },
      hospital: {
        beginner: [
          { position: new THREE.Vector3(-8, 0, -6), intensity: 0.7 }
        ],
        intermediate: [
          { position: new THREE.Vector3(-8, 0, -6), intensity: 0.9 },
          { position: new THREE.Vector3(5, 0, 8), intensity: 0.6 }
        ],
        expert: [
          { position: new THREE.Vector3(-8, 0, -6), intensity: 1.0 },
          { position: new THREE.Vector3(5, 0, 8), intensity: 0.8 },
          { position: new THREE.Vector3(0, 0, -15), intensity: 1.1 }
        ]
      },
      factory: {
        beginner: [
          { position: new THREE.Vector3(-15, 0, -10), intensity: 1.0 }
        ],
        intermediate: [
          { position: new THREE.Vector3(-15, 0, -10), intensity: 1.2 },
          { position: new THREE.Vector3(12, 0, 15), intensity: 1.0 }
        ],
        expert: [
          { position: new THREE.Vector3(-15, 0, -10), intensity: 1.4 },
          { position: new THREE.Vector3(12, 0, 15), intensity: 1.2 },
          { position: new THREE.Vector3(0, 0, 20), intensity: 1.3 },
          { position: new THREE.Vector3(-20, 0, 5), intensity: 1.1 }
        ]
      },
      residential: {
        beginner: [
          { position: new THREE.Vector3(-3, 0, -5), intensity: 0.6 }
        ],
        intermediate: [
          { position: new THREE.Vector3(-3, 0, -5), intensity: 0.8 },
          { position: new THREE.Vector3(4, 0, 6), intensity: 0.7 }
        ],
        expert: [
          { position: new THREE.Vector3(-3, 0, -5), intensity: 1.0 },
          { position: new THREE.Vector3(4, 0, 6), intensity: 0.9 },
          { position: new THREE.Vector3(0, 0, -12), intensity: 0.8 }
        ]
      }
    };

    const configs = fireConfigs[scenario][difficulty];
    
    configs.forEach(config => {
      const fire = engine.createFireSource(config.position, config.intensity);
      newFires.push(fire);
    });

    setFires(newFires);

    // Set scenario-specific instructions
    const instructions = {
      office: [
        'Оцените ситуацию и определите тип возгорания',
        'Выберите подходящий огнетушитель',
        'Подойдите к огню с наветренной стороны',
        'Примените технику PASS'
      ],
      hospital: [
        'Убедитесь в безопасности пациентов',
        'Выберите безопасный огнетушитель для медицинского оборудования',
        'Начните эвакуацию пациентов',
        'Тушите огонь, избегая повреждения оборудования'
      ],
      factory: [
        'Проверьте наличие химических веществ',
        'Определите класс пожара',
        'Отключите электропитание если необходимо',
        'Используйте соответствующий тип огнетушителя'
      ],
      residential: [
        'Убедитесь, что все люди эвакуированы',
        'Определите источник возгорания',
        'Используйте домашний огнетушитель',
        'Вызовите пожарную службу при необходимости'
      ]
    };

    setActiveInstructions(instructions[scenario]);
  };

  const startGame = () => {
    setGameState('playing');
    
    // Start game timer
    const timer = setInterval(() => {
      setStats(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          endGame();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resetGame = () => {
    // Reset all fires
    if (engineRef.current && fires.length > 0) {
      fires.forEach(fire => {
        engineRef.current!.getScene().remove(fire.group);
      });
    }

    // Reset stats
    setStats({
      score: 0,
      timeRemaining: 300,
      firesExtinguished: 0,
      accuracy: 100,
      safetyViolations: 0
    });

    setupScenario();
    setGameState('ready');
  };

  const endGame = () => {
    setGameState('completed');
    if (onGameComplete) {
      onGameComplete(stats);
    }
  };

  const handleFireClick = (event: React.MouseEvent) => {
    if (gameState !== 'playing' || !engineRef.current) return;

    // Raycast to detect fire click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const rect = gameContainerRef.current!.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, engineRef.current.getCamera());

    // Find closest fire and attempt to extinguish
    let closestFire = null;
    let minDistance = Infinity;

    fires.forEach(fire => {
      const distance = raycaster.ray.distanceToPoint(fire.group.position);
      if (distance < minDistance && distance < 5) {
        minDistance = distance;
        closestFire = fire;
      }
    });

    if (closestFire) {
      // Extinguish fire
      engineRef.current.extinguishFire(closestFire.group, selectedTool);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        score: prev.score + 100,
        firesExtinguished: prev.firesExtinguished + 1
      }));

      // Remove fire from array
      setFires(prev => prev.filter(f => f !== closestFire));

      // Check if all fires are extinguished
      if (fires.length === 1) {
        setTimeout(() => endGame(), 1000);
      }
    } else {
      // Missed shot - decrease accuracy
      setStats(prev => ({
        ...prev,
        accuracy: Math.max(0, prev.accuracy - 5)
      }));
    }
  };

  const getScenarioInfo = () => {
    const info = {
      office: {
        title: 'Офисное здание',
        description: 'Тушение пожара в офисном здании с электрооборудованием',
        tips: ['Осторожно с электричеством', 'Используйте CO2 для компьютеров']
      },
      hospital: {
        title: 'Больница',
        description: 'Критическая ситуация в медицинском учреждении',
        tips: ['Приоритет - безопасность пациентов', 'Осторожно с медицинским оборудованием']
      },
      factory: {
        title: 'Промышленное предприятие',
        description: 'Пожар на производстве с химическими веществами',
        tips: ['Определите тип химикатов', 'Отключите оборудование']
      },
      residential: {
        title: 'Жилой дом',
        description: 'Бытовой пожар в жилом помещении',
        tips: ['Убедитесь в эвакуации жильцов', 'Используйте подручные средства']
      }
    };
    return info[scenario];
  };

  if (gameState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kz-blue mx-auto mb-4"></div>
          <p>Загрузка 3D движка...</p>
        </div>
      </div>
    );
  }

  const scenarioInfo = getScenarioInfo();

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {scenarioInfo.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {scenarioInfo.description}
              </p>
            </div>
            <Badge variant={difficulty === 'expert' ? 'destructive' : difficulty === 'intermediate' ? 'default' : 'secondary'}>
              {difficulty === 'beginner' ? 'Новичок' : difficulty === 'intermediate' ? 'Средний' : 'Эксперт'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-kz-blue">{stats.score}</div>
            <div className="text-xs text-gray-600">Очки</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(stats.timeRemaining / 60)}:{(stats.timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600">Время</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.firesExtinguished}</div>
            <div className="text-xs text-gray-600">Потушено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
            <div className="text-xs text-gray-600">Точность</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={gameState === 'ready' ? startGame : gameState === 'playing' ? pauseGame : startGame}
              className="bg-kz-blue hover:bg-kz-blue/90"
            >
              {gameState === 'playing' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {gameState === 'playing' ? 'Пауза' : 'Старт'}
            </Button>
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Сброс
            </Button>
          </div>

          {/* Fire Extinguisher Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите огнетушитель:</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={selectedTool === 'water' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('water')}
              >
                <Droplets className="w-4 h-4 mr-1" />
                Вода
              </Button>
              <Button
                size="sm"
                variant={selectedTool === 'foam' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('foam')}
              >
                <Wind className="w-4 h-4 mr-1" />
                Пена
              </Button>
              <Button
                size="sm"
                variant={selectedTool === 'co2' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('co2')}
              >
                <Zap className="w-4 h-4 mr-1" />
                CO2
              </Button>
              <Button
                size="sm"
                variant={selectedTool === 'powder' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('powder')}
              >
                <Shield className="w-4 h-4 mr-1" />
                Порошок
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Game Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={gameContainerRef} 
            className="w-full h-96 bg-gray-900 cursor-crosshair relative overflow-hidden rounded"
            onClick={handleFireClick}
          >
            {gameState === 'ready' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Flame className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h3 className="text-xl font-bold mb-2">Готов к началу</h3>
                  <p className="mb-4">Используйте WASD для движения, мышь для осмотра</p>
                  <Button onClick={startGame} className="bg-kz-blue hover:bg-kz-blue/90">
                    <Play className="w-4 h-4 mr-2" />
                    Начать игру
                  </Button>
                </div>
              </div>
            )}
            
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Pause className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-4">Игра приостановлена</h3>
                  <Button onClick={() => setGameState('playing')} className="bg-kz-blue hover:bg-kz-blue/90">
                    <Play className="w-4 h-4 mr-2" />
                    Продолжить
                  </Button>
                </div>
              </div>
            )}

            {gameState === 'completed' && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-2xl font-bold mb-2">Игра завершена!</h3>
                  <div className="space-y-2 mb-6">
                    <p>Финальный счет: <span className="font-bold text-kz-blue">{stats.score}</span></p>
                    <p>Потушено пожаров: <span className="font-bold text-green-400">{stats.firesExtinguished}</span></p>
                    <p>Точность: <span className="font-bold text-purple-400">{stats.accuracy}%</span></p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={resetGame} className="bg-kz-blue hover:bg-kz-blue/90">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Играть снова
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Инструкции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeInstructions.map((instruction, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-kz-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm">{instruction}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <h4 className="font-medium text-sm mb-2">Полезные советы:</h4>
            <ul className="text-xs space-y-1">
              {scenarioInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-yellow-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}