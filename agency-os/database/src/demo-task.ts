import { eq } from 'drizzle-orm';
import { task as taskSchema, makeId, nowIso } from '@agency-os/shared';
import { createDb } from './client.js';
import { tasks } from '../schema/index.js';

/**
 * Démonstration Phase 0 : crée une `Task` validée par Zod, la persiste, la
 * relit et re-valide — types stricts de bout en bout.
 * Prérequis : migrations appliquées + seeds chargées (site_acme-shop).
 * Lancer : `pnpm demo:task` (à la racine) ou `pnpm --filter @agency-os/database demo:task`.
 */
async function main(): Promise<void> {
  const now = nowIso();

  // 1. Construire une tâche et la valider par le contrat unique.
  const created = taskSchema.parse({
    id: makeId('task'),
    title: 'Audit technique SEO — corriger les données structurées',
    description: 'Corriger les erreurs Schema.org sur les pages produit.',
    priority: 'P1',
    site_id: 'site_acme-shop',
    client_id: 'cli_acme',
    agent: 'technical-seo',
    created_by: 'ceo',
    workflow_run_id: null,
    depends_on: [],
    deadline: null,
    status: 'draft',
    permission_level_required: 'L2',
    validation: null,
    logs: [],
    result: null,
    history: [{ at: now, from: null, to: 'draft', by: 'ceo', reason: 'création (démo)' }],
    cost: { llm_tokens: 0, mcp_calls: 0, usd_estimate: 0 },
    created_at: now,
    updated_at: now,
  });

  const { db, close } = createDb();
  try {
    // 2. Persister.
    await db.insert(tasks).values({
      id: created.id,
      title: created.title,
      description: created.description,
      priority: created.priority,
      siteId: created.site_id,
      clientId: created.client_id,
      agent: created.agent,
      createdBy: created.created_by,
      workflowRunId: created.workflow_run_id,
      dependsOn: created.depends_on,
      deadline: created.deadline ? new Date(created.deadline) : null,
      status: created.status,
      permissionLevelRequired: created.permission_level_required,
      validation: created.validation,
      logs: created.logs,
      result: created.result,
      history: created.history,
      cost: created.cost,
      createdAt: new Date(created.created_at),
      updatedAt: new Date(created.updated_at),
    });

    // 3. Relire et re-valider par le même contrat.
    const rows = await db.select().from(tasks).where(eq(tasks.id, created.id));
    const row = rows[0];
    if (!row) throw new Error('Tâche introuvable après insertion.');

    const roundTripped = taskSchema.parse({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      site_id: row.siteId,
      client_id: row.clientId,
      agent: row.agent,
      created_by: row.createdBy,
      workflow_run_id: row.workflowRunId,
      depends_on: row.dependsOn,
      deadline: row.deadline ? row.deadline.toISOString() : null,
      status: row.status,
      permission_level_required: row.permissionLevelRequired,
      validation: row.validation,
      logs: row.logs,
      result: row.result,
      history: row.history,
      cost: row.cost,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    });

    console.log('✓ Task créée, persistée et relue avec succès :');
    console.log(`  id      : ${roundTripped.id}`);
    console.log(`  agent   : ${roundTripped.agent}`);
    console.log(`  statut  : ${roundTripped.status}`);
    console.log(`  site    : ${roundTripped.site_id}`);
  } finally {
    await close();
  }
}

main().catch((err: unknown) => {
  console.error('✗ Échec de la démonstration :', err);
  process.exitCode = 1;
});
