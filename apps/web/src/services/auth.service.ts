// src/services/auth.service.ts

import api from './api';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from '@/types/auth.types.ts';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authService = {
  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/register',
      data
    );

    // Guardar token en localStorage
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    // Mapear respuesta del backend al formato esperado
    return {
      user: {
        id: response.data.data.user.id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        createdAt: response.data.data.user.created_at,
      },
      token: response.data.data.token,
    };
  },

  /**
   * Iniciar sesión
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/login',
      data
    );

    // Guardar token en localStorage
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    // Mapear respuesta del backend al formato esperado
    return {
      user: {
        id: response.data.data.user.id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        createdAt: response.data.data.user.created_at,
      },
      token: response.data.data.token,
    };
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  /**
   * Verificar sesión actual (para futuro endpoint de /me)
   */
  async verifySession(): Promise<AuthResponse | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      return null;
    }

    // TODO: Implementar cuando exista endpoint GET /auth/me
    // try {
    //   const response = await api.get<ApiSuccessResponse<AuthResponse>>('/auth/me');
    //   return response.data.data;
    // } catch {
    //   localStorage.removeItem('token');
    //   return null;
    // }

    return null;
  },
};