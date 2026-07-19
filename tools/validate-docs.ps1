$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$errors = [System.Collections.Generic.List[string]]::new()

$package = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'package.json') | ConvertFrom-Json
if ($package.name -ne '@draigara/forge') { $errors.Add('package.json: package name must be @draigara/forge') }
if ($package.bin.forge -ne 'dist/forge.js') { $errors.Add('package.json: forge bin must point to dist/forge.js') }
if ($package.engines.node -ne '>=22') { $errors.Add('package.json: supported Node range must start at Node 22') }
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'schemas/config/forge.schema.v1.json'))) { $errors.Add('CLI-owned forge.yaml schema is missing') }

$build = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot '.github/workflows/build.yml')
if ($build -notmatch 'node: \[22, 24\]') { $errors.Add('.github/workflows/build.yml: test Node 22 and 24') }
if ($build -notmatch 'ubuntu-latest, windows-latest, macos-latest') { $errors.Add('.github/workflows/build.yml: test Linux, Windows, and macOS') }

$release = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot '.github/workflows/release.yml')
if ($release -notmatch 'npm publish --provenance --access public') { $errors.Add('.github/workflows/release.yml: publish with npm provenance') }
if ($release -notmatch 'tag=next' -or $release -notmatch 'tag=latest') { $errors.Add('.github/workflows/release.yml: select next/latest dist-tags') }

$activeFiles = @('README.md', 'AGENTS.md', 'docs/architecture.md', 'docs/commands.md', 'docs/release-engineering.md', 'docs/repository-layout.md', 'docs/terminal-ux.md')
foreach ($relativePath in $activeFiles) {
    $content = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot $relativePath)
    if ($content -match 'Native AOT|Spectre\.Console|Draigara\.Forge\.Cli') {
        $errors.Add("${relativePath}: active documentation contains superseded .NET/native implementation language")
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output 'Documentation, package, and release validation passed.'
