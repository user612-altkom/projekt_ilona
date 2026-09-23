/**
 * Moduł domenowy kalkulatora harmonogramu spłat: czyste funkcje, bez React i bez I/O.
 */

import { stopaNaDzien } from '../dane/wskazniki';

/** Jedna nadpłata: miesiąc (numer raty), od którego obowiązuje, kwota w groszach i tryb. */
export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: 'obniz-rate' | 'skroc-okres';
}

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: 'rowne' | 'malejace';
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  nadplaty: Nadplata[];
}

/** Jeden wiersz harmonogramu, kwoty w groszach. */
export interface Rata {
  numer: number;
  data: string;
  kapitalGr: number;
  odsetkiGr: number;
  nadplataGr: number;
  rataGr: number;
  saldoGr: number;
}

export interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
}

/** Dodaje `n` miesięcy do daty ISO, przycinając do ostatniego dnia miesiąca gdy trzeba. */
function dodajMiesiace(dataIso: string, n: number): string {
  const czesci = dataIso.split('-').map(Number);
  const [rok, miesiac, dzien] = czesci as [number, number, number];
  const docelowa = new Date(Date.UTC(rok, miesiac - 1 + n, dzien));
  if (docelowa.getUTCDate() !== dzien) {
    docelowa.setUTCDate(0);
  }
  return docelowa.toISOString().slice(0, 10);
}

function policzRowne(parametry: ParametryKredytu): Harmonogram {
  const { kwotaGr, liczbaRat, marza, wskaznik, pierwszaRata } = parametry;
  const stopaRoczna = stopaNaDzien(wskaznik, pierwszaRata) + marza;
  const stopaMiesieczna = stopaRoczna / 12;

  const rataGrStala =
    stopaMiesieczna === 0
      ? Math.round(kwotaGr / liczbaRat)
      : Math.round((kwotaGr * stopaMiesieczna) / (1 - Math.pow(1 + stopaMiesieczna, -liczbaRat)));

  const raty: Rata[] = [];
  let saldoGr = kwotaGr;
  let sumaOdsetekGr = 0;

  for (let numer = 1; numer <= liczbaRat; numer++) {
    const data = dodajMiesiace(pierwszaRata, numer - 1);
    const odsetkiGr = Math.round(saldoGr * stopaMiesieczna);
    const ostatnia = numer === liczbaRat;
    const kapitalGr = ostatnia ? saldoGr : rataGrStala - odsetkiGr;
    const rataGr = kapitalGr + odsetkiGr;

    saldoGr -= kapitalGr;
    sumaOdsetekGr += odsetkiGr;

    raty.push({ numer, data, kapitalGr, odsetkiGr, nadplataGr: 0, rataGr, saldoGr });
  }

  return { raty, sumaOdsetekGr };
}

export function policzHarmonogram(parametry: ParametryKredytu): Harmonogram {
  if (parametry.typRat === 'rowne') {
    return policzRowne(parametry);
  }
  throw new Error(`nie zaimplementowano: policzHarmonogram (${parametry.liczbaRat} rat, ${parametry.typRat})`);
}
