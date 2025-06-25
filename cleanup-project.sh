#!/bin/bash

# Script de limpeza e organização do projeto CYPHER ORDI-FUTURE-V3
# Este script remove arquivos duplicados e organiza a estrutura

echo "🧹 Iniciando limpeza do projeto..."

# Criar diretório de backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Criando backup em $BACKUP_DIR..."

# Função para fazer backup de arquivos
backup_file() {
    local file=$1
    local backup_path="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_path"
    cp "$file" "$backup_path/"
    echo "  ✓ Backup: $file"
}

# 1. Limpar arquivos de backup e duplicados em src/app
echo ""
echo "🔍 Removendo arquivos duplicados em src/app..."

# Lista de arquivos para remover (depois de fazer backup)
FILES_TO_REMOVE=(
    "src/app/page-backup.tsx"
    "src/app/page-complex.tsx"
    "src/app/page-current.tsx"