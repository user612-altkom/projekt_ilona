# Wykrywa polecenie git commit w danych wejściowych hooka PostToolUse i wymusza reakcję agenta:
# zawsze subagent 'changelog', a dla commitów fazowych ("faza N: ...") dodatkowo 'phase-report'.
$stdin = [Console]::In.ReadToEnd()
if ($stdin -match 'git(\.exe)?\s+(-\S+\s+)*commit\b') {
    $jestFaza = $stdin -match '-m\s+["'']faza\s+\d'
    $wiadomosc = "Wykryto git commit. Uruchom subagenta 'changelog' (.github/agents/changelog.agent.md), żeby dopisać krótki wpis do CHANGELOG.md."
    if ($jestFaza) {
        $wiadomosc += " Ten commit wygląda na koniec fazy — uruchom też subagenta 'phase-report' (.github/agents/phase-report.agent.md) i pokaż raport użytkownikowi przed pytaniem o push/PR."
    }
    $output = @{
        decision      = 'block'
        reason        = $wiadomosc
        systemMessage = $wiadomosc
    } | ConvertTo-Json -Compress
    Write-Output $output
}
exit 0
