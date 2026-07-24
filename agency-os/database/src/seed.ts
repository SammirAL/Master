import { client as clientSchema, site as siteSchema, nowIso } from '@agency-os/shared';
import { createDb } from './client.js';
import { clients, sites } from '../schema/index.js';

/**
 * Charge les données de démarrage : un client fixture et un site pilote.
 * Les objets sont validés par Zod (source de vérité) AVANT insertion.
 * Lancer : `pnpm --filter @agency-os/database seed`.
 */
async function main(): Promise<void> {
  const now = nowIso();

  const acme = clientSchema.parse({
    id: 'cli_acme',
    name: 'Acme SARL',
    contacts: [{ name: 'Jean Dupont', email: 'jean@acme.example', role: 'CMO' }],
    sites: ['site_acme-shop'],
    business_goals: ['développer la vente en ligne en France'],
    editorial_preferences: { tone: 'sobre', forbidden_topics: [], languages: ['fr'] },
    validation_policy: 'standard',
    budget: { llm_monthly_usd: 300, ads_monthly_usd: 0 },
    status: 'active',
    created_at: now,
  });

  const acmeShop = siteSchema.parse({
    id: 'site_acme-shop',
    client_id: 'cli_acme',
    name: 'Acme Shop',
    url: 'https://acme-shop.example',
    platform: 'shopify',
    environments: { production: { url: 'https://acme-shop.example' } },
    repo: { provider: 'github', owner: 'acme', name: 'shop', default_branch: 'main' },
    credentials_ref: 'vault://sites/site_acme-shop',
    objectives: [{ goal: '+30 % trafic organique', horizon: '2026-Q4', kpi: 'organic_sessions' }],
    kpis: [{ name: 'organic_sessions', current: 12000, target: 15600, unit: 'sessions/mois' }],
    competitors: [],
    constraints: ['pas de déploiement le vendredi'],
    status: 'active',
    created_at: now,
  });

  const { db, close } = createDb();
  try {
    await db
      .insert(clients)
      .values({
        id: acme.id,
        name: acme.name,
        contacts: acme.contacts,
        sites: acme.sites,
        businessGoals: acme.business_goals,
        editorialPreferences: acme.editorial_preferences,
        validationPolicy: acme.validation_policy,
        budget: acme.budget,
        status: acme.status,
        createdAt: new Date(acme.created_at),
      })
      .onConflictDoNothing();

    await db
      .insert(sites)
      .values({
        id: acmeShop.id,
        clientId: acmeShop.client_id,
        name: acmeShop.name,
        url: acmeShop.url,
        platform: acmeShop.platform,
        environments: acmeShop.environments,
        repo: acmeShop.repo,
        credentialsRef: acmeShop.credentials_ref,
        objectives: acmeShop.objectives,
        kpis: acmeShop.kpis,
        competitors: acmeShop.competitors,
        constraints: acmeShop.constraints,
        status: acmeShop.status,
        createdAt: new Date(acmeShop.created_at),
      })
      .onConflictDoNothing();

    console.log('✓ Seeds chargées : cli_acme, site_acme-shop.');
  } finally {
    await close();
  }
}

main().catch((err: unknown) => {
  console.error('✗ Échec du chargement des seeds :', err);
  process.exitCode = 1;
});
