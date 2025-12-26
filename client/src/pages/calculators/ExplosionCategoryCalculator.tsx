import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, ArrowLeft, RefreshCw, Printer, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Substance {
  name: string;
  flashPoint: number; // температура вспышки, °C
  lowerLimit: number; // нижний предел взрываемости, %
  gasGroup: string; // группа газов по взрывоопасности
  category: "А" | "Б" | "В1" | "В1а" | "В2" | "В3" | "В4" | "Г1" | "Г2" | "Д";
}

// Справочные данные по взрывопожароопасности веществ
const SUBSTANCES: Substance[] = [
  { name: "Бензин А-76", flashPoint: -39, lowerLimit: 0.76, gasGroup: "T1", category: "А" },
  { name: "Керосин", flashPoint: 57, lowerLimit: 0.6, gasGroup: "T3", category: "Б" },
  { name: "Дизельное топливо", flashPoint: 62, lowerLimit: 0.6, gasGroup: "T2", category: "В1" },
  { name: "Мазут", flashPoint: 90, lowerLimit: 1.0, gasGroup: "T2", category: "В2" },
  { name: "Этиловый спирт", flashPoint: 13, lowerLimit: 3.28, gasGroup: "T2", category: "Б" },
  { name: "Ацетон", flashPoint: -18, lowerLimit: 2.15, gasGroup: "T1", category: "А" },
  { name: "Толуол", flashPoint: 4, lowerLimit: 1.27, gasGroup: "T1", category: "А" },
  { name: "Водород", flashPoint: -253, lowerLimit: 4.0, gasGroup: "T1", category: "А" },
  { name: "Метан", flashPoint: -188, lowerLimit: 5.0, gasGroup: "T1", category: "А" },
  { name: "Пропан", flashPoint: -104, lowerLimit: 2.1, gasGroup: "T1", category: "А" },
  { name: "Аммиак", flashPoint: -33, lowerLimit: 15.0, gasGroup: "T1", category: "А" },
  { name: "Древесина", flashPoint: 250, lowerLimit: 0, gasGroup: "-", category: "В3" },
  { name: "Бумага, картон", flashPoint: 230, lowerLimit: 0, gasGroup: "-", category: "В3" },
];

interface SubstanceEntry {
  id: number;
  substanceName: string;
  quantity: string;
  customName: string;
  customFlashPoint: string;
  customLowerLimit: string;
  processingTemp: string;
  isHot: boolean;
}

interface CalculationResult {
  category: "А" | "Б" | "В1" | "В1а" | "В2" | "В3" | "В4" | "Г1" | "Г2" | "Д";
  categoryName: string;
  explosionRisk: "Высокий" | "Средний" | "Низкий" | "Отсутствует";
  requirements: string[];
  electricalRequirements: string;
  ventilationRequirements: string;
  justification: string;
}

