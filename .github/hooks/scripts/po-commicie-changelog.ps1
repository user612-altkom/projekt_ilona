# Wykrywa polecenie git commit w danych wejściowych hooka PostToolUse i przypomina o CHANGELOG.md.
$stdin = [Console]::In.ReadToEnd()
if ($stdin -match 'git(\.exe)?\s+(-\S+\s+)*commit\b') {
    $output = @{
        systemMessage = "Wykryto git commit. Uruchom subagenta 'changelog' (.github/agents/changelog.agent.md), zeby dopisac krotki wpis do CHANGELOG.md."
    } | ConvertTo-Json -Compress
    Write-Output $output
}
exit 0
