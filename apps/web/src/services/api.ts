// src/services/api.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/auth.types';

// Crear instancia de Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: agregar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; errors?: Array<{ field: string; message: string }> }>) => {
    const apiError: ApiError = {
      message: 'Error de conexión con el servidor',
      statusCode: 500,
    };

    if (error.response) {
      // Error del servidor
      apiError.statusCode = error.response.status;
      apiError.message = error.response.data?.message || 'Error del servidor';
      apiError.errors = error.response.data?.errors;
    } else if (error.request) {
      // No hubo respuesta del servidor
      apiError.message = 'No se pudo conectar con el servidor';
      apiError.statusCode = 0;
    }

    return Promise.reject(apiError);
  }
);

export default api;