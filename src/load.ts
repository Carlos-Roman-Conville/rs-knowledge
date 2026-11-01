import { directories, join, jsonFiles, readFileSync } from '../scripts/files.ts'
import { isObject } from './schema.ts'

export type RecordFile = { path: string; error?: string }
export type LoadedRecords = { records: unknown[]; files: RecordFile[] }

/** Parallel arrays retain file provenance, including a null slot for malformed JSON. */
export function loadRecords(repoRoot: string): LoadedRecords {
  const roots = [join(repoRoot, 'data'), ...directories(join(repoRoot, 'fixtures'))]
  const entries = roots.flatMap(root => ['propositions', 'techniques'].flatMap(kind =>
    jsonFiles(join(root, kind)))).map(path => {
    const text = readFileSync(path, 'utf8')
    try { return { record: JSON.parse(text) as unknown, file: { path } as RecordFile } }
    catch { return { record: null, file: { path, error: 'bad JSON' } as RecordFile } }
  })
  const id = (record: unknown) => isObject(record) && typeof record.id === 'string' ? record.id : ''
  entries.sort((a, b) => {
    const left = id(a.record), right = id(b.record)
    return left < right ? -1 : left > right ? 1 : a.file.path < b.file.path ? -1 : a.file.path > b.file.path ? 1 : 0
  })
  return { records: entries.map(entry => entry.record), files: entries.map(entry => entry.file) }
}
