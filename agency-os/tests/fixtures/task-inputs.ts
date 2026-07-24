import type { TaskCreateInput } from '@agency-os/shared';

/** Fabrique une entrée de tâche de test (agent factice `technical-seo`). */
export function taskInput(over: Partial<TaskCreateInput> = {}): TaskCreateInput {
  return {
    title: 'Tâche E2E',
    description: 'Scénario de test de bout en bout.',
    priority: 'P1',
    site_id: 'site_acme-shop',
    client_id: 'cli_acme',
    agent: 'technical-seo',
    created_by: 'ceo',
    permission_level_required: 'L1',
    workflow_run_id: null,
    depends_on: [],
    deadline: null,
    ...over,
  };
}
