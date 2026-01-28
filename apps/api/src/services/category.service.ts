// src/services/category.service.ts

interface CategoryRule {
  category: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Frutas',
    keywords: ['manzana', 'banano', 'platano', 'naranja', 'limon', 'mandarina', 'uva', 'fresa', 'mora', 'pera', 'mango', 'papaya', 'sandia', 'melon', 'piña', 'maracuya', 'guayaba', 'lulo', 'tomate de arbol', 'durazno', 'ciruela', 'kiwi', 'cereza', 'aguacate', 'coco'],
  },
  {
    category: 'Verduras',
    keywords: ['tomate', 'cebolla', 'papa', 'zanahoria', 'lechuga', 'espinaca', 'brocoli', 'coliflor', 'pepino', 'pimenton', 'ajo', 'apio', 'cilantro', 'perejil', 'acelga', 'repollo', 'calabacin', 'berenjena', 'habichuela', 'arveja', 'maiz', 'champiñon', 'champiñones', 'hongos', 'revuelto'],
  },
  {
    category: 'Carnes',
    keywords: ['pollo', 'carne', 'res', 'cerdo', 'pescado', 'salmon', 'atun', 'tilapia', 'trucha', 'bagre', 'mojarra', 'camaron', 'jamon', 'tocineta', 'tocino', 'salchicha', 'chorizo', 'mortadela', 'pepperoni', 'filete', 'pechuga', 'muslo', 'ala', 'costilla', 'chuleta', 'molida', 'bassa'],
  },
  {
    category: 'Lacteos',
    keywords: ['leche', 'queso', 'yogurt', 'yogur', 'crema', 'mantequilla', 'margarina', 'kumis', 'avena', 'cuajada', 'requesón', 'ricotta', 'mozzarella', 'parmesano'],
  },
  {
    category: 'Panaderia',
    keywords: ['pan', 'arepa', 'tostada', 'galleta', 'bizcocho', 'ponque', 'torta', 'croissant', 'dona', 'muffin', 'sandwich', 'mogolla', 'almojabana', 'pandebono', 'buñuelo'],
  },
  {
    category: 'Granos',
    keywords: ['arroz', 'frijol', 'lenteja', 'garbanzo', 'pasta', 'spaghetti', 'fusilli', 'macarron', 'elbow', 'fideo', 'quinoa', 'avena', 'cereal', 'granola', 'harina', 'azucar'],
  },
  {
    category: 'Bebidas',
    keywords: ['agua', 'jugo', 'gaseosa', 'refresco', 'cerveza', 'vino', 'whisky', 'ron', 'aguardiente', 'cafe', 'te', 'chocolate', 'malteada', 'energizante', 'coronita', 'cola', 'sprite', 'fanta'],
  },
  {
    category: 'Snacks',
    keywords: ['papa frita', 'chips', 'nachos', 'palomitas', 'mani', 'nuez', 'almendra', 'chocolate', 'dulce', 'gomita', 'chicle', 'caramelo', 'galleta', 'brownie'],
  },
  {
    category: 'Limpieza',
    keywords: ['jabon', 'detergente', 'suavizante', 'blanqueador', 'desinfectante', 'cloro', 'limpiador', 'limpiavidrios', 'escoba', 'trapero', 'esponja', 'lavaloza', 'lavaplatos', 'axion', 'fab', 'ariel', 'ace', 'bolsa', 'papel', 'servilleta', 'toalla'],
  },
  {
    category: 'Higiene',
    keywords: ['shampoo', 'acondicionador', 'jabon', 'crema dental', 'cepillo', 'desodorante', 'perfume', 'colonia', 'papel higienico', 'toalla sanitaria', 'pañal', 'afeitadora', 'crema', 'locion'],
  },
  {
    category: 'Condimentos',
    keywords: ['sal', 'pimienta', 'oregano', 'comino', 'ajo', 'cebolla', 'salsa', 'mayonesa', 'mostaza', 'ketchup', 'vinagre', 'aceite', 'sazonador', 'caldo', 'maggi', 'knorr', 'adobo'],
  },
  {
    category: 'Congelados',
    keywords: ['congelado', 'helado', 'hielo', 'pizza', 'nugget', 'papa francesa', 'empanada', 'croqueta'],
  },
  {
    category: 'Enlatados',
    keywords: ['atun', 'sardina', 'salchicha', 'frijol', 'maiz', 'arveja', 'durazno', 'piña', 'conserva', 'lata'],
  },
];

/**
 * Normaliza texto para comparación
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Detecta la categoría de un producto basándose en su nombre
 */
export function detectCategory(productName: string): string {
  const normalized = normalizeText(productName);
  
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        return rule.category;
      }
    }
  }
  
  return 'Otros';
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getCategories(): string[] {
  return [...new Set(CATEGORY_RULES.map((r) => r.category)), 'Otros'];
}