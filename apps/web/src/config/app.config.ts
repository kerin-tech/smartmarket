// src/config/app.config.ts

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SmartMarket',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
} as const;

export const routes = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  
  // Dashboard
  home: '/',
  dashboard: '/',
  
  // Products
  products: '/products',
  newProduct: '/products/new',
  editProduct: (id: string) => `/products/${id}`,
  
  // Stores
  stores: '/stores',
  newStore: '/stores/new',
  editStore: (id: string) => `/stores/${id}`,
  
  // Purchases
  purchases: '/purchases',
  newPurchase: '/purchases/new',
  purchaseDetail: (id: string) => `/purchases/${id}`,
  editPurchase: (id: string) => `/purchases/${id}/edit`,
  
  // History
  history: '/history',
  compare: '/compare',
  
  // Profile
  profile: '/profile',
  
  // Legal
  terms: '/terms',
  privacy: '/privacy',
} as const;

export const categoryConfig = {
  fruits: { label: 'Frutas', emoji: '🍎', color: 'fruits' },
  vegetables: { label: 'Verduras', emoji: '🥬', color: 'vegetables' },
  grains: { label: 'Granos', emoji: '🍚', color: 'grains' },
  dairy: { label: 'Lácteos', emoji: '🥛', color: 'dairy' },
  meats: { label: 'Carnes', emoji: '🥩', color: 'meats' },
  beverages: { label: 'Bebidas', emoji: '🥤', color: 'beverages' },
  cleaning: { label: 'Limpieza', emoji: '🧹', color: 'cleaning' },
  other: { label: 'Otros', emoji: '📦', color: 'other' },
} as const;

export type CategoryKey = keyof typeof categoryConfig;
