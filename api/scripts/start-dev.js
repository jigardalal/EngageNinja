const { spawn } = require('node:child_process');
const { resolve, join } = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const bin = process.platform === 'win32'
  ? join(__dirname, '..', 'node_modules', '.bin', 'nest.cmd')
  : join(__dirname, '..', 'node_modules', '.bin', 'nest');

const child = spawn(bin, ['start', '--watch'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
