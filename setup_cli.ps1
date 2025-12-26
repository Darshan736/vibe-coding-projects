$ErrorActionPreference = "Stop"

$toolsDir = Join-Path $PSScriptRoot "backend\tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir -Force
}

$cliPath = Join-Path $toolsDir "arduino-cli.exe"

if (-not (Test-Path $cliPath)) {
    Write-Host "Downloading Arduino CLI..."
    $url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip"
    $zipPath = Join-Path $toolsDir "arduino-cli.zip"
    
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    
    Write-Host "Extracting..."
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
    
    Remove-Item $zipPath
}
else {
    Write-Host "Arduino CLI already exists."
}

Write-Host "Initializing Arduino CLI..."
& $cliPath config init --overwrite
& $cliPath core update-index
& $cliPath core install arduino:avr

Write-Host "Setup Complete!"
