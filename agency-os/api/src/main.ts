import { bootstrap, loadConfig } from '@agency-os/backend';
import { createApiServer } from './server.js';

/** Démarre l'orchestrateur (worker intégré) puis l'API HTTP. */
function main(): void {
  const config = loadConfig();
  const wiring = bootstrap();
  const server = createApiServer(wiring);
  server.listen(config.port, () => {
    console.log(`[api] à l'écoute sur http://localhost:${config.port} (mode=${config.mode})`);
  });

  const shutdown = (): void => {
    server.close(() => {
      void wiring.close().then(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
