# Estándar para simuladores de clientes

Este documento define cómo debe construirse cualquier simulador dentro de este repositorio. Aplica para el cliente que ya existe (Transkal) y para cada cliente nuevo que se agregue. El objetivo es que, sin importar quién lo escriba, todos los simuladores se vean y se comporten igual.

## 1. Ubicación y nombre

- Un cliente = una carpeta en `src/clients/<nombreCliente>/`.
- `<nombreCliente>` en camelCase, sin espacios ni acentos, igual al que se usa como path base (`/transkal`, `/clienteB`, etc.).
- Si un cliente tiene muchos endpoints, se puede partir en varios archivos dentro de su propia carpeta (ej. `src/clients/transkal/controlAccesos.js`, `src/clients/transkal/solicitudCitas.js`), pero cada carpeta sigue exportando un único router combinado desde un `routes.js`.
- Un cliente nunca modifica archivos de otro cliente. El único archivo compartido que se toca es `src/app.js`, y solo para agregar la línea de registro.

## 2. Contrato de cada `routes.js`

```js
const router = require('express').Router()

router.post('/algun/endpoint', (req, res) => {
    // lógica del endpoint
})

module.exports = router
```

- Debe exportar siempre un `express.Router()`.
- Las rutas dentro del archivo son relativas — **no repitas el nombre del cliente en el path**, ese prefijo ya lo agrega `src/app.js` al montar el router.
- Un endpoint = una función de ruta. No mezclar la lógica de dos endpoints en un mismo handler.

## 3. Formato de respuesta

Todo simulador responde con el mismo sobre (envelope), tomando como base el patrón ya usado en Transkal:

**Éxito:**
```json
{
  "resultado": "OK",
  "...": "resto de campos específicos del endpoint"
}
```

**Error:**
```json
{
  "resultado": "ERROR",
  "errores": [
    {
      "locale": "es_ES",
      "codigo": "10",
      "mensaje": "Descripción legible del error"
    }
  ]
}
```

- `resultado` es siempre `"OK"` o `"ERROR"`, nunca otro valor.
- Los errores simulados responden **HTTP 200** con `resultado: "ERROR"` en el body (así es como responden los terceros reales que estamos simulando) — no usar códigos HTTP 4xx/5xx salvo que el tercero real lo haga así.
- Si necesitas simular distintos escenarios de un mismo endpoint (éxito, sin resultados, error), resuélvelo con lógica condicional dentro del mismo handler en base a datos de entrada reconocibles (como ya hace Transkal con placas/documentos fijos), no crees rutas separadas tipo `/endpoint/error` salvo que el tercero real también separe la ruta de error.

## 4. Logging

Cada endpoint debe loguear, igual que Transkal, para poder depurar qué está llegando:

```js
console.log("[<nombreCliente>/<endpoint>]")
console.log("Body:", req.body)
console.log("Headers:", req.headers)
```

## 5. Datos de prueba fijos (fixtures)

Los valores que disparan cada escenario (placas, documentos, IDs) van como constantes explícitas dentro del propio `routes.js`, comentando qué escenario dispara cada uno — igual que el bloque de comentarios que ya tiene `XXXSolicitudCitas` en Transkal. No hardcodear un valor de prueba sin dejar el comentario de qué representa.

## 6. Registro en `src/app.js`

Después de crear el `routes.js`, se agrega **una sola línea**:

```js
app.use('/<nombreCliente>', require('./clients/<nombreCliente>/routes'))
```

## 7. Pruebas: carga y estructura de respuesta

Cada cliente tiene un manifiesto en `tests/endpoints/<nombreCliente>.mjs` — un array con un objeto por escenario de endpoint (`name`, `method`, `path`, `body`, `schema`). Este único archivo alimenta dos pruebas distintas que corren en cada PR:

- **`npm run test:schema`** (`tests/validate-schemas.mjs`): valida con Ajv que la respuesta real cumpla el `schema` (JSON Schema) de cada escenario. Descubre los manifiestos solo con que existan en `tests/endpoints/`, no hay que registrar nada más.
- **`k6 run tests/loadtest.k6.js`**: prueba de carga liviana (20 VUs, 30s) contra los mismos endpoints. A diferencia del validador, k6 **no puede leer un directorio dinámicamente** — hay que importar el manifiesto nuevo a mano en `tests/loadtest.k6.js` (una línea de `import` + sumarlo al array `endpoints`).

Al agregar un cliente nuevo:
1. Crear `tests/endpoints/<nombreCliente>.mjs` con un objeto por escenario relevante (al menos el happy path y un caso de error).
2. Agregar el `import` de ese archivo en `tests/loadtest.k6.js`.

**Esto no es opcional ni depende de que alguien se acuerde de hacerlo**: `npm run test:documented` (`tests/check-documented-routes.mjs`) recorre `src/app.js` y cada `routes.js`, y falla si un endpoint no tiene entrada en `tests/endpoints/<cliente>.mjs`. Corre automáticamente en cada PR (ver `bitbucket-pipelines.yml`) — un endpoint sin esa entrada bloquea el PR, no hace falta que un revisor lo note a mano.

## 8. Checklist antes de abrir el PR

- [ ] El cliente vive en su propia carpeta bajo `src/clients/`.
- [ ] Cada respuesta usa el sobre `resultado: OK/ERROR` de la sección 3.
- [ ] Cada endpoint loguea path, body y headers.
- [ ] Los datos de prueba fijos están comentados explicando qué escenario disparan.
- [ ] Se probó localmente con `npm run dev` o `docker compose up --build` contra cada escenario simulado.
- [ ] Se agregó la línea de registro en `src/app.js`.
- [ ] Se agregó `tests/endpoints/<nombreCliente>.mjs` y su import en `tests/loadtest.k6.js`.
- [ ] `npm run test:documented`, `npm run test:schema` y `k6 run tests/loadtest.k6.js` pasan en local (el pipeline los vuelve a correr en el PR, pero conviene no descubrir un fallo ahí).
- [ ] El PR va primero a `develop`; a `master` solo después de aprobado.

## 9. Flujo de ramas

`feature/<algo>` → PR a `develop` (pruebas del equipo) → PR a `master` (versión que consume todo el mundo). Ver `README.md` para el detalle de qué dispara el pipeline en cada rama. Las pruebas de carga y de estructura (sección 7) corren en **cada PR**, sin importar la rama destino.
