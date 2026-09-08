import { readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'
import Ajv from 'ajv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const endpointsDir = path.join(__dirname, 'endpoints')
const baseUrl = process.env.BASE_URL || 'http://localhost:4000'

const ajv = new Ajv({ allErrors: true })

const manifestFiles = readdirSync(endpointsDir).filter((f) => f.endsWith('.mjs'))

let total = 0
let failed = 0

for (const file of manifestFiles) {
  const { default: endpoints } = await import(pathToFileURL(path.join(endpointsDir, file)).href)
  const client = file.replace(/\.mjs$/, '')

  for (const endpoint of endpoints) {
    total++
    const url = baseUrl + endpoint.path
    const init = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    }
    if (endpoint.body !== null && endpoint.body !== undefined) {
      init.body = JSON.stringify(endpoint.body)
    }

    try {
      const res = await fetch(url, init)
      const json = await res.json()
      const validate = ajv.compile(endpoint.schema)
      const valid = validate(json)

      if (valid) {
        console.log(`OK   [${client}] ${endpoint.name}`)
      } else {
        failed++
        console.error(`FAIL [${client}] ${endpoint.name}`)
        console.error('     ' + ajv.errorsText(validate.errors, { separator: '\n     ' }))
      }
    } catch (err) {
      failed++
      console.error(`FAIL [${client}] ${endpoint.name} — error de red/parseo: ${err.message}`)
    }
  }
}

console.log(`\n${total - failed}/${total} endpoints cumplen su schema.`)

if (failed > 0) {
  process.exit(1)
}
