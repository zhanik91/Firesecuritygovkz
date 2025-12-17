import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PrintButton from '@/components/ui/PrintButton';
import { ExternalLink } from 'lucide-react';

interface ReportInput {
  label: string;
  value: string | number;
  unit?: string;
}

interface ReportFormula {
  name: string;
  formula: string;
  substitution: string;
  result: string | number;
  unit?: string;
}

interface ReportCalculation {
  name: string;
  value: string | number;
  unit?: string;
  description?: string;
}

interface ReportReference {
  anchor: string;
  text: string;
  article?: string;
}

interface ReportProps {
  title: string;
  calculatorType: string;
  date?: string;
  version?: string;
  
  // Основные разделы
  inputs: ReportInput[];
  formulas: ReportFormula[];
  calculations: ReportCalculation[];
  result: {
    value: string | number;
    unit?: string;
    description: string;
    status?: 'success' | 'warning' | 'error';
  };
  
  // Обоснование и ссылки
  justification: string;
  references: ReportReference[];
  
  // QR код или ссылка
  calculationUrl?: string;
  qrCodeUrl?: string;
  
  // Дополнительные элементы
  recommendations?: string[];
  notes?: string[];
  className?: string;
}

export function Report({
  title,
  calculatorType,
  date = new Date().toLocaleDateString('ru-RU'),
  version = '1.0',
  inputs,
  formulas,
  calculations,
  result,
  justification,
  references,
  calculationUrl,
  qrCodeUrl,
  recommendations,
  notes,
  className = ''
}: ReportProps) {
  
  const printReport = () => {
    window.print();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className={`report-container print:max-w-none print:shadow-none ${className}`} id="calculation-report">
      <div className="no-print mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Паспорт расчёта</h2>
        <PrintButton />
      </div>

      {/* Обложка отчёта */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="NewsFire Logo" 
              className="h-12 w-auto print:h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold print:text-xl">
            {title}
          </CardTitle>
          <div className="text-lg text-muted-foreground print:text-base">
            Расчёт: {calculatorType}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-4 print:text-xs">
            <span>Дата: {date}</span>
            <span>Версия: {version}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Вводные данные */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader>
          <CardTitle className="text-xl">1. Вводные данные</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{input.label}:</span>
                <span className="text-right">
                  {input.value} {input.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Формулы с подстановкой */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader>
          <CardTitle className="text-xl">2. Формулы и расчёты</CardTitle>
        </CardHeader>
        <CardContent>
          {formulas.map((formula, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{formula.name}</h4>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Формула:</span>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                    {formula.formula}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Подстановка:</span>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                    {formula.substitution}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Результат:</span>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded mt-1 font-bold">
                    {formula.result} {formula.unit || ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Промежуточные расчёты */}
      {calculations.length > 0 && (
        <Card className="mb-6 page-break-avoid">
          <CardHeader>
            <CardTitle className="text-xl">3. Промежуточные расчёты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculations.map((calc, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">{calc.name}</span>
                    {calc.description && (
                      <div className="text-sm text-muted-foreground">{calc.description}</div>
                    )}
                  </div>
                  <span className="font-bold">
                    {calc.value} {calc.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Итоговый результат */}
      <Card className={`mb-6 page-break-avoid ${getStatusColor(result.status)}`}>
        <CardHeader>
          <CardTitle className="text-xl">4. Итоговый результат</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 print:text-2xl">
              {result.value} {result.unit || ''}
            </div>
            <div className="text-lg">{result.description}</div>
          </div>
        </CardContent>
      </Card>

      {/* Обоснование */}
      <Card className="mb-6 page-break-avoid">
        <CardHeader>
          <CardTitle className="text-xl">5. Обоснование</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{justification}</p>
          
          <h4 className="font-semibold mb-3">Нормативные ссылки:</h4>
          <ol className="space-y-2">
            {references.map((ref, index) => (
              <li key={index} className="flex items-start">
                <span className="font-bold mr-2">{index + 1}.</span>
                <div className="flex-1">
                  <span>{ref.text}</span>
                  {ref.article && (
                    <span className="text-muted-foreground ml-1">({ref.article})</span>
                  )}
                  <a 
                    href={`/calculators/methodology#${ref.anchor}`}
                    className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800 text-sm no-print"
                  >
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="print-only text-xs text-muted-foreground block">
                    Ссылка: /calculators/methodology#{ref.anchor}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      {recommendations && recommendations.length > 0 && (
        <Card className="mb-6 page-break-avoid">
          <CardHeader>
            <CardTitle className="text-xl">6. Рекомендации</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Примечания */}
      {notes && notes.length > 0 && (
        <Card className="mb-6 page-break-avoid">
          <CardHeader>
            <CardTitle className="text-xl">7. Примечания</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {notes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* QR код и ссылка */}
      {(calculationUrl || qrCodeUrl) && (
        <Card className="mb-6 page-break-avoid">
          <CardHeader>
            <CardTitle className="text-xl">8. Ссылка на расчёт</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {qrCodeUrl && (
              <div className="mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR код для доступа к расчёту" 
                  className="mx-auto h-32 w-32 print:h-24 print:w-24"
                />
              </div>
            )}
            {calculationUrl && (
              <div className="text-sm text-muted-foreground font-mono break-all">
                {calculationUrl}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Подпись и печать */}
      <div className="mt-8 print-only">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="print-signature-line"></div>
            <div className="text-sm mt-2">Подпись ответственного лица</div>
          </div>
          <div className="print-company-stamp">М.П.</div>
        </div>
        <div className="print-date">
          Дата составления: {date}
        </div>
      </div>
    </div>
  );
}

export default Report;