# Feature Specification: Harmonogram spłat kredytu na POLSTR/WIBOR

**Feature Branch**: `spec-mvp`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: treść zgłoszenia i zakres MVP z BRIEF.md — kalkulator harmonogramu spłat kredytu hipotecznego ze zmiennym oprocentowaniem na POLSTR 1M lub WIBOR 3M, obsługujący raty równe i malejące oraz nadpłaty. Liczba kontrolna z BRIEF.md jest kryterium akceptacji. Ekran www to osobna, ostatnia historia użytkownika, jego wygląd zostanie dostarczony jako gotowy komponent React (Claude Design).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Harmonogram rat równych przy stałej stopie (Priority: P1)

Doradca w oddziale banku podaje kwotę kredytu, liczbę rat, datę pierwszej raty i marżę dla
raty równej przy jednym, stałym w czasie oprocentowaniu, i otrzymuje pełny harmonogram spłat
z sumą odsetek.

**Why this priority**: To najmniejszy samodzielny wycinek, który da się w pełni zweryfikować
liczbą kontrolną z BRIEF.md, i fundament, na którym budują się kolejne historie.

**Independent Test**: Wywołanie funkcji domenowej z parametrami z liczby kontrolnej (400 000
zł, 300 rat, stopa 5,66% rocznie stała) zwraca ratę równą 2 494,72 zł (tolerancja ±0,05 zł) i
ostatnią ratę wyrównującą 2 492,53 zł.

**Acceptance Scenarios**:

1. **Given** kwota 400 000 zł, 300 rat równych, stała stopa roczna 5,66%, **When** liczony jest
   harmonogram, **Then** każda rata poza ostatnią wynosi 2 494,72 zł (±0,05 zł), a ostatnia rata
   wyrównuje sumę części kapitałowych do kwoty kredytu.
2. **Given** dowolny poprawny zestaw parametrów, **When** liczony jest harmonogram, **Then**
   suma części kapitałowych wszystkich rat po zaokrągleniach jest równa kwocie kredytu co do
   grosza.

---

### User Story 2 - Harmonogram rat malejących (Priority: P2)

Doradca wybiera typ rat malejących zamiast równych i otrzymuje harmonogram, w którym część
kapitałowa jest stała, a rata maleje w czasie wraz ze spadkiem salda.

**Why this priority**: Drugi z dwóch wymaganych typów rat z BRIEF.md, niezależny od logiki rat
równych, ale współdzielący ten sam mechanizm naliczania odsetek.

**Independent Test**: Wywołanie funkcji domenowej z tymi samymi parametrami co w User Story 1,
ale z typem rat malejących, zwraca malejący ciąg rat o stałej części kapitałowej.

**Acceptance Scenarios**:

1. **Given** kwota kredytu i liczba rat, **When** wybrany jest typ „raty malejące”, **Then**
   część kapitałowa każdej raty jest identyczna (z ewentualnym wyrównaniem na końcu), a rata
   maleje z okresu na okres.

---

### User Story 3 - Zmienna stopa ze wskaźnika w trakcie spłaty (Priority: P3)

Doradca wybiera wskaźnik POLSTR 1M albo WIBOR 3M zamiast stopy stałej, a system nalicza
odsetki na podstawie wartości wskaźnika obowiązującej w dniu każdej raty, powiększonej o
marżę.

**Why this priority**: To sedno zgłoszenia biznesowego — obsługa dwóch wskaźników rynkowych i
ich zmienności w czasie — ale wymaga najpierw działającego silnika naliczania odsetek z User
Story 1 i 2.

**Independent Test**: Wywołanie funkcji domenowej z serią wskaźnika obejmującą co najmniej
jedną zmianę wartości w trakcie okresu spłaty pokazuje odpowiednią zmianę raty od okresu, w
którym wskaźnik się zmienił.

**Acceptance Scenarios**:

1. **Given** seria wskaźnika POLSTR 1M ze zmianą wartości w trakcie spłaty, **When** liczony
   jest harmonogram, **Then** oprocentowanie okresu = wartość wskaźnika obowiązująca w dniu
   raty + marża, a zmiana jest widoczna już od raty przypadającej dokładnie w dniu zmiany
   (włącznie) — granica wskaźnika jest domknięta z lewej strony (`od <= data raty`).
2. **Given** data raty wykraczająca poza ostatni wpis serii wskaźnika, **When** liczony jest
   ten okres, **Then** stosowana jest ostatnia znana wartość wskaźnika.
