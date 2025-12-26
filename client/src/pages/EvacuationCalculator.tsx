
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Users, Clock, ArrowLeft, FileText, ExternalLink, AlertTriangle, Plus, Trash2, RefreshCw, Printer } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Report from "@/components/ui/Report";

interface Exit {
  width: number;
  distance: number;
  capacity?: number;
  people?: number;
}

interface EvacuationResult {
  time: number;
  movementTime: number;
  exitTime: number;
  bottleneck: string;
  recommendations: string[];
  exits?: Exit[];
  totalCapacity?: number;
  alerts?: string[];
}

export default function EvacuationCalculator() {
  const [peopleCount, setPeopleCount] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [calculationMode, setCalculationMode] = useState<"single" | "multiple">("single");
  const [exits, setExits] = useState<Exit[]>([{ width: 1.2, distance: 25 }]);
  const [evacuationResult, setEvacuationResult] = useState<EvacuationResult | null>(null);

  const buildingParams = {
    office: { throughput: 54, speed: 80, name: "Административное здание", maxDistance: 40 },
    retail: { throughput: 40, speed: 60, name: "Торговое здание", maxDistance: 30 },
    warehouse: { throughput: 60, speed: 100, name: "Складское здание", maxDistance: 50 },
    industrial: { throughput: 50, speed: 80, name: "Производственное здание", maxDistance: 45 },
    residential: { throughput: 45, speed: 75, name: "Жилое здание", maxDistance: 35 },
    educational: { throughput: 35, speed: 50, name: "Образовательное учреждение", maxDistance: 25 },
    medical: { throughput: 30, speed: 40, name: "Медицинское учреждение", maxDistance: 20 }
  };

  const addExit = () => {
    setExits([...exits, { width: 1.2, distance: 25 }]);
  };

  const removeExit = (index: number) => {
    if (exits.length > 1) {
      setExits(exits.filter((_, i) => i !== index));
    }
  };

  const updateExit = (index: number, field: keyof Exit, value: number) => {
    const newExits = [...exits];
    newExits[index][field] = value;
    setExits(newExits);
  };

  const resetCalculator = () => {
    setPeopleCount("");
    setBuildingType("");
    setExits([{ width: 1.2, distance: 25 }]);
    setCalculationMode("single");
    setEvacuationResult(null);
  };

  const calculateEvacuation = () => {
    const peopleNum = parseInt(peopleCount);
    
    if (!peopleNum || !buildingType || exits.length === 0) return;

    const params = buildingParams[buildingType];
    if (!params) return;

    // Валидация и предупреждения
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Проверка ширины выходов
    exits.forEach((exit, i) => {
      if (exit.width < 0.8) {
        alerts.push(`Выход ${i + 1}: ширина ${exit.width}м меньше минимальной (0.8м)`);
      }
      if (exit.width > 2.4) {
        alerts.push(`Выход ${i + 1}: ширина ${exit.width}м превышает эффективную (2.4м)`);
      }
      if (exit.distance > params.maxDistance) {
        alerts.push(`Выход ${i + 1}: расстояние ${exit.distance}м превышает максимальное (${params.maxDistance}м)`);
      }
    });

    // Расчет для каждого выхода
    const exitResults: Exit[] = exits.map((exit, i) => {
      const capacity = exit.width * params.throughput; // чел/мин
      const movementTime = exit.distance / params.speed; // мин
      
      return {
        ...exit,
        capacity,
        people: 0 // будет заполнено при распределении
      };
    });

    // Распределение людей по выходам (пропорционально пропускной способности)
    const totalCapacity = exitResults.reduce((sum, exit) => sum + (exit.capacity || 0), 0);
    let remainingPeople = peopleNum;

    exitResults.forEach((exit, i) => {
      if (i === exitResults.length - 1) {
        // Последний выход получает оставшихся людей
        exit.people = remainingPeople;
      } else {
        const proportion = (exit.capacity || 0) / totalCapacity;
        exit.people = Math.round(peopleNum * proportion);
        remainingPeople -= exit.people;
      }
    });

    // Расчет времени эвакуации для каждого выхода
    let maxTime = 0;
    let bottleneck = "";

    exitResults.forEach((exit, i) => {
      const movementTime = exit.distance / params.speed;
      const exitTime = (exit.people || 0) / (exit.capacity || 1);
      const totalTime = Math.max(movementTime, exitTime);

      if (totalTime > maxTime) {
        maxTime = totalTime;
        bottleneck = movementTime > exitTime ? 
          `Выход ${i + 1}: движение по путям эвакуации` : 
          `Выход ${i + 1}: пропускная способность выхода`;
      }
    });

    // Рекомендации по времени эвакуации
    if (maxTime > 6) {
      recommendations.push('Время эвакуации превышает 6 минут - требуются дополнительные выходы или увеличение ширины существующих');
    } else if (maxTime > 4) {
      recommendations.push('Время эвакуации приближается к критическому - рекомендуется оптимизация');
    } else if (maxTime <= 3) {
      recommendations.push('Отличное время эвакуации - система работает эффективно');
    } else {
      recommendations.push('Приемлемое время эвакуации в пределах нормы');
    }

    // Дополнительные рекомендации
    if (exits.length === 1) {
      recommendations.push('Рекомендуется предусмотреть дополнительные эвакуационные выходы для повышения безопасности');
    }

    if (totalCapacity < peopleNum * 1.2) {
      recommendations.push('Суммарная пропускная способность выходов недостаточна - увеличьте ширину или количество выходов');
    }

    const avgMovementTime = exitResults.reduce((sum, exit) => sum + exit.distance / params.speed, 0) / exits.length;
    const avgExitTime = exitResults.reduce((sum, exit) => sum + ((exit.people || 0) / (exit.capacity || 1)), 0) / exits.length;

    setEvacuationResult({
      time: Math.round(maxTime * 10) / 10,
      movementTime: Math.round(avgMovementTime * 10) / 10,
      exitTime: Math.round(avgExitTime * 10) / 10,
      bottleneck,
      recommendations,
      exits: exitResults,
      totalCapacity: Math.round(totalCapacity),
      alerts
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Калькулятор времени эвакуации - СП РК 2.02-101-2022 | NewsFire"
        description="Профессиональный калькулятор времени эвакуации людей из помещений по СП РК 2.02-101-2022. Расчёт пропускной способности выходов, скорости движения и узких мест."
        keywords="время эвакуации, СП РК 2.02-101-2022, пропускная способность, эвакуационные выходы, скорость движения, пожарная безопасность"
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Калькулятор времени эвакуации",
          "description": "Калькулятор для расчёта времени эвакуации людей из помещений",
          "applicationCategory": "UtilityApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KZT"
          }
        }}
      />
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Калькуляторы", href: "/calculators", icon: Shield },
              { label: "Время эвакуации", icon: Users }
            ]}
            className="mb-4"
          />
          <Link href="/calculators">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Назад к калькуляторам
            </Button>
          </Link>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Users className="mr-3 w-8 h-8 text-green-500" />
            Калькулятор времени эвакуации
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Расчет времени эвакуации людей из помещения по СП РК 2.02-101-2022
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Калькулятор */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Параметры эвакуации</CardTitle>
                <CardDescription>
                  Введите данные о здании и количестве людей для расчета времени эвакуации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Основные параметры */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="people-count">Общее количество людей</Label>
                    <Input
                      id="people-count"
                      type="number"
                      placeholder="100"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      min="1"
                      step="1"
                      data-testid="input-people-count"
                    />
                  </div>

                  <div>
                    <Label htmlFor="building-type">Тип здания</Label>
                    <Select value={buildingType} onValueChange={setBuildingType}>
                      <SelectTrigger data-testid="select-building-type">
                        <SelectValue placeholder="Выберите тип здания" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Административное здание</SelectItem>
                        <SelectItem value="retail">Торговое здание</SelectItem>
                        <SelectItem value="warehouse">Складское здание</SelectItem>
                        <SelectItem value="industrial">Производственное здание</SelectItem>
                        <SelectItem value="residential">Жилое здание</SelectItem>
                        <SelectItem value="educational">Образовательное учреждение</SelectItem>
                        <SelectItem value="medical">Медицинское учреждение</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Эвакуационные выходы */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Эвакуационные выходы</Label>
                    <div className="flex gap-2">
                      <Button onClick={addExit} variant="outline" size="sm" data-testid="button-add-exit">
                        <Plus className="w-4 h-4 mr-1" />
                        Добавить выход
                      </Button>
                      <Button onClick={resetCalculator} variant="outline" size="sm" data-testid="button-reset">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Сброс
                      </Button>
                    </div>
                  </div>

                  {exits.map((exit, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Выход {index + 1}</h4>
                        {exits.length > 1 && (
                          <Button
                            onClick={() => removeExit(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-remove-exit-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`exit-width-${index}`}>Ширина (м)</Label>
                          <Input
                            id={`exit-width-${index}`}
                            type="number"
                            step="0.1"
                            placeholder="1.2"
                            value={exit.width}
                            onChange={(e) => updateExit(index, 'width', parseFloat(e.target.value) || 0)}
                            min="0.1"
                            max="5"
                            data-testid={`input-exit-width-${index}`}
                          />
                          {exit.width < 0.8 && (
                            <p className="text-sm text-red-600 mt-1">Минимум 0.8м</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`exit-distance-${index}`}>Расстояние (м)</Label>
                          <Input
                            id={`exit-distance-${index}`}
                            type="number"
                            step="0.5"
                            placeholder="25"
                            value={exit.distance}
                            onChange={(e) => updateExit(index, 'distance', parseFloat(e.target.value) || 0)}
                            min="1"
                            max="200"
                            data-testid={`input-exit-distance-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button onClick={calculateEvacuation} className="w-full" size="lg" data-testid="button-calculate">
                  <Clock className="mr-2 w-4 h-4" />
                  Рассчитать время эвакуации
                </Button>

                {/* Предупреждения */}
                {evacuationResult?.alerts && evacuationResult.alerts.length > 0 && (
                  <div className="space-y-2">
                    {evacuationResult.alerts.map((alert, index) => (
                      <Alert key={index} className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                          {alert}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Отчёт */}
                {evacuationResult && (
                  <Report
                    title="Отчёт по расчёту времени эвакуации"
                    subtitle={`Здание: ${buildingParams[buildingType]?.name || 'Не выбрано'} | Людей: ${peopleCount} | Выходов: ${exits.length}`}
                    calculatorType="Расчёт времени эвакуации"
                    inputs={[
                      { label: "Количество людей", value: peopleCount, unit: "чел" },
                      { label: "Тип здания", value: buildingParams[buildingType]?.name || 'Не выбрано' },
                      { label: "Количество выходов", value: exits.length.toString() },
                      ...(evacuationResult.exits || []).map((exit, i) => ({
                        label: `Выход ${i + 1}`,
                        value: `${exit.width}м × ${exit.distance}м`,
                        description: `Пропускная способность: ${Math.round(exit.capacity || 0)} чел/мин, Людей: ${exit.people || 0}`
                      }))
                    ]}
                    result={{
                      value: evacuationResult.time,
                      unit: "минут",
                      description: `Общее время эвакуации ${evacuationResult.time} мин (узкое место: ${evacuationResult.bottleneck})`,
                      status: evacuationResult.time <= 3 ? "success" : evacuationResult.time <= 6 ? "warning" : "error"
                    }}
                    formulas={[
                      {
                        name: "Пропускная способность выходов",
                        formula: "Q = Ширина × k_проп",
                        substitution: `Q_общая = ${(evacuationResult.exits || []).map((exit, i) => `${exit.width} × ${buildingParams[buildingType]?.throughput || 0}`).join(' + ')} = ${evacuationResult.totalCapacity} чел/мин`,
                        result: evacuationResult.totalCapacity || 0,
                        unit: "чел/мин"
                      },
                      {
                        name: "Время движения до выходов",
                        formula: "t_движ = L / v",
                        substitution: `t_движ = ${(evacuationResult.exits || []).map(exit => `${exit.distance}/${buildingParams[buildingType]?.speed || 0}`).join(', ')} = ${evacuationResult.movementTime} мин (среднее)`,
                        result: evacuationResult.movementTime,
                        unit: "мин"
                      },
                      {
                        name: "Время прохода через выходы",
                        formula: "t_выход = N_людей / Q_выхода",
                        substitution: `t_выход = ${(evacuationResult.exits || []).map((exit, i) => `${exit.people}/${Math.round(exit.capacity || 1)}`).join(', ')} = ${evacuationResult.exitTime} мин (среднее)`,
                        result: evacuationResult.exitTime,
                        unit: "мин"
                      }
                    ]}
                    calculations={[
                      { name: "Время движения", value: evacuationResult.movementTime, unit: "мин", description: "Среднее время движения людей к выходам" },
                      { name: "Время прохода", value: evacuationResult.exitTime, unit: "мин", description: "Среднее время прохода через выходы" },
                      { name: "Общая пропускная способность", value: evacuationResult.totalCapacity || 0, unit: "чел/мин", description: "Суммарная пропускная способность всех выходов" },
                      { name: "Скорость движения", value: buildingParams[buildingType]?.speed || 0, unit: "м/мин", description: "Скорость движения людей для данного типа здания" }
                    ]}
                    detailedData={[
                      { name: "Время движения", value: evacuationResult.movementTime, unit: "мин", description: "Среднее время движения людей к выходам" },
                      { name: "Время прохода", value: evacuationResult.exitTime, unit: "мин", description: "Среднее время прохода через выходы" },
                      { name: "Общая пропускная способность", value: evacuationResult.totalCapacity || 0, unit: "чел/мин", description: "Суммарная пропускная способность всех выходов" },
                      { name: "Скорость движения", value: buildingParams[buildingType]?.speed || 0, unit: "м/мин", description: "Скорость движения людей для данного типа здания" }
                    ]}
                    justification="Расчёт времени эвакуации выполнен в соответствии с требованиями СП РК 2.02-101-2022 'Противопожарные требования'. Учтены пропускная способность эвакуационных выходов, скорость движения людей по типу здания, распределение людского потока по выходам пропорционально их пропускной способности."
                    references={[
                      { anchor: "sp-rk-101-p41", text: "СП РК 2.02-101-2022, п. 4.1 - расчёт времени эвакуации", article: "СП РК 2.02-101-2022" },
                      { anchor: "sp-rk-101-p43", text: "СП РК 2.02-101-2022, п. 4.3 - пропускная способность путей эвакуации" },
                      { anchor: "sp-rk-101-p44", text: "СП РК 2.02-101-2022, п. 4.4 - скорость движения людей" },
                      { anchor: "sp-rk-101-p47", text: "СП РК 2.02-101-2022, п. 4.7 - минимальная ширина выходов" }
                    ]}
                    recommendations={evacuationResult.recommendations}
                    notes={[
                      "Расчёт носит справочный характер. Проектные решения принимает лицензированная организация",
                      "При наличии маломобильных групп населения требуется отдельный расчёт",
                      "Учитывайте особенности эксплуатации здания и возможные препятствия на путях эвакуации"
                    ]}
                    calculationUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    className="mt-8"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Справочная информация */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 w-5 h-5 text-green-500" />
                  Нормы эвакуации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Время эвакуации:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Отличное: до 3 мин</li>
                    <li>• Норма: до 6 мин</li>
                    <li>• Превышение: более 6 мин</li>
                  </ul>
                </div>
                <div>
                  <strong>Минимальная ширина выходов:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Обычные выходы: 0.8 м</li>
                    <li>• Главные выходы: 1.2 м</li>
                    <li>• На 1 чел: 6 мм ширины</li>
                  </ul>
                </div>
                <div>
                  <strong>Максимальные расстояния:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Офисы: 40 м</li>
                    <li>• Школы: 30 м</li>
                    <li>• Больницы: 25 м</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 w-5 h-5 text-blue-500" />
                  Параметры расчета
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>Скорость движения:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Офисы: 16 м/мин</li>
                    <li>• Школы: 12 м/мин</li>
                    <li>• Больницы: 10 м/мин</li>
                    <li>• ТЦ: 18 м/мин</li>
                  </ul>
                </div>
                <div>
                  <strong>Пропускная способность:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Офисы: 60 чел/мин/м</li>
                    <li>• Школы: 40 чел/мин/м</li>
                    <li>• Больницы: 30 чел/мин/м</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-orange-500" />
                  Нормативы
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>СП РК 2.02-101-2022</strong> - Пожарная безопасность зданий</p>
                <p><strong>СП РК 2.01-107-2022</strong> - Эвакуация людей</p>
                <p><strong>Формулы:</strong></p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• t_движ = L / V</li>
                  <li>• t_выход = N / (δ × q)</li>
                  <li>• t_общее = max(t_движ, t_выход)</li>
                </ul>
                
                <Link href="/calculators/methodology">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Подробная методичка
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Примеры расчетов</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>Офис 50 чел, выход 1.2м, 30м:</strong><br/>
                  max(30÷16, 50÷(1.2×60)) = 1.9 мин
                </div>
                <div>
                  <strong>Школа 100 чел, выход 1.5м, 25м:</strong><br/>
                  max(25÷12, 100÷(1.5×40)) = 2.1 мин
                </div>
                <div>
                  <strong>ТЦ 200 чел, выход 2м, 50м:</strong><br/>
                  max(50÷18, 200÷(2×65)) = 2.8 мин
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Другие калькуляторы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/calculators/fire-extinguishers">
                  <Button variant="outline" className="w-full mb-2">
                    Калькулятор огнетушителей
                  </Button>
                </Link>
                <Link href="/calculators/fire-load">
                  <Button variant="outline" className="w-full mb-2">
                    Калькулятор пожарной нагрузки
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button variant="outline" className="w-full">
                    Все калькуляторы
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
