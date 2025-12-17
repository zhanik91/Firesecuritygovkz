
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminRoleChecker from '@/components/AdminRoleChecker';

export default function AdminCheckPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Проверка прав администратора</h1>
        <AdminRoleChecker />
      </div>
      <Footer />
    </div>
  );
}
