<#
Eksport CSV harmonogramu spłat z linii komend (FR-011), bez nowych zależności npm.
Woła lokalnie uruchomiony `GET /api/harmonogram` (ten sam kontrakt co ekran) i zapisuje
tabelę rat do pliku .csv, tym samym formatem kolumn co ekran/API.

Wymaga: serwer działający lokalnie (npm run dev albo npm start), domyślnie na
http://localhost:3000. Uruchom w osobnym terminalu przed użyciem tego skryptu.

Użycie:
  .\skrypty\eksport-csv.ps1 -Kwota 400000 -LiczbaRat 300 -PierwszaRata 2026-10-10 `
    -Marza 2.11 -Wskaznik POLSTR_1M -TypRat rowne [-Nadplaty '[{"miesiac":12,"kwota":10000,"tryb":"skroc-okres"}]'] `
    [-Wyjscie harmonogram.csv] [-BazowyUrl http://localhost:3000]
#>
param(
    [Parameter(Mandatory = $true)][double]$Kwota,
    [Parameter(Mandatory = $true)][int]$LiczbaRat,
    [Parameter(Mandatory = $true)][string]$PierwszaRata,
    [Parameter(Mandatory = $true)][double]$Marza,
    [Parameter(Mandatory = $true)][ValidateSet('POLSTR_1M', 'WIBOR_3M')][string]$Wskaznik,
    [Parameter(Mandatory = $true)][ValidateSet('rowne', 'malejace')][string]$TypRat,
    [string]$Nadplaty,
    [string]$Wyjscie = 'harmonogram.csv',
    [string]$BazowyUrl = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'

$parametry = @{
    kwota        = $Kwota
    liczbaRat    = $LiczbaRat
    pierwszaRata = $PierwszaRata
    marza        = $Marza
    wskaznik     = $Wskaznik
    typRat       = $TypRat
}
if ($Nadplaty) { $parametry['nadplaty'] = $Nadplaty }

$querystring = ($parametry.GetEnumerator() | ForEach-Object {
    "$($_.Key)=$([Uri]::EscapeDataString([string]$_.Value))"
}) -join '&'
$url = "$BazowyUrl/api/harmonogram?$querystring"

Write-Host "Wywoluje $url ..."
$odpowiedz = Invoke-RestMethod -Uri $url -Method Get

$wiersze = @('numer;data;kapital;odsetki;rata;saldo')
foreach ($rata in $odpowiedz.raty) {
    $wiersze += "$($rata.numer);$($rata.data);$($rata.kapital.ToString('0.00', [System.Globalization.CultureInfo]::InvariantCulture));$($rata.odsetki.ToString('0.00', [System.Globalization.CultureInfo]::InvariantCulture));$($rata.rata.ToString('0.00', [System.Globalization.CultureInfo]::InvariantCulture));$($rata.saldo.ToString('0.00', [System.Globalization.CultureInfo]::InvariantCulture))"
}

$utf8BezBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines((Resolve-Path -Path . | Join-Path -ChildPath $Wyjscie), $wiersze, $utf8BezBom)

Write-Host "Zapisano $($odpowiedz.raty.Count) rat do pliku $Wyjscie."
