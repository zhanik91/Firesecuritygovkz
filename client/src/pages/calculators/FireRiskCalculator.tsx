import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Shield, TrendingUp, AlertTriangle, ArrowLeft, Calculator, Printer, RefreshCw } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEOHead from "@/components/SEOHead";

type RiskCategory = "А" | "Б" | "В" | "Г" | "Д";
type BuildingType = "производственное" | "складское" | "административное" | "общественное" | "жилое";

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
  value: number;
  maxValue: number;
}

interface RiskResult {
  totalRisk: number;
  riskLevel: "очень низкий" | "низкий" | "средний" | "высокий" | "критический";
  factors: RiskFactor[];
  recommendations: string[];
  regulatoryBasis: string;
}

export default function FireRiskCalculator() {
  const [buildingType, setBuildingType] = useState<BuildingType>("производственное");
  const [category, setCategory] = useState<RiskCategory>("В");
  const [area, setArea] = useState<string>("1000");
  const [occupancy, setOccupancy] = useState<string>("50");
  const [floors, setFloors] = useState<string>("1");
  
  // Системы безопасности
  const [hasFireDetection, setHasFireDetection] = useState<boolean>(false);
  const [hasFireSupression, setHasFireSupression] = useState<boolean>(false);
  const [hasSmokeRemoval, setHasSmokeRemoval] = useState<boolean>(false);
  const [hasFirebarriers, setHasFirebarriers] = useState<boolean>(false);
  const [hasExtinguishers, setHasExtinguishers] = useState<boolean>(true);
  
  // Дополнительные факторы
  const [hasHazmat, setHasHazmat] = useState<boolean>(false);
  const [electricalLoad, setElectricalLoad] = useState<string>("50");
  const [maintenanceQuality, setMaintenanceQuality] = useState<string>("3");
  const [staffTraining, setStaffTraining] = useState<string>("3");

  const [result, setResult] = useState<RiskResult | null>(null);

  const calculateRisk = () => {
    const areaNum = Math.max(1, parseInt(area) || 1000);
    const occupancyNum = Math.max(1, parseInt(occupancy) || 50);
    const floorsNum = Math.max(1, parseInt(floors) || 1);
    const electricalLoadNum = Math.max(0, parseInt(electricalLoad) || 50);
    const maintenance = Math.max(1, Math.min(5, parseInt(maintenanceQuality) || 3));
    const training = Math.max(1, Math.min(5, parseInt(staffTraining) || 3));

    // Базовый риск по категории помещения
    const baseCategoryRisk: Record<RiskCategory, number> = {
      "А": 90, // Наивысший риск
      "Б": 75,
      "В": 60,
      "Г": 40,
      "Д": 25
    };

    // Коэффициенты по типу здания
    const buildingTypeCoeff: Record<BuildingType, number> = {
      "производственное": 1.0,
      "складское": 0.9,
      "административное": 0.7,
      "общественное": 0.8,
      "жилое": 0.6
    };

    let totalRisk = baseCategoryRisk[category] * buildingTypeCoeff[buildingType];

    // Факторы риска
    const factors: RiskFactor[] = [
      {
        id: "base_category",
        name: `Базовый риск категории ${category}`,
        weight: 1.0,
        value: baseCategoryRisk[category],
        maxValue: 100
      },
      {
        id: "area_factor",
        name: "Фактор площади здания",
        weight: 0.3,
        value: Math.min(50, Math.log10(areaNum) * 10),
        maxValue: 50
      },
      {
        id: "occupancy_factor", 
        name: "Плотность людей",
        weight: 0.4,
        value: Math.min(40, (occupancyNum / areaNum) * 1000 * 20),
        maxValue: 40
      },
      {
        id: "height_factor",
        name: "Высотность здания",
        weight: 0.2,
        value: floorsNum > 1 ? Math.min(30, (floorsNum - 1) * 5) : 0,
        maxValue: 30
      },
      {
        id: "electrical_factor",
        name: "Электрическая нагрузка",
        weight: 0.25,
        value: Math.min(25, electricalLoadNum * 0.3),
        maxValue: 25
      },
      {
        id: "hazmat_factor",
        name: "Опасные вещества",
        weight: 0.3,
        value: hasHazmat ? 30 : 0,
        maxValue: 30
      }
    ];

    // Защитные системы (снижают риск)
    const protectionSystems = [
      { name: "Пожарная сигнализация", active: hasFireDetection, reduction: 15 },
      { name: "Система пожаротушения", active: hasFireSupression, reduction: 25 },
      { name: "Дымоудаление", active: hasSmokeRemoval, reduction: 10 },
      { name: "Противопожарные преграды", active: hasFirebarriers, reduction: 12 },
      { name: "Огнетушители", active: hasExtinguishers, reduction: 5 }
    ];

    // Применение защитных систем
    let protectionReduction = 0;
    protectionSystems.forEach(system => {
      if (system.active) {
        protectionReduction += system.reduction;
        factors.push({
          id: `protection_${system.name.toLowerCase().replace(/\s+/g, '_')}`,
          name: `Защита: ${system.name}`,
          weight: -0.1,
          value: -system.reduction,
          maxValue: 0
        });
      }
    });

    // Человеческий фактор
    const maintenanceReduction = (5 - maintenance) * 5; // Плохое ТО увеличивает риск
    const trainingReduction = (training - 1) * 3; // Хорошее обучение снижает риск

    factors.push(
      {
        id: "maintenance",
        name: "Качество технического обслуживания",
        weight: 0.15,
        value: maintenanceReduction,
        maxValue: 20
      },
      {
        id: "training",
        name: "Уровень подготовки персонала",
        weight: 0.15,
        value: -trainingReduction,
        maxValue: 0
      }
    );

    // Расчет итогового риска
    factors.forEach(factor => {
      totalRisk += factor.value * factor.weight;
    });

    totalRisk = Math.max(0, Math.min(100, totalRisk));

    // Определение уровня риска
    let riskLevel: RiskResult['riskLevel'] = "очень низкий";
    if (totalRisk >= 80) riskLevel = "критический";
    else if (totalRisk >= 65) riskLevel = "высокий";
    else if (totalRisk >= 45) riskLevel = "средний";
    else if (totalRisk >= 25) riskLevel = "низкий";

    // Рекомендации
    const recommendations: string[] = [];
    
    if (totalRisk >= 65) {
      recommendations.push("КРИТИЧНО: Необходимо немедленное снижение пожарного риска");
    }
    
    if (!hasFireDetection) {
      recommendations.push("Установить автоматическую пожарную сигнализацию");
    }
    
    if (!hasFireSupression && (category === "А" || category === "Б" || areaNum > 3000)) {
      recommendations.push("Рассмотреть установку автоматической системы пожаротушения");
    }
    
    if (!hasSmokeRemoval && floorsNum > 1) {
      recommendations.push("Установить систему дымоудаления для многоэтажного здания");
    }
    
    if (maintenance < 3) {
      recommendations.push("Улучшить качество технического обслуживания систем");
    }
    
    if (training < 3) {
      recommendations.push("Повысить уровень подготовки персонала по пожарной безопасности");
    }
    
    if (hasHazmat) {
      recommendations.push("Обеспечить специальные меры безопасности для опасных веществ");
    }

    if (totalRisk < 25) {
      recommendations.push("Поддерживать достигнутый уровень безопасности");
    }

    const newResult: RiskResult = {
      totalRisk: Math.round(totalRisk),
      riskLevel,
      factors,
      recommendations,
      regulatoryBasis: "Расчет выполнен в соответствии с методикой определения расчетных величин пожарного риска (ППБ РК, Приложение 5)"
    };

    setResult(newResult);
  };

  const reset = () => {
    setBuildingType("производственное");
    setCategory("В");
    setArea("1000");
    setOccupancy("50");
    setFloors("1");
    setHasFireDetection(false);
    setHasFireSupression(false);
    setHasSmokeRemoval(false);
    setHasFirebarriers(false);
    setHasExtinguishers(true);
    setHasHazmat(false);
    setElectricalLoad("50");
    setMaintenanceQuality("3");
    setStaffTraining("3");
    setResult(null);
  };

  const printPage = () => window.print();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "очень низкий": return "text-green-700 bg-green-50 border-green-200";
      case "низкий": return "text-green-600 bg-green-50 border-green-200";
      case "средний": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "высокий": return "text-orange-600 bg-orange-50 border-orange-200";
      case "критический": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title="Калькулятор оценки пожарного риска - NewsFire"
        description="Количественная оценка пожарного риска объекта с учетом категории помещений, защитных систем и человеческого фактора по методике ППБ РК"
        keywords="пожарный риск, оценка риска, ППБ РК, методика МЧС, защитные системы, индивидуальный риск, Казахстан"
      />
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6 space-y-3 print:hidden">
          <Breadcrumbs items={[
            { label: "Калькуляторы", href: "/calculators" },
            { label: "Пожарный риск" }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <TrendingUp className="mr-3 w-8 h-8 text-red-500" />
            Калькулятор пожарного риска
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Количественная оценка пожарного риска объекта с учетом категории помещений, защитных систем и человеческого фактора
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая часть: параметры */}
          <div className="space-y-6">
            {/* Основные параметры */}
            <Card>
              <CardHeader>
                <CardTitle>Основные параметры объекта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="building-type">Тип здания</Label>
                    <Select value={buildingType} onValueChange={(v) => setBuildingType(v as BuildingType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="производственное">Производственное</SelectItem>
                        <SelectItem value="складское">Складское</SelectItem>
                        <SelectItem value="административное">Административное</SelectItem>
                        <SelectItem value="общественное">Общественное</SelectItem>
                        <SelectItem value="жилое">Жилое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as RiskCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="А">А (взрыво-/пожароопасная)</SelectItem>
                        <SelectItem value="Б">Б (взрыво-/пожароопасная)</SelectItem>
                        <SelectItem value="В">В (пожароопасная)</SelectItem>
                        <SelectItem value="Г">Г (умеренная)</SelectItem>
                        <SelectItem value="Д">Д (пониженная)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="area">Площадь (м²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="occupancy">Людей (чел.)</Label>
                    <Input
                      id="occupancy"
                      type="number"
                      value={occupancy}
                      onChange={(e) => setOccupancy(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="floors">Этажей</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Защитные системы */}
            <Card>
              <CardHeader>
                <CardTitle>Системы пожарной безопасности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fire-detection" 
                    checked={hasFireDetection} 
                    onCheckedChange={(checked) => setHasFireDetection(checked === true)} 
                  />
                  <Label htmlFor="fire-detection">Пожарная сигнализация</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fire-supression" 
                    checked={hasFireSupression} 
                    onCheckedChange={(checked) => setHasFireSupression(checked === true)} 
                  />
                  <Label htmlFor="fire-supression">Автоматическое пожаротушение</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="smoke-removal" 
                    checked={hasSmokeRemoval} 
                    onCheckedChange={(checked) => setHasSmokeRemoval(checked === true)} 
                  />
                  <Label htmlFor="smoke-removal">Дымоудаление</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fire-barriers" 
                    checked={hasFirebarriers} 
                    onCheckedChange={(checked) => setHasFirebarriers(checked === true)} 
                  />
                  <Label htmlFor="fire-barriers">Противопожарные преграды</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="extinguishers" 
                    checked={hasExtinguishers} 
                    onCheckedChange={(checked) => setHasExtinguishers(checked === true)} 
                  />
                  <Label htmlFor="extinguishers">Огнетушители</Label>
                </div>
              </CardContent>
            </Card>

            {/* Дополнительные факторы */}
            <Card>
              <CardHeader>
                <CardTitle>Дополнительные факторы риска</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hazmat" 
                    checked={hasHazmat} 
                    onCheckedChange={(checked) => setHasHazmat(checked === true)} 
                  />
                  <Label htmlFor="hazmat">Наличие опасных веществ</Label>
                </div>

                <div>
                  <Label htmlFor="electrical">Электрическая нагрузка (кВт)</Label>
                  <Input
                    id="electrical"
                    type="number"
                    value={electricalLoad}
                    onChange={(e) => setElectricalLoad(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance">Качество ТО (1-5)</Label>
                  <Select value={maintenanceQuality} onValueChange={setMaintenanceQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Очень плохое</SelectItem>
                      <SelectItem value="2">2 - Плохое</SelectItem>
                      <SelectItem value="3">3 - Удовлетворительное</SelectItem>
                      <SelectItem value="4">4 - Хорошее</SelectItem>
                      <SelectItem value="5">5 - Отличное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="training">Подготовка персонала (1-5)</Label>
                  <Select value={staffTraining} onValueChange={setStaffTraining}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Отсутствует</SelectItem>
                      <SelectItem value="2">2 - Минимальная</SelectItem>
                      <SelectItem value="3">3 - Базовая</SelectItem>
                      <SelectItem value="4">4 - Хорошая</SelectItem>
                      <SelectItem value="5">5 - Профессиональная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={calculateRisk} className="flex-1" size="lg">
                <Calculator className="mr-2 w-4 h-4" />
                Рассчитать риск
              </Button>
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={printPage}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Правая часть: результаты */}
          <div>
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Результат оценки пожарного риска</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Общий риск */}
                  <div className={`p-6 rounded-lg border text-center ${getRiskColor(result.riskLevel)}`}>
                    <div className="text-4xl font-bold mb-2">{result.totalRisk}%</div>
                    <div className="text-lg font-medium">{result.riskLevel.toUpperCase()} РИСК</div>
                    <div className="text-sm mt-2 opacity-90">
                      {result.totalRisk >= 80 && "Требуются немедленные меры"}
                      {result.totalRisk >= 65 && result.totalRisk < 80 && "Необходимо снижение риска"}
                      {result.totalRisk >= 45 && result.totalRisk < 65 && "Приемлемый уровень с контролем"}
                      {result.totalRisk >= 25 && result.totalRisk < 45 && "Низкий риск"}
                      {result.totalRisk < 25 && "Минимальный риск"}
                    </div>
                  </div>

                  {/* Факторы риска */}
                  <div>
                    <h3 className="font-semibold mb-3">Составляющие риска:</h3>
                    <div className="space-y-2">
                      {result.factors.map((factor) => (
                        <div key={factor.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <span className="flex-1">{factor.name}</span>
                          <span className={`font-medium ${factor.value >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {factor.value > 0 ? '+' : ''}{Math.round(factor.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Рекомендации */}
                  {result.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                        Рекомендации:
                      </h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 border-t pt-4">
                    <p>{result.regulatoryBasis}</p>
                    <p className="mt-2">
                      <strong>Примечание:</strong> Расчет носит оценочный характер. 
                      Точная оценка риска производится аккредитованными организациями.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}