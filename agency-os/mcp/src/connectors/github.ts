import { defineStubConnector } from './stub-connector.js';
import type { McpConnector } from '../ports.js';

/**
 * Connecteur GitHub (stub en phase 2 ; SDK réel ultérieurement). Les specs de
 * méthode encodent les invariants clés :
 *  - `commit` / `push` : capacité `stage` + garde `github-branch` (jamais `main`) ;
 *  - `merge` : capacité `produce` (L3, exige une validation CEO).
 * Ainsi le Developer travaille en « branch + PR only » et ne fusionne jamais sans validation.
 */
export function createGithubConnector(): McpConnector {
  return defineStubConnector('github', {
    listBranches: { capability: 'read' },
    getFile: { capability: 'read' },
    createBranch: { capability: 'stage' },
    commit: { capability: 'stage', scopeGuards: ['github-branch'] },
    push: { capability: 'stage', scopeGuards: ['github-branch'] },
    openPullRequest: { capability: 'stage' },
    merge: { capability: 'produce' },
  });
}
