import { fileURLToPath } from 'node:url'
import { loadRecords } from '../src/load.ts'
import { checkRecords } from '../src/check.ts'

const { records, files } = loadRecords(fileURLToPath(new URL('../', import.meta.url)))
const failures = checkRecords(records, files)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else console.log(`knowledge check: ${records.length} records, 0 failures`)
