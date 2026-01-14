#!/bin/bash
# ============================================
# JUSTWEDO 品牌更名脚本 (Bash)
# HangHand → JUSTWEDO
# ============================================
# 用法:
#   ./rebrand.sh          # 执行替换（带备份）
#   ./rebrand.sh --no-backup  # 不创建备份
#   ./rebrand.sh --dry-run    # 模拟运行
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# 配置
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backup_hanghand_$(date +%Y%m%d_%H%M%S)"
CREATE_BACKUP=true
DRY_RUN=false

# 解析参数
for arg in "$@"; do
    case $arg in
        --no-backup)
            CREATE_BACKUP=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            ;;
    esac
done

# 统计变量
FILES_MODIFIED=0
TOTAL_REPLACEMENTS=0

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  渥帮 品牌更名: HangHand → JUSTWEDO${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[模拟模式] 不会实际修改文件${NC}"
    echo ""
fi

# 创建备份
if [ "$CREATE_BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}[1/5] 创建备份...${NC}"

    mkdir -p "$BACKUP_DIR"

    for item in src docs supabase public package.json README.md .env.example; do
        if [ -e "$PROJECT_ROOT/$item" ]; then
            echo -e "${GRAY}  备份: $item${NC}"
            cp -r "$PROJECT_ROOT/$item" "$BACKUP_DIR/"
        fi
    done

    echo -e "${GREEN}  ✓ 备份完成: $BACKUP_DIR${NC}"
    echo ""
fi

# 扫描文件
echo -e "${GREEN}[2/5] 扫描文件...${NC}"

# 查找需要处理的文件
FILE_LIST=$(find "$PROJECT_ROOT" -type f \
    \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \
    -o -name "*.md" -o -name "*.json" -o -name "*.html" \
    -o -name "*.css" -o -name "*.txt" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/.next/*" \
    ! -path "*/backup_*/*")

FILE_COUNT=$(echo "$FILE_LIST" | wc -l)
echo -e "${GRAY}  找到 $FILE_COUNT 个文件${NC}"
echo ""

# 执行替换
echo -e "${GREEN}[3/5] 执行替换...${NC}"

while IFS= read -r file; do
    if [ ! -f "$file" ]; then
        continue
    fi

    MODIFIED=false

    # 执行所有替换规则
    if grep -q "HangHand\|hanghand\|Hang Hand\|gigneighbor\|GigNeighbor\|vite_react_shadcn_ts" "$file" 2>/dev/null; then
        RELATIVE_PATH="${file#$PROJECT_ROOT/}"

        if [ "$DRY_RUN" = false ]; then
            # 品牌名称替换
            sed -i.bak 's/HangHand/JUSTWEDO/g' "$file"
            sed -i.bak 's/hanghand/justwedo/g' "$file"
            sed -i.bak 's/Hang Hand/JUST WE DO/g' "$file"

            # 域名替换
            sed -i.bak 's/hanghand\.com/justwedo.com/g' "$file"
            sed -i.bak 's/gigneighbor\.com/justwedo.com/g' "$file"
            sed -i.bak 's/gigneighbor\.ca/justwedo.com/g' "$file"
            sed -i.bak 's/GigNeighbor/JUSTWEDO/g' "$file"

            # 日志标记
            sed -i.bak 's/\[HangHand\]/[JWD]/g' "$file"
            sed -i.bak 's/\[渥帮\]/[JWD]/g' "$file"

            # 项目名称
            sed -i.bak 's/"name": "vite_react_shadcn_ts"/"name": "justwedo"/g' "$file"
            sed -i.bak 's/vite_react_shadcn_ts/justwedo/g' "$file"

            # 删除备份文件
            rm -f "${file}.bak"
        fi

        echo -e "${YELLOW}  修改: $RELATIVE_PATH${NC}"
        FILES_MODIFIED=$((FILES_MODIFIED + 1))
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + 1))
    fi
done <<< "$FILE_LIST"

echo ""
echo -e "${GREEN}  ✓ 完成 $FILES_MODIFIED 个文件修改${NC}"
echo -e "${GREEN}  ✓ 总计 $TOTAL_REPLACEMENTS 处替换${NC}"
echo ""

# 需要手动检查的文件
echo -e "${GREEN}[4/5] 需要手动检查的文件...${NC}"

declare -a MANUAL_FILES=(
    "package.json|项目名称、描述"
    "public/index.html|页面标题"
    "README.md|项目说明"
    ".env.example|注释说明"
    "src/pages/About.tsx|关于页面内容"
    "supabase/functions/stripe-webhook/index.ts|SMS消息内容(第188行)"
)

for item in "${MANUAL_FILES[@]}"; do
    IFS='|' read -r file reason <<< "$item"
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "${CYAN}  📝 $file${NC}"
        echo -e "${GRAY}     原因: $reason${NC}"
    fi
done

echo ""

# 生成报告
echo -e "${GREEN}[5/5] 生成验证报告...${NC}"

REPORT_PATH="$PROJECT_ROOT/rebrand_report.txt"

cat > "$REPORT_PATH" << EOF
============================================
渥帮 JUSTWEDO 品牌更名报告
生成时间: $(date '+%Y-%m-%d %H:%M:%S')
============================================

统计信息:
- 扫描文件数: $FILE_COUNT
- 修改文件数: $FILES_MODIFIED
- 总替换次数: $TOTAL_REPLACEMENTS
$([ "$CREATE_BACKUP" = true ] && echo "- 备份位置: $BACKUP_DIR" || echo "- 未创建备份")

替换规则:
- HangHand → JUSTWEDO (品牌名称)
- hanghand → justwedo (小写品牌名)
- Hang Hand → JUST WE DO (分开拼写)
- hanghand.com → justwedo.com (域名)
- gigneighbor.com → justwedo.com (旧域名)
- GigNeighbor → JUSTWEDO (旧品牌名)
- [HangHand] → [JWD] (日志标记)
- vite_react_shadcn_ts → justwedo (项目名)

需要手动检查的文件:
- package.json: 项目名称、描述
- public/index.html: 页面标题
- README.md: 项目说明
- .env.example: 注释说明
- src/pages/About.tsx: 关于页面内容
- supabase/functions/stripe-webhook/index.ts: SMS消息内容

下一步操作:
1. 使用 Git 查看变更: git diff
2. 手动检查上述列出的关键文件
3. 运行测试: npm run build
4. 提交变更: git add . && git commit -m "rebrand: HangHand → JUSTWEDO"

如需回滚:
$([ "$CREATE_BACKUP" = true ] && echo "使用备份目录恢复: $BACKUP_DIR" || echo "使用 Git 恢复: git checkout .")

============================================
EOF

echo -e "${GREEN}  ✓ 报告已保存: rebrand_report.txt${NC}"
echo ""

cat "$REPORT_PATH"

# 总结
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}  品牌更名完成！${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "${NC}  1. 查看变更: ${GREEN}git diff${NC}"
echo -e "${NC}  2. 测试构建: ${GREEN}npm run build${NC}"
echo -e "${NC}  3. 手动更新上述文件中的关键内容${NC}"
echo -e "${NC}  4. 提交变更: ${GREEN}git add . && git commit -m 'rebrand: HangHand → JUSTWEDO'${NC}"
echo ""

if [ "$CREATE_BACKUP" = true ]; then
    echo -e "${CYAN}备份位置: $BACKUP_DIR${NC}"
    echo ""
fi
