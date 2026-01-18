export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  createdAt: string;
}

export type Category = 'Frutas' | 'Verduras' | 'Aseo' | 'Carnes' | 'Lácteos' | 'Otros';