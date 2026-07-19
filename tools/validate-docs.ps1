$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$publicFiles = @(
    'README.md',
    'docs/terminal-ux.md',
    'docs/release-engineering.md',
    '.github/workflows/build.yml',
    '.github/workflows/release.yml'
)

$errors = [System.Collections.Generic.List[string]]::new()
foreach ($relativePath in $publicFiles) {
    $path = Join-Path $repositoryRoot $relativePath
    $lineNumber = 0
    foreach ($line in Get-Content -LiteralPath $path) {
        $lineNumber++
        if ($line -match 'Draigara\.Forge\.Cli(?:\.exe)?' -and
            $line -notmatch '(?:src|tests)/Draigara\.Forge\.Cli(?:[./]|\s|$)') {
            $errors.Add("${relativePath}:${lineNumber}: public executable references must use forge or forge.exe")
        }
    }
}

$releaseWorkflow = Get-Content -LiteralPath (Join-Path $repositoryRoot '.github/workflows/release.yml') -Raw
if ($releaseWorkflow -notmatch 'package-input/(?:forge|forge\.exe)') {
    $errors.Add('.github/workflows/release.yml: release archives must contain forge or forge.exe at the archive root')
}
if ($releaseWorkflow -notmatch 'symbols-\$\{\{ matrix\.rid \}\}') {
    $errors.Add('.github/workflows/release.yml: symbols must be uploaded separately from release archives')
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output 'Documentation and release naming validation passed.'
