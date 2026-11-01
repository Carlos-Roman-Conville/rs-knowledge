// @rex/knowledge: the public surface grows unit by unit (DESIGN §2).
import { qualify } from '@rex/kernel'

/** The engine prefix every knowledge id carries. */
export const ENGINE = 'knowledge'

/** Qualify a local id `<kind>.<slug>` (kind `technique` or `proposition`) as `knowledge/<kind>.<slug>`. */
export function knowledgeId(local: string): string {
  return qualify(ENGINE, local)
}
