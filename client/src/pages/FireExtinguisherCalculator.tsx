import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Calculator, Shield, ArrowLeft, FileText, ExternalLink, Printer, RefreshCw } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Report from "@/components/ui/Report";

type Cat = "A"|"Б"|"В"|"Г"|"Д";

interface CalcOut {
  qty: number;
  perFloor: number[];
  powder: number;
  co2: number;
  wheeledQty: number;
  reserveQty: number;
  notes: string[];
  zeroCase?: boolean;
}

// ===== Нормы ППБ/СТ РК (внутренние константы) =====
const AREA_PER_OT: Record<Cat | string, number> = { A:50, "Б":50, "В":100, "Г":200, "Д":300 }; // м² на 1 ОТ
const MIN_OT_PER_FLOOR = 2;
const THRESHOLD_WHEELED = 500; // м²
const HAS_AUTOPUT_FACTOR = 0.5; // −50% при АУПТ

function evenSplit(total:number, buckets:number): number[] {
  const n = Math.max(1,buckets);
  const arr = new Array(n).fill(0);
  for(let i=0;i<total;i++) arr[i % n]++;
  return arr;
}

function recommendTypesText(hasElec:boolean, cat:Cat): string {
  const parts: string[] = [];
  if (hasElec) parts.push("1–2 шт. CO₂ (ОУ-5) для электро");
  if (cat==="A"||cat==="Б"||cat==="В") parts.push("основа — порошковые ОП-5/ОП-9 (ABC)");
  if (cat==="Г"||cat==="Д") parts.push("подойдут универсальные ОП-5");
  return parts.length ? parts.join("; ") : "";
}

