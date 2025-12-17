
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Flame, ArrowLeft, FileText, ExternalLink } from "lucide-react";

interface FireLoadResult {
  load: number;
  category: string;
  description: string;
  details: string[];
}

export default function FireLoadCalculator() {
  const [fireLoadArea, setFireLoadArea] = useState("");
  const [materialsWeight, setMaterialsWeight] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [fireLoadResult, setFireLoadResult] = useState<FireLoadResult | null>(null);

  const calculateFireLoad = () => {
    if (!fireLoadArea || !materialsWeight || !materialType) return;

    const areaNum = parseFloat(fireLoadArea);
    const quantity = parseFloat(materialsWeight);

    // Коэффициенты теплоты сгорания и плотность для разных материалов
    const materialData: { [key: string]: { heat: number; density?: number; unit: string; name: string } } = {
      wood: { heat: 18.8, density: 500, unit: 'м³', name: 'Древесина' },
      paper: { heat: 16.5, unit: 'кг', name: 'Бумага' },
      textile: { heat: 17.5, unit: 'кг', name: 'Текстиль' },
      plastic: { heat: 43.2, unit: 'кг', name: 'Пластик' },
      rubber: { heat: 44.0, unit: 'кг', name: 'Резина' },
      fuel: { heat: 43.7, density: 0.75, unit: 'л', name: 'Топливо' },
      mixed: { heat: 20.0, unit: 'кг', name: 'Смешанные материалы' }
    };

    const data = materialData[materialType];
    if (!data) return;

    // Преобразуем в массу (кг)
    let massKg = quantity;
    if (data.density) {
      massKg = quantity * data.density; // для м³ и л
    }

    const fireLoad = (massKg * data.heat) / areaNum;

    // Определение категории пожарной нагрузки
    let category = "";
    let description = "";
    if (fireLoad < 180) {
      category = "Малая";
      description = "Пожарная нагрузка до 180 МДж/м². Применимы обычные меры пожарной безопасности.";
    } else if (fireLoad < 540) {
      category = "Умеренная";
      description = "Пожарная нагрузка 180-540 МДж/м². Требуются дополнительные меры защиты.";
    } else if (fireLoad < 1080) {
      category = "Повышенная";
      description = "Пожарная нагрузка 540-1080 МДж/м². Необходимы усиленные системы пожаротушения.";
    } else {
      category = "Высокая";
      description = "Пожарная нагрузка свыше 1080 МДж/м². Требуются специальные системы защиты.";
    }

    const details = [
      `Материал: ${data.name}`,
      `Количество: ${quantity} ${data.unit}`,
      `Масса: ${massKg.toFixed(1)} кг`,
      `Теплота сгорания: ${data.heat} МДж/кг`,
      `Площадь: ${areaNum} м²`,
      `Расчет: (${massKg.toFixed(1)} × ${data.heat}) ÷ ${areaNum} = ${fireLoad.toFixed(1)} МДж/м²`
    ];

    setFireLoadResult({ 
      load: Math.round(fireLoad * 10) / 10, 
      category, 
      description,
      details
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6">
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
            <Flame className="mr-3 w-8 h-8 text-orange-500" />
            Калькулятор пожарной нагрузки
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Расчет удельной пожарной нагрузки и определение категории по СП РК 2.02-101-2022
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Калькулятор */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Параметры расчета</CardTitle>
                <CardDescription>
                  Введите данные о материалах и площади для расчета пожарной нагрузки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fire-load-area">Площадь помещения (м²)</Label>
                    <Input
                      id="fire-load-area"
                      type="number"
                      placeholder="100"
                      value={fireLoadArea}
                      onChange={(e) => setFireLoadArea(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="materials-weight">Количество материала</Label>
                    <Input
                      id="materials-weight"
                      type="number"
                      placeholder="500"
                      value={materialsWeight}
                      onChange={(e) => setMaterialsWeight(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="material-type">Тип материала</Label>
                    <Select value={materialType} onValueChange={setMaterialType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите материал" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wood">Древесина (м³)</SelectItem>
                        <SelectItem value="paper">Бумага (кг)</SelectItem>
                        <SelectItem value="textile">Текстиль (кг)</SelectItem>
                        <SelectItem value="plastic">Пластик (кг)</SelectItem>
                        <SelectItem value="rubber">Резина (кг)</SelectItem>
                        <SelectItem value="fuel">Топливо (л)</SelectItem>
                        <SelectItem value="mixed">Смешанные материалы (кг)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={calculateFireLoad} className="w-full" size="lg">
                  <Flame className="mr-2 w-4 h-4" />
                  Рассчитать пожарную нагрузку
                </Button>

                {fireLoadResult && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h3 className="text-lg font-semibold mb-4 text-orange-800 dark:text-orange-200">
                      Результат расчета
                    </h3>
                    
                    <div className="space-y-3">
                      <p className="text-orange-800 dark:text-orange-200 font-semibold text-xl">
                        Пожарная нагрузка: {fireLoadResult.load} МДж/м²
                      </p>
                      
                      <p className="text-orange-700 dark:text-orange-300 font-medium">
                        Категория: {fireLoadResult.category}
                      </p>
                      
                      <p className="text-orange-700 dark:text-orange-300 text-sm">
                        {fireLoadResult.description}
                      </p>
                      
                      <div className="border-t border-orange-200 dark:border-orange-700 pt-3">
                        <p className="text-orange-600 dark:text-orange-400 text-sm font-medium mb-2">
                          Детали расчета:
                        </p>
                        <ul className="space-y-1 text-orange-600 dark:text-orange-400 text-sm">
                          {fireLoadResult.details.map((detail, index) => (
                            <li key={index}>• {detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Справочная информация */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="mr-2 w-5 h-5 text-orange-500" />
                  Категории нагрузки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Малая:</strong> до 180 МДж/м²
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Офисы, жилые помещения
                  </p>
                </div>
                <div>
                  <strong>Умеренная:</strong> 180-540 МДж/м²
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Торговые залы, склады
                  </p>
                </div>
                <div>
                  <strong>Повышенная:</strong> 540-1080 МДж/м²
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Деревообработка, текстиль
                  </p>
                </div>
                <div>
                  <strong>Высокая:</strong> свыше 1080 МДж/м²
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Химия, нефтепродукты
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-blue-500" />
                  Теплота сгорания
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>Древесина:</strong> 18.8 МДж/кг (плотность 500 кг/м³)
                </div>
                <div>
                  <strong>Бумага:</strong> 16.5 МДж/кг
                </div>
                <div>
                  <strong>Текстиль:</strong> 17.5 МДж/кг
                </div>
                <div>
                  <strong>Пластик:</strong> 43.2 МДж/кг
                </div>
                <div>
                  <strong>Резина:</strong> 44.0 МДж/кг
                </div>
                <div>
                  <strong>Топливо:</strong> 43.7 МДж/кг (плотность 0.75 кг/л)
                </div>
                <div>
                  <strong>Смешанные:</strong> 20.0 МДж/кг (усредненные)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-green-500" />
                  Нормативы
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>СП РК 2.02-101-2022</strong> - Пожарная безопасность зданий</p>
                <p><strong>ГОСТ 12.1.033-81</strong> - Пожарная безопасность</p>
                <p><strong>Формула:</strong> q = (m × Q) / S</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  где: q - удельная пожарная нагрузка (МДж/м²),<br/>
                  m - масса материала (кг),<br/>
                  Q - теплота сгорания (МДж/кг),<br/>
                  S - площадь (м²)
                </p>
                
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
                  <strong>Офис 100м² с мебелью 2м³:</strong><br/>
                  (2×500×18.8)÷100 = 188 МДж/м² (умеренная)
                </div>
                <div>
                  <strong>Склад бумаги 500м², 5т:</strong><br/>
                  (5000×16.5)÷500 = 165 МДж/м² (малая)
                </div>
                <div>
                  <strong>Цех с пластиком 200м², 3т:</strong><br/>
                  (3000×43.2)÷200 = 648 МДж/м² (повышенная)
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
                <Link href="/calculators/ngps">
                  <Button variant="outline" className="w-full mb-2">
                    Калькулятор НГПС
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
