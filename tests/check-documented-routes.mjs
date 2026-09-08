import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

// Verifica que todo endpoint registrado en src/app.js tenga su contraparte en
// tests/endpoints/<cliente>.mjs — ese manifiesto es lo que este proyecto considera
// "documentado" (ver SPEC.md, sección 7). No corre la app; parsea el código fuente
// según la convención que ya define SPEC.md (un app.use por cliente, un routes.js por cliente).

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

// Quita comentarios de bloque y de línea antes de parsear — si no, un ejemplo
// dentro de un /** ... */ (como el de src/app.js) se confunde con código real.
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

const appJs = stripComments(readFileSync(path.join(root, 'src', 'app.js'), 'utf-8'))
const mountRegex = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*require\(['"]\.\/clients\/([^'"]+)\/routes['"]\)\)/g

const mounts = [...appJs.matchAll(mountRegex)].map((m) => ({ prefix: m[1], clientDir: m[2] }))

if (mounts.length === 0) {
  console.error('No se encontró ningún app.use(...) de cliente en src/app.js — revisá el patrón esperado.')
  process.exit(1)
}

const declaredRoutes = []
const methodRegex = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g

for (const { prefix, clientDir } of mounts) {
  const routesFile = path.join(root, 'src', 'clients', clientDir, 'routes.js')
  const source = stripComments(readFileSync(routesFile, 'utf-8'))
  for (const m of source.matchAll(methodRegex)) {
    const method = m[1].toUpperCase()
    const fullPath = prefix + m[2]
    declaredRoutes.push({ client: clientDir, method, path: fullPath })
  }
}

const endpointsDir = path.join(root, 'tests', 'endpoints')
const manifestFiles = readdirSync(endpointsDir).filter((f) => f.endsWith('.mjs'))

const documented = new Set()
for (const file of manifestFiles) {
  const { default: endpoints } = await import(pathToFileURL(path.join(endpointsDir, file)).href)
  for (const e of endpoints) {
    documented.add(`${e.method.toUpperCase()} ${e.path}`)
  }
}

let missing = 0
for (const route of declaredRoutes) {
  const key = `${route.method} ${route.path}`
  if (documented.has(key)) {
    console.log(`OK      [${route.client}] ${key}`)
  } else {
    missing++
    console.error(`FALTA   [${route.client}] ${key} — no tiene entrada en tests/endpoints/${route.client}.mjs`)
  }
}

console.log(`\n${declaredRoutes.length - missing}/${declaredRoutes.length} endpoints documentados.`)

if (missing > 0) {
  console.error(`\n${missing} endpoint(s) sin documentar. Agregá su entrada en tests/endpoints/<cliente>.mjs antes de abrir el PR (ver SPEC.md).`)
  process.exit(1)
}
