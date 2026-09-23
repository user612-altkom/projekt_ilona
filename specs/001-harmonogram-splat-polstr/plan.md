# Implementation Plan: Harmonogram spłat kredytu na POLSTR/WIBOR

**Branch**: `001-harmonogram-splat-polstr` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-harmonogram-splat-polstr/spec.md`

## Summary

- Kalkulator harmonogramu spłat: raty równe/malejące, POLSTR 1M / WIBOR 3M, nadpłaty.
- Cała logika w czystych funkcjach domeny, route handler tylko parsuje i zwraca JSON.
- Ekran to gotowy komponent React (Claude Design), podpięty w ostatniej fazie.

## Technical Context

- **Język/wersja**: TypeScript (strict), Next.js App Router
- **Zależności**: bez nowych — Next.js, Tailwind, vitest już w `package.json`
- **Storage**: brak bazy, dane wskaźników statyczne w `dane/*.json`
- **Testy**: vitest, tylko `src/domena/` i `src/dane/`, w katalogu `tests/`
- **Platforma**: web (Vercel), przeglądarka dla ekranu
- **Typ projektu**: web-service + strona (Next.js, jeden projekt)
- **Cele wydajności**: liczenie harmonogramu 300 rat odpowiada od razu (bez odczuwalnego opóźnienia)
- **Ograniczenia**: kwoty w groszach, zaokrąglanie w jednym miejscu, bez `any`/`@ts-ignore`
- **Skala**: pojedyncze wyliczenie na żądanie, brak wielu użytkowników jednocześnie

## Constitution Check

*GATE: zgodność z `.specify/memory/constitution.md`*

- ✅ Zasada I (App Router, podział odpowiedzialności) — route handler cienki, ekran osobno
- ✅ Zasada II (czyste funkcje domeny) — cała logika w `src/domena/harmonogram.ts`
- ✅ Zasada III (TypeScript strict) — bez nowych typów `any`
- ✅ Zasada IV (TDD) — testy w `tests/` przed implementacją każdej historii
- ✅ Zasada V (precyzja finansowa) — grosze, zaokrąglanie w jednym miejscu (patrz research.md)
- ✅ Zasada VI (minimalizm zależności) — brak nowych paczek
- Brak naruszeń — sekcja Complexity Tracking pusta.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/domena/harmonogram.ts     # obliczenia: raty równe/malejące, wskaźnik, nadpłaty
src/dane/wskazniki.ts         # odczyt serii POLSTR 1M / WIBOR 3M z dane/*.json
app/api/harmonogram/route.ts  # GET, parsuje query string, woła domenę, zwraca JSON
app/page.tsx                  # ekran (komponent z Claude Design), 'use client'
tests/                        # vitest: domena + dane, po jednym pliku na historię
```

**Structure Decision**: istniejący szkielet Next.js z szablonu, bez zmian struktury —
jeden projekt, logika w `src/domena/` i `src/dane/`, reszta jak wyżej.

## Complexity Tracking

Brak naruszeń konstytucji — tabela nie dotyczy.
