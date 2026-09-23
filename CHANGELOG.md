# Changelog

Format oparty o [Keep a Changelog](https://keepachangelog.com/), wpisy po polsku.

## [Unreleased]

### Dodano

- Fundament domeny: typy `Nadplata`/`Rata`/`Harmonogram`, funkcję `stopaNaDzien` w `src/dane/wskazniki.ts` oraz implementację `policzHarmonogram` dla rat równych ze stałą stopą w `src/domena/harmonogram.ts`, podłączoną do `app/api/harmonogram/route.ts` (konwersja grosze->złote); testy z liczbą kontrolną z `BRIEF.md` oraz FR-011 (eksport CSV z CLI) i zadanie T022 w spec-kit.
- Funkcję `policzMalejace` w `src/domena/harmonogram.ts` liczącą raty malejące ze stałą częścią kapitałową, wraz z 3 nowymi testami.
- Subagenta dokumentującego zmiany (`changelog.agent.md`) oraz hook `PostToolUse`, który po
  wykryciu `git commit` w danych wejściowych narzędzia wstrzykuje przypomnienie o uruchomieniu
  tego subagenta (hook nie wywołuje go automatycznie — to tylko deterministyczne przypomnienie).
- Subagenta `phase-report.agent.md` generującego raport z zakończonej fazy `tasks.md`.
- Regułę w `.github/copilot-instructions.md` o spójnych angielskich nazwach plików customizacji (agentów, skilli, promptów).

### Zmieniono

- Hook `.github/hooks/scripts/po-commicie-changelog.ps1` wykrywa teraz też commity fazowe („faza N: ...") i zwraca `decision: block` zamiast samego `systemMessage`, żeby wymusić uruchomienie subagentów changelog i phase-report zamiast tylko przypominać o nich.

### Naprawiono

- Błędny przykład liczbowy w `contracts/harmonogram-api.md` (kapitał + odsetki nie sumowały się do raty).
- Niespójny zapis wskaźnika (`polstr-1m` vs `POLSTR_1M`) między dokumentami spec-kit a już istniejącym kodem — bez zmiany wyboru POLSTR/WIBOR dla użytkownika.
- Literówkę w `.github/hooks/scripts/po-commicie-changelog.ps1` i wymieszanie języków w `changelog.agent.md`.

