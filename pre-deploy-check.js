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