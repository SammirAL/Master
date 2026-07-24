import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { PermissionDeniedError } from '@agency-os/shared';
import type { ConnectorCallContext, McpConnector, McpMethodSpec } from '../ports.js';

/**
 * Connecteur Filesystem RÉEL, borné au workspace du site
 * (`<baseDir>/data/sites/<site_id>/`). Défense en profondeur : le connecteur
 * revérifie que le chemin résolu reste dans le workspace (la garde de portée
 * `filesystem-path` l'a déjà validé en amont).
 */
export class FilesystemConnector implements McpConnector {
  readonly server = 'filesystem' as const;
  readonly methods: Record<string, McpMethodSpec> = {
    readFile: { capability: 'read', scopeGuards: ['filesystem-path'] },
    listDir: { capability: 'read', scopeGuards: ['filesystem-path'] },
    writeFile: { capability: 'stage', scopeGuards: ['filesystem-path'] },
    mkdir: { capability: 'stage', scopeGuards: ['filesystem-path'] },
  };

  constructor(private readonly baseDir: string = process.cwd()) {}

  async call(method: string, args: Record<string, unknown>, ctx: ConnectorCallContext): Promise<unknown> {
    const root = this.siteRoot(ctx.siteId);
    const target = this.safeResolve(root, String(args['path'] ?? ''));

    switch (method) {
      case 'readFile':
        return { path: args['path'], content: await readFile(target, 'utf8') };
      case 'listDir':
        return { path: args['path'], entries: await readdir(target) };
      case 'writeFile': {
        await mkdir(resolve(target, '..'), { recursive: true });
        await writeFile(target, String(args['content'] ?? ''), 'utf8');
        return { path: args['path'], written: true };
      }
      case 'mkdir':
        await mkdir(target, { recursive: true });
        return { path: args['path'], created: true };
      default:
        throw new Error(`Méthode Filesystem inconnue : ${method}`);
    }
  }

  private siteRoot(siteId: string | null | undefined): string {
    if (!siteId) {
      throw new PermissionDeniedError('Filesystem : aucun site en contexte.', {});
    }
    return resolve(this.baseDir, 'data', 'sites', siteId);
  }

  private safeResolve(root: string, path: string): string {
    const target = isAbsolute(path) ? path : join(root, path);
    const rel = relative(root, target);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      throw new PermissionDeniedError('Filesystem : chemin hors du workspace du site.', { path });
    }
    return target;
  }
}
