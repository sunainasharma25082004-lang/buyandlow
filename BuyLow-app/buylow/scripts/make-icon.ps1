Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\assets\images\logo.png"
$outPath = Join-Path $PSScriptRoot "..\assets\images\icon.png"

$src = [System.Drawing.Image]::FromFile($srcPath)
$size = 1024
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.SmoothingMode = 'HighQuality'
$g.InterpolationMode = 'HighQualityBicubic'

$pad = 80
$targetW = $size - (2 * $pad)
$targetH = $size - (2 * $pad)
$ratio = [Math]::Min($targetW / $src.Width, $targetH / $src.Height)
$drawW = [int]($src.Width * $ratio)
$drawH = [int]($src.Height * $ratio)
$x = [int](($size - $drawW) / 2)
$y = [int](($size - $drawH) / 2)

$g.DrawImage($src, $x, $y, $drawW, $drawH)
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Host "Square icon created: $outPath"