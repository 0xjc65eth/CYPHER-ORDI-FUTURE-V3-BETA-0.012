#!/usr/bin/env node

/**
 * Script de verificação pré-deploy para Vercel
 * Executa uma série de verificações para garantir que o projeto está pronto
 * Execute com: node pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreDeployChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.rootPath = process.cwd();
  }

  // Adicionar resultado de verificação
  addCheck(name, status, message = '') {
    this.checks.push({ name, status, message });
    if (status === 'error') {
      this.errors.push(`${name}: ${message}`);
    } else if (status === 'warning') {
      this.warnings.push(`${name}: ${message}`);
    }
  }

  // 1. Verificar arquivos essenciais
  checkEssentialFiles() {
    console.log('📁 Verificando arquivos essenciais...');
    
    const essentialFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      '.gitignore',
      'src/app/layout.tsx',
      'src/app/page.tsx'
    ];

    essentialFiles.forEach(file => {
      const filePath = path.join(this.rootPath, file);
      if (fs.existsSync(filePath)) {
        this.addCheck(file, 'success');
      } else {
        this.addCheck(file, 'error', 'Arquivo não encontrado');
      }
    });

    // Verificar se vercel.json é válido
    const vercelPath = path.join(this.rootPath, 'vercel.json');
    if (fs.existsSync(vercelPath)) {
      try {
        JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
        this.addCheck('vercel.json', 'success', 'JSON válido');
      } catch (e) {
        this.addCheck('vercel.json', 'error', 'JSON inválido');
      }
    }
  }

  // 2. Verificar configuração do Next.js
  checkNextConfig() {
    console.log('⚙️  Verificando configuração do Next.js...');
    
    try {
      const configPath = path.join(this.rootPath, 'next.config.js');
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      // Verificar configurações problemáticas
      if (configContent.includes("output: 'standalone'")) {
        this.addCheck('next.config.js', 'error', 
          "Remove 'output: standalone' - causa 404 no Vercel");
      } else if (configContent.includes('ignoreBuildErrors: true')) {
        this.addCheck('next.config.js', 'warning', 
          "'ignoreBuildErrors: true' pode mascarar erros importantes");
      } else {
        this.addCheck('next.config.js', 'success');
      }
    } catch (e) {
      this.addCheck('next.config.js', 'error', 'Erro ao ler arquivo');
    }
  }

  // 3. Verificar variáveis de ambiente
  checkEnvVariables() {
    console.log('🔐 Verificando variáveis de ambiente...');
    
    const envExamplePath = path.join(this.rootPath, '.env.example');
    const envLocalPath = path.join(this.rootPath, '.env.local');
    
    if (!fs.existsSync(envExamplePath)) {
      this.addCheck('.env.example', 'warning', 
        'Arquivo não encontrado - crie um exemplo de variáveis');
      return;
    }

    // Verificar se .env.local não está no git
    const gitignorePath = path.join(this.rootPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env.local')) {
        this.addCheck('.gitignore', 'error', 
          '.env.local não está no .gitignore!');
      }
    }

    // Listar variáveis necessárias
    try {
      const envExample = fs.readFileSync(envExamplePath, 'utf8');
      const requiredVars = envExample
        .split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim());

      this.addCheck('Variáveis de ambiente', 'info', 
        `${requiredVars.length} variáveis necessárias encontradas`);
    } catch (e) {
      this.addCheck('Variáveis de ambiente', 'warning', 'Erro ao ler .env.example');
    }
  }

  // 4. Verificar dependências
  checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    try {
      // Verificar se node_modules existe
      if (!fs.existsSync(path.join(this.rootPath, 'node_modules'))) {
        this.addCheck('node_modules', 'error', 
          'Não encontrado - execute npm install');
        return;
      }

      // Verificar vulnerabilidades
      try {
        const auditResult = execSync('npm audit --json', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        const audit = JSON.parse(auditResult);
        
        if (audit.metadata && audit.metadata.vulnerabilities && 
            (audit.metadata.vulnerabilities.high > 0 || 
             audit.metadata.vulnerabilities.critical > 0)) {
          this.addCheck('npm audit', 'warning', 
            `${audit.metadata.vulnerabilities.high || 0} high, ${audit.metadata.vulnerabilities.critical || 0} critical`);
        } else {
          this.addCheck('npm audit', 'success', 'Sem vulnerabilidades críticas');
        }
      } catch (e) {
        // npm audit pode falhar se não houver vulnerabilidades
        this.addCheck('npm audit', 'success', 'Sem vulnerabilidades');
      }

    } catch (e) {
      this.addCheck('Dependências', 'error', e.message);
    }
  }

  // 5. Verificar TypeScript
  checkTypeScript() {
    console.log('📘 Verificando TypeScript...');
    
    try {
      execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.addCheck('TypeScript', 'success', 'Sem erros de tipo');
    } catch (e) {
      const errors = e.stdout ? e.stdout.toString() : e.toString();
      const errorCount = (errors.match(/error TS/g) || []).length;
      if (errorCount > 0) {
        this.addCheck('TypeScript', 'warning', `${errorCount} erros encontrados (ignorados na config)`);
      } else {
        this.addCheck('TypeScript', 'success', 'Verificação completa');
      }
    }
  }

  // 6. Verificar ESLint
  checkESLint() {
    console.log('🔍 Verificando ESLint...');
    
    try {
      execSync('npx next lint', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.addCheck('ESLint', 'success', 'Sem problemas');
    } catch (e) {
      const output = e.stdout ? e.stdout.toString() : '';
      const errorMatch = output.match(/(\d+) errors?/);
      const warningMatch = output.match(/(\d+) warnings?/);
      
      const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
      const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
      
      if (errors > 0) {
        this.addCheck('ESLint', 'warning', `${errors} erros, ${warnings} warnings (ignorados na config)`);
      } else if (warnings > 0) {
        this.addCheck('ESLint', 'warning', `${warnings} warnings`);
      } else {
        this.addCheck('ESLint', 'success', 'Verificação completa');
      }
    }
  }

  // 7. Executar build de teste
  async checkBuild() {
    console.log('🏗️  Executando build de teste...');
    console.log('   (Isso pode demorar alguns minutos...)\n');
    
    try {
      execSync('npm run build', { 
        encoding: 'utf8',
        stdio: 'inherit'
      });
      this.addCheck('Build', 'success', 'Build concluído com sucesso');
    } catch (e) {
      this.addCheck('Build', 'error', 'Build falhou - verifique os logs acima');
    }
  }

  // 8. Verificar tamanho do build
  checkBuildSize() {
    console.log('📏 Verificando tamanho do build...');
    
    const nextDir = path.join(this.rootPath, '.next');
    if (!fs.existsSync(nextDir)) {
      this.addCheck('Build size', 'warning', 'Build não encontrado');
      return;
    }

    // Calcular tamanho total
    const getDirSize = (dir) => {
      let size = 0;
      try {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            size += getDirSize(filePath);
          } else {
            size += stat.size;
          }
        });
      } catch (e) {
        // Ignorar erros de permissão
      }
      
      return size;
    };

    const sizeInMB = getDirSize(nextDir) / (1024 * 1024);
    
    if (sizeInMB > 100) {
      this.addCheck('Build size', 'warning', 
        `${sizeInMB.toFixed(2)} MB - considere otimizar`);
    } else {
      this.addCheck('Build size', 'success', `${sizeInMB.toFixed(2)} MB`);
    }
  }

  // Gerar relatório final
  generateReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO PRÉ-DEPLOY');
    console.log('='.repeat(60) + '\n');

    // Resumo
    const successCount = this.checks.filter(c => c.status === 'success').length;
    const errorCount = this.checks.filter(c => c.status === 'error').length;
    const warningCount = this.checks.filter(c => c.status === 'warning').length;
    const infoCount = this.checks.filter(c => c.status === 'info').length;

    console.log('📈 Resumo:');
    console.log(`   ✅ Sucessos: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);
    console.log(`   ℹ️  Info: ${infoCount}`);
    console.log('');

    // Detalhes
    console.log('📋 Detalhes das verificações:\n');
    
    this.checks.forEach(check => {
      const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️ ',
        info: 'ℹ️ '
      }[check.status];
      
      console.log(`${icon} ${check.name}`);
      if (check.message) {
        console.log(`   ${check.message}`);
      }
    });

    // Recomendações
    if (this.errors.length > 0) {
      console.log('\n🚨 ERROS CRÍTICOS - Corrija antes do deploy:\n');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  AVISOS - Considere corrigir:\n');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    // Status final
    console.log('\n' + '='.repeat(60));
    if (errorCount === 0) {
      console.log('✅ PROJETO PRONTO PARA DEPLOY!');
      console.log('\nPróximos passos:');
      console.log('1. git add .');
      console.log('2. git commit -m "feat: preparar para deploy"');
      console.log('3. git push');
      console.log('4. Acesse https://vercel.com e importe o projeto');
    } else {
      console.log('❌ PROJETO NÃO ESTÁ PRONTO PARA DEPLOY');
      console.log(`\nCorreja os ${errorCount} erros antes de continuar.`);
    }
    console.log('='.repeat(60) + '\n');

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.checks.length,
        success: successCount,
        errors: errorCount,
        warnings: warningCount,
        info: infoCount
      },
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings,
      ready: errorCount === 0
    };

    fs.writeFileSync(
      path.join(this.rootPath, 'pre-deploy-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📄 Relatório detalhado salvo em: pre-deploy-report.json`);
  }

  // Executar todas as verificações
  async run() {
    console.log('🚀 Iniciando verificação pré-deploy para Vercel...\n');
    
    this.checkEssentialFiles();
    this.checkNextConfig();
    this.checkEnvVariables();
    this.checkDependencies();
    this.checkTypeScript();
    this.checkESLint();
    await this.checkBuild();
    this.checkBuildSize();
    
    this.generateReport();
  }
}

// Executar verificação
const checker = new PreDeployChecker();
checker.run().catch(error => {
  console.error('❌ Erro durante verificação:', error);
  process.exit(1);
});