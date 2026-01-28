// src/services/matching.service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductMatch {
  productId: string;
  name: string;
  category: string;
  brand: string;
  similarity: number;
}

export interface MatchResult {
  detectedName: string;
  normalizedName: string;
  status: 'MATCHED' | 'PENDING' | 'NEW';
  match: ProductMatch | null;
  suggestions: ProductMatch[];
}

/**
 * Normaliza el nombre del producto para mejor matching
 * - Minúsculas
 * - Sin acentos
 * - Sin caracteres especiales
 * - Sin palabras comunes (unidades, etc.)
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, ' ')    // Solo letras, números y espacios
    .replace(/\s+/g, ' ')            // Múltiples espacios a uno
    .replace(/\b(kg|gr|g|ml|lt|l|un|und|x|paq|paquete|bolsa|bsa|cja|caja)\b/gi, '') // Quitar unidades
    .trim();
}

/**
 * Busca productos similares usando pg_trgm
 */
export async function findSimilarProducts(
  userId: string,
  productName: string,
  limit: number = 5,
  minSimilarity: number = 0.3
): Promise<ProductMatch[]> {
  const normalizedName = normalizeProductName(productName);

  if (!normalizedName || normalizedName.length < 2) {
    return [];
  }

  // Query usando pg_trgm para búsqueda por similitud
  const results = await prisma.$queryRaw<ProductMatch[]>`
    SELECT 
      id as "productId",
      name,
      category,
      brand,
      similarity(
        lower(public.immutable_unaccent(name)), 
        ${normalizedName}
      ) as similarity
    FROM products
    WHERE user_id = ${userId}::uuid
      AND similarity(
        lower(public.immutable_unaccent(name)), 
        ${normalizedName}
      ) > ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Busca el mejor match para un producto detectado
 */
export async function matchProduct(
  userId: string,
  detectedName: string
): Promise<MatchResult> {
  const normalizedName = normalizeProductName(detectedName);
  
  // Buscar productos similares
  const suggestions = await findSimilarProducts(userId, detectedName, 5, 0.3);

  // Determinar estado según similitud
  if (suggestions.length === 0) {
    return {
      detectedName,
      normalizedName,
      status: 'NEW',
      match: null,
      suggestions: [],
    };
  }

  const bestMatch = suggestions[0];

  // Si similitud > 80%, es un match automático
  if (bestMatch.similarity >= 0.8) {
    return {
      detectedName,
      normalizedName,
      status: 'MATCHED',
      match: bestMatch,
      suggestions: suggestions.slice(1), // Resto como sugerencias
    };
  }

  // Si similitud entre 30% y 80%, es una sugerencia pendiente
  return {
    detectedName,
    normalizedName,
    status: 'PENDING',
    match: null,
    suggestions,
  };
}

/**
 * Busca matches para múltiples productos
 */
export async function matchProducts(
  userId: string,
  detectedNames: string[]
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  for (const name of detectedNames) {
    const result = await matchProduct(userId, name);
    results.push(result);
  }

  return results;
}

/**
 * Búsqueda exacta por nombre (case insensitive)
 */
export async function findExactProduct(
  userId: string,
  productName: string
): Promise<ProductMatch | null> {
  const normalizedName = normalizeProductName(productName);

  const product = await prisma.product.findFirst({
    where: {
      userId,
      name: {
        equals: normalizedName,
        mode: 'insensitive',
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    similarity: 1.0,
  };
}