param(
  [int]$Port = 1337
)

function Stop-ListenersOnPort([int]$LocalPort) {
  $listeners = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue
  if (-not $listeners) { return }

  $processIds = $listeners.OwningProcess | Where-Object { $_ -gt 0 } | Sort-Object -Unique
  foreach ($processId in $processIds) {
    Write-Host "Port $LocalPort is in use by PID $processId. Stopping it..."
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
      Write-Host "Failed to stop PID ${processId}: $($_.Exception.Message)"
      exit 1
    }
  }
}

Stop-ListenersOnPort -LocalPort $Port

Write-Host "Starting Strapi on port $Port..."

# In Strapi v5, you can override port via env var.
$env:PORT = "$Port"

npx --no-install strapi develop
