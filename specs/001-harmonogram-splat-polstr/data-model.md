# Model danych: Harmonogram spłat kredytu na POLSTR/WIBOR

Dwie warstwy jednostek (zasada V konstytucji + istniejący kod szkieletu):

- **Domena** (`src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`): kwoty w groszach jako
  liczby całkowite, pola z sufiksem `Gr` (np. `kwotaGr`, `kapitalGr`). Tu dzieje się cała
  logika i jedyne miejsce zaokrąglania.
- **API** (`GET /api/harmonogram`, JSON): kwoty w złotych z dwoma miejscami po przecinku, pola
  bez sufiksu (np. `kapital`). Route handler tylko konwertuje grosze na złote przy budowaniu
  odpowiedzi — to rzutowanie jednostki, nie logika obliczeniowa (patrz `contracts/harmonogram-api.md`).

## Kredyt (wejście domeny, `ParametryKredytu`)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `kwotaGr` | liczba całkowita (grosze) | > 0 |
| `liczbaRat` | liczba całkowita | >= 1 |
| `pierwszaRata` | data (YYYY-MM-DD) | data pierwszej raty |
| `marza` | liczba (ułamek) | dodawana do wartości wskaźnika, np. `0.0211` dla 2,11 pp |
| `typRat` | `"rowne" \| "malejace"` | |
| `wskaznik` | `"POLSTR_1M" \| "WIBOR_3M"` | klucz serii z `src/dane/wskazniki.ts`, zgodny z typem
  już zdefiniowanym w `src/domena/harmonogram.ts`; wybór wskaźnika zostaje po stronie
  użytkownika, tak jak w BRIEF.md — tu chodzi wyłącznie o zapis klucza, nie o usunięcie opcji |
| `nadplaty` | lista `Nadplata` | może być pusta |

## Nadplata

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `miesiac` | liczba całkowita | numer raty, od której nadpłata obowiązuje |
| `kwotaGr` | liczba całkowita (grosze) | > 0 |
| `tryb` | `"obniz-rate" \| "skroc-okres"` | |

## Wskaznik (dane wejściowe z `dane/*.json`)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `wskaznik` | tekst | nazwa serii |
| `wartosci` | lista `{ od: data, stopa: ułamek }` | posortowane rosnąco po `od` |

- Wartość obowiązuje od `od` (włącznie) do dnia przed kolejnym wpisem; po ostatnim wpisie —
  bez zmian; przed pierwszym wpisem — stosowana jest najwcześniejsza dostępna wartość.

## Rata (wyjście domeny, jeden wiersz harmonogramu)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `numer` | liczba całkowita | 1..N |
| `data` | data | data wymagalności raty |
| `kapitalGr` | liczba całkowita (grosze) | regularna część kapitałowa, bez nadpłaty |
| `odsetkiGr` | liczba całkowita (grosze) | część odsetkowa |
| `nadplataGr` | liczba całkowita (grosze), opcjonalna | nadpłata przypisana do tego okresu, 0 gdy brak |
| `rataGr` | liczba całkowita (grosze) | `kapitalGr + odsetkiGr` (nadpłata nie wchodzi do raty) |
| `saldoGr` | liczba całkowita (grosze) | saldo po spłacie tej raty, uwzględniające `nadplataGr` |

## Harmonogram (wyjście całościowe domeny)

| Pole | Typ | Uwagi |
| --- | --- | --- |
| `raty` | lista `Rata` | pełna tabela |
| `sumaOdsetekGr` | liczba całkowita (grosze) | suma `odsetkiGr` ze wszystkich rat |

## Reguły walidacji / spójności

- suma `kapitalGr` + suma `nadplataGr` ze wszystkich rat == `kwotaGr` kredytu (co do grosza).
- ostatnia regularna rata wyrównuje różnicę wynikającą z zaokrągleń wcześniejszych rat.
- nadpłata przekraczająca pozostałe saldo jest ograniczana do wysokości salda (kredyt spłacony
  w całości, pozostałe raty znikają z harmonogramu).
- nadpłata w trybie `skroc-okres` zmniejsza `liczbaRat` od miesiąca nadpłaty; w trybie
  `obniz-rate` przelicza `rataGr` od kolejnego okresu przy niezmienionej `liczbaRat`.
