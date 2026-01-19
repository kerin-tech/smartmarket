// src/services/auth.service.ts

import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiError,
} from '@/types/auth.types';

// ============================================
// MOCK - Remover cuando el backend esté listo
// ============================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUser = {
  id: '1',
  name: '',
  email: '',
  createdAt: new Date().toISOString(),
};

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(1500);

    // Simular error de email duplicado
    if (data.email === 'existe@test.com') {
      throw {
        message: 'Este correo ya está registrado',
        statusCode: 409,
      } as ApiError;
    }

    return {
      user: { ...mockUser, name: data.name, email: data.email },
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay(1500);

    // Simular credenciales incorrectas
    // Para pruebas: cualquier contraseña que contenga "123" funciona
    if (!data.password.includes('123')) {
      throw {
        message: 'Credenciales incorrectas',
        statusCode: 401,
      } as ApiError;
    }

    return {
      user: { ...mockUser, name: 'Usuario Demo', email: data.email },
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  async logout(): Promise<void> {
    await delay(500);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  async verifySession(): Promise<AuthResponse | null> {
    return null;
  },
};
