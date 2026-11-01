// Node filesystem boundary shared by the loader and CLI; no mechanism lives here.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export { join, readFileSync }

export function directories(path: string): string[] {
  try {
    return readdirSync(path, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => join(path, entry.name)).sort()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

export function jsonFiles(path: string): string[] {
  let entries
  try { entries = readdirSync(path, { withFileTypes: true }) }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  return entries.flatMap(entry => entry.isDirectory() ? jsonFiles(join(path, entry.name)) :
    entry.isFile() && entry.name.endsWith('.json') ? [join(path, entry.name)] : []).sort()
}
