/**
 * Modèle de capacités de la passerelle MCP.
 *
 * La matrice de docs/03-agents/README.md attribue à chaque couple agent×serveur
 * un code de portée (`RO`, `S`, `P`, `RW`, `PIPE`, ou combinaisons `S+P`, `RO+P`).
 * Chaque code se traduit en un ensemble de capacités ; chaque méthode d'un
 * connecteur exige une capacité. La passerelle autorise l'appel si la capacité
 * requise appartient à l'ensemble accordé.
 */

export type Capability = 'read' | 'stage' | 'produce' | 'writeDirect' | 'pipe';

/** Correspondance L0–L3 ↔ capacité (docs/01-architecture.md §9.3). */
export const CAPABILITY_LEVEL: Record<Capability, 'L0' | 'L2' | 'L3'> = {
  read: 'L0',
  stage: 'L2',
  produce: 'L3',
  writeDirect: 'L2', // écriture directe (Memory Manager, workspace Developer)
  pipe: 'L2',
};

/** Traduit un jeton de code de portée en capacités. */
function tokenToCapabilities(token: string): Capability[] {
  switch (token) {
    case 'RO':
      return ['read'];
    case 'S':
      return ['read', 'stage'];
    case 'P':
      return ['produce'];
    case 'RW':
      return ['read', 'stage', 'writeDirect'];
    case 'PIPE':
      return ['pipe'];
    default:
      throw new Error(`Jeton de portée MCP inconnu : "${token}"`);
  }
}

/**
 * Parse un code de cellule (ex. `"S+P"`, `"RO"`, `"RW"`) en ensemble de
 * capacités. Les exposants/annotations (⁹, ¹…) doivent être retirés en amont.
 */
export function parseCell(code: string): Set<Capability> {
  const caps = new Set<Capability>();
  for (const token of code.split('+').map((t) => t.trim())) {
    for (const cap of tokenToCapabilities(token)) caps.add(cap);
  }
  return caps;
}

/** Normalise un libellé de cellule issu de la doc (retire exposants et espaces). */
export function normalizeCellCode(raw: string): string {
  // Retire les exposants Unicode (⁰¹²³⁴⁵⁶⁷⁸⁹) et espaces superflus.
  return raw.replace(/[⁰-⁹¹²³]/g, '').trim();
}
