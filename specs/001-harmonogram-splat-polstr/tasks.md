# Tasks: Harmonogram spłat kredytu na POLSTR/WIBOR

**Input**: Design documents z `specs/001-harmonogram-splat-polstr/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/harmonogram-api.md

**Tests**: wymagane przez konstytucję (zasada IV, TDD) — testy vitest w `tests/`, tylko domena i dane.

## Format: `[ID] [P?] [Story] Opis z dokładną ścieżką pliku`

## Phase 1: Setup

Brak zadań — szkielet Next.js, `package.json`, `tsconfig.json` i pliki `dane/*.json` już
istnieją z szablonu. Nic do zainicjowania.

---

## Phase 2: Foundational (blokuje wszystkie historie)

**Cel**: wspólne typy wejścia/wyjścia używane przez każdą historię.

- [x] T001 Rozszerzyć `ParametryKredytu` w `src/domena/harmonogram.ts` o pole `nadplaty: Nadplata[]`
      i zdefiniować typ `Nadplata { miesiac: number; kwotaGr: number; tryb: 'obniz-rate' | 'skroc-okres' }`
- [x] T002 Zdefiniować typy wyjściowe `Rata` i `Harmonogram` w `src/domena/harmonogram.ts`
      wg pól z `data-model.md` (numer, data, kapitalGr, odsetkiGr, rataGr, saldoGr, sumaOdsetekGr)
- [x] T003 [P] Dodać w `src/dane/wskazniki.ts` funkcję `stopaNaDzien(wskaznik, data)` zwracającą
      wpis serii obowiązujący na daną datę (najnowszy `od <= data`; ostatni wpis po końcu serii)

**Checkpoint**: typy i dostęp do serii wskaźnika gotowe — można zacząć User Story 1.

---

## Phase 3: User Story 1 - Harmonogram rat równych przy stałej stopie (Priority: P1) 🎯 MVP

**Cel**: policzenie harmonogramu rat równych dla jednej, stałej w czasie stopy, zgodnego z
liczbą kontrolną z BRIEF.md.

**Independent Test**: wywołanie `policzHarmonogram` z kwotą 400 000 zł, 300 ratami, stałą
stopą 5,66% rocznie zwraca ratę 2 494,72 zł (±0,05 zł) i ostatnią ratę 2 492,53 zł.

### Testy dla User Story 1 (napisać najpierw, upewnić się że nie przechodzą)

- [x] T004 [P] [US1] Test liczby kontrolnej (rata równa, stopa stała) w `tests/harmonogram.test.ts` —
      stałą wartość wskaźnika 0,0355 uzyskać przez zamockowanie `src/dane/wskazniki.ts`
      (`vi.mock`), nie przez nowy parametr wejściowy (patrz spec.md, sekcja Assumptions)
- [x] T005 [P] [US1] Test: suma części kapitałowych wszystkich rat równa kwocie kredytu co do
      grosza, w `tests/harmonogram.test.ts`

### Implementacja dla User Story 1

- [x] T006 [US1] Zaimplementować `policzHarmonogram` dla `typRat: 'rowne'` ze stałą stopą
      (bez zależności od `src/dane/wskazniki.ts`) w `src/domena/harmonogram.ts` — depends on T002
- [x] T006a [US1] Zastąpić `tests/smoke.test.ts` (oczekuje wyjątku „nie zaimplementowano”)
      testem zgodnym z działającą implementacją, żeby `npm test` przechodziło po T006 — depends on T006
- [x] T007 [US1] Podłączyć wynik w `app/api/harmonogram/route.ts`: zamiast 501 zwracać JSON z
      `policzHarmonogram(...)` — depends on T006

**Checkpoint**: User Story 1 działa samodzielnie i przechodzi testy z liczbą kontrolną.

---

## Phase 4: User Story 2 - Harmonogram rat malejących (Priority: P2)

**Cel**: raty malejące o stałej części kapitałowej.

**Independent Test**: te same parametry co w US1, `typRat: 'malejace'`, część kapitałowa
identyczna w każdej racie, rata maleje w czasie.

### Testy dla User Story 2

- [x] T008 [P] [US2] Test raty malejącej (stała część kapitałowa, malejąca rata) w
      `tests/harmonogram.test.ts`

### Implementacja dla User Story 2

- [x] T009 [US2] Zaimplementować `policzHarmonogram` dla `typRat: 'malejace'` w
      `src/domena/harmonogram.ts` — depends on T002

**Checkpoint**: US1 i US2 działają niezależnie od siebie.

---

## Phase 5: User Story 3 - Zmienna stopa ze wskaźnika w trakcie spłaty (Priority: P3)

**Cel**: oprocentowanie liczone z serii POLSTR 1M / WIBOR 3M zamiast stałej stopy.

**Independent Test**: seria wskaźnika ze zmianą wartości w trakcie spłaty pokazuje zmianę raty
od okresu następującego po zmianie; po ostatnim wpisie serii stosowana jest ostatnia wartość.

### Testy dla User Story 3

- [x] T010 [P] [US3] Test zmiany wskaźnika POLSTR 1M w trakcie spłaty w `tests/harmonogram.test.ts`
- [x] T011 [P] [US3] Test: po ostatnim wpisie serii stosowana jest ostatnia znana wartość, oraz
      test kwartalnej zmiany dla WIBOR 3M, w `tests/harmonogram.test.ts`

### Implementacja dla User Story 3

- [x] T012 [US3] Zastąpić stałą stopę wywołaniem `stopaNaDzien(wskaznik, dataRaty)` z
      `src/dane/wskazniki.ts` dla obu typów rat w `src/domena/harmonogram.ts` — depends on T003, T006, T009

**Checkpoint**: US1, US2, US3 działają niezależnie, harmonogram reaguje na zmiany wskaźnika.

---

## Phase 6: User Story 4 - Nadpłaty kredytu (Priority: P4)

**Cel**: obsługa nadpłat w trybie „obniż ratę” i „skróć okres”.

**Independent Test**: nadpłata w trybie „obniż ratę” zmniejsza saldo i przelicza ratę przy
niezmienionej liczbie rat; w trybie „skróć okres” zmniejsza liczbę pozostałych rat przy
niezmienionej racie.

### Testy dla User Story 4

- [ ] T013 [P] [US4] Test nadpłaty w trybie „obniż ratę” w `tests/harmonogram.test.ts`
- [ ] T014 [P] [US4] Test nadpłaty w trybie „skróć okres” w `tests/harmonogram.test.ts`

### Implementacja dla User Story 4

- [ ] T015 [US4] Zaimplementować obsługę `nadplaty` (oba tryby) w `src/domena/harmonogram.ts`
      — depends on T012
- [ ] T016 [US4] Rozszerzyć parsowanie query string o parametr `nadplaty` (JSON) w
      `app/api/harmonogram/route.ts` — depends on T007

**Checkpoint**: cała logika domenowa (US1–US4) kompletna i przetestowana.

---

## Phase 7: User Story 5 - Ekran kalkulatora w przeglądarce (Priority: P5)

**Cel**: formularz w `app/page.tsx` podłączony do `/api/harmonogram`, z eksportem CSV.

**Independent Test**: wypełnienie formularza liczbą kontrolną i kliknięcie „Policz” pokazuje
ratę 2 494,72 zł oraz umożliwia pobranie CSV.

### Implementacja dla User Story 5

- [ ] T017 [US5] Wkleić dostarczony komponent React (Claude Design) jako `app/page.tsx` z
      dyrektywą `'use client'` w pierwszej linii
- [ ] T018 [US5] Podłączyć formularz do `fetch('/api/harmonogram?...')` w `app/page.tsx` wg
      kontraktu z `contracts/harmonogram-api.md` — depends on T016, T017
- [ ] T019 [US5] Ręcznie zweryfikować w przeglądarce liczbą kontrolną i eksport CSV, wg
      `quickstart.md` — depends on T018

**Checkpoint**: MVP kompletny end-to-end (ekran → API → domena).

---

## Faza końcowa: Polish

- [ ] T020 [P] Uruchomić `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` i
      poprawić ewentualne błędy
- [ ] T021 Przejść scenariusze z `quickstart.md` od początku do końca i potwierdzić liczbę
      kontrolną na produkcji (Vercel)
- [ ] T022 [P] Dodać skrypt `skrypty/eksport-csv.ts` (lub `.ps1`, do ustalenia przy implementacji):
      wywołuje `policzHarmonogram` z parametrów CLI i zapisuje tabelę rat do pliku `.csv`, tym
      samym formatem kolumn co ekran/API (FR-011) — depends on T006, bez nowych zależności npm

---

## Dependencies & Execution Order

- Setup (Faza 1): brak zadań.
- Foundational (Faza 2, T001–T003): blokuje wszystkie historie.
- US1 (Faza 3) → US2 (Faza 4) → US3 (Faza 5) → US4 (Faza 6): każda kolejna nadbudowuje silnik
  obliczeniowy z poprzedniej (stopa stała → dwa typy rat → wskaźnik zmienny → nadpłaty),
  więc w tym projekcie realizowane sekwencyjnie, nie równolegle.
- US5 (Faza 7): wymaga zakończonego API z US4 (a w praktyce można podłączyć ekran już po US1,
  jeśli trzeba szybciej pokazać postęp — patrz KARTA.md, tor równoległy Claude Design).

## Parallel Example: User Story 1

```
Task: "Test liczby kontrolnej w tests/harmonogram.test.ts"
Task: "Test sumy części kapitałowych w tests/harmonogram.test.ts"
```
(oba w tym samym pliku testowym — w praktyce jeden PR, nie równoległe procesy)

## Implementation Strategy

- **MVP**: Faza 2 + Faza 3 (US1) — to najmniejszy kawałek weryfikowalny liczbą kontrolną.
- Dalej przyrostowo: US2 → US3 → US4 → US5, każda historia to osobny PR (zgodnie z AGENTS.md:
  „jeden PR na fazę z tasks.md”).
- Każda faza z tasks.md odpowiada jednej fazie z KARTA.md/AGENTS.md — po zakończeniu fazy
  zatrzymaj się i pokaż diff, nie zaczynaj kolejnej bez polecenia.
