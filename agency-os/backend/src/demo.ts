import type { TaskCreateInput } from '@agency-os/shared';
import { createMemoryWiring } from './container.js';

/**
 * Démonstration Phase 1 (mode mémoire, sans infrastructure) :
 *  1. le CEO distribue une tâche standard → l'agent l'exécute jusqu'à `done` ;
 *  2. le CEO distribue une action L3 → la tâche s'arrête en `awaiting_validation`,
 *     puis le CEO l'approuve (Decision) → `done`.
 * Lancer : `pnpm --filter @agency-os/backend demo`.
 */
async function main(): Promise<void> {
  const w = createMemoryWiring();
  w.startWorker();

  const base: TaskCreateInput = {
    title: 'Audit technique SEO',
    description: 'Corriger les données structurées des pages produit.',
    priority: 'P1',
    site_id: 'site_acme-shop',
    client_id: 'cli_acme',
    agent: 'technical-seo',
    created_by: 'ceo',
    permission_level_required: 'L1',
    workflow_run_id: null,
    depends_on: [],
    deadline: null,
  };

  console.log('\n=== 1. Tâche standard (L1) ===');
  const { task } = await w.dispatcher.dispatch(base);
  const done = await w.tasks.getById(task.id);
  console.log(`Tâche ${task.id} → statut final : ${done?.status}`);
  console.log('Cycle de vie :', done?.history.map((h) => h.to).join(' → '));

  console.log('\n=== 2. Action de production (L3) avec gate de validation ===');
  const { task: l3 } = await w.dispatcher.dispatch({ ...base, permission_level_required: 'L3' });
  const awaiting = await w.tasks.getById(l3.id);
  console.log(`Tâche ${l3.id} → statut après exécution : ${awaiting?.status} (attendu: awaiting_validation)`);

  const { decision, task: approved } = await w.validation.approve(l3.id, {
    rationale: 'Impact fort, risque faible, hors heures de pointe.',
  });
  console.log(`Décision CEO ${decision.id} : ${decision.decision}`);
  console.log(`Tâche ${l3.id} → statut final : ${approved.status}`);
  console.log('Cycle de vie :', approved.history.map((h) => h.to).join(' → '));
  console.log(`Traçabilité : validation.decision_id = ${approved.validation?.decision_id}`);

  await w.close();
}

main().catch((err: unknown) => {
  console.error('✗ Démonstration échouée :', err);
  process.exitCode = 1;
});
