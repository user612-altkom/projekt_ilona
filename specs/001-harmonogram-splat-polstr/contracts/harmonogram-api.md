# Kontrakt: GET /api/harmonogram

## Parametry (query string)

| Parametr | Wymagany | Przykład | Uwagi |
| --- | --- | --- | --- |
| `kwota` | tak | `400000` | w złotych |
| `liczbaRat` | tak | `300` | liczba całkowita |
| `pierwszaRata` | tak | `2026-10-10` | YYYY-MM-DD |
| `marza` | tak | `2.11` | w punktach procentowych |
| `typRat` | tak | `rowne` \| `malejace` | |
| `wskaznik` | tak | `POLSTR_1M` \| `WIBOR_3M` | wybór użytkownika zgodnie z BRIEF.md; zapis
  klucza zgodny z już istniejącym typem `ParametryKredytu.wskaznik` w kodzie |
| `nadplaty` | nie | `[{"miesiac":12,"kwota":10000,"tryb":"skroc-okres"}]` | JSON zserializowany w query string |

## Odpowiedź 200

Przykład dla liczby kontrolnej z BRIEF.md (kwota 400 000 zł, stopa stała 5,66% rocznie, rata
2 494,72 zł — pierwsza część odsetkowa 400 000 × 0,0566 / 12 = 1 886,67 zł, część kapitałowa
2 494,72 − 1 886,67 = 608,05 zł):

```json
{
  "raty": [
    { "numer": 1, "data": "2026-10-10", "kapital": 608.05, "odsetki": 1886.67, "rata": 2494.72, "saldo": 399391.95 }
  ],
  "sumaOdsetek": 348416.00
}
```

## Odpowiedź błędu

- **400**: brakujący lub niepoprawny parametr wejściowy, treść JSON `{ "blad": "opis po polsku" }`.
- **501**: funkcja jeszcze niezaimplementowana (stan szkieletu przed Fazą 3), zgodnie z
  obecnym zachowaniem route handlera w szablonie.
