# Raport postępu: Harmonogram spłat kredytu na POLSTR/WIBOR

Ten plik gromadzi szczegółowe raporty z każdej zakończonej fazy z `tasks.md`,
generowane przez subagenta `phase-report` (`.github/agents/phase-report.agent.md`).
Najnowszy raport na dole.

---

## Artefakty spec-kit (przed Fazą 1)

- Completed tasks: brak numeracji T0xx — to artefakty planistyczne, nie zadania z tasks.md
- Changed files: `.specify/memory/constitution.md`, `specs/001-harmonogram-splat-polstr/spec.md`,
  `plan.md`, `research.md`, `data-model.md`, `contracts/harmonogram-api.md`, `quickstart.md`,
  `tasks.md`, `checklists/requirements.md`, `.github/agents/changelog.agent.md`,
  `.github/agents/phase-report.agent.md`, `.github/hooks/` (PR #1, kilka commitów: konstytucja,
  specyfikacja, plan, zadania; agent changelog + hook; agent phase-report; poprawki z review
  Copilota — błędny przykład liczbowy, niespójny zapis wskaźnika, reprezentacja nadpłaty)
- Tests: PASS (workflow „Testy” zielony na PR #1)
- spec.md checkpoint: n/d — etap planistyczny, checkpointy dotyczą historii użytkownika, które
  zaczynają się od Fazy 3
- Suggested PR title (po polsku): spec: konstytucja, specyfikacja, plan, zadania

---

## Faza 1: Setup

Pusta z definicji w `tasks.md` — szkielet Next.js, `package.json`, `tsconfig.json` i pliki
`dane/*.json` pochodzą już z szablonu startowego, nic nie trzeba było inicjować. Zero zadań
T0xx, brak commita dedykowanego tej fazie.

---

## Faza 2 i Faza 3: Fundament oraz harmonogram rat równych (User Story 1) 🎯 MVP

- Completed tasks: T001-T007, T006a (8)
- Changed files: `src/domena/harmonogram.ts` (typy `Nadplata`/`Rata`/`Harmonogram`,
  `policzHarmonogram` dla `typRat: 'rowne'`), `src/dane/wskazniki.ts` (`stopaNaDzien`),
  `app/api/harmonogram/route.ts` (podłączenie wyniku, konwersja grosze → złote, parsowanie
  `nadplaty`), `tests/harmonogram.test.ts` (nowy), `tests/smoke.test.ts` (PR #2, commity:
  implementacja fundamentu i rat równych + FR-011/T022 eksport CSV z CLI)
- Tests: PASS, 7/7 (2 pliki testowe)
- spec.md checkpoint: met — User Story 1: rata 2 494,72 zł (±0,05 zł) i ostatnia rata
  wyrównująca 2 492,53 zł zgodne z liczbą kontrolną z `BRIEF.md`, `npm run typecheck` i
  `npm run lint` bez błędów
- Suggested PR title (po polsku): faza 2-3: fundament typów i raty równe przy stałej stopie z
  testem liczby kontrolnej

---

## Faza 4: Harmonogram rat malejących (User Story 2)

- Completed tasks: T008-T009 (2)
- Changed files: `src/domena/harmonogram.ts`, `tests/harmonogram.test.ts`,
  `specs/001-harmonogram-splat-polstr/tasks.md`, `CHANGELOG.md` (2 commity: `8b7e8fe`
  implementacja + `9cadd7b` poprawka CHANGELOG)
- Tests: PASS, 10/10 (2 pliki testowe)
- spec.md checkpoint: met — scenariusz z sekcji User Story 2 (część kapitałowa stała, rata
  maleje w czasie) pokryty testem T008, `npm run typecheck` bez błędów
- Suggested PR title (po polsku): faza 4: raty malejące ze stałą częścią kapitałową

---

## Faza 5: Zmienna stopa ze wskaźnika w trakcie spłaty (User Story 3)

- Completed tasks: T010-T012 (3)
- Changed files: `src/domena/harmonogram.ts`, `tests/harmonogram.test.ts`,
  `tests/smoke.test.ts`, `specs/001-harmonogram-splat-polstr/tasks.md` (1 commit: `695b3e3`
  „faza 5: zmienna stopa ze wskaznika w trakcie splaty”)
- Tests: PASS, 17/17 (2 pliki testowe)
- spec.md checkpoint: met — oba scenariusze z sekcji User Story 3 (zmiana wskaźnika POLSTR 1M
  widoczna od raty w dniu zmiany, ostatnia znana wartość po końcu serii, kwartalna zmiana dla
  WIBOR 3M) pokryte testami T010-T011, `npm run typecheck` bez błędów
- Suggested PR title (po polsku): faza 5: zmienna stopa ze wskaźnika w trakcie spłaty

