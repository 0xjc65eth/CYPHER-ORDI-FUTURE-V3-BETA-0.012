const { spawn } = require('child_process');

console.log('🚀 Iniciando servidor de desenvolvimento...');

const server = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

server.on('close', (code) => {
  console.log(`🛑 Servidor parou com código: ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.kill('SIGINT');
  process.exit(0);
});