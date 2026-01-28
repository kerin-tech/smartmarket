// src/parsers/parserRegistry.ts

import { ITicketParser } from './types';
import { AraParser } from './araParser';
import { D1Parser } from './d1Parser';
import { DollarcityParser } from './dollarCityParser';
import { GiganteHogarParser } from './giganteHogarParser';
import { GenericColombianParser } from './genericParser';

const REGISTERED_PARSERS: ITicketParser[] = [
  new GiganteHogarParser(), 
  new DollarcityParser(),   // Identifica por "Suramerica Comercial S.A.S"
  new AraParser(),          // Identifica por "Jeronimo Martins"
  new D1Parser(),           // Identifica por "Koba Colombia"
];

export function getParser(lines: string[], fullText: string): ITicketParser {
  // Buscamos coincidencia usando tanto el texto completo como líneas individuales
  const parser = REGISTERED_PARSERS.find(p => p.canHandle(lines, fullText));
  
  return parser || new GenericColombianParser();
}