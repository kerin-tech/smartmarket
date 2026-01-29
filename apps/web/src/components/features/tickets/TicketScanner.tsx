'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { purchaseService } from '@/services/purchase.service';
import { storeService } from '@/services/store.service';

import { TicketUploader } from './TicketUploader';
import { TicketReview } from './TicketReview';

import type { 
  ScanTicketResponse, 
  TicketReviewState, 
  EditableItem, 
  ConfirmTicketPayload,
  ProductMatch,
  StoreMatch,
  UserDecision
} from '@/types/ticket.types';
import type { Store } from '@/types/store.types';

type Step = 'upload' | 'scanning' | 'review' | 'confirming' | 'success';

export function TicketScanner() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [step, setStep] = useState<Step>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<TicketReviewState | null>(null);
  const [userStores, setUserStores] = useState<Store[]>([]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await storeService.getAll({ limit: 100 });
        setUserStores(response.stores);
      } catch (err) {
        console.error('Error loading stores:', err);
      }
    };
    loadStores();
  }, []);

  const handleImageSelect = useCallback(async (base64Image: string, preview: string) => {
    setImagePreview(preview);
    setStep('scanning');

    try {
      const response: ScanTicketResponse = await purchaseService.scanTicket(base64Image);
      
      const editableItems: EditableItem[] = response.items.map((item, idx) => ({
        ...item,
        tempId: `item-${idx}-${Date.now()}`,
        isEditing: false,
        isDeleted: false,
        selected_match: item.match?.match_level === 'high' ? item.match : null,
      }));

      setReviewData({
        ticket_id: response.ticket_id,
        detected_date: response.detected_date,
        detected_store: response.detected_store,
        store_matches: response.store_matches,
        selected_store: response.selected_store,
        items: editableItems,
        summary: response.summary,
      });

      setStep('review');
      
      const matchedCount = response.summary.matched_count;
      const suggestedCount = response.summary.suggested_count;
      const newCount = response.summary.new_products_count;
      
      success(
        `${response.items.length} productos detectados: ${matchedCount} coincidencias, ${suggestedCount} sugerencias, ${newCount} nuevos`
      );
    } catch (err: any) {
      showError(err.message || 'Error al escanear el ticket');
      setStep('upload');
      setImagePreview(null);
    }
  }, [success, showError]);

  const handleConfirm = useCallback(async () => {
    if (!reviewData) return;

    setStep('confirming');

    try {
      const activeItems = reviewData.items.filter(i => !i.isDeleted);
      
      const payload: ConfirmTicketPayload = {
        detected_date: reviewData.detected_date,
        detected_store: reviewData.detected_store,
        selected_store_id: reviewData.selected_store?.store_id || null,
        items: activeItems.map(item => ({
          detected_name: item.detected_name,
          detected_price: item.detected_price,
          detected_quantity: item.detected_quantity,
          detected_category: item.detected_category,
          detected_brand: item.detected_brand,
          discount_percentage: item.discount_percentage || 0,
          match: item.selected_match,
          user_decision: item.selected_match ? 'accept_match' : 'create_new',
        })),
      };

      await purchaseService.confirmBatch(payload);
      setStep('success');
      success('¡Compra registrada exitosamente!');
      
      setTimeout(() => router.push('/purchases'), 1500);
    } catch (err: any) {
      showError(err.message || 'Error al confirmar la compra');
      setStep('review');
    }
  }, [reviewData, router, success, showError]);

  const handleUpdateItem = useCallback((tempId: string, updates: Partial<EditableItem>) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item => 
          item.tempId === tempId ? { ...item, ...updates } : item
        ),
      };
    });
  }, []);

  const handleSelectMatch = useCallback((tempId: string, match: ProductMatch | null) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item => 
          item.tempId === tempId 
            ? { ...item, selected_match: match, user_decision: match ? 'accept_match' : 'create_new' as UserDecision }
            : item
        ),
      };
    });
  }, []);

  const handleSelectStore = useCallback((store: StoreMatch | null) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        selected_store: store,
      };
    });
  }, []);

  const handleSelectExistingStore = useCallback((storeId: string) => {
    const store = userStores.find(s => s.id === storeId);
    if (store) {
      setReviewData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          selected_store: {
            store_id: store.id,
            name: store.name,
            location: store.location || '',
            confidence: 1.0,
          },
        };
      });
    }
  }, [userStores]);

  const handleUpdateDate = useCallback((date: string) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        detected_date: date,
      };
    });
  }, []);

  const handleDeleteItem = useCallback((tempId: string) => {
    setReviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.tempId === tempId ? { ...item, isDeleted: true } : item
        ),
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload');
    setImagePreview(null);
    setReviewData(null);
  }, []);

  return (
    <div className="space-y-6 pb-32">
      {/* Header - Botón atrás arriba del título en móvil */}
      <div className="space-y-3">
        <Link href="/purchases" className="inline-flex">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a compras</span>
          </button>
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Escanear Ticket</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'upload' && 'Sube una foto de tu ticket de compra'}
            {step === 'scanning' && 'Analizando ticket...'}
            {step === 'review' && 'Revisa y confirma los productos detectados'}
            {step === 'confirming' && 'Guardando compra...'}
            {step === 'success' && '¡Listo!'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {(step === 'upload' || step === 'scanning') && (
          <TicketUploader
            onImageSelect={handleImageSelect}
            isLoading={step === 'scanning'}
            preview={imagePreview}
          />
        )}

        {(step === 'review' || step === 'confirming') && reviewData && (
          <TicketReview
            data={reviewData}
            imagePreview={imagePreview}
            userStores={userStores}
            onUpdateItem={handleUpdateItem}
            onSelectMatch={handleSelectMatch}
            onSelectStore={handleSelectStore}
            onSelectExistingStore={handleSelectExistingStore}
            onUpdateDate={handleUpdateDate}
            onDeleteItem={handleDeleteItem}
            onConfirm={handleConfirm}
            onCancel={handleReset}
            isLoading={step === 'confirming'}
          />
        )}

        {step === 'success' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">¡Compra registrada!</h2>
            <p className="text-muted-foreground">Redirigiendo a tus compras...</p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}