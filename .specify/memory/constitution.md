# Harmonogram na POLSTR Constitution

## Core Principles

### I. Architektura Next.js App Router z podziałem odpowiedzialności
Aplikacja MUSI być oparta o Next.js App Router. Route handler `app/api/harmonogram/route.ts`
JEST cienki: parsuje parametry z query string, woła moduł domenowy i zwraca JSON, bez żadnej
logiki obliczeniowej. Ekran `app/page.tsx` JEST komponentem `'use client'` stylowanym
Tailwindem, bez bibliotek UI, i pobiera dane wyłącznie z `/api/harmonogram`.

### II. Domena jako czyste funkcje (NON-NEGOTIABLE)
Cały kod w `src/domena/` MUSI być zbiorem czystych funkcji: bez importów z React, bez
operacji I/O, bez `Date.now()` ani innych źródeł niedeterminizmu. Wszystkie obliczenia
harmonogramu spłat mieszkają wyłącznie tam, co czyni je w pełni testowalnymi w izolacji.

### III. TypeScript Strict bez kompromisów
Projekt MUSI korzystać z `tsconfig.json` w trybie strict. Użycie `any` oraz `@ts-ignore`
jest zabronione. Niejasne typy trzeba doprecyzować zamiast obchodzić kompilator.

### IV. Test-First, TDD (NON-NEGOTIABLE)
Dla każdej zmiany logiki obliczeniowej test powstaje przed implementacją i musi zawierać
liczbę kontrolną. Testy w `tests/` (vitest) obejmują wyłącznie moduły domeny i danych
(`src/domena/`, `src/dane/`) — ekran nie ma testów jednostkowych.

### V. Precyzja finansowa i jawne zaokrąglanie
Kwoty pieniężne MUSZĄ być reprezentowane jako liczby całkowite w groszach, chyba że projekt
podejmie jedną jawną i udokumentowaną decyzję o miejscu zaokrąglania. Zaokrąglanie odbywa się
w jednym, wskazanym miejscu w kodzie, nigdy rozproszone po module.

### VI. Minimalizm zależności
Nowe zależności npm wymagają jednozdaniowego uzasadnienia w opisie PR i zgody przed
dodaniem. Domyślnie korzystamy z tego, co już jest w `package.json` szablonu.

## Stos technologiczny

Next.js (App Router) + TypeScript + Tailwind CSS do stylów ekranu, vitest do testów domeny
i danych, dane wskaźników POLSTR 1M i WIBOR 3M wczytywane z `dane/*.json` przez
`src/dane/wskazniki.ts`. Produkcja wdrażana na Vercel z GitHuba; `npm run build` jest tym
samym poleceniem, które uruchamia Vercel i workflow GitHub Actions.

## Proces wytwarzania

Praca odbywa się fazami z `tasks.md`, jeden PR na fazę. Po zakończeniu fazy agent zatrzymuje
się i pokazuje diff, nie zaczyna kolejnej fazy bez wyraźnego polecenia. Pliki w `dane/` nie są
edytowane bez wyraźnego polecenia, bo wczytują je testy. Katalogi `.specify/` i
`.github/skills/` nie są edytowane poza tym, co robią skille spec-kit. Dokumenty, komentarze
w kodzie i komunikaty commitów są po polsku, bez skrótów w nazwach domenowych. Przed
zgłoszeniem gotowości uruchamiane są `npm test`, `npm run typecheck` i `npm run build`.

## Governance

Ta konstytucja jest nadrzędna wobec innych praktyk projektowych. Zmiany wymagają aktualizacji
tego pliku przez `/speckit-constitution`, z podniesieniem wersji zgodnie z zasadami semver
(MAJOR — usunięcie lub redefinicja zasady, MINOR — nowa zasada lub istotne rozszerzenie,
PATCH — doprecyzowanie treści). Każdy PR i każde review MUSI weryfikować zgodność z zasadami
powyżej; złożoność wykraczająca poza nie wymaga uzasadnienia w opisie PR. Bieżące wytyczne
operacyjne (bramki, komendy, kolejność faz) są w `AGENTS.md` i `KARTA.md`.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
