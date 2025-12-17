import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, RefreshCw, Printer, Clock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

interface EvacuationResult {
  evacuationTime: number; // время эвакуации, мин
  requiredTime: number; // требуемое время эвакуации, мин
  status: "safe" | "warning" | "danger";
  bottleneck: string; // узкое место
  recommendations: string[];
  calculations: {
    doorThroughput: number;
    corridorThroughput: number;
    stairThroughput: number;
    exitThroughput: number;
  };
}

// Справочные данные по пропускной способности (чел/мин·м)
const THROUGHPUT_DATA = {
  door: 60, // дверной проем
  corridor: 80, // коридор горизонтальный
  stair_down: 50, // лестница вниз
  stair_up: 40, // лестница вверх
  exit: 90, // эвакуационный выход
};

// Скорости движения людей (м/мин)
const MOVEMENT_SPEEDS = {
  horizontal: 100, // горизонтально
  stairs_down: 60, // по лестнице вниз
  stairs_up: 50, // по лестнице вверх
};

export default function EvacuationCalculator() {
  const [people, setPeople] = useState<string>("");
  const [buildingType, setBuildingType] = useState<string>("");
  
  // Параметры путей эвакуации
  const [doorWidth, setDoorWidth] = useState<string>("1.2");
  const [corridorWidth, setCorridorWidth] = useState<string>("2.0");
  const [corridorLength, setCorridorLength] = useState<string>("30");
  const [stairWidth, setStairWidth] = useState<string>("1.5");
  const [stairFlights, setStairFlights] = useState<string>("3");
  const [exitWidth, setExitWidth] = useState<string>("2.0");
  
  // Дополнительные параметры
  const [mobilityImpaired, setMobilityImpaired] = useState<string>("0");
  const [smokeDensity, setSmokeDensity] = useState<string>("clear");
  
  const [result, setResult] = useState<EvacuationResult | null>(null);

  const getRequiredEvacuationTime = (buildingType: string): number => {
    // Нормативное время эвакуации по СП РК (минуты)
    const times: Record<string, number> = {
      office: 6, // административные здания
      residential: 8, // жилые здания
      educational: 4, // учебные заведения
      healthcare: 10, // лечебные учреждения
      retail: 3, // торговые центры
      hotel: 8, // гостиницы
      industrial: 6, // производственные здания
      warehouse: 8, // складские помещения
    };
    return times[buildingType] || 6;
  };

  const calculate = () => {
    if (!people || !buildingType) return;

    const totalPeople = parseInt(people);
    const dWidth = parseFloat(doorWidth);
    const cWidth = parseFloat(corridorWidth);
    const cLength = parseFloat(corridorLength);
    const sWidth = parseFloat(stairWidth);
    const sFlights = parseInt(stairFlights);
    const eWidth = parseFloat(exitWidth);
    const impaired = parseInt(mobilityImpaired);
    
    // Пропускная способность элементов пути эвакуации (чел/мин)
    const doorThroughput = dWidth * THROUGHPUT_DATA.door;
    const corridorThroughput = cWidth * THROUGHPUT_DATA.corridor;
    const stairThroughput = sWidth * (sFlights > 0 ? THROUGHPUT_DATA.stair_down : THROUGHPUT_DATA.corridor);
    const exitThroughput = eWidth * THROUGHPUT_DATA.exit;

    // Найдем узкое место (минимальная пропускная способность)
    const throughputs = {
      door: doorThroughput,
      corridor: corridorThroughput,
      stair: stairThroughput,
      exit: exitThroughput,
    };

    const minThroughput = Math.min(...Object.values(throughputs));
    const bottleneck = Object.keys(throughputs).find(
      key => throughputs[key as keyof typeof throughputs] === minThroughput
    ) || "door";

    const bottleneckNames: Record<string, string> = {
      door: "дверной проем",
      corridor: "коридор",
      stair: "лестница",
      exit: "эвакуационный выход",
    };

    // Время движения по участкам (мин)
    const corridorTime = cLength / MOVEMENT_SPEEDS.horizontal;
    const stairTime = sFlights > 0 ? (sFlights * 3.5) / MOVEMENT_SPEEDS.stairs_down : 0; // 3.5м на этаж

    // Время эвакуации через узкое место
    let evacuationTime = totalPeople / minThroughput + corridorTime + stairTime;

    // Коррекция на задымление
    if (smokeDensity === "light") evacuationTime *= 1.3;
    else if (smokeDensity === "heavy") evacuationTime *= 1.8;

    // Коррекция на людей с ограниченной подвижностью
    if (impaired > 0) {
      evacuationTime *= (1 + (impaired / totalPeople) * 0.5);
    }

    const requiredTime = getRequiredEvacuationTime(buildingType);
    
    // Определение статуса безопасности
    let status: "safe" | "warning" | "danger";
    if (evacuationTime <= requiredTime * 0.8) status = "safe";
    else if (evacuationTime <= requiredTime) status = "warning";
    else status = "danger";

    // Рекомендации
    const recommendations: string[] = [];
    
    if (status === "danger") {
      recommendations.push("⚠️ ПРЕВЫШЕНО нормативное время эвакуации! Необходимы срочные меры.");
    } else if (status === "warning") {
      recommendations.push("⚠️ Время эвакуации близко к нормативу. Рекомендуется оптимизация.");
    } else {
      recommendations.push("✅ Время эвакуации соответствует нормативным требованиям.");
    }

    if (bottleneck === "door") {
      recommendations.push(`Узкое место: ${bottleneckNames[bottleneck]} (${dWidth}м). Рекомендуется увеличить ширину или добавить дополнительные двери.`);
    } else if (bottleneck === "corridor") {
      recommendations.push(`Узкое место: ${bottleneckNames[bottleneck]} (${cWidth}м). Рекомендуется расширить коридор.`);
    } else if (bottleneck === "stair") {
      recommendations.push(`Узкое место: ${bottleneckNames[bottleneck]} (${sWidth}м). Рекомендуется расширить лестницу или добавить дополнительную.`);
    } else {
      recommendations.push(`Узкое место: ${bottleneckNames[bottleneck]} (${eWidth}м). Рекомендуется расширить выход.`);
    }

    if (impaired > 0) {
      recommendations.push(`Учтены ${impaired} чел. с ограниченной подвижностью. Предусмотрите зоны безопасности и помощь при эвакуации.`);
    }

    if (smokeDensity !== "clear") {
      recommendations.push("Задымление существенно замедляет эвакуацию. Обеспечьте системы дымоудаления и аварийное освещение.");
    }

    recommendations.push(`Обоснование: СП РК 2.02-101-2022, табл. пропускной способности. Норматив для ${buildingType === "office" ? "административных зданий" : "данного типа здания"}: ${requiredTime} мин.`);

    setResult({
      evacuationTime,
      requiredTime,
      status,
      bottleneck: bottleneckNames[bottleneck],
      recommendations,
      calculations: {
        doorThroughput,
        corridorThroughput,
        stairThroughput,
        exitThroughput,
      },
    });
  };

  const reset = () => {
    setPeople("");
    setBuildingType("");
    setDoorWidth("1.2");
    setCorridorWidth("2.0");
    setCorridorLength("30");
    setStairWidth("1.5");
    setStairFlights("3");
    setExitWidth("2.0");
    setMobilityImpaired("0");
    setSmokeDensity("clear");
    setResult(null);
  };

  const printPage = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6 space-y-3">
          <Breadcrumbs items={[
            { label: "Калькуляторы", href: "/calculators" },
            { label: "Время эвакуации" }
          ]} />
          <Link href="/calculators">
            <Button variant="ghost" size="sm">
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
            Расчёт времени эвакуации людей из помещений по СП РК 2.02-101-2022
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Параметры расчёта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Основные параметры */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="people">Количество людей (чел)</Label>
                    <Input
                      id="people"
                      type="number"
                      placeholder="например, 150"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label>Тип здания</Label>
                    <Select value={buildingType} onValueChange={setBuildingType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип здания" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Административное здание</SelectItem>
                        <SelectItem value="residential">Жилое здание</SelectItem>
                        <SelectItem value="educational">Учебное заведение</SelectItem>
                        <SelectItem value="healthcare">Лечебное учреждение</SelectItem>
                        <SelectItem value="retail">Торговый центр</SelectItem>
                        <SelectItem value="hotel">Гостиница</SelectItem>
                        <SelectItem value="industrial">Производственное здание</SelectItem>
                        <SelectItem value="warehouse">Складское помещение</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Параметры путей эвакуации */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Параметры путей эвакуации</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="doorWidth">Ширина дверей (м)</Label>
                      <Input
                        id="doorWidth"
                        type="number"
                        value={doorWidth}
                        onChange={(e) => setDoorWidth(e.target.value)}
                        min="0.8"
                        max="3.0"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Мин. 0.8м, рекомендуется 1.2м</p>
                    </div>

                    <div>
                      <Label htmlFor="corridorWidth">Ширина коридора (м)</Label>
                      <Input
                        id="corridorWidth"
                        type="number"
                        value={corridorWidth}
                        onChange={(e) => setCorridorWidth(e.target.value)}
                        min="1.0"
                        max="5.0"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Мин. 1.0м для основных путей</p>
                    </div>

                    <div>
                      <Label htmlFor="corridorLength">Длина коридора (м)</Label>
                      <Input
                        id="corridorLength"
                        type="number"
                        value={corridorLength}
                        onChange={(e) => setCorridorLength(e.target.value)}
                        min="1"
                        max="200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stairWidth">Ширина лестницы (м)</Label>
                      <Input
                        id="stairWidth"
                        type="number"
                        value={stairWidth}
                        onChange={(e) => setStairWidth(e.target.value)}
                        min="0.9"
                        max="3.0"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Мин. 0.9м для основных лестниц</p>
                    </div>

                    <div>
                      <Label htmlFor="stairFlights">Количество этажей</Label>
                      <Input
                        id="stairFlights"
                        type="number"
                        value={stairFlights}
                        onChange={(e) => setStairFlights(e.target.value)}
                        min="0"
                        max="50"
                      />
                      <p className="text-xs text-gray-500 mt-1">0 - одноэтажное здание</p>
                    </div>

                    <div>
                      <Label htmlFor="exitWidth">Ширина выхода (м)</Label>
                      <Input
                        id="exitWidth"
                        type="number"
                        value={exitWidth}
                        onChange={(e) => setExitWidth(e.target.value)}
                        min="1.2"
                        max="4.0"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Мин. 1.2м для основного выхода</p>
                    </div>
                  </div>
                </div>

                {/* Дополнительные факторы */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Дополнительные факторы</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mobilityImpaired">Людей с ограниченной подвижностью</Label>
                      <Input
                        id="mobilityImpaired"
                        type="number"
                        value={mobilityImpaired}
                        onChange={(e) => setMobilityImpaired(e.target.value)}
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Включая пожилых, с травмами</p>
                    </div>

                    <div>
                      <Label>Условия видимости</Label>
                      <Select value={smokeDensity} onValueChange={setSmokeDensity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Нормальная видимость</SelectItem>
                          <SelectItem value="light">Лёгкое задымление</SelectItem>
                          <SelectItem value="heavy">Сильное задымление</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Влияет на скорость движения</p>
                    </div>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3">
                  <Button onClick={calculate} className="flex-1">
                    <Clock className="mr-2 w-4 h-4" />
                    Рассчитать время эвакуации
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Сброс
                  </Button>
                  <Button variant="outline" onClick={printPage}>
                    <Printer className="mr-2 w-4 h-4" />
                    Печать
                  </Button>
                </div>

                {/* Результат */}
                {result && (
                  <Card className={`${
                    result.status === "safe" 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : result.status === "warning"
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}>
                    <CardContent className="p-6">
                      <h3 className={`text-xl font-semibold mb-4 ${
                        result.status === "safe"
                          ? "text-green-800 dark:text-green-200"
                          : result.status === "warning"
                          ? "text-yellow-800 dark:text-yellow-200"
                          : "text-red-800 dark:text-red-200"
                      }`}>
                        Результаты расчёта времени эвакуации
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className={`text-2xl font-bold ${
                            result.status === "safe" ? "text-green-600 dark:text-green-400" :
                            result.status === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          }`}>
                            {result.evacuationTime.toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">мин</p>
                          <p className="text-xs">Расчётное время</p>
                        </div>

                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {result.requiredTime}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">мин</p>
                          <p className="text-xs">Нормативное время</p>
                        </div>

                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className={`text-lg font-bold ${
                            result.status === "safe" ? "text-green-600 dark:text-green-400" :
                            result.status === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          }`}>
                            {result.status === "safe" ? "БЕЗОПАСНО" :
                             result.status === "warning" ? "ВНИМАНИЕ" : "ОПАСНО"}
                          </p>
                          <p className="text-xs">Статус</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Пропускная способность элементов (чел/мин):</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>Двери: {result.calculations.doorThroughput.toFixed(0)}</div>
                          <div>Коридор: {result.calculations.corridorThroughput.toFixed(0)}</div>
                          <div>Лестница: {result.calculations.stairThroughput.toFixed(0)}</div>
                          <div>Выход: {result.calculations.exitThroughput.toFixed(0)}</div>
                        </div>
                        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                          <strong>Узкое место:</strong> {result.bottleneck}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Рекомендации:</h4>
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Справочная информация */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Справочные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Нормативы времени эвакуации:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Торговые центры: 3 мин</div>
                    <div>Школы: 4 мин</div>
                    <div>Офисы, производство: 6 мин</div>
                    <div>Жилые здания: 8 мин</div>
                    <div>Больницы: 10 мин</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Минимальная ширина:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Двери: 0.8 м</div>
                    <div>Коридоры: 1.0 м</div>
                    <div>Лестницы: 0.9 м</div>
                    <div>Главный выход: 1.2 м</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Пропускная способность:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Дверь: 60 чел/мин·м</div>
                    <div>Коридор: 80 чел/мин·м</div>
                    <div>Лестница вниз: 50 чел/мин·м</div>
                    <div>Выход: 90 чел/мин·м</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Расчёт основан на СП РК 2.02-101-2022
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}