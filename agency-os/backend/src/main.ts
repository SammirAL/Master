import { loadConfig } from './config.js';
import { createWiring, type Wiring } from './container.js';

/**
 * Orchestrateur : câble le système et démarre le worker intégré. En phase 1,
 * l'orchestrateur et le worker tournent dans le même processus (mode mémoire) ;
 * ils se séparent en réplicas distincts aux phases d'échelle (7-8).
 */
export function bootstrap(): Wiring {
  const config = loadConfig();
  const wiring = createWiring(config);
  wiring.startWorker();
  return wiring;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const wiring = bootstrap();
  console.log('[orchestrateur] démarré. Le CEO peut distribuer des tâches.');
  const shutdown = async (): Promise<void> => {
    await wiring.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}
