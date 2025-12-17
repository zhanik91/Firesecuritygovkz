import React from 'react';
import AdvancedMarketplace from '@/components/AdvancedMarketplace';

export default function EnhancedMarketplace() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Маркетплейс услуг</h1>
        <p className="text-muted-foreground">
          Найдите поставщиков услуг по пожарной безопасности или разместите свой заказ
        </p>
      </div>
      <AdvancedMarketplace />
    </div>
  );
}