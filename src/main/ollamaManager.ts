import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { app } from 'electron';

let ollamaProcess: ChildProcessWithoutNullStreams | null = null;

export function startOllama() {
  if (ollamaProcess) return; // Already running

  const ollamaExecutable = 'ollama'; // or full path if needed

  ollamaProcess = spawn(ollamaExecutable, ['serve'], {
    cwd: process.cwd(),
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  ollamaProcess.stdout.on('data', (data) => {
    console.log(`[Ollama]: ${data.toString()}`);
  });

  ollamaProcess.stderr.on('data', (data) => {
    console.error(`[Ollama ERROR]: ${data.toString()}`);
  });

  ollamaProcess.on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
    ollamaProcess = null;
  });
}

export function stopOllama() {
  if (!ollamaProcess) return;

  ollamaProcess.kill('SIGTERM');
  ollamaProcess = null;
}

app.on('before-quit', () => {
  stopOllama();
});
