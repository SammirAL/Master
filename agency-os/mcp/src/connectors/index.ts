import type { McpConnector } from '../ports.js';
import { FirecrawlConnector } from './firecrawl.js';
import { FilesystemConnector } from './filesystem.js';
import { createGithubConnector } from './github.js';
import { defineStubConnector } from './stub-connector.js';

export { FirecrawlConnector } from './firecrawl.js';
export { FilesystemConnector } from './filesystem.js';
export { createGithubConnector } from './github.js';
export { defineStubConnector } from './stub-connector.js';

/**
 * Ensemble des premiers connecteurs (phase 2). Firecrawl et Filesystem sont
 * RÉELS ; les autres sont des stubs typés dont les specs de méthode encodent
 * les capacités correctes — l'enforcement de la passerelle est donc complet.
 * Chaque stub sera remplacé par son implémentation réelle au fil des phases.
 */
export function createDefaultConnectors(opts: { baseDir?: string } = {}): McpConnector[] {
  return [
    new FirecrawlConnector(),
    new FilesystemConnector(opts.baseDir),
    createGithubConnector(),

    defineStubConnector('playwright', {
      navigate: { capability: 'read' },
      screenshot: { capability: 'read' },
      runTests: { capability: 'read' },
    }),
    defineStubConnector('gsc', {
      query: { capability: 'read' },
      listSites: { capability: 'read' },
    }),
    defineStubConnector('ga4', {
      runReport: { capability: 'read' },
    }),
    defineStubConnector('qdrant', {
      search: { capability: 'read' },
      upsert: { capability: 'writeDirect' },
      delete: { capability: 'writeDirect' },
    }),
    defineStubConnector('wordpress', {
      getPost: { capability: 'read' },
      createDraft: { capability: 'stage' },
      updateDraft: { capability: 'stage' },
      publish: { capability: 'produce' },
    }),
    defineStubConnector('shopify', {
      getProduct: { capability: 'read' },
      createDraft: { capability: 'stage' },
      publish: { capability: 'produce' },
      updatePrice: { capability: 'produce' },
    }),
    defineStubConnector('brave-search', {
      search: { capability: 'read' },
    }),
    defineStubConnector('exa', {
      search: { capability: 'read' },
    }),
    defineStubConnector('postgresql', {
      query: { capability: 'read' },
      migrate: { capability: 'stage' },
      execute: { capability: 'writeDirect' },
    }),
    defineStubConnector('mysql', {
      query: { capability: 'read' },
      migrate: { capability: 'stage' },
    }),
    defineStubConnector('docker', {
      build: { capability: 'stage' },
      run: { capability: 'stage' },
    }),
    defineStubConnector('terminal', {
      exec: { capability: 'stage' },
    }),
  ];
}
