// src/app/(dashboard)/profile/page.tsx

import { Metadata } from 'next';
import { ProfileView } from '@/components/features/user/ProfileView';

export const metadata: Metadata = {
  title: 'Mi Perfil | SmartMarket',
  description: 'Gestiona tu información personal y configuración de cuenta',
};

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8  min-h-screen">
      <ProfileView />
    </div>
  );
}