# Run on Windows with the installed Microsoft Huihui voice. Produces real PCM
# narration and timestamps from rendered segment lengths; no simulated timer.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$appRoot = Split-Path $PSScriptRoot -Parent
$audioDir = Join-Path $appRoot 'public/audio'
New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
$narrations = & node --experimental-strip-types (Join-Path $PSScriptRoot 'narration-input.mjs') | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Unable to load narration content' }
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Huihui Desktop')
$speaker.Rate = -1
$audioFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$catalog = @()
try {
  foreach ($item in $narrations) {
    $stream = New-Object System.IO.MemoryStream
    $speaker.SetOutputToAudioStream($stream, $audioFormat)
    $cues = @()
    foreach ($segment in $item.segments) {
      $start = $stream.Length / 32000.0
      $speaker.Speak([string]$segment)
      $cues += @{ text = [string]$segment; start = $start; end = $stream.Length / 32000.0 }
    }
    $speaker.SetOutputToNull()
    $pcm = $stream.ToArray()
    $wavePath = Join-Path $audioDir ($item.id + '.wav')
    $writer = New-Object System.IO.BinaryWriter([System.IO.File]::Create($wavePath))
    try {
      $writer.Write([Text.Encoding]::ASCII.GetBytes('RIFF')); $writer.Write([int](36 + $pcm.Length))
      $writer.Write([Text.Encoding]::ASCII.GetBytes('WAVEfmt ')); $writer.Write([int]16)
      $writer.Write([int16]1); $writer.Write([int16]1); $writer.Write([int]16000)
      $writer.Write([int]32000); $writer.Write([int16]2); $writer.Write([int16]16)
      $writer.Write([Text.Encoding]::ASCII.GetBytes('data')); $writer.Write([int]$pcm.Length); $writer.Write($pcm)
    } finally { $writer.Dispose(); $stream.Dispose() }
    $catalog += @{ id = $item.id; duration = $pcm.Length / 32000.0; cues = $cues }
    Write-Host ($item.id + ': ' + [Math]::Round($pcm.Length / 32000.0) + ' seconds')
  }
  $catalog | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $audioDir 'narration.json') -Encoding utf8
} finally { $speaker.Dispose() }
