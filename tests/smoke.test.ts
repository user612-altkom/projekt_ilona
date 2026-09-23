import { describe, expect, it } from 'vitest';
import { seriaWskaznika, stopaNaDzien } from '../src/dane/wskazniki';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('dane wskaźników z katalogu dane/', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)('%s ma serię uporządkowaną rosnąco po dacie', (wskaznik) => {
    const seria = seriaWskaznika(wskaznik);
    expect(seria.length).toBeGreaterThan(0);
    for (const wpis of seria) {
      expect(wpis.od).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(wpis.stopa).toBeGreaterThan(0);
      expect(wpis.stopa).toBeLessThan(0.2);
    }
    const daty = seria.map((wpis) => wpis.od);
    expect([...daty].sort()).toEqual(daty);
  });
});

describe('stopaNaDzien (bez mocka, prawdziwe dane z dane/*.json)', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)(
    '%s: po ostatnim wpisie serii zwraca ostatnią znaną wartość',
    (wskaznik) => {
      const seria = seriaWskaznika(wskaznik);
      const ostatni = seria[seria.length - 1]!;
      expect(stopaNaDzien(wskaznik, '2099-01-01')).toBe(ostatni.stopa);
    },
  );

  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)(
    '%s: przed pierwszym wpisem serii zwraca najwcześniejszą dostępną wartość',
    (wskaznik) => {
      const seria = seriaWskaznika(wskaznik);
      const pierwszy = seria[0]!;
      expect(stopaNaDzien(wskaznik, '1999-01-01')).toBe(pierwszy.stopa);
    },
  );

  it('WIBOR_3M: zwraca wartość właściwą dla konkretnego wpisu (zmiana kwartalna)', () => {
    const seria = seriaWskaznika('WIBOR_3M');
    const wpis = seria[1]!;
    expect(stopaNaDzien('WIBOR_3M', wpis.od)).toBe(wpis.stopa);
  });
});

describe('domena', () => {
  it('policzHarmonogram liczy raty równe i zwraca pełny harmonogram', () => {
    const harmonogram = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
      nadplaty: [],
    });
    expect(harmonogram.raty).toHaveLength(300);
    const [pierwsza] = harmonogram.raty;
    expect(pierwsza).toBeDefined();
    expect(pierwsza!.saldoGr).toBeLessThan(400_000_00);
  });

  it('testy działają w strefie Europe/Warsaw', () => {
    expect(process.env.TZ).toBe('Europe/Warsaw');
  });
});
