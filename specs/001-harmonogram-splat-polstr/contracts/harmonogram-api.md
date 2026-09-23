# Kontrakt: GET /api/harmonogram

## Parametry (query string)

| Parametr | Wymagany | Przykład | Uwagi |
| --- | --- | --- | --- |
| `kwota` | tak | `400000` | w złotych |
| `liczbaRat` | tak | `300` | liczba całkowita |
| `pierwszaRata` | tak | `2026-10-10` | YYYY-MM-DD |
| `marza` | tak | `2.11` | w punktach procentowych |
| `typRat` | tak | `rowne` \| `malejace` | |
| `wskaznik` | tak | `polstr-1m` \| `wibor-3m` | |
| `nadplaty` | nie | `[{"miesiac":12,"kwota":10000,"tryb":"skroc-okres"}]` | JSON zserializowany w query string |

## Odpowiedź 200

```json
{
  "raty": [
    { "numer": 1, "data": "2026-10-10", "kapital": 927.19, "odsetki": 1886.67, "rata": 2494.72, "saldo": 399072.81 }
  ],
  "sumaOdsetek": 348_416.00
}
```

## Odpowiedź błędu

- **400**: brakujący lub niepoprawny parametr wejściowy, treść JSON `{ "blad": "opis po polsku" }`.
- **501**: funkcja jeszcze niezaimplementowana (stan szkieletu przed Fazą 3), zgodnie z
  obecnym zachowaniem route handlera w szablonie.
