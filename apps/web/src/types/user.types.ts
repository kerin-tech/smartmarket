// src/types/user.types.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}

// Siguiendo el estándar de tus otras respuestas de API
export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}