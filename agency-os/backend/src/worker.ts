import { loadConfig } from './config.js';
import { createWiring } from './container.js';

/**
 * Point d'entrée d'un worker : consomme les files d'exécution et lance le
 * runtime des agents. Scalable en réplicas (les workers sont stateless).
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const wiring = createWiring(config);
  wiring.startWorker();
  console.log(`[worker] démarré (mode=${config.mode}). En attente de tâches…`);

  const shutdown = async (): Promise<void> => {
    console.log('[worker] arrêt…');
    await wiring.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((err: unknown) => {
  console.error('[worker] erreur fatale :', err);
  process.exitCode = 1;
});
