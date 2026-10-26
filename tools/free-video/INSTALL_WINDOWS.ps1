# NovaReel free AI video setup: Windows only. Requires explicit approval.
param([switch]$CheckOnly,[string]$InstallRoot="$env:USERPROFILE\Projects\NovaReel-Free-Video")
$ErrorActionPreference="Stop"
Write-Host "NovaReel / free local ComfyUI video generator" -ForegroundColor Cyan
Write-Host "Official GitHub: https://github.com/Comfy-Org/ComfyUI"
Write-Host "Wan2.2 guide: https://docs.comfy.org/tutorials/video/wan/wan2_2"
if($env:OS -ne "Windows_NT"){throw "This installer runs only on Windows."}
$gpuTool=Get-Command nvidia-smi.exe -ErrorAction SilentlyContinue
$vram=0
if($gpuTool){
  $lines=@(& $gpuTool.Source --query-gpu=name,memory.total --format=csv,noheader)
  foreach($line in $lines){
    Write-Host "GPU: $line"
    if($line -match "(\d+)\s*MiB"){$vram=[Math]::Max($vram,[int]$Matches[1])}
  }
}else{Write-Warning "NVIDIA driver/GPU not found (nvidia-smi.exe missing)."}
if($vram -ge 7900){Write-Host "GPU has about 8 GB+ VRAM, which may support Wan2.2 5B with offloading." -ForegroundColor Green}
elseif($vram -ge 6000){Write-Warning "Under 8 GB VRAM. Wan2.2 5B may run out of memory; consider official FramePack for RTX 30/40/50 series."}
else{Write-Warning "No suitable GPU confirmed. See official ComfyUI hardware requirements."}
$git=Get-Command git.exe -ErrorAction SilentlyContinue
if(-not $git){Write-Warning "Git missing. Install from https://git-scm.com/downloads/win"}
$py=Get-Command py.exe -ErrorAction SilentlyContinue
$python=Get-Command python.exe -ErrorAction SilentlyContinue
$mode=""
if($py){
  try {
    & $py.Source -3.13 --version 2>$null | Out-Null
    if($LASTEXITCODE -eq 0){$mode="py"}
  } catch { Write-Warning "Python launcher is present, but Python 3.13 is unavailable." }
}
if((-not $mode) -and $python){
  $ver=& $python.Source --version 2>&1
  if(($LASTEXITCODE -eq 0) -and ("$ver" -match "Python 3\.(12|13|14)")){$mode="python"}
}
if(-not $mode){Write-Warning "Install Python 3.13 from python.org and open a NEW PowerShell."}
$root=[System.IO.Path]::GetFullPath($InstallRoot)
Write-Host "Target folder: $root"
try{
 $disk=[System.IO.DriveInfo]::new([System.IO.Path]::GetPathRoot($root))
 $free=[Math]::Round($disk.AvailableFreeSpace/1GB,1)
 Write-Host "Free space: $free GB"
 if($free -lt 35){Write-Warning "At least 35 GB free storage is recommended for app + model."}
}catch{Write-Warning "Disk space check unavailable."}
if($CheckOnly){Write-Host "Check-only completed. No files changed." -ForegroundColor Yellow; exit 0}
if(-not $git -or -not $mode){throw "Git and Python are required. Fix the checks first."}
if($vram -lt 6000){throw "NVIDIA GPU with at least 6GB VRAM not confirmed. Installation stopped."}
if($lines -match "GTX\s*10\d\d|GTX\s*9\d\d") {throw "Detected an older GTX GPU; CUDA 13.0 wheels may not support it. Use the official compatible ComfyUI portable release instead."}
Write-Host "ComfyUI source and dependencies are free. Downloads include several GB of PyTorch packages."
Write-Host "Video model weights are NOT included. You will select them separately."
$confirm=Read-Host "Type INSTALL to approve free software download and local changes"
if($confirm -cne "INSTALL"){Write-Host "Cancelled. No installation started.";exit 0}
New-Item -ItemType Directory -Path $root -Force | Out-Null
$src=Join-Path $root "ComfyUI"
$venv=Join-Path $root ".venv"
$pythonExe=Join-Path $venv "Scripts\python.exe"
if(-not (Test-Path $src)){
 & $git.Source clone --depth 1 https://github.com/Comfy-Org/ComfyUI.git $src
 if($LASTEXITCODE -ne 0){throw "GitHub clone failed."}
}elseif(-not (Test-Path (Join-Path $src ".git"))){throw "Target ComfyUI folder exists but is not a repository. Nothing overwritten."}
if(-not (Test-Path $pythonExe)){
 if($mode -eq "py"){& $py.Source -3.13 -m venv $venv}
 else{& $python.Source -m venv $venv}
 if($LASTEXITCODE -ne 0){throw "Creating isolated Python environment failed."}
}
& $pythonExe -m pip install --upgrade pip
if($LASTEXITCODE -ne 0){throw "pip setup failed."}
& $pythonExe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130
if($LASTEXITCODE -ne 0){throw "CUDA PyTorch install failed; check drivers and GPU compatibility."}
& $pythonExe -m pip install -r (Join-Path $src "requirements.txt")
if($LASTEXITCODE -ne 0){throw "ComfyUI dependencies failed to install."}
$launcher=Join-Path $root "START_COMFYUI.ps1"
$launch=@'
$ErrorActionPreference="Stop"
$python=Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$main=Join-Path $PSScriptRoot "ComfyUI\main.py"
if(-not (Test-Path $python) -or -not (Test-Path $main)){throw "ComfyUI not installed in this directory"}
Write-Host "Open http://127.0.0.1:8188 on THIS computer. Press Ctrl+C to stop."
& $python $main --listen 127.0.0.1 --port 8188
'@
Set-Content -Path $launcher -Value $launch -Encoding UTF8
Write-Host "ComfyUI base app installed! The model files are not yet installed." -ForegroundColor Green
Write-Host "Start file: $launcher"
Write-Host "Model guide: https://docs.comfy.org/tutorials/video/wan/wan2_2"
