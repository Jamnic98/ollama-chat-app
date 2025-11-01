import http from 'node:http';
import { app } from 'electron';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';

import { versionEndpoint } from 'shared/constants';

let ollamaProcess: ChildProcessWithoutNullStreams | null = null;

const isOllamaRunning = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const req = http.get(versionEndpoint, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

export const startOllama = async () => {
  if (ollamaProcess) return;

  const alreadyRunning = await isOllamaRunning();
  if (alreadyRunning) {
    console.log('[Ollama] already running, skipping spawn');
    return;
  }

  console.log('[Ollama] starting new process...');
  const ollamaExecutable = 'ollama';

  ollamaProcess = spawn(ollamaExecutable, ['serve'], {
    cwd: process.cwd(),
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  ollamaProcess.stdout.on('data', (data) => {
    console.log(`[Ollama]: ${data.toString().trim()}`);
  });

  ollamaProcess.stderr.on('data', (data) => {
    console.error(`[Ollama ERROR]: ${data.toString().trim()}`);
  });

  ollamaProcess.on('close', (code) => {
    console.log(`[Ollama] process exited with code ${code}`);
    ollamaProcess = null;
  });
}

export const stopOllama = () => {
  if (!ollamaProcess) return;

  console.log('[Ollama] stopping process...');
  ollamaProcess.kill('SIGTERM');
  ollamaProcess = null;
}

app.on('before-quit', () => {
  stopOllama();
});
