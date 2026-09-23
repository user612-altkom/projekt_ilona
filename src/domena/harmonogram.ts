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

function policzHarmonogramDlaTypu(parametry: ParametryKredytu): Harmonogram {
  const { kwotaGr, liczbaRat, marza, wskaznik, pierwszaRata, typRat, nadplaty } = parametry;

  const nadplatyPoMiesiacu = new Map<number, Nadplata[]>();
  for (const nadplata of nadplaty) {
    const lista = nadplatyPoMiesiacu.get(nadplata.miesiac) ?? [];
    lista.push(nadplata);
    nadplatyPoMiesiacu.set(nadplata.miesiac, lista);
  }

  const raty: Rata[] = [];
  let saldoGr = kwotaGr;
  let sumaOdsetekGr = 0;
  let stopaMiesiecznaAktualna: number | null = null;
  let rataGrStala = 0;
  let kapitalStalyGr = typRat === 'malejace' ? Math.floor(kwotaGr / liczbaRat) : 0;

  for (let numer = 1; numer <= liczbaRat && saldoGr > 0; numer++) {
    const data = dodajMiesiace(pierwszaRata, numer - 1);
    const stopaRoczna = stopaNaDzien(wskaznik, data) + marza;
    const stopaMiesieczna = stopaRoczna / 12;
    const pozostaleRaty = liczbaRat - numer + 1;

    if (typRat === 'rowne' && (stopaMiesiecznaAktualna === null || stopaMiesieczna !== stopaMiesiecznaAktualna)) {
      stopaMiesiecznaAktualna = stopaMiesieczna;
      rataGrStala =
        stopaMiesieczna === 0
          ? Math.round(saldoGr / pozostaleRaty)
          : Math.round((saldoGr * stopaMiesieczna) / (1 - Math.pow(1 + stopaMiesieczna, -pozostaleRaty)));
    }

    const odsetkiGr = Math.round(saldoGr * stopaMiesieczna);
    const ostatniaPlanowana = numer === liczbaRat;
    let kapitalGr = ostatniaPlanowana ? saldoGr : typRat === 'rowne' ? rataGrStala - odsetkiGr : kapitalStalyGr;
    if (kapitalGr > saldoGr) kapitalGr = saldoGr;

    const rataGr = kapitalGr + odsetkiGr;
    saldoGr -= kapitalGr;

    let nadplataGr = 0;
    for (const nadplata of nadplatyPoMiesiacu.get(numer) ?? []) {
      const kwotaNadplatyGr = Math.min(nadplata.kwotaGr, saldoGr);
      nadplataGr += kwotaNadplatyGr;
      saldoGr -= kwotaNadplatyGr;

      if (saldoGr > 0 && nadplata.tryb === 'obniz-rate') {
        const pozostaleRatyPoNadplacie = liczbaRat - numer;
        if (pozostaleRatyPoNadplacie > 0) {
          if (typRat === 'rowne') {
            rataGrStala =
              stopaMiesieczna === 0
                ? Math.round(saldoGr / pozostaleRatyPoNadplacie)
                : Math.round((saldoGr * stopaMiesieczna) / (1 - Math.pow(1 + stopaMiesieczna, -pozostaleRatyPoNadplacie)));
          } else {
            kapitalStalyGr = Math.floor(saldoGr / pozostaleRatyPoNadplacie);
          }
        }
      }
      // tryb 'skroc-okres': rataGrStala/kapitalStalyGr bez zmian — pętla zakończy się wcześniej,
      // gdy saldoGr osiągnie zero, zamiast dojść do numer === liczbaRat.
    }

    sumaOdsetekGr += odsetkiGr;
    raty.push({ numer, data, kapitalGr, odsetkiGr, nadplataGr, rataGr, saldoGr });
  }

  return { raty, sumaOdsetekGr };
}

export function policzHarmonogram(parametry: ParametryKredytu): Harmonogram {
  if (parametry.typRat === 'rowne' || parametry.typRat === 'malejace') {
    return policzHarmonogramDlaTypu(parametry);
  }
  throw new Error(`nie zaimplementowano: policzHarmonogram (${parametry.liczbaRat} rat, ${parametry.typRat})`);
}

