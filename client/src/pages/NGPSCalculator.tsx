import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Shield, Users, ArrowLeft, FileText, ExternalLink, Truck, Building, Printer, RefreshCw, Info } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

/** Типы */
type Cat = "A" | "Б" | "В" | "Г" | "Д";

interface NGPSResult {
  required: boolean;
  isPost: boolean;
  unitType: "пожарная часть" | "пожарный пост" | "не требуется";
  vehicles: number;
  vehicleHint: string;
  staffShift: number;   // в смене
  staff3: number;       // при 3 караулах
  staff4: number;       // при 4 караулах
  details: string[];    // пояснения
  justification: string; // обоснование строкой
}

/** Константы и справочники */
const MANDATORY_INDUSTRIES = [
  "нефтегаз",
  "химия",
  "энергетика",
  "горнодобыча",
  "аэропорт",
  "складГСМ",
  "метрополитен",
  "ядерные",
] as const;

const TECH_BASE: Record<string, number> = {
  нефтегаз: 2,
  химия: 2,
  энергетика: 1,
  складГСМ: 1,
  прочее: 0,
  административный: 0,
  горнодобыча: 2,
  аэропорт: 2,
  метрополитен: 2,
  ядерные: 3,
};

function staffPerShift(numAuto: number) {
  if (numAuto <= 0) return 2; // пост: 2 на дежурстве
  // 1 авто: ком. отделения + водитель + 2 пожарных = 4;
  // 2 авто: + начальник караула, + водитель/пожарный = ~6;
  // далее +2 чел на каждую дополнительную единицу
  return numAuto === 1 ? 4 : 6 + Math.max(0, numAuto - 2) * 2;
}

function staffTotal(numAuto: number, karauls: number) {
  const shift = staffPerShift(numAuto);
  return shift * karauls + (numAuto > 0 ? 2 : 0); // +2 руководящих (ориентир)
}

function vehicleHintByType(type: string, numAuto: number) {
  const base =
    type === "нефтегаз"
      ? "основная автоцистерна + пенная/порошковая установка"
      : type === "химия"
      ? "основная автоцистерна + порошковая установка"
      : type === "аэропорт"
      ? "аэродромные автоцистерны повышенной проходимости"
      : numAuto > 0
      ? "основная автоцистерна"
      : "—";
  return base;
}

