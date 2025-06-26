#!/bin/bash

echo "🧹 Limpando duplicações de 'export const dynamic'..."

# Lista de arquivos para limpar
FILES=(
  "src/app/api/hyperliquid/route.ts"
  "src/app/api/fees/addresses/route.ts"
  "src/app/api/arbitrage/real-opportunities/route.ts"
  "src/app/api/runes/market-data/route.ts"
  "src/app/api/live-activity/route.ts"
  "src/app/api/fees/report/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Remove duplicações deixando apenas a primeira ocorrência após os imports
    temp_file="${file}.temp"
    
    # Conta quantas vezes aparece
    count=$(grep -c "export const dynamic = 'force-dynamic'" "$file")
    
    if [ "$count" -gt 1 ]; then
      echo "Limpando $file (encontradas $count ocorrências)..."
      
      # Remove todas menos a primeira
      awk '/export const dynamic = .force-dynamic./ && !seen {seen=1; print; next} /export const dynamic = .force-dynamic./ {next} {print}' "$file" > "$temp_file"
      mv "$temp_file" "$file"
      
      echo "✅ Corrigido: $file"
    fi
  fi
done

echo "✅ Limpeza concluída!"