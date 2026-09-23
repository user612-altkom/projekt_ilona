# Quickstart: weryfikacja harmonogramu

## Wymagania wstępne

- `npm install` wykonane.

## Test liczbą kontrolną (domena, bez serwera)

```
npm test
```

- Oczekiwane: test z parametrami kwota 400 000 zł, 300 rat równych, stopa stała 5,66%
  (0,0355 + 2,11 pp) zwraca ratę 2 494,72 zł (±0,05 zł) i ostatnią ratę 2 492,53 zł.

## Test przez API (po Fazie 3+)

```
npm run dev
```

Otwórz w przeglądarce:

```
http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&pierwszaRata=2026-10-10&marza=2.11&typRat=rowne&wskaznik=polstr-1m
```

- Oczekiwane: JSON z tabelą 300 rat i `sumaOdsetek`, pierwsza rata ~2 494,72 zł (dane z
  pliku dają nieco inną wartość niż liczba kontrolna — patrz uwaga w BRIEF.md).

## Test przez ekran (po Fazie 4)

- Wypełnij formularz tymi samymi parametrami, kliknij „Policz”, sprawdź ratę i tabelę.
- Kliknij „Eksport CSV”, sprawdź pobrany plik.
