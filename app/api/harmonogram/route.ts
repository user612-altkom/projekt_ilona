import { NextResponse } from 'next/server';
import { policzHarmonogram, type Harmonogram, type Nadplata, type ParametryKredytu } from '../../../src/domena/harmonogram';

// Route handler jest cienki: parsuje parametry z query string, woła domenę, zwraca JSON.
// Żadnych obliczeń finansowych w tym pliku. Przeliczenie jednostek wejścia i wyjścia
// (grosze na złote, punkty procentowe na ułamek) to część parsowania kontraktu API, nie logika.

const PRZYKLAD =
  '/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01';

function parsujNadplaty(szukane: URLSearchParams): Nadplata[] | string {
  const surowe = szukane.get('nadplaty');
  if (!surowe) return [];
  let dane: unknown;
  try {
    dane = JSON.parse(surowe);
  } catch {
    return 'nadplaty: niepoprawny JSON';
  }
  if (!Array.isArray(dane)) return 'nadplaty: oczekiwano tablicy obiektów';

  const nadplaty: Nadplata[] = [];
  for (const wpis of dane) {
    const tryb = (wpis as Record<string, unknown> | null)?.tryb;
    if (
      typeof wpis !== 'object' ||
      wpis === null ||
      typeof (wpis as Record<string, unknown>).miesiac !== 'number' ||
      typeof (wpis as Record<string, unknown>).kwota !== 'number' ||
      (tryb !== undefined && tryb !== 'obniz-rate' && tryb !== 'skroc-okres')
    ) {
      return 'nadplaty: każdy wpis to { miesiac: liczba, kwota: liczba, tryb?: "obniz-rate" | "skroc-okres" (domyślnie "skroc-okres") }';
    }
    const { miesiac, kwota } = wpis as { miesiac: number; kwota: number };
    nadplaty.push({ miesiac, kwotaGr: Math.round(kwota * 100), tryb: tryb as 'obniz-rate' | 'skroc-okres' | undefined });
  }
  return nadplaty;
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwota = Number(szukane.get('kwota'));
  const liczbaRat = Number(szukane.get('liczbaRat'));
  const marza = Number(szukane.get('marza'));
  const wskaznik = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznik !== 'POLSTR_1M' && wskaznik !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';

  const nadplaty = parsujNadplaty(szukane);
  if (typeof nadplaty === 'string') return nadplaty;

  return {
    kwotaGr: Math.round(kwota * 100),
    liczbaRat,
    marza: marza / 100,
    wskaznik,
    typRat,
    pierwszaRata,
    nadplaty,
  };
}

/** Konwertuje wyjście domeny (grosze) na kontrakt API (złote, 2 miejsca) — samo rzutowanie jednostki. */
function doJson(harmonogram: Harmonogram) {
  const naZlote = (gr: number) => Math.round(gr) / 100;
  return {
    raty: harmonogram.raty.map((rata) => ({
      numer: rata.numer,
      data: rata.data,
      kapital: naZlote(rata.kapitalGr),
      odsetki: naZlote(rata.odsetkiGr),
      rata: naZlote(rata.rataGr),
      saldo: naZlote(rata.saldoGr),
    })),
    sumaOdsetek: naZlote(harmonogram.sumaOdsetekGr),
  };
}

export function GET(request: Request) {
  const parametry = parsujParametry(new URL(request.url).searchParams);
  if (typeof parametry === 'string') {
    return NextResponse.json({ blad: parametry, przyklad: PRZYKLAD }, { status: 400 });
  }

  try {
    const harmonogram = policzHarmonogram(parametry);
    return NextResponse.json(doJson(harmonogram));
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    if (komunikat.startsWith('nie zaimplementowano')) {
      return NextResponse.json({ blad: komunikat, parametry, przyklad: PRZYKLAD }, { status: 501 });
    }
    return NextResponse.json({ blad: komunikat }, { status: 400 });
  }
}
