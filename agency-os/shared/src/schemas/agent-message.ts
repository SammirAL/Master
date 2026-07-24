import { z } from 'zod';
import { messageId, taskId, messageSender, messageRecipient } from './refs.js';
import { isoDateTime } from '../utils/dates.js';
import { messageType } from './enums.js';

/**
 * AgentMessage — message inter-agents. cf. docs/07-schemas.md §4.
 * Toute communication passe par le bus de messages ; jamais d'appel direct
 * agent→agent. Tout message est journalisé.
 */

export const agentMessage = z.object({
  id: messageId,
  from: messageSender,
  to: messageRecipient,
  type: messageType,
  task_id: taskId.nullable(),
  payload: z.record(z.string(), z.unknown()).default({}),
  refs: z.array(z.string()).default([]),
  at: isoDateTime,
});

export type AgentMessage = z.infer<typeof agentMessage>;
