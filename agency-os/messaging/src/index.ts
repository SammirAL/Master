/**
 * @agency-os/messaging — bus de messages inter-agents. Seul canal de
 * communication (jamais d'appel direct agent→agent).
 */
export * from './ports.js';
export { InProcessMessageBus, type MessageBusOptions } from './message-bus.js';
export { InMemoryMessageStore } from './in-memory-message-store.js';
