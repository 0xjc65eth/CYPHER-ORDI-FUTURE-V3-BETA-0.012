#!/usr/bin/env node

// Stable server startup script with crash prevention
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CYPHER ORDI FUTURE V3 with enhanced stability...\n');

// Enhanced process options to prevent crashes
const nodeOptions = [
  '--max-old-space-size=4096',  // Increase memory limit
  '--max-http-header-size=32768', // Increase header size limit
];

// Environment variables for stability
const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions.join(' '),
  NODE_ENV: 'development',
  NEXT_TELEMETRY_DISABLED: '1',  // Disable telemetry
  // Disable automatic restarts from file changes that might cause instability
  WATCHPACK_POLLING: 'true',
  CHOKIDAR_USEPOLLING: 'true',
  CHOKIDAR_INTERVAL: '2000',
};

let restartCount = 0;
const maxRestarts = 5;

function startServer() {
  console.log(`\n📡 Starting server attempt ${restartCount + 1}/${maxRestarts}...`);
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    env,
    stdio: 'pipe',
    shell: true
  });

  let serverReady = false;
  let lastOutput = Date.now();

  // Handle stdout
  child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    lastOutput = Date.now();
    
    // Server is ready when we see this message
    if (output.includes('Ready in') || output.includes('Local:')) {
      serverReady = true;
      console.log('✅ Server is ready and stable!');
      console.log('🌐 Access: http://localhost:4444');
      console.log('📊 Health check: http://localhost:4444/api/health\n');
    }
  });

  // Handle stderr
  child.stderr.on('data', (data) => {
    const error = data.toString();
    lastOutput = Date.now();
    
    // Filter out common warnings that don't indicate crashes
    if (!error.includes('ExperimentalWarning') && 
        !error.includes('DeprecationWarning') &&
        !error.includes('MaxListenersExceededWarning')) {
      console.error('🔴 Error:', error);
    }
  });

  // Handle process exit
  child.on('exit', (code, signal) => {
    console.log(`\n💥 Server process exited with code ${code}, signal ${signal}`);
    
    if (serverReady && restartCount < maxRestarts) {
      restartCount++;
      console.log(`🔄 Restarting server in 3 seconds...`);
      setTimeout(startServer, 3000);
    } else if (restartCount >= maxRestarts) {
      console.error('❌ Maximum restart attempts reached. Please check for underlying issues.');
      process.exit(1);
    } else {
      console.error('❌ Server failed to start properly.');
      process.exit(1);
    }
  });

  // Handle process errors
  child.on('error', (error) => {
    console.error('💥 Failed to start server process:', error);
    process.exit(1);
  });

  // Monitor for hanging process (no output for 30 seconds after being ready)
  const monitor = setInterval(() => {
    if (serverReady && Date.now() - lastOutput > 30000) {
      console.log('⚠️ Server appears to be hanging, restarting...');
      child.kill('SIGTERM');
      clearInterval(monitor);
      
      // Force kill after 5 seconds if it doesn't respond
      setTimeout(() => {
        child.kill('SIGKILL');
      }, 5000);
    }
  }, 10000);

  // Cleanup interval when process exits
  child.on('exit', () => {
    clearInterval(monitor);
  });

  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    clearInterval(monitor);
    child.kill('SIGTERM');
    
    setTimeout(() => {
      child.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    clearInterval(monitor);
    child.kill('SIGTERM');
    
    setTimeout(() => {
      child.kill('SIGKILL');
      process.exit(0);
    }, 5000);
  });
}

// Start the server
startServer();