/**
 * Point d'import unique pour les schémas d'identifiants et de références,
 * afin que les schémas métier n'aient qu'une source à importer.
 */
export {
  taskId,
  reportId,
  decisionId,
  messageId,
  workflowRunId,
  memoryId,
  siteId,
  clientId,
  competitorId,
  agentSlug,
} from '../utils/ids.js';

export {
  humanRef,
  councilRef,
  workflowRef,
  createdBy,
  decidedBy,
  messageSender,
  messageRecipient,
} from './common.js';
