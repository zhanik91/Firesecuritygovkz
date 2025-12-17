import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ValidationHelperProps {
  errors: string[];
  type?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
}

export function ValidationHelper({ errors, type = 'error', className = '' }: ValidationHelperProps) {
  if (!errors || errors.length === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant()} className={`mt-2 ${className}`}>
      {getIcon()}
      <AlertDescription>
        {errors.length === 1 ? (
          <span>{errors[0]}</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface InputHelpProps {
  text: string;
  type?: 'help' | 'example' | 'warning';
  className?: string;
}

export function InputHelp({ text, type = 'help', className = '' }: InputHelpProps) {
  const getTextColor = () => {
    switch (type) {
      case 'help':
        return 'text-muted-foreground';
      case 'example':
        return 'text-blue-600';
      case 'warning':
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <p className={`text-sm mt-1 ${getTextColor()} ${className}`}>
      {type === 'example' && 'Пример: '}
      {text}
    </p>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  help?: string;
  helpType?: 'help' | 'example' | 'warning';
  errors?: string[];
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  required = false, 
  help, 
  helpType = 'help',
  errors, 
  children, 
  className = '' 
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {help && <InputHelp text={help} type={helpType} />}
      {errors && errors.length > 0 && <ValidationHelper errors={errors} />}
    </div>
  );
}

// Хук для унифицированной валидации
export function useValidation() {
  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email обязателен';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный формат email';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Опциональное поле
    if (!/^(\+7|8)[0-9]{10}$/.test(phone)) return 'Номер телефона должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX';
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} обязательно для заполнения`;
    return null;
  };

  const validateLength = (value: string, min: number, max: number, fieldName: string): string | null => {
    if (value.length < min) return `${fieldName} должно содержать минимум ${min} символов`;
    if (value.length > max) return `${fieldName} должно содержать максимум ${max} символов`;
    return null;
  };

  const validateNumber = (value: string | number, min?: number, max?: number, fieldName?: string): string | null => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `${fieldName || 'Значение'} должно быть числом`;
    if (min !== undefined && num < min) return `${fieldName || 'Значение'} должно быть не менее ${min}`;
    if (max !== undefined && num > max) return `${fieldName || 'Значение'} должно быть не более ${max}`;
    return null;
  };

  const validateUrl = (url: string): string | null => {
    if (!url) return null; // Опциональное поле
    try {
      new URL(url);
      return null;
    } catch {
      return 'Некорректный формат URL';
    }
  };

  const validateDate = (date: string | Date): string | null => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Некорректная дата';
    return null;
  };

  const validateFutureDate = (date: string | Date): string | null => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Некорректная дата';
    if (d <= new Date()) return 'Дата должна быть в будущем';
    return null;
  };

  return {
    validateEmail,
    validatePhone,
    validateRequired,
    validateLength,
    validateNumber,
    validateUrl,
    validateDate,
    validateFutureDate
  };
}