import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  stopaNaDzien: () => 0.0355,
}));

const { policzHarmonogram } = await import('../src/domena/harmonogram');

describe('policzHarmonogram — raty równe, stała stopa (liczba kontrolna z BRIEF.md)', () => {
  const parametry = {
    kwotaGr: 400_000_00,
    liczbaRat: 300,
    marza: 0.0211,
    typRat: 'rowne' as const,
    wskaznik: 'POLSTR_1M' as const,
    pierwszaRata: '2026-10-10',
    nadplaty: [],
  };

  it('rata (poza ostatnią) wynosi 2 494,72 zł z tolerancją ±0,05 zł', () => {
    const harmonogram = policzHarmonogram(parametry);
    const [pierwsza] = harmonogram.raty;
    expect(pierwsza).toBeDefined();
    expect(pierwsza!.rataGr).toBeGreaterThanOrEqual(249_467);
    expect(pierwsza!.rataGr).toBeLessThanOrEqual(249_477);
  });

  it('ostatnia rata wyrównuje i wynosi ok. 2 492,53 zł', () => {
    const harmonogram = policzHarmonogram(parametry);
    const ostatnia = harmonogram.raty.at(-1);
    expect(ostatnia).toBeDefined();
    expect(ostatnia!.rataGr).toBeGreaterThanOrEqual(249_248);
    expect(ostatnia!.rataGr).toBeLessThanOrEqual(249_258);
    expect(ostatnia!.saldoGr).toBe(0);
  });

  it('suma części kapitałowych wszystkich rat równa się kwocie kredytu co do grosza', () => {
    const harmonogram = policzHarmonogram(parametry);
    const sumaKapitalu = harmonogram.raty.reduce((suma, rata) => suma + rata.kapitalGr, 0);
    expect(sumaKapitalu).toBe(parametry.kwotaGr);
  });
});

describe('policzHarmonogram — raty malejące', () => {
  const parametry = {
    kwotaGr: 400_000_00,
    liczbaRat: 300,
    marza: 0.0211,
    typRat: 'malejace' as const,
    wskaznik: 'POLSTR_1M' as const,
    pierwszaRata: '2026-10-10',
    nadplaty: [],
  };

  it('część kapitałowa jest identyczna w każdej racie poza ewentualnym wyrównaniem na końcu', () => {
    const harmonogram = policzHarmonogram(parametry);
    const [pierwsza] = harmonogram.raty;
    expect(pierwsza).toBeDefined();
    for (const rata of harmonogram.raty.slice(0, -1)) {
      expect(rata.kapitalGr).toBe(pierwsza!.kapitalGr);
    }
  });

  it('rata maleje z okresu na okres wraz ze spadkiem salda', () => {
    const harmonogram = policzHarmonogram(parametry);
    for (let i = 1; i < harmonogram.raty.length; i++) {
      expect(harmonogram.raty[i]!.rataGr).toBeLessThanOrEqual(harmonogram.raty[i - 1]!.rataGr);
    }
  });

  it('suma części kapitałowych wszystkich rat równa się kwocie kredytu co do grosza', () => {
    const harmonogram = policzHarmonogram(parametry);
    const sumaKapitalu = harmonogram.raty.reduce((suma, rata) => suma + rata.kapitalGr, 0);
    expect(sumaKapitalu).toBe(parametry.kwotaGr);
  });
});
