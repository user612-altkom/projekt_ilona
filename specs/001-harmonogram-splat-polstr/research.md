# Research: Harmonogram spłat kredytu na POLSTR/WIBOR

Brak `NEEDS CLARIFICATION` w Technical Context — poniżej tylko decyzje wymagające uzasadnienia.

## Miejsce zaokrąglania

- **Decyzja**: zaokrąglanie do grosza dzieje się wyłącznie przy wyliczaniu raty i części
  odsetkowej/kapitałowej pojedynczego okresu, na samym końcu obliczeń tego okresu. Wewnętrzne
  sumy (saldo, odsetki narastające) trzymane są z pełną precyzją do momentu zaokrąglenia raty.
- **Rationale**: jedno miejsce zaokrąglania (zasada V konstytucji), zgodne z regułą z BRIEF.md
  „rata wyrównująca na końcu tak, aby suma części kapitałowych była równa kwocie kredytu”.
- **Alternatywy odrzucone**: zaokrąglanie salda po każdym okresie — kumuluje błąd zaokrąglenia
  i nie gwarantuje zgodności sumy z kwotą kredytu bez dodatkowej korekty.

## Reprezentacja kwot

- **Decyzja**: kwoty w groszach jako liczby całkowite (`kwotaGr`), zgodnie z już istniejącym
  typem `ParametryKredytu` w `src/domena/harmonogram.ts`. Konwersja złote↔grosze dzieje się
  wyłącznie w route handlerze przy parsowaniu query string.
- **Rationale**: zasada V konstytucji wprost preferuje grosze jako liczby całkowite; kod
  szkieletu już to zakłada, więc to nie nowa decyzja, tylko potwierdzenie istniejącej.
- **Alternatywy odrzucone**: obliczenia w złotych z zaokrąglaniem na końcu — odrzucone, bo
  wymagałoby zmiany już istniejącego kontraktu `ParametryKredytu.kwotaGr`.

## Zmiana wskaźnika w dniu raty

- **Decyzja**: dla każdej raty szukana jest wartość wskaźnika obowiązująca dokładnie na datę
  tej raty (`od <= data raty`, najnowszy taki wpis).
- **Rationale**: wprost z reguł BRIEF.md („oprocentowanie okresu = wartość wskaźnika + marża”,
  POLSTR co miesiąc, WIBOR co kwartał w dniu raty).
- **Alternatywy odrzucone**: uśrednianie wskaźnika z okresu — odrzucone wprost w BRIEF.md jako
  „świadome uproszczenie MVP”.
