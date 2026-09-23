# Model danych: Harmonogram spłat kredytu na POLSTR/WIBOR

## Kredyt (wejście)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `kwota` | liczba (zł) | > 0 |
| `liczbaRat` | liczba całkowita | >= 1 |
| `pierwszaRata` | data (YYYY-MM-DD) | data pierwszej raty |
| `marza` | liczba (pp) | dodawana do wartości wskaźnika |
| `typRat` | `"rowne" \| "malejace"` | |
| `wskaznik` | `"polstr-1m" \| "wibor-3m"` | klucz serii z `dane/` |
| `nadplaty` | lista `Nadplata` | może być pusta |

## Nadplata

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `miesiac` | liczba całkowita | numer raty, od której nadpłata obowiązuje |
| `kwota` | liczba (zł) | > 0 |
| `tryb` | `"obniz-rate" \| "skroc-okres"` | |

## Wskaznik (dane wejściowe z `dane/*.json`)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `wskaznik` | tekst | nazwa serii |
| `wartosci` | lista `{ od: data, stopa: ułamek }` | posortowane rosnąco po `od` |

- Wartość obowiązuje od `od` do dnia przed kolejnym wpisem; po ostatnim wpisie — bez zmian.

## Rata (wyjście, jeden wiersz harmonogramu)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `numer` | liczba całkowita | 1..N |
| `data` | data | data wymagalności raty |
| `kapital` | liczba (zł, 2 miejsca) | część kapitałowa |
| `odsetki` | liczba (zł, 2 miejsca) | część odsetkowa |
| `rata` | liczba (zł, 2 miejsca) | `kapital + odsetki` |
| `saldo` | liczba (zł, 2 miejsca) | saldo po spłacie tej raty |

## Harmonogram (wyjście całościowe)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `raty` | lista `Rata` | pełna tabela |
| `sumaOdsetek` | liczba (zł, 2 miejsca) | suma `odsetki` ze wszystkich rat |

## Reguły walidacji / spójności

- suma `kapital` ze wszystkich rat == `kwota` kredytu (co do grosza).
- ostatnia rata wyrównuje różnicę wynikającą z zaokrągleń wcześniejszych rat.
- nadpłata w trybie `skroc-okres` zmniejsza `liczbaRat` od miesiąca nadpłaty; w trybie
  `obniz-rate` przelicza `rata` od kolejnego okresu przy niezmienionej `liczbaRat`.
