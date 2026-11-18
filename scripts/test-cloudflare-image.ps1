# Smoke test: Cloudflare Workers AI FLUX schnell. Reads keys from .env, never prints them.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'
if (-not (Test-Path $envFile)) { Write-Error '.env not found'; exit 1 }

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
    $vars[$matches[1]] = $matches[2].Trim('"').Trim("'")
  }
}
$acct = $vars['CLOUDFLARE_ACCOUNT_ID']
$tok = $vars['CLOUDFLARE_API_TOKEN']
if (-not $acct -or -not $tok) {
  Write-Error 'CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_API_TOKEN missing from .env'
  exit 1
}

$outDir = Join-Path $PSScriptRoot 'out'
New-Item -ItemType Directory -Force $outDir | Out-Null
$outFile = Join-Path $outDir 'cf-test.jpg'

$uri = "https://api.cloudflare.com/client/v4/accounts/$acct/ai/run/@cf/black-forest-labs/flux-1-schnell"
$body = @{
  prompt = 'Portrait of a fictional woman, curly hair, denim jacket, head and shoulders, photorealistic. Synthetic person, no text, no logos.'
  steps  = 4
} | ConvertTo-Json -Compress

$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $resp = Invoke-WebRequest -Uri $uri -Method Post -UseBasicParsing `
    -Headers @{ Authorization = "Bearer $tok" } `
    -ContentType 'application/json' -Body $body
} catch {
  $sw.Stop()
  $status = $null
  $msg = $_.Exception.Message
  if ($_.Exception.Response) {
    $status = [int]$_.Exception.Response.StatusCode
    try {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $msg = $reader.ReadToEnd()
    } catch {}
  }
  $msg = $msg.Replace($tok, '[REDACTED]')
  Write-Host "HTTP status: $status"
  Write-Host "Error: $msg"
  exit 1
}
$sw.Stop()

$json = $resp.Content | ConvertFrom-Json
if (-not $json.result.image) { Write-Host "HTTP status: $($resp.StatusCode)"; Write-Host 'No result.image in response'; exit 1 }
[IO.File]::WriteAllBytes($outFile, [Convert]::FromBase64String($json.result.image))

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($outFile)
Write-Host "HTTP status: $($resp.StatusCode)"
Write-Host "Image size: $($img.Width)x$($img.Height)"
Write-Host ("Elapsed: {0:N1}s" -f $sw.Elapsed.TotalSeconds)
Write-Host "Saved: $outFile"
$img.Dispose()
