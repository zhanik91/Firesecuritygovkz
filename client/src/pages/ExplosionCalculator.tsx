
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
import { TrendingUp, ArrowLeft, FileText, ExternalLink, AlertTriangle, Plus, Trash2, RefreshCw, Shield } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Report from "@/components/ui/Report";

interface SubstanceData {
  type: string;
  amount: number;
}

interface ExplosionResult {
  category: string;
  pressure: number;
  description: string;
  details: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  fireLoad?: number;
  totalMass?: number;
  calculationSteps?: Array<{
    substance: string;
    mass: number;
    pressure: number;
    category: string;
  }>;
}

export default function ExplosionCalculator() {
  const [roomVolume, setRoomVolume] = useState("");
  const [substanceType, setSubstanceType] = useState("");
  const [substanceAmount, setSubstanceAmount] = useState("");
  const [substances, setSubstances] = useState<SubstanceData[]>([]);
  const [explosionResult, setExplosionResult] = useState<ExplosionResult | null>(null);

  const addSubstance = () => {
    if (!substanceType || !substanceAmount) return;

    const newSubstance = {
      type: substanceType,
      amount: parseFloat(substanceAmount)
    };

    setSubstances([...substances, newSubstance]);
    setSubstanceType("");
    setSubstanceAmount("");
  };

  const removeSubstance = (index: number) => {
    setSubstances(substances.filter((_, i) => i !== index));
  };

  const resetCalculator = () => {
    setRoomVolume("");
    setSubstanceType("");
    setSubstanceAmount("");
    setSubstances([]);
    setExplosionResult(null);
  };

  const getSubstanceName = (type: string) => {
    const names: { [key: string]: string } = {
      methane: "Метан",
      propane: "Пропан", 
      acetylene: "Ацетилен",
      hydrogen: "Водород",
      gasoline: "Бензин",
      kerosene: "Керосин",
      diesel: "Дизельное топливо",
      alcohol: "Этиловый спирт",
      acetone: "Ацетон",
      benzene: "Бензол",
      wood: "Древесина",
      paper: "Бумага",
      textile: "Текстиль",
      plastic: "Пластик"
    };
    return names[type] || type;
  };

  const getSubstanceUnit = (type: string) => {
    if (!type) return "Количество";

    const units: { [key: string]: string } = {
      methane: "Количество (м³)",
      propane: "Количество (м³)",
      acetylene: "Количество (м³)", 
      hydrogen: "Количество (м³)",
      gasoline: "Количество (л)",
      kerosene: "Количество (л)",
      diesel: "Количество (л)",
      alcohol: "Количество (л)",
      acetone: "Количество (л)",
      benzene: "Количество (л)",
      wood: "Количество (м³)",
      paper: "Количество (кг)",
      textile: "Количество (кг)",
      plastic: "Количество (кг)"
    };
    return units[type] || "Количество (кг)";
  };

  const getSubstanceDisplayUnit = (type: string) => {
    const units: { [key: string]: string } = {
      methane: "м³",
      propane: "м³",
      acetylene: "м³",
      hydrogen: "м³", 
      gasoline: "л",
      kerosene: "л",
      diesel: "л",
      alcohol: "л",
      acetone: "л",
      benzene: "л",
      wood: "м³",
      paper: "кг",
      textile: "кг",
      plastic: "кг"
    };
    return units[type] || "кг";
  };

  const calculateExplosionCategory = () => {
    if (!roomVolume || substances.length === 0) return;

    const volumeNum = parseFloat(roomVolume);

    // Данные веществ с указанием типа (газ/жидкость/твердое)
    const substanceData: { [key: string]: { 
      heatCombustion: number; 
      density: number; 
      coefficient: number;
      type: 'gas' | 'liquid' | 'solid';
      flashPoint?: number; // температура вспышки для жидкостей
    } } = {
      methane: { heatCombustion: 50.0, density: 0.717, coefficient: 7.0, type: 'gas' },
      propane: { heatCombustion: 46.4, density: 2.02, coefficient: 7.5, type: 'gas' },
      acetylene: { heatCombustion: 48.2, density: 1.17, coefficient: 8.5, type: 'gas' },
      hydrogen: { heatCombustion: 120.0, density: 0.09, coefficient: 6.8, type: 'gas' },
      gasoline: { heatCombustion: 44.0, density: 2.5, coefficient: 7.2, type: 'liquid', flashPoint: -40 },
      kerosene: { heatCombustion: 43.1, density: 2.8, coefficient: 6.8, type: 'liquid', flashPoint: 40 },
      diesel: { heatCombustion: 42.5, density: 4.5, coefficient: 6.5, type: 'liquid', flashPoint: 65 },
      alcohol: { heatCombustion: 27.0, density: 1.59, coefficient: 6.5, type: 'liquid', flashPoint: 13 },
      acetone: { heatCombustion: 29.0, density: 2.0, coefficient: 7.0, type: 'liquid', flashPoint: -18 },
      benzene: { heatCombustion: 40.2, density: 2.77, coefficient: 7.8, type: 'liquid', flashPoint: -11 },
      wood: { heatCombustion: 18.8, density: 0.6, coefficient: 5.5, type: 'solid' },
      paper: { heatCombustion: 16.5, density: 0.7, coefficient: 5.2, type: 'solid' },
      textile: { heatCombustion: 17.5, density: 0.8, coefficient: 5.4, type: 'solid' },
      plastic: { heatCombustion: 43.2, density: 1.2, coefficient: 6.8, type: 'solid' }
    };

    let maxPressure = 0;
    let totalFireLoad = 0;
    let totalMass = 0;
    let finalCategory = "";
    let finalDescription = "";
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const details: string[] = [];
    const recommendations: string[] = [];
    const calculationSteps: Array<{
      substance: string;
      mass: number;
      pressure: number;
      category: string;
    }> = [];

    // Расчет для каждого вещества
    substances.forEach((substance) => {
      const substanceInfo = substanceData[substance.type];
      if (!substanceInfo) return;

      let pressure = 0;
      let category = "";

      // Преобразуем количество в массу (кг)
      let massKg = substance.amount;
      if (substanceInfo.type === 'gas') {
        // Для газов: переводим м³ в кг через плотность
        massKg = substance.amount * substanceInfo.density;
      } else if (substanceInfo.type === 'liquid' && ['gasoline', 'kerosene', 'diesel', 'alcohol', 'acetone', 'benzene'].includes(substance.type)) {
        // Для жидкостей: переводим л в кг через плотность
        massKg = substance.amount * substanceInfo.density;
      } else if (substanceInfo.type === 'solid' && substance.type === 'wood') {
        // Для древесины: переводим м³ в кг через плотность
        massKg = substance.amount * substanceInfo.density;
      }

      if (substanceInfo.type === 'gas') {
        // Для газов - расчет избыточного давления взрыва
        const reducedMass = massKg * (substanceInfo.heatCombustion / 44.0);
        pressure = substanceInfo.coefficient * Math.pow(reducedMass / volumeNum, 2/3) * 100;

        if (pressure >= 20) {
          category = "А";
        } else if (pressure >= 5) {
          category = "Б";
        } else {
          category = "В1";
        }

        maxPressure = Math.max(maxPressure, pressure);
        details.push(`${getSubstanceName(substance.type)}: ${pressure.toFixed(2)} кПа (категория ${category})`);
        
        calculationSteps.push({
          substance: getSubstanceName(substance.type),
          mass: massKg,
          pressure,
          category
        });

        totalMass += massKg;

      } else if (substanceInfo.type === 'liquid') {
        // Для жидкостей - определение по температуре вспышки
        const flashPoint = substanceInfo.flashPoint || 100;

        if (flashPoint <= 28) {
          // Расчет давления для ЛВЖ
          const reducedMass = massKg * (substanceInfo.heatCombustion / 44.0);
          pressure = substanceInfo.coefficient * Math.pow(reducedMass / volumeNum, 2/3) * 100;

          if (pressure >= 20) {
            category = "А";
          } else {
            category = "Б";
          }
          maxPressure = Math.max(maxPressure, pressure);
        } else if (flashPoint <= 61) {
          category = "В1";
          pressure = 1;
        } else if (flashPoint <= 120) {
          category = "В2";
          pressure = 0.8;
        } else {
          category = "В3";
          pressure = 0.5;
        }

        details.push(`${getSubstanceName(substance.type)}: t_всп=${flashPoint}°C, ${pressure.toFixed(2)} кПа (категория ${category})`);
        
        calculationSteps.push({
          substance: getSubstanceName(substance.type),
          mass: massKg,
          pressure,
          category
        });

        totalMass += massKg;

      } else if (substanceInfo.type === 'solid') {
        // Для твердых веществ - расчет пожарной нагрузки
        const fireLoad = (massKg * substanceInfo.heatCombustion) / volumeNum;
        totalFireLoad += fireLoad;

        if (fireLoad >= 1800) {
          category = "В1";
          pressure = 1.5;
        } else if (fireLoad >= 900) {
          category = "В2";
          pressure = 1.2;
        } else if (fireLoad >= 180) {
          category = "В3";
          pressure = 0.8;
        } else {
          category = "В4";
          pressure = 0.4;
        }

        details.push(`${getSubstanceName(substance.type)}: ${fireLoad.toFixed(1)} МДж/м² (категория ${category})`);
        
        calculationSteps.push({
          substance: getSubstanceName(substance.type),
          mass: massKg,
          pressure,
          category
        });

        totalMass += massKg;
      }
    });

    // Определение итоговой категории (по наивысшей)
    if (maxPressure >= 20) {
      finalCategory = "А (взрывопожароопасная)";
      finalDescription = "Горючие газы, легковоспламеняющиеся жидкости с температурой вспышки не более 28°С";
      riskLevel = 'critical';
      recommendations.push("Требуется установка взрывозащищенного электрооборудования");
      recommendations.push("Обязательна система аварийной вентиляции и газоанализа");
      recommendations.push("Запрещается курение и использование открытого огня");
      recommendations.push("Персонал должен использовать антистатическую обувь и одежду");
    } else if (maxPressure >= 5) {
      finalCategory = "Б (взрывопожароопасная)";
      finalDescription = "Горючие пыли или волокна, жидкости с температурой вспышки более 28°С, но не более 61°С";
      riskLevel = 'high';
      recommendations.push("Необходимо взрывозащищенное электрооборудование в зонах образования взрывоопасных смесей");
      recommendations.push("Обязательна эффективная система вентиляции");
      recommendations.push("Контроль концентрации горючих веществ в воздухе");
      recommendations.push("Исключение источников зажигания");
    } else {
      // Определяем по твердым веществам
      if (totalFireLoad >= 1800) {
        finalCategory = "В1 (пожароопасная)";
        finalDescription = "Горючие жидкости с температурой вспышки более 61°С, твердые горючие вещества";
        riskLevel = 'medium';
        recommendations.push("Установка автоматической системы пожаротушения");
        recommendations.push("Ограничение количества горючих материалов");
        recommendations.push("Регулярная очистка от пыли и горючих отходов");
      } else if (totalFireLoad >= 900) {
        finalCategory = "В2 (пожароопасная)";
        finalDescription = "Горючие жидкости в горячем состоянии, твердые горючие вещества";
        riskLevel = 'medium';
        recommendations.push("Контроль температурного режима горючих жидкостей");
        recommendations.push("Установка системы пожарной сигнализации");
        recommendations.push("Обеспечение достаточного количества огнетушителей");
      } else if (totalFireLoad >= 180) {
        finalCategory = "В3 (пожароопасная)";
        finalDescription = "Трудногорючие жидкости при температуре выше температуры вспышки";
        riskLevel = 'low';
        recommendations.push("Контроль температуры трудногорючих материалов");
        recommendations.push("Регулярные противопожарные инструктажи персонала");
        recommendations.push("Поддержание порядка и чистоты в помещении");
      } else {
        finalCategory = "В4 (пожароопасная)";
        finalDescription = "Трудногорючие вещества с низкой пожарной нагрузкой";
        riskLevel = 'low';
        recommendations.push("Соблюдение элементарных мер пожарной безопасности");
        recommendations.push("Наличие первичных средств пожаротушения");
        recommendations.push("Обучение персонала действиям при пожаре");
      }
    }

    // Общие рекомендации
    recommendations.push("Разработка планов эвакуации с учетом категории помещения");
    recommendations.push("Проведение периодических проверок состояния путей эвакуации");

    setExplosionResult({
      category: finalCategory,
      pressure: Math.round(Math.max(maxPressure, totalFireLoad / 100) * 100) / 100,
      description: finalDescription,
      details,
      riskLevel,
      recommendations,
      fireLoad: totalFireLoad,
      totalMass,
      calculationSteps
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Калькулятор взрывопожароопасности - Категории А-Д | NewsFire"
        description="Профессиональный калькулятор для определения категории помещения по взрывопожароопасности согласно СП РК 2.02-101-2022. Расчёт избыточного давления взрыва и пожарной нагрузки."
        keywords="взрывопожароопасность, категория помещения, СП РК 2.02-101-2022, избыточное давление взрыва, пожарная нагрузка, категории А Б В Г Д"
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Калькулятор взрывопожароопасности",
          "description": "Калькулятор для определения категории помещения по взрывопожароопасности",
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
              { label: "Взрывопожароопасность", icon: TrendingUp }
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
            <TrendingUp className="mr-3 w-8 h-8 text-purple-500" />
            Калькулятор категории взрывопожароопасности
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Определение категории помещения по взрывопожароопасности согласно СП РК 2.02-101-2022
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Калькулятор */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Параметры помещения и веществ</CardTitle>
                <CardDescription>
                  Добавьте информацию о помещении и содержащихся в нем веществах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="room-volume">Объем помещения (м³)</Label>
                    <Input
                      id="room-volume"
                      type="number"
                      placeholder="1000"
                      value={roomVolume}
                      onChange={(e) => setRoomVolume(e.target.value)}
                      min="0"
                      step="0.1"
                      data-testid="input-room-volume"
                    />
                  </div>
                  <Button onClick={resetCalculator} variant="outline" size="sm" className="ml-4 mt-6" data-testid="button-reset">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Сброс
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="substance-type">Тип вещества</Label>
                    <Select value={substanceType} onValueChange={setSubstanceType}>
                      <SelectTrigger data-testid="select-substance-type">
                        <SelectValue placeholder="Выберите вещество" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="methane">Метан</SelectItem>
                        <SelectItem value="propane">Пропан</SelectItem>
                        <SelectItem value="acetylene">Ацетилен</SelectItem>
                        <SelectItem value="hydrogen">Водород</SelectItem>
                        <SelectItem value="gasoline">Бензин</SelectItem>
                        <SelectItem value="kerosene">Керосин</SelectItem>
                        <SelectItem value="diesel">Дизельное топливо</SelectItem>
                        <SelectItem value="alcohol">Этиловый спирт</SelectItem>
                        <SelectItem value="acetone">Ацетон</SelectItem>
                        <SelectItem value="benzene">Бензол</SelectItem>
                        <SelectItem value="wood">Древесина</SelectItem>
                        <SelectItem value="paper">Бумага</SelectItem>
                        <SelectItem value="textile">Текстиль</SelectItem>
                        <SelectItem value="plastic">Пластик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="substance-amount">{getSubstanceUnit(substanceType)}</Label>
                    <Input
                      id="substance-amount"
                      type="number"
                      placeholder="100"
                      value={substanceAmount}
                      onChange={(e) => setSubstanceAmount(e.target.value)}
                      min="0"
                      step="0.1"
                      data-testid="input-substance-amount"
                    />
                  </div>
                </div>

                <Button onClick={addSubstance} className="w-full" variant="outline" data-testid="button-add-substance">
                  <Plus className="mr-2 w-4 h-4" />
                  Добавить вещество
                </Button>

                {substances.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Добавленные вещества:</Label>
                    {substances.map((substance, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-sm">
                              {getSubstanceName(substance.type)}
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {substance.amount} {getSubstanceDisplayUnit(substance.type)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSubstance(index)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-remove-substance-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Button onClick={calculateExplosionCategory} className="w-full" size="lg" disabled={substances.length === 0 || !roomVolume} data-testid="button-calculate">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Определить категорию взрывопожароопасности
                </Button>

                {/* Отчёт */}
                {explosionResult && (
                  <Report
                    title="Отчёт по определению категории взрывопожароопасности"
                    subtitle={`Объём помещения: ${roomVolume} м³ | Веществ: ${substances.length} | Категория: ${explosionResult.category}`}
                    calculatorType="Определение категории взрывопожароопасности"
                    inputs={[
                      { label: "Объём помещения", value: roomVolume, unit: "м³" },
                      { label: "Количество веществ", value: substances.length.toString() },
                      { label: "Общая масса", value: explosionResult.totalMass?.toFixed(2) || "0", unit: "кг" },
                      ...substances.map((substance, i) => ({
                        label: getSubstanceName(substance.type),
                        value: substance.amount.toString(),
                        unit: getSubstanceDisplayUnit(substance.type),
                        description: `Вещество ${i + 1}`
                      }))
                    ]}
                    result={{
                      value: explosionResult.category,
                      unit: "",
                      description: explosionResult.description,
                      status: explosionResult.riskLevel === 'critical' ? "error" : 
                              explosionResult.riskLevel === 'high' ? "error" :
                              explosionResult.riskLevel === 'medium' ? "warning" : "success"
                    }}
                    formulas={[
                      {
                        name: "Расчёт избыточного давления взрыва",
                        formula: "ΔP = K × (m_пр / V)^(2/3)",
                        substitution: `ΔP = ${explosionResult.pressure} кПа (максимальное из веществ)`,
                        result: explosionResult.pressure,
                        unit: "кПа"
                      },
                      ...(explosionResult.fireLoad ? [{
                        name: "Пожарная нагрузка",
                        formula: "q = Σ(m_i × Q_i) / V",
                        substitution: `q = ${explosionResult.fireLoad.toFixed(1)} МДж/м²`,
                        result: explosionResult.fireLoad,
                        unit: "МДж/м²"
                      }] : [])
                    ]}
                    calculations={[]}
                    detailedData={[
                      { name: "Категория", value: explosionResult.category, unit: "", description: "Категория взрывопожароопасности" },
                      { name: "Избыточное давление", value: explosionResult.pressure, unit: "кПа", description: "Максимальное избыточное давление взрыва" },
                      { name: "Уровень риска", value: explosionResult.riskLevel, unit: "", description: "Оценка уровня опасности" },
                      ...(explosionResult.calculationSteps?.map((step, i) => ({
                        name: step.substance,
                        value: step.pressure,
                        unit: "кПа",
                        description: `Категория ${step.category}, масса ${step.mass.toFixed(2)} кг`
                      })) || [])
                    ]}
                    justification="Расчёт категории взрывопожароопасности выполнен в соответствии с требованиями СП РК 2.02-101-2022 'Противопожарные требования'. Учтены теплота сгорания веществ, их физико-химические свойства, расчёт избыточного давления взрыва для газов и жидкостей, пожарная нагрузка для твёрдых веществ."
                    references={[
                      { anchor: "sp-rk-101-p31", text: "СП РК 2.02-101-2022, п. 3.1 - категории помещений по взрывопожароопасности", article: "СП РК 2.02-101-2022" },
                      { anchor: "sp-rk-101-p32", text: "СП РК 2.02-101-2022, п. 3.2 - расчёт избыточного давления взрыва" },
                      { anchor: "sp-rk-101-p33", text: "СП РК 2.02-101-2022, п. 3.3 - определение пожарной нагрузки" },
                      { anchor: "sp-rk-101-app1", text: "СП РК 2.02-101-2022, Приложение А - характеристики горючих веществ" }
                    ]}
                    recommendations={explosionResult.recommendations}
                    notes={[
                      "Расчёт носит справочный характер для предварительной оценки категории",
                      "Окончательное заключение выдаёт аккредитованная экспертная организация",
                      "Учитывайте условия эксплуатации и технологические особенности помещения",
                      "При наличии нескольких веществ определяется наивысшая категория"
                    ]}
                    calculationUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    className="mt-8"
                  />
                )}

                {explosionResult && (
                  <div className={`p-6 rounded-lg border ${
                    explosionResult.riskLevel === 'critical'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : explosionResult.riskLevel === 'high'
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : explosionResult.riskLevel === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                      explosionResult.riskLevel === 'critical'
                        ? 'text-red-800 dark:text-red-200'
                        : explosionResult.riskLevel === 'high'
                        ? 'text-orange-800 dark:text-orange-200'
                        : explosionResult.riskLevel === 'medium'
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      <AlertTriangle className="mr-2 w-5 h-5" />
                      Результат анализа
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className={`font-semibold text-xl mb-2 ${
                          explosionResult.riskLevel === 'critical' ? 'text-red-800 dark:text-red-200' :
                          explosionResult.riskLevel === 'high' ? 'text-orange-800 dark:text-orange-200' :
                          explosionResult.riskLevel === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-blue-800 dark:text-blue-200'
                        }`}>
                          Категория: {explosionResult.category}
                        </p>
                        
                        <p className={`text-sm mb-3 ${
                          explosionResult.riskLevel === 'critical' ? 'text-red-700 dark:text-red-300' :
                          explosionResult.riskLevel === 'high' ? 'text-orange-700 dark:text-orange-300' :
                          explosionResult.riskLevel === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          {explosionResult.description}
                        </p>
                        
                        <p className={`text-sm mb-3 ${
                          explosionResult.riskLevel === 'critical' ? 'text-red-700 dark:text-red-300' :
                          explosionResult.riskLevel === 'high' ? 'text-orange-700 dark:text-orange-300' :
                          explosionResult.riskLevel === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          Расчетное давление: {explosionResult.pressure} кПа
                        </p>
                      </div>
                      
                      <div className={`border-t pt-3 text-xs ${
                        explosionResult.riskLevel === 'critical' ? 'border-red-200 dark:border-red-700 text-red-600 dark:text-red-400' :
                        explosionResult.riskLevel === 'high' ? 'border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400' :
                        explosionResult.riskLevel === 'medium' ? 'border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400' :
                        'border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                      }`}>
                        <div className="font-medium mb-1">Детали расчета:</div>
                        {explosionResult.details.map((detail, index) => (
                          <div key={index}>• {detail}</div>
                        ))}
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
                  <AlertTriangle className="mr-2 w-5 h-5 text-red-500" />
                  Категории опасности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong className="text-red-600">А (взрывопожароопасная):</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Давление ≥20 кПа. Газы, ЛВЖ с t_всп ≤28°С
                  </p>
                </div>
                <div>
                  <strong className="text-orange-600">Б (взрывопожароопасная):</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Давление 5-20 кПа. ГСМ, пыли
                  </p>
                </div>
                <div>
                  <strong className="text-yellow-600">В1-В2 (пожароопасная):</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Горючие жидкости, твердые вещества
                  </p>
                </div>
                <div>
                  <strong className="text-blue-600">В3-В4 (пожароопасная):</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Трудногорючие вещества
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-blue-500" />
                  Методика расчета
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>Для газов и ЛВЖ:</strong>
                  <p className="text-xs">ΔP = K × (m_пр/V)^(2/3) × 100</p>
                </div>
                <div>
                  <strong>Для жидкостей:</strong>
                  <p className="text-xs">По температуре вспышки</p>
                </div>
                <div>
                  <strong>Для твердых веществ:</strong>
                  <p className="text-xs">По пожарной нагрузке q = (m×Q)/S</p>
                </div>
                <div className="mt-3 pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
                  m_пр - приведенная масса, V - объем, K - коэффициент
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
                <p><strong>НПБ 105-03</strong> - Определение категорий</p>
                <p><strong>Приказ МЧС РК</strong> - Методика расчета</p>
                
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
                  <strong>Склад ГСМ с бензином 1000л:</strong><br/>
                  Категория А (t_всп = -40°С)
                </div>
                <div>
                  <strong>Котельная с газом 100м³:</strong><br/>
                  Категория А (расчет по давлению)
                </div>
                <div>
                  <strong>Деревообработка 2000м³ древесины:</strong><br/>
                  Категория В1 (по пожарной нагрузке)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Другие калькуляторы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/calculators/fire-load">
                  <Button variant="outline" className="w-full mb-2">
                    Калькулятор пожарной нагрузки
                  </Button>
                </Link>
                <Link href="/calculators/evacuation">
                  <Button variant="outline" className="w-full mb-2">
                    Калькулятор эвакуации
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
