$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$scratch = Join-Path ([System.IO.Path]::GetTempPath()) ("forge-package-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratch | Out-Null
try {
    Push-Location $repositoryRoot
    try {
        $packOutput = npm pack --silent
        if ($LASTEXITCODE -ne 0) { throw 'npm pack failed' }
        $archiveName = $packOutput.Trim().Split([Environment]::NewLine)[-1]
        if (-not $archiveName) { throw 'npm pack did not return an archive name' }
        $archive = Join-Path $repositoryRoot $archiveName
    } finally {
        Pop-Location
    }

    $prefix = Join-Path $scratch 'prefix'
    npm install --global --prefix $prefix $archive --ignore-scripts | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Installing the packed CLI failed' }
    $forge = if ($IsWindows) { Join-Path $prefix 'forge.cmd' } else { Join-Path $prefix 'bin/forge' }
    if (-not (Test-Path -LiteralPath $forge)) { throw "Packed CLI did not install forge at $forge" }
    & $forge --version | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Packed forge --version failed' }
} finally {
    if ($archive -and (Test-Path -LiteralPath $archive)) { Remove-Item -LiteralPath $archive -Force }
    if (Test-Path -LiteralPath $scratch) { Remove-Item -LiteralPath $scratch -Recurse -Force }
}

Write-Output 'Packed CLI smoke test passed.'
