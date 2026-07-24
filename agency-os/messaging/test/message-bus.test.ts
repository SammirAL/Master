import { describe, it, expect } from 'vitest';
import type { AgentMessage } from '@agency-os/shared';
import { InProcessMessageBus } from '../src/message-bus.js';
import { InMemoryMessageStore } from '../src/in-memory-message-store.js';

describe('bus de messages', () => {
  it('persiste, journalise et dispatche un message au destinataire', async () => {
    const store = new InMemoryMessageStore();
    const audited: string[] = [];
    const bus = new InProcessMessageBus(store, {
      audit: { record: async (e) => void audited.push(e.kind) },
    });

    const received: AgentMessage[] = [];
    bus.subscribe('seo-strategist', async (m) => void received.push(m));

    const msg = await bus.publish({
      from: 'ceo',
      to: 'seo-strategist',
      type: 'task_assignment',
      task_id: 'TSK-20260724-a8f3k2',
    });

    expect(msg.id).toMatch(/^MSG-\d{8}-[a-z0-9]{6}$/);
    expect(received).toHaveLength(1);
    expect(received[0]?.to).toBe('seo-strategist');
    expect(await store.list({ to: 'seo-strategist' })).toHaveLength(1);
    expect(audited).toContain('message');
  });

  it('accepte un émetteur council:<slug>', async () => {
    const bus = new InProcessMessageBus(new InMemoryMessageStore());
    const msg = await bus.publish({
      from: 'council:quality-council',
      to: 'ceo',
      type: 'report_submission',
      task_id: 'TSK-20260724-a8f3k2',
      refs: ['RPT-20260724-b2c9d1'],
    });
    expect(msg.from).toBe('council:quality-council');
  });

  it('n\'échoue pas s\'il n\'y a aucun abonné', async () => {
    const bus = new InProcessMessageBus(new InMemoryMessageStore());
    await expect(
      bus.publish({ from: 'ceo', to: 'developer', type: 'alert' }),
    ).resolves.toBeDefined();
  });

  it('coupe une boucle de messages au-delà de maxHops', async () => {
    const bus = new InProcessMessageBus(new InMemoryMessageStore(), { maxHops: 5 });
    // Handler qui republie vers lui-même : boucle infinie sans garde.
    bus.subscribe('a', async () => {
      await bus.publish({ from: 'ceo', to: 'a', type: 'info_request' });
    });
    await expect(
      bus.publish({ from: 'ceo', to: 'a', type: 'info_request' }),
    ).rejects.toThrow(/Boucle de messages/);
  });
});