export default function FireExtinguisherCalculator() {
  // Входные поля
  const [area, setArea] = useState<string>("");
  const [category, setCategory] = useState<Cat | "">("");
  const [floors, setFloors] = useState<string>("1");
  const [hasAUTP, setHasAUTP] = useState<boolean>(false);
  const [hasElec, setHasElec] = useState<boolean>(false);
  const [hasHoseCabinet, setHasHoseCabinet] = useState<boolean>(false);
  const [reservePct, setReservePct] = useState<string>("10");

  // Результат
  const [out, setOut] = useState<CalcOut | null>(null);

  const printPage = () => window.print();
  const reset = () => {
    setArea("");
    setCategory("");
    setFloors("1");
    setHasAUTP(false);
    setHasElec(false);
    setHasHoseCabinet(false);
    setReservePct("10");
    setOut(null);
  };

  const calculate = () => {
    if (!area || !category) return;

    const S = Math.max(0, parseInt(area));
    const cat = category as Cat;
    const floorsNum = Math.max(1, parseInt(floors) || 1);
    const reservePercent = Math.max(0, Math.min(50, parseInt(reservePct) || 0));

    // Особый случай: Д ≤ 100 м² → можно не устанавливать
    if (cat === "Д" && S <= 100) {
      setOut({
        qty: 0,
        perFloor: [],
        powder: 0,
        co2: 0,
        wheeledQty: 0,
        reserveQty: 0,
        notes: [
          "Допустимо не устанавливать (кат. Д ≤ 100 м²). См. методичку: Прил. 3 ППБ РК — исключение (см. якорь #m-ppa3p9).",
        ],
        zeroCase: true
      });
      return;
    }

    // База по площади
    const areaPerOT = AREA_PER_OT[cat] ?? 100;
    let qty = Math.ceil(S / areaPerOT);

    // Минимум 2 на этаж
    const minByFloor = MIN_OT_PER_FLOOR * floorsNum;
    if (qty < minByFloor) qty = minByFloor;

    // −50% при АУПТ (не ниже поэтажного минимума)
    if (hasAUTP) qty = Math.max(Math.ceil(qty * HAS_AUTOPUT_FACTOR), minByFloor);

    // Поэтажная разбивка
    const perFloor = evenSplit(qty, floorsNum);

    // Резерв (по умолчанию ~10%)
    const reserveQty = Math.ceil(qty * (reservePercent / 100));

    // Доля CO₂ при наличии электро
    let co2 = 0;
    if (hasElec) {
      co2 = qty >= 2 ? Math.max(2, Math.round(qty * 0.15)) : 1;
      if (co2 > qty) co2 = qty;
    }
    const powder = qty - co2;

    // Передвижные ОТ (тележка)
    let wheeledQty = 0;
    if (S > THRESHOLD_WHEELED) {
      // 1 при S>500 м², далее +1 на каждые ~1000 м²
      wheeledQty = 1 + Math.ceil((S - THRESHOLD_WHEELED) / 1000);
    }

    // Примечания/обоснование
    const notes: string[] = [];
    const typesText = recommendTypesText(hasElec, cat);
    if (typesText) notes.push(typesText + ".");
    if (wheeledQty > 0) notes.push(`Передвижные: ${wheeledQty} шт.`);
    if (hasHoseCabinet) notes.push("Размещайте по 2 огнетушителя (≥5 кг) в каждом пожарном шкафу.");
    notes.push("Обоснование: мин. 2 на этаж • −50% при АУПТ • макс. расстояния • резерв на ТО (ссылки в методичке).");

    setOut({ qty, perFloor, powder, co2, wheeledQty, reserveQty, notes });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Калькулятор огнетушителей - Расчёт по ППБ РК | NewsFire"
        description="Профессиональный калькулятор для расчёта количества и типов огнетушителей согласно ППБ РК (Приложение 3) и СТ РК 1487-2006. Учёт АУПТ, категории помещений, электрооборудования."
        keywords="калькулятор огнетушителей, ППБ РК, СТ РК 1487-2006, пожарная безопасность, огнетушители Казахстан, АУПТ, расчёт огнетушителей"
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Калькулятор огнетушителей",
          "description": "Калькулятор для расчёта количества огнетушителей по ППБ РК",
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="mb-6 space-y-3">
          <Breadcrumbs items={[
            { label: "Калькуляторы", href: "/calculators", icon: Shield },
            { label: "Огнетушители", icon: Calculator }
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
            <Calculator className="mr-3 w-8 h-8 text-red-500" />
            Калькулятор огнетушителей
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Расчёт по ППБ РК 2022 (Прил.3) и СТ РК 1487-2006. Подробные обоснования — в методичке.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая часть: форма */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Параметры помещения</CardTitle>
                <CardDescription>Введите данные для расчёта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="area">Площадь (м²)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="например, 250"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as Cat)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">А (взрыво-/пожароопасная)</SelectItem>
                        <SelectItem value="Б">Б (взрыво-/пожароопасная)</SelectItem>
                        <SelectItem value="В">В (пожароопасная)</SelectItem>
                        <SelectItem value="Г">Г (умеренная)</SelectItem>
                        <SelectItem value="Д">Д (пониженная)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="floors">Этажей</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="autp" checked={hasAUTP} onCheckedChange={(checked) => setHasAUTP(checked === true)} />
                    <Label htmlFor="autp">Есть АУПТ (спринклер/газ)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="elec" checked={hasElec} onCheckedChange={(checked) => setHasElec(checked === true)} />
                    <Label htmlFor="elec">Есть электрооборудование под напряжением</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hose" checked={hasHoseCabinet} onCheckedChange={(checked) => setHasHoseCabinet(checked === true)} />
                    <Label htmlFor="hose">Есть пожарные краны (ПК)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reserve">Резерв на ТО, %</Label>
                    <Input
                      id="reserve"
                      type="number"
                      value={reservePct}
                      onChange={(e) => setReservePct(e.target.value)}
                      min="0"
                      max="50"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Рекомендуем ~10% (СТ РК 1487, п. 8.5)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="w-full" size="lg" onClick={calculate}>
                    <Calculator className="mr-2 w-4 h-4" />
                    Рассчитать
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
                {out && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    {out.zeroCase ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Требуемое количество: 0 шт.</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">{out.notes[0]}</p>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Паспорт расчёта</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Площадь:</span> {area} м²</div>
                          <div><span className="text-gray-500">Категория:</span> {category}</div>
                          <div><span className="text-gray-500">Этажей:</span> {floors}</div>
                          <div><span className="text-gray-500">АУПТ:</span> {hasAUTP ? "есть (−50%)" : "нет"}</div>
                          <div><span className="text-gray-500">Электро:</span> {hasElec ? "есть" : "нет"}</div>
                          <div><span className="text-gray-500">Пож. шкафы:</span> {hasHoseCabinet ? "есть" : "нет"}</div>
                        </div>

                        <p className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                          Итого переносных ОТ: {out.qty} шт.
                        </p>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                            <thead className="bg-blue-100 dark:bg-blue-900/40">
                              <tr>
                                <th className="p-2 text-left">Этаж</th>
                                <th className="p-2 text-left">Кол-во ОТ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {out.perFloor.map((n, i) => (
                                <tr key={i} className="border-t border-blue-200 dark:border-blue-800">
                                  <td className="p-2">Этаж {i + 1}</td>
                                  <td className="p-2">{n}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="text-sm">
                          <p><strong>Состав по типам (рекомендация):</strong> порошковые — ≈{out.powder} шт; {hasElec ? <>CO₂ — ≈{out.co2} шт</> : <>CO₂ — при необходимости</>}.</p>
                          <p>
                            {recommendTypesText(hasElec, category as Cat) ? recommendTypesText(hasElec, category as Cat) + "." : ""}
                            {out.wheeledQty > 0 ? ` Передвижные: ${out.wheeledQty} шт.` : ""}
                            {hasHoseCabinet ? " Размещайте по 2 огнетушителя (≥5 кг) в каждом пожарном шкафу." : ""}
                          </p>
                        </div>

                        {hasHoseCabinet && (
                          <div className="text-blue-700 dark:text-blue-300 text-sm bg-blue-100 dark:bg-blue-800/30 p-2 rounded">
                            <strong>Пожарные краны:</strong> В каждом ПК рекомендуется размещать 2 огнетушителя согласно ППБ РК (Прил.3, п.8). 
                            Расстояние от ПК до места возгорания не должно превышать длину рукава + 5м.
                          </div>
                        )}

                        <div className="text-blue-700 dark:text-blue-300 text-sm bg-blue-100 dark:bg-blue-800/30 p-3 rounded mt-3">
                          <p className="font-medium mb-2">Дополнительные рекомендации:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Для неотапливаемых помещений используйте морозостойкие огнетушители (-40°C)</li>
                            <li>• В архивах и музеях предпочтительны хладоновые огнетушители (не повреждают экспонаты)</li>
                            <li>• Регулярная проверка: раз в 10 дней визуально, раз в квартал - техосмотр</li>
                            <li>• Перезарядка порошковых ОТ: каждые 5 лет, углекислотных: каждые 5 лет</li>
                          </ul>
                        </div>

                        <p className="text-sm">
                          <strong>Резерв на ТО/перезарядку:</strong> {out.reserveQty} шт (по умолчанию {reservePct}%).
                          <span className="ml-1">
                            См. <a href="/calculators/methodology#m-st1487p85" className="underline hover:text-blue-600">СТ РК 1487, п. 8.5</a>.
                          </span>
                        </p>

                        <p className="text-blue-700 dark:text-blue-300 text-sm border-t border-blue-200 dark:border-blue-700 pt-3">
                          <strong>Обоснование:</strong>{" "}
                          <a href="/calculators/methodology#m-ppa3p8" className="underline hover:text-blue-600">мин. 2 на этаж</a>{" • "}
                          <a href="/calculators/methodology#m-ppa3p13" className="underline hover:text-blue-600">−50% при АУПТ</a>{" • "}
                          <a href="/calculators/methodology#m-ppa3p14" className="underline hover:text-blue-600">макс. расстояния</a>{" • "}
                          <a href="/calculators/methodology#m-cabinet" className="underline hover:text-blue-600">2 ОТ в пожарном шкафу</a>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Унифицированный отчёт */}
            {out && !out.zeroCase && (
              <Report
                title="Калькулятор огнетушителей"
                calculatorType="Первичные средства пожаротушения"
                inputs={[
                  { label: "Площадь помещения", value: area, unit: "м²" },
                  { label: "Категория пожарной опасности", value: category },
                  { label: "Количество этажей", value: floors },
                  { label: "Наличие АУПТ", value: hasAUTP ? "Да" : "Нет" },
                  { label: "Электрооборудование", value: hasElec ? "Да" : "Нет" },
                  { label: "Пожарные краны", value: hasHoseCabinet ? "Да" : "Нет" },
                  { label: "Резерв на ТО", value: reservePct, unit: "%" }
                ]}
                formulas={[
                  {
                    name: "Расчёт базового количества по площади",
                    formula: "N_базовое = S ÷ S_норма",
                    substitution: `N_базовое = ${area} ÷ ${AREA_PER_OT[category as Cat]} = ${Math.ceil(parseInt(area) / AREA_PER_OT[category as Cat])}`,
                    result: Math.ceil(parseInt(area) / AREA_PER_OT[category as Cat]),
                    unit: "шт"
                  },
                  {
                    name: "Проверка минимума по этажам",
                    formula: "N_минимум = Этажи × 2",
                    substitution: `N_минимум = ${floors} × 2 = ${parseInt(floors) * 2}`,
                    result: parseInt(floors) * 2,
                    unit: "шт"
                  },
                  ...(hasAUTP ? [{
                    name: "Корректировка при наличии АУПТ",
                    formula: "N_АУПТ = N_базовое × 0.5",
                    substitution: `N_АУПТ = ${Math.ceil(parseInt(area) / AREA_PER_OT[category as Cat])} × 0.5 = ${Math.ceil(parseInt(area) / AREA_PER_OT[category as Cat]) * 0.5}`,
                    result: Math.ceil(parseInt(area) / AREA_PER_OT[category as Cat]) * 0.5,
                    unit: "шт"
                  }] : []),
                  {
                    name: "Резерв на техническое обслуживание",
                    formula: "N_резерв = N_основное × (Резерв% ÷ 100)",
                    substitution: `N_резерв = ${out.qty} × (${reservePct} ÷ 100) = ${out.reserveQty}`,
                    result: out.reserveQty,
                    unit: "шт"
                  }
                ]}
                calculations={[
                  { name: "Основное количество огнетушителей", value: out.qty, unit: "шт" },
                  { name: "Порошковые огнетушители", value: out.powder, unit: "шт", description: "Основные для тушения пожаров классов A, B, C" },
                  ...(hasElec ? [{ name: "Углекислотные огнетушители", value: out.co2, unit: "шт", description: "Для электрооборудования под напряжением" }] : []),
                  ...(out.wheeledQty > 0 ? [{ name: "Передвижные огнетушители", value: out.wheeledQty, unit: "шт", description: "При площади более 500 м²" }] : []),
                  { name: "Резерв на ТО", value: out.reserveQty, unit: "шт", description: "Для замены во время обслуживания" }
                ]}
                result={{
                  value: out.qty,
                  unit: "огнетушителей",
                  description: `Требуется установить ${out.qty} огнетушителей с распределением по этажам`,
                  status: "success"
                }}
                justification="Расчёт выполнен в соответствии с требованиями Правил пожарной безопасности РК 2022 (Приложение 3) и СТ РК 1487-2006. Учтены нормы площади покрытия на один огнетушитель, минимальное количество на этаж, корректировка при наличии АУПТ и необходимый резерв для технического обслуживания."
                references={[
                  { anchor: "m-ppa3p8", text: "ППБ РК 2022, Приложение 3, пункт 8 - минимум 2 огнетушителя на этаж", article: "Правила пожарной безопасности РК" },
                  { anchor: "m-ppa3p9", text: "ППБ РК 2022, Приложение 3, пункт 9 - исключение для категории Д до 100 м²" },
                  { anchor: "m-ppa3p13", text: "ППБ РК 2022, Приложение 3, пункт 13 - сокращение на 50% при АУПТ" },
                  { anchor: "m-ppa3p14", text: "ППБ РК 2022, Приложение 3, пункт 14 - максимальные расстояния до огнетушителей" },
                  { anchor: "m-st1487p85", text: "СТ РК 1487-2006, пункт 8.5 - требования к резерву для ТО", article: "СТ РК 1487-2006" },
                  { anchor: "m-cabinet", text: "ППБ РК 2022, Приложение 3 - размещение в пожарных шкафах" }
                ]}
                recommendations={[
                  "Для неотапливаемых помещений используйте морозостойкие огнетушители (-40°C)",
                  "В архивах и музеях предпочтительны хладоновые огнетушители (не повреждают экспонаты)",
                  "Регулярная проверка: раз в 10 дней визуально, раз в квартал - техосмотр",
                  "Перезарядка порошковых ОТ: каждые 5 лет, углекислотных: каждые 5 лет",
                  ...(hasHoseCabinet ? ["Размещайте по 2 огнетушителя (≥5 кг) в каждом пожарном шкафу"] : [])
                ]}
                notes={[
                  "Расчёт носит справочный характер. Окончательное решение принимается проектной организацией",
                  "Учитывайте особенности производственных процессов при выборе типа огнетушителей",
                  "Соблюдайте максимальные расстояния до огнетушителей согласно категории помещения"
                ]}
                calculationUrl={typeof window !== 'undefined' ? window.location.href : ''}
                className="mt-8"
              />
            )}
          </div>

          {/* Правая часть: справка/нормативы */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 w-5 h-5 text-orange-500" />
                  Нормативы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Площадь покрытия (на 1 ОТ):</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Категория А, Б: 50 м²</li>
                    <li>• Категория В: 100 м²</li>
                    <li>• Категория Г: 200 м²</li>
                    <li>• Категория Д: 300 м²</li>
                  </ul>
                </div>
                <div><strong>Минимум на этаж:</strong> не менее 2 огнетушителей</div>
                <div>
                  <strong>Макс. расстояния до ОТ:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>• Общественные: 20 м</li>
                    <li>• Категория А, Б, В: 30 м</li>
                    <li>• Категория Г: 40 м</li>
                    <li>• Категория Д: 70 м</li>
                  </ul>
                </div>
                <div><strong>При АУПТ:</strong> можно сократить на 50%</div>
                <div><strong>Особые случаи:</strong> Категория Д ≤ 100 м² — можно не устанавливать</div>
                <div><strong>Резерв:</strong> выведенные на ТО заменяются заряженными (СТ РК 1487)</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-blue-500" />
                  Документы
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>ППБ РК 2022</strong> — Прил. 3:
                  <a href="/calculators/methodology#m-ppa3p8" className="underline hover:text-blue-600">мин. 2 на этаж</a>,
                  <a href="/calculators/methodology#m-ppa3p9" className="underline hover:text-blue-600">кат. Д ≤ 100 м²</a>,
                  <a href="/calculators/methodology#m-ppa3p13" className="underline hover:text-blue-600">АУПТ −50%</a>,
                  <a href="/calculators/methodology#m-ppa3p14" className="underline hover:text-blue-600">макс. расстояния</a>
                </p>
                <p><strong>СТ РК 1487-2006</strong> — эксплуатация/ТО, п. 8.5</p>
                <p><strong>СП РК 2.02-101-2022</strong> — Категории помещений</p>

                <Link href="/calculators/methodology" className="text-blue-600 hover:text-blue-800 underline cursor-pointer">
                  Подробнее о методологии расчета
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Примеры расчётов</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Офис 250 м², кат. В:</strong><br/>250 ÷ 100 = 3 ОТ (мин. 2 на этаж)</div>
                <div><strong>Склад 600 м², кат. Б:</strong><br/>600 ÷ 50 = 12 ОТ + передвижной(ые)</div>
                <div><strong>Цех 1200 м², кат. В + АУПТ:</strong><br/>(1200 ÷ 100) × 0.5 = 6 ОТ</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Другие калькуляторы</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Link href="/calculators/ngps">
                  <Button variant="outline" className="w-full mb-2">Калькулятор НГПС</Button>
                </Link>
                <Link href="/calculators">
                  <Button variant="outline" className="w-full">Все калькуляторы</Button>
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
