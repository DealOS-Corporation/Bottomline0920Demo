// ============================================================
//  Generic wrappers to spawn an engine script and parse the single
//  JSON line it prints on stdout. Used by API routes that need real
//  computation (classification, ROI recalculation, etc.) instead of
//  a Node/TS reimplementation.
// ============================================================
import { spawn } from 'child_process';
import path from 'path';

const ENGINE_DIR = path.join(process.cwd(), 'engine');

function run<T>(command: string, args: string[], label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ENGINE_DIR });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => reject(new Error(`Could not start ${label}: ${err.message}`)));
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${label} exited with code ${code}`));
        return;
      }
      // Progress goes to stderr, but be tolerant: take the last JSON line.
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).pop() ?? '';
      try {
        resolve(JSON.parse(line));
      } catch {
        reject(new Error(`Engine returned non-JSON output: ${stdout.slice(0, 500)}`));
      }
    });
  });
}

/** Runs `python <scriptRelPath> <args...>` and parses stdout as JSON. Throws on non-zero exit. */
export function runPythonEngine<T = unknown>(scriptRelPath: string, args: string[]): Promise<T> {
  return run<T>('python', [path.join(ENGINE_DIR, scriptRelPath), ...args], 'python');
}

/**
 * Runs a PowerShell engine step. Excel/PowerPoint automation has to go through
 * COM, which is only reachable from PowerShell on this machine.
 */
export function runPowerShellEngine<T = unknown>(
  scriptRelPath: string,
  args: string[],
): Promise<T> {
  return run<T>(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ENGINE_DIR, scriptRelPath), ...args],
    'powershell',
  );
}
