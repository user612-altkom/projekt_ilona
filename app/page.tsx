'use client';

// Ekran kalkulatora harmonogramu spłat. Formularz + fetch('/api/harmonogram?...') + eksport CSV.
// Wygląd tymczasowy (kolorowy szkic), do zastąpienia gotowym komponentem z Claude Design.

import { useState } from 'react';

type TypRat = 'rowne' | 'malejace';
type Wskaznik = 'POLSTR_1M' | 'WIBOR_3M';
type TrybNadplaty = 'obniz-rate' | 'skroc-okres';

interface Nadplata {
  miesiac: string;
  kwota: string;
  tryb: TrybNadplaty;
}

interface Rata {
  numer: number;
  data: string;
  kapital: number;
  odsetki: number;
  rata: number;
  saldo: number;
}

interface Harmonogram {
  raty: Rata[];
  sumaOdsetek: number;
}

const formatZl = (kwota: number) =>
  kwota.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Strona() {
  const [kwota, setKwota] = useState('400000');
  const [liczbaRat, setLiczbaRat] = useState('300');
  const [pierwszaRata, setPierwszaRata] = useState('2026-10-10');
  const [marza, setMarza] = useState('2.11');
  const [wskaznik, setWskaznik] = useState<Wskaznik>('POLSTR_1M');
  const [typRat, setTypRat] = useState<TypRat>('rowne');
  const [nadplaty, setNadplaty] = useState<Nadplata[]>([]);

  const [wynik, setWynik] = useState<Harmonogram | null>(null);
  const [blad, setBlad] = useState<string | null>(null);
  const [liczenie, setLiczenie] = useState(false);

  function dodajNadplate() {
    setNadplaty((poprzednie) => [...poprzednie, { miesiac: '1', kwota: '', tryb: 'obniz-rate' }]);
  }

  function usunNadplate(indeks: number) {
    setNadplaty((poprzednie) => poprzednie.filter((_, i) => i !== indeks));
  }

  function zmienNadplate(indeks: number, pole: keyof Nadplata, wartosc: string) {
    setNadplaty((poprzednie) =>
      poprzednie.map((n, i) => (i === indeks ? { ...n, [pole]: wartosc } : n)),
    );
  }

  function zbudujQueryString(): string {
    const parametry = new URLSearchParams({
      kwota,
      liczbaRat,
      pierwszaRata,
      marza,
      wskaznik,
      typRat,
    });
    const nadplatyPoprawne = nadplaty
      .filter((n) => n.kwota.trim() !== '')
      .map((n) => ({ miesiac: Number(n.miesiac), kwota: Number(n.kwota), tryb: n.tryb }));
    if (nadplatyPoprawne.length > 0) {
      parametry.set('nadplaty', JSON.stringify(nadplatyPoprawne));
    }
    return parametry.toString();
  }

  async function policz() {
    setLiczenie(true);
    setBlad(null);
    setWynik(null);
    try {
      const odpowiedz = await fetch(`/api/harmonogram?${zbudujQueryString()}`);
      const dane = await odpowiedz.json();
      if (!odpowiedz.ok) {
        setBlad(typeof dane.blad === 'string' ? dane.blad : 'Nie udało się policzyć harmonogramu.');
        return;
      }
      setWynik(dane as Harmonogram);
    } catch {
      setBlad('Błąd połączenia z serwerem.');
    } finally {
      setLiczenie(false);
    }
  }

  function eksportujCsv() {
    if (!wynik) return;
    const naglowek = 'numer;data;kapital;odsetki;rata;saldo';
    const wiersze = wynik.raty.map(
      (r) => `${r.numer};${r.data};${formatZl(r.kapital)};${formatZl(r.odsetki)};${formatZl(r.rata)};${formatZl(r.saldo)}`,
    );
    const csv = [naglowek, ...wiersze].join('\n');
    const blobCsv = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blobCsv);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'harmonogram.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const pierwsza = wynik?.raty[0];
  const ostatnia = wynik?.raty.at(-1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-fuchsia-50 to-amber-50 p-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <header className="rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 p-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold uppercase">Harmonogram spłat kredytu</h1>
            <p className="mt-1 text-indigo-50">Spłata kredytu hipotecznego ze zmiennym oprocentowaniem (POLSTR / WIBOR)</p>
          </header>

          <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-600">Kalkulator</p>

          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-indigo-100">
            <h2 className="mb-4 text-xl font-semibold text-indigo-700">Parametry kredytu</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Kwota kredytu (zł)
              <input
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={kwota}
                onChange={(e) => setKwota(e.target.value)}
                inputMode="decimal"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Liczba rat
              <input
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={liczbaRat}
                onChange={(e) => setLiczbaRat(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Data pierwszej raty
              <input
                type="date"
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={pierwszaRata}
                onChange={(e) => setPierwszaRata(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Marża (pp)
              <input
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={marza}
                onChange={(e) => setMarza(e.target.value)}
                inputMode="decimal"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Wskaźnik
              <select
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={wskaznik}
                onChange={(e) => setWskaznik(e.target.value as Wskaznik)}
              >
                <option value="POLSTR_1M">POLSTR 1M</option>
                <option value="WIBOR_3M">WIBOR 3M</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              Typ rat
              <select
                className="rounded-lg border border-indigo-200 p-2 focus:border-indigo-500 focus:outline-none"
                value={typRat}
                onChange={(e) => setTypRat(e.target.value as TypRat)}
              >
                <option value="rowne">Równe</option>
                <option value="malejace">Malejące</option>
              </select>
            </label>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-fuchsia-700">Nadpłaty</h3>
              <button
                type="button"
                onClick={dodajNadplate}
                className="rounded-lg bg-fuchsia-600 px-3 py-1 text-sm font-medium text-white hover:bg-fuchsia-700"
              >
                + Dodaj nadpłatę
              </button>
            </div>
            {nadplaty.length === 0 && <p className="text-sm text-neutral-500">Brak nadpłat.</p>}
            <div className="flex flex-col gap-2">
              {nadplaty.map((n, indeks) => (
                <div key={indeks} className="flex flex-wrap items-center gap-2 rounded-lg bg-fuchsia-50 p-2">
                  <label className="flex items-center gap-1 text-sm">
                    Miesiąc
                    <input
                      className="w-20 rounded border border-fuchsia-200 p-1"
                      value={n.miesiac}
                      onChange={(e) => zmienNadplate(indeks, 'miesiac', e.target.value)}
                      inputMode="numeric"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    Kwota (zł)
                    <input
                      className="w-28 rounded border border-fuchsia-200 p-1"
                      value={n.kwota}
                      onChange={(e) => zmienNadplate(indeks, 'kwota', e.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    Tryb
                    <select
                      className="rounded border border-fuchsia-200 p-1"
                      value={n.tryb}
                      onChange={(e) => zmienNadplate(indeks, 'tryb', e.target.value)}
                    >
                      <option value="obniz-rate">Obniż ratę</option>
                      <option value="skroc-okres">Skróć okres</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => usunNadplate(indeks)}
                    className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    Usuń
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={policz}
            disabled={liczenie}
            className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            {liczenie ? 'Liczę…' : 'Policz'}
          </button>

          {blad && (
            <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">{blad}</p>
          )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
        {wynik && pierwsza && ostatnia ? (
          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-indigo-100">
            <h2 className="mb-4 text-xl font-semibold text-indigo-700">Wynik</h2>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-indigo-50 p-4 text-center">
                <p className="text-sm text-indigo-600">Pierwsza rata</p>
                <p className="text-2xl font-bold text-indigo-800">{formatZl(pierwsza.rata)} zł</p>
              </div>
              <div className="rounded-xl bg-fuchsia-50 p-4 text-center">
                <p className="text-sm text-fuchsia-600">Ostatnia rata</p>
                <p className="text-2xl font-bold text-fuchsia-800">{formatZl(ostatnia.rata)} zł</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-sm text-amber-600">Suma odsetek</p>
                <p className="text-2xl font-bold text-amber-800">{formatZl(wynik.sumaOdsetek)} zł</p>
              </div>
            </div>

            <button
              type="button"
              onClick={eksportujCsv}
              className="mb-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Eksport CSV
            </button>

            <div className="max-h-96 overflow-auto rounded-lg ring-1 ring-neutral-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-indigo-600 text-white">
                  <tr>
                    <th className="p-2 text-left">Nr</th>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-right">Kapitał</th>
                    <th className="p-2 text-right">Odsetki</th>
                    <th className="p-2 text-right">Rata</th>
                    <th className="p-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {wynik.raty.map((r) => (
                    <tr key={r.numer} className="odd:bg-white even:bg-indigo-50/50">
                      <td className="p-2">{r.numer}</td>
                      <td className="p-2">{r.data}</td>
                      <td className="p-2 text-right">{formatZl(r.kapital)}</td>
                      <td className="p-2 text-right">{formatZl(r.odsetki)}</td>
                      <td className="p-2 text-right font-medium">{formatZl(r.rata)}</td>
                      <td className="p-2 text-right">{formatZl(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-white/60 p-6 text-center text-neutral-500">
            <p className="text-lg font-medium">Wynik pojawi się tutaj</p>
            <p className="text-sm">Wypełnij formularz po lewej i kliknij „Policz”.</p>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}

