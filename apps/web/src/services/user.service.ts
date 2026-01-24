// src/services/user.service.ts
import api from './api';
import { UserProfileResponse, UserProfile } from '@/types/user.types';

export const userService = {
  /**
   * Obtiene el perfil del usuario actual
   * URL final: http://localhost:5000/api/v1/development/users/me
   */
  async getProfile(): Promise<UserProfile> {
    // IMPORTANTE: Al usar 'api.get', la URL se construye automáticamente
    // usando la BASE_URL que tengas en tu config.
    const response = await api.get<UserProfileResponse>('/users/me');
    
    // Retornamos solo la data para que el componente sea más limpio
    return response.data.data;
  }
};