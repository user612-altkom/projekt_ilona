# Changelog

Format oparty o [Keep a Changelog](https://keepachangelog.com/), wpisy po polsku.

## [Unreleased]

### Dodano

- Subagenta dokumentującego zmiany (`changelog.agent.md`) oraz hook `PostToolUse`, który po
  wykryciu `git commit` w danych wejściowych narzędzia wstrzykuje przypomnienie o uruchomieniu
  tego subagenta (hook nie wywołuje go automatycznie — to tylko deterministyczne przypomnienie).
- Subagenta `phase-report.agent.md` generującego raport z zakończonej fazy `tasks.md`.
- Regułę w `.github/copilot-instructions.md` o spójnych angielskich nazwach plików customizacji (agentów, skilli, promptów).

### Naprawiono

- Błędny przykład liczbowy w `contracts/harmonogram-api.md` (kapitał + odsetki nie sumowały się do raty).
- Niespójny zapis wskaźnika (`polstr-1m` vs `POLSTR_1M`) między dokumentami spec-kit a już istniejącym kodem — bez zmiany wyboru POLSTR/WIBOR dla użytkownika.
- Literówkę w `.github/hooks/scripts/po-commicie-changelog.ps1` i wymieszanie języków w `changelog.agent.md`.

