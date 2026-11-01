import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { expect, it } from 'vitest'

function sources(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sources(join(root, entry.name)) :
    entry.name.endsWith('.ts') ? [join(root, entry.name)] : []).sort()
}
function fenceFailures(root: string): string[] {
  const failures: string[] = []
  for (const path of sources(root)) {
    const text = readFileSync(path, 'utf8')
    for (const forbidden of ['Math.random', 'Date.now', 'new Date', 'getFullYear', 'history.']) {
      if (text.includes(forbidden)) failures.push(`${path}: ${forbidden}`)
    }
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
    const check = (node: ts.Node) => {
      let specifier: ts.Node | undefined
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier
      if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) specifier = node.moduleReference.expression
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) specifier = node.argument.literal
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        specifier = node.arguments[0]
        if (!specifier) failures.push(`${path}: missing import specifier`)
      }
      if (specifier && (!ts.isStringLiteralLike(specifier) ||
        !(specifier.text === '@rex/kernel' || specifier.text.startsWith('./') || specifier.text.startsWith('../')))) failures.push(`${path}: forbidden import ${specifier.getText(source)}`)
      if (specifier && ts.isStringLiteralLike(specifier) &&
        (specifier.text.startsWith('./') || specifier.text.startsWith('../'))) {
        const target = relative(root, resolve(dirname(path), specifier.text))
        if (target === '..' || target.startsWith(`..${sep}`) || isAbsolute(target)) {
          failures.push(`${path}: import outside src ${specifier.getText(source)}`)
        }
      }
      ts.forEachChild(node, check)
    }
    check(source)
  }
  return failures
}

it('DESIGN §0 invariant 2 and rules 3, 6, 7: import and deterministic source fence', () => {
  expect(fenceFailures(fileURLToPath(new URL('../src', import.meta.url)))).toEqual([])
})

it('rule 6: rejects relative imports escaping src in a temporary fixture', () => {
  const fixture = mkdtempSync(fileURLToPath(new URL('../.fence-fixture-', import.meta.url)))
  try {
    const root = join(fixture, 'src')
    mkdirSync(join(root, 'nested'), { recursive: true })
    const path = join(root, 'nested', 'example.ts')
    writeFileSync(path, [
      "import '../local.ts'",
      "import '../../scripts/files.ts'",
      "export { value } from '../../src-other/value.ts'",
      "type Outside = import('../../scripts/types.ts').Outside",
      "import('../../scripts/dynamic.ts')",
      "require('../../scripts/required.ts')",
    ].join('\n'))
    expect(fenceFailures(root)).toEqual([
      "'../../scripts/files.ts'",
      "'../../src-other/value.ts'",
      "'../../scripts/types.ts'",
      "'../../scripts/dynamic.ts'",
      "'../../scripts/required.ts'",
    ].map(specifier => `${path}: import outside src ${specifier}`))
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
