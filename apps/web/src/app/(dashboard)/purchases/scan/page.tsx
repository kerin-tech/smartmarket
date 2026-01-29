import { Metadata } from 'next';
import { TicketScanView } from '@/components/features/tickets/TicketScanView';

export const metadata: Metadata = {
  title: 'Escanear Ticket | SmartMarket',
  description: 'Registra tus compras en masa usando IA',
};

export default function ScanPage() {
  return <TicketScanView />;
}