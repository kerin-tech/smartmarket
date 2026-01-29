// src/parsers/index.ts

// Tipos
export * from './types';

// Registry (singleton)
export { parserRegistry } from './registry';

// Base class para crear nuevos parsers
export { BaseParser } from './base.parser';

// Parsers disponibles
import { GenericParser } from './generic.parser';
import { D1Parser } from './d1.parser';
import { ExitoParser } from './exito.parser';
import { OlimpicaParser } from './olimpica.parser';
import { DollarcityParser } from './dollarcity.parser';
import { AraParser } from './ara.parser';
import { GiganteParser } from './gigante.parser';

import { parserRegistry } from './registry';

/**
 * Inicializa y registra todos los parsers disponibles
 * Llamar una vez al iniciar la aplicación
 */
export function initializeParsers(): void {
  console.log('🔧 Inicializando parsers de tickets...');
  
  // Parsers específicos (orden no importa, se elige por confianza)
  parserRegistry.register(new D1Parser());
  parserRegistry.register(new ExitoParser());
  parserRegistry.register(new OlimpicaParser());
  parserRegistry.register(new DollarcityParser());
  parserRegistry.register(new AraParser());
  parserRegistry.register(new GiganteParser());
  
  // Siempre registrar el genérico al final (fallback)
  parserRegistry.register(new GenericParser());
  
  console.log(`✓ ${parserRegistry.count()} parser(s) registrado(s)`);
}

/**
 * Helper para parsear un ticket con detección automática
 */
export function parseTicket(ocrText: string, forceStore?: string) {
  return parserRegistry.parse(ocrText, forceStore);
}

/**
 * Helper para detectar tienda
 */
export function detectStore(ocrText: string) {
  return parserRegistry.detectWithConfirmation(ocrText);
}

/**
 * Helper para listar tiendas soportadas
 */
export function getSupportedStores() {
  return parserRegistry.getSupportedStores();
}