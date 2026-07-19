$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$errors = [System.Collections.Generic.List[string]]::new()

$package = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'package.json') | ConvertFrom-Json
if ($package.name -ne '@draigara/forge') { $errors.Add('package.json: package name must be @draigara/forge') }
if ($package.bin.forge -ne 'dist/forge.js') { $errors.Add('package.json: forge bin must point to dist/forge.js') }
if ($package.engines.node -ne '>=22') { $errors.Add('package.json: supported Node range must start at Node 22') }
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'schemas/config/forge.schema.v1.json'))) { $errors.Add('CLI-owned forge.yaml schema is missing') }
if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'schemas/mcp/v1/forge-tools.schema.json'))) { $errors.Add('CLI-owned MCP schema is missing') }

$build = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot '.github/workflows/build.yml')
if ($build -notmatch 'node: \[22, 24\]') { $errors.Add('.github/workflows/build.yml: test Node 22 and 24') }
if ($build -notmatch 'ubuntu-latest, windows-latest, macos-latest') { $errors.Add('.github/workflows/build.yml: test Linux, Windows, and macOS') }

$release = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot '.github/workflows/release.yml')
if ($release -notmatch 'npm publish --provenance --access public') { $errors.Add('.github/workflows/release.yml: publish with npm provenance') }
if ($release -notmatch 'tag=next' -or $release -notmatch 'tag=latest') { $errors.Add('.github/workflows/release.yml: select next/latest dist-tags') }

$activeFiles = @('README.md', 'AGENTS.md', 'PRODUCT-CONTEXT.md') +
    (Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'docs') -File | ForEach-Object { "docs/$($_.Name)" })
foreach ($relativePath in $activeFiles) {
    $content = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot $relativePath)
    if ($content -match 'Native AOT|Spectre\.Console|Draigara\.Forge\.Cli|plan.?token|short-lived plan|exact APM plan|C:\\Projects') {
        $errors.Add("${relativePath}: active documentation contains superseded architecture language")
    }
}

$requiredFixtures = @(
    'environment-inspect.success.json',
    'marketplace-list.success.json',
    'repository-inspect.success.json',
    'repository-initialize.success.json',
    'marketplace-candidates.success.json',
    'installation-apply.success.json',
    'status.success.json',
    'evaluation-invalid.error.json'
)
foreach ($name in $requiredFixtures) {
    $path = Join-Path $repositoryRoot "fixtures/mcp/v1/$name"
    if (-not (Test-Path -LiteralPath $path)) {
        $errors.Add("Missing MCP golden fixture: $name")
        continue
    }
    try { Get-Content -Raw -LiteralPath $path | ConvertFrom-Json | Out-Null }
    catch { $errors.Add("Invalid MCP golden fixture JSON: $name") }
}

$mcpSchema = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'schemas/mcp/v1/forge-tools.schema.json') | ConvertFrom-Json
if ($null -eq $mcpSchema.'$defs'.toolRequest -or $null -eq $mcpSchema.'$defs'.installation -or $null -eq $mcpSchema.'$defs'.error) {
    $errors.Add('MCP schema must define public requests, successful result families, and errors')
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output 'Documentation, package, and release validation passed.'