export default function ExplosionCategoryCalculator() {
  const [roomVolume, setRoomVolume] = useState<string>("");
  const [substances, setSubstances] = useState<SubstanceEntry[]>([
    { id: 1, substanceName: "", quantity: "", customName: "", customFlashPoint: "", customLowerLimit: "", processingTemp: "20", isHot: false }
  ]);
  const [hasIgnitionSources, setHasIgnitionSources] = useState(false);
  const [hasVentilation, setHasVentilation] = useState(true);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const addSubstance = () => {
    const newId = Math.max(...substances.map(s => s.id)) + 1;
    setSubstances([...substances, { 
      id: newId, 
      substanceName: "", 
      quantity: "", 
      customName: "", 
      customFlashPoint: "", 
      customLowerLimit: "", 
      processingTemp: "20",
      isHot: false
    }]);
  };

  const removeSubstance = (id: number) => {
    if (substances.length > 1) {
      setSubstances(substances.filter(s => s.id !== id));
    }
  };

  const updateSubstance = (id: number, field: string, value: any) => {
    setSubstances(substances.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        
        // Автозаполнение при выборе из справочника
        if (field === "substanceName" && value !== "custom") {
          const substance = SUBSTANCES.find(sub => sub.name === value);
          if (substance) {
            updated.customFlashPoint = substance.flashPoint.toString();
            updated.customLowerLimit = substance.lowerLimit.toString();
            updated.customName = "";
          }
        }
        
        return updated;
      }
      return s;
    }));
  };

  const determineCategoryFromSubstances = (substances: SubstanceEntry[], roomVolume: number, hasIgnitionSources: boolean, hasVentilation: boolean): CalculationResult => {
    let highestRiskCategory: "А" | "Б" | "В1" | "В1а" | "В2" | "В3" | "В4" | "Г1" | "Г2" | "Д" = "Д";
    const categoryRiskOrder = ["А", "Б", "В1", "В1а", "В2", "В3", "В4", "Г1", "Г2", "Д"];
    
    let hasFlammableGases = false;
    let hasFlammableLiquids = false;
    let hasCombustibleSolids = false;
    let hasNonCombustible = false;

    // Анализ каждого вещества
    substances.forEach(sub => {
      if (!sub.substanceName || !sub.quantity) return;
      
      let flashPoint = parseFloat(sub.customFlashPoint) || 999;
      let lowerLimit = parseFloat(sub.customLowerLimit) || 999;
      let processingTemp = parseFloat(sub.processingTemp) || 20;
      let quantity = parseFloat(sub.quantity) || 0;
      
      if (quantity <= 0) return;

      // Определение категории по температуре вспышки и условиям
      let substanceCategory: "А" | "Б" | "В1" | "В1а" | "В2" | "В3" | "В4" | "Г1" | "Г2" | "Д" = "Д";
      
      if (flashPoint < -273) {
        // Газы при н.у.
        substanceCategory = "А";
        hasFlammableGases = true;
      } else if (flashPoint <= 28) {
        // Легковоспламеняющиеся жидкости
        substanceCategory = "А";
        hasFlammableLiquids = true;
      } else if (flashPoint <= 61 && (processingTemp >= flashPoint - 5 || sub.isHot)) {
        // ЛВЖ при нагреве выше температуры вспышки
        substanceCategory = "Б";
        hasFlammableLiquids = true;
      } else if (flashPoint <= 120 && processingTemp >= flashPoint - 5) {
        // Горючие жидкости при нагреве
        substanceCategory = "В1";
        hasFlammableLiquids = true;
      } else if (flashPoint > 120 && processingTemp >= flashPoint - 5) {
        // Трудногорючие жидкости при высоких температурах
        substanceCategory = "В2";
      } else if (flashPoint > 200) {
        // Твердые горючие вещества
        if (quantity > roomVolume * 0.1) { // > 10% объема
          substanceCategory = "В3";
          hasCombustibleSolids = true;
        } else {
          substanceCategory = "В4";
        }
      } else {
        substanceCategory = "Г1";
      }

      // Выбираем наиболее опасную категорию
      const currentIndex = categoryRiskOrder.indexOf(substanceCategory);
      const highestIndex = categoryRiskOrder.indexOf(highestRiskCategory);
      
      if (currentIndex < highestIndex) {
        highestRiskCategory = substanceCategory;
      }
    });

    // Корректировка категории в зависимости от дополнительных факторов
    if (!hasVentilation && (hasFlammableGases || hasFlammableLiquids)) {
      // Без вентиляции повышается риск
      if ((highestRiskCategory as string) === "Б") highestRiskCategory = "А";
      if ((highestRiskCategory as string) === "В1") highestRiskCategory = "Б";
    }

    if (!hasIgnitionSources && (highestRiskCategory as string) === "А") {
      // Отсутствие источников зажигания может снизить категорию А до Б
      highestRiskCategory = "Б";
    }

    // Определение наименования категории и требований
    const categoryNames: Record<string, string> = {
      "А": "Взрывопожароопасная (газы, пары ЛВЖ при н.у.)",
      "Б": "Взрывопожароопасная (горючие пыли, волокна; ЛВЖ при нагреве)",
      "В1": "Взрывопожароопасная (ГЖ при нагреве выше tвсп)",
      "В1а": "Взрывопожароопасная (ГЖ, работающие при tраб ≥ tвсп)",
      "В2": "Взрывопожароопасная (горючие пыли или волокна)",
      "В3": "Пожароопасная (горючие и трудногорючие жидкости)",
      "В4": "Пожароопасная (горючие материалы, вещества)",
      "Г1": "Умеренно пожароопасная (негорючие в горячем состоянии)",
      "Г2": "Умеренно пожароопасная (негорючие в холодном состоянии)",
      "Д": "Пониженной пожарной опасности"
    };

    const explosionRiskLevels: Record<string, "Высокий" | "Средний" | "Низкий" | "Отсутствует"> = {
      "А": "Высокий", "Б": "Высокий", "В1": "Средний", "В1а": "Средний", 
      "В2": "Средний", "В3": "Низкий", "В4": "Низкий", 
      "Г1": "Отсутствует", "Г2": "Отсутствует", "Д": "Отсутствует"
    };

    const requirements: string[] = [];
    let electricalReq = "";
    let ventilationReq = "";

    if (["А", "Б"].includes(highestRiskCategory)) {
      requirements.push("Взрывозащищенное электрооборудование группы Ex");
      requirements.push("Статическое заземление всего оборудования");
      requirements.push("Исключение источников искрообразования");
      requirements.push("Аварийная вентиляция с автоматическим пуском");
      requirements.push("Газоанализаторы для контроля концентраций");
      electricalReq = "Взрывозащищенное Ex d IIC T1-T6 (в зависимости от группы газов)";
      ventilationReq = "Приточно-вытяжная с кратностью не менее 8 об/ч";
    } else if (["В1", "В1а", "В2"].includes(highestRiskCategory)) {
      requirements.push("Повышенная степень защиты электрооборудования (IP44 и выше)");
      requirements.push("Контроль температурных режимов");
      requirements.push("Аварийное охлаждение при превышении температур");
      requirements.push("Система автоматического пожаротушения");
      electricalReq = "IP54, защита от перегрева, температурный контроль";
      ventilationReq = "Приточно-вытяжная с кратностью не менее 3 об/ч";
    } else if (["В3", "В4"].includes(highestRiskCategory)) {
      requirements.push("Автоматическая пожарная сигнализация");
      requirements.push("Первичные средства пожаротушения");
      requirements.push("Контроль температуры помещений");
      electricalReq = "Стандартное промышленное оборудование IP20";
      ventilationReq = "Естественная или механическая по расчету";
    } else {
      requirements.push("Общие требования пожарной безопасности");
      electricalReq = "Стандартное промышленное оборудование";
      ventilationReq = "По санитарно-гигиеническим требованиям";
    }

    const justification = `Категория определена на основании НПБ 105-03 "Определение категорий помещений, зданий и наружных установок по взрывопожарной и пожарной опасности" и СП РК 2.02-101-2022. ` +
      `Учтены: температуры вспышки веществ, температуры их обработки, количества, условия вентиляции и наличие источников зажигания.`;

    return {
      category: highestRiskCategory,
      categoryName: categoryNames[highestRiskCategory],
      explosionRisk: explosionRiskLevels[highestRiskCategory],
      requirements,
      electricalRequirements: electricalReq,
      ventilationRequirements: ventilationReq,
      justification
    };
  };

  const calculate = () => {
    if (!roomVolume || parseFloat(roomVolume) <= 0) return;
    if (!substances.some(s => s.substanceName && s.quantity)) return;

    const volume = parseFloat(roomVolume);
    const result = determineCategoryFromSubstances(substances, volume, hasIgnitionSources, hasVentilation);
    setResult(result);
  };

  const reset = () => {
    setRoomVolume("");
    setSubstances([{ id: 1, substanceName: "", quantity: "", customName: "", customFlashPoint: "", customLowerLimit: "", processingTemp: "20", isHot: false }]);
    setHasIgnitionSources(false);
    setHasVentilation(true);
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
            { label: "Категория взрывопожароопасности" }
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
            <Zap className="mr-3 w-8 h-8 text-yellow-500" />
            Категория взрывопожароопасности помещений
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Определение категории по НПБ 105-03 и СП РК 2.02-101-2022
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Параметры помещения и веществ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Параметры помещения */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="volume">Объем помещения (м³)</Label>
                    <Input
                      id="volume"
                      type="number"
                      placeholder="например, 500"
                      value={roomVolume}
                      onChange={(e) => setRoomVolume(e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ignition" 
                      checked={hasIgnitionSources}
                      onCheckedChange={(checked: boolean) => setHasIgnitionSources(checked)}
                    />
                    <Label htmlFor="ignition" className="text-sm">
                      Есть источники зажигания
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ventilation" 
                      checked={hasVentilation}
                      onCheckedChange={(checked: boolean) => setHasVentilation(checked)}
                    />
                    <Label htmlFor="ventilation" className="text-sm">
                      Есть принудительная вентиляция
                    </Label>
                  </div>
                </div>

                {/* Вещества и материалы */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Вещества и материалы</h3>
                    <Button onClick={addSubstance} size="sm">
                      Добавить вещество
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {substances.map((substance, index) => (
                      <Card key={substance.id} className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end">
                          <div className="lg:col-span-2">
                            <Label>Вещество</Label>
                            <Select 
                              value={substance.substanceName} 
                              onValueChange={(value) => updateSubstance(substance.id, "substanceName", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите вещество" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Пользовательское...</SelectItem>
                                {SUBSTANCES.map((sub, idx) => (
                                  <SelectItem key={idx} value={sub.name}>
                                    {sub.name} (tвсп: {sub.flashPoint}°C)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {substance.substanceName === "custom" && (
                            <>
                              <div>
                                <Label>Название</Label>
                                <Input
                                  placeholder="Введите название"
                                  value={substance.customName}
                                  onChange={(e) => updateSubstance(substance.id, "customName", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label>tвсп (°C)</Label>
                                <Input
                                  type="number"
                                  placeholder="-40"
                                  value={substance.customFlashPoint}
                                  onChange={(e) => updateSubstance(substance.id, "customFlashPoint", e.target.value)}
                                />
                              </div>

                              <div>
                                <Label>НКПР (%)</Label>
                                <Input
                                  type="number"
                                  placeholder="2.5"
                                  value={substance.customLowerLimit}
                                  onChange={(e) => updateSubstance(substance.id, "customLowerLimit", e.target.value)}
                                  step="0.1"
                                />
                              </div>
                            </>
                          )}

                          <div>
                            <Label>Количество (кг)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={substance.quantity}
                              onChange={(e) => updateSubstance(substance.id, "quantity", e.target.value)}
                              min="0"
                              step="0.1"
                            />
                          </div>

                          <div>
                            <Label>tраб (°C)</Label>
                            <Input
                              type="number"
                              placeholder="20"
                              value={substance.processingTemp}
                              onChange={(e) => updateSubstance(substance.id, "processingTemp", e.target.value)}
                              step="1"
                            />
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`hot-${substance.id}`}
                                checked={substance.isHot}
                                onCheckedChange={(checked: boolean) => updateSubstance(substance.id, "isHot", checked)}
                              />
                              <Label htmlFor={`hot-${substance.id}`} className="text-xs">
                                Нагретое
                              </Label>
                            </div>
                            
                            {substances.length > 1 && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeSubstance(substance.id)}
                              >
                                Удалить
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3">
                  <Button onClick={calculate} className="flex-1">
                    <Zap className="mr-2 w-4 h-4" />
                    Определить категорию
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
                    result.explosionRisk === "Высокий"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : result.explosionRisk === "Средний"
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      : result.explosionRisk === "Низкий"
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  }`}>
                    <CardContent className="p-6">
                      <h3 className={`text-2xl font-bold mb-4 ${
                        result.explosionRisk === "Высокий"
                          ? "text-red-800 dark:text-red-200"
                          : result.explosionRisk === "Средний"
                          ? "text-yellow-800 dark:text-yellow-200"
                          : result.explosionRisk === "Низкий"
                          ? "text-orange-800 dark:text-orange-200"
                          : "text-green-800 dark:text-green-200"
                      }`}>
                        Категория {result.category}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className="text-lg font-semibold">{result.category}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Категория</p>
                        </div>

                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className={`text-lg font-semibold ${
                            result.explosionRisk === "Высокий" ? "text-red-600" :
                            result.explosionRisk === "Средний" ? "text-yellow-600" :
                            result.explosionRisk === "Низкий" ? "text-orange-600" : "text-green-600"
                          }`}>
                            {result.explosionRisk}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Риск взрыва</p>
                        </div>

                        <div className="text-center p-4 bg-white dark:bg-gray-800/30 rounded-lg">
                          <p className="text-sm font-medium">{result.categoryName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Описание</p>
                        </div>
                      </div>

                      {/* Требования */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Основные требования:</h4>
                          <ul className="space-y-1">
                            {result.requirements.map((req, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Электрооборудование:</h4>
                            <p className="text-sm bg-white dark:bg-gray-800/30 p-3 rounded">
                              {result.electricalRequirements}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Вентиляция:</h4>
                            <p className="text-sm bg-white dark:bg-gray-800/30 p-3 rounded">
                              {result.ventilationRequirements}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Обоснование:</strong> {result.justification}
                          </p>
                        </div>
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
                <CardTitle className="text-lg">Справка по категориям</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-red-600">Взрывопожароопасные:</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>А</strong> - газы, пары ЛВЖ при н.у.</div>
                    <div><strong>Б</strong> - пыли, волокна; ЛВЖ при нагреве</div>
                    <div><strong>В1-В2</strong> - ГЖ при нагреве</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm text-orange-600">Пожароопасные:</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>В3</strong> - горючие и трудногорючие жидкости</div>
                    <div><strong>В4</strong> - горючие материалы</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm text-green-600">Умеренно опасные:</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Г1-Г2</strong> - негорючие материалы</div>
                    <div><strong>Д</strong> - пониженной опасности</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Ключевые параметры:</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>tвсп</strong> - температура вспышки</div>
                    <div><strong>tраб</strong> - рабочая температура</div>
                    <div><strong>НКПР</strong> - нижний предел взрываемости</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Расчёт по НПБ 105-03 и СП РК 2.02-101-2022
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