3. **Given** wybrany wskaźnik WIBOR 3M, **When** liczony jest harmonogram, **Then**
   oprocentowanie zmienia się co kwartał zgodnie z serią wskaźnika, a nie co miesiąc.

---

### User Story 4 - Nadpłaty kredytu (Priority: P4)

Doradca dodaje do harmonogramu jedną lub więcej nadpłat (miesiąc, kwota, tryb: obniż ratę albo
skróć okres) i widzi ich wpływ na dalszy harmonogram.

**Why this priority**: Ostatni element logiki obliczeniowej z BRIEF.md, budowany na już
działającym harmonogramie z poprzednich historii.

**Independent Test**: Wywołanie funkcji domenowej z jedną nadpłatą w trybie „obniż ratę” i
osobno w trybie „skróć okres” pokazuje odpowiednio: mniejszą ratę od kolejnego okresu przy tej
samej liczbie rat, albo skrócony harmonogram przy tej samej racie.

**Acceptance Scenarios**:

1. **Given** nadpłata w danym miesiącu w trybie „obniż ratę”, **When** liczony jest
   harmonogram, **Then** saldo po nadpłacie jest pomniejszone o kwotę nadpłaty, a rata od
   kolejnego okresu jest przeliczona przy niezmienionej liczbie pozostałych rat.
2. **Given** nadpłata w danym miesiącu w trybie „skróć okres”, **When** liczony jest
   harmonogram, **Then** saldo po nadpłacie jest pomniejszone o kwotę nadpłaty, rata pozostaje
   bez zmian, a liczba pozostałych rat maleje.

---

### User Story 5 - Ekran kalkulatora w przeglądarce (Priority: P5)

Doradca wypełnia formularz na stronie www (kwota, liczba rat, data pierwszej raty, marża,
wskaźnik, typ rat, lista nadpłat), klika „Policz” i widzi ratę pierwszą i ostatnią, sumę
odsetek, pełną tabelę rat oraz może wyeksportować wynik do CSV.

**Why this priority**: To warstwa prezentacji nad już gotową logiką z historii 1 do 4;
wygląd ekranu jest dostarczany jako gotowy komponent React, więc ta historia dotyczy wyłącznie
podpięcia go do route handlera.

**Independent Test**: Otwarcie strony, wypełnienie formularza liczbą kontrolną z BRIEF.md i
kliknięcie „Policz” pokazuje ratę 2 494,72 zł oraz umożliwia pobranie pliku CSV z tabelą rat.

**Acceptance Scenarios**:

1. **Given** wypełniony formularz z poprawnymi danymi, **When** użytkownik kliknie „Policz”,
   **Then** ekran pokazuje ratę pierwszą, ratę ostatnią, sumę odsetek i tabelę rat (numer,
   data, część kapitałowa, część odsetkowa, rata, saldo po spłacie).
2. **Given** policzony harmonogram na ekranie, **When** użytkownik kliknie „Eksport CSV”,
   **Then** przeglądarka pobiera plik CSV z tą samą tabelą rat.

### Edge Cases

- Nadpłata przekraczająca pozostałe saldo jest ograniczana do wysokości salda — kredyt zostaje
  spłacony w całości w tym okresie, a pozostałe raty znikają z harmonogramu (dotyczy to też
  nadpłaty przypadającej na ostatnią ratę).
- Gdy data pierwszej raty wypada przed pierwszym wpisem serii wskaźnika, stosowana jest
  najwcześniejsza dostępna wartość serii — symetrycznie do reguły z FR-004 (ostatnia znana
  wartość po końcu serii).
- Przy liczbie rat równej 1 jedyna rata obejmuje całą kwotę kredytu jako część kapitałową i
  odsetki za jeden okres; nie ma dalszych okresów do przeliczenia ani wyrównania.
- Zaokrąglenia w kolejnych ratach nie są rozkładane pojedynczo — cała różnica wynikająca z
  zaokrągleń trafia do części kapitałowej ostatniej raty (FR-008), tak żeby suma części
  kapitałowych zawsze zgadzała się z kwotą kredytu co do grosza.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUSI przyjmować jako wejście: kwotę kredytu, liczbę rat, datę pierwszej
  raty, marżę w punktach procentowych, typ rat (równe albo malejące), wybór wskaźnika (POLSTR
  1M albo WIBOR 3M) oraz listę nadpłat (miesiąc, kwota, tryb).
- **FR-002**: System MUSI liczyć oprocentowanie każdego okresu jako sumę wartości wskaźnika
  obowiązującej w dniu raty i marży.
