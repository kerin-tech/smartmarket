'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';
import { Toast } from '@/components/ui';
import { ChevronLeft } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleCreate = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setToast({ show: true, message: 'Producto creado correctamente' });
    
    setTimeout(() => {
      router.push('/products');
    }, 1500);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Breadcrumb / Botón Volver (Reemplaza al header local) */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors font-medium"
      >
        <ChevronLeft size={20} />
        Volver a productos
      </button>

      <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Nuevo producto</h1>
          <p className="text-gray-500">Completa la información para registrar el producto en tu lista.</p>
        </div>

        <ProductForm 
          onSubmit={handleCreate}
          isLoading={loading}
          onCancel={() => router.push('/products')}
        />
      </div>

      {toast.show && <Toast message={toast.message} type="success" onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}