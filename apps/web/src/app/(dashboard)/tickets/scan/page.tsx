// src/app/(dashboard)/tickets/scan/page.tsx

import { TicketUploader } from '@/components/features/tickets';

export default function ScanTicketPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Escanear ticket
        </h1>
        <p className="text-gray-600">
          Sube una foto de tu ticket y extraeremos los productos automáticamente
        </p>
      </div>

      {/* Uploader */}
      <TicketUploader />

      {/* Consejos */}
      <div className="mt-8 max-w-xl mx-auto">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Consejos para mejores resultados:
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Asegúrate de que el ticket esté bien iluminado
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Evita sombras y reflejos sobre el papel
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Captura todo el ticket en la imagen
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mantén el ticket lo más plano posible
          </li>
        </ul>
      </div>
    </div>
  );
}