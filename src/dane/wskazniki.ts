import polstr1m from '../../dane/polstr-1m.json';
import wibor3m from '../../dane/wibor-3m.json';
import type { ParametryKredytu } from '../domena/harmonogram';

/** Jeden wpis serii wskaźnika: wartość obowiązuje od dnia `od` do dnia przed kolejnym wpisem. */
export interface WpisSerii {
  /** Dzień, od którego obowiązuje wartość, YYYY-MM-DD. */
  od: string;
  /** Stopa jako ułamek, np. 0.0355 dla 3,55 %. */
  stopa: number;
}

const SERIE: Record<ParametryKredytu['wskaznik'], WpisSerii[]> = {
  POLSTR_1M: polstr1m.wartosci,
  WIBOR_3M: wibor3m.wartosci,
};

/** Seria wartości wskaźnika z dane/*.json, uporządkowana rosnąco po dacie. */
export function seriaWskaznika(wskaznik: ParametryKredytu['wskaznik']): WpisSerii[] {
  return SERIE[wskaznik];
}

/**
 * Wartość wskaźnika obowiązująca w dniu `data`: najnowszy wpis z `od <= data`.
 * Przed pierwszym wpisem serii zwraca pierwszą wartość, po ostatnim — ostatnią.
 */
export function stopaNaDzien(wskaznik: ParametryKredytu['wskaznik'], data: string): number {
  const seria = seriaWskaznika(wskaznik);
  let wybrany = seria[0];
  if (!wybrany) throw new Error(`brak danych serii dla wskaznika ${wskaznik}`);
  for (const wpis of seria) {
    if (wpis.od <= data) {
      wybrany = wpis;
    } else {
      break;
    }
  }
  return wybrany.stopa;
}
