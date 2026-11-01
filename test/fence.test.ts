import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { expect, it } from 'vitest'

function sources(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sources(join(root, entry.name)) :
    entry.name.endsWith('.ts') ? [join(root, entry.name)] : []).sort()
}
it('DESIGN §0 invariant 2 and rules 3, 6, 7: import and deterministic source fence', () => {
  const failures: string[] = []
  for (const path of sources(fileURLToPath(new URL('../src', import.meta.url)))) {
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
      ts.forEachChild(node, check)
    }
    check(source)
  }
  expect(failures).toEqual([])
})
