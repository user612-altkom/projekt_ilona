# Changelog

Wpisy pogrupowane wg faz z `specs/001-harmonogram-splat-polstr/tasks.md`, po polsku.

## [Unreleased]

### Artefakty spec-kit

- Konstytucja projektu (`.specify/memory/constitution.md`), specyfikacja (`spec.md`), plan
  (`plan.md`) i lista zadań (`tasks.md`) dla funkcji „Harmonogram spłat kredytu na
  POLSTR/WIBOR”.
- Poprawki z review Copilota: błędny przykład liczbowy w `contracts/harmonogram-api.md`,
  niespójny zapis wskaźnika (`polstr-1m` vs `POLSTR_1M`) między dokumentami a już istniejącym
  kodem (bez zmiany wyboru POLSTR/WIBOR dla użytkownika), reprezentacja nadpłaty w modelu
  danych, FR-011 (eksport CSV z CLI) i zadanie T022.

### Faza 2: Foundational

- Typy `Nadplata`, `Rata`, `Harmonogram` w `src/domena/harmonogram.ts`.
- Funkcja `stopaNaDzien(wskaznik, data)` w `src/dane/wskazniki.ts`.

### Faza 3: User Story 1 — raty równe przy stałej stopie

- Implementacja `policzHarmonogram` dla `typRat: 'rowne'` (annuita, ostatnia rata
  wyrównująca do kwoty kredytu).
- Podłączenie wyniku w `app/api/harmonogram/route.ts`: konwersja grosze → złote w
  odpowiedzi, parsowanie parametru `nadplaty` z query string.
- Testy z liczbą kontrolną z `BRIEF.md` w `tests/harmonogram.test.ts` (rata 2 494,72 zł,
  ostatnia rata wyrównująca, suma kapitału).

### Faza 4: User Story 2 — raty malejące

- Implementacja `policzMalejace` w `src/domena/harmonogram.ts` (stała część kapitałowa,
  malejąca rata, ostatnia rata wyrównująca resztę).
- 3 nowe testy: stała część kapitałowa, malejąca rata, suma kapitału równa kwocie kredytu.

### Narzędzia pomocnicze (poza fazami z tasks.md)

- Subagent `changelog` (aktualizuje ten plik) i `phase-report` (generuje raport z
  zakończonej fazy do wklejenia w PR).
- Hook `PostToolUse` wykrywający `git commit`: przypomina o uruchomieniu `changelog`, a dla
  commitów fazowych („faza N: ...") także o `phase-report`; zwraca `decision: block`, żeby
  wymusić reakcję zamiast tylko przypominać.
- Reguła w `.github/copilot-instructions.md`: spójne angielskie nazwy plików customizacji
  (agenci, skille, prompty), nazwy domenowe w kodzie zostają po polsku.

