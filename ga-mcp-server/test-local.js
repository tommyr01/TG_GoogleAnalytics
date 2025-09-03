#!/usr/bin/env node

// Simple test script to run the GA MCP server locally
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run the MCP server
const serverProcess = spawn('node', [join(__dirname, 'src', 'ga-index.ts')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Send initialize request
setTimeout(() => {
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '1.0.0',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Send list tools request
setTimeout(() => {
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 2000);

// Keep process alive
process.stdin.resume();