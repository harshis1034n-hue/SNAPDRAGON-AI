/**
 * Campus Orbit - Live Public Tunnel Helper
 * Spawns a real HTTPS public tunnel to share with hackathon judges/evaluators.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

console.log('='.repeat(65));
console.log('         CAMPUS ORBIT - PUBLIC HTTPS TUNNEL HELPER');
console.log('='.repeat(65));
console.log(`\n[*] Establishing secure public tunnel forwarding to http://127.0.0.1:${PORT}...`);
console.log('[*] Connecting to edge tunnel network...\n');

// Ensure Node directory is in PATH
const nodeDir = 'C:\\Program Files\\nodejs';
if (fs.existsSync(nodeDir)) {
  process.env.PATH = `${nodeDir};${process.env.PATH || ''}`;
}

const tunnelProcess = spawn('npx', ['-y', 'localtunnel', '--port', PORT], {
  shell: true,
  env: process.env,
  stdio: 'pipe'
});

tunnelProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('url is:')) {
    const url = output.split('url is:')[1]?.trim();
    console.log('\n' + '='.repeat(65));
    console.log('🎉 LIVE PUBLIC URL GENERATED:');
    console.log(`👉 ${url}`);
    console.log('Share this HTTPS link with judges, mentors, and teammates.');
    console.log('='.repeat(65) + '\n');
  }
});

tunnelProcess.stderr.on('data', (data) => {
  const err = data.toString();
  if (!err.includes('npm notice') && !err.includes('warn') && !err.includes('DeprecationWarning')) {
    console.log(`[Tunnel Info] ${err.trim()}`);
  }
});

tunnelProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`\nTunnel process ended (code ${code}). Alternative Python tunnel:`);
    console.log(`python scripts/start_tunnel.py`);
  }
});
