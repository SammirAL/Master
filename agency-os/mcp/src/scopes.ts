import { posix } from 'node:path';
import { PermissionDeniedError, McpAllowlistViolationError } from '@agency-os/shared';
import type { ScopeGuard, ScopeGuardInput } from './ports.js';

/**
 * Portées fines : au-delà de la capacité (RO/S/P/RW), certaines méthodes
 * imposent des contraintes sur leurs arguments. cf. docs/03-agents/README.md
 * (notes de portée) et docs/06-plan-de-developpement.md (Phase 2, critères).
 */

const PROTECTED_BRANCHES = new Set(['main', 'master']);

/** Filesystem borné au workspace du site : `data/sites/<site_id>/`. */
const filesystemPathGuard: ScopeGuard = ({ args, ctx, agent }: ScopeGuardInput) => {
  const path = typeof args['path'] === 'string' ? (args['path'] as string) : null;
  if (!path) return; // méthode sans chemin
  if (!ctx.siteId) {
    throw new PermissionDeniedError(
      'Accès filesystem refusé : aucun site en contexte pour délimiter le workspace.',
      { agent },
    );
  }
  const root = posix.normalize(`data/sites/${ctx.siteId}`);
  const resolved = posix.normalize(posix.join(root, path.startsWith(root) ? path.slice(root.length) : path));
  if (resolved !== root && !resolved.startsWith(`${root}/`)) {
    throw new PermissionDeniedError(
      `Accès filesystem hors du workspace du site (${root}).`,
      { agent, path, root },
    );
  }
};

/** GitHub : jamais de push/commit direct sur une branche protégée (main/master). */
const githubBranchGuard: ScopeGuard = ({ args, agent }: ScopeGuardInput) => {
  const ref = (args['branch'] ?? args['ref']) as string | undefined;
  if (ref && PROTECTED_BRANCHES.has(ref)) {
    throw new McpAllowlistViolationError(
      `Écriture directe interdite sur la branche protégée « ${ref} » (branch+PR only).`,
      { agent, ref },
    );
  }
};

/** Registre des gardes de portée, adressables par nom depuis les specs de méthode. */
export const SCOPE_GUARDS: Readonly<Record<string, ScopeGuard>> = {
  'filesystem-path': filesystemPathGuard,
  'github-branch': githubBranchGuard,
};

/** Applique les gardes nommées ; chaque garde lève en cas de violation. */
export function runScopeGuards(names: string[] | undefined, input: ScopeGuardInput): void {
  if (!names) return;
  for (const name of names) {
    const guard = SCOPE_GUARDS[name];
    if (guard) guard(input);
  }
}