/** Компонент */
export default function NGPSCalculator() {
  // Ввод
  const [objectType, setObjectType] = useState<string>("прочее");
  const [area, setArea] = useState<string>("5000");
  const [category, setCategory] = useState<Cat | "">("В");
  const [distance, setDistance] = useState<string>("5");
  const [error, setError] = useState<string>("");

  // Вывод
  const [res, setRes] = useState<NGPSResult | null>(null);

  const printPage = () => window.print();
  const reset = () => {
    setObjectType("прочее");
    setArea("0");
    setCategory("В");
    setDistance("0");
    setRes(null);
    setError("");
  };

  const calculateNGPS = () => {
    setError("");
    if (area.trim() === "" || category === "" || distance.trim() === "") {
      setError("Заполните все поля: площадь, категория, расстояние.");
      setRes(null);
      return;
    }

    const areaNum = Math.max(0, parseInt(area));
    const dist = Math.max(0, parseFloat(distance));
    const type = objectType;
    const cat = category as Cat;

    if (Number.isNaN(areaNum) || Number.isNaN(dist) || areaNum <= 0 || dist < 0) {
      setError("Некорректные значения. Площадь должна быть > 0, расстояние ≥ 0.");
      setRes(null);
      return;
    }

    const isHazardCat = /^(A|Б|В)$/.test(cat);

    // НОВОЕ: обязательность определяется Перечнем (Приказ МЧС №281). Универсальное правило S≥3500 & D>3 км — УДАЛЕНО.
    const byList = (MANDATORY_INDUSTRIES as readonly string[]).includes(type);

    let required = false;
    let isPost = false;
    let numAuto = 0;
    const details: string[] = [];

    if (byList) {
      required = true;
      numAuto = TECH_BASE[type] ?? 1;
      details.push(`Отрасль «${type}» включена в Перечень объектов с обязательной НГПС (Приказ МЧС №281).`);
    } else if (dist > 3 && isHazardCat) {
      // Не из Перечня, но удалённость большая — рекомендовать пост
      isPost = true;
      details.push(`Объект не подпадает под Перечень (№281). При расстоянии ${dist} км > 3 км целесообразен пожарный пост или договор с НГПС/ГПС.`);
    } else {
      details.push(`Признаков обязательности по Перечню (№281) нет; расстояние до ПЧ: ${dist} км.`);
    }

    // Усиление по крупной площади (рекомендация, не норма)
    if (required && areaNum > 10000 && numAuto < 2) {
      numAuto = 2;
      details.push(`Площадь {'>'} 10000 м² — рекомендуется увеличить парк до ${numAuto} авто (ориентир).`);
    }

    // Штаты (ориентиры)
    const shift = required ? staffPerShift(numAuto) : isPost ? 2 : 0;
    const total3 = required ? staffTotal(numAuto, 3) : isPost ? 8 : 0; // пост: ~2×4 = 8
    const total4 = required ? staffTotal(numAuto, 4) : isPost ? 10 : 0; // пост: ~2×5 = 10

    // Подсказка по функциональным типам техники
    const hint = vehicleHintByType(type, required ? numAuto : 0);

    // Обоснование
    const justification = required
      ? "Перечень объектов: Приказ МЧС РК №281; ППБ РК (Приказ №55) п. 7 — организация НГПС на объектах из Перечня; Правила НГПС №782."
      : isPost
      ? "ППБ №55 п. 7: при удалённости целесообразен пожарный пост (без техники) или договор с НГПС/ГПС; Правила НГПС №782."
      : "Нет формальной обязанности по Перечню (№281): соблюдать общие требования ППБ №55 и прикрытие ГПС.";

    setRes({
      required,
      isPost: !required && isPost,
      unitType: required ? "пожарная часть" : isPost ? "пожарный пост" : "не требуется",
      vehicles: required ? numAuto : 0,
      vehicleHint: hint,
      staffShift: shift,
      staff3: total3,
      staff4: total4,
      details,
      justification,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6 space-y-3 print:hidden">
          <Breadcrumbs items={[
            { label: "Калькуляторы", href: "/calculators" },
            { label: "НГПС" }
          ]} />
          <Link href="/calculators">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Назад к калькуляторам
            </Button>
          </Link>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <Shield className="mr-3 w-8 h-8 text-blue-500" />
            Калькулятор НГПС
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Определение обязательности по Перечню (Приказ МЧС №281), рекомендации по технике/штатам. Обоснования — в методичке.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая часть: форма + результат */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Параметры объекта</CardTitle>
                <CardDescription>Введите данные для расчёта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="object-type">Отрасль/тип объекта</Label>
                    <Select value={objectType} onValueChange={setObjectType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип объекта" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="прочее">Прочее производство</SelectItem>
                        <SelectItem value="нефтегаз">Нефтегаз / НПЗ / нефтебаза</SelectItem>
                        <SelectItem value="химия">Химическое производство</SelectItem>
                        <SelectItem value="энергетика">Энергетика (ТЭЦ/ПС)</SelectItem>
                        <SelectItem value="горнодобыча">Горнодобыча / ГОК</SelectItem>
                        <SelectItem value="аэропорт">Аэропорт</SelectItem>
                        <SelectItem value="складГСМ">Склад ГСМ ({'>'}500 т)</SelectItem>
                        <SelectItem value="метрополитен">Метрополитен</SelectItem>
                        <SelectItem value="ядерные">Ядерные объекты</SelectItem>
                        <SelectItem value="административный">Административный / торговый</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Обязательность по Постановлению №1017 от 25.09.2014 и Методическим указаниям МЧС.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="area">Площадь опасных помещений (м²)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="например, 5000"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      min="0"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Суммарная площадь помещений категорий А, Б, В (все подкатегории В1-В4) на объекте</p>
                  </div>

                  <div>
                    <Label htmlFor="category">Категория помещений</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as Cat)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">А (взрывопожароопасная)</SelectItem>
                        <SelectItem value="Б">Б (взрывопожароопасная)</SelectItem>
                        <SelectItem value="В">В (В1-В4 пожароопасная)</SelectItem>
                        <SelectItem value="Г">Г (умеренная)</SelectItem>
                        <SelectItem value="Д">Д (пониженная)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="distance">Расстояние до ПЧ МЧС (км)</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="например, 5"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Расстояние по прямой до ближайшей пожарной части МЧС (км)</p>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button className="w-full" size="lg" onClick={calculateNGPS}>
                    <Shield className="mr-2 w-4 h-4" />
                    Проверить необходимость НГПС
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Сброс
                  </Button>
                  <Button variant="outline" onClick={printPage}>
                    <Printer className="mr-2 w-4 h-4" />
                    Печать/PDF
                  </Button>
                </div>

                {/* Результат */}
                {res && (
                  <div
                    className={`p-6 rounded-lg border ${
                      res.required
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : res.isPost
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        res.required
                          ? 'text-red-800 dark:text-red-200'
                          : res.isPost
                          ? 'text-yellow-800 dark:text-yellow-200'
                          : 'text-green-800 dark:text-green-200'
                      }`}
                    >
                      Результат анализа
                    </h3>

                    {/* Паспорт */}
                    <div className="space-y-4">
                      {res.required ? (
                        <>
                          <p className="text-red-800 dark:text-red-200 font-semibold text-xl">
                            <Building className="inline w-5 h-5 mr-2" />
                            НГПС обязательна: {res.unitType}
                          </p>
                          <div className="bg-white dark:bg-red-900/30 p-4 rounded-lg space-y-3">
                            <p className="text-red-700 dark:text-red-300 font-medium">
                              <Truck className="inline w-4 h-4 mr-2" />
                              Техника: {res.vehicles} ед.
                            </p>
                            <p className="text-red-600 dark:text-red-400 text-sm ml-6">{res.vehicleHint}</p>

                            <p className="text-red-700 dark:text-red-300 font-medium">
                              <Users className="inline w-4 h-4 mr-2" />
                              Штат: в смене — ≈{res.staffShift} чел; всего: {res.staff3} (3 караула) / {res.staff4} (4 караула)
                            </p>
                            <p className="text-red-600 dark:text-red-400 text-sm ml-6">
                              Численность зависит от графика и структуры подразделения.
                            </p>
                          </div>
                        </>
                      ) : res.isPost ? (
                        <>
                          <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-xl">
                            НГПС не обязательна — рекомендуется пожарный пост
                          </p>
                          <div className="bg-white dark:bg-yellow-900/30 p-4 rounded-lg space-y-2">
                            <p className="text-yellow-700 dark:text-yellow-300">
                              <Users className="inline w-4 h-4 mr-2" />
                              Штат: в смене — ≈2 чел; всего ~8 (3 караула) / ~10 (4 караула)
                            </p>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm ml-6">
                              Либо заключить договор с НГПС/ГПС МЧС на прикрытие.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-green-800 dark:text-green-200 font-semibold text-xl">
                            НГПС не обязательна
                          </p>
                          <p className="text-green-700 dark:text-green-300">
                            Достаточно мер общей пожарной безопасности и прикрытия ГПС.
                          </p>
                        </>
                      )}

                      {/* Детали анализа */}
                      <div
                        className={`border-t pt-3 text-sm ${
                          res.required
                            ? 'border-red-200 dark:border-red-700'
                            : res.isPost
                            ? 'border-yellow-200 dark:border-yellow-700'
                            : 'border-green-200 dark:border-green-700'
                        }`}
                      >
                        <p className="font-medium mb-2">Детали анализа:</p>
                        <ul className="space-y-1">
                          {res.details.map((d, i) => (
                            <li key={i} className="flex items-start">
                              <span className="w-2 h-2 rounded-full bg-current mt-2 mr-2 flex-shrink-0"></span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p
                        className={`text-sm border-t pt-3 ${
                          res.required
                            ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
                            : res.isPost
                            ? 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700'
                            : 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-700'
                        }`}
                      >
                        <strong>Нормативное обоснование:</strong> {res.justification}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: пояснения/нормативы/примеры */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-blue-500" />
                  Критерии обязательности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>По Перечню (Приказ МЧС №281):</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Нефтегазовые объекты, НПЗ, нефтебазы</li>
                    <li>• Химические производства</li>
                    <li>• Энергетические объекты</li>
                    <li>• Горнодобывающие предприятия</li>
                    <li>• Аэропорты</li>
                    <li>• Склады ГСМ</li>
                  </ul>
                </div>
                <div>
                  <strong>Удалённость:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Если объект НЕ в Перечне, но расстояние до ПЧ {'>'} 3 км — рекомендуется пожарный пост или договор с НГПС/ГПС.</li>
                  </ul>
                </div>
                <div>
                  <strong>Виды подразделений:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Пожарная часть (с выездной техникой)</li>
                    <li>• Пожарный пост (без техники)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 w-5 h-5 text-orange-500" />
                  Техника — ориентиры
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Нефтегаз:</strong> АЦ + пенная/порошковая установка</div>
                <div><strong>Химия:</strong> АЦ + порошковая установка</div>
                <div><strong>Аэропорт:</strong> аэродромные АЦ повышенной проходимости</div>
                <div><strong>Энергетика/прочие:</strong> основная АЦ</div>
                <div className="mt-3 pt-2 border-t">
                  <div><strong>Площадь {'>'} 10000 м²:</strong> рекомендуем +1 АЦ (рекомендация).</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 w-5 h-5 text-orange-500" />
                  Нормативы
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Перечень НГПС:</strong> Приказ МЧС РК №281</p>
                <p><strong>ППБ РК 2022 (Приказ №55) п. 7:</strong> организация НГПС на объектах из Перечня</p>
                <p><strong>Правила НГПС №782:</strong> деятельность и организация НГПС, договоры</p>

                <Link href="/calculators/methodology#m-mchs281">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Методичка: раздел по НГПС
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Примеры расчётов</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <strong>НПЗ 8000 м², кат. А, 5 км:</strong><br />
                  Обязательна НГПС → 2 авто; штат ≈ в смене 6, всего 20 (3 караула) / 26 (4 караула).
                </div>
                <div>
                  <strong>«Прочее» 4000 м², кат. В, 5 км:</strong><br />
                  Перечень не требует; расстояние {'>'} 3 км — рекомендуется пожарный пост: в смене 2, всего 8/10.
                </div>
                <div>
                  <strong>Административный 2000 м², кат. Д, 2 км:</strong><br />
                  НГПС не обязательна — прикрытие ГПС.
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