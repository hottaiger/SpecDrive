import { execFileSync } from 'child_process';
import { isCommandAvailable, getNpmExecutable } from './openspec.js';
import { printCommandErrorDetails } from './command-error.js';

import type { InstallScope } from './types.js';

const GITNEXUS_SUPPORTED_TARGETS: Record<string, string> = {
  claude: 'claude',
  cursor: 'cursor',
  codex: 'codex',
  opencode: 'opencode',
  gemini: 'gemini',
  kiro: 'kiro',
  antigravity: 'antigravity',
  windsurf: 'windsurf',
};

function filterSupportedPlatforms(platformIds: string[]): {
  supported: string[];
  unsupported: string[];
} {
  const supported: string[] = [];
  const unsupported: string[] = [];

  for (const id of platformIds) {
    if (GITNEXUS_SUPPORTED_TARGETS[id]) {
      supported.push(GITNEXUS_SUPPORTED_TARGETS[id]);
    } else {
      unsupported.push(id);
    }
  }

  return { supported, unsupported };
}

async function ensureGitnexusCli(projectPath: string): Promise<boolean> {
  if (isCommandAvailable('gitnexus')) {
    return true;
  }

  console.log('    Installing GitNexus CLI...');
  try {
    execFileSync(getNpmExecutable(), ['install', '-g', 'gitnexus'], {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 180_000,
      shell: process.platform === 'win32',
    });
    return isCommandAvailable('gitnexus');
  } catch (error) {
    console.error(`    Failed to install GitNexus CLI: ${(error as Error).message}`);
    printCommandErrorDetails(error);
    return false;
  }
}

async function installGitnexus(
  projectPath: string,
  platformIds: string[],
  _scope: InstallScope,
): Promise<'installed' | 'failed' | 'skipped'> {
  const { supported, unsupported } = filterSupportedPlatforms(platformIds);

  if (supported.length === 0) {
    if (unsupported.length > 0) {
      console.log(
        `    GitNexus: no supported platforms among selected (${unsupported.join(', ')}). Skipping.`,
      );
    }
    return 'skipped';
  }

  if (unsupported.length > 0) {
    console.log(`    GitNexus: skipping unsupported platforms: ${unsupported.join(', ')}`);
  }

  const cliReady = await ensureGitnexusCli(projectPath);
  if (!cliReady) {
    console.error('    GitNexus CLI not available. Install manually: npm install -g gitnexus');
    return 'failed';
  }

  try {
    console.log(`    Running: gitnexus analyze --skip-agents-md --skip-skills`);
    execFileSync('gitnexus', ['analyze', '--skip-agents-md', '--skip-skills'], {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 300_000,
      shell: process.platform === 'win32',
    });
  } catch (error) {
    console.error(`    GitNexus analyze failed: ${(error as Error).message}`);
    printCommandErrorDetails(error);
    return 'failed';
  }

  return 'installed';
}

export { installGitnexus, filterSupportedPlatforms, GITNEXUS_SUPPORTED_TARGETS };
