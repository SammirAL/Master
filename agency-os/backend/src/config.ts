/**
 * Chargement et validation de la configuration d'exécution (variables d'env).
 * cf. .env.example.
 */
export type WiringMode = 'memory' | 'postgres';

export interface BackendConfig {
  mode: WiringMode;
  databaseUrl: string | undefined;
  redisUrl: string | undefined;
  port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const mode = (env['WIRING_MODE'] as WiringMode | undefined) ?? 'memory';
  if (mode !== 'memory' && mode !== 'postgres') {
    throw new Error(`WIRING_MODE invalide : ${mode} (attendu memory|postgres)`);
  }
  return {
    mode,
    databaseUrl: env['DATABASE_URL'],
    redisUrl: env['REDIS_URL'],
    port: Number(env['PORT'] ?? 3001),
  };
}
