# ============================================
# JUSTWEDO 品牌更名脚本 (PowerShell)
# HangHand → JUSTWEDO
# ============================================
# 用法: .\rebrand.ps1
# 或带备份: .\rebrand.ps1 -Backup
# ============================================

param(
    [switch]$Backup = $true,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# 配置
$projectRoot = $PSScriptRoot
$backupDir = Join-Path $projectRoot "backup_hanghand_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 替换规则
$replacements = @(
    # 品牌名称
    @{From = 'HangHand'; To = 'JUSTWEDO'; Description = '品牌名称'},
    @{From = 'hanghand'; To = 'justwedo'; Description = '小写品牌名'},
    @{From = 'Hang Hand'; To = 'JUST WE DO'; Description = '分开拼写'},

    # 域名相关
    @{From = 'hanghand.com'; To = 'justwedo.com'; Description = '域名'},
    @{From = 'gigneighbor.com'; To = 'justwedo.com'; Description = '旧域名'},
    @{From = 'gigneighbor.ca'; To = 'justwedo.com'; Description = 'CA域名'},
    @{From = 'GigNeighbor'; To = 'JUSTWEDO'; Description = 'GigNeighbor品牌名'},

    # 日志标记
    @{From = '\[HangHand\]'; To = '[JWD]'; Description = '日志标记'},
    @{From = '\[渥帮\]'; To = '[JWD]'; Description = '中文日志标记'},

    # 项目名称
    @{From = '"name": "vite_react_shadcn_ts"'; To = '"name": "justwedo"'; Description = 'package.json项目名'},
    @{From = 'vite_react_shadcn_ts'; To = 'justwedo'; Description = '项目标识符'}
)

# 需要处理的文件模式
$filePatterns = @(
    '*.tsx',
    '*.ts',
    '*.js',
    '*.jsx',
    '*.md',
    '*.json',
    '*.html',
    '*.css',
    '*.txt'
)

# 排除的目录
$excludeDirs = @(
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'backup_*'
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  渥帮 品牌更名: HangHand → JUSTWEDO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[模拟模式] 不会实际修改文件" -ForegroundColor Yellow
    Write-Host ""
}

# 创建备份
if ($Backup -and -not $DryRun) {
    Write-Host "[1/5] 创建备份..." -ForegroundColor Green

    $itemsToBackup = @(
        "src",
        "docs",
        "supabase",
        "public",
        "package.json",
        "README.md",
        ".env.example"
    )

    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

    foreach ($item in $itemsToBackup) {
        $source = Join-Path $projectRoot $item
        if (Test-Path $source) {
            $dest = Join-Path $backupDir $item
            Write-Host "  备份: $item" -ForegroundColor Gray
            Copy-Item -Path $source -Destination $dest -Recurse -Force
        }
    }

    Write-Host "  ✓ 备份完成: $backupDir" -ForegroundColor Green
    Write-Host ""
}

# 收集需要处理的文件
Write-Host "[2/5] 扫描文件..." -ForegroundColor Green

$allFiles = @()
foreach ($pattern in $filePatterns) {
    $files = Get-ChildItem -Path $projectRoot -Filter $pattern -Recurse -File | Where-Object {
        $filePath = $_.FullName
        $shouldExclude = $false
        foreach ($excludeDir in $excludeDirs) {
            if ($filePath -like "*\$excludeDir\*") {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    }
    $allFiles += $files
}

$allFiles = $allFiles | Select-Object -Unique
Write-Host "  找到 $($allFiles.Count) 个文件" -ForegroundColor Gray
Write-Host ""

# 执行替换
Write-Host "[3/5] 执行替换..." -ForegroundColor Green

$stats = @{
    FilesModified = 0
    TotalReplacements = 0
}

foreach ($file in $allFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $fileModified = $false

        foreach ($rule in $replacements) {
            if ($content -match [regex]::Escape($rule.From)) {
                $content = $content -replace [regex]::Escape($rule.From), $rule.To
                $fileModified = $true
                $stats.TotalReplacements++
            }
        }

        if ($fileModified) {
            $relativePath = $file.FullName.Replace($projectRoot, "").TrimStart('\')
            Write-Host "  修改: $relativePath" -ForegroundColor Yellow

            if (-not $DryRun) {
                Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            }

            $stats.FilesModified++
        }
    }
    catch {
        Write-Host "  ⚠ 跳过: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  ✓ 完成 $($stats.FilesModified) 个文件修改" -ForegroundColor Green
Write-Host "  ✓ 总计 $($stats.TotalReplacements) 处替换" -ForegroundColor Green
Write-Host ""

# 特殊文件手动处理提示
Write-Host "[4/5] 需要手动检查的文件..." -ForegroundColor Green

$manualCheckFiles = @(
    @{File = "package.json"; Reason = "项目名称、描述"},
    @{File = "public/index.html"; Reason = "页面标题"},
    @{File = "README.md"; Reason = "项目说明"},
    @{File = ".env.example"; Reason = "注释说明"},
    @{File = "src/pages/About.tsx"; Reason = "关于页面内容"},
    @{File = "supabase/functions/stripe-webhook/index.ts"; Reason = "SMS消息内容(第188行)"}
)

foreach ($item in $manualCheckFiles) {
    $fullPath = Join-Path $projectRoot $item.File
    if (Test-Path $fullPath) {
        Write-Host "  📝 $($item.File)" -ForegroundColor Cyan
        Write-Host "     原因: $($item.Reason)" -ForegroundColor Gray
    }
}

Write-Host ""

# 生成验证报告
Write-Host "[5/5] 生成验证报告..." -ForegroundColor Green

$reportPath = Join-Path $projectRoot "rebrand_report.txt"
$report = @"
============================================
渥帮 JUSTWEDO 品牌更名报告
生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
============================================

统计信息:
- 扫描文件数: $($allFiles.Count)
- 修改文件数: $($stats.FilesModified)
- 总替换次数: $($stats.TotalReplacements)
$(if ($Backup) { "- 备份位置: $backupDir" } else { "- 未创建备份" })

替换规则:
$($replacements | ForEach-Object { "- $($_.From) → $($_.To) ($($_.Description))" } | Out-String)

需要手动检查的文件:
$($manualCheckFiles | ForEach-Object { "- $($_.File): $($_.Reason)" } | Out-String)

下一步操作:
1. 使用 Git 查看变更: git diff
2. 手动检查上述列出的关键文件
3. 运行测试: npm run build
4. 提交变更: git add . && git commit -m "rebrand: HangHand → JUSTWEDO"

如需回滚:
$(if ($Backup) { "使用备份目录恢复: $backupDir" } else { "使用 Git 恢复: git checkout ." })

============================================
"@

if (-not $DryRun) {
    Set-Content -Path $reportPath -Value $report -Encoding UTF8
    Write-Host "  ✓ 报告已保存: rebrand_report.txt" -ForegroundColor Green
}

Write-Host ""
Write-Host $report
Write-Host ""

# 总结
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  品牌更名完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 查看变更: git diff" -ForegroundColor White
Write-Host "  2. 测试构建: npm run build" -ForegroundColor White
Write-Host "  3. 手动更新上述文件中的关键内容" -ForegroundColor White
Write-Host "  4. 提交变更: git add . && git commit -m 'rebrand: HangHand → JUSTWEDO'" -ForegroundColor White
Write-Host ""

if ($Backup) {
    Write-Host "备份位置: $backupDir" -ForegroundColor Cyan
    Write-Host ""
}
