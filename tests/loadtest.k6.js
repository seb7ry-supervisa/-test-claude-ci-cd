import http from 'k6/http'
import { check, sleep } from 'k6'

// k6 no puede leer un directorio dinámicamente (a diferencia de validate-schemas.mjs) —
// hay que importar cada manifiesto de cliente a mano acá. Al agregar un cliente nuevo
// en tests/endpoints/, sumá su import y su spread en `endpoints` abajo.
import transkal from './endpoints/transkal.mjs'

const endpoints = [...transkal]

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate==0']
  }
}

export default function () {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  const url = BASE_URL + endpoint.path
  const params = { headers: { 'Content-Type': 'application/json' } }

  const res = endpoint.body !== null && endpoint.body !== undefined
    ? http.post(url, JSON.stringify(endpoint.body), params)
    : http.post(url, null, params)

  check(res, {
    'status es 200': (r) => r.status === 200
  })

  sleep(0.2)
}
