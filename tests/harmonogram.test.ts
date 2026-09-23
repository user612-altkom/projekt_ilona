import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stopaNaDzien } from '../src/dane/wskazniki';

vi.mock('../src/dane/wskazniki', () => ({
  stopaNaDzien: vi.fn(),
}));

const { policzHarmonogram } = await import('../src/domena/harmonogram');

describe('policzHarmonogram — raty równe, stała stopa (liczba kontrolna z BRIEF.md)', () => {
  beforeEach(() => {
    vi.mocked(stopaNaDzien).mockReturnValue(0.0355);
  });

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
  beforeEach(() => {
    vi.mocked(stopaNaDzien).mockReturnValue(0.0355);
  });

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

describe('policzHarmonogram — zmienny wskaźnik w trakcie spłaty (US3)', () => {
  const dataZmiany = '2027-01-10';

  beforeEach(() => {
    vi.mocked(stopaNaDzien).mockImplementation((_wskaznik, data: string) => (data < dataZmiany ? 0.03 : 0.05));
  });

  it('raty równe: rata zmienia się od okresu, w którym wskaźnik się zmienił', () => {
    const harmonogram = policzHarmonogram({
      kwotaGr: 100_000_00,
      liczbaRat: 12,
      marza: 0.02,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-10',
      nadplaty: [],
    });
    const indeksZmiany = harmonogram.raty.findIndex((rata) => rata.data >= dataZmiany);
    expect(indeksZmiany).toBeGreaterThan(0);
    expect(harmonogram.raty[0]!.rataGr).toBe(harmonogram.raty[indeksZmiany - 1]!.rataGr);
    expect(harmonogram.raty[indeksZmiany]!.rataGr).not.toBe(harmonogram.raty[indeksZmiany - 1]!.rataGr);
  });

  it('raty malejące: część kapitałowa zostaje stała, zmienia się tylko część odsetkowa/rata', () => {
    const harmonogram = policzHarmonogram({
      kwotaGr: 100_000_00,
      liczbaRat: 12,
      marza: 0.02,
      typRat: 'malejace',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-10',
      nadplaty: [],
    });
    const kapitalPierwszej = harmonogram.raty[0]!.kapitalGr;
    for (const rata of harmonogram.raty.slice(0, -1)) {
      expect(rata.kapitalGr).toBe(kapitalPierwszej);
    }
    const indeksZmiany = harmonogram.raty.findIndex((rata) => rata.data >= dataZmiany);
    expect(harmonogram.raty[indeksZmiany]!.odsetkiGr).not.toBe(harmonogram.raty[indeksZmiany - 1]!.odsetkiGr);
  });
});

describe('policzHarmonogram — nadpłaty (US4)', () => {
  beforeEach(() => {
    vi.mocked(stopaNaDzien).mockReturnValue(0.0355);
  });

  const bazowe = {
    kwotaGr: 100_000_00,
    liczbaRat: 12,
    marza: 0.02,
    wskaznik: 'POLSTR_1M' as const,
    pierwszaRata: '2026-10-10',
  };

  it('tryb „obniż ratę”: saldo maleje o nadpłatę, rata od kolejnego okresu jest przeliczona, liczba rat bez zmian', () => {
    const bezNadplaty = policzHarmonogram({ ...bazowe, typRat: 'rowne', nadplaty: [] });
    const zNadplata = policzHarmonogram({
      ...bazowe,
      typRat: 'rowne',
      nadplaty: [{ miesiac: 3, kwotaGr: 10_000_00, tryb: 'obniz-rate' }],
    });

    expect(zNadplata.raty).toHaveLength(bezNadplaty.raty.length);
    expect(zNadplata.raty[2]!.nadplataGr).toBe(10_000_00);
    expect(zNadplata.raty[2]!.saldoGr).toBe(bezNadplaty.raty[2]!.saldoGr - 10_000_00);
    expect(zNadplata.raty[3]!.rataGr).toBeLessThan(bezNadplaty.raty[3]!.rataGr);

    const sumaKapitaluINadplat = zNadplata.raty.reduce((suma, rata) => suma + rata.kapitalGr + rata.nadplataGr, 0);
    expect(sumaKapitaluINadplat).toBe(bazowe.kwotaGr);
  });

  it('tryb „skróć okres”: saldo maleje o nadpłatę, rata bez zmian, liczba pozostałych rat maleje', () => {
    const bezNadplaty = policzHarmonogram({ ...bazowe, typRat: 'rowne', nadplaty: [] });
    const zNadplata = policzHarmonogram({
      ...bazowe,
      typRat: 'rowne',
      nadplaty: [{ miesiac: 3, kwotaGr: 10_000_00, tryb: 'skroc-okres' }],
    });

    expect(zNadplata.raty.length).toBeLessThan(bezNadplaty.raty.length);
    expect(zNadplata.raty[2]!.nadplataGr).toBe(10_000_00);
    expect(zNadplata.raty[3]!.rataGr).toBe(bezNadplaty.raty[3]!.rataGr);

    const sumaKapitaluINadplat = zNadplata.raty.reduce((suma, rata) => suma + rata.kapitalGr + rata.nadplataGr, 0);
    expect(sumaKapitaluINadplat).toBe(bazowe.kwotaGr);
  });
});


