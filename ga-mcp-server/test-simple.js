#!/usr/bin/env node

// Simple test to see what's being output
import { spawn } from 'child_process';

console.log('Starting server test...');

const proc = spawn('npx', ['tsx', 'src/ga-index.ts'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  env: process.env
});

let stdoutData = '';
let stderrData = '';

proc.stdout.on('data', (data) => {
  stdoutData += data.toString();
  console.log('STDOUT:', data.toString());
});

proc.stderr.on('data', (data) => {
  stderrData += data.toString();
  console.log('STDERR:', data.toString());
});

setTimeout(() => {
  console.log('\nTotal STDOUT output:');
  console.log(stdoutData);
  console.log('\nTotal STDERR output:');
  console.log(stderrData);
  proc.kill();
  process.exit(0);
}, 3000);