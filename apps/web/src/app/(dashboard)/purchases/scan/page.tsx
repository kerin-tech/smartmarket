// src/app/(dashboard)/purchases/scan/page.tsx
import { TicketScanner } from '@/components/features/tickets/TicketScanner';

export const metadata = {
  title: 'Escanear Ticket | SmartMarket',
  description: 'Escanea y digitaliza tus tickets de compra',
};

export default function ScanTicketPage() {
  return (
     <div className="p-4 sm:p-6 lg:p-8">
      <TicketScanner />
     </div>
  )
};