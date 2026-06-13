import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import type { Platform } from '../../src/core/platforms.js';
import {
  buildNpmUpdateArgs,
  detectCometPackageScope,
  detectInstalledCometLanguage,
  detectInstalledCometTargets,
  formatNpmUpdateCommand,
  formatSkillUpdateCommand,
  updateCommand,
} from '../../src/commands/update.js';

// Mock the interactive select prompt so tests don't hang on CI (no TTY).
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn().mockResolvedValue(false),
}));

const claudePlatform: Platform = {
  id: 'claude',
  name: 'Claude Code',
  skillsDir: '.claude',
  openspecToolId: 'claude',
};

describe('update command helpers', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `specdrive-update-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('detects Chinese installed specdrive skills from existing skill content', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\n当用户提出需求时，先澄清目标再执行。',
      'utf-8',
    );

    await expect(detectInstalledCometLanguage(tmpDir, claudePlatform)).resolves.toBe('zh');
  });

  it('detects English installed specdrive skills from existing skill content', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\nUse this skill when starting a new change.',
      'utf-8',
    );

    await expect(detectInstalledCometLanguage(tmpDir, claudePlatform)).resolves.toBe('en');
  });

  it('still detects legacy comet skill directories for migration', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'comet'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'comet', 'SKILL.md'),
      '# Comet\n\nUse this skill when starting a new change.',
      'utf-8',
    );

    await expect(detectInstalledCometLanguage(tmpDir, claudePlatform)).resolves.toBe('en');
    const targets = await detectInstalledCometTargets(tmpDir, { scopes: ['project'] });
    expect(targets.map((t) => `${t.scope}:${t.platform.id}:${t.language}`)).toEqual([
      'project:claude:en',
    ]);
  });

  it('defaults installed specdrive language to English when the skills directory is missing', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

    await expect(detectInstalledCometLanguage(tmpDir, claudePlatform)).resolves.toBe('en');
  });

  it('finds only scopes and platforms that already have specdrive skills installed', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const globalDir = path.join(tmpDir, 'home');

    await fs.mkdir(path.join(projectDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\nUse this skill.',
      'utf-8',
    );

    await fs.mkdir(path.join(projectDir, '.cursor'), { recursive: true });

    await fs.mkdir(path.join(globalDir, '.codex', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(globalDir, '.codex', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\n当用户提出需求时使用这个技能。',
      'utf-8',
    );

    const targets = await detectInstalledCometTargets(projectDir, {
      globalBaseDir: globalDir,
    });

    expect(targets.map((t) => `${t.scope}:${t.platform.id}:${t.language}`)).toEqual([
      'project:claude:en',
      'global:codex:zh',
    ]);
  });

  it('ignores platform directories that do not contain a skills directory', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(path.join(projectDir, '.claude'), { recursive: true });

    await expect(detectInstalledCometTargets(projectDir, { scopes: ['project'] })).resolves.toEqual(
      [],
    );
  });

  it('respects explicit scope filtering when detecting installed targets', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const globalDir = path.join(tmpDir, 'home');

    await fs.mkdir(path.join(projectDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive',
    );
    await fs.mkdir(path.join(globalDir, '.codex', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(globalDir, '.codex', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive',
    );

    const targets = await detectInstalledCometTargets(projectDir, {
      globalBaseDir: globalDir,
      scopes: ['global'],
    });

    expect(targets.map((t) => `${t.scope}:${t.platform.id}`)).toEqual(['global:codex']);
  });

  it('detects project package scope from local node_modules install path', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const packageRoot = path.join(projectDir, 'node_modules', '@hottaiger', 'specdrive');

    await expect(detectCometPackageScope(projectDir, packageRoot)).resolves.toBe('project');
  });

  it('detects project package scope from package.json dependencies', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(projectDir, { recursive: true });
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ devDependencies: { '@hottaiger/specdrive': '^0.2.4' } }),
      'utf-8',
    );

    await expect(detectCometPackageScope(projectDir, tmpDir)).resolves.toBe('project');
  });

  it('falls back to global package scope when no project install is found', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(projectDir, { recursive: true });

    await expect(detectCometPackageScope(projectDir, tmpDir)).resolves.toBe('global');
  });

  it('builds npm update args preserving package install scope', () => {
    expect(buildNpmUpdateArgs('global')).toEqual(['install', '-g', '@hottaiger/specdrive@latest']);
    expect(buildNpmUpdateArgs('project')).toEqual(['install', '@hottaiger/specdrive@latest']);
  });

  it('formats the npm update command for friendly console output', () => {
    expect(formatNpmUpdateCommand('global')).toBe('npm install -g @hottaiger/specdrive@latest');
    expect(formatNpmUpdateCommand('project')).toBe('npm install @hottaiger/specdrive@latest');
  });

  it('formats the skill update command with scope, platform, and language source', () => {
    expect(formatSkillUpdateCommand('project', claudePlatform, 'skills-zh')).toBe(
      'copy assets/skills-zh -> .claude/skills/ (project)',
    );
    expect(formatSkillUpdateCommand('global', claudePlatform, 'skills')).toBe(
      'copy assets/skills -> ~/.claude/skills/ (global)',
    );
  });

  it('prints the skill update command when updating installed skills', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\n当用户提出需求时使用这个技能。',
      'utf-8',
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let output = '';
    try {
      await updateCommand(tmpDir, { skipNpm: true });
      output = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    expect(output).toContain('$ copy assets/skills-zh -> .claude/skills/ (project)');
  });

  it('prints structured JSON when requested', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'specdrive'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'specdrive', 'SKILL.md'),
      '# SpecDrive\n\nUse this skill.',
      'utf-8',
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      await updateCommand(tmpDir, { json: true, skipNpm: true });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const result = JSON.parse(json);
    expect(result.npm.scope).toBe('skipped');
    expect(result.skills.totalCopied).toBeGreaterThan(0);
    expect(result.skills.targets[0]).toMatchObject({
      scope: 'project',
      platform: 'claude',
      language: 'en',
      source: 'skills',
    });
  });
});
