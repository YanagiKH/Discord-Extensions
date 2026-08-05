import { app, shell } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PluginStoreRecord } from '../shared/types';

const WORKSPACE_NAME = 'Discord Extensions';

export function getWorkspaceRoot(): string {
  return path.join(app.getPath('userData'), WORKSPACE_NAME);
}

export function getPluginsRoot(): string {
  return path.join(getWorkspaceRoot(), 'plugins');
}

export function getModsRoot(): string {
  return path.join(getWorkspaceRoot(), 'mods');
}

export function getStateFilePath(): string {
  return path.join(getWorkspaceRoot(), 'state.json');
}

export async function ensureWorkspace(): Promise<void> {
  await Promise.all([
    fs.mkdir(getPluginsRoot(), { recursive: true }),
    fs.mkdir(getModsRoot(), { recursive: true })
  ]);
}

export async function readPluginStore(): Promise<Record<string, PluginStoreRecord>> {
  try {
    const raw = await fs.readFile(getStateFilePath(), 'utf8');
    const parsed = JSON.parse(raw) as Record<string, PluginStoreRecord>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export async function writePluginStore(store: Record<string, PluginStoreRecord>): Promise<void> {
  await ensureWorkspace();
  await fs.writeFile(getStateFilePath(), JSON.stringify(store, null, 2), 'utf8');
}

export async function openWorkspaceFolder(): Promise<string> {
  const folder = getWorkspaceRoot();
  await shell.openPath(folder);
  return folder;
}

export async function openModsFolder(): Promise<string> {
  const folder = getModsRoot();
  await fs.mkdir(folder, { recursive: true });
  await shell.openPath(folder);
  return folder;
}
