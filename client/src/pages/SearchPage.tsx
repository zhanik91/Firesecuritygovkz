import React from 'react';
import AdvancedSearch from '@/components/AdvancedSearch';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Поиск по сайту</h1>
        <p className="text-muted-foreground">
          Найдите нужную информацию среди документов, статей, видео и других материалов
        </p>
      </div>
      <AdvancedSearch />
    </div>
  );
}