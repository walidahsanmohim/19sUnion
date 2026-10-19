# ============================================================
#  Restructure script — extracts inline CSS/JS from Index.html
#  into css/ + js/, and moves the backend into backend/.
#  Content of the extracted code is byte-identical (no edits).
# ============================================================
$ErrorActionPreference = 'Stop'
$root = "c:\Users\WH_Mohim\OneDrive\Desktop\VS-Code\19'sUnion"
$indexPath = Join-Path $root 'Index.html'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# ---------- 1. Create target folders ----------
foreach ($d in @('css', 'js', 'backend\apps-script')) {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $d) | Out-Null
}

# ---------- 2. Read Index.html (BOM-aware, content preserved) ----------
$script:text = [System.IO.File]::ReadAllText($indexPath)
if ($script:text.StartsWith([char]0xFEFF)) { $script:text = $script:text.Substring(1) }

# ---------- 3. Extract inline <style> block -> css/styles.css ----------
$open = $script:text.IndexOf('<style>')
if ($open -lt 0) { throw 'opening <style> not found' }
$close = $script:text.IndexOf('</style>')
if ($close -lt $open) { throw 'closing </style> not found' }
$cssInner = $script:text.Substring($open + 7, $close - $open - 7)
[System.IO.File]::WriteAllText((Join-Path $root 'css\styles.css'), $cssInner, $utf8NoBom)
$script:text = $script:text.Remove($open, $close + 9 - $open).Insert($open, '<link rel="stylesheet" href="css/styles.css">')

# ---------- 4. Extract inline <script> blocks -> js/ ----------
function Extract-Script([string]$needle, [string]$fileName) {
  $t = $script:text
  $pos = $t.IndexOf($needle)
  if ($pos -lt 0) { throw "needle not found: $needle" }
  $o = $t.LastIndexOf('<script>', $pos)
  if ($o -lt 0) { throw "no <script> open tag before: $needle" }
  $c = $t.IndexOf('</script>', $pos)
  if ($c -lt 0) { throw "no </script> close tag after: $needle" }
  $inner = $t.Substring($o + 8, $c - $o - 8)
  [System.IO.File]::WriteAllText((Join-Path $root $fileName), $inner, $utf8NoBom)
  $rel = $fileName -replace '\\', '/'
  $script:text = $t.Remove($o, $c + 9 - $o).Insert($o, '<script src="' + $rel + '"></script>')
}

Extract-Script "navigator.serviceWorker.register('sw.js')" 'js\sw-register.js'
Extract-Script 'window.themeInk' 'js\chart-theme.js'
Extract-Script 'Copy-to-clipboard for payment numbers' 'js\clipboard.js'
Extract-Script 'ACCURATE HIJRI (UMM AL-QURA) CALENDAR VIA INTL API' 'js\main.js'

# ---------- 5. Update stylesheet path ----------
$cnt = [regex]::Matches($script:text, [regex]::Escape('href="tailwind.css"')).Count
if ($cnt -ne 1) { throw "expected exactly 1 tailwind.css link, found $cnt" }
$script:text = $script:text.Replace('href="tailwind.css"', 'href="css/tailwind.css"')

# ---------- 6. CSP: allow same-origin scripts (needed for external js/ files) ----------
$cnt = [regex]::Matches($script:text, [regex]::Escape("script-src 'unsafe-inline'")).Count
if ($cnt -ne 1) { throw "expected exactly 1 CSP script-src, found $cnt" }
$script:text = $script:text.Replace("script-src 'unsafe-inline'", "script-src 'self' 'unsafe-inline'")

# ---------- 7. Write Index.html back (UTF-8 with BOM, CRLF untouched) ----------
[System.IO.File]::WriteAllText($indexPath, $script:text, [System.Text.UTF8Encoding]::new($true))

# ---------- 8. Move CSS files + backend code ----------
Move-Item -Force (Join-Path $root 'tailwind.css') (Join-Path $root 'css\tailwind.css')
Move-Item -Force (Join-Path $root 'input.css')     (Join-Path $root 'css\input.css')
Move-Item -Force (Join-Path $root 'apps-script\Code.gs') (Join-Path $root 'backend\apps-script\Code.gs')
if (-not (Get-ChildItem -Force (Join-Path $root 'apps-script'))) {
  [System.IO.Directory]::Delete((Join-Path $root 'apps-script'))
}

Write-Host 'RESTRUCTURE OK'
