#!/bin/bash

echo "🔧 Corrigindo erros de Logger automaticamente..."

# Arquivos com erros de logger
FILES=(
  "src/agents/AgentCoordinator.ts"
  "src/agents/AgentSystemBootstrap.ts"
  "src/api/middleware/adminAuth.ts"
  "src/api/middleware/rateLimit.ts"
  "src/api/middleware/validation.ts"
  "src/api/routes/index.ts"
  "src/api/routes/ml.routes.ts"
)

# Backup dos arquivos
echo "📁 Criando backup dos arquivos..."
for file in "${FILES[@]}"; do
  cp "$file" "$file.backup" 2>/dev/null || true
done

# Corrigir padrão: logger.error(error) -> logger.error(error.message)
echo "🔄 Aplicando correções..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Corrigir logger.error com Error object
    sed -i '' 's/logger\.error(error)/logger.error(error.message || String(error))/g' "$file" 2>/dev/null || true
    sed -i '' 's/logger\.error(error as Error)/logger.error((error as Error).message)/g' "$file" 2>/dev/null || true
    sed -i '' 's/logger\.error(e)/logger.error(e.message || String(e))/g' "$file" 2>/dev/null || true
    
    # Corrigir logger.error com contexto
    sed -i '' 's/logger\.error(error, /logger.error((error instanceof Error ? error.message : String(error)), /g' "$file" 2>/dev/null || true
    
    echo "✅ Corrigido: $file"
  fi
done

echo "✨ Correções aplicadas com sucesso!"