- **FR-003**: System MUSI aktualizować wartość POLSTR 1M co miesiąc w dniu raty, a WIBOR 3M co
  kwartał, zgodnie z seriami wartości dostarczonymi w danych wskaźników.
- **FR-004**: System MUSI stosować ostatnią znaną wartość wskaźnika dla wszystkich okresów po
  ostatnim wpisie jego serii.
- **FR-005**: System MUSI liczyć odsetki okresu jako proste odsetki od salda, bez kapitalizacji
  w ramach miesiąca.
- **FR-006**: System MUSI wspierać dwa typy rat: równe (stała rata poza wyrównaniem końcowym) i
  malejące (stała część kapitałowa).
- **FR-007**: System MUSI wspierać nadpłaty w dwóch trybach: „obniż ratę” (przelicza ratę przy
  niezmienionej liczbie pozostałych rat) i „skróć okres” (skraca liczbę pozostałych rat przy
  niezmienionej racie).
- **FR-008**: System MUSI zaokrąglać kwoty do grosza i tak dobierać ostatnią ratę, aby suma
  części kapitałowych regularnych rat plus suma nadpłat była równa kwocie kredytu. Nadpłata
  jest osobną pozycją dołączoną do raty danego okresu (patrz encja Rata), nie jest wliczana do
  jej regularnej części kapitałowej.
- **FR-009**: `GET /api/harmonogram` MUSI zwracać w JSON pełną tabelę rat (numer, data, część
  kapitałowa, część odsetkowa, rata, saldo po spłacie) i sumę odsetek za cały okres.
- **FR-010**: Ekran www MUSI udostępniać formularz z polami wejściowymi z FR-001, przycisk
  „Policz”, wynik (rata pierwsza, rata ostatnia, suma odsetek, tabela rat) oraz eksport tabeli
  rat do pliku CSV po stronie przeglądarki.

### Key Entities

- **Kredyt**: kwota, liczba rat, data pierwszej raty, marża, wybrany wskaźnik, typ rat, lista
  nadpłat — dane wejściowe jednego wyliczenia harmonogramu.
- **Wskaźnik**: seria wartości stopy referencyjnej (POLSTR 1M albo WIBOR 3M) w czasie, z datą
  obowiązywania każdej wartości.
- **Rata**: numer, data, część kapitałowa, część odsetkowa, wysokość raty, opcjonalna nadpłata
  tego okresu, saldo pozostałe po spłacie (uwzględniające nadpłatę) — jeden wiersz harmonogramu.
- **Nadpłata**: miesiąc, kwota, tryb (obniż ratę albo skróć okres) — modyfikator wpływający na
  dalszy przebieg harmonogramu od danego okresu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dla parametrów z liczby kontrolnej (400 000 zł, 300 rat równych, 5,66% rocznie
  stałe) obliczona rata odbiega od wartości 2 494,72 zł o nie więcej niż 0,05 zł.
- **SC-002**: Dla dowolnego poprawnego zestawu parametrów suma części kapitałowych wszystkich
  rat po zaokrągleniach jest równa kwocie kredytu co do grosza.
- **SC-003**: Doradca wypełniający formularz i klikający „Policz” widzi kompletny wynik (rata
  pierwsza, ostatnia, suma odsetek, tabela rat) bez przeładowania strony.
- **SC-004**: Doradca może pobrać tabelę rat jako plik CSV bezpośrednio z przeglądarki, bez
  dodatkowego kroku po stronie serwera.

## Assumptions

- Wartość wskaźnika na dany okres jest brana wprost z danych źródłowych (`dane/*.json`); nie
  składamy dziennych stawek wstecz za okres odsetkowy — to świadome uproszczenie MVP.
- Test z liczbą kontrolną (stała stopa 0,0355 wprost, nie z pliku — patrz BRIEF.md) nie wymaga
  nowego pola wejściowego na stałą stopę: test podmienia źródło serii wskaźnika (mock modułu
  `src/dane/wskazniki.ts`) tak, żeby dla wybranego wskaźnika zwracał stałą wartość 0,0355 w
  całym okresie spłaty. Publiczny kontrakt `ParametryKredytu`/API nie ma pola na stałą stopę.
- Wygląd ekranu (`app/page.tsx`) zostanie dostarczony jako gotowy komponent React z Tailwindem
  (z Claude Design); ta specyfikacja opisuje jego zachowanie i dane, nie wygląd wizualny.
- Produkcyjne środowisko (Vercel, GitHub Actions) jest już skonfigurowane i nie jest częścią
  zakresu tej funkcji.
- Waluta to złoty polski (PLN), kwoty zaokrąglane do grosza.
