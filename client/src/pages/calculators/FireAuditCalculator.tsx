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
import { Shield, CheckCircle, AlertTriangle, XCircle, ArrowLeft, FileText, Printer, RefreshCw, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEOHead from "@/components/SEOHead";

type BuildingCategory = "А" | "Б" | "В" | "Г" | "Д";
type BuildingType = "производственное" | "складское" | "административное" | "общественное" | "жилое" | "торговое";

interface AuditCriterion {
  id: string;
  name: string;
  category: "critical" | "major" | "minor";
  isCompliant: boolean | null;
  comment?: string;
  regulation: string;
}

interface AuditResult {
  totalCriteria: number;
  compliant: number;
  nonCompliant: number;
  notChecked: number;
  compliancePercentage: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  criticalIssues: string[];
}

export default function FireAuditCalculator() {
  const [buildingType, setBuildingType] = useState<BuildingType>("производственное");
  const [category, setCategory] = useState<BuildingCategory>("В");
  const [area, setArea] = useState<string>("1000");
  const [floors, setFloors] = useState<string>("1");
  const [occupancy, setOccupancy] = useState<string>("50");

  // Инициализация критериев аудита
  const [criteria, setCriteria] = useState<AuditCriterion[]>([
    {
      id: "fire_exits",
      name: "Эвакуационные выходы (ширина, количество)",
      category: "critical",
      isCompliant: null,
      regulation: "ППБ РК Прил.2, п.7-9"
    },
    {
      id: "exit_signs",
      name: "Указатели эвакуационных выходов",
      category: "major",
      isCompliant: null,
      regulation: "СТ РК 1240-2014"
    },
    {
      id: "extinguishers",
      name: "Огнетушители (количество, размещение)",
      category: "critical",
      isCompliant: null,
      regulation: "ППБ РК Прил.3"
    },
    {
      id: "fire_detection",
      name: "Система пожарной сигнализации",
      category: "critical",
      isCompliant: null,
      regulation: "СТ РК 1240-2014"
    },
    {
      id: "hydrants",
      name: "Внутренние пожарные краны",
      category: "major",
      isCompliant: null,
      regulation: "ППБ РК Прил.4"
    },
    {
      id: "emergency_lighting",
      name: "Аварийное освещение",
      category: "major",
      isCompliant: null,
      regulation: "СП РК 2.04-101-2022"
    },
    {
      id: "smoke_removal",
      name: "Система дымоудаления",
      category: "major",
      isCompliant: null,
      regulation: "СП РК 2.04-102-2022"
    },
    {
      id: "fire_doors",
      name: "Противопожарные двери и ворота",
      category: "critical",
      isCompliant: null,
      regulation: "ППБ РК п.15"
    },
    {
      id: "electrical_safety",
      name: "Электробезопасность (заземление, УЗО)",
      category: "major",
      isCompliant: null,
      regulation: "ПУЭ РК, разд.7"
    },
    {
      id: "storage_hazmat",
      name: "Хранение опасных веществ",
      category: "critical",
      isCompliant: null,
      regulation: "ППБ РК п.22-25"
    },
    {
      id: "maintenance_records",
      name: "Журналы ТО систем пожарной безопасности",
      category: "minor",
      isCompliant: null,
      regulation: "СТ РК 1487-2006"
    },
    {
      id: "training_records",
      name: "Обучение персонала пожарной безопасности",
      category: "major",
      isCompliant: null,
      regulation: "ППБ РК п.30-32"
    }
  ]);

  const [result, setResult] = useState<AuditResult | null>(null);

  const updateCriterion = (id: string, isCompliant: boolean | null, comment?: string) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, isCompliant, comment } : c
    ));
  };

  const calculateAudit = () => {
    const totalCriteria = criteria.length;
    const compliant = criteria.filter(c => c.isCompliant === true).length;
    const nonCompliant = criteria.filter(c => c.isCompliant === false).length;
    const notChecked = criteria.filter(c => c.isCompliant === null).length;
    
    const compliancePercentage = totalCriteria > 0 ? Math.round((compliant / totalCriteria) * 100) : 0;
    
    let riskLevel: AuditResult['riskLevel'] = "low";
    const criticalNonCompliant = criteria.filter(c => c.category === "critical" && c.isCompliant === false).length;
    
    if (criticalNonCompliant > 0) {
      riskLevel = "critical";
    } else if (compliancePercentage < 60) {
      riskLevel = "high";
    } else if (compliancePercentage < 80) {
      riskLevel = "medium";
    }

    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    criteria.forEach(c => {
      if (c.isCompliant === false) {
        if (c.category === "critical") {
          criticalIssues.push(`КРИТИЧНО: ${c.name} - ${c.regulation}`);
        }
        
        switch (c.id) {
          case "fire_exits":
            recommendations.push("Проверить соответствие количества и ширины эвакуационных выходов нормативам");
            break;
          case "extinguishers":
            recommendations.push("Установить недостающие огнетушители согласно расчету по площади");
            break;
          case "fire_detection":
            recommendations.push("Установить/отремонтировать систему пожарной сигнализации");
            break;
          case "training_records":
            recommendations.push("Провести обучение персонала и оформить соответствующие документы");
            break;
        }
      }
    });

    if (compliancePercentage < 100) {
      recommendations.push("Устранить все выявленные нарушения в установленные сроки");
      recommendations.push("Провести повторную проверку после устранения замечаний");
    }

    const newResult: AuditResult = {
      totalCriteria,
      compliant,
      nonCompliant,
      notChecked,
      compliancePercentage,
      riskLevel,
      recommendations,
      criticalIssues
    };

    setResult(newResult);
  };

  const reset = () => {
    setBuildingType("производственное");
    setCategory("В");
    setArea("1000");
    setFloors("1");
    setOccupancy("50");
    setCriteria(prev => prev.map(c => ({ ...c, isCompliant: null, comment: "" })));
    setResult(null);
  };

  const printPage = () => window.print();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-600 bg-green-50 border-green-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "low": return "Низкий риск";
      case "medium": return "Средний риск";
      case "high": return "Высокий риск";
      case "critical": return "Критический риск";
      default: return "Не определен";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead 
        title="Калькулятор пожарного аудита - NewsFire"
        description="Комплексная проверка соответствия объекта требованиям пожарной безопасности по ключевым критериям ППБ РК и строительным нормам Казахстана"
        keywords="пожарный аудит, ППБ РК, проверка пожарной безопасности, критерии соответствия, системы безопасности, Казахстан"
      />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6 space-y-3 print:hidden">
          <Breadcrumbs items={[
            { label: "Калькуляторы", href: "/calculators" },
            { label: "Пожарный аудит" }
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
            <Shield className="mr-3 w-8 h-8 text-blue-500" />
            Калькулятор пожарного аудита
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Комплексная проверка соответствия объекта требованиям пожарной безопасности по ключевым критериям ППБ РК и строительным нормам
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая часть: параметры объекта */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Параметры объекта</CardTitle>
                <CardDescription>Основные характеристики здания</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <SelectItem value="торговое">Торговое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Категория помещений</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as BuildingCategory)}>
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

                <div>
                  <Label htmlFor="area">Общая площадь (м²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="floors">Количество этажей</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="occupancy">Максимальная загрузка людьми</Label>
                  <Input
                    id="occupancy"
                    type="number"
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateAudit} className="flex-1">
                    <Shield className="mr-2 w-4 h-4" />
                    Рассчитать
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={printPage}>
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Центральная часть: критерии аудита */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Критерии пожарной безопасности</CardTitle>
                <CardDescription>Отметьте соответствие каждого критерия нормативам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criteria.map((criterion) => (
                    <div key={criterion.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {criterion.name}
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              criterion.category === "critical" 
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : criterion.category === "major"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}>
                              {criterion.category === "critical" ? "Критично" : 
                               criterion.category === "major" ? "Важно" : "Второстепенно"}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {criterion.regulation}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${criterion.id}-compliant`}
                            name={criterion.id}
                            checked={criterion.isCompliant === true}
                            onChange={() => updateCriterion(criterion.id, true)}
                            className="w-4 h-4 text-green-600"
                          />
                          <label htmlFor={`${criterion.id}-compliant`} className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Соответствует
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${criterion.id}-non-compliant`}
                            name={criterion.id}
                            checked={criterion.isCompliant === false}
                            onChange={() => updateCriterion(criterion.id, false)}
                            className="w-4 h-4 text-red-600"
                          />
                          <label htmlFor={`${criterion.id}-non-compliant`} className="text-sm text-red-600 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            Не соответствует
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${criterion.id}-not-checked`}
                            name={criterion.id}
                            checked={criterion.isCompliant === null}
                            onChange={() => updateCriterion(criterion.id, null)}
                            className="w-4 h-4 text-gray-600"
                          />
                          <label htmlFor={`${criterion.id}-not-checked`} className="text-sm text-gray-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Не проверено
                          </label>
                        </div>
                      </div>
                      
                      <Input
                        placeholder="Комментарий (необязательно)"
                        value={criterion.comment || ""}
                        onChange={(e) => updateCriterion(criterion.id, criterion.isCompliant, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Результаты аудита */}
        {result && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Результаты пожарного аудита</CardTitle>
                <CardDescription>
                  Объект: {buildingType}, категория {category}, {area} м², {floors} эт., до {occupancy} чел.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Общая статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.totalCriteria}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Всего критериев</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.compliant}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Соответствует</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.nonCompliant}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Нарушения</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{result.notChecked}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Не проверено</div>
                  </div>
                </div>

                {/* Уровень соответствия */}
                <div className={`p-4 rounded-lg border ${getRiskColor(result.riskLevel)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Уровень соответствия: {result.compliancePercentage}%
                      </h3>
                      <p className="text-sm opacity-90">
                        Оценка риска: {getRiskLabel(result.riskLevel)}
                      </p>
                    </div>
                    <div className="text-right">
                      {result.riskLevel === "low" && <CheckCircle className="w-8 h-8" />}
                      {result.riskLevel === "medium" && <AlertTriangle className="w-8 h-8" />}
                      {result.riskLevel === "high" && <AlertTriangle className="w-8 h-8" />}
                      {result.riskLevel === "critical" && <XCircle className="w-8 h-8" />}
                    </div>
                  </div>
                </div>

                {/* Критические нарушения */}
                {result.criticalIssues.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      Критические нарушения (требуют немедленного устранения)
                    </h3>
                    <ul className="space-y-2">
                      {result.criticalIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-700 dark:text-red-300">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Рекомендации */}
                {result.recommendations.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Рекомендации по устранению нарушений
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-gray-500 border-t pt-4">
                  <p><strong>Правовая база:</strong> ППБ РК (Постановление Правительства от 9 июля 2022 года №481), 
                  СП РК 2.04-101-2022, СП РК 2.04-102-2022, СТ РК 1240-2014, СТ РК 1487-2006</p>
                  <p className="mt-2"><strong>Примечание:</strong> Данный аудит носит предварительный характер. 
                  Окончательное заключение о соответствии требованиям пожарной безопасности выносится 
                  аккредитованными организациями.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}